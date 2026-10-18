<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\News;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::query()->where('role', Role::Admin->value)->firstOrFail();
        $existingArticles = [
            [
                'title' => 'Semangat Baru di SD Negeri 001 Kepenuhan',
                'content' => 'SD Negeri 001 Kepenuhan menyambut kegiatan belajar dengan semangat kolaborasi antara peserta didik, guru, dan orang tua.',
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => 'Persiapan Kegiatan Literasi Sekolah',
                'content' => 'Sekolah sedang menyiapkan kegiatan literasi yang mendorong kebiasaan membaca dan berbagi cerita di setiap kelas.',
                'published_at' => null,
            ],
        ];

        foreach ($existingArticles as $article) {
            News::query()->firstOrCreate(
                ['slug' => Str::slug($article['title'])],
                [...$article, 'created_by' => $admin->id],
            );
        }

        $imageUrls = [
            'classroom' => 'https://images.unsplash.com/photo-1509062522246-3755977927d7?fit=crop&w=1200&h=750&q=78&fm=jpg',
            'writing' => 'https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?fit=crop&w=1200&h=750&q=78&fm=jpg',
            'reading' => 'https://images.unsplash.com/photo-1765223111660-cdf94396832a?fit=crop&w=1200&h=750&q=78&fm=jpg',
            'science' => 'https://images.unsplash.com/photo-1758685734034-54e1da4ac7c2?fit=crop&w=1200&h=750&q=78&fm=jpg',
            'planting' => 'https://images.unsplash.com/photo-1524602585632-a2a01c12307c?fit=crop&w=1200&h=750&q=78&fm=jpg',
            'sports' => 'https://images.unsplash.com/photo-1777489689168-497290f235d5?fit=crop&w=1200&h=750&q=78&fm=jpg',
            'painting' => 'https://images.unsplash.com/photo-1708795921259-263a5e973acb?fit=crop&w=1200&h=750&q=78&fm=jpg',
            'tablet' => 'https://images.unsplash.com/photo-1599666505327-7758b44a9985?fit=crop&w=1200&h=750&q=78&fm=jpg',
            'computer' => 'https://images.unsplash.com/photo-1719159381981-1327b22aff9b?fit=crop&w=1200&h=750&q=78&fm=jpg',
            'garden' => 'https://images.unsplash.com/photo-1780287622415-7a930eee0017?fit=crop&w=1200&h=750&q=78&fm=jpg',
        ];

        $sampleArticles = [
            ['Contoh: Pekan Literasi Mengajak Siswa Gemar Membaca', 'kegiatan', 'reading', 'Siswa dapat mencoba membaca bersama dan menceritakan kembali isi buku dengan bahasa mereka sendiri.'],
            ['Contoh: Belajar Sains lewat Percobaan Sederhana', 'kegiatan', 'science', 'Percobaan sederhana membantu anak mengamati perubahan, mengajukan pertanyaan, dan mencatat hasilnya.'],
            ['Contoh: Latihan Sepak Bola Menumbuhkan Kerja Sama', 'kegiatan', 'sports', 'Permainan beregu dapat menjadi ruang untuk belajar bekerja sama, mematuhi aturan, dan menghargai teman.'],
            ['Contoh: Kelas Menulis Cerita Pendek Bersama', 'kegiatan', 'writing', 'Kegiatan menulis memberi kesempatan kepada siswa untuk menyusun ide dan berbagi cerita di kelas.'],
            ['Contoh: Apresiasi untuk Karya Lukis Siswa', 'prestasi', 'painting', 'Karya seni anak dapat dipajang sebagai bentuk apresiasi terhadap keberanian mencoba dan berekspresi.'],
            ['Contoh: Pengenalan Komputer untuk Belajar Aman', 'kegiatan', 'computer', 'Siswa dapat mengenal perangkat komputer dan kebiasaan menggunakan teknologi secara bertanggung jawab.'],
            ['Contoh: Menanam Bibit di Kebun Sekolah', 'kegiatan', 'planting', 'Merawat tanaman dapat membantu siswa memahami kebutuhan makhluk hidup dan menjaga lingkungan.'],
            ['Contoh: Pendaftaran Kegiatan Ekstrakurikuler Dibuka', 'pengumuman', 'classroom', 'Informasi contoh ini menunjukkan cara sekolah menyampaikan pilihan kegiatan di luar jam pelajaran.'],
            ['Contoh: Apresiasi untuk Karya Tulis Siswa', 'prestasi', 'writing', 'Tulisan siswa dapat dibagikan untuk merayakan proses belajar, kreativitas, dan keberanian menyampaikan gagasan.'],
            ['Contoh: Jadwal Pertemuan Orang Tua dan Guru', 'pengumuman', 'classroom', 'Pertemuan orang tua dan guru dapat digunakan untuk berdiskusi mengenai perkembangan belajar anak.'],
            ['Contoh: Membaca Nyaring di Sudut Literasi', 'kegiatan', 'reading', 'Membaca nyaring dapat membantu siswa mengenal kosakata baru dan menikmati cerita bersama.'],
            ['Contoh: Eksperimen Warna dalam Pelajaran IPA', 'kegiatan', 'science', 'Pengamatan warna memberi kesempatan kepada siswa untuk membuat dugaan dan membandingkan hasil percobaan.'],
            ['Contoh: Siswa Berlatih Presentasi di Depan Kelas', 'prestasi', 'classroom', 'Latihan presentasi dapat menumbuhkan rasa percaya diri dan kemampuan menjelaskan hasil belajar.'],
            ['Contoh: Hari Bermain dan Berolahraga Bersama', 'kegiatan', 'sports', 'Aktivitas fisik yang menyenangkan dapat melatih koordinasi, sportivitas, dan kebersamaan.'],
            ['Contoh: Mengamati Pertumbuhan Tanaman', 'kegiatan', 'garden', 'Siswa dapat mencatat perubahan pada tanaman sambil belajar bersabar dan merawat lingkungan.'],
            ['Contoh: Panduan Membawa Perlengkapan Sekolah', 'pengumuman', 'writing', 'Pengumuman contoh ini menggambarkan informasi perlengkapan yang perlu disiapkan untuk kegiatan belajar.'],
            ['Contoh: Cerita Bergambar Hasil Karya Siswa', 'prestasi', 'painting', 'Cerita bergambar dapat mempertemukan keterampilan menulis, menggambar, dan menyusun alur.'],
            ['Contoh: Belajar Mengenal Lingkungan Sekitar', 'umum', 'garden', 'Lingkungan sekitar dapat menjadi sumber belajar untuk mengamati tumbuhan, cuaca, dan kegiatan masyarakat.'],
            ['Contoh: Kegiatan Membaca Berpasangan', 'kegiatan', 'reading', 'Siswa dapat bergantian membaca dan menyimak untuk melatih pemahaman serta saling membantu.'],
            ['Contoh: Belajar Membuat Poster Hemat Energi', 'kegiatan', 'painting', 'Pembuatan poster dapat membantu siswa menyampaikan pesan sederhana melalui gambar dan kalimat.'],
            ['Contoh: Pameran Mini Hasil Belajar Kelas', 'prestasi', 'classroom', 'Pameran kelas dapat memperlihatkan proses belajar dan memberi ruang bagi siswa untuk menjelaskan karyanya.'],
            ['Contoh: Jadwal Kegiatan Literasi Bulanan', 'pengumuman', 'reading', 'Agenda literasi dapat membantu keluarga menyiapkan buku bacaan dan waktu membaca bersama.'],
            ['Contoh: Merawat Kebun dan Menjaga Kebersihan', 'kegiatan', 'planting', 'Kegiatan merawat kebun dapat dipadukan dengan kebiasaan memilah sampah dan menjaga area sekolah.'],
            ['Contoh: Mengenal Etika Penggunaan Internet', 'umum', 'tablet', 'Anak dapat belajar menjaga informasi pribadi dan meminta bantuan orang dewasa saat menemukan hal yang membingungkan.'],
            ['Contoh: Permainan Matematika di Kelas', 'kegiatan', 'science', 'Permainan angka dapat membantu siswa berlatih berhitung melalui tantangan yang dekat dengan kehidupan sehari-hari.'],
            ['Contoh: Semangat Siswa Menyelesaikan Proyek Kelompok', 'prestasi', 'computer', 'Proyek kelompok memberi kesempatan untuk berbagi tugas, mendengarkan pendapat, dan menuntaskan pekerjaan bersama.'],
            ['Contoh: Informasi Persiapan Semester Baru', 'pengumuman', 'classroom', 'Informasi contoh ini memuat pengingat agar keluarga menyiapkan kebutuhan belajar sebelum semester dimulai.'],
            ['Contoh: Menggambar Peta Lingkungan Sekolah', 'kegiatan', 'painting', 'Menggambar peta sederhana dapat melatih siswa mengenali arah, tempat, dan fasilitas di sekitarnya.'],
            ['Contoh: Kebiasaan Membaca Sepuluh Menit', 'umum', 'reading', 'Rutinitas membaca singkat dapat membantu siswa membangun minat baca secara bertahap.'],
            ['Contoh: Bergerak Aktif Saat Istirahat', 'umum', 'sports', 'Waktu istirahat dapat dimanfaatkan untuk bergerak, bermain dengan aman, dan berinteraksi dengan teman.'],
        ];

        $downloadedImages = [];
        $sampleNotice = 'Artikel ini merupakan contoh untuk meninjau tampilan situs, bukan laporan kegiatan sekolah yang sebenarnya.';

        foreach ($sampleArticles as $index => [$title, $category, $imageKey, $description]) {
            $slug = Str::slug($title);
            $thumbnailPath = "news/demo/{$slug}.jpg";
            $existingArticle = News::query()->where('slug', $slug)->first();

            if ($existingArticle !== null && $existingArticle->thumbnail_path !== $thumbnailPath) {
                continue;
            }

            if (! Storage::disk('public')->exists($thumbnailPath)) {
                if (! isset($downloadedImages[$imageKey])) {
                    $response = Http::timeout(20)->retry(2, 250)->get($imageUrls[$imageKey])->throw();

                    if (! str_starts_with(strtolower($response->header('Content-Type')), 'image/jpeg') || $response->body() === '') {
                        throw new RuntimeException("Foto Unsplash untuk {$imageKey} tidak berupa JPEG yang valid.");
                    }

                    $downloadedImages[$imageKey] = $response->body();
                }

                if (! Storage::disk('public')->put($thumbnailPath, $downloadedImages[$imageKey])) {
                    throw new RuntimeException("Foto berita {$title} gagal disimpan.");
                }
            }

            News::query()->firstOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'content' => $description."\n\n".$sampleNotice,
                    'content_html' => '<p>'.e($description).'</p><p>'.e($sampleNotice).'</p>',
                    'category' => $category,
                    'thumbnail_path' => $thumbnailPath,
                    'published_at' => now()->subDays($index + 1)->setTime(9, 0),
                    'created_by' => $admin->id,
                ],
            );
        }
    }
}
