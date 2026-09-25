<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Gallery;
use App\Models\User;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::query()->where('role', Role::Admin->value)->firstOrFail();
        $items = [
            [
                'title' => 'Upacara Bendera',
                'image_path' => 'galleries/upacara-bendera.jpg',
                'category' => 'Kegiatan',
            ],
            [
                'title' => 'Kegiatan Literasi Kelas',
                'image_path' => 'galleries/kegiatan-literasi.jpg',
                'category' => 'Kegiatan',
            ],
        ];

        foreach ($items as $item) {
            Gallery::query()->updateOrCreate(
                ['image_path' => $item['image_path']],
                [...$item, 'created_by' => $admin->id],
            );
        }
    }
}
