<?php

namespace App\Services;

use App\Enums\ReservationStatus;
use App\Exceptions\ReservationException;
use App\Models\CycleDeliveryPoint;
use App\Models\CycleProduct;
use App\Models\DeliveryCycle;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReservationService
{
    /**
     * Efetiva uma reserva em uma transação com trava de estoque por produto do ciclo.
     *
     * @param  array<int, array{cycle_product_id: int, quantity: float|int|string}>  $items
     * @param  array{user_id?: int|null, guest_name?: string|null, guest_email?: string|null, guest_phone?: string|null, notes?: string|null}  $customer
     */
    public function place(DeliveryCycle $cycle, int $cycleDeliveryPointId, array $items, array $customer): Reservation
    {
        if (empty($items)) {
            throw ReservationException::emptyCart();
        }

        return DB::transaction(function () use ($cycle, $cycleDeliveryPointId, $items, $customer): Reservation {
            if (! $cycle->isOrderingOpen()) {
                throw ReservationException::cycleClosed();
            }

            /** @var CycleDeliveryPoint|null $point */
            $point = CycleDeliveryPoint::with('deliveryPoint')
                ->where('id', $cycleDeliveryPointId)
                ->where('delivery_cycle_id', $cycle->id)
                ->first();

            if (! $point) {
                throw ReservationException::invalidPoint();
            }

            // Verificação opcional de capacidade do ponto (Fase 2).
            if ($point->capacity !== null && $point->activeReservationsCount() >= $point->capacity) {
                throw ReservationException::pointFull($point->deliveryPoint->name);
            }

            $lineItems = [];
            $total = 0.0;

            foreach ($items as $item) {
                $quantity = (float) $item['quantity'];

                /** @var CycleProduct|null $cycleProduct */
                $cycleProduct = CycleProduct::query()
                    ->with('product')
                    ->where('id', $item['cycle_product_id'])
                    ->where('delivery_cycle_id', $cycle->id)
                    ->lockForUpdate() // SELECT ... FOR UPDATE — serializa reservas concorrentes
                    ->first();

                if (! $cycleProduct || ! $cycleProduct->product->is_active) {
                    throw ReservationException::productUnavailable($cycleProduct?->product->name ?? 'produto');
                }

                $productName = $cycleProduct->product->name;
                $unit = $cycleProduct->product->unit;

                if ($quantity <= 0) {
                    throw ReservationException::invalidQuantity($productName);
                }

                // Unidades não fracionáveis exigem quantidade inteira.
                if (! $unit->allowsFraction() && fmod($quantity, 1.0) !== 0.0) {
                    throw ReservationException::invalidQuantity($productName);
                }

                // Restante recalculado DENTRO da transação (fonte única de verdade).
                $remaining = (float) $cycleProduct->quantity_available - $this->reservedQuantity($cycleProduct->id);

                if ($quantity > $remaining) {
                    throw ReservationException::insufficientStock($productName, max($remaining, 0));
                }

                $unitPrice = $cycleProduct->effectivePrice();
                $lineTotal = round($unitPrice * $quantity, 2);
                $total += $lineTotal;

                $lineItems[] = [
                    'product_id' => $cycleProduct->product_id,
                    'cycle_product_id' => $cycleProduct->id,
                    'product_name' => $productName,
                    'unit' => $unit->value,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                ];
            }

            $reservation = Reservation::create([
                'delivery_cycle_id' => $cycle->id,
                'cycle_delivery_point_id' => $point->id,
                'user_id' => $customer['user_id'] ?? null,
                'guest_name' => $customer['guest_name'] ?? null,
                'guest_email' => $customer['guest_email'] ?? null,
                'guest_phone' => $customer['guest_phone'] ?? null,
                'delivery_point_name' => $point->deliveryPoint->name,
                'status' => ReservationStatus::Confirmed,
                'confirmation_code' => $this->generateConfirmationCode(),
                'total_amount' => round($total, 2),
                'notes' => $customer['notes'] ?? null,
            ]);

            $reservation->items()->createMany($lineItems);

            return $reservation->load(['items', 'cycleDeliveryPoint.deliveryPoint', 'deliveryCycle']);
        });
    }

    /** Soma das quantidades reservadas em reservas ativas para um cycle_product. */
    private function reservedQuantity(int $cycleProductId): float
    {
        return (float) DB::table('reservation_items')
            ->join('reservations', 'reservations.id', '=', 'reservation_items.reservation_id')
            ->where('reservation_items.cycle_product_id', $cycleProductId)
            ->whereIn('reservations.status', [
                ReservationStatus::Confirmed->value,
                ReservationStatus::Delivered->value,
            ])
            ->sum('reservation_items.quantity');
    }

    private function generateConfirmationCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (Reservation::where('confirmation_code', $code)->exists());

        return $code;
    }

    /** Cancela a reserva (devolve o estoque automaticamente pela mudança de status). */
    public function cancel(Reservation $reservation): void
    {
        $reservation->update(['status' => ReservationStatus::Cancelled]);
    }
}
