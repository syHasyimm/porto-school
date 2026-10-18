<?php

use App\Models\AcademicEvent;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('saves homepage content and publishes uploaded image URLs', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.settings.update'), [
        ...homepageSettingsPayload(),
        '_method' => 'PUT',
        'hero_image' => UploadedFile::fake()->image('hero.jpg', 1200, 900),
        'headmaster_photo' => UploadedFile::fake()->image('headmaster.jpg', 600, 750),
    ])->assertRedirect()->assertSessionHas('success');

    foreach (['hero_image', 'headmaster_photo'] as $field) {
        $path = SiteSetting::query()->where('key', $field.'_path')->value('value');
        expect($path)->toBeString();
        Storage::disk('public')->assertExists($path);
    }

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->where('site.alumni_count', '247')
        ->where('site.active_students_count', '186')
        ->where('site.teacher_staff_count', '23')
        ->where('site.accreditation', 'A')
        ->where('site.registration_url', 'https://example.test/pendaftaran')
        ->where('site.headmaster_message', 'Selamat datang di sekolah kami.')
        ->where('site.hero_image_url', fn (string $url): bool => str_starts_with($url, '/storage/site/'))
        ->where('site.headmaster_photo_url', fn (string $url): bool => str_starts_with($url, '/storage/site/'))
        ->missing('site.hero_image_path')
        ->missing('site.headmaster_photo_path'));
});

it('replaces a homepage image and deletes its previous file', function (string $field) {
    Storage::fake('public');
    $previousPath = 'site/previous-'.$field.'.jpg';
    Storage::disk('public')->put($previousPath, 'previous image');
    SiteSetting::factory()->create(['key' => $field.'_path', 'value' => $previousPath]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->put(route('admin.settings.update'), [
        ...homepageSettingsPayload(),
        $field => UploadedFile::fake()->image('replacement.jpg'),
    ])->assertRedirect();

    $path = SiteSetting::query()->where('key', $field.'_path')->value('value');
    expect($path)->toBeString()->not->toBe($previousPath);
    Storage::disk('public')->assertExists($path);
    Storage::disk('public')->assertMissing($previousPath);
})->with(['hero_image', 'headmaster_photo']);

it('keeps homepage images when saving text without new uploads', function () {
    Storage::fake('public');
    Storage::disk('public')->put('site/hero.jpg', 'existing image');
    SiteSetting::factory()->create(['key' => 'hero_image_path', 'value' => 'site/hero.jpg']);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->put(route('admin.settings.update'), homepageSettingsPayload())->assertRedirect();

    $this->assertDatabaseHas('site_settings', ['key' => 'hero_image_path', 'value' => 'site/hero.jpg']);
    Storage::disk('public')->assertExists('site/hero.jpg');
});

it('rejects invalid homepage statistics links and images without saving them', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->put(route('admin.settings.update'), [
        ...homepageSettingsPayload(),
        'alumni_count' => -1,
        'active_students_count' => 'many',
        'teacher_staff_count' => 1.5,
        'registration_url' => 'javascript:alert(1)',
        'hero_image' => UploadedFile::fake()->create('hero.svg', 1, 'image/svg+xml'),
        'headmaster_photo' => UploadedFile::fake()->create('portrait.pdf', 1, 'application/pdf'),
    ])->assertInvalid(['alumni_count', 'active_students_count', 'teacher_staff_count', 'registration_url', 'hero_image', 'headmaster_photo']);

    $this->assertDatabaseMissing('site_settings', ['key' => 'registration_url']);
    expect(Storage::disk('public')->allFiles())->toBeEmpty();
});

it('includes ongoing and future agenda while excluding completed agenda', function () {
    $this->travelTo(now()->setDate(2026, 9, 26)->startOfDay());
    AcademicEvent::factory()->create(['title' => 'Sudah selesai', 'start_date' => '2026-09-23', 'end_date' => '2026-09-25']);
    AcademicEvent::factory()->create(['title' => 'Masih berlangsung', 'start_date' => '2026-09-24', 'end_date' => '2026-09-28']);
    AcademicEvent::factory()->create(['title' => 'Besok', 'start_date' => '2026-09-27', 'end_date' => null]);
    AcademicEvent::factory()->create(['title' => 'Bulan depan', 'start_date' => '2026-10-01', 'end_date' => null]);
    AcademicEvent::factory()->create(['title' => 'Agenda keempat', 'start_date' => '2026-10-02', 'end_date' => null]);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->where('calendar.today', '2026-09-26')
        ->where('calendar.month', '2026-09')
        ->has('calendar.events', 3)
        ->has('calendar.upcoming', 3)
        ->where('calendar.upcoming.0.title', 'Masih berlangsung')
        ->where('calendar.upcoming.1.title', 'Besok')
        ->where('calendar.upcoming.2.title', 'Bulan depan')
        ->missing('calendar.upcoming.0.created_by')
        ->missing('calendar.upcoming.0.description'));
});

it('renders the homepage with empty statistics media and agenda', function () {
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->where('site.alumni_count', null)
        ->where('site.registration_url', null)
        ->where('site.hero_image_url', null)
        ->where('site.headmaster_photo_url', null)
        ->has('calendar.events', 0)
        ->has('calendar.upcoming', 0));
});

/** @return array<string, string> */
function homepageSettingsPayload(): array
{
    return [
        'school_name' => 'SD Negeri 001 Kepenuhan',
        'school_address' => 'Kepenuhan, Rokan Hulu, Riau',
        'school_phone' => '081234567890',
        'school_email' => 'info@example.test',
        'school_description' => 'Sekolah ramah untuk keluarga.',
        'alumni_count' => '247',
        'active_students_count' => '186',
        'teacher_staff_count' => '23',
        'accreditation' => 'A',
        'registration_url' => 'https://example.test/pendaftaran',
        'headmaster_message' => 'Selamat datang di sekolah kami.',
    ];
}
