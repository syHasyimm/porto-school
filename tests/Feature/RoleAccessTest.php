<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('redirects guests to login from protected dashboards', function (string $routeName) {
    $this->get(route($routeName))->assertRedirectToRoute('login');
})->with([
    'dashboard redirect' => 'dashboard',
    'admin dashboard' => 'admin.dashboard',
    'guru dashboard' => 'guru.dashboard',
]);

it('redirects authenticated users to the dashboard for their role', function (string $state, string $routeName) {
    $user = User::factory()->{$state}()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirectToRoute($routeName);
})->with([
    'admin' => ['admin', 'admin.dashboard'],
    'guru' => ['guru', 'guru.dashboard'],
]);

it('allows admin users to open only the admin dashboard', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('auth.user.role', 'admin'));

    $this->actingAs($admin)
        ->get(route('guru.dashboard'))
        ->assertForbidden();
});

it('allows guru users to open only the guru dashboard', function () {
    $guru = User::factory()->guru()->create();

    $this->actingAs($guru)
        ->get(route('guru.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('guru/dashboard')
            ->where('auth.user.role', 'guru'));

    $this->actingAs($guru)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});
