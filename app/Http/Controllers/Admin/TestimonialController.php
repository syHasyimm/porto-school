<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTestimonialRequest;
use App\Http\Requests\Admin\UpdateTestimonialRequest;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TestimonialController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Testimonial::class);
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $items = Testimonial::query()
            ->when($search !== '', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"))
            ->when(in_array($status, ['published', 'draft'], true), fn (Builder $query) => $query->where('is_published', $status === 'published'))
            ->orderBy('sort_order')
            ->latest('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Testimonial $testimonial): array => $this->testimonialData($testimonial));

        return Inertia::render('admin/testimonials/index', [
            'items' => $items,
            'filters' => compact('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Testimonial::class);

        return Inertia::render('admin/testimonials/create');
    }

    public function store(StoreTestimonialRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        $photoPath = $this->storePhoto($request->file('photo'));

        try {
            Testimonial::query()->create([
                ...$request->safe()->except('photo'),
                'photo_path' => $photoPath,
                'created_by' => $user->id,
            ]);
        } catch (Throwable $throwable) {
            if (is_string($photoPath)) {
                Storage::disk('public')->delete($photoPath);
            }

            throw $throwable;
        }

        return to_route('admin.testimonials.index')->with('success', 'Testimoni berhasil ditambahkan.');
    }

    public function edit(Testimonial $testimonial): Response
    {
        Gate::authorize('update', $testimonial);

        return Inertia::render('admin/testimonials/edit', ['item' => $this->testimonialData($testimonial)]);
    }

    public function update(UpdateTestimonialRequest $request, Testimonial $testimonial): RedirectResponse
    {
        Gate::authorize('update', $testimonial);
        $oldPhotoPath = $testimonial->photo_path;
        $newPhotoPath = $this->storePhoto($request->file('photo'));

        try {
            $testimonial->update([
                ...$request->safe()->except('photo'),
                'photo_path' => $newPhotoPath ?? $oldPhotoPath,
            ]);
        } catch (Throwable $throwable) {
            if (is_string($newPhotoPath)) {
                Storage::disk('public')->delete($newPhotoPath);
            }

            throw $throwable;
        }

        if (is_string($newPhotoPath) && is_string($oldPhotoPath)) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return to_route('admin.testimonials.index')->with('success', 'Testimoni berhasil diperbarui.');
    }

    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        Gate::authorize('delete', $testimonial);
        $photoPath = $testimonial->photo_path;
        $testimonial->delete();

        if (is_string($photoPath)) {
            Storage::disk('public')->delete($photoPath);
        }

        return to_route('admin.testimonials.index')->with('success', 'Testimoni berhasil dihapus.');
    }

    private function storePhoto(?UploadedFile $photo): ?string
    {
        if (! $photo instanceof UploadedFile) {
            return null;
        }

        $path = $photo->store('testimonials', 'public');
        abort_unless(is_string($path), 500, 'Foto gagal disimpan.');

        return $path;
    }

    /** @return array<string, mixed> */
    private function testimonialData(Testimonial $testimonial): array
    {
        return [
            'id' => $testimonial->id,
            'name' => $testimonial->name,
            'graduation_year' => $testimonial->graduation_year,
            'content' => $testimonial->content,
            'photo_url' => is_string($testimonial->photo_path)
                ? Storage::disk('public')->url($testimonial->photo_path)
                : null,
            'is_published' => $testimonial->is_published,
            'sort_order' => $testimonial->sort_order,
        ];
    }
}
