<?php

use App\Enums\Role;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

it('lists guru accounts without exposing account secrets or admin users', function () {
    $admin = User::factory()->admin()->create();
    $teacher = User::factory()->guru()->create();
    TeacherProfile::factory()->for($teacher)->create(['subject' => 'Guru Kelas I']);
    $newest = User::factory()->guru()->create();

    $this->actingAs($admin)->get(route('admin.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->where('filters.search', '')
            ->has('accounts.data', 2)
            ->where('accounts.data.0.id', $newest->id)
            ->where('accounts.data.0.has_profile', false)
            ->where('accounts.data.1.subject', 'Guru Kelas I')
            ->where('accounts.data.1.has_profile', true)
            ->missing('accounts.data.0.password')
            ->missing('accounts.data.0.remember_token'));
});

it('searches guru accounts by name or email without including matching admins', function (string $search) {
    $admin = User::factory()->admin()->create(['name' => 'Nadia Admin', 'email' => 'nadia.admin@example.test']);
    $matched = User::factory()->guru()->create(['name' => 'Nadia Putri', 'email' => 'nadia.guru@example.test']);
    User::factory()->guru()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.test']);

    $this->actingAs($admin)->get(route('admin.users.index', ['search' => $search]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->where('filters.search', $search)
            ->has('accounts.data', 1)
            ->where('accounts.data.0.id', $matched->id));
})->with(['name' => 'Nadia', 'email' => 'nadia.']);

it('paginates search results and preserves the account search in pagination links', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->guru()->count(11)->create(['name' => 'Guru Kepenuhan']);

    $this->actingAs($admin)->get(route('admin.users.index', ['search' => 'Kepenuhan']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('accounts.data', 10)
            ->where('accounts.total', 11)
            ->where('accounts.next_page_url', route('admin.users.index', ['search' => 'Kepenuhan', 'page' => 2])));
});

it('creates a login account with a profile that admin and guru can complete later', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Nadia Putri',
        'email' => 'nadia@example.test',
        'password' => 'Guru-sekolah123!',
        'password_confirmation' => 'Guru-sekolah123!',
    ])->assertRedirectToRoute('admin.users.index')->assertSessionHas('success');

    $teacher = User::query()->where('email', 'nadia@example.test')->firstOrFail();
    expect($teacher->name)->toBe('Nadia Putri');
    expect($teacher->role)->toBe(Role::Guru);
    expect(Hash::check('Guru-sekolah123!', $teacher->password))->toBeTrue();
    $this->assertDatabaseHas('teacher_profiles', ['user_id' => $teacher->id, 'subject' => null]);

    $this->get(route('admin.teachers.edit', $teacher))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/teachers/edit')
            ->where('teacher.email', 'nadia@example.test')
            ->where('teacher.subject', null));

    $this->post(route('logout'))->assertRedirectToRoute('home');
    $this->post(route('login.store'), [
        'email' => 'nadia@example.test',
        'password' => 'Guru-sekolah123!',
    ])->assertRedirectToRoute('dashboard');
    $this->assertAuthenticatedAs($teacher);
    $this->get(route('dashboard'))->assertRedirectToRoute('guru.dashboard');
    $this->get(route('guru.dashboard'))->assertOk();
    $this->get(route('guru.profile.edit'))->assertOk();
    $this->get(route('admin.dashboard'))->assertForbidden();
});

it('always creates a guru even if the submitted payload requests admin access', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Guru Baru',
        'email' => 'guru.baru@example.test',
        'password' => 'Guru-sekolah123!',
        'password_confirmation' => 'Guru-sekolah123!',
        'role' => 'admin',
    ])->assertRedirectToRoute('admin.users.index');

    $this->assertDatabaseHas('users', ['email' => 'guru.baru@example.test', 'role' => Role::Guru->value]);
    $this->assertDatabaseCount('teacher_profiles', 1);
});

it('requires account details and returns readable validation errors', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.users.store'), [])
        ->assertInvalid([
            'name' => 'Nama lengkap guru wajib diisi.',
            'email' => 'Email untuk login wajib diisi.',
            'password' => 'Password wajib diisi.',
        ]);
    $this->assertDatabaseCount('users', 1);
    $this->assertDatabaseCount('teacher_profiles', 0);
});

it('rejects duplicate emails including emails already used by admins', function () {
    $admin = User::factory()->admin()->create(['email' => 'existing@example.test']);

    $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Guru Baru',
        'email' => 'existing@example.test',
        'password' => 'Guru-sekolah123!',
        'password_confirmation' => 'Guru-sekolah123!',
    ])->assertInvalid(['email' => 'Email ini sudah digunakan oleh pengguna lain.']);
    $this->assertDatabaseCount('users', 1);
    $this->assertDatabaseCount('teacher_profiles', 0);
});

it('rejects invalid account details without creating an account or profile', function (array $overrides, array $fields) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.users.store'), array_replace([
        'name' => 'Guru Baru',
        'email' => 'guru.baru@example.test',
        'password' => 'Guru-sekolah123!',
        'password_confirmation' => 'Guru-sekolah123!',
    ], $overrides))->assertInvalid($fields);

    $this->assertDatabaseCount('users', 1);
    $this->assertDatabaseCount('teacher_profiles', 0);
})->with([
    'invalid email' => [['email' => 'bukan-email'], ['email' => 'Masukkan alamat email yang valid.']],
    'long name' => [['name' => str_repeat('a', 256)], ['name' => 'Nama lengkap maksimal 255 karakter.']],
    'long email' => [['email' => str_repeat('a', 244).'@example.test'], ['email']],
    'non-string name' => [['name' => ['Guru']], ['name']],
    'non-string email' => [['email' => ['guru@example.test']], ['email']],
    'non-string password' => [['password' => ['password'], 'password_confirmation' => ['password']], ['password']],
    'short password' => [['password' => 'abc', 'password_confirmation' => 'abc'], ['password']],
    'different confirmation' => [['password_confirmation' => 'Berbeda123!'], ['password' => 'Konfirmasi password harus sama dengan password.']],
    'missing confirmation' => [['password_confirmation' => ''], ['password' => 'Konfirmasi password harus sama dengan password.']],
]);

it('requires guests to sign in before viewing or adding guru accounts', function () {
    $this->get(route('admin.users.index'))->assertRedirectToRoute('login');
    $this->post(route('admin.users.store'), [])->assertRedirectToRoute('login');
    $this->assertDatabaseCount('users', 0);
});

it('forbids guru users from viewing or adding guru accounts', function () {
    $guru = User::factory()->guru()->create();

    $this->actingAs($guru)->get(route('admin.users.index'))->assertForbidden();
    $this->post(route('admin.users.store'), [
        'name' => 'Guru Baru',
        'email' => 'guru.baru@example.test',
        'password' => 'Guru-sekolah123!',
        'password_confirmation' => 'Guru-sekolah123!',
    ])->assertForbidden();
    $this->assertDatabaseCount('users', 1);
    $this->assertDatabaseCount('teacher_profiles', 0);
});
