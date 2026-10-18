<?php

namespace App\Jobs;

use App\Enums\WhatsAppDeliveryStatus;
use App\Models\WhatsAppDelivery;
use App\Models\WhatsAppSetting;
use App\Services\FonnteClient;
use App\Services\WhatsAppReminderService;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

class SendWhatsAppDelivery implements ShouldQueue
{
    use Queueable;

    public int $tries = 0;

    public int $maxExceptions = 1;

    public int $timeout = 45;

    public function __construct(public int $deliveryId) {}

    public function handle(FonnteClient $client, WhatsAppReminderService $reminders): void
    {
        $pending = WhatsAppDelivery::query()->find($this->deliveryId);
        if ($pending === null || $pending->status !== WhatsAppDeliveryStatus::Pending) {
            return;
        }

        if ($pending->available_at->isFuture()) {
            $this->release((int) ceil(now()->diffInSeconds($pending->available_at)));

            return;
        }

        $settings = WhatsAppSetting::current();
        if ($reminders->skipReason($pending, $settings) === null && $pending->kind === 'reminder'
            && CarbonImmutable::now($settings->timezone)->format('H:i') < $settings->send_time) {
            $this->release(60);

            return;
        }

        $lock = Cache::lock('whatsapp-delivery-send', 60);
        if (! $lock->get()) {
            $this->release(10);

            return;
        }

        try {
            if ($reminders->skipReason($pending, $settings) === null && RateLimiter::tooManyAttempts('whatsapp-delivery-rate', 1)) {
                $this->release(max(1, RateLimiter::availableIn('whatsapp-delivery-rate')));

                return;
            }

            $delivery = $reminders->claim($this->deliveryId);
            if ($delivery === null) {
                return;
            }

            RateLimiter::hit('whatsapp-delivery-rate', 10);
            $result = $client->send($delivery->phone, $delivery->message ?? '');
            $reminders->finish($delivery->id, $result['status'], $result['reason'], $result['provider_ids'], $result['request_id']);
        } finally {
            $lock->release();
        }
    }

    public function failed(?Throwable $exception): void
    {
        WhatsAppDelivery::query()->whereKey($this->deliveryId)->where('status', WhatsAppDeliveryStatus::Sending)
            ->update(['status' => WhatsAppDeliveryStatus::NeedsReview->value, 'failure_reason' => 'Worker terhenti saat mengirim. Periksa dashboard Fonnte; pengiriman tidak dicoba ulang otomatis.', 'finished_at' => now()]);
    }
}
