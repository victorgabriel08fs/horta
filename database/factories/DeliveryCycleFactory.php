<?php

namespace Database\Factories;

use App\Enums\CycleStatus;
use App\Models\DeliveryCycle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DeliveryCycle>
 */
class DeliveryCycleFactory extends Factory
{
    public function definition(): array
    {
        $deliveryDate = now()->addDays(5);

        return [
            'title' => 'Entrega — '.$deliveryDate->format('d/m/Y'),
            'delivery_date' => $deliveryDate->toDateString(),
            'order_opens_at' => now()->subDay(),
            'order_closes_at' => now()->addDays(3),
            'status' => CycleStatus::Draft,
            'notes' => null,
        ];
    }

    public function open(): static
    {
        return $this->state(fn () => [
            'status' => CycleStatus::Open,
            'order_opens_at' => now()->subDay(),
            'order_closes_at' => now()->addDays(3),
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn () => ['status' => CycleStatus::Closed]);
    }
}
