<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Models\DeliveryCycle;
use App\Models\Reservation;
use App\Support\CyclePresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(Request $request, DeliveryCycle $ciclo): Response
    {
        $pointId = $request->integer('point_id') ?: null;

        $query = $ciclo->reservations()
            ->with(['items', 'cycleDeliveryPoint.deliveryPoint', 'user'])
            ->orderByDesc('created_at');

        if ($pointId) {
            $query->where('cycle_delivery_point_id', $pointId);
        }

        $reservations = $query->get()->map(fn (Reservation $r) => [
            'id' => $r->id,
            'customer_name' => $r->customerName(),
            'is_guest' => $r->isGuest(),
            'contact' => $r->isGuest() ? ($r->guest_phone ?? $r->guest_email) : $r->user?->email,
            'delivery_point_name' => $r->delivery_point_name,
            'cycle_delivery_point_id' => $r->cycle_delivery_point_id,
            'status' => $r->status->value,
            'status_label' => $r->status->label(),
            'total_amount' => round((float) $r->total_amount, 2),
            'confirmation_code' => $r->confirmation_code,
            'notes' => $r->notes,
            'items' => $r->items->map(fn ($item) => [
                'product_name' => $item->product_name,
                'unit_label' => $item->unit->label(),
                'quantity' => (float) $item->quantity,
                'line_total' => round((float) $item->line_total, 2),
            ])->all(),
        ]);

        $ciclo->load('cycleDeliveryPoints.deliveryPoint');

        return Inertia::render('admin/reservations/Index', [
            'cycle' => CyclePresenter::summary($ciclo),
            'points' => $ciclo->cycleDeliveryPoints->map(fn ($p) => CyclePresenter::point($p))->values()->all(),
            'reservations' => $reservations,
            'filters' => ['point_id' => $pointId],
        ]);
    }

    public function updateStatus(Request $request, Reservation $reservation): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', new Enum(ReservationStatus::class)],
        ]);

        $reservation->update(['status' => $validated['status']]);

        return back()->with('success', 'Status da reserva atualizado.');
    }
}
