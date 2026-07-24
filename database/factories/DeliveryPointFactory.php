<?php

namespace Database\Factories;

use App\Models\DeliveryPoint;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeliveryPoint>
 */
class DeliveryPointFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'address' => fake()->streetAddress(),
            'reference' => fake()->optional()->sentence(3),
            'is_active' => true,
        ];
    }
}
