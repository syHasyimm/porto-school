<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\News;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::query()->where('role', Role::Admin->value)->firstOrFail();
        $articles = [
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

        foreach ($articles as $article) {
            News::query()->updateOrCreate(
                ['slug' => Str::slug($article['title'])],
                [...$article, 'created_by' => $admin->id],
            );
        }
    }
}
