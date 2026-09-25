<?php

namespace Database\Factories;

use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TeacherProfile>
 */
class TeacherProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->guru(),
            'nip' => fake()->unique()->numerify('19################'),
            'photo_path' => null,
            'phone' => fake()->numerify('08##########'),
            'address' => fake()->address(),
            'birth_date' => fake()->dateTimeBetween('-55 years', '-22 years'),
            'subject' => fake()->randomElement(['Guru Kelas', 'Matematika', 'Bahasa Indonesia', 'Pendidikan Jasmani']),
            'bio' => fake()->paragraph(),
        ];
    }
}
