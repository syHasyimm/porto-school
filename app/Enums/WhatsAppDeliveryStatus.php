<?php

namespace App\Enums;

enum WhatsAppDeliveryStatus: string
{
    case Pending = 'pending';
    case Sending = 'sending';
    case Accepted = 'accepted';
    case Failed = 'failed';
    case NeedsReview = 'needs_review';
    case Skipped = 'skipped';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Dalam antrean',
            self::Sending => 'Sedang dikirim',
            self::Accepted => 'Diterima Fonnte',
            self::Failed => 'Gagal',
            self::NeedsReview => 'Perlu diperiksa',
            self::Skipped => 'Dilewati',
        };
    }
}
