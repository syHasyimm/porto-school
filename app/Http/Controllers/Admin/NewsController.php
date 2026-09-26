<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNewsRequest;
use App\Http\Requests\Admin\UpdateNewsRequest;
use App\Models\News;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class NewsController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', News::class);
        $search = request()->string('search')->trim()->toString();
        $status = request()->string('status')->toString();

        if (! in_array($status, ['draft', 'published'], true)) {
            $status = '';
        }

        $articles = News::query()
            ->when($search !== '', fn (Builder $query) => $query->where('title', 'like', "%{$search}%"))
            ->when($status === 'draft', fn (Builder $query) => $query->whereNull('published_at'))
            ->when($status === 'published', fn (Builder $query) => $query->whereNotNull('published_at'))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (News $news): array => $this->newsData($news));

        return Inertia::render('admin/news/index', [
            'articles' => $articles,
            'filters' => compact('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', News::class);

        return Inertia::render('admin/news/create');
    }

    public function store(StoreNewsRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        $validated = $request->safe()->except('thumbnail');
        $thumbnailPath = $this->storeThumbnail($request->file('thumbnail'));

        try {
            News::query()->create([
                ...$validated,
                'slug' => $this->uniqueSlug($validated['title']),
                'thumbnail_path' => $thumbnailPath,
                'created_by' => $user->id,
            ]);
        } catch (Throwable $throwable) {
            if (is_string($thumbnailPath)) {
                Storage::disk('public')->delete($thumbnailPath);
            }

            throw $throwable;
        }

        return to_route('admin.news.index')->with('success', 'Berita berhasil ditambahkan.');
    }

    public function show(News $news): Response
    {
        Gate::authorize('view', $news);

        return Inertia::render('admin/news/show', ['article' => $this->newsData($news, true)]);
    }

    public function edit(News $news): Response
    {
        Gate::authorize('update', $news);

        return Inertia::render('admin/news/edit', ['article' => $this->newsData($news, true)]);
    }

    public function update(UpdateNewsRequest $request, News $news): RedirectResponse
    {
        Gate::authorize('update', $news);
        $validated = $request->safe()->except('thumbnail');
        $oldThumbnailPath = $news->thumbnail_path;
        $newThumbnailPath = $this->storeThumbnail($request->file('thumbnail'));

        try {
            $news->update([
                ...$validated,
                'thumbnail_path' => $newThumbnailPath ?? $oldThumbnailPath,
            ]);
        } catch (Throwable $throwable) {
            if (is_string($newThumbnailPath)) {
                Storage::disk('public')->delete($newThumbnailPath);
            }

            throw $throwable;
        }

        if (is_string($newThumbnailPath) && is_string($oldThumbnailPath)) {
            Storage::disk('public')->delete($oldThumbnailPath);
        }

        return to_route('admin.news.show', $news)->with('success', 'Berita berhasil diperbarui.');
    }

    public function destroy(News $news): RedirectResponse
    {
        Gate::authorize('delete', $news);
        $thumbnailPath = $news->thumbnail_path;
        $news->delete();

        if (is_string($thumbnailPath)) {
            Storage::disk('public')->delete($thumbnailPath);
        }

        return to_route('admin.news.index')->with('success', 'Berita berhasil dihapus.');
    }

    private function storeThumbnail(?UploadedFile $thumbnail): ?string
    {
        if (! $thumbnail instanceof UploadedFile) {
            return null;
        }

        $path = $thumbnail->store('news', 'public');
        abort_unless(is_string($path), 500, 'Thumbnail gagal disimpan.');

        return $path;
    }

    private function uniqueSlug(string $title): string
    {
        $baseSlug = Str::slug($title) ?: 'berita';
        $slug = $baseSlug;
        $suffix = 2;

        while (News::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    /** @return array<string, mixed> */
    private function newsData(News $news, bool $withContent = false): array
    {
        $data = [
            'id' => $news->id,
            'title' => $news->title,
            'slug' => $news->slug,
            'excerpt' => Str::limit($news->content, 150),
            'thumbnail_url' => is_string($news->thumbnail_path)
                ? Storage::disk('public')->url($news->thumbnail_path)
                : null,
            'published_at' => $news->published_at?->format('Y-m-d\TH:i'),
            'status' => $news->published_at === null ? 'draft' : 'published',
            'created_at' => $news->created_at?->toISOString(),
        ];

        if ($withContent) {
            $data['content'] = $news->content;
        }

        return $data;
    }
}
