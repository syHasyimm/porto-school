<?php

use App\Models\TeacherProfile;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows public teacher information without private account data', function () {
    $teacher = User::factory()->guru()->create([
        'name' => 'Siti Rahmawati',
        'email' => 'private@example.test',
    ]);
    TeacherProfile::factory()->for($teacher)->create([
        'nip' => '19870001',
        'phone' => '081234567890',
        'address' => 'Alamat privat',
        'birth_date' => '1987-04-12',
        'subject' => 'Guru Kelas I',
        'bio' => 'Mendampingi siswa kelas satu.',
        'education_history' => [
            ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => 'PGSD', 'graduation_year' => 2010],
            ['level' => 'S2', 'institution' => 'Universitas Negeri Padang', 'field_of_study' => null, 'graduation_year' => 2018],
        ],
    ]);

    $this->get(route('teachers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teachers/index')
            ->has('teachers.data', 1)
            ->has('teachers.data.0', fn (Assert $item) => $item
                ->where('id', $teacher->id)
                ->where('name', 'Siti Rahmawati')
                ->where('subject', 'Guru Kelas I')
                ->where('bio', 'Mendampingi siswa kelas satu.')
                ->where('photo_url', null)
                ->where('education_history', [
                    ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => 'PGSD', 'graduation_year' => 2010],
                    ['level' => 'S2', 'institution' => 'Universitas Negeri Padang', 'field_of_study' => null, 'graduation_year' => 2018],
                ])
                ->missing('email')
                ->missing('nip')
                ->missing('phone')
                ->missing('address')
                ->missing('birth_date')));
});

it('returns an empty education history for an existing teacher without education data', function () {
    $teacher = User::factory()->guru()->create();
    TeacherProfile::factory()->for($teacher)->create();

    $this->get(route('teachers.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('teachers.data', 1)
            ->where('teachers.data.0.education_history', []));
});

it('does not list admin accounts in the public teacher directory', function () {
    $admin = User::factory()->admin()->create();
    TeacherProfile::factory()->for($admin)->create();

    $this->get(route('teachers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teachers/index')
            ->has('teachers.data', 0));
});
