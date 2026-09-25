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
        ])
        ->assertRedirectToRoute('admin.teachers.index')
        ->assertSessionHas('success');

    $teacher = User::query()->where('email', 'nadia@sdn001kepenuhan.sch.id')->firstOrFail();

    expect($teacher->role)->toBe(Role::Guru)
        ->and(Hash::check('rahasia-sekolah', $teacher->password))->toBeTrue()
        ->and($teacher->teacherProfile?->subject)->toBe('Guru Kelas III')
        ->and($teacher->teacherProfile?->photo_path)->not->toBeNull();

    Storage::disk('public')->assertExists($teacher->teacherProfile?->photo_path);
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
    TeacherProfile::factory()->for($teacher)->create(['photo_path' => 'teachers/old.jpg']);

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
        ])
        ->assertRedirectToRoute('admin.teachers.show', $teacher);

    $teacher->refresh();
    $teacher->teacherProfile?->refresh();

    expect($teacher->name)->toBe('Nama Guru Diperbarui')
        ->and(Hash::check('password-baru', $teacher->password))->toBeTrue()
        ->and($teacher->teacherProfile?->subject)->toBe('Guru Kelas VI');

    Storage::disk('public')->assertMissing('teachers/old.jpg');
    Storage::disk('public')->assertExists($teacher->teacherProfile?->photo_path);
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
