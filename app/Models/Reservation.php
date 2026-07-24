<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_cycle_id',
        'cycle_delivery_point_id',
        'user_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'delivery_point_name',
        'status',
        'confirmation_code',
        'total_amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => ReservationStatus::class,
            'total_amount' => 'decimal:2',
        ];
    }

    public function deliveryCycle(): BelongsTo
    {
        return $this->belongsTo(DeliveryCycle::class);
    }

    public function cycleDeliveryPoint(): BelongsTo
    {
        return $this->belongsTo(CycleDeliveryPoint::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReservationItem::class);
    }

    /** Nome do cliente (registrado usa a conta; convidado usa guest_name). */
    public function customerName(): string
    {
        return $this->user?->name ?? (string) $this->guest_name;
    }

    public function isGuest(): bool
    {
        return $this->user_id === null;
    }

    public function canBeCancelled(): bool
    {
        return $this->status === ReservationStatus::Confirmed
            && $this->deliveryCycle->isOrderingOpen();
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            ReservationStatus::Confirmed->value,
            ReservationStatus::Delivered->value,
        ]);
    }
}
