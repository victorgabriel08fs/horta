<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CycleProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_cycle_id',
        'product_id',
        'quantity_available',
        'price_override',
    ];

    protected function casts(): array
    {
        return [
            'quantity_available' => 'decimal:2',
            'price_override' => 'decimal:2',
        ];
    }

    public function deliveryCycle(): BelongsTo
    {
        return $this->belongsTo(DeliveryCycle::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function reservationItems(): HasMany
    {
        return $this->hasMany(ReservationItem::class);
    }

    /** Preço efetivo do produto neste ciclo (override do ciclo ou preço padrão). */
    public function effectivePrice(): float
    {
        return (float) ($this->price_override ?? $this->product->price);
    }

    /** Quantidade já reservada em reservas ativas (confirmadas + entregues). */
    public function reservedQuantity(): float
    {
        return (float) $this->reservationItems()
            ->whereHas('reservation', function ($query) {
                $query->whereIn('status', [
                    ReservationStatus::Confirmed->value,
                    ReservationStatus::Delivered->value,
                ]);
            })
            ->sum('quantity');
    }

    /** Quantidade ainda disponível: ofertada − reservada. Fonte única de verdade. */
    public function remainingQuantity(): float
    {
        return (float) $this->quantity_available - $this->reservedQuantity();
    }
}
