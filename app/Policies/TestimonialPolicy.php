<?php

namespace App\Policies;

use App\Models\Testimonial;
use App\Models\User;

class TestimonialPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Testimonial $testimonial): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Testimonial $testimonial): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Testimonial $testimonial): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Testimonial $testimonial): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, Testimonial $testimonial): bool
    {
        return $user->isAdmin();
    }
}
