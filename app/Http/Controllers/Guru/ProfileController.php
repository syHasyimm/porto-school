<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\UpdateProfileRequest;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $this->authenticatedUser($request);
        $profile = $this->profileOrFail($user);
        Gate::authorize('view', $profile);

        return Inertia::render('guru/profile/edit', [
            'profile' => $this->profileData($user, $profile),
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $user = $this->authenticatedUser($request);
        $profile = $this->profileOrFail($user);
        Gate::authorize('update', $profile);

        $validated = $request->validated();
        $photo = $request->file('photo');
        $newPhotoPath = null;

        if ($photo instanceof UploadedFile) {
            $newPhotoPath = $photo->store('teachers', 'public');

            if ($newPhotoPath === false) {
                throw new RuntimeException('Foto profil tidak dapat disimpan.');
            }
        }

        $oldPhotoPath = $profile->photo_path;
        $data = [
            'nip' => ($validated['nip'] ?? null) ?: null,
            'phone' => ($validated['phone'] ?? null) ?: null,
            'address' => ($validated['address'] ?? null) ?: null,
            'birth_date' => ($validated['birth_date'] ?? null) ?: null,
            'subject' => $validated['subject'],
            'bio' => ($validated['bio'] ?? null) ?: null,
        ];

        if ($newPhotoPath !== null) {
            $data['photo_path'] = $newPhotoPath;
        }

        $profile->update($data);

        if ($newPhotoPath !== null && $oldPhotoPath !== null) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return to_route('guru.profile.edit')->with('success', 'Profil Anda berhasil diperbarui.');
    }

    private function authenticatedUser(Request $request): User
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        return $user;
    }

    private function profileOrFail(User $user): TeacherProfile
    {
        $profile = $user->teacherProfile;
        abort_unless($profile instanceof TeacherProfile, 404);

        return $profile;
    }

    /** @return array<string, mixed> */
    private function profileData(User $user, TeacherProfile $profile): array
    {
        return [
            'name' => $user->name,
            'email' => $user->email,
            'nip' => $profile->nip,
            'phone' => $profile->phone,
            'address' => $profile->address,
            'birth_date' => $profile->birth_date?->format('Y-m-d'),
            'subject' => $profile->subject,
            'bio' => $profile->bio,
            'photo_url' => $profile->photo_path !== null
                ? Storage::disk('public')->url($profile->photo_path)
                : null,
        ];
    }
}
