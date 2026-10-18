<?php

use App\Enums\WhatsAppDeliveryStatus;
use App\Jobs\SendWhatsAppDelivery;
use App\Models\AcademicEvent;
use App\Models\TeacherContact;
use App\Models\User;
use App\Models\WhatsAppDelivery;
use App\Models\WhatsAppSetting;
use Carbon\CarbonImmutable;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

it('creates and updates a normalized teacher contact without creating a login account', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.teacher-contacts.store'), [
        'name' => 'Ibu Sari', 'phone' => '+62 812-3456-789', 'is_active' => true, 'notifications_enabled' => true,
        'teacher_profile_id' => 999,
    ])->assertRedirectToRoute('admin.teacher-contacts.index');

    $contact = TeacherContact::query()->sole();
    expect($contact->phone)->toBe('628123456789');
    expect($contact->teacher_profile_id)->toBeNull();
    $this->assertDatabaseCount('users', 1);
    $this->actingAs($admin)->put(route('admin.teacher-contacts.update', $contact), [
        'name' => 'Sari Baru', 'phone' => '08123456789', 'is_active' => false, 'notifications_enabled' => false,
    ])->assertRedirectToRoute('admin.teacher-contacts.index');
    $this->assertDatabaseHas('teacher_contacts', ['id' => $contact->id, 'name' => 'Sari Baru', 'is_active' => false, 'notifications_enabled' => false]);
});

it('requires a valid phone when notifications are enabled and rejects multiple recipients in one contact', function (mixed $phone) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.teacher-contacts.store'), [
        'name' => 'Guru', 'phone' => $phone, 'is_active' => true, 'notifications_enabled' => true,
    ])->assertInvalid(['phone']);

    $this->assertDatabaseCount('teacher_contacts', 0);
})->with(['missing' => null, 'letters' => 'bukan-nomor', 'short' => '0812', 'landline' => '0212345678', 'multiple' => '08123456789,08987654321', 'array' => [['08123456789']]]);

it('allows a contact without a phone when notifications are disabled', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.teacher-contacts.store'), [
        'name' => 'Guru', 'phone' => null, 'is_active' => true, 'notifications_enabled' => false,
    ])->assertRedirectToRoute('admin.teacher-contacts.index');

    $this->assertDatabaseHas('teacher_contacts', ['name' => 'Guru', 'phone' => null, 'notifications_enabled' => false]);
});

it('shows searchable contacts and renders create and edit forms', function () {
    $admin = User::factory()->admin()->create();
    $contact = TeacherContact::factory()->create(['name' => 'Sari']);
    TeacherContact::factory()->create(['name' => 'Budi']);

    $this->actingAs($admin)->get(route('admin.teacher-contacts.index', ['search' => 'Sari']))
        ->assertInertia(fn (Assert $page) => $page->component('admin/teacher-contacts/index')->has('contacts.data', 1)->where('contacts.data.0.id', $contact->id));
    $this->get(route('admin.teacher-contacts.create'))->assertInertia(fn (Assert $page) => $page->component('admin/teacher-contacts/form')->where('contact', null));
    $this->get(route('admin.teacher-contacts.edit', $contact))->assertInertia(fn (Assert $page) => $page->component('admin/teacher-contacts/form')->where('contact.id', $contact->id));
});

it('preserves delivery history when deleting a contact and event', function () {
    $admin = User::factory()->admin()->create();
    $delivery = WhatsAppDelivery::factory()->create(['event_title' => 'Agenda lama', 'recipient_name' => 'Guru lama']);
    $contact = TeacherContact::query()->findOrFail($delivery->teacher_contact_id);

    $this->actingAs($admin)->delete(route('admin.teacher-contacts.destroy', $contact))->assertRedirectToRoute('admin.teacher-contacts.index');
    AcademicEvent::query()->findOrFail($delivery->academic_event_id)->delete();

    $this->assertModelMissing($contact);
    $this->assertModelExists($delivery);
    $this->get(route('admin.whatsapp.deliveries.index'))->assertInertia(fn (Assert $page) => $page->where('deliveries.data.0.event_title', 'Agenda lama')->where('deliveries.data.0.recipient_name', 'Guru lama'));
});

it('encrypts the replacement token and does not reveal it in page props or validation old input', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->put(route('admin.whatsapp.settings.update'), [
        'token' => 'secret-replacement-token', 'reminders_enabled' => true, 'send_time' => '08:15', 'timezone' => 'Asia/Jakarta', 'admin_phone' => '08123456789',
    ])->assertRedirectToRoute('admin.whatsapp.settings.edit');

    $raw = DB::table('whats_app_settings')->value('token');
    expect($raw)->not->toBe('secret-replacement-token');
    expect(Crypt::decryptString($raw))->toBe('secret-replacement-token');
    expect(WhatsAppSetting::current()->toArray())->not->toHaveKey('token');
    $this->get(route('admin.whatsapp.settings.edit'))->assertInertia(fn (Assert $page) => $page->component('admin/whatsapp/settings')
        ->missing('settings.token')->where('settings.token_configured', true)->where('settings.token_mask', '••••••••••••')->where('settings.send_time', '08:15'));
    $this->put(route('admin.whatsapp.settings.update'), ['token' => 'new-secret', 'send_time' => 'invalid'])->assertInvalid(['send_time']);
    expect(session()->getOldInput('token'))->toBeNull();
});

it('keeps the current token when the input is blank', function () {
    $admin = User::factory()->admin()->create();
    WhatsAppSetting::factory()->create(['token' => 'existing-token']);

    $this->actingAs($admin)->put(route('admin.whatsapp.settings.update'), [
        'token' => '', 'reminders_enabled' => true, 'send_time' => '09:30', 'timezone' => 'Asia/Makassar', 'admin_phone' => null,
    ])->assertRedirectToRoute('admin.whatsapp.settings.edit');

    expect(WhatsAppSetting::current()->token)->toBe('existing-token');
    expect(WhatsAppSetting::current()->timezone)->toBe('Asia/Makassar');
});

it('validates reminder settings without replacing the existing token', function (array $overrides, string $field) {
    $admin = User::factory()->admin()->create();
    WhatsAppSetting::factory()->create(['token' => 'existing-token']);

    $this->actingAs($admin)->put(route('admin.whatsapp.settings.update'), array_replace([
        'token' => '', 'reminders_enabled' => true, 'send_time' => '07:00', 'timezone' => 'Asia/Jakarta', 'admin_phone' => '08123456789',
    ], $overrides))->assertInvalid([$field]);

    expect(WhatsAppSetting::current()->token)->toBe('existing-token');
})->with([
    'invalid time' => [['send_time' => '25:60'], 'send_time'],
    'invalid timezone' => [['timezone' => 'WIB'], 'timezone'],
    'multiple tokens' => [['token' => 'token1,token2'], 'token'],
    'invalid phone' => [['admin_phone' => 'abc'], 'admin_phone'],
    'invalid toggle' => [['reminders_enabled' => 'maybe'], 'reminders_enabled'],
]);

it('requires a token before enabling automatic reminders', function () {
    $admin = User::factory()->admin()->create();
    config(['services.fonnte.token' => null]);

    $this->actingAs($admin)->put(route('admin.whatsapp.settings.update'), [
        'token' => '', 'reminders_enabled' => true, 'send_time' => '07:00', 'timezone' => 'Asia/Jakarta',
    ])->assertInvalid(['token' => 'Atur token Fonnte sebelum mengaktifkan pengingat.']);

    expect(WhatsAppSetting::current()->reminders_enabled)->toBeFalse();
});

it('queues an admin test even when automatic reminders are off and records its result', function () {
    $this->travelTo(CarbonImmutable::parse('2026-10-08 06:00:00 Asia/Jakarta'));
    $admin = User::factory()->admin()->create();
    WhatsAppSetting::factory()->create(['reminders_enabled' => false]);
    Http::preventStrayRequests();
    Http::fake(['https://api.fonnte.com/send' => Http::response(['status' => true, 'id' => ['test123']])]);

    $this->actingAs($admin)->post(route('admin.whatsapp.test'))->assertRedirectToRoute('admin.whatsapp.deliveries.index');

    $delivery = WhatsAppDelivery::query()->sole();
    expect($delivery->kind)->toBe('test');
    expect($delivery->academic_event_id)->toBeNull();
    expect($delivery->status)->toBe(WhatsAppDeliveryStatus::Accepted);
    Http::assertSentCount(1);
    Http::assertSent(fn (Request $request): bool => $request['target'] === '628123456789' && str_contains($request['message'], 'Pesan tes WhatsApp'));
});

it('rejects an admin test without saved credentials or a valid admin number', function () {
    $admin = User::factory()->admin()->create();
    config(['services.fonnte.token' => null]);
    Queue::fake([SendWhatsAppDelivery::class]);

    $this->actingAs($admin)->post(route('admin.whatsapp.test'))->assertInvalid(['admin_phone']);

    Queue::assertNothingPushed();
    $this->assertDatabaseCount('whats_app_deliveries', 0);
});

it('only permits retries for failed and still eligible reminders from today', function (string $status, bool $today, bool $allowed) {
    $this->travelTo(CarbonImmutable::parse('2026-10-08 08:00:00 Asia/Jakarta'));
    WhatsAppSetting::factory()->create();
    $admin = User::factory()->admin()->create();
    $delivery = WhatsAppDelivery::factory()->create(['status' => $status, 'reminder_date' => $today ? '2026-10-08' : '2026-10-07']);
    Queue::fake([SendWhatsAppDelivery::class]);

    $response = $this->actingAs($admin)->post(route('admin.whatsapp.deliveries.retry', $delivery));

    if ($allowed) {
        $response->assertSessionHas('success');
        Queue::assertPushed(SendWhatsAppDelivery::class, 1);
        expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::Pending);
    } else {
        $response->assertInvalid(['delivery']);
        Queue::assertNothingPushed();
        expect($delivery->refresh()->status->value)->toBe($status);
    }
})->with([
    'failed today' => ['failed', true, true],
    'failed yesterday' => ['failed', false, false],
    'uncertain today' => ['needs_review', true, false],
    'accepted today' => ['accepted', true, false],
    'already queued' => ['pending', true, false],
]);

it('filters delivery history and exposes provider acceptance rather than delivery status', function () {
    $admin = User::factory()->admin()->create();
    WhatsAppDelivery::factory()->create(['event_title' => 'Agenda A', 'status' => 'accepted']);
    WhatsAppDelivery::factory()->create(['event_title' => 'Agenda B', 'status' => 'failed']);

    $this->actingAs($admin)->get(route('admin.whatsapp.deliveries.index', ['status' => 'accepted', 'search' => 'Agenda A']))
        ->assertInertia(fn (Assert $page) => $page->component('admin/whatsapp/history')->has('deliveries.data', 1)
            ->where('deliveries.data.0.status_label', 'Diterima Fonnte')->where('deliveries.data.0.can_retry', false)->missing('deliveries.data.0.delivered_at'));
});

it('saves agenda reminder and cancellation options in the existing calendar', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.calendar.store'), [
        'title' => 'Rapat guru', 'category' => 'kegiatan', 'start_date' => '2026-10-08', 'color' => '#147D64',
        'whatsapp_reminder_enabled' => true, 'is_cancelled' => true,
    ])->assertRedirectToRoute('admin.calendar.index');

    $this->assertDatabaseHas('academic_events', ['title' => 'Rapat guru', 'whatsapp_reminder_enabled' => true, 'is_cancelled' => true]);
});

it('requires guests to log in before accessing WhatsApp administration', function () {
    $this->get(route('admin.teacher-contacts.index'))->assertRedirectToRoute('login');
    $this->get(route('admin.whatsapp.settings.edit'))->assertRedirectToRoute('login');
    $this->get(route('admin.whatsapp.deliveries.index'))->assertRedirectToRoute('login');
    $this->post(route('admin.whatsapp.test'))->assertRedirectToRoute('login');
});

it('forbids guru accounts from viewing or changing WhatsApp administration', function () {
    $teacher = User::factory()->guru()->create();
    $contact = TeacherContact::factory()->create();
    $delivery = WhatsAppDelivery::factory()->create();
    Queue::fake([SendWhatsAppDelivery::class]);

    $this->actingAs($teacher)->get(route('admin.teacher-contacts.index'))->assertForbidden();
    $this->post(route('admin.teacher-contacts.store'), [])->assertForbidden();
    $this->put(route('admin.teacher-contacts.update', $contact), [])->assertForbidden();
    $this->delete(route('admin.teacher-contacts.destroy', $contact))->assertForbidden();
    $this->get(route('admin.whatsapp.settings.edit'))->assertForbidden();
    $this->put(route('admin.whatsapp.settings.update'), [])->assertForbidden();
    $this->post(route('admin.whatsapp.test'))->assertForbidden();
    $this->get(route('admin.whatsapp.deliveries.index'))->assertForbidden();
    $this->post(route('admin.whatsapp.deliveries.retry', $delivery))->assertForbidden();

    Queue::assertNothingPushed();
    $this->assertModelExists($contact);
    $this->assertDatabaseCount('whats_app_settings', 0);
});
