<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'school_name' => 'SD Negeri 001 Kepenuhan',
            'school_address' => 'Lengkapi alamat resmi sekolah sebelum publikasi.',
            'school_phone' => 'Lengkapi nomor telepon sekolah sebelum publikasi.',
            'school_email' => 'info@sdn001kepenuhan.sch.id',
            'school_description' => 'Sekolah dasar negeri yang mendampingi peserta didik untuk belajar, bertumbuh, dan berprestasi.',
            'facebook_url' => null,
            'instagram_url' => null,
            'map_embed_url' => null,
        ];

        foreach ($settings as $key => $value) {
            SiteSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }
    }
}
