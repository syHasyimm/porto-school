<?php

namespace Database\Seeders;

use App\Models\SchoolHistory;
use Illuminate\Database\Seeder;

class SchoolHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SchoolHistory::query()->firstOrCreate(
            ['period' => 'Contoh', 'title' => 'Contoh cerita sejarah'],
            ['description' => 'Ganti dengan peristiwa dan periode yang benar dari arsip sekolah.', 'is_published' => false, 'sort_order' => 0],
        );
    }
}
