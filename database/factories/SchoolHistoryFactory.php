<?php

namespace Database\Factories;

use App\Models\SchoolHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SchoolHistory>
 */
class SchoolHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'period' => (string) fake()->numberBetween(1980, 2025),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'photo_path' => null,
            'is_published' => false,
            'sort_order' => 0,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => ['is_published' => true]);
    }
}
