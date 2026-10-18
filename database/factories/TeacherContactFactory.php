<?php

namespace Database\Factories;

use App\Models\TeacherContact;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TeacherContact> */
class TeacherContactFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => '62812'.fake()->unique()->numerify('########'),
            'is_active' => true,
            'notifications_enabled' => false,
        ];
    }

    public function receivingReminders(): static
    {
        return $this->state(fn (): array => ['notifications_enabled' => true]);
    }
}
