<?php

namespace Tests\Feature;

use App\Enums\ProductUnit;
use App\Enums\ReservationStatus;
use App\Exceptions\ReservationException;
use App\Models\CycleDeliveryPoint;
use App\Models\CycleProduct;
use App\Models\DeliveryCycle;
use App\Models\DeliveryPoint;
use App\Models\Product;
use App\Models\User;
use App\Services\ReservationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReservationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ReservationService::class);
    }

    private function makeOpenCycle(float $qty = 10, ProductUnit $unit = ProductUnit::Kg): array
    {
        $cycle = DeliveryCycle::factory()->open()->create();
        $product = Product::factory()->create(['unit' => $unit, 'price' => 5.00]);
        $cycleProduct = CycleProduct::factory()->create([
            'delivery_cycle_id' => $cycle->id,
            'product_id' => $product->id,
            'quantity_available' => $qty,
            'price_override' => null,
        ]);
        $point = CycleDeliveryPoint::factory()->create([
            'delivery_cycle_id' => $cycle->id,
            'delivery_point_id' => DeliveryPoint::factory()->create()->id,
        ]);

        return [$cycle, $cycleProduct, $point];
    }

    public function test_places_a_reservation_and_computes_total(): void
    {
        [$cycle, $cycleProduct, $point] = $this->makeOpenCycle(qty: 10);
        $user = User::factory()->create();

        $reservation = $this->service->place(
            $cycle,
            $point->id,
            [['cycle_product_id' => $cycleProduct->id, 'quantity' => 3]],
            ['user_id' => $user->id],
        );

        $this->assertEquals(ReservationStatus::Confirmed, $reservation->status);
        $this->assertEquals(15.00, (float) $reservation->total_amount);
        $this->assertEquals('3.00', $reservation->items->first()->quantity);
        $this->assertNotEmpty($reservation->confirmation_code);
        $this->assertEquals($point->deliveryPoint->name, $reservation->delivery_point_name);
        $this->assertEquals(7.0, $cycleProduct->fresh()->remainingQuantity());
    }

    public function test_rejects_when_stock_is_insufficient(): void
    {
        [$cycle, $cycleProduct, $point] = $this->makeOpenCycle(qty: 5);

        $this->expectException(ReservationException::class);

        $this->service->place(
            $cycle,
            $point->id,
            [['cycle_product_id' => $cycleProduct->id, 'quantity' => 6]],
            [],
        );
    }

    public function test_two_reservations_cannot_exceed_available_stock(): void
    {
        [$cycle, $cycleProduct, $point] = $this->makeOpenCycle(qty: 10);

        $this->service->place($cycle, $point->id, [['cycle_product_id' => $cycleProduct->id, 'quantity' => 7]], []);

        $this->expectException(ReservationException::class);
        $this->service->place($cycle, $point->id, [['cycle_product_id' => $cycleProduct->id, 'quantity' => 4]], []);
    }

    public function test_rejects_a_point_that_does_not_belong_to_the_cycle(): void
    {
        [$cycle, $cycleProduct] = $this->makeOpenCycle(qty: 10);
        $otherPoint = CycleDeliveryPoint::factory()->create(); // pertence a outro ciclo

        $this->expectException(ReservationException::class);

        $this->service->place(
            $cycle,
            $otherPoint->id,
            [['cycle_product_id' => $cycleProduct->id, 'quantity' => 1]],
            [],
        );
    }

    public function test_rejects_when_the_cycle_is_not_open(): void
    {
        [$cycle, $cycleProduct, $point] = $this->makeOpenCycle(qty: 10);
        $cycle->update(['status' => \App\Enums\CycleStatus::Closed]);

        $this->expectException(ReservationException::class);

        $this->service->place($cycle, $point->id, [['cycle_product_id' => $cycleProduct->id, 'quantity' => 1]], []);
    }

    public function test_rejects_fractional_quantity_for_integer_units(): void
    {
        [$cycle, $cycleProduct, $point] = $this->makeOpenCycle(qty: 10, unit: ProductUnit::Unidade);

        $this->expectException(ReservationException::class);

        $this->service->place($cycle, $point->id, [['cycle_product_id' => $cycleProduct->id, 'quantity' => 1.5]], []);
    }

    public function test_cancelling_returns_stock(): void
    {
        [$cycle, $cycleProduct, $point] = $this->makeOpenCycle(qty: 10);

        $reservation = $this->service->place($cycle, $point->id, [['cycle_product_id' => $cycleProduct->id, 'quantity' => 6]], []);
        $this->assertEquals(4.0, $cycleProduct->fresh()->remainingQuantity());

        $this->service->cancel($reservation);
        $this->assertEquals(10.0, $cycleProduct->fresh()->remainingQuantity());
    }

    public function test_uses_price_override_when_present(): void
    {
        [$cycle, $cycleProduct, $point] = $this->makeOpenCycle(qty: 10);
        $cycleProduct->update(['price_override' => 8.00]);

        $reservation = $this->service->place($cycle, $point->id, [['cycle_product_id' => $cycleProduct->id, 'quantity' => 2]], []);

        $this->assertEquals(16.00, (float) $reservation->total_amount);
    }
}
