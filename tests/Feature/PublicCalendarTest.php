<?php

use App\Enums\EventCategory;
use App\Models\AcademicEvent;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows events occurring in or continuing into the selected month', function () {
    $admin = User::factory()->admin()->create();

    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Agenda Oktober',
        'start_date' => '2026-10-10',
        'end_date' => null,
    ]);
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Kegiatan Lintas Bulan',
        'start_date' => '2026-09-29',
        'end_date' => '2026-10-02',
    ]);
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Agenda September Selesai',
        'start_date' => '2026-09-10',
        'end_date' => '2026-09-12',
    ]);
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Agenda November',
        'start_date' => '2026-11-01',
        'end_date' => null,
    ]);

    $this->get(route('calendar.index', ['month' => '2026-10']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('calendar/index')
            ->where('month', '2026-10')
            ->has('events', 2)
            ->where('events.0.title', 'Kegiatan Lintas Bulan')
            ->where('events.1.title', 'Agenda Oktober')
            ->missing('events.0.created_by'));
});

it('filters the public calendar by category', function () {
    $admin = User::factory()->admin()->create();
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Penilaian Tengah Semester',
        'category' => EventCategory::Ujian,
        'start_date' => '2026-10-12',
    ]);
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Hari Libur Nasional',
        'category' => EventCategory::Libur,
        'start_date' => '2026-10-28',
    ]);

    $this->get(route('calendar.index', [
        'month' => '2026-10',
        'category' => EventCategory::Ujian->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.category', EventCategory::Ujian->value)
            ->has('events', 1)
            ->where('events.0.title', 'Penilaian Tengah Semester'));
});

it('falls back to the current month for an invalid month value', function () {
    $this->get(route('calendar.index', ['month' => 'tidak-valid']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('month', now()->format('Y-m')));
});
