<?php

namespace Database\Factories;

use App\Models\CycleProduct;
use App\Models\DeliveryCycle;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CycleProduct>
 */
class CycleProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'delivery_cycle_id' => DeliveryCycle::factory(),
            'product_id' => Product::factory(),
            'quantity_available' => fake()->randomFloat(2, 10, 100),
            'price_override' => null,
        ];
    }
}
