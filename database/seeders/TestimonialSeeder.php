<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Testimonial::query()->firstOrCreate(
            ['name' => 'Contoh alumni'],
            [
                'content' => 'Di sekolah ini saya belajar untuk berani bertanya dan mencoba. Dukungan guru membuat saya percaya diri menghadapi hal-hal baru.',
                'is_published' => false,
                'sort_order' => 0,
            ],
        );
    }
}
