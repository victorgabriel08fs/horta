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
            'contact' => ['required', 'string'],
        ], [
            'contact.required' => 'Informe o WhatsApp ou e-mail usado na reserva.',
        ]);

        $code = strtoupper(trim($data['confirmation_code']));
        $reservation = Reservation::where('confirmation_code', $code)->first();

        // O contato informado precisa bater com o e-mail ou WhatsApp da reserva.
        $contactOk = $reservation && $this->contactMatches($reservation, trim($data['contact']));

        if (! $reservation || ! $contactOk) {
            return back()->withErrors([
                'confirmation_code' => 'Reserva não encontrada. Confira o código e o contato informados.',
            ]);
        }

        return redirect()->route('reservation.confirmation', [
            'reservation' => $reservation->id,
            'code' => $reservation->confirmation_code,
        ]);
    }

    private function contactMatches(Reservation $reservation, string $contact): bool
    {
        $emailMatch = $reservation->guest_email
            && strcasecmp($reservation->guest_email, $contact) === 0;

        $digits = preg_replace('/\D+/', '', $contact);
        $phoneMatch = $reservation->guest_phone
            && $digits !== ''
            && preg_replace('/\D+/', '', $reservation->guest_phone) === $digits;

        return $emailMatch || $phoneMatch;
    }
}
