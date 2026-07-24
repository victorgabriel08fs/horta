<?php

namespace App\Models;

use App\Enums\CycleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class DeliveryCycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'delivery_date',
        'order_opens_at',
        'order_closes_at',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'delivery_date' => 'date',
            'order_opens_at' => 'datetime',
            'order_closes_at' => 'datetime',
            'status' => CycleStatus::class,
        ];
    }

    public function cycleProducts(): HasMany
    {
        return $this->hasMany(CycleProduct::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'cycle_products')
            ->withPivot(['id', 'quantity_available', 'price_override'])
            ->withTimestamps();
    }

    public function cycleDeliveryPoints(): HasMany
    {
        return $this->hasMany(CycleDeliveryPoint::class);
    }

    public function deliveryPoints(): BelongsToMany
    {
        return $this->belongsToMany(DeliveryPoint::class, 'cycle_delivery_points')
            ->withPivot(['id', 'scheduled_at', 'capacity', 'notes'])
            ->withTimestamps();
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /** Reservas são aceitas apenas com status "open" e dentro da janela de datas. */
    public function isOrderingOpen(): bool
    {
        if (! $this->status->acceptsReservations()) {
            return false;
        }

        $now = Carbon::now();

        return $now->betweenIncluded($this->order_opens_at, $this->order_closes_at);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', CycleStatus::Open->value);
    }
}
