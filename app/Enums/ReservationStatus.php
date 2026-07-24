<?php

namespace App\Enums;

enum ReservationStatus: string
{
    case Confirmed = 'confirmed';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Confirmed => 'Confirmada',
            self::Delivered => 'Entregue',
            self::Cancelled => 'Cancelada',
        };
    }

    /** Reservas ativas consomem estoque do ciclo. */
    public function isActive(): bool
    {
        return $this === self::Confirmed || $this === self::Delivered;
    }
}
