<?php

use App\Models\Gallery;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('lists and filters gallery items for an admin', function () {
    $admin = User::factory()->admin()->create();
    Gallery::factory()->for($admin, 'author')->create([
        'title' => 'Upacara Hari Senin',
        'category' => 'Kegiatan',
    ]);
    Gallery::factory()->for($admin, 'author')->create([
        'title' => 'Ruang Perpustakaan',
        'category' => 'Fasilitas',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.gallery.index', [
            'search' => 'Upacara',
            'category' => 'Kegiatan',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/gallery/index')
            ->where('filters.search', 'Upacara')
            ->where('filters.category', 'Kegiatan')
            ->has('items.data', 1)
            ->where('items.data.0.title', 'Upacara Hari Senin'));
});

it('creates a gallery item with a public image', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.gallery.store'), [
            'title' => 'Kegiatan Pramuka',
            'category' => 'Ekstrakurikuler',
            'image' => UploadedFile::fake()->image('pramuka.jpg', 1200, 900),
        ])
        ->assertRedirectToRoute('admin.gallery.index')
        ->assertSessionHas('success');

    $item = Gallery::query()->sole();

    expect($item->title)->toBe('Kegiatan Pramuka')
        ->and($item->category)->toBe('Ekstrakurikuler')
        ->and($item->created_by)->toBe($admin->id);
    Storage::disk('public')->assertExists($item->image_path);
});

it('requires a valid image when creating a gallery item', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.gallery.store'), [
            'title' => 'Dokumentasi',
            'category' => 'Kegiatan',
            'image' => UploadedFile::fake()->create(
                'catatan.pdf',
                100,
                'application/pdf',
            ),
        ])
        ->assertInvalid(['image']);
});

it('updates a gallery item and replaces its image', function () {
    Storage::fake('public');
    Storage::disk('public')->put('galleries/old.jpg', 'old-image');
    $admin = User::factory()->admin()->create();
    $item = Gallery::factory()->for($admin, 'author')->create([
        'title' => 'Judul Lama',
        'image_path' => 'galleries/old.jpg',
        'category' => 'Lama',
    ]);

    $this->actingAs($admin)
        ->put(route('admin.gallery.update', $item), [
            'title' => 'Judul Baru',
            'category' => 'Prestasi',
            'image' => UploadedFile::fake()->image('new.png', 1200, 900),
        ])
        ->assertRedirectToRoute('admin.gallery.index');

    $item->refresh();

    expect($item->title)->toBe('Judul Baru')
        ->and($item->category)->toBe('Prestasi')
        ->and($item->image_path)->not->toBe('galleries/old.jpg');
    Storage::disk('public')->assertMissing('galleries/old.jpg');
    Storage::disk('public')->assertExists($item->image_path);
});

it('deletes a gallery item and its image', function () {
    Storage::fake('public');
    Storage::disk('public')->put('galleries/delete.jpg', 'image');
    $admin = User::factory()->admin()->create();
    $item = Gallery::factory()->for($admin, 'author')->create([
        'image_path' => 'galleries/delete.jpg',
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.gallery.destroy', $item))
        ->assertRedirectToRoute('admin.gallery.index');

    $this->assertDatabaseMissing('galleries', ['id' => $item->id]);
    Storage::disk('public')->assertMissing('galleries/delete.jpg');
});

it('prevents guru accounts from managing the gallery', function () {
    $guru = User::factory()->guru()->create();

    $this->actingAs($guru)
        ->get(route('admin.gallery.index'))
        ->assertForbidden();
});
