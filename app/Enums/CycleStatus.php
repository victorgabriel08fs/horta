<?php

namespace App\Enums;

enum CycleStatus: string
{
    case Draft = 'draft';
    case Open = 'open';
    case Closed = 'closed';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Rascunho',
            self::Open => 'Aberto',
            self::Closed => 'Fechado',
            self::Delivered => 'Entregue',
            self::Cancelled => 'Cancelado',
        };
    }

    /** O ciclo aceita reservas enquanto está aberto (a janela de datas é checada à parte). */
    public function acceptsReservations(): bool
    {
        return $this === self::Open;
    }
}
