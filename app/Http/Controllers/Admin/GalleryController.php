<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGalleryRequest;
use App\Http\Requests\Admin\UpdateGalleryRequest;
use App\Models\Gallery;
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

class GalleryController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Gallery::class);
        $search = $request->string('search')->trim()->toString();
        $category = $request->string('category')->trim()->toString();

        $items = Gallery::query()
            ->when($search !== '', fn (Builder $query) => $query->where('title', 'like', "%{$search}%"))
            ->when($category !== '', fn (Builder $query) => $query->where('category', $category))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Gallery $gallery): array => $this->galleryData($gallery));

        return Inertia::render('admin/gallery/index', [
            'categories' => $this->categories(),
            'filters' => compact('search', 'category'),
            'items' => $items,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Gallery::class);

        return Inertia::render('admin/gallery/create', ['categories' => $this->categories()]);
    }

    public function store(StoreGalleryRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        $imagePath = $this->storeImage($request->file('image'));

        try {
            Gallery::query()->create([
                ...$request->safe()->except('image'),
                'image_path' => $imagePath,
                'created_by' => $user->id,
            ]);
        } catch (Throwable $throwable) {
            Storage::disk('public')->delete($imagePath);

            throw $throwable;
        }

        return to_route('admin.gallery.index')->with('success', 'Foto galeri berhasil ditambahkan.');
    }

    public function edit(Gallery $gallery): Response
    {
        Gate::authorize('update', $gallery);

        return Inertia::render('admin/gallery/edit', [
            'categories' => $this->categories(),
            'item' => $this->galleryData($gallery),
        ]);
    }

    public function update(UpdateGalleryRequest $request, Gallery $gallery): RedirectResponse
    {
        Gate::authorize('update', $gallery);
        $oldImagePath = $gallery->image_path;
        $uploadedImage = $request->file('image');
        $newImagePath = $uploadedImage instanceof UploadedFile
            ? $this->storeImage($uploadedImage)
            : null;

        try {
            $gallery->update([
                ...$request->safe()->except('image'),
                'image_path' => $newImagePath ?? $oldImagePath,
            ]);
        } catch (Throwable $throwable) {
            if (is_string($newImagePath)) {
                Storage::disk('public')->delete($newImagePath);
            }

            throw $throwable;
        }

        if (is_string($newImagePath)) {
            Storage::disk('public')->delete($oldImagePath);
        }

        return to_route('admin.gallery.index')->with('success', 'Foto galeri berhasil diperbarui.');
    }

    public function destroy(Gallery $gallery): RedirectResponse
    {
        Gate::authorize('delete', $gallery);
        $imagePath = $gallery->image_path;
        $gallery->delete();
        Storage::disk('public')->delete($imagePath);

        return to_route('admin.gallery.index')->with('success', 'Foto galeri berhasil dihapus.');
    }

    private function storeImage(?UploadedFile $image): string
    {
        abort_unless($image instanceof UploadedFile, 422);
        $path = $image->store('galleries', 'public');
        abort_unless(is_string($path), 500, 'Gambar gagal disimpan.');

        return $path;
    }

    /** @return array<int, string> */
    private function categories(): array
    {
        return Gallery::query()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->orderBy('category')
            ->distinct()
            ->pluck('category')
            ->filter(fn (mixed $category): bool => is_string($category))
            ->values()
            ->all();
    }

    /** @return array<string, mixed> */
    private function galleryData(Gallery $gallery): array
    {
        return [
            'id' => $gallery->id,
            'title' => $gallery->title,
            'category' => $gallery->category,
            'image_url' => Storage::disk('public')->url($gallery->image_path),
            'created_at' => $gallery->created_at?->toISOString(),
        ];
    }
}
