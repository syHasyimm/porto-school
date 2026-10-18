<?php

namespace App\Policies;

use App\Models\TeacherContact;
use App\Models\User;

class TeacherContactPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, TeacherContact $teacherContact): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, TeacherContact $teacherContact): bool
    {
        return $user->isAdmin();
    }
}
