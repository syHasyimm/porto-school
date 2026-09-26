<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ComplaintCategory;
use App\Enums\ComplaintStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreComplaintResponseRequest;
use App\Http\Requests\Admin\UpdateComplaintStatusRequest;
use App\Models\Complaint;
use App\Models\ComplaintResponse;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ComplaintController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Complaint::class);
        $search = $request->string('search')->trim()->toString();
        $status = $this->validStatus($request->string('status')->toString());
        $category = $this->validCategory($request->string('category')->toString());

        $complaints = Complaint::query()
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('reference_number', 'like', "%{$search}%")
                        ->orWhere('reporter_name', 'like', "%{$search}%")
                        ->orWhere('student_name', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', fn (Builder $query) => $query->where('status', $status))
            ->when($category !== '', fn (Builder $query) => $query->where('category', $category))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Complaint $complaint): array => $this->summaryData($complaint));

        return Inertia::render('admin/complaints/index', [
            'categories' => $this->categories(),
            'complaints' => $complaints,
            'filters' => compact('search', 'status', 'category'),
            'statuses' => $this->statuses(),
        ]);
    }

    public function show(Complaint $complaint): Response
    {
        Gate::authorize('view', $complaint);
        $complaint->load('responses.responder');

        return Inertia::render('admin/complaints/show', [
            'complaint' => $this->detailData($complaint),
            'statuses' => $this->statuses(),
        ]);
    }

    public function updateStatus(
        UpdateComplaintStatusRequest $request,
        Complaint $complaint,
    ): RedirectResponse {
        Gate::authorize('update', $complaint);
        $complaint->update($request->validated());

        return back()->with('success', 'Status pengaduan berhasil diperbarui.');
    }

    public function storeResponse(
        StoreComplaintResponseRequest $request,
        Complaint $complaint,
    ): RedirectResponse {
        Gate::authorize('update', $complaint);
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        DB::transaction(function () use ($complaint, $request, $user): void {
            $complaint->responses()->create([
                'user_id' => $user->id,
                'response' => $request->validated('response'),
            ]);

            if ($complaint->status === ComplaintStatus::Baru) {
                $complaint->update(['status' => ComplaintStatus::Diproses]);
            }
        });

        return back()->with('success', 'Tanggapan berhasil ditambahkan.');
    }

    public function downloadAttachment(Complaint $complaint): StreamedResponse
    {
        Gate::authorize('view', $complaint);
        abort_unless(is_string($complaint->attachment_path), 404);
        abort_unless(Storage::disk('local')->exists($complaint->attachment_path), 404);

        $extension = pathinfo($complaint->attachment_path, PATHINFO_EXTENSION);
        $fileName = 'lampiran-'.$complaint->reference_number.($extension !== '' ? ".{$extension}" : '');

        return Storage::disk('local')->download($complaint->attachment_path, $fileName);
    }

    public function destroy(Complaint $complaint): RedirectResponse
    {
        Gate::authorize('delete', $complaint);
        $attachmentPath = $complaint->attachment_path;
        $complaint->delete();

        if (is_string($attachmentPath)) {
            Storage::disk('local')->delete($attachmentPath);
        }

        return to_route('admin.complaints.index')->with('success', 'Pengaduan berhasil dihapus.');
    }

    /** @return array<int, array{label: string, value: string}> */
    private function categories(): array
    {
        return array_map(
            fn (ComplaintCategory $category): array => [
                'label' => $category->label(),
                'value' => $category->value,
            ],
            ComplaintCategory::cases(),
        );
    }

    /** @return array<int, array{label: string, value: string}> */
    private function statuses(): array
    {
        return array_map(
            fn (ComplaintStatus $status): array => [
                'label' => $status->label(),
                'value' => $status->value,
            ],
            ComplaintStatus::cases(),
        );
    }

    private function validCategory(string $value): string
    {
        return in_array($value, array_column(ComplaintCategory::cases(), 'value'), true) ? $value : '';
    }

    private function validStatus(string $value): string
    {
        return in_array($value, array_column(ComplaintStatus::cases(), 'value'), true) ? $value : '';
    }

    /** @return array<string, mixed> */
    private function summaryData(Complaint $complaint): array
    {
        return [
            'id' => $complaint->id,
            'reference_number' => $complaint->reference_number,
            'reporter_name' => $complaint->reporter_name,
            'student_name' => $complaint->student_name,
            'student_class' => $complaint->student_class,
            'category' => $complaint->category->value,
            'category_label' => $complaint->category->label(),
            'status' => $complaint->status->value,
            'status_label' => $complaint->status->label(),
            'created_at' => $complaint->created_at?->toISOString(),
        ];
    }

    /** @return array<string, mixed> */
    private function detailData(Complaint $complaint): array
    {
        return [
            ...$this->summaryData($complaint),
            'email' => $complaint->email,
            'phone' => $complaint->phone,
            'body' => $complaint->body,
            'has_attachment' => is_string($complaint->attachment_path),
            'responses' => $complaint->responses->map(
                fn (ComplaintResponse $response): array => [
                    'id' => $response->id,
                    'response' => $response->response,
                    'responder_name' => $response->user_id === null
                        ? 'Admin sekolah'
                        : $response->responder->name,
                    'created_at' => $response->created_at?->toISOString(),
                ],
            ),
        ];
    }
}
