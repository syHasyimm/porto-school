# Plan Aplikasi Website — Company Profile Sekolah Dasar

## 1. Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel |
| Frontend | React.js (via Inertia.js) |
| Database | SQLite |
| Styling | Tailwind CSS + Shadcn UI |
| Auth | Laravel Breeze |
| Animation | Motion (Framer Motion `motion.div`) |

## 2. Arsitektur

Menggunakan preset **Laravel Breeze + React + Inertia.js**, bukan React SPA terpisah dengan REST API. Alasannya:

- Laravel tetap menangani routing, auth, dan business logic
- React menjadi rendering layer lewat Inertia.js — tidak perlu bikin API terpisah atau React Router manual
- Shadcn UI tetap bisa dipakai normal (setup manual, tidak butuh Next.js)
- Motion tinggal dipasang di komponen React seperti biasa

> Jika ke depannya ada rencana bikin mobile app, baru pertimbangkan Laravel sebagai pure API + React SPA terpisah (dengan Sanctum untuk auth token).

## 3. Role & Hak Akses

| Role | Akses |
|---|---|
| **Admin** | Semua halaman: kelola guru, kalender akademik, pengaduan, berita, galeri, pengaturan situs |
| **Guru** | Hanya bisa login & edit profil pribadinya (foto, biodata, NIP, mapel, dll) |
| **Orang Tua** | Tidak perlu akun — isi form pengaduan publik langsung dari website |

Implementasi: kolom `role` (enum: `admin`, `guru`) di tabel `users`, diproteksi dengan Middleware + Policy.

## 4. Breakdown Fitur

### Public (tanpa login)
- Beranda, Profil Sekolah, Visi Misi, Struktur Organisasi, Fasilitas, Ekstrakurikuler
- Data Guru (list publik, foto & bio singkat)
- Galeri & Berita/Kegiatan
- **Kalender Akademik** (tampilan kalender, filter kategori: libur, ujian, kegiatan)
- **Form Pengaduan Orang Tua**
- Kontak

### Admin Dashboard
- CRUD Guru (tambah akun, lihat semua profil)
- CRUD Kalender Akademik
- Kelola Pengaduan (lihat, ubah status: baru → diproses → selesai, beri tanggapan)
- CRUD Berita & Galeri
- Pengaturan info sekolah

### Guru Dashboard
- Edit profil sendiri saja (foto, NIP, no. HP, alamat, mata pelajaran, bio)

## 5. Skema Database (SQLite)

```
users              : id, name, email, password, role(admin/guru), timestamps
teacher_profiles   : id, user_id, nip, foto, no_hp, alamat, tgl_lahir, mapel, bio
academic_events    : id, title, description, category(libur/ujian/kegiatan/pengumuman),
                      start_date, end_date, color, created_by
complaints         : id, nama_pelapor, email, no_hp, nama_anak, kelas_anak,
                      kategori, isi_pengaduan, lampiran, status(baru/diproses/selesai)
complaint_responses: id, complaint_id, user_id(admin), response, created_at
news               : id, title, slug, content, thumbnail, published_at
galleries          : id, title, image, category
site_settings      : id, key, value   (nama sekolah, alamat, no telp, dsb)
```

## 6. Struktur Folder

```
sekolah-company-profile/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── TeacherController.php
│   │   │   │   ├── ComplaintController.php
│   │   │   │   ├── AcademicEventController.php
│   │   │   │   ├── NewsController.php
│   │   │   │   └── GalleryController.php
│   │   │   ├── Guru/
│   │   │   │   └── ProfileController.php
│   │   │   ├── Auth/                    # bawaan Breeze
│   │   │   ├── ComplaintPublicController.php
│   │   │   ├── CalendarPublicController.php
│   │   │   └── HomeController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureUserIsAdmin.php
│   │   │   └── EnsureUserIsGuru.php
│   │   └── Requests/
│   │       ├── StoreComplaintRequest.php
│   │       ├── StoreAcademicEventRequest.php
│   │       └── UpdateTeacherProfileRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── TeacherProfile.php
│   │   ├── Complaint.php
│   │   ├── ComplaintResponse.php
│   │   ├── AcademicEvent.php
│   │   ├── News.php
│   │   └── Gallery.php
│   ├── Policies/
│   │   ├── ComplaintPolicy.php
│   │   ├── TeacherProfilePolicy.php
│   │   └── AcademicEventPolicy.php
│   └── Enums/
│       ├── Role.php
│       ├── ComplaintStatus.php
│       └── EventCategory.php
├── database/
│   ├── migrations/
│   ├── seeders/
│   │   ├── AdminSeeder.php
│   │   └── DatabaseSeeder.php
│   └── database.sqlite
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── ui/                      # komponen shadcn (button, card, dialog, dll)
│   │   │   ├── shared/                  # navbar, footer, sidebar
│   │   │   └── forms/
│   │   ├── Layouts/
│   │   │   ├── PublicLayout.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   └── GuruLayout.jsx
│   │   ├── Pages/
│   │   │   ├── Public/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Profil.jsx
│   │   │   │   ├── Galeri.jsx
│   │   │   │   ├── Berita/
│   │   │   │   ├── Kalender.jsx
│   │   │   │   ├── Pengaduan.jsx
│   │   │   │   └── Kontak.jsx
│   │   │   ├── Auth/                    # bawaan Breeze
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Guru/
│   │   │   │   ├── Pengaduan/
│   │   │   │   ├── Kalender/
│   │   │   │   └── Berita/
│   │   │   └── Guru/
│   │   │       └── Profile/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── utils.js                 # cn() helper shadcn
│   │   │   └── motion-variants.js       # variant animasi reusable
│   │   └── app.jsx
│   ├── css/
│   │   └── app.css                      # tailwind + css variables shadcn + font import
│   └── views/
│       └── app.blade.php
├── routes/
│   ├── web.php
│   └── auth.php
├── components.json                      # config shadcn
├── tailwind.config.js
├── vite.config.js
└── .env
```

## 7. Roadmap Pengerjaan

1. **Setup**: `laravel new` → install Breeze preset React + Inertia → setup SQLite → install Tailwind, shadcn, Framer Motion
2. **Auth & Role**: migration `role` di users, middleware admin/guru, seeder admin default
3. **Fitur inti**: Kalender Akademik → Pengaduan Orang Tua → Profil Guru
4. **Halaman publik**: company profile pages + landing
5. **Polish**: animasi transisi halaman, loading state, responsive check
6. **Deploy**: build assets, migrate SQLite, testing

## 8. Color Palette — Opsi A (Ceria & Hangat)

| Fungsi | Warna | Hex |
|---|---|---|
| Primary | Biru cerah | `#3B82F6` |
| Secondary | Kuning/Amber | `#FBBF24` |
| Accent | Hijau daun | `#22C55E` |
| Danger | Merah | `#EF4444` |
| Background | Putih gading | `#FEFCF8` |
| Text | Slate gelap | `#1E293B` |

> Catatan: gunakan palet ini penuh di halaman publik. Untuk dashboard admin/guru, sebaiknya lebih netral (abu-abu + primary biru saja) agar tidak terlalu ramai saat dipakai kerja sehari-hari.

## 9. Tipografi — Font Modern & Aesthetic

### Rekomendasi Utama: Modern Soft
| Fungsi | Font | Karakter |
|---|---|---|
| Heading | Plus Jakarta Sans | Geometris, sedikit rounded, friendly tapi tegas |
| Body | Manrope | Bersih, nyaman dibaca, modern |

### Alternatif 1: Bold & Aesthetic
| Fungsi | Font | Karakter |
|---|---|---|
| Heading | Clash Display (Fontshare) | Bold, distinctive, banyak dipakai di landing page modern |
| Body | Satoshi (Fontshare) | Netral, geometris, sangat clean |

### Alternatif 2: Playful tapi Rapi
| Fungsi | Font | Karakter |
|---|---|---|
| Heading | Sora | Rounded ends, modern, cocok untuk H1/H2 besar |
| Body | Inter | Standar shadcn, sangat readable, serbaguna |

### Setup Font (Rekomendasi Utama)

**1. Import di `resources/css/app.css`:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
```

**2. Daftarkan di `tailwind.config.js`:**
```js
export default {
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Manrope"', 'sans-serif'], // default body
      },
    },
  },
}
```

**3. Pemakaian di komponen React:**
```jsx
<h1 className="font-heading font-bold text-3xl text-slate-800">
  Selamat Datang di SD Kami
</h1>
<p className="font-sans text-slate-600">
  Deskripsi sekolah di sini...
</p>
```

> Jika ingin pakai Clash Display / Satoshi (Alternatif 1), font diambil dari Fontshare:
> `https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500&display=swap`

## 10. Keputusan Produk Phase 0

### Identitas Sekolah

- Nama resmi: **SD Negeri 001 Kepenuhan**
- Informasi alamat, telepon, email, media sosial, logo, dan titik peta disiapkan sebagai data pengaturan situs agar dapat diganti oleh admin.
- Data awal yang belum tersedia menggunakan nilai contoh yang jelas dan harus diperbarui sebelum produksi.

### Akun dan Hak Akses

- Aplikasi hanya memiliki akun `admin` dan `guru`.
- Pendaftaran akun publik tidak tersedia.
- Admin membuat dan mengelola akun guru.
- Orang tua dapat mengirim pengaduan tanpa membuat akun.
- Akun seed lokal terdiri dari satu admin dan dua guru untuk kebutuhan pengembangan.

### Data Guru

- Data publik guru: nama, foto, mata pelajaran, dan bio.
- Data privat guru: NIP, nomor telepon, alamat, tanggal lahir, dan email akun.
- Guru hanya dapat mengubah profil miliknya sendiri, sedangkan admin dapat mengelola seluruh profil guru.

### Kalender Akademik

- Kategori acara: `libur`, `ujian`, `kegiatan`, dan `pengumuman`.
- Acara dapat berlangsung satu hari atau dalam rentang tanggal.
- Tanggal selesai tidak boleh lebih awal daripada tanggal mulai.

### Pengaduan

- Kategori pengaduan: `akademik`, `fasilitas`, `layanan`, `keamanan`, dan `lainnya`.
- Status pengaduan: `baru`, `diproses`, dan `selesai`.
- Setiap pengaduan memperoleh nomor referensi publik yang unik dan tidak berurutan.
- Lampiran bersifat opsional, disimpan secara privat, maksimal 5 MB, dan dibatasi pada PDF, JPG, JPEG, dan PNG.
- Tanggapan admin disimpan sebagai riwayat. Pengiriman melalui email dapat diaktifkan setelah konfigurasi email produksi tersedia.

### Berita dan Galeri

- Berita dianggap draft ketika `published_at` kosong dan dianggap terbit ketika memiliki waktu publikasi.
- Slug berita harus unik.
- Galeri dapat dikelompokkan berdasarkan kategori bebas yang dikelola admin.

### Data Awal dan Keamanan

- Seeder mengisi identitas SD Negeri 001 Kepenuhan, akun pengembangan, profil guru, kalender, pengaduan, berita, dan galeri contoh.
- Password akun seed hanya untuk lingkungan lokal atau pengujian dan wajib diganti sebelum produksi.
- Informasi sensitif pengaduan dan profil guru tidak boleh dibagikan sebagai prop halaman publik.

### Target Rilis Awal

Rilis awal mencakup autentikasi berbasis sesi, pembatasan role, pengelolaan profil guru, kalender akademik, pengaduan orang tua, berita, galeri, pengaturan situs, dan halaman publik utama.
