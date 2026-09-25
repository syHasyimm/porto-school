<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Guru\DashboardController as GuruDashboardController;
use App\Http\Controllers\Guru\ProfileController;
use App\Http\Controllers\PublicTeacherController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('/guru', PublicTeacherController::class)->name('teachers.index');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', DashboardRedirectController::class)->name('dashboard');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function (): void {
        Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
        Route::resource('guru', TeacherController::class)
            ->parameters(['guru' => 'teacher'])
            ->names('teachers');
    });

    Route::prefix('guru')->name('guru.')->middleware('guru')->group(function (): void {
        Route::get('/dashboard', GuruDashboardController::class)->name('dashboard');
        Route::get('/profil', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profil', [ProfileController::class, 'update'])->name('profile.update');
    });
});
