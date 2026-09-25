<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicTeacherController extends Controller
{
    public function __invoke(): Response
    {
        $teachers = User::query()
            ->where('role', Role::Guru)
            ->whereHas('teacherProfile')
            ->with('teacherProfile')
            ->orderBy('name')
            ->paginate(12)
            ->through(function (User $teacher): array {
                $profile = $teacher->teacherProfile;

                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'subject' => $profile?->subject,
                    'bio' => $profile?->bio,
                    'photo_url' => $profile?->photo_path !== null
                        ? Storage::disk('public')->url($profile->photo_path)
                        : null,
                ];
            });

        return Inertia::render('teachers/index', [
            'teachers' => $teachers,
        ]);
    }
}
