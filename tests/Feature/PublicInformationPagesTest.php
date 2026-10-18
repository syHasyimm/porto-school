<?php

use App\Models\SiteSetting;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the school profile to guests with configured information', function () {
    SiteSetting::factory()->count(4)->sequence(
        ['key' => 'school_history', 'value' => 'Sekolah berdiri bersama masyarakat.'],
        ['key' => 'school_vision', 'value' => 'Berkarakter dan berprestasi.'],
        ['key' => 'school_mission', 'value' => "Belajar bersama.\nMengembangkan bakat."],
        ['key' => 'school_facilities', 'value' => "Perpustakaan\nLapangan"],
    )->create();

    $this->get(route('profile'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('profile')
            ->where('auth.user', null)
            ->where('site.school_history', 'Sekolah berdiri bersama masyarakat.')
            ->where('site.school_vision', 'Berkarakter dan berprestasi.')
            ->where('site.school_mission', "Belajar bersama.\nMengembangkan bakat.")
            ->where('site.school_facilities', "Perpustakaan\nLapangan"));
});

it('shows school contact details and location to guests', function () {
    SiteSetting::factory()->count(4)->sequence(
        ['key' => 'school_address', 'value' => 'Jalan Pendidikan 1'],
        ['key' => 'school_phone', 'value' => '081234567890'],
        ['key' => 'school_email', 'value' => 'sekolah@example.com'],
        ['key' => 'map_embed_url', 'value' => 'https://www.google.com/maps/embed?pb=school'],
    )->create();

    $this->get(route('contact'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contact')
            ->where('auth.user', null)
            ->where('site.school_address', 'Jalan Pendidikan 1')
            ->where('site.school_phone', '081234567890')
            ->where('site.school_email', 'sekolah@example.com')
            ->where('site.map_embed_url', 'https://www.google.com/maps/embed?pb=school'));
});

it('renders public information pages when school settings are empty', function (string $routeName, string $component) {
    $this->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->where('site.school_history', null)
            ->where('site.school_address', null));
})->with([
    'profile' => ['profile', 'profile'],
    'contact' => ['contact', 'contact'],
]);
