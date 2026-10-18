<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicEvent;
use App\Models\News;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = today();
        $tomorrow = $today->copy()->addDay();
        $todayEventsQuery = AcademicEvent::query()
            ->select(['id', 'title', 'category', 'start_date', 'end_date'])
            ->whereDate('start_date', '<=', $today)
            ->where(function (Builder $query) use ($today): void {
                $query->whereDate('end_date', '>=', $today)
                    ->orWhere(function (Builder $query) use ($today): void {
                        $query->whereNull('end_date')
                            ->whereDate('start_date', $today);
                    });
            });
        $todayEventCount = (clone $todayEventsQuery)->count();
        $todayEvents = $todayEventsQuery
            ->orderBy('start_date')
            ->limit(3)
            ->get();
        $nextEvent = AcademicEvent::query()
            ->select(['id', 'title', 'category', 'start_date', 'end_date'])
            ->whereDate('start_date', '>', $today)
            ->orderBy('start_date')
            ->first();
        $todayNews = News::query()
            ->select(['id', 'title', 'published_at'])
            ->where('published_at', '>=', $today)
            ->where('published_at', '<', $tomorrow);
        $latestNews = (clone $todayNews)
            ->latest('published_at')
            ->first();

        return Inertia::render('admin/dashboard', [
            'overview' => [
                'today' => $today->format('Y-m-d'),
                'today_events' => $todayEvents
                    ->map(fn (AcademicEvent $event): array => $this->eventData($event))
                    ->all(),
                'today_event_count' => $todayEventCount,
                'next_event' => $nextEvent instanceof AcademicEvent
                    ? $this->eventData($nextEvent)
                    : null,
                'news' => [
                    'count' => $todayNews->count(),
                    'latest' => $latestNews instanceof News
                        ? $this->newsData($latestNews)
                        : null,
                ],
            ],
        ]);
    }

    /**
     * @return array{id: int, title: string, start_date: string, end_date: string|null, category_label: string}
     */
    private function eventData(AcademicEvent $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'start_date' => $event->start_date->format('Y-m-d'),
            'end_date' => $event->end_date?->format('Y-m-d'),
            'category_label' => $event->category->label(),
        ];
    }

    /**
     * @return array{id: int, title: string, published_at: string|null}
     */
    private function newsData(News $news): array
    {
        return [
            'id' => $news->id,
            'title' => $news->title,
            'published_at' => $news->published_at?->toISOString(),
        ];
    }
}
