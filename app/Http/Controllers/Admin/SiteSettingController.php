<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSiteSettingsRequest;
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
        $logoPath = $settings['logo_path'] ?? null;

        return Inertia::render('admin/settings/edit', [
            'settings' => [
                ...$settings,
                'logo_url' => is_string($logoPath) && $logoPath !== ''
                    ? Storage::disk('public')->url($logoPath)
                    : null,
            ],
        ]);
    }

    public function update(UpdateSiteSettingsRequest $request): RedirectResponse
    {
        Gate::authorize('viewAny', SiteSetting::class);
        $values = $request->safe()->except('logo');
        $currentLogoPath = SiteSetting::query()->where('key', 'logo_path')->value('value');
        $logo = $request->file('logo');
        $newLogoPath = null;

        if ($logo instanceof UploadedFile) {
            $newLogoPath = $logo->store('site', 'public');
            abort_unless(is_string($newLogoPath), 500, 'Logo gagal disimpan.');
        }

        try {
            DB::transaction(function () use ($values, $newLogoPath): void {
                foreach ($values as $key => $value) {
                    SiteSetting::query()->updateOrCreate(
                        ['key' => $key],
                        ['value' => $value],
                    );
                }

                if (is_string($newLogoPath)) {
                    SiteSetting::query()->updateOrCreate(
                        ['key' => 'logo_path'],
                        ['value' => $newLogoPath],
                    );
                }
            });
        } catch (Throwable $throwable) {
            if (is_string($newLogoPath)) {
                Storage::disk('public')->delete($newLogoPath);
            }

            throw $throwable;
        }

        if (is_string($newLogoPath) && is_string($currentLogoPath)) {
            Storage::disk('public')->delete($currentLogoPath);
        }

        return back()->with('success', 'Pengaturan situs berhasil diperbarui.');
    }
}
