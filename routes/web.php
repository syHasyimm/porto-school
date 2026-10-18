<?php

use App\Http\Controllers\Admin\AcademicEventController;
use App\Http\Controllers\Admin\ComplaintController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\GalleryController;
use App\Http\Controllers\Admin\NewsController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\TeacherAccountController;
use App\Http\Controllers\Admin\TeacherContactController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\WhatsAppDeliveryController;
use App\Http\Controllers\Admin\WhatsAppSettingController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Guru\DashboardController as GuruDashboardController;
use App\Http\Controllers\Guru\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicCalendarController;
use App\Http\Controllers\PublicComplaintController;
use App\Http\Controllers\PublicContactController;
use App\Http\Controllers\PublicGalleryController;
use App\Http\Controllers\PublicNewsController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\PublicTeacherController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/profil', PublicProfileController::class)->name('profile');
Route::get('/kontak', PublicContactController::class)->name('contact');
Route::get('/guru', PublicTeacherController::class)->name('teachers.index');
Route::get('/kalender-akademik', PublicCalendarController::class)->name('calendar.index');
Route::get('/pengaduan', [PublicComplaintController::class, 'create'])->name('complaints.create');
Route::post('/pengaduan', [PublicComplaintController::class, 'store'])->name('complaints.store');
Route::get('/pengaduan/berhasil', [PublicComplaintController::class, 'success'])->name('complaints.success');
Route::get('/berita', [PublicNewsController::class, 'index'])->name('news.index');
Route::get('/berita/{news:slug}', [PublicNewsController::class, 'show'])->name('news.show');
Route::get('/galeri', PublicGalleryController::class)->name('gallery.index');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', DashboardRedirectController::class)->name('dashboard');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function (): void {
        Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
        Route::resource('kontak-guru', TeacherContactController::class)
            ->parameters(['kontak-guru' => 'teacherContact'])->except('show')->names('teacher-contacts');
        Route::get('/whatsapp/pengaturan', [WhatsAppSettingController::class, 'edit'])->name('whatsapp.settings.edit');
        Route::put('/whatsapp/pengaturan', [WhatsAppSettingController::class, 'update'])->name('whatsapp.settings.update');
        Route::post('/whatsapp/tes', [WhatsAppSettingController::class, 'test'])->middleware('throttle:3,1')->name('whatsapp.test');
        Route::get('/whatsapp/riwayat', [WhatsAppDeliveryController::class, 'index'])->name('whatsapp.deliveries.index');
        Route::post('/whatsapp/riwayat/{whatsAppDelivery}/ulang', [WhatsAppDeliveryController::class, 'retry'])->middleware('throttle:10,1')->name('whatsapp.deliveries.retry');
        Route::resource('pengguna', TeacherAccountController::class)
            ->only(['index', 'store'])
            ->names('users');
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
        Route::resource('berita', NewsController::class)
            ->parameters(['berita' => 'news'])
            ->names('news');
        Route::resource('galeri', GalleryController::class)
            ->parameters(['galeri' => 'gallery'])
            ->except('show')
            ->names('gallery');
        Route::get('/pengaturan', [SiteSettingController::class, 'edit'])->name('settings.edit');
        Route::resource('testimoni', TestimonialController::class)
            ->parameters(['testimoni' => 'testimonial'])
            ->except('show')
            ->names('testimonials');
        Route::put('/pengaturan', [SiteSettingController::class, 'update'])->name('settings.update');
    });

    Route::prefix('guru')->name('guru.')->middleware('guru')->group(function (): void {
        Route::get('/dashboard', GuruDashboardController::class)->name('dashboard');
        Route::get('/profil', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profil', [ProfileController::class, 'update'])->name('profile.update');
    });
});
