<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherRequest;
use App\Http\Requests\Admin\UpdateTeacherRequest;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', TeacherProfile::class);

        $search = $request->string('search')->trim()->toString();

        $teachers = User::query()
            ->where('role', Role::Guru)
            ->with('teacherProfile')
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('teacherProfile', function (Builder $profileQuery) use ($search): void {
                            $profileQuery->where('nip', 'like', "%{$search}%")
                                ->orWhere('subject', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $teacher): array => $this->teacherData($teacher));

        return Inertia::render('admin/teachers/index', [
            'filters' => ['search' => $search],
            'teachers' => $teachers,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', TeacherProfile::class);

        return Inertia::render('admin/teachers/create');
    }

    public function store(StoreTeacherRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $photoPath = $this->storePhoto($request);

        try {
            DB::transaction(function () use ($validated, $photoPath): void {
                $teacher = User::query()->create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => $validated['password'],
                    'role' => Role::Guru,
                    'email_verified_at' => now(),
                ]);

                $teacher->teacherProfile()->create($this->profileData($validated, $photoPath));
            });
        } catch (Throwable $throwable) {
            if ($photoPath !== null) {
                Storage::disk('public')->delete($photoPath);
            }

            throw $throwable;
        }

        return to_route('admin.teachers.index')->with('success', 'Data guru berhasil ditambahkan.');
    }

    public function show(User $teacher): Response
    {
        $profile = $this->profileOrFail($teacher);
        Gate::authorize('view', $profile);

        return Inertia::render('admin/teachers/show', [
            'teacher' => $this->teacherData($teacher),
        ]);
    }

    public function edit(User $teacher): Response
    {
        $profile = $this->profileOrFail($teacher);
        Gate::authorize('update', $profile);

        return Inertia::render('admin/teachers/edit', [
            'teacher' => $this->teacherData($teacher),
        ]);
    }

    public function update(UpdateTeacherRequest $request, User $teacher): RedirectResponse
    {
        $profile = $this->profileOrFail($teacher);
        Gate::authorize('update', $profile);

        $validated = $request->validated();
        $newPhotoPath = $this->storePhoto($request);
        $oldPhotoPath = $profile->photo_path;

        try {
            DB::transaction(function () use ($teacher, $profile, $validated, $newPhotoPath): void {
                $account = [
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                ];

                if (filled($validated['password'] ?? null)) {
                    $account['password'] = $validated['password'];
                }

                $teacher->update($account);
                $profile->update($this->profileData($validated, $newPhotoPath));
            });
        } catch (Throwable $throwable) {
            if ($newPhotoPath !== null) {
                Storage::disk('public')->delete($newPhotoPath);
            }

            throw $throwable;
        }

        if ($newPhotoPath !== null && $oldPhotoPath !== null) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return to_route('admin.teachers.show', $teacher)->with('success', 'Data guru berhasil diperbarui.');
    }

    public function destroy(User $teacher): RedirectResponse
    {
        $profile = $this->profileOrFail($teacher);
        Gate::authorize('delete', $profile);

        $photoPath = $profile->photo_path;
        $teacher->delete();

        if ($photoPath !== null) {
            Storage::disk('public')->delete($photoPath);
        }

        return to_route('admin.teachers.index')->with('success', 'Data guru berhasil dihapus.');
    }

    private function profileOrFail(User $teacher): TeacherProfile
    {
        abort_unless($teacher->isGuru(), 404);

        $profile = $teacher->teacherProfile;
        abort_unless($profile instanceof TeacherProfile, 404);

        return $profile;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function profileData(array $validated, ?string $photoPath = null): array
    {
        $data = [
            'nip' => ($validated['nip'] ?? null) ?: null,
            'phone' => ($validated['phone'] ?? null) ?: null,
            'address' => ($validated['address'] ?? null) ?: null,
            'birth_date' => ($validated['birth_date'] ?? null) ?: null,
            'subject' => $validated['subject'],
            'bio' => ($validated['bio'] ?? null) ?: null,
        ];

        if ($photoPath !== null) {
            $data['photo_path'] = $photoPath;
        }

        return $data;
    }

    private function storePhoto(Request $request): ?string
    {
        $photo = $request->file('photo');

        if (! $photo instanceof UploadedFile) {
            return null;
        }

        $path = $photo->store('teachers', 'public');

        if ($path === false) {
            throw new RuntimeException('Foto guru tidak dapat disimpan.');
        }

        return $path;
    }

    /** @return array<string, mixed> */
    private function teacherData(User $teacher): array
    {
        $profile = $teacher->teacherProfile;

        return [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'email' => $teacher->email,
            'nip' => $profile?->nip,
            'phone' => $profile?->phone,
            'address' => $profile?->address,
            'birth_date' => $profile?->birth_date?->format('Y-m-d'),
            'subject' => $profile?->subject,
            'bio' => $profile?->bio,
            'photo_url' => $profile?->photo_path !== null
                ? Storage::disk('public')->url($profile->photo_path)
                : null,
        ];
    }
}
