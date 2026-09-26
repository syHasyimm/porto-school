<?php

use App\Models\Gallery;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows gallery items and available categories publicly', function () {
    $admin = User::factory()->admin()->create();
    Gallery::factory()->for($admin, 'author')->create([
        'title' => 'Kegiatan Literasi',
        'category' => 'Kegiatan',
    ]);
    Gallery::factory()->for($admin, 'author')->create([
        'title' => 'Perpustakaan Sekolah',
        'category' => 'Fasilitas',
    ]);

    $this->get(route('gallery.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('gallery/index')
            ->has('categories', 2)
            ->has('items.data', 2)
            ->missing('items.data.0.created_by')
            ->missing('items.data.0.image_path'));
});

it('filters the public gallery by category', function () {
    $admin = User::factory()->admin()->create();
    Gallery::factory()->for($admin, 'author')->create([
        'title' => 'Kegiatan Literasi',
        'category' => 'Kegiatan',
    ]);
    Gallery::factory()->for($admin, 'author')->create([
        'title' => 'Ruang UKS',
        'category' => 'Fasilitas',
    ]);

    $this->get(route('gallery.index', ['category' => 'Fasilitas']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.category', 'Fasilitas')
            ->has('items.data', 1)
            ->where('items.data.0.title', 'Ruang UKS'));
});

it('ignores an unknown public gallery category', function () {
    Gallery::factory()->create(['category' => 'Kegiatan']);

    $this->get(route('gallery.index', ['category' => 'Tidak Ada']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.category', '')
            ->has('items.data', 1));
});
