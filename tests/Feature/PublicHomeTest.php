<?php

use App\Models\AcademicEvent;
use App\Models\Gallery;
use App\Models\News;
use App\Models\SiteSetting;
use App\Models\TeacherProfile;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the configured school identity and public homepage content', function () {
    SiteSetting::factory()->create([
        'key' => 'school_name',
        'value' => 'SD Negeri 001 Kepenuhan',
    ]);
    SiteSetting::factory()->create([
        'key' => 'school_description',
        'value' => 'Sekolah ramah untuk keluarga.',
    ]);
    SiteSetting::factory()->create([
        'key' => 'logo_path',
        'value' => 'site/logo.png',
    ]);

    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->guru()->create();
    TeacherProfile::factory()->for($teacher)->create();
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'start_date' => now()->addWeek(),
    ]);
    News::factory()->for($admin, 'author')->create([
        'title' => 'Berita Terbaru',
        'slug' => 'berita-terbaru',
        'published_at' => now(),
    ]);
    News::factory()->for($admin, 'author')->create([
        'title' => 'Draft Internal',
        'slug' => 'draft-internal',
        'published_at' => null,
    ]);
    Gallery::factory()->for($admin, 'author')->create([
        'title' => 'Dokumentasi Sekolah',
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('name', 'SD Negeri 001 Kepenuhan')
            ->where('site.school_description', 'Sekolah ramah untuk keluarga.')
            ->where('site.logo_url', fn (string $url): bool => str_contains($url, '/storage/site/logo.png'))
            ->missing('site.logo_path')
            ->where('stats.teachers', 1)
            ->where('stats.upcoming_events', 1)
            ->has('featuredNews', 1)
            ->where('featuredNews.0.title', 'Berita Terbaru')
            ->missing('featuredNews.0.content')
            ->missing('featuredNews.0.created_by')
            ->has('featuredGallery', 1)
            ->where('featuredGallery.0.title', 'Dokumentasi Sekolah')
            ->missing('featuredGallery.0.image_path')
            ->missing('featuredGallery.0.created_by'));
});

it('uses the configured school identity as shared data on public pages', function () {
    SiteSetting::factory()->create([
        'key' => 'school_name',
        'value' => 'Nama Sekolah Publik',
    ]);
    News::factory()->create(['published_at' => now()]);

    $this->get(route('news.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('name', 'Nama Sekolah Publik')
            ->where('site.school_name', 'Nama Sekolah Publik'));
});
