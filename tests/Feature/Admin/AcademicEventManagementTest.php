<?php

use App\Enums\EventCategory;
use App\Models\AcademicEvent;
use App\Models\User;
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
            'search' => 'Ujian',
            'category' => EventCategory::Ujian->value,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/calendar/index')
            ->where('filters.search', 'Ujian')
            ->where('filters.category', EventCategory::Ujian->value)
            ->has('events.data', 1)
            ->where('events.data.0.title', 'Ujian Tengah Semester'));
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
