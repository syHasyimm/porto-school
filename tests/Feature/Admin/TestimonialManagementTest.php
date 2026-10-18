<?php

use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('lists testimonials by display order and filters alumni names and publication status', function () {
    $admin = User::factory()->admin()->create();
    $first = Testimonial::factory()->for($admin, 'author')->published()->create(['name' => 'Rina Putri', 'sort_order' => 1]);
    Testimonial::factory()->for($admin, 'author')->published()->create(['name' => 'Rina Sari', 'sort_order' => 5]);
    Testimonial::factory()->for($admin, 'author')->create(['name' => 'Rina Draft', 'sort_order' => 0]);

    $this->actingAs($admin)->get(route('admin.testimonials.index', ['search' => 'Rina', 'status' => 'published']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/testimonials/index')
            ->where('filters.search', 'Rina')->where('filters.status', 'published')
            ->has('items.data', 2)->where('items.data.0.id', $first->id));

    $this->get(route('admin.testimonials.index', ['status' => 'draft']))
        ->assertInertia(fn (Assert $page) => $page->has('items.data', 1)->where('items.data.0.name', 'Rina Draft'));
});

it('opens create and edit forms for an admin', function () {
    $admin = User::factory()->admin()->create();
    $item = Testimonial::factory()->for($admin, 'author')->create(['name' => 'Alumni Sekolah', 'photo_path' => 'testimonials/profile.jpg']);

    $this->actingAs($admin)->get(route('admin.testimonials.create'))
        ->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/testimonials/create'));
    $this->get(route('admin.testimonials.edit', $item))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/testimonials/edit')
            ->where('item.name', 'Alumni Sekolah')->where('item.is_published', false)
            ->where('item.photo_url', Storage::disk('public')->url('testimonials/profile.jpg')));
});

it('creates a published testimonial and stores its photo without accepting ownership from the request', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();
    $other = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.testimonials.store'), [
        'name' => 'Rina Putri', 'graduation_year' => 2018,
        'content' => 'Guru membantu saya berani mencoba hal baru.',
        'is_published' => true, 'sort_order' => 2,
        'photo' => UploadedFile::fake()->image('alumni.jpg'),
        'created_by' => $other->id, 'photo_path' => 'untrusted.jpg',
    ])->assertRedirectToRoute('admin.testimonials.index')->assertSessionHas('success');

    $item = Testimonial::query()->sole();
    expect($item->name)->toBe('Rina Putri')->and($item->graduation_year)->toBe(2018)
        ->and($item->content)->toBe('Guru membantu saya berani mencoba hal baru.')
        ->and($item->is_published)->toBeTrue()->and($item->sort_order)->toBe(2)
        ->and($item->created_by)->toBe($admin->id)->and($item->photo_path)->not->toBe('untrusted.jpg');
    Storage::disk('public')->assertExists($item->photo_path);
});

it('creates a draft without an optional photo or graduation year', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->post(route('admin.testimonials.store'), [
        'name' => 'Budi', 'content' => 'Kenangan bersama teman sekolah.', 'is_published' => false, 'sort_order' => 0,
    ])->assertRedirectToRoute('admin.testimonials.index');

    $item = Testimonial::query()->sole();
    expect($item->photo_path)->toBeNull()->and($item->graduation_year)->toBeNull()->and($item->is_published)->toBeFalse();
});

it('replaces a photo through a method-spoofed multipart update', function () {
    Storage::fake('public');
    Storage::disk('public')->put('testimonials/old.jpg', 'old-photo');
    $admin = User::factory()->admin()->create();
    $item = Testimonial::factory()->for($admin, 'author')->create(['photo_path' => 'testimonials/old.jpg']);

    $this->actingAs($admin)->post(route('admin.testimonials.update', $item), [
        '_method' => 'put', 'name' => 'Nama Baru', 'graduation_year' => 2019, 'content' => 'Isi baru.',
        'is_published' => true, 'sort_order' => 3, 'photo' => UploadedFile::fake()->image('new.png'),
    ])->assertRedirectToRoute('admin.testimonials.index');

    $item->refresh();
    expect($item->name)->toBe('Nama Baru')->and($item->is_published)->toBeTrue()->and($item->sort_order)->toBe(3);
    Storage::disk('public')->assertMissing('testimonials/old.jpg');
    Storage::disk('public')->assertExists($item->photo_path);
});

it('keeps an existing photo when editing text and hides an unpublished testimonial from home', function () {
    Storage::fake('public');
    Storage::disk('public')->put('testimonials/keep.jpg', 'photo');
    $admin = User::factory()->admin()->create();
    $item = Testimonial::factory()->for($admin, 'author')->published()->create(['photo_path' => 'testimonials/keep.jpg']);
    $this->actingAs($admin)->put(route('admin.testimonials.update', $item), [
        'name' => 'Budi', 'content' => 'Cerita yang diperbarui.', 'is_published' => false, 'sort_order' => 0,
    ])->assertRedirectToRoute('admin.testimonials.index');

    expect($item->fresh()->photo_path)->toBe('testimonials/keep.jpg');
    Storage::disk('public')->assertExists('testimonials/keep.jpg');
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->has('featuredTestimonials', 0)->where('showTestimonialExamples', false));
});

it('requires the name content publication status and display order', function () {
    $this->actingAs(User::factory()->admin()->create())->post(route('admin.testimonials.store'), [])
        ->assertInvalid(['name', 'content', 'is_published', 'sort_order']);
    $this->assertDatabaseCount('testimonials', 0);
});

it('rejects invalid testimonial fields without storing data', function (string $field, mixed $value) {
    $this->actingAs(User::factory()->admin()->create())->post(route('admin.testimonials.store'), [
        'name' => 'Alumni', 'content' => 'Cerita singkat.', 'is_published' => false, 'sort_order' => 0, $field => $value,
    ])->assertInvalid([$field]);
    $this->assertDatabaseCount('testimonials', 0);
})->with([
    'long name' => ['name', str_repeat('A', 101)],
    'long content' => ['content', str_repeat('A', 1001)],
    'year before 1900' => ['graduation_year', 1899],
    'future year' => ['graduation_year', 9999],
    'noninteger year' => ['graduation_year', '2018.5'],
    'invalid publication flag' => ['is_published', 'invalid'],
    'negative order' => ['sort_order', -1],
    'order above maximum' => ['sort_order', 10000],
]);

it('rejects unsafe or oversized photos and preserves the original on update', function (string $kind) {
    Storage::fake('public');
    Storage::disk('public')->put('testimonials/keep.jpg', 'old-photo');
    $admin = User::factory()->admin()->create();
    $item = Testimonial::factory()->for($admin, 'author')->create(['name' => 'Nama Lama', 'photo_path' => 'testimonials/keep.jpg']);
    $photo = match ($kind) {
        'document' => UploadedFile::fake()->create('file.pdf', 100, 'application/pdf'),
        'svg' => UploadedFile::fake()->createWithContent('avatar.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
        'large' => UploadedFile::fake()->image('large.jpg')->size(2049),
    };

    $this->actingAs($admin)->post(route('admin.testimonials.update', $item), [
        '_method' => 'put', 'name' => 'Nama Baru', 'content' => 'Isi baru.', 'is_published' => true, 'sort_order' => 0, 'photo' => $photo,
    ])->assertInvalid(['photo']);
    expect($item->fresh()->name)->toBe('Nama Lama')->and($item->fresh()->photo_path)->toBe('testimonials/keep.jpg');
    Storage::disk('public')->assertExists('testimonials/keep.jpg');
    Storage::disk('public')->assertCount('testimonials', 1);
})->with(['document', 'svg', 'large']);

it('deletes a testimonial and removes its optional photo', function (bool $hasPhoto) {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();
    $photoPath = $hasPhoto ? 'testimonials/delete.jpg' : null;
    if ($hasPhoto) {
        Storage::disk('public')->put($photoPath, 'photo');
    }
    $item = Testimonial::factory()->for($admin, 'author')->create(['photo_path' => $photoPath]);
    $this->actingAs($admin)->delete(route('admin.testimonials.destroy', $item))->assertRedirectToRoute('admin.testimonials.index');
    $this->assertDatabaseMissing('testimonials', ['id' => $item->id]);
    if ($hasPhoto) {
        Storage::disk('public')->assertMissing($photoPath);
    } else {
        Storage::disk('public')->assertCount('/', 0);
    }
})->with([true, false]);

it('rejects non-admin access to testimonial management', function (string $method, string $action) {
    $admin = User::factory()->admin()->create();
    $item = Testimonial::factory()->for($admin, 'author')->create();
    $url = route('admin.testimonials.'.$action, in_array($action, ['edit', 'update', 'destroy'], true) ? $item : []);
    $this->{$method}($url)->assertRedirectToRoute('login');
    $this->actingAs(User::factory()->guru()->create())->{$method}($url)->assertForbidden();
    $this->assertDatabaseCount('testimonials', 1);
})->with([
    'list' => ['get', 'index'], 'create form' => ['get', 'create'], 'create record' => ['post', 'store'],
    'edit form' => ['get', 'edit'], 'update record' => ['put', 'update'], 'delete record' => ['delete', 'destroy'],
]);

it('returns not found for an unavailable testimonial', function (string $method, string $action) {
    $this->actingAs(User::factory()->admin()->create())->{$method}(route('admin.testimonials.'.$action, 999999))->assertNotFound();
})->with([['get', 'edit'], ['put', 'update'], ['delete', 'destroy']]);

it('cleans up newly uploaded photos when persistence fails and keeps the previous photo', function (string $action) {
    Storage::fake('public');
    Exceptions::fake();
    $admin = User::factory()->admin()->create();
    $item = null;
    if ($action === 'update') {
        Storage::disk('public')->put('testimonials/old.jpg', 'old-photo');
        $item = Testimonial::factory()->for($admin, 'author')->create(['photo_path' => 'testimonials/old.jpg']);
    }
    $event = 'eloquent.'.($action === 'store' ? 'creating' : 'updating').': '.Testimonial::class;
    Event::listen($event, function (): void {
        throw new RuntimeException('Unable to persist testimonial.');
    });

    try {
        $this->actingAs($admin)->post(route('admin.testimonials.'.$action, $item ? [$item] : []), [
            ...($item ? ['_method' => 'put'] : []),
            'name' => 'Alumni', 'content' => 'Cerita alumni.', 'is_published' => false, 'sort_order' => 0,
            'photo' => UploadedFile::fake()->image('new.jpg'),
        ])->assertServerError();
    } finally {
        Event::forget($event);
    }

    Exceptions::assertReported(RuntimeException::class);
    if ($item) {
        expect($item->fresh()->photo_path)->toBe('testimonials/old.jpg');
        Storage::disk('public')->assertExists('testimonials/old.jpg');
        Storage::disk('public')->assertCount('testimonials', 1);
    } else {
        $this->assertDatabaseCount('testimonials', 0);
        Storage::disk('public')->assertDirectoryEmpty('testimonials');
    }
})->with(['store', 'update']);
