<?php

namespace App\Support;

use App\Enums\ReservationStatus;
use App\Models\CycleDeliveryPoint;
use App\Models\CycleProduct;
use App\Models\DeliveryCycle;
use Illuminate\Support\Facades\DB;

class CyclePresenter
{
    /** Resumo do ciclo para banners e checkout. */
    public static function summary(DeliveryCycle $cycle): array
    {
        return [
            'id' => $cycle->id,
            'title' => $cycle->title,
            'status' => $cycle->status->value,
            'status_label' => $cycle->status->label(),
            'delivery_date' => $cycle->delivery_date->toIso8601String(),
            'order_opens_at' => $cycle->order_opens_at->toIso8601String(),
            'order_closes_at' => $cycle->order_closes_at->toIso8601String(),
            'is_ordering_open' => $cycle->isOrderingOpen(),
        ];
    }

    /**
     * Mapa cycle_product_id => quantidade já reservada (reservas ativas), em uma query.
     *
     * @return array<int, float>
     */
    public static function reservedMap(DeliveryCycle $cycle): array
    {
        return DB::table('reservation_items')
            ->join('reservations', 'reservations.id', '=', 'reservation_items.reservation_id')
            ->where('reservations.delivery_cycle_id', $cycle->id)
            ->whereIn('reservations.status', [
                ReservationStatus::Confirmed->value,
                ReservationStatus::Delivered->value,
            ])
            ->groupBy('reservation_items.cycle_product_id')
            ->selectRaw('reservation_items.cycle_product_id as id, SUM(reservation_items.quantity) as qty')
            ->pluck('qty', 'id')
            ->map(fn ($qty) => (float) $qty)
            ->all();
    }

    /**
     * @param  array<int, float>  $reservedMap
     */
    public static function product(CycleProduct $cycleProduct, array $reservedMap = []): array
    {
        $product = $cycleProduct->product;
        $reserved = $reservedMap[$cycleProduct->id] ?? 0.0;
        $remaining = max((float) $cycleProduct->quantity_available - $reserved, 0.0);

        return [
            'cycle_product_id' => $cycleProduct->id,
            'product_id' => $cycleProduct->product_id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'category' => $product->category?->name,
            'unit' => $product->unit->value,
            'unit_label' => $product->unit->label(),
            'price' => round($cycleProduct->effectivePrice(), 2),
            'quantity_available' => (float) $cycleProduct->quantity_available,
            'remaining' => round($remaining, 2),
            'step' => $product->unit->step(),
            'allows_fraction' => $product->unit->allowsFraction(),
            'image_url' => $product->image_url,
        ];
    }

    public static function point(CycleDeliveryPoint $point): array
    {
        return [
            'id' => $point->id,
            'name' => $point->deliveryPoint->name,
            'address' => $point->deliveryPoint->address,
            'reference' => $point->deliveryPoint->reference,
            'latitude' => $point->deliveryPoint->latitude !== null ? (float) $point->deliveryPoint->latitude : null,
            'longitude' => $point->deliveryPoint->longitude !== null ? (float) $point->deliveryPoint->longitude : null,
            'scheduled_at' => optional($point->scheduled_at)->toIso8601String(),
            'capacity' => $point->capacity,
            'notes' => $point->notes,
        ];
    }
}
