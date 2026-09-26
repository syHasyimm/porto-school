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
            'school_history' => 'SD Negeri 001 Kepenuhan hadir untuk memberikan pendidikan dasar yang dekat dengan keluarga dan kebutuhan masyarakat Kepenuhan.',
            'school_vision' => 'Terwujudnya peserta didik yang beriman, berkarakter, berprestasi, dan peduli lingkungan.',
            'school_mission' => "Menyelenggarakan pembelajaran yang aktif dan menyenangkan.\nMembiasakan sikap disiplin, santun, dan bertanggung jawab.\nMengembangkan potensi akademik dan nonakademik setiap peserta didik.",
            'school_facilities' => "Ruang kelas\nPerpustakaan\nUKS\nLapangan sekolah",
            'school_extracurriculars' => "Pramuka\nOlahraga\nSeni dan budaya\nLiterasi",
            'headmaster_name' => 'Lengkapi nama kepala sekolah.',
            'npsn' => null,
            'facebook_url' => null,
            'instagram_url' => null,
            'map_embed_url' => null,
            'logo_path' => null,
        ];

        foreach ($settings as $key => $value) {
            SiteSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }
    }
}
