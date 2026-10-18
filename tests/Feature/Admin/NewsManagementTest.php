<?php

use App\Models\News;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('lists and filters news for an admin', function () {
    $admin = User::factory()->admin()->create();
    News::factory()->for($admin, 'author')->create([
        'title' => 'Berita Sudah Terbit',
        'slug' => 'berita-sudah-terbit',
        'published_at' => now(),
    ]);
    News::factory()->for($admin, 'author')->create([
        'title' => 'Rencana Kegiatan',
        'slug' => 'rencana-kegiatan',
        'published_at' => null,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.news.index', [
            'search' => 'Rencana',
            'status' => 'draft',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/news/index')
            ->where('filters.search', 'Rencana')
            ->where('filters.status', 'draft')
            ->has('articles.data', 1)
            ->where('articles.data.0.title', 'Rencana Kegiatan'));
});

it('creates news with a generated unique slug and thumbnail', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $payload = [
        'title' => 'Festival Literasi Sekolah',
        'category' => 'kegiatan',
        'content' => 'Siswa mengikuti rangkaian kegiatan literasi sekolah.',
        'content_html' => '<p>Siswa <strong>mengikuti</strong> rangkaian kegiatan literasi sekolah.</p>',
        'published_at' => '2026-10-12 08:00:00',
    ];

    $this->actingAs($admin)
        ->post(route('admin.news.store'), [
            ...$payload,
            'thumbnail' => UploadedFile::fake()->image('literasi.jpg', 1200, 800),
        ])
        ->assertRedirectToRoute('admin.news.index');

    $this->actingAs($admin)
        ->post(route('admin.news.store'), $payload)
        ->assertRedirectToRoute('admin.news.index');

    $articles = News::query()->orderBy('id')->get();

    expect($articles[0]->slug)->toBe('festival-literasi-sekolah')
        ->and($articles[1]->slug)->toBe('festival-literasi-sekolah-2')
        ->and($articles[0]->category)->toBe('kegiatan')
        ->and($articles[0]->content_html)->toBe($payload['content_html'])
        ->and($articles[0]->created_by)->toBe($admin->id)
        ->and($articles[0]->thumbnail_path)->not->toBeNull();

    Storage::disk('public')->assertExists($articles[0]->thumbnail_path);
});

it('validates news fields and thumbnail type', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.news.store'), [
            'title' => '',
            'category' => 'tidak-valid',
            'content' => '',
            'published_at' => 'bukan-tanggal',
            'thumbnail' => UploadedFile::fake()->create(
                'dokumen.pdf',
                100,
                'application/pdf',
            ),
        ])
        ->assertInvalid(['title', 'category', 'content', 'published_at', 'thumbnail']);
});

it('requires a category when creating news', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.news.store'), [
            'title' => 'Berita tanpa kategori',
            'content' => 'Isi berita sekolah.',
        ])
        ->assertInvalid(['category']);

    $this->assertDatabaseCount('news', 0);
});

it('updates news and replaces its thumbnail while preserving the public slug', function () {
    Storage::fake('public');
    Storage::disk('public')->put('news/old.jpg', 'old-image');
    $admin = User::factory()->admin()->create();
    $article = News::factory()->for($admin, 'author')->create([
        'title' => 'Judul Lama',
        'slug' => 'judul-lama',
        'thumbnail_path' => 'news/old.jpg',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.news.update', $article).'?_method=PUT', [
            'title' => 'Judul Baru',
            'category' => 'prestasi',
            'content' => 'Konten berita yang telah diperbarui.',
            'content_html' => '<p>Konten berita yang telah <em>diperbarui</em>.</p>',
            'published_at' => null,
            'thumbnail' => UploadedFile::fake()->image('new.jpg', 1200, 800),
        ])
        ->assertRedirectToRoute('admin.news.show', $article);

    $article->refresh();

    expect($article->title)->toBe('Judul Baru')
        ->and($article->category)->toBe('prestasi')
        ->and($article->content_html)->toBe('<p>Konten berita yang telah <em>diperbarui</em>.</p>')
        ->and($article->slug)->toBe('judul-lama')
        ->and($article->published_at)->toBeNull()
        ->and($article->thumbnail_path)->not->toBe('news/old.jpg');

    Storage::disk('public')->assertMissing('news/old.jpg');
    Storage::disk('public')->assertExists($article->thumbnail_path);
});

it('removes unsafe markup before saving rich news content', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.news.store'), [
            'title' => 'Berita dengan tautan',
            'category' => 'pengumuman',
            'content' => 'Baca pengumuman sekolah.',
            'content_html' => '<p onclick="alert(1)">Baca <a href="javascript:alert(1)">pengumuman</a> <a href="https://sekolah.test" target="_blank">sekolah</a>.</p><script>alert(1)</script>',
        ])
        ->assertRedirectToRoute('admin.news.index');

    expect(News::query()->firstOrFail()->content_html)
        ->toBe('<p>Baca <a>pengumuman</a> <a href="https://sekolah.test">sekolah</a>.</p>');
});

it('rejects rich news content without readable text', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.news.store'), [
            'title' => 'Berita kosong',
            'category' => 'umum',
            'content' => 'Isi palsu',
            'content_html' => '<p><br></p><script>alert(1)</script>',
        ])
        ->assertInvalid(['content']);

    $this->assertDatabaseCount('news', 0);
});

it('deletes news and its thumbnail', function () {
    Storage::fake('public');
    Storage::disk('public')->put('news/delete.jpg', 'image');
    $admin = User::factory()->admin()->create();
    $article = News::factory()->for($admin, 'author')->create([
        'thumbnail_path' => 'news/delete.jpg',
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.news.destroy', $article))
        ->assertRedirectToRoute('admin.news.index');

    $this->assertDatabaseMissing('news', ['id' => $article->id]);
    Storage::disk('public')->assertMissing('news/delete.jpg');
});

it('prevents guru accounts from managing news', function () {
    $guru = User::factory()->guru()->create();

    $this->actingAs($guru)
        ->get(route('admin.news.index'))
        ->assertForbidden();
});
