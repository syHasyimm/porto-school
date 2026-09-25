<?php

use App\Models\AcademicEvent;
use App\Models\Complaint;
use App\Models\Gallery;
use App\Models\News;
use App\Models\SiteSetting;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

it('allows a guru to view and update only their own profile', function () {
    $owner = User::factory()->guru()->create();
    $otherGuru = User::factory()->guru()->create();
    $profile = TeacherProfile::factory()->for($owner)->create();

    expect(Gate::forUser($owner)->allows('view', $profile))->toBeTrue()
        ->and(Gate::forUser($owner)->allows('update', $profile))->toBeTrue()
        ->and(Gate::forUser($owner)->allows('delete', $profile))->toBeFalse()
        ->and(Gate::forUser($otherGuru)->allows('view', $profile))->toBeFalse()
        ->and(Gate::forUser($otherGuru)->allows('update', $profile))->toBeFalse()
        ->and(Gate::forUser($otherGuru)->allows('create', TeacherProfile::class))->toBeFalse();
});

it('allows admin users to manage every teacher profile', function () {
    $admin = User::factory()->admin()->create();
    $profile = TeacherProfile::factory()->create();

    foreach (['view', 'update', 'delete', 'restore', 'forceDelete'] as $ability) {
        expect(Gate::forUser($admin)->allows($ability, $profile))->toBeTrue();
    }

    expect(Gate::forUser($admin)->allows('viewAny', TeacherProfile::class))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('create', TeacherProfile::class))->toBeTrue();
});

it('reserves administrative resources for admin users', function () {
    $admin = User::factory()->admin()->create();
    $guru = User::factory()->guru()->create();

    $models = [
        Complaint::factory()->create(),
        AcademicEvent::factory()->create(['created_by' => $admin->id]),
        News::factory()->create(['created_by' => $admin->id]),
        Gallery::factory()->create(['created_by' => $admin->id]),
        SiteSetting::factory()->create(),
    ];

    foreach ($models as $model) {
        foreach (['view', 'update', 'delete', 'restore', 'forceDelete'] as $ability) {
            expect(Gate::forUser($admin)->allows($ability, $model))->toBeTrue()
                ->and(Gate::forUser($guru)->allows($ability, $model))->toBeFalse();
        }

        expect(Gate::forUser($admin)->allows('viewAny', $model::class))->toBeTrue()
            ->and(Gate::forUser($admin)->allows('create', $model::class))->toBeTrue()
            ->and(Gate::forUser($guru)->allows('viewAny', $model::class))->toBeFalse()
            ->and(Gate::forUser($guru)->allows('create', $model::class))->toBeFalse();
    }
});
