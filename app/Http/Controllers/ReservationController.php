<?php

namespace App\Http\Controllers;

use App\Exceptions\ReservationException;
use App\Http\Requests\StoreReservationRequest;
use App\Models\DeliveryCycle;
use App\Models\Reservation;
use App\Services\ReservationService;
use App\Support\CyclePresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function __construct(private readonly ReservationService $reservations)
    {
    }

    /** Tela de checkout: dados do cliente + escolha do ponto de entrega. */
    public function create(): Response|RedirectResponse
    {
        $cycle = $this->openCycle();

        if (! $cycle) {
            return redirect()->route('catalog.index')
                ->with('error', 'Nenhum ciclo de entrega está aberto no momento.');
        }

        $reserved = CyclePresenter::reservedMap($cycle);

        return Inertia::render('Reservation/Checkout', [
            'cycle' => CyclePresenter::summary($cycle),
            'points' => $cycle->cycleDeliveryPoints
                ->map(fn ($p) => CyclePresenter::point($p))
                ->values()
                ->all(),
            'products' => $cycle->cycleProducts
                ->filter(fn ($cp) => $cp->product && $cp->product->is_active)
                ->map(fn ($cp) => CyclePresenter::product($cp, $reserved))
                ->values()
                ->all(),
        ]);
    }

    public function store(StoreReservationRequest $request): RedirectResponse
    {
        $cycle = $this->openCycle();

        if (! $cycle) {
            throw ValidationException::withMessages([
                'items' => 'Nenhum ciclo de entrega está aberto no momento.',
            ]);
        }

        $user = $request->user();

        try {
            $reservation = $this->reservations->place(
                $cycle,
                (int) $request->integer('cycle_delivery_point_id'),
                $request->input('items', []),
                [
                    'user_id' => $user?->id,
                    'guest_name' => $user ? $user->name : $request->string('guest_name'),
                    'guest_email' => $user ? $user->email : $request->string('guest_email'),
                    'guest_phone' => $user ? $user->phone : $request->string('guest_phone'),
                    'notes' => $request->input('notes'),
                ],
            );
        } catch (ReservationException $e) {
            throw ValidationException::withMessages(['items' => $e->getMessage()]);
        }

        return redirect()
            ->route('reservation.confirmation', $reservation)
            ->with('just_reserved_id', $reservation->id)
            ->with('success', 'Reserva confirmada com sucesso!');
    }

    public function confirmation(Request $request, Reservation $reservation): Response
    {
        $this->authorizeView($request, $reservation);

        $reservation->load(['items', 'cycleDeliveryPoint.deliveryPoint', 'deliveryCycle', 'user']);

        return Inertia::render('Reservation/Confirmation', [
            'reservation' => $this->presentReservation($reservation),
            'can_cancel' => $reservation->canBeCancelled(),
        ]);
    }

    public function destroy(Request $request, Reservation $reservation): RedirectResponse
    {
        $user = $request->user();
        $codeMatches = $request->input('confirmation_code') === $reservation->confirmation_code;
        $isOwner = $user && ($user->isAdmin() || $reservation->user_id === $user->id);

        abort_unless($isOwner || $codeMatches, 403);

        if (! $reservation->canBeCancelled()) {
            return back()->with('error', 'Esta reserva não pode mais ser cancelada.');
        }

        $this->reservations->cancel($reservation);

        return back()->with('success', 'Reserva cancelada. O estoque foi devolvido.');
    }

    private function openCycle(): ?DeliveryCycle
    {
        return DeliveryCycle::open()
            ->with(['cycleProducts.product.category', 'cycleDeliveryPoints.deliveryPoint'])
            ->orderByDesc('delivery_date')
            ->first();
    }

    private function authorizeView(Request $request, Reservation $reservation): void
    {
        $user = $request->user();
        $isOwner = $user && ($user->isAdmin() || $reservation->user_id === $user->id);
        $justReserved = $request->session()->get('just_reserved_id') === $reservation->id;
        $codeMatches = $request->query('code') === $reservation->confirmation_code;

        abort_unless($isOwner || $justReserved || $codeMatches, 403);
    }

    private function presentReservation(Reservation $reservation): array
    {
        return [
            'id' => $reservation->id,
            'confirmation_code' => $reservation->confirmation_code,
            'status' => $reservation->status->value,
            'status_label' => $reservation->status->label(),
            'customer_name' => $reservation->customerName(),
            'is_guest' => $reservation->isGuest(),
            'guest_phone' => $reservation->guest_phone,
            'delivery_point_name' => $reservation->delivery_point_name,
            'scheduled_at' => optional($reservation->cycleDeliveryPoint?->scheduled_at)->toIso8601String(),
            'delivery_date' => $reservation->deliveryCycle->delivery_date->toIso8601String(),
            'total_amount' => round((float) $reservation->total_amount, 2),
            'notes' => $reservation->notes,
            'items' => $reservation->items->map(fn ($item) => [
                'product_name' => $item->product_name,
                'unit' => $item->unit->value,
                'unit_label' => $item->unit->label(),
                'quantity' => (float) $item->quantity,
                'unit_price' => round((float) $item->unit_price, 2),
                'line_total' => round((float) $item->line_total, 2),
            ])->all(),
        ];
    }
}
