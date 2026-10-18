<?php

namespace Database\Seeders;

use App\Models\WhatsAppSetting;
use Illuminate\Database\Seeder;

class WhatsAppSettingSeeder extends Seeder
{
    public function run(): void
    {
        WhatsAppSetting::current();
    }
}
