<?php

namespace Database\Factories;

use App\Models\AcademicEvent;
use App\Models\TeacherContact;
use App\Models\WhatsAppDelivery;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WhatsAppDelivery> */
class WhatsAppDeliveryFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'academic_event_id' => AcademicEvent::factory()->state(['start_date' => now('Asia/Jakarta')->toDateString(), 'end_date' => null, 'whatsapp_reminder_enabled' => true]),
            'teacher_contact_id' => TeacherContact::factory()->receivingReminders()->state(['phone' => '628123456789']),
            'event_title' => 'Rapat guru',
            'recipient_name' => 'Guru',
            'phone' => '628123456789',
            'reminder_date' => now('Asia/Jakarta')->toDateString(),
            'timezone' => 'Asia/Jakarta',
            'status' => 'pending',
            'available_at' => now(),
        ];
    }
}
