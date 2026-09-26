<?php

use App\Http\Controllers\Admin\AcademicEventController;
use App\Http\Controllers\Admin\ComplaintController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Guru\DashboardController as GuruDashboardController;
use App\Http\Controllers\Guru\ProfileController;
use App\Http\Controllers\PublicCalendarController;
use App\Http\Controllers\PublicComplaintController;
use App\Http\Controllers\PublicTeacherController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('/guru', PublicTeacherController::class)->name('teachers.index');
Route::get('/kalender-akademik', PublicCalendarController::class)->name('calendar.index');
Route::get('/pengaduan', [PublicComplaintController::class, 'create'])->name('complaints.create');
Route::post('/pengaduan', [PublicComplaintController::class, 'store'])->name('complaints.store');
Route::get('/pengaduan/berhasil', [PublicComplaintController::class, 'success'])->name('complaints.success');

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
        Route::resource('kalender', AcademicEventController::class)
            ->parameters(['kalender' => 'academicEvent'])
            ->except('show')
            ->names('calendar');
        Route::get('/pengaduan', [ComplaintController::class, 'index'])->name('complaints.index');
        Route::get('/pengaduan/{complaint}', [ComplaintController::class, 'show'])->name('complaints.show');
        Route::patch('/pengaduan/{complaint}/status', [ComplaintController::class, 'updateStatus'])->name('complaints.status.update');
        Route::post('/pengaduan/{complaint}/tanggapan', [ComplaintController::class, 'storeResponse'])->name('complaints.responses.store');
        Route::get('/pengaduan/{complaint}/lampiran', [ComplaintController::class, 'downloadAttachment'])->name('complaints.attachment');
        Route::delete('/pengaduan/{complaint}', [ComplaintController::class, 'destroy'])->name('complaints.destroy');
    });

    Route::prefix('guru')->name('guru.')->middleware('guru')->group(function (): void {
        Route::get('/dashboard', GuruDashboardController::class)->name('dashboard');
        Route::get('/profil', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profil', [ProfileController::class, 'update'])->name('profile.update');
    });
});
