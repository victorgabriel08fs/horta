<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CycleDeliveryPoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_cycle_id',
        'delivery_point_id',
        'scheduled_at',
        'capacity',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'capacity' => 'integer',
        ];
    }

    public function deliveryCycle(): BelongsTo
    {
        return $this->belongsTo(DeliveryCycle::class);
    }

    public function deliveryPoint(): BelongsTo
    {
        return $this->belongsTo(DeliveryPoint::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /** Número de reservas ativas neste ponto (para conferência de capacidade — Fase 2). */
    public function activeReservationsCount(): int
    {
        return $this->reservations()
            ->whereIn('status', [
                ReservationStatus::Confirmed->value,
                ReservationStatus::Delivered->value,
            ])
            ->count();
    }
}
