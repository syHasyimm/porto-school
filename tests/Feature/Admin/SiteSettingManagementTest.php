<?php

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the current site settings to an admin', function () {
    $admin = User::factory()->admin()->create();
    SiteSetting::factory()->create([
        'key' => 'school_name',
        'value' => 'SD Negeri 001 Kepenuhan',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.settings.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/settings/edit')
            ->where('settings.school_name', 'SD Negeri 001 Kepenuhan'));
});

it('updates the public school profile and stores a logo', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            ...siteSettingsPayload(),
            'logo' => UploadedFile::fake()->image('logo.png', 512, 512),
            'unexpected_key' => 'tidak boleh tersimpan',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('site_settings', [
        'key' => 'school_name',
        'value' => 'SD Negeri 001 Kepenuhan',
    ]);
    $this->assertDatabaseHas('site_settings', [
        'key' => 'school_vision',
        'value' => 'Unggul dan berkarakter.',
    ]);
    $this->assertDatabaseMissing('site_settings', [
        'key' => 'unexpected_key',
    ]);

    $logoPath = SiteSetting::query()->where('key', 'logo_path')->value('value');
    expect($logoPath)->toBeString();
    Storage::disk('public')->assertExists($logoPath);
});

it('replaces and removes the previous school logo', function () {
    Storage::fake('public');
    Storage::disk('public')->put('site/old-logo.png', 'old-logo');
    SiteSetting::factory()->create([
        'key' => 'logo_path',
        'value' => 'site/old-logo.png',
    ]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            ...siteSettingsPayload(),
            'logo' => UploadedFile::fake()->image('new-logo.png', 512, 512),
        ])
        ->assertRedirect();

    $newLogoPath = SiteSetting::query()->where('key', 'logo_path')->value('value');
    expect($newLogoPath)->toBeString()->not->toBe('site/old-logo.png');
    Storage::disk('public')->assertMissing('site/old-logo.png');
    Storage::disk('public')->assertExists($newLogoPath);
});

it('validates required identity fields and public URLs', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            ...siteSettingsPayload(),
            'school_name' => '',
            'school_email' => 'bukan-email',
            'facebook_url' => 'javascript:alert(1)',
            'map_embed_url' => 'ftp://example.test/map',
        ])
        ->assertInvalid([
            'school_name',
            'school_email',
            'facebook_url',
            'map_embed_url',
        ]);
});

it('prevents guru accounts from changing site settings', function () {
    $guru = User::factory()->guru()->create();

    $this->actingAs($guru)
        ->get(route('admin.settings.edit'))
        ->assertForbidden();
});

/** @return array<string, string|null> */
function siteSettingsPayload(): array
{
    return [
        'school_name' => 'SD Negeri 001 Kepenuhan',
        'school_address' => 'Kepenuhan, Rokan Hulu, Riau',
        'school_phone' => '081234567890',
        'school_email' => 'info@sdn001kepenuhan.sch.id',
        'school_description' => 'Sekolah dasar yang dekat dengan keluarga.',
        'school_history' => 'Sekolah tumbuh bersama masyarakat Kepenuhan.',
        'school_vision' => 'Unggul dan berkarakter.',
        'school_mission' => "Belajar aktif.\nMenumbuhkan karakter.",
        'school_facilities' => "Perpustakaan\nUKS",
        'school_extracurriculars' => "Pramuka\nOlahraga",
        'headmaster_name' => 'Kepala Sekolah',
        'npsn' => '12345678',
        'facebook_url' => 'https://facebook.com/sdn001kepenuhan',
        'instagram_url' => 'https://instagram.com/sdn001kepenuhan',
        'map_embed_url' => 'https://www.google.com/maps/embed?pb=contoh',
    ];
}
