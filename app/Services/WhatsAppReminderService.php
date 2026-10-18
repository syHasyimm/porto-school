<?php

namespace App\Services;

use App\Enums\WhatsAppDeliveryStatus;
use App\Jobs\SendWhatsAppDelivery;
use App\Models\AcademicEvent;
use App\Models\SiteSetting;
use App\Models\TeacherContact;
use App\Models\WhatsAppDelivery;
use App\Models\WhatsAppSetting;
use App\Support\WhatsAppNumber;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class WhatsAppReminderService
{
    public function enqueue(): int
    {
        return Cache::lock('whatsapp-reminder-scan', 300)->get(function (): int {
            $settings = WhatsAppSetting::current();
            $today = CarbonImmutable::now($settings->timezone)->toDateString();

            WhatsAppDelivery::query()->where('status', WhatsAppDeliveryStatus::Sending)
                ->where('started_at', '<=', now()->subMinutes(5))->lazyById(100)
                ->each(function (WhatsAppDelivery $delivery): void {
                    $this->finish($delivery->id, WhatsAppDeliveryStatus::NeedsReview, 'Proses pengiriman terhenti. Hasilnya belum pasti; periksa dashboard Fonnte.');
                });

            WhatsAppDelivery::query()->where('status', WhatsAppDeliveryStatus::Pending)
                ->where('reminder_date', '<', $today)
                ->update(['status' => WhatsAppDeliveryStatus::Skipped->value, 'failure_reason' => 'Tanggal pengingat sudah lewat.', 'finished_at' => now()]);

            if (! $settings->reminders_enabled || CarbonImmutable::now($settings->timezone)->format('H:i') < $settings->send_time) {
                return 0;
            }

            $contacts = TeacherContact::query()->where('is_active', true)->where('notifications_enabled', true)
                ->orderBy('id')->get()->filter(fn (TeacherContact $contact): bool => WhatsAppNumber::normalize($contact->phone) !== null)
                ->unique(fn (TeacherContact $contact): ?string => WhatsAppNumber::normalize($contact->phone));

            $lastSlot = WhatsAppDelivery::query()->where('status', WhatsAppDeliveryStatus::Pending)->max('available_at');
            $slot = $lastSlot === null ? CarbonImmutable::now() : CarbonImmutable::parse($lastSlot)->max(CarbonImmutable::now());
            $created = 0;
            $events = AcademicEvent::query()->where('whatsapp_reminder_enabled', true)->where('is_cancelled', false)
                ->whereDate('start_date', '<=', $today)
                ->where(fn (Builder $query) => $query->whereDate('end_date', '>=', $today)
                    ->orWhere(fn (Builder $single) => $single->whereNull('end_date')->whereDate('start_date', $today)))
                ->lazyById(100);

            foreach ($events as $event) {
                foreach ($contacts as $contact) {
                    $phone = WhatsAppNumber::normalize($contact->phone);
                    if (WhatsAppDelivery::query()->where('academic_event_id', $event->id)->whereDate('reminder_date', $today)
                        ->where(fn (Builder $query) => $query->where('phone', $phone)->orWhere('teacher_contact_id', $contact->id))->exists()) {
                        continue;
                    }

                    try {
                        WhatsAppDelivery::query()->create([
                            'academic_event_id' => $event->id,
                            'teacher_contact_id' => $contact->id,
                            'event_title' => $event->title,
                            'recipient_name' => $contact->name,
                            'phone' => $phone,
                            'reminder_date' => $today,
                            'timezone' => $settings->timezone,
                            'status' => WhatsAppDeliveryStatus::Pending,
                            'available_at' => $slot,
                        ]);
                        $slot = $slot->addSeconds(10);
                        $created++;
                    } catch (UniqueConstraintViolationException) {
                        continue;
                    }

                    if ($created >= 100) {
                        break 2;
                    }
                }
            }

            WhatsAppDelivery::query()->where('status', WhatsAppDeliveryStatus::Pending)
                ->whereDate('reminder_date', $today)
                ->where(fn (Builder $query) => $query->whereNull('dispatched_at')
                    ->orWhere(fn (Builder $stale) => $stale->where('available_at', '<=', now()->subMinutes(5))
                        ->where('dispatched_at', '<=', now()->subMinutes(5))))
                ->lazyById(100)->each(fn (WhatsAppDelivery $delivery) => $this->dispatch($delivery));

            return $created;
        }) ?: 0;
    }

    public function dispatch(WhatsAppDelivery $delivery): void
    {
        $claimed = WhatsAppDelivery::query()->whereKey($delivery->id)->where('status', WhatsAppDeliveryStatus::Pending)
            ->where(fn (Builder $query) => $query->whereNull('dispatched_at')
                ->orWhere(fn (Builder $stale) => $stale->where('available_at', '<=', now()->subMinutes(5))
                    ->where('dispatched_at', '<=', now()->subMinutes(5))))
            ->update(['dispatched_at' => now()]);

        if ($claimed === 1) {
            SendWhatsAppDelivery::dispatch($delivery->id)->delay($delivery->available_at)->afterCommit();
        }
    }

    public function skipReason(WhatsAppDelivery $delivery, WhatsAppSetting $settings): ?string
    {
        $date = $delivery->reminder_date->toDateString();
        if ($date !== CarbonImmutable::now($delivery->timezone)->toDateString()
            || $date !== CarbonImmutable::now($settings->timezone)->toDateString()) {
            return 'Tanggal pengingat sudah lewat atau zona waktu berubah.';
        }
        if ($delivery->kind === 'test') {
            return null;
        }
        if (! $settings->reminders_enabled) {
            return 'Pengingat WhatsApp dinonaktifkan.';
        }

        $event = $delivery->academicEvent;
        if ($event === null || $event->is_cancelled || ! $event->whatsapp_reminder_enabled) {
            return 'Agenda dihapus, dibatalkan, atau pengingat agenda dinonaktifkan.';
        }
        if ($event->start_date->toDateString() > $date || ($event->end_date ?? $event->start_date)->toDateString() < $date) {
            return 'Agenda tidak berlangsung pada tanggal pengingat.';
        }

        $contact = $delivery->teacherContact;
        if ($contact === null || ! $contact->is_active || ! $contact->notifications_enabled
            || WhatsAppNumber::normalize($contact->phone) !== $delivery->phone) {
            return 'Kontak dihapus, tidak aktif, notifikasi dinonaktifkan, atau nomor berubah.';
        }

        return null;
    }

    public function claim(int $id): ?WhatsAppDelivery
    {
        return DB::transaction(function () use ($id): ?WhatsAppDelivery {
            $delivery = WhatsAppDelivery::query()->lockForUpdate()->find($id);
            if ($delivery === null || $delivery->status !== WhatsAppDeliveryStatus::Pending) {
                return null;
            }

            $settings = WhatsAppSetting::current();
            $reason = $this->skipReason($delivery, $settings);
            if ($reason !== null) {
                $delivery->update(['status' => WhatsAppDeliveryStatus::Skipped, 'failure_reason' => $reason, 'finished_at' => now()]);

                return null;
            }

            if ($delivery->kind === 'reminder') {
                $event = AcademicEvent::query()->findOrFail($delivery->academic_event_id);
                $contact = TeacherContact::query()->findOrFail($delivery->teacher_contact_id);
                $end = $event->end_date ?? $event->start_date;
                $event->start_date->locale('id');
                $end->locale('id');
                $dates = $event->start_date->translatedFormat('j F Y');
                if ($end->toDateString() !== $event->start_date->toDateString()) {
                    $dates .= ' – '.$end->translatedFormat('j F Y');
                }
                $school = SiteSetting::query()->where('key', 'school_name')->value('value') ?: config('app.name');
                $delivery->event_title = $event->title;
                $delivery->recipient_name = $contact->name;
                $delivery->message = "Yth. Bapak/Ibu {$contact->name},\nHari ini terdapat agenda *{$event->title}*.\nTanggal: {$dates}\nKeterangan: ".($event->description ?: '-')."\n— {$school}";
            }

            $delivery->status = WhatsAppDeliveryStatus::Sending;
            $delivery->attempts++;
            $delivery->started_at = now();
            $delivery->failure_reason = null;
            $delivery->save();

            return $delivery;
        });
    }

    /** @param list<string> $providerIds */
    public function finish(int $id, WhatsAppDeliveryStatus $status, ?string $reason, array $providerIds = [], ?string $requestId = null): void
    {
        DB::transaction(function () use ($id, $status, $reason, $providerIds, $requestId): void {
            $delivery = WhatsAppDelivery::query()->lockForUpdate()->find($id);
            if ($delivery === null || $delivery->status !== WhatsAppDeliveryStatus::Sending) {
                return;
            }

            $delivery->update([
                'status' => $status,
                'failure_reason' => $reason,
                'finished_at' => now(),
                'accepted_at' => $status === WhatsAppDeliveryStatus::Accepted ? now() : null,
                'provider_ids' => $providerIds,
                'provider_request_id' => $requestId,
                'attempt_history' => [...($delivery->attempt_history ?? []), ['status' => $status->value, 'at' => CarbonImmutable::now()->toIso8601String(), 'reason' => $reason]],
            ]);
        });
    }

    public function retry(WhatsAppDelivery $delivery): bool
    {
        if ($delivery->status !== WhatsAppDeliveryStatus::Failed || $this->skipReason($delivery, WhatsAppSetting::current()) !== null) {
            return false;
        }

        $updated = WhatsAppDelivery::query()->whereKey($delivery->id)->where('status', WhatsAppDeliveryStatus::Failed)
            ->update(['status' => WhatsAppDeliveryStatus::Pending->value, 'available_at' => now(), 'dispatched_at' => null, 'finished_at' => null, 'failure_reason' => null]);

        if ($updated === 1) {
            $this->dispatch($delivery->refresh());
        }

        return $updated === 1;
    }
}
