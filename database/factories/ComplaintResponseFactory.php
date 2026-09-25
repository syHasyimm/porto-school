<?php

namespace Database\Factories;

use App\Models\Complaint;
use App\Models\ComplaintResponse;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComplaintResponse>
 */
class ComplaintResponseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'complaint_id' => Complaint::factory(),
            'user_id' => User::factory()->admin(),
            'response' => fake()->paragraph(),
        ];
    }
}
