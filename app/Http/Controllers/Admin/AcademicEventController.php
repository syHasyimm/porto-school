<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EventCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAcademicEventRequest;
use App\Http\Requests\Admin\UpdateAcademicEventRequest;
use App\Models\AcademicEvent;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AcademicEventController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', AcademicEvent::class);
        $search = $request->string('search')->trim()->toString();
        $category = $this->validCategory($request->string('category')->toString());
        $month = $this->month($request->query('month'));
        $calendarStart = $month->startOfWeek(CarbonInterface::MONDAY);
        $calendarEnd = $month->endOfMonth()->endOfWeek(CarbonInterface::SUNDAY);

        $events = AcademicEvent::query()
            ->whereDate('start_date', '<=', $calendarEnd)
            ->where(function (Builder $query) use ($calendarStart): void {
                $query->whereDate('start_date', '>=', $calendarStart)
                    ->orWhereDate('end_date', '>=', $calendarStart);
            })
            ->when($search !== '', fn (Builder $query) => $query->where('title', 'like', "%{$search}%"))
            ->when($category !== '', fn (Builder $query) => $query->where('category', $category))
            ->orderBy('start_date')
            ->orderBy('id')
            ->get()
            ->map(fn (AcademicEvent $event): array => $this->eventData($event));

        return Inertia::render('admin/calendar/index', [
            'categories' => $this->categories(),
            'events' => $events,
            'filters' => ['search' => $search, 'category' => $category],
            'month' => $month->format('Y-m'),
            'today' => CarbonImmutable::today()->format('Y-m-d'),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', AcademicEvent::class);

        return Inertia::render('admin/calendar/create', ['categories' => $this->categories()]);
    }

    public function store(StoreAcademicEventRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        AcademicEvent::query()->create([...$request->validated(), 'created_by' => $user->id]);

        return to_route('admin.calendar.index', $this->calendarParameters($request))
            ->with('success', 'Agenda akademik berhasil ditambahkan.');
    }

    public function edit(Request $request, AcademicEvent $academicEvent): Response
    {
        Gate::authorize('update', $academicEvent);

        return Inertia::render('admin/calendar/edit', [
            'categories' => $this->categories(),
            'event' => $this->eventData($academicEvent),
            'calendarContext' => $this->calendarParameters($request),
        ]);
    }

    public function update(UpdateAcademicEventRequest $request, AcademicEvent $academicEvent): RedirectResponse
    {
        Gate::authorize('update', $academicEvent);
        $academicEvent->update($request->validated());

        return to_route('admin.calendar.index', $this->calendarParameters($request))
            ->with('success', 'Agenda akademik berhasil diperbarui.');
    }

    public function destroy(Request $request, AcademicEvent $academicEvent): RedirectResponse
    {
        Gate::authorize('delete', $academicEvent);
        $academicEvent->delete();

        return to_route('admin.calendar.index', $this->calendarParameters($request))
            ->with('success', 'Agenda akademik berhasil dihapus.');
    }

    private function month(mixed $value): CarbonImmutable
    {
        if (! is_string($value) || ! preg_match('/^[1-9][0-9]{3}-(0[1-9]|1[0-2])$/D', $value)) {
            return CarbonImmutable::today()->startOfMonth();
        }

        return CarbonImmutable::createFromFormat('!Y-m', $value)->startOfMonth();
    }

    /** @return array{month?: string, search?: string, category?: string} */
    private function calendarParameters(Request $request): array
    {
        $parameters = [];

        if ($request->query('month') !== null) {
            $parameters['month'] = $this->month($request->query('month'))->format('Y-m');
        }

        $search = $request->query('search');
        if (is_string($search) && trim($search) !== '') {
            $parameters['search'] = trim($search);
        }

        $category = $request->query('category');
        if (is_string($category) && $this->validCategory($category) !== '') {
            $parameters['category'] = $category;
        }

        return $parameters;
    }

    /** @return array<int, array{label: string, value: string}> */
    private function categories(): array
    {
        return array_map(
            fn (EventCategory $category): array => ['label' => $category->label(), 'value' => $category->value],
            EventCategory::cases(),
        );
    }

    private function validCategory(string $value): string
    {
        return in_array($value, array_column(EventCategory::cases(), 'value'), true) ? $value : '';
    }

    /** @return array<string, mixed> */
    private function eventData(AcademicEvent $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'category' => $event->category->value,
            'category_label' => $event->category->label(),
            'start_date' => $event->start_date->format('Y-m-d'),
            'end_date' => $event->end_date?->format('Y-m-d'),
            'color' => $event->color,
            'whatsapp_reminder_enabled' => $event->whatsapp_reminder_enabled,
            'is_cancelled' => $event->is_cancelled,
        ];
    }
}
