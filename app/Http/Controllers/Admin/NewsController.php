<?php

namespace App\Http\Controllers\Admin;

use App\Enums\NewsCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNewsRequest;
use App\Http\Requests\Admin\UpdateNewsRequest;
use App\Models\News;
use App\Models\User;
use DOMDocument;
use DOMElement;
use DOMNode;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
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

        return Inertia::render('admin/news/create', [
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(StoreNewsRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        $validated = $request->safe()->except('thumbnail');
        $validated['content_html'] = $this->sanitizeContentHtml($validated['content_html'] ?? null);
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

        return Inertia::render('admin/news/edit', [
            'article' => $this->newsData($news, true),
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(UpdateNewsRequest $request, News $news): RedirectResponse
    {
        Gate::authorize('update', $news);
        $validated = $request->safe()->except('thumbnail');
        $validated['content_html'] = $this->sanitizeContentHtml($validated['content_html'] ?? null);
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

    /** @return array<int, array{value: string, label: string}> */
    private function categoryOptions(): array
    {
        return array_map(
            fn (NewsCategory $category): array => [
                'value' => $category->value,
                'label' => $category->label(),
            ],
            NewsCategory::cases(),
        );
    }

    private function sanitizeContentHtml(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        $source = new DOMDocument('1.0', 'UTF-8');
        $previousErrors = libxml_use_internal_errors(true);
        $source->loadHTML('<?xml encoding="UTF-8"?><div>'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET);
        libxml_clear_errors();
        libxml_use_internal_errors($previousErrors);

        $root = $source->getElementsByTagName('div')->item(0);
        $clean = new DOMDocument('1.0', 'UTF-8');
        $container = $clean->createElement('div');
        $clean->appendChild($container);

        if ($root !== null) {
            foreach ($root->childNodes as $child) {
                $safeChild = $this->sanitizeContentNode($child, $clean);

                if ($safeChild !== null) {
                    $container->appendChild($safeChild);
                }
            }
        }

        $safeHtml = '';

        foreach ($container->childNodes as $child) {
            $safeHtml .= $clean->saveHTML($child);
        }

        if (trim(html_entity_decode(strip_tags($safeHtml), ENT_QUOTES | ENT_HTML5, 'UTF-8')) === '') {
            throw ValidationException::withMessages(['content' => 'Isi berita wajib diisi.']);
        }

        return $safeHtml;
    }

    private function sanitizeContentNode(DOMNode $node, DOMDocument $document): ?DOMNode
    {
        if ($node->nodeType === XML_TEXT_NODE) {
            return $document->createTextNode($node->nodeValue ?? '');
        }

        if (! $node instanceof DOMElement) {
            return null;
        }

        $tag = strtolower($node->tagName);

        if (in_array($tag, ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'img', 'video', 'audio', 'form'], true)) {
            return null;
        }

        $safeNode = in_array($tag, ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ol', 'ul', 'li', 'blockquote', 'a'], true)
            ? $document->createElement($tag)
            : $document->createDocumentFragment();

        if ($tag === 'a' && $safeNode instanceof DOMElement) {
            $href = trim($node->getAttribute('href'));

            if (preg_match('~^(https?://|mailto:|/(?!/))~i', $href) === 1) {
                $safeNode->setAttribute('href', $href);
            }
        }

        foreach ($node->childNodes as $child) {
            $safeChild = $this->sanitizeContentNode($child, $document);

            if ($safeChild !== null) {
                $safeNode->appendChild($safeChild);
            }
        }

        return $safeNode;
    }

    /** @return array<string, mixed> */
    private function newsData(News $news, bool $withContent = false): array
    {
        $data = [
            'id' => $news->id,
            'title' => $news->title,
            'category' => $news->category,
            'category_label' => NewsCategory::from($news->category)->label(),
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
            $data['content_html'] = $news->content_html;
        }

        return $data;
    }
}
