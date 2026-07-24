<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryPoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'reference',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function cycleDeliveryPoints(): HasMany
    {
        return $this->hasMany(CycleDeliveryPoint::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
