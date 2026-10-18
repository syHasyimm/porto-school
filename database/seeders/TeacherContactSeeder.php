<?php

namespace Database\Seeders;

use App\Models\TeacherContact;
use App\Models\TeacherProfile;
use Illuminate\Database\Seeder;

class TeacherContactSeeder extends Seeder
{
    public function run(): void
    {
        TeacherProfile::query()->with('user')->lazyById(100)->each(function (TeacherProfile $profile): void {
            if ($profile->user?->isGuru()) {
                TeacherContact::query()->firstOrCreate(['teacher_profile_id' => $profile->id], [
                    'name' => $profile->user->name,
                    'phone' => $profile->phone,
                    'is_active' => true,
                    'notifications_enabled' => false,
                ]);
            }
        });
    }
}
