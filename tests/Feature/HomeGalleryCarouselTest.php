<?php

use App\Models\Gallery;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the last added photo from every category even when recent uploads share one category', function () {
    $admin = User::factory()->admin()->create();
    $facilities = Gallery::factory()->for($admin, 'author')->create(['category' => 'Fasilitas']);
    $achievement = Gallery::factory()->for($admin, 'author')->create(['category' => 'Prestasi']);
    Gallery::factory()->for($admin, 'author')->count(6)->create(['category' => 'Kegiatan']);
    $latestActivity = Gallery::factory()->for($admin, 'author')->create(['category' => 'Kegiatan']);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->has('featuredGallery', 3)
        ->where('featuredGallery.0.id', $latestActivity->id)
        ->where('featuredGallery.0.category', 'Kegiatan')
        ->where('featuredGallery.1.id', $achievement->id)
        ->where('featuredGallery.1.category', 'Prestasi')
        ->where('featuredGallery.2.id', $facilities->id)
        ->where('featuredGallery.2.category', 'Fasilitas'));
});

it('groups missing categories together and trims category names in carousel items', function () {
    $admin = User::factory()->admin()->create();
    Gallery::factory()->for($admin, 'author')->create(['category' => null]);
    Gallery::factory()->for($admin, 'author')->create(['category' => '']);
    $uncategorized = Gallery::factory()->for($admin, 'author')->create(['category' => '   ']);
    Gallery::factory()->for($admin, 'author')->create(['category' => 'Kegiatan']);
    $activity = Gallery::factory()->for($admin, 'author')->create(['category' => ' Kegiatan ']);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->has('featuredGallery', 2)
        ->where('featuredGallery.0.id', $activity->id)
        ->where('featuredGallery.0.category', 'Kegiatan')
        ->where('featuredGallery.1.id', $uncategorized->id)
        ->where('featuredGallery.1.category', null));
});

it('limits home gallery stories to four distinct categories', function () {
    $admin = User::factory()->admin()->create();
    Gallery::factory()->for($admin, 'author')->create(['category' => 'Arsip']);
    Gallery::factory()->for($admin, 'author')->create(['category' => 'Kegiatan']);
    Gallery::factory()->for($admin, 'author')->create(['category' => 'Fasilitas']);
    Gallery::factory()->for($admin, 'author')->create(['category' => 'Prestasi']);
    $newest = Gallery::factory()->for($admin, 'author')->create(['category' => 'Pembelajaran']);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->has('featuredGallery', 4)
        ->where('featuredGallery.0.id', $newest->id)
        ->where('featuredGallery.3.category', 'Kegiatan')
        ->missing('featuredGallery.4')
        ->etc());
});

it('returns an empty carousel when the school has no gallery photos', function () {
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->component('welcome')
        ->has('featuredGallery', 0));
});
