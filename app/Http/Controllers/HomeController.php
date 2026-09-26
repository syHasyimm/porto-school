<?php

namespace App\Http\Controllers;

use App\Models\AcademicEvent;
use App\Models\Gallery;
use App\Models\News;
use App\Models\TeacherProfile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        $featuredNews = News::query()
            ->whereNotNull('published_at')
            ->orderByDesc('published_at')
            ->limit(3)
            ->get()
            ->map(fn (News $news): array => [
                'id' => $news->id,
                'title' => $news->title,
                'slug' => $news->slug,
                'excerpt' => Str::limit($news->content, 130),
                'thumbnail_url' => is_string($news->thumbnail_path)
                    ? Storage::disk('public')->url($news->thumbnail_path)
                    : null,
                'published_at' => $news->published_at?->toISOString(),
            ]);

        $featuredGallery = Gallery::query()
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Gallery $gallery): array => [
                'id' => $gallery->id,
                'title' => $gallery->title,
                'category' => $gallery->category,
                'image_url' => Storage::disk('public')->url($gallery->image_path),
            ]);

        return Inertia::render('welcome', [
            'featuredGallery' => $featuredGallery,
            'featuredNews' => $featuredNews,
            'stats' => [
                'teachers' => TeacherProfile::query()->count(),
                'upcoming_events' => AcademicEvent::query()->whereDate('start_date', '>=', today())->count(),
            ],
        ]);
    }
}
