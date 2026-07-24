<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservationLookupController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Reservation/Lookup');
    }

    public function find(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'confirmation_code' => ['required', 'string'],
            'contact' => ['nullable', 'string'],
        ]);

        $code = strtoupper(trim($data['confirmation_code']));

        $reservation = Reservation::where('confirmation_code', $code)->first();

        // Reforço opcional: se informar contato, precisa bater com e-mail/WhatsApp da reserva.
        $contactOk = empty($data['contact'])
            || $reservation && in_array($data['contact'], array_filter([
                $reservation->guest_phone,
                $reservation->guest_email,
            ]), true);

        if (! $reservation || ! $contactOk) {
            return back()->withErrors([
                'confirmation_code' => 'Reserva não encontrada. Confira o código informado.',
            ]);
        }

        return redirect()->route('reservation.confirmation', [
            'reservation' => $reservation->id,
            'code' => $reservation->confirmation_code,
        ]);
    }
}
