<?php

use App\Models\SchoolHistory;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('lets admins view all history stories in their saved order', function () {
    $later = SchoolHistory::factory()->published()->create(['sort_order' => 1]);
    $first = SchoolHistory::factory()->create(['sort_order' => 0]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.settings.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/settings/edit')
            ->has('historyEntries', 2)
            ->where('historyEntries.0.id', $first->id)
            ->where('historyEntries.0.is_published', false)
            ->where('historyEntries.1.id', $later->id)
            ->missing('historyEntries.0.photo_path'));
});

it('creates multiple stories and profile photos through the settings form', function () {
    Storage::fake('public');

    $this->actingAs(User::factory()->admin()->create())
        ->from(route('admin.settings.edit'))
        ->post(route('admin.settings.update'), [
            ...historySettingsPayload(),
            '_method' => 'put',
            'profile_image' => UploadedFile::fake()->image('school.webp'),
            'history_editor' => '1',
            'history_entries' => [
                [...historyEntryPayload(), 'photo' => UploadedFile::fake()->image('archive.jpg')],
                [...historyEntryPayload(), 'title' => 'Pengembangan perpustakaan', 'is_published' => '0'],
            ],
        ])->assertRedirect(route('admin.settings.edit'))->assertSessionHasNoErrors();

    $stories = SchoolHistory::query()->orderBy('sort_order')->get();
    expect($stories)->toHaveCount(2);
    expect($stories[0]->is_published)->toBeTrue();
    expect($stories[1]->sort_order)->toBe(1);
    expect($stories[1]->is_published)->toBeFalse();
    Storage::disk('public')->assertExists($stories[0]->photo_path);
    $coverPath = SiteSetting::query()->where('key', 'profile_image_path')->value('value');
    Storage::disk('public')->assertExists($coverPath);
    $this->assertDatabaseMissing('site_settings', ['key' => 'history_entries']);
    $this->assertDatabaseMissing('site_settings', ['key' => 'history_editor']);

    $this->get(route('profile'))->assertInertia(fn (Assert $page) => $page
        ->where('site.profile_image_url', Storage::disk('public')->url($coverPath))
        ->has('historyEntries', 1)
        ->where('historyEntries.0.title', 'Awal perjalanan sekolah')
        ->where('historyEntries.0.photo_url', Storage::disk('public')->url($stories[0]->photo_path)));
});

it('reorders and edits stories while retaining, replacing and deleting their photos', function () {
    Storage::fake('public');
    foreach (['retained', 'replaced', 'deleted'] as $photo) {
        Storage::disk('public')->put('school-history/'.$photo.'.jpg', $photo);
    }
    $retained = SchoolHistory::factory()->published()->create(['sort_order' => 0, 'photo_path' => 'school-history/retained.jpg']);
    $replaced = SchoolHistory::factory()->create(['sort_order' => 1, 'photo_path' => 'school-history/replaced.jpg']);
    $deleted = SchoolHistory::factory()->create(['sort_order' => 2, 'photo_path' => 'school-history/deleted.jpg']);

    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        ...historySettingsPayload(),
        'history_editor' => 1,
        'history_entries' => [
            [...historyEntryPayload($replaced->id), 'title' => 'Cerita diperbarui', 'photo' => UploadedFile::fake()->image('new.jpg')],
            [...historyEntryPayload($retained->id), 'is_published' => 0],
        ],
    ])->assertRedirect()->assertSessionHasNoErrors();

    expect($replaced->refresh()->title)->toBe('Cerita diperbarui');
    expect($replaced->sort_order)->toBe(0);
    expect($retained->refresh()->sort_order)->toBe(1);
    expect($retained->is_published)->toBeFalse();
    expect($retained->photo_path)->toBe('school-history/retained.jpg');
    $this->assertModelMissing($deleted);
    Storage::disk('public')->assertExists(['school-history/retained.jpg', $replaced->photo_path]);
    Storage::disk('public')->assertMissing(['school-history/replaced.jpg', 'school-history/deleted.jpg']);
});

it('removes optional photos without deleting their stories', function () {
    Storage::fake('public');
    Storage::disk('public')->put('school-history/old.jpg', 'old');
    Storage::disk('public')->put('site/old-cover.jpg', 'cover');
    SiteSetting::factory()->create(['key' => 'profile_image_path', 'value' => 'site/old-cover.jpg']);
    $story = SchoolHistory::factory()->create(['photo_path' => 'school-history/old.jpg']);

    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        ...historySettingsPayload(),
        'remove_profile_image' => '1',
        'history_editor' => 1,
        'history_entries' => [[...historyEntryPayload($story->id), 'remove_photo' => '1']],
    ])->assertSessionHasNoErrors();

    expect($story->refresh()->photo_path)->toBeNull();
    $this->assertDatabaseHas('site_settings', ['key' => 'profile_image_path', 'value' => null]);
    Storage::disk('public')->assertMissing(['school-history/old.jpg', 'site/old-cover.jpg']);
});

it('replaces a profile cover and deletes its old file after saving', function () {
    Storage::fake('public');
    Storage::disk('public')->put('site/cover.jpg', 'old');
    SiteSetting::factory()->create(['key' => 'profile_image_path', 'value' => 'site/cover.jpg']);

    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        ...historySettingsPayload(), 'profile_image' => UploadedFile::fake()->image('new-cover.jpg'),
    ])->assertSessionHasNoErrors();

    $path = SiteSetting::query()->where('key', 'profile_image_path')->value('value');
    Storage::disk('public')->assertExists($path);
    Storage::disk('public')->assertMissing('site/cover.jpg');
});

it('keeps stories intact when an older settings form omits the history editor', function () {
    $story = SchoolHistory::factory()->published()->create();
    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), historySettingsPayload())
        ->assertSessionHasNoErrors();
    $this->assertModelExists($story);
    expect($story->refresh()->title)->toBe($story->title);
});

it('can clear the entire storyline and still keep the legacy history text', function () {
    Storage::fake('public');
    Storage::disk('public')->put('school-history/deleted.jpg', 'old');
    SchoolHistory::factory()->published()->create(['photo_path' => 'school-history/deleted.jpg']);

    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        ...historySettingsPayload(), 'history_editor' => '1',
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseCount('school_histories', 0);
    Storage::disk('public')->assertMissing('school-history/deleted.jpg');
    $this->get(route('profile'))->assertInertia(fn (Assert $page) => $page
        ->has('historyEntries', 0)
        ->where('site.school_history', 'Sejarah asli sekolah.'));
});

it('rejects invalid story data before changing settings or files', function (string $field, mixed $value) {
    Storage::fake('public');
    $story = SchoolHistory::factory()->published()->create();
    $entry = [...historyEntryPayload(), $field => $value instanceof Closure ? $value() : $value];

    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        ...historySettingsPayload(), 'history_editor' => 1,
        'profile_image' => UploadedFile::fake()->image('cover.jpg'),
        'history_entries' => [$entry],
    ])->assertInvalid('history_entries.0.'.$field);

    $this->assertModelExists($story);
    $this->assertDatabaseCount('site_settings', 0);
    expect(Storage::disk('public')->allFiles())->toBeEmpty();
})->with([
    'empty period' => ['period', ''],
    'empty title' => ['title', ''],
    'empty description' => ['description', ''],
    'unknown story' => ['id', 999999],
    'invalid publication' => ['is_published', 'published'],
    'unsafe photo' => ['photo', fn () => UploadedFile::fake()->create('script.svg', 5, 'image/svg+xml')],
    'oversized photo' => ['photo', fn () => UploadedFile::fake()->image('large.jpg')->size(4097)],
]);

it('rejects duplicate identifiers and unapproved story fields', function (bool $duplicate) {
    $story = SchoolHistory::factory()->create();
    $entries = $duplicate
        ? [historyEntryPayload($story->id), historyEntryPayload($story->id)]
        : [[...historyEntryPayload($story->id), 'photo_path' => 'private/file.jpg']];

    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        ...historySettingsPayload(), 'history_editor' => 1, 'history_entries' => $entries,
    ])->assertInvalid($duplicate ? 'history_entries.0.id' : 'history_entries.0');

    $this->assertDatabaseCount('school_histories', 1);
    $this->assertDatabaseCount('site_settings', 0);
})->with([true, false]);

it('limits the storyline to fifty stories', function () {
    $story = SchoolHistory::factory()->create();

    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        ...historySettingsPayload(), 'history_editor' => 1,
        'history_entries' => array_fill(0, 51, historyEntryPayload()),
    ])->assertInvalid('history_entries');

    $this->assertModelExists($story);
    $this->assertDatabaseCount('site_settings', 0);
});

it('blocks non-admin users from reading and editing history settings', function () {
    $this->get(route('admin.settings.edit'))->assertRedirect(route('login'));
    $this->put(route('admin.settings.update'), historySettingsPayload())->assertRedirect(route('login'));
    $this->actingAs(User::factory()->guru()->create())->get(route('admin.settings.edit'))->assertForbidden();
    $this->put(route('admin.settings.update'), [
        ...historySettingsPayload(), 'history_editor' => 1, 'history_entries' => [historyEntryPayload()],
    ])->assertForbidden();
    $this->assertDatabaseCount('school_histories', 0);
});

it('publishes only visible stories in the configured order and omits internal fields', function () {
    $last = SchoolHistory::factory()->published()->create(['sort_order' => 4]);
    $first = SchoolHistory::factory()->published()->create(['sort_order' => 0]);
    SchoolHistory::factory()->create(['sort_order' => 1]);

    $this->get(route('profile'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('historyEntries', 2)
        ->where('historyEntries.0.id', $first->id)
        ->where('historyEntries.1.id', $last->id)
        ->where('historyEntries.0.photo_url', null)
        ->missing('historyEntries.0.photo_path')
        ->missing('historyEntries.0.is_published')
        ->missing('historyEntries.0.created_at'));
});

it('keeps legacy history available when every storyline entry is a draft', function () {
    SchoolHistory::factory()->count(2)->create();
    SiteSetting::factory()->create(['key' => 'school_history', 'value' => 'Cerita dari arsip sekolah.']);

    $this->get(route('profile'))->assertInertia(fn (Assert $page) => $page
        ->has('historyEntries', 0)->where('site.school_history', 'Cerita dari arsip sekolah.'));
});

it('rolls back settings and stories and cleans new uploads when a story cannot be saved', function () {
    Storage::fake('public');
    Storage::disk('public')->put('school-history/original.jpg', 'original');
    Storage::disk('public')->put('site/original.jpg', 'original');
    SiteSetting::factory()->create(['key' => 'profile_image_path', 'value' => 'site/original.jpg']);
    $story = SchoolHistory::factory()->published()->create(['photo_path' => 'school-history/original.jpg']);
    SchoolHistory::saving(fn () => throw new RuntimeException('Simulated database failure'));
    $this->withoutExceptionHandling();

    try {
        expect(fn () => $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
            ...historySettingsPayload(), 'history_editor' => 1,
            'profile_image' => UploadedFile::fake()->image('cover.jpg'),
            'history_entries' => [[...historyEntryPayload($story->id), 'photo' => UploadedFile::fake()->image('story.jpg')]],
        ]))->toThrow(RuntimeException::class, 'Simulated database failure');
    } finally {
        SchoolHistory::flushEventListeners();
    }

    expect($story->refresh()->photo_path)->toBe('school-history/original.jpg');
    $this->assertDatabaseMissing('site_settings', ['key' => 'school_name']);
    $this->assertDatabaseHas('site_settings', ['key' => 'profile_image_path', 'value' => 'site/original.jpg']);
    expect(Storage::disk('public')->allFiles())->toHaveCount(2);
    Storage::disk('public')->assertExists(['site/original.jpg', 'school-history/original.jpg']);
});

/** @return array<string, string> */
function historySettingsPayload(): array
{
    return [
        'school_name' => 'SD Negeri 001 Kepenuhan',
        'school_address' => 'Kepenuhan, Rokan Hulu',
        'school_phone' => '081234567890',
        'school_email' => 'sekolah@example.com',
        'school_description' => 'Deskripsi asli sekolah.',
        'school_history' => 'Sejarah asli sekolah.',
    ];
}

/** @return array{id: int|null, period: string, title: string, description: string, is_published: int, remove_photo: int} */
function historyEntryPayload(?int $id = null): array
{
    return [
        'id' => $id,
        'period' => '1985–1990',
        'title' => 'Awal perjalanan sekolah',
        'description' => 'Cerita berdasarkan dokumen arsip sekolah untuk keperluan pengujian.',
        'is_published' => 1,
        'remove_photo' => 0,
    ];
}
