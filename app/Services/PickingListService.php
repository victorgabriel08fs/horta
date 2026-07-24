<?php

namespace App\Services;

use App\Models\DeliveryCycle;
use App\Models\Reservation;

class PickingListService
{
    /**
     * Gera a lista de separação/colheita de um ciclo:
     * total geral por produto, por ponto de entrega e por cliente.
     *
     * @return array{
     *   byProduct: array<int, array{product_name: string, unit: string, quantity: float}>,
     *   byPoint: array<int, array{point_name: string, scheduled_at: string|null, reservations_count: int, total: float, items: array<int, array{product_name: string, unit: string, quantity: float}>}>,
     *   byCustomer: array<int, array{name: string, point_name: string, confirmation_code: string, total: float, items: array<int, array{product_name: string, unit: string, quantity: float}>}>,
     *   totals: array{reservations: int, amount: float}
     * }
     */
    public function forCycle(DeliveryCycle $cycle): array
    {
        $reservations = $cycle->reservations()
            ->active()
            ->with(['items', 'cycleDeliveryPoint.deliveryPoint', 'user'])
            ->get();

        return [
            'byProduct' => $this->aggregateByProduct($reservations),
            'byPoint' => $this->aggregateByPoint($reservations),
            'byCustomer' => $this->aggregateByCustomer($reservations),
            'totals' => [
                'reservations' => $reservations->count(),
                'amount' => round((float) $reservations->sum(fn (Reservation $r) => (float) $r->total_amount), 2),
            ],
        ];
    }

    /** @param  \Illuminate\Support\Collection<int, Reservation>  $reservations */
    private function aggregateByProduct($reservations): array
    {
        $totals = [];

        foreach ($reservations as $reservation) {
            foreach ($reservation->items as $item) {
                $key = $item->product_name.'|'.$item->unit->value;
                $totals[$key] ??= [
                    'product_name' => $item->product_name,
                    'unit' => $item->unit->value,
                    'quantity' => 0.0,
                ];
                $totals[$key]['quantity'] += (float) $item->quantity;
            }
        }

        return array_values(collect($totals)->sortBy('product_name')->all());
    }

    /** @param  \Illuminate\Support\Collection<int, Reservation>  $reservations */
    private function aggregateByPoint($reservations): array
    {
        $points = [];

        foreach ($reservations as $reservation) {
            $cdp = $reservation->cycleDeliveryPoint;
            $key = $cdp->id;

            $points[$key] ??= [
                'point_name' => $reservation->delivery_point_name,
                'scheduled_at' => optional($cdp->scheduled_at)->toIso8601String(),
                'reservations_count' => 0,
                'total' => 0.0,
                'items' => [],
            ];

            $points[$key]['reservations_count']++;
            $points[$key]['total'] += (float) $reservation->total_amount;

            foreach ($reservation->items as $item) {
                $itemKey = $item->product_name.'|'.$item->unit->value;
                $points[$key]['items'][$itemKey] ??= [
                    'product_name' => $item->product_name,
                    'unit' => $item->unit->value,
                    'quantity' => 0.0,
                ];
                $points[$key]['items'][$itemKey]['quantity'] += (float) $item->quantity;
            }
        }

        return array_values(collect($points)->map(function ($point) {
            $point['items'] = array_values(collect($point['items'])->sortBy('product_name')->all());
            $point['total'] = round($point['total'], 2);

            return $point;
        })->sortBy('point_name')->all());
    }

    /** @param  \Illuminate\Support\Collection<int, Reservation>  $reservations */
    private function aggregateByCustomer($reservations): array
    {
        return $reservations->map(fn (Reservation $reservation) => [
            'name' => $reservation->customerName(),
            'point_name' => $reservation->delivery_point_name,
            'confirmation_code' => $reservation->confirmation_code,
            'total' => round((float) $reservation->total_amount, 2),
            'items' => $reservation->items->map(fn ($item) => [
                'product_name' => $item->product_name,
                'unit' => $item->unit->value,
                'quantity' => (float) $item->quantity,
            ])->all(),
        ])->sortBy('point_name')->values()->all();
    }
}
