<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(Request $request): Response
    {
        $reservations = $request->user()->reservations()
            ->with(['items', 'deliveryCycle', 'cycleDeliveryPoint.deliveryPoint'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($reservation) => [
                'id' => $reservation->id,
                'confirmation_code' => $reservation->confirmation_code,
                'status' => $reservation->status->value,
                'status_label' => $reservation->status->label(),
                'delivery_point_name' => $reservation->delivery_point_name,
                'delivery_date' => $reservation->deliveryCycle->delivery_date->toIso8601String(),
                'scheduled_at' => optional($reservation->cycleDeliveryPoint?->scheduled_at)->toIso8601String(),
                'total_amount' => round((float) $reservation->total_amount, 2),
                'can_cancel' => $reservation->canBeCancelled(),
                'items_count' => $reservation->items->count(),
                'items' => $reservation->items->map(fn ($item) => [
                    'product_name' => $item->product_name,
                    'unit_label' => $item->unit->label(),
                    'quantity' => (float) $item->quantity,
                    'line_total' => round((float) $item->line_total, 2),
                ])->all(),
            ]);

        return Inertia::render('Customer/Reservations', [
            'reservations' => $reservations,
        ]);
    }
}
