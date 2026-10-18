<?php

namespace App\Http\Controllers\Admin;

use App\Enums\WhatsAppDeliveryStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WhatsAppDelivery;
use App\Models\WhatsAppSetting;
use App\Services\WhatsAppReminderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppDeliveryController extends Controller
{
    public function index(Request $request, WhatsAppReminderService $reminders): Response
    {
        $this->authorizeAdmin($request);
        $search = $request->string('search')->trim()->toString();
        $selectedStatus = WhatsAppDeliveryStatus::tryFrom($request->string('status')->toString());
        $status = $selectedStatus === null ? '' : $selectedStatus->value;
        $settings = WhatsAppSetting::current();
        $deliveries = WhatsAppDelivery::query()->with(['academicEvent', 'teacherContact'])
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($search !== '', fn (Builder $query) => $query->where(fn (Builder $query) => $query->where('event_title', 'like', "%{$search}%")
                ->orWhere('recipient_name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%")))
            ->orderByDesc('id')->paginate(15)->withQueryString()
            ->through(fn (WhatsAppDelivery $delivery): array => [
                'id' => $delivery->id,
                'kind' => $delivery->kind,
                'event_title' => $delivery->event_title,
                'recipient_name' => $delivery->recipient_name,
                'phone' => $delivery->phone,
                'reminder_date' => $delivery->reminder_date->toDateString(),
                'timezone' => $delivery->timezone,
                'status' => $delivery->status->value,
                'status_label' => $delivery->status->label(),
                'attempts' => $delivery->attempts,
                'available_at' => $delivery->available_at->toIso8601String(),
                'started_at' => $delivery->started_at?->toIso8601String(),
                'finished_at' => $delivery->finished_at?->toIso8601String(),
                'accepted_at' => $delivery->accepted_at?->toIso8601String(),
                'failure_reason' => $delivery->failure_reason,
                'message' => $delivery->message,
                'provider_ids' => $delivery->provider_ids ?? [],
                'provider_request_id' => $delivery->provider_request_id,
                'attempt_history' => $delivery->attempt_history ?? [],
                'can_retry' => $delivery->status === WhatsAppDeliveryStatus::Failed && $reminders->skipReason($delivery, $settings) === null,
            ]);

        return Inertia::render('admin/whatsapp/history', [
            'deliveries' => $deliveries,
            'filters' => ['search' => $search, 'status' => $status],
            'statuses' => array_map(fn (WhatsAppDeliveryStatus $status): array => ['value' => $status->value, 'label' => $status->label()], WhatsAppDeliveryStatus::cases()),
        ]);
    }

    public function retry(Request $request, WhatsAppDelivery $whatsAppDelivery, WhatsAppReminderService $reminders): RedirectResponse
    {
        $this->authorizeAdmin($request);
        if (! $reminders->retry($whatsAppDelivery)) {
            throw ValidationException::withMessages(['delivery' => 'Hanya pengiriman gagal yang masih berlaku hari ini dan memenuhi syarat yang dapat dicoba ulang. Pengiriman dengan hasil tidak pasti perlu diperiksa di Fonnte.']);
        }

        return back()->with('success', 'Pengiriman gagal diantrekan untuk dicoba ulang.');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user() instanceof User && $request->user()->isAdmin(), 403);
    }
}
