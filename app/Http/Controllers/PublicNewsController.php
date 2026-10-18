<?php

namespace App\Http\Controllers;

use App\Enums\NewsCategory;
use App\Models\News;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicNewsController extends Controller
{
    public function index(): Response
    {
        $articles = News::query()
            ->whereNotNull('published_at')
            ->orderByDesc('published_at')
            ->paginate(9)
            ->through(fn (News $news): array => $this->newsData($news));

        return Inertia::render('news/index', ['articles' => $articles]);
    }

    public function show(News $news): Response
    {
        abort_if($news->published_at === null, 404);

        $relatedNewsQuery = News::query()
            ->select(['id', 'title', 'slug', 'content', 'category', 'thumbnail_path', 'published_at'])
            ->whereNotNull('published_at')
            ->whereKeyNot($news->getKey())
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        $relatedNews = (clone $relatedNewsQuery)
            ->where('category', $news->category)
            ->limit(3)
            ->get();

        if ($relatedNews->count() < 3) {
            $otherNews = (clone $relatedNewsQuery)
                ->where('category', '!=', $news->category)
                ->limit(3 - $relatedNews->count())
                ->get();

            $relatedNews = $relatedNews->concat($otherNews);
        }

        return Inertia::render('news/show', [
            'article' => [...$this->newsData($news), 'content' => $news->content, 'content_html' => $news->content_html],
            'relatedNews' => $relatedNews->map(fn (News $relatedArticle): array => $this->newsData($relatedArticle))->all(),
        ]);
    }

    /** @return array<string, mixed> */
    private function newsData(News $news): array
    {
        return [
            'id' => $news->id,
            'title' => $news->title,
            'category' => $news->category,
            'category_label' => NewsCategory::from($news->category)->label(),
            'slug' => $news->slug,
            'excerpt' => Str::limit($news->content, 180),
            'thumbnail_url' => is_string($news->thumbnail_path)
                ? Storage::disk('public')->url($news->thumbnail_path)
                : null,
            'published_at' => $news->published_at?->toISOString(),
        ];
    }
}
