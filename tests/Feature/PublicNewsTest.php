<?php

use App\Models\News;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows only published news on the public list', function () {
    $admin = User::factory()->admin()->create();
    News::factory()->for($admin, 'author')->create([
        'title' => 'Berita Publik',
        'slug' => 'berita-publik',
        'published_at' => now(),
    ]);
    News::factory()->for($admin, 'author')->create([
        'title' => 'Berita Draft',
        'slug' => 'berita-draft',
        'published_at' => null,
    ]);

    $this->get(route('news.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('news/index')
            ->has('articles.data', 1)
            ->where('articles.data.0.title', 'Berita Publik')
            ->missing('articles.data.0.created_by')
            ->missing('articles.data.0.content'));
});

it('shows a published article by its slug', function () {
    $article = News::factory()->create([
        'title' => 'Prestasi Siswa',
        'slug' => 'prestasi-siswa',
        'content' => 'Siswa meraih prestasi dalam kegiatan tingkat kecamatan.',
        'category' => 'prestasi',
        'content_html' => '<p>Siswa meraih <strong>prestasi</strong> dalam kegiatan tingkat kecamatan.</p>',
        'published_at' => now(),
    ]);

    $this->get(route('news.show', $article->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('news/show')
            ->where('article.slug', 'prestasi-siswa')
            ->where('article.category_label', 'Prestasi')
            ->where('article.content', $article->content)
            ->where('article.content_html', $article->content_html)
            ->missing('article.created_by'));
});

it('prioritizes published news in the same category and fills remaining cards with the newest news', function () {
    $article = News::factory()->create([
        'slug' => 'berita-dibaca',
        'category' => 'kegiatan',
        'published_at' => now()->subDays(5),
    ]);
    News::factory()->create([
        'slug' => 'kegiatan-lama',
        'category' => 'kegiatan',
        'published_at' => now()->subDays(10),
    ]);
    News::factory()->create([
        'slug' => 'kegiatan-baru',
        'category' => 'kegiatan',
        'published_at' => now()->subDays(2),
    ]);
    News::factory()->create([
        'slug' => 'umum-terbaru',
        'category' => 'umum',
        'published_at' => now()->subDay(),
    ]);
    News::factory()->create([
        'slug' => 'umum-lama',
        'category' => 'umum',
        'published_at' => now()->subDays(3),
    ]);
    News::factory()->create([
        'slug' => 'kegiatan-draf',
        'category' => 'kegiatan',
        'published_at' => null,
    ]);

    $this->get(route('news.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('news/show')
            ->has('relatedNews', 3)
            ->where('relatedNews.0.slug', 'kegiatan-baru')
            ->where('relatedNews.1.slug', 'kegiatan-lama')
            ->where('relatedNews.2.slug', 'umum-terbaru')
            ->missing('relatedNews.0.content')
            ->missing('relatedNews.0.content_html'));
});

it('returns no related news when the article is the only published news', function () {
    $article = News::factory()->create(['published_at' => now()]);
    News::factory()->create(['published_at' => null]);

    $this->get(route('news.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('news/show')
            ->where('relatedNews', []));
});

it('limits related news to three articles from the same category', function () {
    $article = News::factory()->create([
        'category' => 'prestasi',
        'published_at' => now()->subDays(5),
    ]);

    foreach (range(1, 4) as $day) {
        News::factory()->create([
            'slug' => "prestasi-{$day}",
            'category' => 'prestasi',
            'published_at' => now()->subDays($day),
        ]);
    }

    News::factory()->create([
        'slug' => 'umum-baru',
        'category' => 'umum',
        'published_at' => now(),
    ]);

    $this->get(route('news.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('news/show')
            ->has('relatedNews', 3)
            ->where('relatedNews.0.slug', 'prestasi-1')
            ->where('relatedNews.1.slug', 'prestasi-2')
            ->where('relatedNews.2.slug', 'prestasi-3'));
});

it('does not expose draft articles publicly', function () {
    $article = News::factory()->create([
        'slug' => 'draft-rahasia',
        'published_at' => null,
    ]);

    $this->get(route('news.show', $article->slug))->assertNotFound();
});

it('uses a site relative URL for the public news thumbnail', function () {
    $article = News::factory()->create([
        'thumbnail_path' => 'news/berita-sekolah.jpg',
        'published_at' => now(),
    ]);

    $this->withServerVariables(['HTTP_HOST' => 'school.test'])
        ->get(route('news.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->component('news/show')
            ->where('article.thumbnail_url', '/storage/news/berita-sekolah.jpg'));
});
