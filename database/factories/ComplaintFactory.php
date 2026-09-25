<?php

namespace Database\Factories;

use App\Enums\ComplaintCategory;
use App\Enums\ComplaintStatus;
use App\Models\Complaint;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Complaint>
 */
class ComplaintFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference_number' => 'PGD-'.Str::upper(Str::random(12)),
            'reporter_name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('08##########'),
            'student_name' => fake()->name(),
            'student_class' => fake()->randomElement(['I A', 'II A', 'III A', 'IV A', 'V A', 'VI A']),
            'category' => fake()->randomElement(ComplaintCategory::cases()),
            'body' => fake()->paragraphs(2, true),
            'attachment_path' => null,
            'status' => ComplaintStatus::Baru,
        ];
    }
}
