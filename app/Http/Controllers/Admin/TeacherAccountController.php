<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherAccountRequest;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAccountController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', TeacherProfile::class);

        $search = $request->string('search')->trim()->toString();
        $accounts = User::query()
            ->where('role', Role::Guru)
            ->with('teacherProfile:id,user_id,subject')
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $teacher): array => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'created_at' => $teacher->created_at?->toISOString(),
                'subject' => $teacher->teacherProfile?->subject,
                'has_profile' => $teacher->teacherProfile !== null,
            ]);

        return Inertia::render('admin/users/index', [
            'accounts' => $accounts,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(StoreTeacherAccountRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated): void {
            $teacher = User::query()->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => Role::Guru,
            ]);

            $teacher->teacherProfile()->create([]);
        });

        return to_route('admin.users.index')
            ->with('success', 'Akun pengguna guru berhasil ditambahkan. Guru dapat masuk menggunakan email dan password yang telah dibuat.');
    }
}
