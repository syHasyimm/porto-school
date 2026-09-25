<?php

namespace Database\Seeders;

use App\Enums\EventCategory;
use App\Enums\Role;
use App\Models\AcademicEvent;
use App\Models\User;
use Illuminate\Database\Seeder;

class AcademicEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::query()->where('role', Role::Admin->value)->firstOrFail();
        $today = today();

        $events = [
            [
                'title' => 'Upacara Awal Bulan',
                'description' => 'Upacara bendera bersama seluruh warga sekolah.',
                'category' => EventCategory::Kegiatan,
                'start_date' => $today->copy()->addDays(5),
                'end_date' => null,
                'color' => '#22C55E',
            ],
            [
                'title' => 'Asesmen Tengah Semester',
                'description' => 'Pelaksanaan asesmen tengah semester untuk seluruh tingkat kelas.',
                'category' => EventCategory::Ujian,
                'start_date' => $today->copy()->addDays(14),
                'end_date' => $today->copy()->addDays(18),
                'color' => '#FBBF24',
            ],
            [
                'title' => 'Libur Setelah Asesmen',
                'description' => 'Kegiatan belajar mengajar diliburkan setelah asesmen.',
                'category' => EventCategory::Libur,
                'start_date' => $today->copy()->addDays(19),
                'end_date' => $today->copy()->addDays(20),
                'color' => '#EF4444',
            ],
        ];

        foreach ($events as $event) {
            AcademicEvent::query()->updateOrCreate(
                ['title' => $event['title']],
                [...$event, 'created_by' => $admin->id],
            );
        }
    }
}
