<?php

namespace Database\Factories;

use App\Enums\EventCategory;
use App\Models\AcademicEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AcademicEvent>
 */
class AcademicEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('now', '+6 months');

        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement(EventCategory::cases()),
            'start_date' => $startDate,
            'end_date' => fake()->boolean()
                ? (clone $startDate)->modify('+'.fake()->numberBetween(1, 7).' days')
                : null,
            'color' => fake()->hexColor(),
            'created_by' => User::factory()->admin(),
        ];
    }
}
