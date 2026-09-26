<?php

use App\Enums\ComplaintCategory;
use App\Enums\ComplaintStatus;
use App\Models\Complaint;
use App\Models\ComplaintResponse;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('lists and filters complaints for an admin', function () {
    $admin = User::factory()->admin()->create();
    Complaint::factory()->create([
        'reference_number' => 'PGD-FASILITAS01',
        'reporter_name' => 'Siti Rahma',
        'category' => ComplaintCategory::Fasilitas,
        'status' => ComplaintStatus::Baru,
    ]);
    Complaint::factory()->create([
        'reference_number' => 'PGD-AKADEMIK001',
        'reporter_name' => 'Budi Santoso',
        'category' => ComplaintCategory::Akademik,
        'status' => ComplaintStatus::Selesai,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.complaints.index', [
            'search' => 'Siti',
            'status' => ComplaintStatus::Baru->value,
            'category' => ComplaintCategory::Fasilitas->value,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/complaints/index')
            ->where('filters.search', 'Siti')
            ->where('filters.status', ComplaintStatus::Baru->value)
            ->where('filters.category', ComplaintCategory::Fasilitas->value)
            ->has('complaints.data', 1)
            ->where('complaints.data.0.reference_number', 'PGD-FASILITAS01'));
});

it('shows private complaint details and response history to an admin', function () {
    $admin = User::factory()->admin()->create();
    $complaint = Complaint::factory()->create([
        'email' => 'private@example.test',
        'phone' => '081299999999',
    ]);
    ComplaintResponse::factory()->for($complaint)->for($admin, 'responder')->create([
        'response' => 'Laporan telah diperiksa.',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.complaints.show', $complaint))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/complaints/show')
            ->where('complaint.email', 'private@example.test')
            ->where('complaint.phone', '081299999999')
            ->has('complaint.responses', 1)
            ->where('complaint.responses.0.response', 'Laporan telah diperiksa.'));
});

it('updates a complaint status', function () {
    $admin = User::factory()->admin()->create();
    $complaint = Complaint::factory()->create(['status' => ComplaintStatus::Baru]);

    $this->actingAs($admin)
        ->patch(route('admin.complaints.status.update', $complaint), [
            'status' => ComplaintStatus::Selesai->value,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($complaint->refresh()->status)->toBe(ComplaintStatus::Selesai);
});

it('stores a response and moves a new complaint into progress', function () {
    $admin = User::factory()->admin()->create();
    $complaint = Complaint::factory()->create(['status' => ComplaintStatus::Baru]);

    $this->actingAs($admin)
        ->post(route('admin.complaints.responses.store', $complaint), [
            'response' => 'Laporan sudah diteruskan kepada petugas terkait.',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('complaint_responses', [
        'complaint_id' => $complaint->id,
        'user_id' => $admin->id,
        'response' => 'Laporan sudah diteruskan kepada petugas terkait.',
    ]);
    expect($complaint->refresh()->status)->toBe(ComplaintStatus::Diproses);
});

it('lets only an admin download a private attachment', function () {
    Storage::fake('local');
    Storage::disk('local')->put('complaints/bukti.pdf', 'private-document');

    $admin = User::factory()->admin()->create();
    $guru = User::factory()->guru()->create();
    $complaint = Complaint::factory()->create([
        'reference_number' => 'PGD-DOWNLOAD001',
        'attachment_path' => 'complaints/bukti.pdf',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.complaints.attachment', $complaint))
        ->assertOk()
        ->assertDownload('lampiran-PGD-DOWNLOAD001.pdf');

    $this->actingAs($guru)
        ->get(route('admin.complaints.attachment', $complaint))
        ->assertForbidden();
});

it('deletes a complaint, its responses, and its private attachment', function () {
    Storage::fake('local');
    Storage::disk('local')->put('complaints/delete-me.png', 'image');

    $admin = User::factory()->admin()->create();
    $complaint = Complaint::factory()->create([
        'attachment_path' => 'complaints/delete-me.png',
    ]);
    $response = ComplaintResponse::factory()->for($complaint)->for($admin, 'responder')->create();

    $this->actingAs($admin)
        ->delete(route('admin.complaints.destroy', $complaint))
        ->assertRedirectToRoute('admin.complaints.index');

    $this->assertDatabaseMissing('complaints', ['id' => $complaint->id]);
    $this->assertDatabaseMissing('complaint_responses', ['id' => $response->id]);
    Storage::disk('local')->assertMissing('complaints/delete-me.png');
});

it('prevents guru accounts from opening complaint administration', function () {
    $guru = User::factory()->guru()->create();

    $this->actingAs($guru)
        ->get(route('admin.complaints.index'))
        ->assertForbidden();
});
