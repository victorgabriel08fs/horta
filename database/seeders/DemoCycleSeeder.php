<?php

namespace Database\Seeders;

use App\Enums\CycleStatus;
use App\Models\CycleProduct;
use App\Models\DeliveryCycle;
use App\Models\DeliveryPoint;
use App\Models\Product;
use App\Models\User;
use App\Services\ReservationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoCycleSeeder extends Seeder
{
    public function run(ReservationService $reservations): void
    {
        // Evita duplicar em re-seed sem migrate:fresh.
        if (DeliveryCycle::query()->exists()) {
            return;
        }

        $deliveryDate = Carbon::now()->next(Carbon::SATURDAY)->setTime(0, 0);

        $cycle = DeliveryCycle::create([
            'title' => 'Entrega — semana '.$deliveryDate->isoWeek().'/'.$deliveryDate->year,
            'delivery_date' => $deliveryDate->toDateString(),
            'order_opens_at' => Carbon::now()->subDay(),
            'order_closes_at' => Carbon::now()->addDays(3),
            'status' => CycleStatus::Open,
            'notes' => 'Ciclo de demonstração aberto para reservas.',
        ]);

        // Disponibiliza os produtos ativos com quantidades variadas.
        foreach (Product::active()->get() as $index => $product) {
            CycleProduct::create([
                'delivery_cycle_id' => $cycle->id,
                'product_id' => $product->id,
                'quantity_available' => [30, 25, 20, 40, 50, 35, 28, 22, 18, 24, 26, 15, 20][$index] ?? 20,
                'price_override' => null,
            ]);
        }

        // Rota da semana passa por todos os pontos ativos, com horários estimados.
        $times = ['08:30', '10:00', '11:30'];
        foreach (DeliveryPoint::active()->get() as $index => $point) {
            $cycle->cycleDeliveryPoints()->create([
                'delivery_point_id' => $point->id,
                'scheduled_at' => $deliveryDate->copy()->setTimeFromTimeString($times[$index] ?? '09:00'),
                'capacity' => null,
                'notes' => null,
            ]);
        }

        $cycle->load('cycleProducts', 'cycleDeliveryPoints');
        $points = $cycle->cycleDeliveryPoints;
        $cp = fn (string $slug) => $cycle->cycleProducts
            ->first(fn (CycleProduct $c) => $c->product->slug === $slug);

        // Reserva de cliente registrado no primeiro ponto.
        $customer = User::where('email', 'cliente@horta.local')->first();
        if ($customer && $points->count() > 0) {
            $reservations->place(
                $cycle,
                $points[0]->id,
                array_values(array_filter([
                    optional($cp('alface-crespa'))->id ? ['cycle_product_id' => $cp('alface-crespa')->id, 'quantity' => 2] : null,
                    optional($cp('tomate-italiano'))->id ? ['cycle_product_id' => $cp('tomate-italiano')->id, 'quantity' => 1.5] : null,
                    optional($cp('manjericao'))->id ? ['cycle_product_id' => $cp('manjericao')->id, 'quantity' => 1] : null,
                ])),
                ['user_id' => $customer->id, 'notes' => 'Pode deixar na portaria.'],
            );
        }

        // Reserva de convidado no segundo ponto.
        if ($points->count() > 1) {
            $reservations->place(
                $cycle,
                $points[1]->id,
                array_values(array_filter([
                    optional($cp('rucula'))->id ? ['cycle_product_id' => $cp('rucula')->id, 'quantity' => 2] : null,
                    optional($cp('morango'))->id ? ['cycle_product_id' => $cp('morango')->id, 'quantity' => 1] : null,
                    optional($cp('ovos-caipira'))->id ? ['cycle_product_id' => $cp('ovos-caipira')->id, 'quantity' => 1] : null,
                ])),
                [
                    'guest_name' => 'Marina Souza',
                    'guest_email' => 'marina@example.com',
                    'guest_phone' => '(11) 98888-2222',
                ],
            );
        }
    }
}
