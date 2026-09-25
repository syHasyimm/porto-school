<?php

namespace Database\Factories;

use App\Models\Gallery;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Gallery>
 */
class GalleryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'image_path' => 'galleries/'.fake()->uuid().'.jpg',
            'category' => fake()->randomElement(['Kegiatan', 'Fasilitas', 'Prestasi']),
            'created_by' => User::factory()->admin(),
        ];
    }
}
