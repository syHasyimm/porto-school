<?php

use App\Enums\WhatsAppDeliveryStatus;
use App\Jobs\SendWhatsAppDelivery;
use App\Models\AcademicEvent;
use App\Models\SiteSetting;
use App\Models\TeacherContact;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Models\WhatsAppDelivery;
use App\Models\WhatsAppSetting;
use App\Services\WhatsAppReminderService;
use Carbon\CarbonImmutable;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;

function prepareReminders(string $time = '2026-10-08 07:01:00 Asia/Jakarta'): void
{
    test()->travelTo(CarbonImmutable::parse($time));
    WhatsAppSetting::factory()->create();
    Http::preventStrayRequests();
}

function reminderEvent(array $attributes = []): AcademicEvent
{
    return AcademicEvent::factory()->create([
        'title' => 'Rapat guru',
        'start_date' => '2026-10-08',
        'end_date' => null,
        'whatsapp_reminder_enabled' => true,
        ...$attributes,
    ]);
}

function sendReminder(WhatsAppDelivery $delivery): void
{
    app()->call([new SendWhatsAppDelivery($delivery->id), 'handle']);
}

it('queues one message per event and normalized phone for eligible contacts even after repeated scans', function () {
    prepareReminders();
    Queue::fake([SendWhatsAppDelivery::class]);
    $first = reminderEvent();
    reminderEvent(['title' => 'Rapat orang tua']);
    TeacherContact::factory()->receivingReminders()->create(['phone' => '08123456789']);
    TeacherContact::factory()->receivingReminders()->create(['phone' => '+62 812-3456-789']);
    TeacherContact::factory()->receivingReminders()->create(['is_active' => false]);
    TeacherContact::factory()->create();
    TeacherContact::factory()->receivingReminders()->create(['phone' => 'bukan nomor']);

    $this->artisan('whatsapp:remind')->assertSuccessful();
    $this->artisan('whatsapp:remind')->assertSuccessful();

    $this->assertDatabaseCount('whats_app_deliveries', 2);
    $this->assertDatabaseHas('whats_app_deliveries', ['academic_event_id' => $first->id, 'phone' => '628123456789', 'reminder_date' => '2026-10-08 00:00:00']);
    Queue::assertPushed(SendWhatsAppDelivery::class, 2);
    $slots = WhatsAppDelivery::query()->orderBy('id')->pluck('available_at');
    expect($slots[1]->diffInSeconds($slots[0], true))->toBe(10.0);
});

it('does not queue before the configured time or when reminders are disabled', function (string $time, bool $enabled) {
    prepareReminders($time);
    Queue::fake([SendWhatsAppDelivery::class]);
    WhatsAppSetting::current()->update(['reminders_enabled' => $enabled]);
    reminderEvent();
    TeacherContact::factory()->receivingReminders()->create();

    $this->artisan('whatsapp:remind')->assertSuccessful();

    $this->assertDatabaseCount('whats_app_deliveries', 0);
    Queue::assertNothingPushed();
})->with([
    'before send time' => ['2026-10-08 06:59:59 Asia/Jakarta', true],
    'disabled' => ['2026-10-08 09:00:00 Asia/Jakarta', false],
]);

it('uses the configured local date at the UTC and WIB day boundary', function () {
    prepareReminders('2026-10-07 17:01:00 UTC');
    Queue::fake([SendWhatsAppDelivery::class]);
    WhatsAppSetting::current()->update(['send_time' => '00:00']);
    $today = reminderEvent();
    reminderEvent(['start_date' => '2026-10-07']);
    reminderEvent(['start_date' => '2026-10-09']);
    TeacherContact::factory()->receivingReminders()->create();

    $this->artisan('whatsapp:remind')->assertSuccessful();

    $this->assertDatabaseCount('whats_app_deliveries', 1);
    $this->assertDatabaseHas('whats_app_deliveries', ['academic_event_id' => $today->id, 'reminder_date' => '2026-10-08 00:00:00']);
    Queue::assertPushed(SendWhatsAppDelivery::class, 1);
});

it('creates one reminder on every day in a multi-day range including its last day', function () {
    prepareReminders();
    Queue::fake([SendWhatsAppDelivery::class]);
    $event = reminderEvent(['end_date' => '2026-10-10']);
    TeacherContact::factory()->receivingReminders()->create();

    foreach (['08', '09', '10', '11'] as $day) {
        $this->travelTo(CarbonImmutable::parse("2026-10-{$day} 07:01:00 Asia/Jakarta"));
        $this->artisan('whatsapp:remind')->assertSuccessful();
    }

    $this->assertDatabaseCount('whats_app_deliveries', 3);
    $this->assertDatabaseHas('whats_app_deliveries', ['academic_event_id' => $event->id, 'reminder_date' => '2026-10-10 00:00:00']);
    Queue::assertPushed(SendWhatsAppDelivery::class, 3);
});

it('includes events added after the reminder hour without resending earlier events', function () {
    prepareReminders('2026-10-08 14:00:00 Asia/Jakarta');
    Queue::fake([SendWhatsAppDelivery::class]);
    TeacherContact::factory()->receivingReminders()->create();
    reminderEvent();
    $this->artisan('whatsapp:remind')->assertSuccessful();
    $late = reminderEvent(['title' => 'Rapat mendadak']);

    $this->artisan('whatsapp:remind')->assertSuccessful();

    $this->assertDatabaseCount('whats_app_deliveries', 2);
    $this->assertDatabaseHas('whats_app_deliveries', ['academic_event_id' => $late->id]);
    Queue::assertPushed(SendWhatsAppDelivery::class, 2);
});

it('does not create another reminder when an existing recipient changes their number', function () {
    prepareReminders();
    Queue::fake([SendWhatsAppDelivery::class]);
    reminderEvent();
    $contact = TeacherContact::factory()->receivingReminders()->create();
    $this->artisan('whatsapp:remind')->assertSuccessful();
    $contact->update(['phone' => '628987654321']);

    $this->artisan('whatsapp:remind')->assertSuccessful();

    $this->assertDatabaseCount('whats_app_deliveries', 1);
    Queue::assertPushed(SendWhatsAppDelivery::class, 1);
});

it('does not enqueue cancelled or disabled events', function () {
    prepareReminders();
    Queue::fake([SendWhatsAppDelivery::class]);
    reminderEvent(['is_cancelled' => true]);
    reminderEvent(['whatsapp_reminder_enabled' => false]);
    TeacherContact::factory()->receivingReminders()->create();

    $this->artisan('whatsapp:remind')->assertSuccessful();

    Queue::assertNothingPushed();
    $this->assertDatabaseCount('whats_app_deliveries', 0);
});

it('sends the latest event text and token once and records Fonnte acceptance without claiming delivery', function () {
    prepareReminders();
    Http::fake(['https://api.fonnte.com/send' => Http::response(['status' => true, 'process' => 'pending', 'id' => ['abc123'], 'requestid' => 42])]);
    $delivery = WhatsAppDelivery::factory()->create();
    AcademicEvent::query()->findOrFail($delivery->academic_event_id)->update(['title' => 'Rapat baru', 'description' => 'Ruang guru', 'end_date' => '2026-10-10']);
    TeacherContact::query()->findOrFail($delivery->teacher_contact_id)->update(['name' => 'Ibu Sari']);
    WhatsAppSetting::current()->update(['token' => 'replacement-token']);
    SiteSetting::factory()->create(['key' => 'school_name', 'value' => 'Sekolah Kita']);

    sendReminder($delivery);
    sendReminder($delivery);

    Http::assertSentCount(1);
    Http::assertSent(fn (Request $request): bool => $request->hasHeader('Authorization', 'replacement-token')
        && $request['target'] === '628123456789' && $request['countryCode'] === '0'
        && str_contains($request['message'], "Yth. Bapak/Ibu Ibu Sari,\nHari ini terdapat agenda *Rapat baru*.")
        && str_contains($request['message'], '8 Oktober 2026 – 10 Oktober 2026')
        && str_contains($request['message'], 'Ruang guru') && str_contains($request['message'], 'Sekolah Kita'));
    expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::Accepted);
    expect($delivery->provider_ids)->toBe(['abc123']);
    expect($delivery->provider_request_id)->toBe('42');
    expect($delivery->attempts)->toBe(1);
    expect($delivery->accepted_at)->not->toBeNull();
    expect($delivery->attempt_history)->toHaveCount(1);
});

it('skips a queued message when an event or recipient becomes ineligible before sending', function (string $change) {
    prepareReminders();
    $delivery = WhatsAppDelivery::factory()->create();
    $event = AcademicEvent::query()->findOrFail($delivery->academic_event_id);
    $contact = TeacherContact::query()->findOrFail($delivery->teacher_contact_id);
    match ($change) {
        'cancelled' => $event->update(['is_cancelled' => true]),
        'deleted event' => $event->delete(),
        'disabled event' => $event->update(['whatsapp_reminder_enabled' => false]),
        'rescheduled event' => $event->update(['start_date' => '2026-10-09']),
        'inactive contact' => $contact->update(['is_active' => false]),
        'opted out' => $contact->update(['notifications_enabled' => false]),
        'changed number' => $contact->update(['phone' => '628987654321']),
        'deleted contact' => $contact->delete(),
        'global disabled' => WhatsAppSetting::current()->update(['reminders_enabled' => false]),
    };

    sendReminder($delivery);

    Http::assertNothingSent();
    expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::Skipped);
    expect($delivery->failure_reason)->not->toBeNull();
    expect($delivery->attempts)->toBe(0);
})->with(['cancelled', 'deleted event', 'disabled event', 'rescheduled event', 'inactive contact', 'opted out', 'changed number', 'deleted contact', 'global disabled']);

it('does not forward a today message to the next day after worker downtime', function () {
    prepareReminders();
    $delivery = WhatsAppDelivery::factory()->create();
    $this->travelTo(CarbonImmutable::parse('2026-10-09 00:00:00 Asia/Jakarta'));

    sendReminder($delivery);

    Http::assertNothingSent();
    expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::Skipped);
});

it('records explicit Fonnte rejection as failed and permits one manual retry', function () {
    prepareReminders();
    Queue::fake([SendWhatsAppDelivery::class]);
    Http::fake(['https://api.fonnte.com/send' => Http::sequence()->push(['Status' => false, 'reason' => 'token invalid'])->push(['status' => true, 'id' => ['retry123']])]);
    $delivery = WhatsAppDelivery::factory()->create();

    sendReminder($delivery);
    expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::Failed);
    expect($delivery->failure_reason)->toBe('token invalid');
    expect(app(WhatsAppReminderService::class)->retry($delivery))->toBeTrue();
    expect(app(WhatsAppReminderService::class)->retry($delivery))->toBeFalse();
    $this->travel(11)->seconds();
    sendReminder($delivery);

    Http::assertSentCount(2);
    Queue::assertPushed(SendWhatsAppDelivery::class, 1);
    expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::Accepted);
    expect($delivery->attempts)->toBe(2);
    expect($delivery->attempt_history)->toHaveCount(2);
});

it('marks network or ambiguous responses for review without automatic or manual retry', function (string $response) {
    prepareReminders();
    Queue::fake([SendWhatsAppDelivery::class]);
    Http::fake(['https://api.fonnte.com/send' => match ($response) {
        'timeout' => Http::failedConnection(),
        'server error' => Http::response(['status' => false], 500),
        'invalid json' => Http::response('upstream unavailable', 200),
        'redirect' => Http::response('', 302),
    }]);
    $delivery = WhatsAppDelivery::factory()->create();

    sendReminder($delivery);
    sendReminder($delivery);
    $this->artisan('whatsapp:remind')->assertSuccessful();

    expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::NeedsReview);
    expect($delivery->attempts)->toBe(1);
    expect(app(WhatsAppReminderService::class)->retry($delivery))->toBeFalse();
    Queue::assertNothingPushed();
})->with(['timeout', 'server error', 'invalid json', 'redirect']);

it('recovers a worker interrupted after claiming as needs review instead of resending', function () {
    prepareReminders();
    Queue::fake([SendWhatsAppDelivery::class]);
    $delivery = WhatsAppDelivery::factory()->create(['status' => 'sending', 'started_at' => now()->subMinutes(6), 'attempts' => 1]);

    $this->artisan('whatsapp:remind')->assertSuccessful();

    expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::NeedsReview);
    Http::assertNothingSent();
    Queue::assertNothingPushed();
});

it('redispatches a lost queued job safely and does not duplicate a live queued job', function () {
    prepareReminders();
    Queue::fake([SendWhatsAppDelivery::class]);
    $lost = WhatsAppDelivery::factory()->create(['dispatched_at' => now()->subMinutes(6), 'available_at' => now()->subMinutes(6)]);
    $contact = TeacherContact::factory()->receivingReminders()->create(['phone' => '628987654321']);
    $live = WhatsAppDelivery::factory()->create(['academic_event_id' => $lost->academic_event_id, 'teacher_contact_id' => $contact->id, 'phone' => '628987654321', 'dispatched_at' => now()]);

    $this->artisan('whatsapp:remind')->assertSuccessful();
    $this->artisan('whatsapp:remind')->assertSuccessful();

    Queue::assertPushed(SendWhatsAppDelivery::class, 1);
    Queue::assertPushed(SendWhatsAppDelivery::class, fn (SendWhatsAppDelivery $job): bool => $job->deliveryId === $lost->id);
    expect($live->refresh()->status)->toBe(WhatsAppDeliveryStatus::Pending);
});

it('paces messages even when several workers resume a delayed backlog', function () {
    prepareReminders();
    Http::fake(['https://api.fonnte.com/send' => Http::response(['status' => true])]);
    $first = WhatsAppDelivery::factory()->create();
    $second = WhatsAppDelivery::factory()->create();

    sendReminder($first);
    sendReminder($second);
    expect($second->refresh()->status)->toBe(WhatsAppDeliveryStatus::Pending);
    $this->travel(11)->seconds();
    sendReminder($second);

    Http::assertSentCount(2);
    expect($second->refresh()->status)->toBe(WhatsAppDeliveryStatus::Accepted);
});

it('does not run another scheduler scan while its lock is held', function () {
    prepareReminders();
    Queue::fake([SendWhatsAppDelivery::class]);
    reminderEvent();
    TeacherContact::factory()->receivingReminders()->create();
    $lock = Cache::lock('whatsapp-reminder-scan', 300);
    $lock->get();

    $this->artisan('whatsapp:remind')->assertSuccessful();

    $lock->release();
    Queue::assertNothingPushed();
    $this->assertDatabaseCount('whats_app_deliveries', 0);
});

it('keeps the database uniqueness guard for the same event phone and day', function () {
    prepareReminders();
    $delivery = WhatsAppDelivery::factory()->create();
    $other = TeacherContact::factory()->receivingReminders()->create();

    expect(fn () => WhatsAppDelivery::factory()->create([
        'academic_event_id' => $delivery->academic_event_id,
        'teacher_contact_id' => $other->id,
        'phone' => $delivery->phone,
    ]))->toThrow(UniqueConstraintViolationException::class);
});

it('copies legacy teacher contacts with opt-in disabled while preserving existing teacher and calendar data', function () {
    $teacher = User::factory()->guru()->create(['name' => 'Guru Lama']);
    $profile = TeacherProfile::factory()->for($teacher)->create(['phone' => '08123456789']);
    $event = AcademicEvent::factory()->create(['title' => 'Agenda Lama']);
    Schema::drop('teacher_contacts');

    $migration = require database_path('migrations/2026_10_08_001724_create_teacher_contacts_table.php');
    $migration->up();

    $this->assertDatabaseHas('teacher_contacts', ['teacher_profile_id' => $profile->id, 'name' => 'Guru Lama', 'phone' => '08123456789', 'notifications_enabled' => false]);
    $this->assertModelExists($teacher);
    $this->assertModelExists($profile);
    expect($event->refresh()->title)->toBe('Agenda Lama');
    expect($event->whatsapp_reminder_enabled)->toBeFalse();
});

it('releases a queued reminder when the administrator moves the sending hour later', function () {
    prepareReminders();
    $delivery = WhatsAppDelivery::factory()->create();
    WhatsAppSetting::current()->update(['send_time' => '09:00']);
    $job = (new SendWhatsAppDelivery($delivery->id))->withFakeQueueInteractions();

    app()->call([$job, 'handle']);

    $job->assertReleased(60);
    Http::assertNothingSent();
    expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::Pending);
});

it('releases a job while another worker holds the sending lock', function () {
    prepareReminders();
    $delivery = WhatsAppDelivery::factory()->create();
    $lock = Cache::lock('whatsapp-delivery-send', 60);
    $lock->get();
    $job = (new SendWhatsAppDelivery($delivery->id))->withFakeQueueInteractions();

    app()->call([$job, 'handle']);

    $lock->release();
    $job->assertReleased(10);
    Http::assertNothingSent();
    expect($delivery->refresh()->attempts)->toBe(0);
});

it('honors a future delivery slot when a stale queue job runs too early', function () {
    prepareReminders();
    $delivery = WhatsAppDelivery::factory()->create(['available_at' => now()->addSeconds(30)]);
    $job = (new SendWhatsAppDelivery($delivery->id))->withFakeQueueInteractions();

    app()->call([$job, 'handle']);

    $job->assertReleased(30);
    Http::assertNothingSent();
    expect($delivery->refresh()->attempts)->toBe(0);
});

it('records a missing token as a safe failure without making a network request', function () {
    prepareReminders();
    config(['services.fonnte.token' => null]);
    WhatsAppSetting::current()->update(['token' => null]);
    $delivery = WhatsAppDelivery::factory()->create();

    sendReminder($delivery);

    Http::assertNothingSent();
    expect($delivery->refresh()->status)->toBe(WhatsAppDeliveryStatus::Failed);
    expect($delivery->failure_reason)->toBe('Token Fonnte belum diatur.');
});

it('redacts credentials echoed in a Fonnte rejection before recording the reason', function () {
    prepareReminders();
    Http::fake(['https://api.fonnte.com/send' => Http::response(['status' => false, 'reason' => 'Invalid token test-fonnte-token'])]);
    $delivery = WhatsAppDelivery::factory()->create();

    sendReminder($delivery);

    Http::assertSentCount(1);
    expect($delivery->refresh()->failure_reason)->toBe('Invalid token [disamarkan]');
    expect(json_encode($delivery->attempt_history))->not->toContain('test-fonnte-token');
});

it('keeps the contact day uniqueness guard even if the same teacher gets a different phone', function () {
    prepareReminders();
    $delivery = WhatsAppDelivery::factory()->create();

    expect(fn () => WhatsAppDelivery::factory()->create([
        'academic_event_id' => $delivery->academic_event_id,
        'teacher_contact_id' => $delivery->teacher_contact_id,
        'phone' => '628987654321',
    ]))->toThrow(UniqueConstraintViolationException::class);
});
