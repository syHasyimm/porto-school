<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveTeacherContactRequest;
use App\Models\TeacherContact;
use App\Support\WhatsAppNumber;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TeacherContactController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', TeacherContact::class);
        $search = $request->string('search')->trim()->toString();
        $contacts = TeacherContact::query()
            ->when($search !== '', fn (Builder $query) => $query->where(fn (Builder $query) => $query->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%")))
            ->orderBy('name')->orderBy('id')->paginate(15)->withQueryString()
            ->through(fn (TeacherContact $contact): array => $this->data($contact));

        return Inertia::render('admin/teacher-contacts/index', [
            'contacts' => $contacts, 'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', TeacherContact::class);

        return Inertia::render('admin/teacher-contacts/form', ['contact' => null]);
    }

    public function store(SaveTeacherContactRequest $request): RedirectResponse
    {
        TeacherContact::query()->create($request->validated());

        return to_route('admin.teacher-contacts.index')->with('success', 'Kontak guru berhasil ditambahkan.');
    }

    public function edit(TeacherContact $teacherContact): Response
    {
        Gate::authorize('update', $teacherContact);

        return Inertia::render('admin/teacher-contacts/form', ['contact' => $this->data($teacherContact)]);
    }

    public function update(SaveTeacherContactRequest $request, TeacherContact $teacherContact): RedirectResponse
    {
        Gate::authorize('update', $teacherContact);
        $teacherContact->update($request->validated());

        return to_route('admin.teacher-contacts.index')->with('success', 'Kontak guru berhasil diperbarui.');
    }

    public function destroy(TeacherContact $teacherContact): RedirectResponse
    {
        Gate::authorize('delete', $teacherContact);
        $teacherContact->delete();

        return to_route('admin.teacher-contacts.index')->with('success', 'Kontak guru berhasil dihapus.');
    }

    /** @return array<string, mixed> */
    private function data(TeacherContact $contact): array
    {
        return [
            'id' => $contact->id, 'name' => $contact->name, 'phone' => $contact->phone,
            'is_active' => $contact->is_active, 'notifications_enabled' => $contact->notifications_enabled,
            'phone_valid' => WhatsAppNumber::normalize($contact->phone) !== null,
        ];
    }
}
