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
        'published_at' => now(),
    ]);

    $this->get(route('news.show', $article->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('news/show')
            ->where('article.slug', 'prestasi-siswa')
            ->where('article.content', $article->content)
            ->missing('article.created_by'));
});

it('does not expose draft articles publicly', function () {
    $article = News::factory()->create([
        'slug' => 'draft-rahasia',
        'published_at' => null,
    ]);

    $this->get(route('news.show', $article->slug))->assertNotFound();
});
