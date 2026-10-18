<?php

use App\Enums\Role;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('lists and searches teachers for an admin', function () {
    $admin = User::factory()->admin()->create();
    $matched = User::factory()->guru()->create(['name' => 'Siti Rahmawati']);
    $other = User::factory()->guru()->create(['name' => 'Budi Santoso']);
    TeacherProfile::factory()->for($matched)->create(['subject' => 'Guru Kelas I']);
    TeacherProfile::factory()->for($other)->create(['subject' => 'Pendidikan Jasmani']);

    $this->actingAs($admin)
        ->get(route('admin.teachers.index', ['search' => 'Siti']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teachers/index')
            ->where('filters.search', 'Siti')
            ->has('teachers.data', 1)
            ->where('teachers.data.0.name', 'Siti Rahmawati'));
});

it('creates a teacher account and profile with a photo', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.teachers.store'), [
            'name' => 'Nadia Putri, S.Pd.',
            'email' => 'nadia@sdn001kepenuhan.sch.id',
            'password' => 'rahasia-sekolah',
            'password_confirmation' => 'rahasia-sekolah',
            'nip' => '199201012020012003',
            'photo' => UploadedFile::fake()->image('nadia.jpg', 600, 800),
            'phone' => '081234567899',
            'address' => 'Kepenuhan',
            'birth_date' => '1992-01-01',
            'subject' => 'Guru Kelas III',
            'bio' => 'Mendampingi siswa belajar dengan aktif.',
            'education_history' => [
                ['level' => 'SMA', 'institution' => 'SMA Negeri 1', 'graduation_year' => '2009'],
                ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => 'PGSD', 'graduation_year' => '2013'],
            ],
        ])
        ->assertRedirectToRoute('admin.teachers.index')
        ->assertSessionHas('success');

    $teacher = User::query()->where('email', 'nadia@sdn001kepenuhan.sch.id')->firstOrFail();

    expect($teacher->role)->toBe(Role::Guru)
        ->and(Hash::check('rahasia-sekolah', $teacher->password))->toBeTrue()
        ->and($teacher->teacherProfile?->subject)->toBe('Guru Kelas III')
        ->and($teacher->teacherProfile?->photo_path)->not->toBeNull();

    Storage::disk('public')->assertExists($teacher->teacherProfile?->photo_path);

    expect($teacher->teacherProfile?->education_history)->toBe([
        ['level' => 'SMA', 'institution' => 'SMA Negeri 1', 'field_of_study' => null, 'graduation_year' => 2009],
        ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => 'PGSD', 'graduation_year' => 2013],
    ]);
});

it('validates unique account and profile identifiers', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->guru()->create(['email' => 'existing@example.test']);
    TeacherProfile::factory()->for($teacher)->create(['nip' => '19870001']);

    $this->actingAs($admin)
        ->post(route('admin.teachers.store'), [
            'name' => 'Guru Baru',
            'email' => 'existing@example.test',
            'password' => 'password-baru',
            'password_confirmation' => 'password-baru',
            'nip' => '19870001',
            'subject' => 'Guru Kelas V',
        ])
        ->assertInvalid(['email', 'nip']);
});

it('updates account data, password, profile, and replaces the photo', function () {
    Storage::fake('public');
    Storage::disk('public')->put('teachers/old.jpg', 'old-photo');

    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->guru()->create(['password' => 'password-lama']);
    TeacherProfile::factory()->for($teacher)->create([
        'photo_path' => 'teachers/old.jpg',
        'education_history' => [
            ['level' => 'SMA', 'institution' => 'SMA Lama', 'field_of_study' => null, 'graduation_year' => 2008],
        ],
    ]);

    $this->actingAs($admin)
        ->put(route('admin.teachers.update', $teacher), [
            'name' => 'Nama Guru Diperbarui',
            'email' => 'guru.baru@example.test',
            'password' => 'password-baru',
            'password_confirmation' => 'password-baru',
            'nip' => '19900001',
            'photo' => UploadedFile::fake()->image('new-photo.jpg', 600, 800),
            'phone' => '081200000001',
            'address' => 'Kepenuhan',
            'birth_date' => '1990-02-02',
            'subject' => 'Guru Kelas VI',
            'bio' => 'Profil yang diperbarui.',
            'education_history' => [
                ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => 'PGSD', 'graduation_year' => '2012'],
            ],
        ])
        ->assertRedirectToRoute('admin.teachers.show', $teacher);

    $teacher->refresh();
    $teacher->teacherProfile?->refresh();

    expect($teacher->name)->toBe('Nama Guru Diperbarui')
        ->and(Hash::check('password-baru', $teacher->password))->toBeTrue()
        ->and($teacher->teacherProfile?->subject)->toBe('Guru Kelas VI');

    Storage::disk('public')->assertMissing('teachers/old.jpg');
    Storage::disk('public')->assertExists($teacher->teacherProfile?->photo_path);

    expect($teacher->teacherProfile?->education_history)->toBe([
        ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => 'PGSD', 'graduation_year' => 2012],
    ]);
});

it('deletes the teacher account, profile, and stored photo', function () {
    Storage::fake('public');
    Storage::disk('public')->put('teachers/profile.jpg', 'photo');

    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->guru()->create();
    $profile = TeacherProfile::factory()->for($teacher)->create(['photo_path' => 'teachers/profile.jpg']);

    $this->actingAs($admin)
        ->delete(route('admin.teachers.destroy', $teacher))
        ->assertRedirectToRoute('admin.teachers.index');

    $this->assertDatabaseMissing('users', ['id' => $teacher->id]);
    $this->assertDatabaseMissing('teacher_profiles', ['id' => $profile->id]);
    Storage::disk('public')->assertMissing('teachers/profile.jpg');
});

it('prevents guru accounts from opening teacher administration', function () {
    $guru = User::factory()->guru()->create();

    $this->actingAs($guru)
        ->get(route('admin.teachers.index'))
        ->assertForbidden();
});

it('clears all education entries when the admin submits an empty history', function (mixed $emptyHistory) {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->guru()->create();
    $profile = TeacherProfile::factory()->for($teacher)->create([
        'education_history' => [
            ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => 'PGSD', 'graduation_year' => 2014],
        ],
    ]);

    $this->actingAs($admin)
        ->put(route('admin.teachers.update', $teacher), [
            'name' => $teacher->name,
            'email' => $teacher->email,
            'subject' => 'Guru Kelas I',
            'education_history' => $emptyHistory,
        ])
        ->assertRedirectToRoute('admin.teachers.show', $teacher);

    expect($profile->fresh()?->education_history)->toBe([]);
})->with(['empty array' => [[]], 'empty form field' => ['']]);

it('preserves education history when an update does not include that field', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->guru()->create();
    $profile = TeacherProfile::factory()->for($teacher)->create([
        'education_history' => [
            ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => null, 'graduation_year' => null],
        ],
    ]);

    $this->actingAs($admin)
        ->put(route('admin.teachers.update', $teacher), [
            'name' => $teacher->name,
            'email' => $teacher->email,
            'subject' => 'Guru Kelas II',
        ])
        ->assertRedirectToRoute('admin.teachers.show', $teacher);

    expect($profile->fresh()?->education_history)->toBe([
        ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => null, 'graduation_year' => null],
    ]);
});

it('returns saved education entries to the admin edit form', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->guru()->create();
    TeacherProfile::factory()->for($teacher)->create([
        'education_history' => [
            ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => 'PGSD', 'graduation_year' => 2014],
        ],
    ]);

    $this->actingAs($admin)->get(route('admin.teachers.edit', $teacher))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teachers/edit')
            ->where('teacher.education_history', [
                ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => 'PGSD', 'graduation_year' => 2014],
            ]));
});

it('rejects invalid education data before creating a teacher', function (mixed $history, array $fields) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.teachers.store'), [
        'name' => 'Guru Baru',
        'email' => 'pendidikan@example.test',
        'password' => 'password-baru',
        'password_confirmation' => 'password-baru',
        'subject' => 'Guru Kelas I',
        'education_history' => $history,
    ])->assertInvalid($fields);

    $this->assertDatabaseMissing('users', ['email' => 'pendidikan@example.test']);
})->with([
    'not an array' => ['S1', ['education_history']],
    'required entry fields' => [[['level' => '', 'institution' => '']], ['education_history.0.level', 'education_history.0.institution']],
    'unsupported entry keys' => [[['level' => 'S1', 'institution' => 'Kampus', 'private_note' => 'catatan']], ['education_history.0']],
    'invalid field types' => [[['level' => ['S1'], 'institution' => ['Kampus'], 'field_of_study' => ['PGSD']]], ['education_history.0.level', 'education_history.0.institution', 'education_history.0.field_of_study']],
    'oversized text' => [[['level' => str_repeat('a', 101), 'institution' => str_repeat('a', 256), 'field_of_study' => str_repeat('a', 256)]], ['education_history.0.level', 'education_history.0.institution', 'education_history.0.field_of_study']],
    'invalid year' => [[['level' => 'S1', 'institution' => 'Kampus', 'graduation_year' => 'empat belas']], ['education_history.0.graduation_year']],
    'year before lower limit' => [[['level' => 'S1', 'institution' => 'Kampus', 'graduation_year' => 1899]], ['education_history.0.graduation_year']],
    'future graduation year' => [[['level' => 'S1', 'institution' => 'Kampus', 'graduation_year' => 9999]], ['education_history.0.graduation_year']],
    'more than twelve entries' => [array_fill(0, 13, ['level' => 'S1', 'institution' => 'Kampus']), ['education_history']],
    'nonsequential indexes' => [[2 => ['level' => 'S1', 'institution' => 'Kampus']], ['education_history']],
]);

it('rejects an invalid education update and retains the stored history', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->guru()->create();
    $profile = TeacherProfile::factory()->for($teacher)->create([
        'education_history' => [
            ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => null, 'graduation_year' => 2014],
        ],
    ]);

    $this->actingAs($admin)->put(route('admin.teachers.update', $teacher), [
        'name' => $teacher->name,
        'email' => $teacher->email,
        'subject' => 'Guru Kelas I',
        'education_history' => [['level' => 'S2', 'institution' => '']],
    ])->assertInvalid(['education_history.0.institution']);

    expect($profile->fresh()?->education_history)->toBe([
        ['level' => 'S1', 'institution' => 'Universitas Riau', 'field_of_study' => null, 'graduation_year' => 2014],
    ]);
});
