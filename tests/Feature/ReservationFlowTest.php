<?php

namespace Tests\Feature;

use App\Enums\ReservationStatus;
use App\Models\CycleDeliveryPoint;
use App\Models\CycleProduct;
use App\Models\DeliveryCycle;
use App\Models\DeliveryPoint;
use App\Models\Product;
use App\Models\Reservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationFlowTest extends TestCase
{
    use RefreshDatabase;

    private function openCycleWithStock(): array
    {
        $cycle = DeliveryCycle::factory()->open()->create();
        $product = Product::factory()->create(['price' => 5.00]);
        $cycleProduct = CycleProduct::factory()->create([
            'delivery_cycle_id' => $cycle->id,
            'product_id' => $product->id,
            'quantity_available' => 20,
        ]);
        $point = CycleDeliveryPoint::factory()->create([
            'delivery_cycle_id' => $cycle->id,
            'delivery_point_id' => DeliveryPoint::factory()->create()->id,
        ]);

        return [$cycle, $cycleProduct, $point];
    }

    public function test_catalog_page_renders_with_open_cycle(): void
    {
        [$cycle] = $this->openCycleWithStock();

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Catalog/Index')
                ->where('cycle.id', $cycle->id)
                ->has('points', 1)
                ->has('catalog'));
    }

    public function test_guest_can_place_a_reservation(): void
    {
        [, $cycleProduct, $point] = $this->openCycleWithStock();

        $response = $this->post('/reservas', [
            'cycle_delivery_point_id' => $point->id,
            'items' => [['cycle_product_id' => $cycleProduct->id, 'quantity' => 3]],
            'guest_name' => 'João Convidado',
            'guest_phone' => '(11) 90000-0000',
        ]);

        $reservation = Reservation::first();
        $this->assertNotNull($reservation);
        $response->assertRedirect("/reservas/{$reservation->id}/confirmacao");

        $this->assertEquals('João Convidado', $reservation->guest_name);
        $this->assertEquals(15.00, (float) $reservation->total_amount);
        $this->assertEquals(ReservationStatus::Confirmed, $reservation->status);
        $this->assertEquals($point->deliveryPoint->name, $reservation->delivery_point_name);
        $this->assertEquals(17.0, $cycleProduct->fresh()->remainingQuantity());
    }

    public function test_reservation_requires_guest_name_when_not_logged_in(): void
    {
        [, $cycleProduct, $point] = $this->openCycleWithStock();

        $this->post('/reservas', [
            'cycle_delivery_point_id' => $point->id,
            'items' => [['cycle_product_id' => $cycleProduct->id, 'quantity' => 1]],
        ])->assertSessionHasErrors(['guest_name', 'guest_phone']);
    }

    public function test_reservation_fails_for_point_outside_cycle(): void
    {
        [, $cycleProduct] = $this->openCycleWithStock();
        $foreignPoint = CycleDeliveryPoint::factory()->create();

        $this->from('/checkout')->post('/reservas', [
            'cycle_delivery_point_id' => $foreignPoint->id,
            'items' => [['cycle_product_id' => $cycleProduct->id, 'quantity' => 1]],
            'guest_name' => 'Teste',
            'guest_phone' => '11999999999',
        ])->assertSessionHasErrors('items');

        $this->assertDatabaseCount('reservations', 0);
    }

    public function test_guest_lookup_redirects_to_confirmation(): void
    {
        [, $cycleProduct, $point] = $this->openCycleWithStock();
        $this->post('/reservas', [
            'cycle_delivery_point_id' => $point->id,
            'items' => [['cycle_product_id' => $cycleProduct->id, 'quantity' => 1]],
            'guest_name' => 'Ana',
            'guest_phone' => '11988887777',
        ]);
        $reservation = Reservation::first();

        $this->post('/consultar-reserva', [
            'confirmation_code' => $reservation->confirmation_code,
        ])->assertRedirect("/reservas/{$reservation->id}/confirmacao?code={$reservation->confirmation_code}");
    }
}
