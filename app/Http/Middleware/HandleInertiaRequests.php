<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = SiteSetting::query()->pluck('value', 'key')->all();
        $schoolName = $this->setting($settings, 'school_name', (string) config('app.name'));
        $logoPath = $this->setting($settings, 'logo_path');

        return [
            ...parent::share($request),
            'name' => $schoolName,
            'site' => [
                'school_name' => $schoolName,
                'school_address' => $this->setting($settings, 'school_address'),
                'school_phone' => $this->setting($settings, 'school_phone'),
                'school_email' => $this->setting($settings, 'school_email'),
                'school_description' => $this->setting($settings, 'school_description'),
                'school_history' => $this->setting($settings, 'school_history'),
                'school_vision' => $this->setting($settings, 'school_vision'),
                'school_mission' => $this->setting($settings, 'school_mission'),
                'school_facilities' => $this->setting($settings, 'school_facilities'),
                'school_extracurriculars' => $this->setting($settings, 'school_extracurriculars'),
                'headmaster_name' => $this->setting($settings, 'headmaster_name'),
                'npsn' => $this->setting($settings, 'npsn'),
                'facebook_url' => $this->setting($settings, 'facebook_url'),
                'instagram_url' => $this->setting($settings, 'instagram_url'),
                'map_embed_url' => $this->setting($settings, 'map_embed_url'),
                'logo_url' => is_string($logoPath) && $logoPath !== ''
                    ? Storage::disk('public')->url($logoPath)
                    : null,
            ],
            'flash' => [
                'success' => fn (): ?string => $request->session()->get('success'),
            ],
            'auth' => [
                'user' => function () use ($request): ?array {
                    $user = $request->user();

                    if (! $user instanceof User) {
                        return null;
                    }

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role->value,
                    ];
                },
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $settings
     */
    private function setting(array $settings, string $key, ?string $default = null): ?string
    {
        $value = $settings[$key] ?? $default;

        return is_string($value) ? $value : $default;
    }
}
