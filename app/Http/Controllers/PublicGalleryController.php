<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicGalleryController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $category = $request->string('category')->trim()->toString();
        $categories = Gallery::query()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->orderBy('category')
            ->distinct()
            ->pluck('category')
            ->filter(fn (mixed $item): bool => is_string($item))
            ->values()
            ->all();

        if ($category !== '' && ! in_array($category, $categories, true)) {
            $category = '';
        }

        $items = Gallery::query()
            ->when($category !== '', fn (Builder $query) => $query->where('category', $category))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Gallery $gallery): array => [
                'id' => $gallery->id,
                'title' => $gallery->title,
                'category' => $gallery->category,
                'image_url' => Storage::disk('public')->url($gallery->image_path),
            ]);

        return Inertia::render('gallery/index', [
            'categories' => $categories,
            'filters' => ['category' => $category],
            'items' => $items,
        ]);
    }
}
