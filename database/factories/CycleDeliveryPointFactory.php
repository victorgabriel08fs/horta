<?php

namespace Database\Factories;

use App\Models\CycleDeliveryPoint;
use App\Models\DeliveryCycle;
use App\Models\DeliveryPoint;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CycleDeliveryPoint>
 */
class CycleDeliveryPointFactory extends Factory
{
    public function definition(): array
    {
        return [
            'delivery_cycle_id' => DeliveryCycle::factory(),
            'delivery_point_id' => DeliveryPoint::factory(),
            'scheduled_at' => now()->addDays(5)->setTime(9, 0),
            'capacity' => null,
            'notes' => null,
        ];
    }
}
