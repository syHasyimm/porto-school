<?php

use App\Enums\ComplaintStatus;
use App\Enums\Role;
use App\Models\Complaint;
use App\Models\User;

it('seeds the school identity and development accounts', function () {
    $this->seed();

    $this->assertDatabaseHas('site_settings', [
        'key' => 'school_name',
        'value' => 'SD Negeri 001 Kepenuhan',
    ]);
    $this->assertDatabaseHas('users', [
        'email' => 'admin@sdn001kepenuhan.sch.id',
        'role' => Role::Admin->value,
    ]);
    $this->assertDatabaseHas('teacher_profiles', [
        'nip' => '198704122010012001',
        'subject' => 'Guru Kelas I',
    ]);

    $teacher = User::query()
        ->where('email', 'siti.rahmawati@sdn001kepenuhan.sch.id')
        ->firstOrFail();
    $complaint = Complaint::query()
        ->where('reference_number', 'PGD-DEMO-FAS001')
        ->firstOrFail();

    expect($teacher->role)->toBe(Role::Guru)
        ->and($teacher->teacherProfile)->not->toBeNull()
        ->and($complaint->status)->toBe(ComplaintStatus::Diproses)
        ->and($complaint->responses)->toHaveCount(1);
});

it('can run the seed data repeatedly without duplicates', function () {
    $this->seed();
    $this->seed();

    expect(User::query()->count())->toBe(3)
        ->and(User::query()->where('role', Role::Admin->value)->count())->toBe(1)
        ->and(User::query()->where('role', Role::Guru->value)->count())->toBe(2);

    $this->assertDatabaseCount('teacher_profiles', 2);
    $this->assertDatabaseCount('academic_events', 3);
    $this->assertDatabaseCount('complaints', 2);
    $this->assertDatabaseCount('complaint_responses', 1);
    $this->assertDatabaseCount('news', 2);
    $this->assertDatabaseCount('galleries', 2);
    $this->assertDatabaseCount('site_settings', 16);
});
