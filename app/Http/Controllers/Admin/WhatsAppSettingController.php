<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateWhatsAppSettingsRequest;
use App\Models\User;
use App\Models\WhatsAppDelivery;
use App\Models\WhatsAppSetting;
use App\Services\WhatsAppReminderService;
use App\Support\WhatsAppNumber;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppSettingController extends Controller
{
    public function edit(Request $request): Response
    {
        $this->authorizeAdmin($request);
        $settings = WhatsAppSetting::current();

        return Inertia::render('admin/whatsapp/settings', [
            'settings' => [
                'token_configured' => $settings->effectiveToken() !== null,
                'token_mask' => $settings->effectiveToken() !== null ? '••••••••••••' : null,
                'reminders_enabled' => $settings->reminders_enabled,
                'send_time' => $settings->send_time,
                'timezone' => $settings->timezone,
                'admin_phone' => $settings->admin_phone,
            ],
            'timezones' => \DateTimeZone::listIdentifiers(),
        ]);
    }

    public function update(UpdateWhatsAppSettingsRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if (! filled($validated['token'] ?? null)) {
            unset($validated['token']);
        }
        $settings = WhatsAppSetting::current();
        if ($request->boolean('reminders_enabled') && ! filled($validated['token'] ?? $settings->effectiveToken())) {
            throw ValidationException::withMessages(['token' => 'Atur token Fonnte sebelum mengaktifkan pengingat.']);
        }
        $settings->update($validated);

        return to_route('admin.whatsapp.settings.edit')->with('success', 'Pengaturan WhatsApp berhasil disimpan.');
    }

    public function test(Request $request, WhatsAppReminderService $reminders): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $settings = WhatsAppSetting::current();
        $phone = WhatsAppNumber::normalize($settings->admin_phone);
        if ($phone === null || $settings->effectiveToken() === null) {
            throw ValidationException::withMessages(['admin_phone' => 'Simpan token Fonnte dan nomor admin yang valid sebelum mengirim tes.']);
        }

        $delivery = WhatsAppDelivery::query()->create([
            'kind' => 'test',
            'event_title' => 'Tes koneksi WhatsApp',
            'recipient_name' => 'Admin',
            'phone' => $phone,
            'reminder_date' => CarbonImmutable::now($settings->timezone)->toDateString(),
            'timezone' => $settings->timezone,
            'message' => 'Pesan tes WhatsApp dari '.config('app.name').'. Integrasi Fonnte siap digunakan.',
            'status' => 'pending',
            'available_at' => now(),
        ]);
        $reminders->dispatch($delivery);

        return to_route('admin.whatsapp.deliveries.index')->with('success', 'Pesan tes diantrekan ke nomor admin. Lihat hasilnya di riwayat pengiriman.');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user() instanceof User && $request->user()->isAdmin(), 403);
    }
}
