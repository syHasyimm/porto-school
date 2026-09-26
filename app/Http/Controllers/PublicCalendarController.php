<?php

namespace App\Http\Controllers;

use App\Enums\EventCategory;
use App\Models\AcademicEvent;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PublicCalendarController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $month = $this->month($request->string('month')->toString());
        $category = $request->string('category')->toString();

        if (! in_array($category, array_column(EventCategory::cases(), 'value'), true)) {
            $category = '';
        }

        $events = AcademicEvent::query()
            ->whereDate('start_date', '<=', $month->endOfMonth())
            ->where(function (Builder $query) use ($month): void {
                $query->whereDate('start_date', '>=', $month->startOfMonth())
                    ->orWhereDate('end_date', '>=', $month->startOfMonth());
            })
            ->when($category !== '', fn (Builder $query) => $query->where('category', $category))
            ->orderBy('start_date')
            ->get()
            ->map(fn (AcademicEvent $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'category' => $event->category->value,
                'category_label' => $event->category->label(),
                'start_date' => $event->start_date->format('Y-m-d'),
                'end_date' => $event->end_date?->format('Y-m-d'),
                'color' => $event->color,
            ]);

        return Inertia::render('calendar/index', [
            'categories' => array_map(
                fn (EventCategory $item): array => ['label' => $item->label(), 'value' => $item->value],
                EventCategory::cases(),
            ),
            'events' => $events,
            'filters' => ['category' => $category],
            'month' => $month->format('Y-m'),
        ]);
    }

    private function month(string $value): CarbonImmutable
    {
        try {
            return CarbonImmutable::createFromFormat('!Y-m', $value)->startOfMonth();
        } catch (Throwable) {
            return CarbonImmutable::today()->startOfMonth();
        }
    }
}
