<?php

use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the authenticated guru profile', function () {
    $guru = User::factory()->guru()->create();
    TeacherProfile::factory()->for($guru)->create(['subject' => 'Guru Kelas II']);

    $this->actingAs($guru)
        ->get(route('guru.profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('guru/profile/edit')
            ->where('profile.name', $guru->name)
            ->where('profile.email', $guru->email)
            ->where('profile.subject', 'Guru Kelas II'));
});

it('lets a guru update only their own profile fields', function () {
    Storage::fake('public');
    $guru = User::factory()->guru()->create([
        'name' => 'Nama Tetap',
        'email' => 'guru@example.test',
    ]);
    TeacherProfile::factory()->for($guru)->create();

    $this->actingAs($guru)
        ->patch(route('guru.profile.update'), [
            'name' => 'Nama Tidak Boleh Berubah',
            'email' => 'email-baru@example.test',
            'nip' => '19950001',
            'photo' => UploadedFile::fake()->image('profile.png', 600, 800),
            'phone' => '081234000001',
            'address' => 'Kecamatan Kepenuhan',
            'birth_date' => '1995-01-01',
            'subject' => 'Guru Kelas IV',
            'bio' => 'Bio guru yang diperbarui.',
        ])
        ->assertRedirectToRoute('guru.profile.edit')
        ->assertSessionHas('success');

    $guru->refresh();
    $guru->teacherProfile?->refresh();

    expect($guru->name)->toBe('Nama Tetap')
        ->and($guru->email)->toBe('guru@example.test')
        ->and($guru->teacherProfile?->subject)->toBe('Guru Kelas IV')
        ->and($guru->teacherProfile?->photo_path)->not->toBeNull();

    Storage::disk('public')->assertExists($guru->teacherProfile?->photo_path);
});

it('prevents admin accounts from opening the guru profile editor', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('guru.profile.edit'))
        ->assertForbidden();
});
