<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeacherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teachers = [
            [
                'name' => 'Siti Rahmawati, S.Pd.',
                'email' => 'siti.rahmawati@sdn001kepenuhan.sch.id',
                'nip' => '198704122010012001',
                'phone' => '081234567801',
                'address' => 'Kecamatan Kepenuhan, Kabupaten Rokan Hulu',
                'birth_date' => '1987-04-12',
                'subject' => 'Guru Kelas I',
                'bio' => 'Berkomitmen menciptakan pengalaman belajar dasar yang hangat, aktif, dan menyenangkan.',
            ],
            [
                'name' => 'Budi Santoso, S.Pd.',
                'email' => 'budi.santoso@sdn001kepenuhan.sch.id',
                'nip' => '198503182009011002',
                'phone' => '081234567802',
                'address' => 'Kecamatan Kepenuhan, Kabupaten Rokan Hulu',
                'birth_date' => '1985-03-18',
                'subject' => 'Pendidikan Jasmani',
                'bio' => 'Mendampingi peserta didik untuk tumbuh sehat, disiplin, sportif, dan percaya diri.',
            ],
        ];

        foreach ($teachers as $teacherData) {
            $user = User::query()->updateOrCreate(
                ['email' => $teacherData['email']],
                [
                    'name' => $teacherData['name'],
                    'password' => Hash::make('password'),
                    'role' => Role::Guru,
                    'email_verified_at' => now(),
                ],
            );

            $user->teacherProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nip' => $teacherData['nip'],
                    'phone' => $teacherData['phone'],
                    'address' => $teacherData['address'],
                    'birth_date' => $teacherData['birth_date'],
                    'subject' => $teacherData['subject'],
                    'bio' => $teacherData['bio'],
                ],
            );
        }
    }
}
