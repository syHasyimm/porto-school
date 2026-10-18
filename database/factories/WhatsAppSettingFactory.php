<?php

namespace Database\Factories;

use App\Models\WhatsAppSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WhatsAppSetting> */
class WhatsAppSettingFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'id' => 1,
            'token' => 'test-fonnte-token',
            'reminders_enabled' => true,
            'send_time' => '07:00',
            'timezone' => 'Asia/Jakarta',
            'admin_phone' => '628123456789',
        ];
    }
}
