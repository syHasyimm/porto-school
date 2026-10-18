<?php

namespace App\Http\Controllers;

use App\Models\AcademicEvent;
use App\Models\Gallery;
use App\Models\News;
use App\Models\TeacherProfile;
use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Builder;
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
            ->whereIn('id', Gallery::query()
                ->selectRaw('MAX(id)')
                ->groupByRaw("COALESCE(NULLIF(TRIM(category), ''), '')"))
            ->latest('id')
            ->limit(4)
            ->get()
            ->map(fn (Gallery $gallery): array => [
                'id' => $gallery->id,
                'title' => $gallery->title,
                'category' => is_string($gallery->category) && trim($gallery->category) !== ''
                    ? trim($gallery->category)
                    : null,
                'image_url' => Storage::disk('public')->url($gallery->image_path),
            ]);

        $today = today();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();
        $currentEvents = AcademicEvent::query()
            ->whereDate('start_date', '<=', $monthEnd)
            ->where(function (Builder $query) use ($monthStart): void {
                $query->whereDate('start_date', '>=', $monthStart)
                    ->orWhereDate('end_date', '>=', $monthStart);
            })
            ->orderBy('start_date')
            ->get();
        $upcomingEvents = AcademicEvent::query()
            ->where(function (Builder $query) use ($today): void {
                $query->whereDate('start_date', '>=', $today)
                    ->orWhereDate('end_date', '>=', $today);
            })
            ->orderBy('start_date')
            ->limit(3)
            ->get();

        return Inertia::render('welcome', [
            'featuredTestimonials' => Testimonial::query()
                ->where('is_published', true)
                ->orderBy('sort_order')
                ->latest('id')
                ->limit(6)
                ->get()
                ->map(fn (Testimonial $testimonial): array => [
                    'id' => $testimonial->id,
                    'name' => $testimonial->name,
                    'graduation_year' => $testimonial->graduation_year,
                    'content' => $testimonial->content,
                    'photo_url' => is_string($testimonial->photo_path)
                        ? Storage::disk('public')->url($testimonial->photo_path)
                        : null,
                ]),
            'showTestimonialExamples' => ! Testimonial::query()->exists(),
            'featuredGallery' => $featuredGallery,
            'featuredNews' => $featuredNews,
            'calendar' => [
                'today' => $today->format('Y-m-d'),
                'month' => $today->format('Y-m'),
                'events' => $currentEvents->map(fn (AcademicEvent $event): array => $this->calendarEvent($event)),
                'upcoming' => $upcomingEvents->map(fn (AcademicEvent $event): array => $this->calendarEvent($event)),
            ],
            'stats' => [
                'teachers' => TeacherProfile::query()->count(),
                'upcoming_events' => AcademicEvent::query()->whereDate('start_date', '>=', today())->count(),
            ],
        ]);
    }

    /**
     * @return array{id: int, title: string, start_date: string, end_date: string|null, category_label: string}
     */
    private function calendarEvent(AcademicEvent $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'start_date' => $event->start_date->format('Y-m-d'),
            'end_date' => $event->end_date?->format('Y-m-d'),
            'category_label' => $event->category->label(),
        ];
    }
}
