<?php

use App\Enums\EventCategory;
use App\Models\AcademicEvent;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

it('lists and filters academic events for an admin', function () {
    $admin = User::factory()->admin()->create();
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Ujian Tengah Semester',
        'category' => EventCategory::Ujian,
        'start_date' => '2026-10-12',
    ]);
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Libur Semester',
        'category' => EventCategory::Libur,
        'start_date' => '2026-12-21',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.calendar.index', [
            'month' => '2026-10',
            'search' => 'Ujian',
            'category' => EventCategory::Ujian->value,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/calendar/index')
            ->where('filters.search', 'Ujian')
            ->where('filters.category', EventCategory::Ujian->value)
            ->where('month', '2026-10')
            ->has('events', 1)
            ->where('events.0.title', 'Ujian Tengah Semester'));
});

it('includes all agendas overlapping the visible calendar including neighboring months', function () {
    $admin = User::factory()->admin()->create();
    AcademicEvent::factory()->for($admin, 'creator')->createMany([
        ['title' => 'Agenda lintas bulan', 'start_date' => '2026-09-01', 'end_date' => '2026-11-03'],
        ['title' => 'Agenda akhir September', 'start_date' => '2026-09-29', 'end_date' => null],
        ['title' => 'Agenda awal Oktober', 'start_date' => '2026-10-01', 'end_date' => '2026-10-03'],
        ['title' => 'Agenda akhir Oktober', 'start_date' => '2026-10-31', 'end_date' => '2026-11-04'],
        ['title' => 'Agenda awal November', 'start_date' => '2026-11-01', 'end_date' => null],
        ['title' => 'Agenda sebelum kalender', 'start_date' => '2026-09-27', 'end_date' => null],
        ['title' => 'Agenda setelah kalender', 'start_date' => '2026-11-02', 'end_date' => null],
        ['title' => 'Agenda selesai sebelum kalender', 'start_date' => '2026-09-20', 'end_date' => '2026-09-27'],
    ]);

    $this->actingAs($admin)
        ->get(route('admin.calendar.index', ['month' => '2026-10']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/calendar/index')
            ->has('events', 5)
            ->where('events.0.title', 'Agenda lintas bulan')
            ->where('events.1.title', 'Agenda akhir September')
            ->where('events.2.title', 'Agenda awal Oktober')
            ->where('events.3.title', 'Agenda akhir Oktober')
            ->where('events.4.title', 'Agenda awal November'));
});

it('loads more than twelve agendas for the displayed calendar', function () {
    $admin = User::factory()->admin()->create();
    AcademicEvent::factory()->count(13)->for($admin, 'creator')->create([
        'start_date' => '2026-10-12',
        'end_date' => null,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.calendar.index', ['month' => '2026-10']))
        ->assertInertia(fn (Assert $page) => $page->has('events', 13));
});

it('uses the current school month when the requested month is absent or invalid', function (mixed $month) {
    $this->travelTo(CarbonImmutable::parse('2026-10-01 09:00:00'));
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.calendar.index', ['month' => $month]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('month', '2026-10')
            ->where('today', '2026-10-01'));

    $this->travelBack();
})->with([
    'missing month' => [null],
    'malformed month' => ['invalid'],
    'overflow month' => ['2026-13'],
    'zero month' => ['2026-00'],
    'unbounded year' => ['10000-01'],
    'array month' => [['2026-10']],
]);

it('preserves the displayed month and filters after adding an agenda', function () {
    $admin = User::factory()->admin()->create();
    $context = ['month' => '2030-08', 'search' => 'Rapat', 'category' => 'libur'];

    $this->actingAs($admin)
        ->post(route('admin.calendar.store', $context), [
            'title' => 'Rapat orang tua',
            'category' => EventCategory::Kegiatan->value,
            'start_date' => '2030-08-15',
            'end_date' => null,
            'color' => '#147D64',
        ])
        ->assertRedirectToRoute('admin.calendar.index', $context)
        ->assertSessionHas('success');

    $this->assertDatabaseHas('academic_events', [
        'title' => 'Rapat orang tua',
        'category' => EventCategory::Kegiatan->value,
        'created_by' => $admin->id,
    ]);
});

it('passes the calendar context to the agenda edit page', function () {
    $admin = User::factory()->admin()->create();
    $event = AcademicEvent::factory()->for($admin, 'creator')->create();
    $context = ['month' => '2030-08', 'search' => 'Rapat', 'category' => 'kegiatan'];

    $this->actingAs($admin)
        ->get(route('admin.calendar.edit', ['academicEvent' => $event, ...$context]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/calendar/edit')
            ->where('calendarContext', $context)
            ->where('event.id', $event->id));
});

it('returns to the displayed month after editing an agenda', function () {
    $admin = User::factory()->admin()->create();
    $event = AcademicEvent::factory()->for($admin, 'creator')->create();
    $context = ['month' => '2030-08', 'search' => 'Rapat', 'category' => 'kegiatan'];

    $this->actingAs($admin)
        ->put(route('admin.calendar.update', ['academicEvent' => $event, ...$context]), [
            'title' => 'Rapat wali siswa',
            'category' => EventCategory::Kegiatan->value,
            'start_date' => '2030-08-15',
            'end_date' => null,
            'color' => '#147D64',
        ])
        ->assertRedirectToRoute('admin.calendar.index', $context);

    expect($event->refresh()->title)->toBe('Rapat wali siswa');
});

it('returns to the displayed month after deleting an agenda', function () {
    $admin = User::factory()->admin()->create();
    $event = AcademicEvent::factory()->for($admin, 'creator')->create();
    $context = ['month' => '2030-08', 'search' => 'Rapat', 'category' => 'kegiatan'];

    $this->actingAs($admin)
        ->delete(route('admin.calendar.destroy', ['academicEvent' => $event, ...$context]))
        ->assertRedirectToRoute('admin.calendar.index', $context);

    $this->assertModelMissing($event);
});

it('creates an academic event with the authenticated admin as creator', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.calendar.store'), [
            'title' => 'Kemah Pramuka',
            'description' => 'Kegiatan bersama siswa kelas tinggi.',
            'category' => EventCategory::Kegiatan->value,
            'start_date' => '2026-11-06',
            'end_date' => '2026-11-08',
            'color' => '#147D64',
        ])
        ->assertRedirectToRoute('admin.calendar.index')
        ->assertSessionHas('success');

    $this->assertDatabaseHas('academic_events', [
        'title' => 'Kemah Pramuka',
        'category' => EventCategory::Kegiatan->value,
        'start_date' => '2026-11-06 00:00:00',
        'end_date' => '2026-11-08 00:00:00',
        'color' => '#147D64',
        'created_by' => $admin->id,
    ]);
});

it('validates the event category, color, and date range', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.calendar.store'), [
            'title' => 'Agenda Tidak Valid',
            'category' => 'rapat',
            'start_date' => '2026-11-10',
            'end_date' => '2026-11-09',
            'color' => 'hijau',
        ])
        ->assertInvalid(['category', 'end_date', 'color']);
});

it('updates an academic event', function () {
    $admin = User::factory()->admin()->create();
    $event = AcademicEvent::factory()->for($admin, 'creator')->create();

    $this->actingAs($admin)
        ->put(route('admin.calendar.update', $event), [
            'title' => 'Pengumuman Pembagian Rapor',
            'description' => null,
            'category' => EventCategory::Pengumuman->value,
            'start_date' => '2026-12-19',
            'end_date' => null,
            'color' => '#B96A2E',
        ])
        ->assertRedirectToRoute('admin.calendar.index');

    $event->refresh();

    expect($event->title)->toBe('Pengumuman Pembagian Rapor')
        ->and($event->category)->toBe(EventCategory::Pengumuman)
        ->and($event->end_date)->toBeNull();
});

it('deletes an academic event', function () {
    $admin = User::factory()->admin()->create();
    $event = AcademicEvent::factory()->for($admin, 'creator')->create();

    $this->actingAs($admin)
        ->delete(route('admin.calendar.destroy', $event))
        ->assertRedirectToRoute('admin.calendar.index');

    $this->assertDatabaseMissing('academic_events', ['id' => $event->id]);
});

it('prevents guru accounts from managing academic events', function () {
    $guru = User::factory()->guru()->create();

    $this->actingAs($guru)
        ->get(route('admin.calendar.index'))
        ->assertForbidden();
});
