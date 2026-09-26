<?php

use App\Enums\ComplaintCategory;
use App\Enums\ComplaintStatus;
use App\Models\Complaint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the public complaint form without requiring authentication', function () {
    $this->get(route('complaints.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('complaints/create')
            ->has('categories', count(ComplaintCategory::cases())));
});

it('stores a complaint with a unique public reference and private attachment', function () {
    Storage::fake('local');

    $response = $this->post(route('complaints.store'), [
        'reporter_name' => 'Rahmawati',
        'email' => 'rahmawati@example.test',
        'phone' => '081234567890',
        'student_name' => 'Dewi Lestari',
        'student_class' => 'IV A',
        'category' => ComplaintCategory::Fasilitas->value,
        'body' => 'Mohon pemeriksaan fasilitas cuci tangan di depan kelas.',
        'attachment' => UploadedFile::fake()->image('fasilitas.jpg', 800, 600),
    ]);

    $complaint = Complaint::query()->sole();

    $response
        ->assertRedirectToRoute('complaints.success')
        ->assertSessionHas('complaint_reference', $complaint->reference_number);

    expect($complaint->reference_number)
        ->toMatch('/^PGD-[A-Z0-9]{12}$/')
        ->and($complaint->status)->toBe(ComplaintStatus::Baru)
        ->and($complaint->attachment_path)->not->toBeNull();

    Storage::disk('local')->assertExists($complaint->attachment_path);

    $this->get(route('complaints.success'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('complaints/success')
            ->where('referenceNumber', $complaint->reference_number)
            ->missing('complaint')
            ->missing('reporter_name')
            ->missing('email'));
});

it('accepts a complaint without an attachment', function () {
    $this->post(route('complaints.store'), [
        'reporter_name' => 'Orang Tua Siswa',
        'email' => 'orangtua@example.test',
        'phone' => '081200000001',
        'student_name' => 'Siswa Contoh',
        'student_class' => 'II A',
        'category' => ComplaintCategory::Akademik->value,
        'body' => 'Mohon informasi tentang pendampingan belajar.',
    ])->assertRedirectToRoute('complaints.success');

    expect(Complaint::query()->sole()->attachment_path)->toBeNull();
});

it('rejects invalid categories and unsupported attachment types', function () {
    Storage::fake('local');

    $this->post(route('complaints.store'), [
        'reporter_name' => 'Pelapor',
        'email' => 'pelapor@example.test',
        'phone' => '081200000002',
        'student_name' => 'Siswa',
        'student_class' => 'III A',
        'category' => 'tidak-tersedia',
        'body' => 'Isi pengaduan yang perlu ditindaklanjuti.',
        'attachment' => UploadedFile::fake()->create(
            'program.exe',
            100,
            'application/x-msdownload',
        ),
    ])->assertInvalid(['category', 'attachment']);
});

it('rejects attachments larger than five megabytes', function () {
    Storage::fake('local');

    $this->post(route('complaints.store'), [
        'reporter_name' => 'Pelapor',
        'email' => 'pelapor@example.test',
        'phone' => '081200000003',
        'student_name' => 'Siswa',
        'student_class' => 'V A',
        'category' => ComplaintCategory::Layanan->value,
        'body' => 'Isi pengaduan yang perlu ditindaklanjuti.',
        'attachment' => UploadedFile::fake()->create(
            'dokumen.pdf',
            5 * 1024 + 1,
            'application/pdf',
        ),
    ])->assertInvalid(['attachment']);
});

it('redirects a direct success page visit to the complaint form', function () {
    $this->get(route('complaints.success'))
        ->assertRedirectToRoute('complaints.create');
});
