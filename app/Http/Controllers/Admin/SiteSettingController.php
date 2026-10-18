<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSiteSettingsRequest;
use App\Models\SchoolHistory;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SiteSettingController extends Controller
{
    public function edit(): Response
    {
        Gate::authorize('viewAny', SiteSetting::class);
        $settings = SiteSetting::query()->pluck('value', 'key')->all();
        $mediaUrls = [];

        foreach (['logo', 'hero_image', 'headmaster_photo', 'profile_image'] as $media) {
            $path = $settings[$media.'_path'] ?? null;
            $mediaUrls[$media.'_url'] = is_string($path) && $path !== ''
                ? Storage::disk('public')->url($path)
                : null;
        }

        return Inertia::render('admin/settings/edit', [
            'settings' => [...$settings, ...$mediaUrls],
            'historyEntries' => SchoolHistory::query()->orderBy('sort_order')->orderBy('id')
                ->get()->map(fn (SchoolHistory $history): array => [
                    'id' => $history->id,
                    'period' => $history->period,
                    'title' => $history->title,
                    'description' => $history->description,
                    'photo_url' => $history->photo_path ? Storage::disk('public')->url($history->photo_path) : null,
                    'is_published' => $history->is_published,
                    'sort_order' => $history->sort_order,
                ]),
        ]);
    }

    public function update(UpdateSiteSettingsRequest $request): RedirectResponse
    {
        Gate::authorize('viewAny', SiteSetting::class);
        $mediaFields = ['logo', 'hero_image', 'headmaster_photo', 'profile_image'];
        $values = $request->safe()->except([...$mediaFields, 'remove_profile_image', 'history_editor', 'history_entries']);
        $currentPaths = SiteSetting::query()
            ->whereIn('key', array_map(fn (string $field): string => $field.'_path', $mediaFields))
            ->pluck('value', 'key')->all();
        $newPaths = [];
        $uploadedPaths = [];
        $obsoletePaths = [];
        $historyEntries = $request->validated('history_entries');

        try {
            foreach ($mediaFields as $field) {
                $file = $request->file($field);

                if ($file instanceof UploadedFile) {
                    $path = $file->store('site', 'public');
                    abort_unless(is_string($path), 500, 'Gambar gagal disimpan.');
                    $newPaths[$field.'_path'] = $path;
                    $uploadedPaths[] = $path;
                }
            }

            if ($request->boolean('remove_profile_image') && ! isset($newPaths['profile_image_path'])) {
                $newPaths['profile_image_path'] = null;
            }

            if (is_array($historyEntries)) {
                foreach ($historyEntries as $index => $entry) {
                    $file = $request->file('history_entries.'.$index.'.photo');

                    if ($file instanceof UploadedFile) {
                        $path = $file->store('school-history', 'public');
                        abort_unless(is_string($path), 500, 'Foto cerita gagal disimpan.');
                        $historyEntries[$index]['photo_path'] = $path;
                        $uploadedPaths[] = $path;
                    }
                }
            }

            DB::transaction(function () use ($values, $newPaths, $historyEntries, &$obsoletePaths): void {
                foreach ([...$values, ...$newPaths] as $key => $value) {
                    SiteSetting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
                }

                if (is_array($historyEntries)) {
                    $obsoletePaths = $this->syncHistory($historyEntries);
                }
            });
        } catch (Throwable $throwable) {
            Storage::disk('public')->delete($uploadedPaths);

            throw $throwable;
        }

        foreach ($newPaths as $key => $path) {
            $previousPath = $currentPaths[$key] ?? null;

            if (is_string($previousPath) && $previousPath !== '') {
                $obsoletePaths[] = $previousPath;
            }
        }

        Storage::disk('public')->delete($obsoletePaths);

        return back()->with('success', 'Pengaturan situs berhasil diperbarui.');
    }

    /**
     * @param  array<int, array{id?: int|null, period: string, title: string, description: string, is_published: bool|int|string, remove_photo?: bool|int|string, photo_path?: string, photo?: UploadedFile|null}>  $entries
     * @return list<string>
     */
    private function syncHistory(array $entries): array
    {
        $retainedIds = [];
        $obsoletePaths = [];

        foreach (array_values($entries) as $position => $entry) {
            $history = isset($entry['id'])
                ? SchoolHistory::query()->lockForUpdate()->findOrFail($entry['id'])
                : new SchoolHistory;
            $photoPath = $entry['photo_path'] ?? (! empty($entry['remove_photo']) ? null : $history->photo_path);

            if ($history->photo_path && $history->photo_path !== $photoPath) {
                $obsoletePaths[] = $history->photo_path;
            }

            $history->fill([
                'period' => $entry['period'],
                'title' => $entry['title'],
                'description' => $entry['description'],
                'photo_path' => $photoPath,
                'is_published' => $entry['is_published'],
                'sort_order' => $position,
            ])->save();
            $retainedIds[] = $history->id;
        }

        $removed = SchoolHistory::query()->whereNotIn('id', $retainedIds)->lockForUpdate()->get();

        foreach ($removed as $history) {
            if ($history->photo_path) {
                $obsoletePaths[] = $history->photo_path;
            }

            $history->delete();
        }

        return $obsoletePaths;
    }
}
