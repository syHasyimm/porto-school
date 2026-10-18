<?php

namespace App\Http\Controllers;

use App\Models\SchoolHistory;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicProfileController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('profile', [
            'historyEntries' => SchoolHistory::query()
                ->where('is_published', true)
                ->orderBy('sort_order')->orderBy('id')
                ->get()->map(fn (SchoolHistory $history): array => [
                    'id' => $history->id,
                    'period' => $history->period,
                    'title' => $history->title,
                    'description' => $history->description,
                    'photo_url' => $history->photo_path ? Storage::disk('public')->url($history->photo_path) : null,
                ]),
        ]);
    }
}
