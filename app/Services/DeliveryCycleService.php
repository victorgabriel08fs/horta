<?php

namespace App\Services;

use App\Enums\CycleStatus;
use App\Enums\ReservationStatus;
use App\Models\DeliveryCycle;
use RuntimeException;

class DeliveryCycleService
{
    /** Publica o ciclo (draft/closed → open). Exige produtos e ao menos um ponto. */
    public function open(DeliveryCycle $cycle): void
    {
        if ($cycle->cycleProducts()->count() === 0) {
            throw new RuntimeException('Adicione ao menos um produto ao ciclo antes de abrir.');
        }

        if ($cycle->cycleDeliveryPoints()->count() === 0) {
            throw new RuntimeException('Adicione ao menos um ponto de entrega ao ciclo antes de abrir.');
        }

        $cycle->update(['status' => CycleStatus::Open]);
    }

    /** Fecha a janela de pedidos (open → closed) para gerar a separação. */
    public function close(DeliveryCycle $cycle): void
    {
        if ($cycle->status !== CycleStatus::Open) {
            throw new RuntimeException('Apenas ciclos abertos podem ser fechados.');
        }

        $cycle->update(['status' => CycleStatus::Closed]);
    }

    /** Marca o ciclo como entregue e todas as reservas confirmadas como entregues. */
    public function markDelivered(DeliveryCycle $cycle): void
    {
        $cycle->reservations()
            ->where('status', ReservationStatus::Confirmed->value)
            ->update(['status' => ReservationStatus::Delivered->value]);

        $cycle->update(['status' => CycleStatus::Delivered]);
    }
}
