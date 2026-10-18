<?php

use App\Models\AcademicEvent;
use App\Models\News;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows current agenda and newly published news to an admin', function () {
    $this->travelTo('2026-09-29 10:30:00');
    $admin = User::factory()->admin()->create();
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Agenda sedang berlangsung',
        'start_date' => '2026-09-27',
        'end_date' => '2026-09-30',
    ]);
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Rapat koordinasi hari ini',
        'start_date' => '2026-09-29',
        'end_date' => null,
    ]);
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Agenda sudah selesai',
        'start_date' => '2026-09-25',
        'end_date' => '2026-09-28',
    ]);
    AcademicEvent::factory()->for($admin, 'creator')->create([
        'title' => 'Penilaian tengah semester',
        'start_date' => '2026-10-06',
        'end_date' => null,
    ]);
    News::factory()->for($admin, 'author')->create([
        'title' => 'Berita pagi',
        'published_at' => '2026-09-29 08:15:00',
    ]);
    News::factory()->for($admin, 'author')->create([
        'title' => 'Pengumuman jadwal ujian',
        'published_at' => '2026-09-29 09:45:00',
    ]);
    News::factory()->for($admin, 'author')->create([
        'title' => 'Berita kemarin',
        'published_at' => '2026-09-28 16:00:00',
    ]);
    News::factory()->for($admin, 'author')->create([
        'title' => 'Berita draft',
        'published_at' => null,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('overview.today', '2026-09-29')
            ->has('overview.today_events', 2)
            ->where('overview.today_event_count', 2)
            ->where('overview.today_events.0.title', 'Agenda sedang berlangsung')
            ->where('overview.today_events.1.title', 'Rapat koordinasi hari ini')
            ->where('overview.next_event.title', 'Penilaian tengah semester')
            ->where('overview.news.count', 2)
            ->where('overview.news.latest.title', 'Pengumuman jadwal ujian')
            ->missing('overview.news.latest.content'));
});

it('shows empty reminders when no current agenda or newly published news exists', function () {
    $this->travelTo('2026-09-29 10:30:00');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('overview.today', '2026-09-29')
            ->has('overview.today_events', 0)
            ->where('overview.today_event_count', 0)
            ->where('overview.next_event', null)
            ->where('overview.news.count', 0)
            ->where('overview.news.latest', null));
});
