<?php

namespace Database\Seeders;

use App\Enums\ComplaintCategory;
use App\Enums\ComplaintStatus;
use App\Enums\Role;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Database\Seeder;

class ComplaintSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::query()->where('role', Role::Admin->value)->firstOrFail();

        $newComplaint = Complaint::query()->updateOrCreate(
            ['reference_number' => 'PGD-DEMO-AKA001'],
            [
                'reporter_name' => 'Andi Saputra',
                'email' => 'andi@example.test',
                'phone' => '081234567811',
                'student_name' => 'Nadia Saputra',
                'student_class' => 'III A',
                'category' => ComplaintCategory::Akademik,
                'body' => 'Mohon informasi tambahan mengenai jadwal pendampingan belajar menjelang asesmen.',
                'status' => ComplaintStatus::Baru,
            ],
        );

        $processedComplaint = Complaint::query()->updateOrCreate(
            ['reference_number' => 'PGD-DEMO-FAS001'],
            [
                'reporter_name' => 'Rina Marlina',
                'email' => 'rina@example.test',
                'phone' => '081234567812',
                'student_name' => 'Dimas Pratama',
                'student_class' => 'V A',
                'category' => ComplaintCategory::Fasilitas,
                'body' => 'Mohon pemeriksaan keran air di dekat ruang kelas karena sulit ditutup.',
                'status' => ComplaintStatus::Diproses,
            ],
        );

        $processedComplaint->responses()->updateOrCreate(
            ['user_id' => $admin->id],
            ['response' => 'Laporan sudah diteruskan kepada petugas sarana dan sedang dijadwalkan untuk diperbaiki.'],
        );

        $newComplaint->responses()->delete();
    }
}
