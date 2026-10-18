<?php

namespace App\Models;

use App\Enums\WhatsAppDeliveryStatus;
use Carbon\CarbonImmutable;
use Database\Factories\WhatsAppDeliveryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $kind
 * @property int|null $academic_event_id
 * @property int|null $teacher_contact_id
 * @property-read AcademicEvent|null $academicEvent
 * @property-read TeacherContact|null $teacherContact
 * @property string $event_title
 * @property string $recipient_name
 * @property string $phone
 * @property CarbonImmutable $reminder_date
 * @property string $timezone
 * @property string|null $message
 * @property WhatsAppDeliveryStatus $status
 * @property int $attempts
 * @property CarbonImmutable $available_at
 * @property CarbonImmutable|null $dispatched_at
 * @property CarbonImmutable|null $started_at
 * @property CarbonImmutable|null $finished_at
 * @property CarbonImmutable|null $accepted_at
 * @property string|null $failure_reason
 * @property list<string>|null $provider_ids
 * @property string|null $provider_request_id
 * @property list<array{status: string, at: string, reason: string|null}>|null $attempt_history
 */
#[Fillable(['kind', 'academic_event_id', 'teacher_contact_id', 'event_title', 'recipient_name', 'phone', 'reminder_date', 'timezone', 'message', 'status', 'attempts', 'available_at', 'dispatched_at', 'started_at', 'finished_at', 'accepted_at', 'failure_reason', 'provider_ids', 'provider_request_id', 'attempt_history'])]
class WhatsAppDelivery extends Model
{
    /** @use HasFactory<WhatsAppDeliveryFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => WhatsAppDeliveryStatus::class,
            'reminder_date' => 'immutable_date',
            'available_at' => 'immutable_datetime',
            'dispatched_at' => 'immutable_datetime',
            'started_at' => 'immutable_datetime',
            'finished_at' => 'immutable_datetime',
            'accepted_at' => 'immutable_datetime',
            'provider_ids' => 'array',
            'attempt_history' => 'array',
        ];
    }

    /** @return BelongsTo<AcademicEvent, $this> */
    public function academicEvent(): BelongsTo
    {
        return $this->belongsTo(AcademicEvent::class);
    }

    /** @return BelongsTo<TeacherContact, $this> */
    public function teacherContact(): BelongsTo
    {
        return $this->belongsTo(TeacherContact::class);
    }
}
