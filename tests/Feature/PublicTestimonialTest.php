<?php

use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('shows up to six published testimonials in display order and does not expose drafts or admin fields', function () {
    $admin = User::factory()->admin()->create();
    Testimonial::factory()->for($admin, 'author')->create(['name' => 'Draft private', 'sort_order' => 0]);
    $first = Testimonial::factory()->for($admin, 'author')->published()->create(['name' => 'Budi', 'sort_order' => 1, 'graduation_year' => 2018, 'photo_path' => 'testimonials/budi.jpg']);
    Testimonial::factory()->for($admin, 'author')->published()->count(6)->create(['sort_order' => 5]);

    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('welcome')
        ->has('featuredTestimonials', 6)->where('featuredTestimonials.0.id', $first->id)
        ->where('featuredTestimonials.0.name', 'Budi')->where('featuredTestimonials.0.graduation_year', 2018)
        ->where('featuredTestimonials.0.photo_url', Storage::disk('public')->url('testimonials/budi.jpg'))
        ->missing('featuredTestimonials.0.created_by')->missing('featuredTestimonials.0.photo_path')
        ->missing('featuredTestimonials.0.is_published')->where('showTestimonialExamples', false));
});

it('uses the latest added testimonial first when display order is equal and supports missing photos', function () {
    $admin = User::factory()->admin()->create();
    Testimonial::factory()->for($admin, 'author')->published()->create(['sort_order' => 0]);
    $latest = Testimonial::factory()->for($admin, 'author')->published()->create(['sort_order' => 0, 'photo_path' => null, 'graduation_year' => null]);
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->has('featuredTestimonials', 2)
        ->where('featuredTestimonials.0.id', $latest->id)->where('featuredTestimonials.0.photo_url', null)
        ->where('featuredTestimonials.0.graduation_year', null));
});

it('keeps example cards available only before testimonial management has any records', function () {
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->has('featuredTestimonials', 0)->where('showTestimonialExamples', true));
});

it('does not replace deliberately unpublished testimonials with examples', function () {
    Testimonial::factory()->create();
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->has('featuredTestimonials', 0)->where('showTestimonialExamples', false));
});

it('reserves testimonial policy permissions for admin users', function () {
    $admin = User::factory()->admin()->create();
    $guru = User::factory()->guru()->create();
    $item = Testimonial::factory()->for($admin, 'author')->create();
    foreach (['view', 'update', 'delete', 'restore', 'forceDelete'] as $ability) {
        expect(Gate::forUser($admin)->allows($ability, $item))->toBeTrue()
            ->and(Gate::forUser($guru)->allows($ability, $item))->toBeFalse();
    }
    foreach (['viewAny', 'create'] as $ability) {
        expect(Gate::forUser($admin)->allows($ability, Testimonial::class))->toBeTrue()
            ->and(Gate::forUser($guru)->allows($ability, Testimonial::class))->toBeFalse();
    }
});
