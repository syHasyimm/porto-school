<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the login page for guests', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('name', 'SD Negeri 001 Kepenuhan')
            ->where('auth.user', null));
});

it('authenticates a user with valid credentials', function () {
    $user = User::factory()->admin()->create([
        'password' => 'password',
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirectToRoute('dashboard');

    $this->assertAuthenticatedAs($user);
});

it('rejects invalid login credentials', function () {
    $user = User::factory()->guru()->create([
        'password' => 'password',
    ]);

    $this->from(route('login'))->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertRedirect(route('login'))
        ->assertInvalid([
            'email' => 'Email atau password tidak sesuai.',
        ]);

    $this->assertGuest();
});

it('rate limits repeated failed login attempts', function () {
    $user = User::factory()->guru()->create();

    foreach (range(1, 5) as $attempt) {
        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertInvalid(['email']);
    }

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertInvalid([
        'email' => 'Terlalu banyak percobaan login.',
    ]);
});

it('logs authenticated users out and invalidates their session', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->post(route('logout'))
        ->assertRedirectToRoute('home');

    $this->assertGuest();
});

it('does not expose public registration', function () {
    $this->get('/register')->assertNotFound();
});
