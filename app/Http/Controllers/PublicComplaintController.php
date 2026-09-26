<?php

namespace App\Http\Controllers;

use App\Enums\ComplaintCategory;
use App\Enums\ComplaintStatus;
use App\Http\Requests\StoreComplaintRequest;
use App\Models\Complaint;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PublicComplaintController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('complaints/create', [
            'categories' => array_map(
                fn (ComplaintCategory $category): array => [
                    'label' => $category->label(),
                    'value' => $category->value,
                ],
                ComplaintCategory::cases(),
            ),
        ]);
    }

    public function store(StoreComplaintRequest $request): RedirectResponse
    {
        $validated = $request->safe()->except('attachment');
        $attachment = $request->file('attachment');
        $attachmentPath = null;

        if ($attachment instanceof UploadedFile) {
            $attachmentPath = $attachment->store('complaints', 'local');
            abort_unless(is_string($attachmentPath), 500, 'Lampiran gagal disimpan.');
        }

        try {
            $complaint = Complaint::query()->create([
                ...$validated,
                'reference_number' => $this->referenceNumber(),
                'attachment_path' => $attachmentPath,
                'status' => ComplaintStatus::Baru,
            ]);
        } catch (Throwable $throwable) {
            if (is_string($attachmentPath)) {
                Storage::disk('local')->delete($attachmentPath);
            }

            throw $throwable;
        }

        return to_route('complaints.success')
            ->with('complaint_reference', $complaint->reference_number);
    }

    public function success(): Response|RedirectResponse
    {
        $referenceNumber = session('complaint_reference');

        if (! is_string($referenceNumber) || $referenceNumber === '') {
            return to_route('complaints.create');
        }

        return Inertia::render('complaints/success', [
            'referenceNumber' => $referenceNumber,
        ]);
    }

    private function referenceNumber(): string
    {
        do {
            $referenceNumber = 'PGD-'.Str::upper(Str::random(12));
        } while (Complaint::query()->where('reference_number', $referenceNumber)->exists());

        return $referenceNumber;
    }
}
