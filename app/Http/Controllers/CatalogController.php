<?php

namespace App\Http\Controllers;

use App\Models\DeliveryCycle;
use App\Support\CyclePresenter;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(): Response
    {
        $cycle = DeliveryCycle::open()
            ->with(['cycleProducts.product.category', 'cycleDeliveryPoints.deliveryPoint'])
            ->orderByDesc('delivery_date')
            ->first();

        if (! $cycle) {
            return Inertia::render('Catalog/Index', [
                'cycle' => null,
                'points' => [],
                'catalog' => [],
            ]);
        }

        $reserved = CyclePresenter::reservedMap($cycle);

        $products = $cycle->cycleProducts
            ->filter(fn ($cp) => $cp->product && $cp->product->is_active)
            ->map(fn ($cp) => CyclePresenter::product($cp, $reserved))
            ->values();

        $catalog = $products
            ->groupBy(fn ($p) => $p['category'] ?? 'Outros')
            ->map(fn ($items, $name) => [
                'category' => $name,
                'products' => $items->values()->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('Catalog/Index', [
            'cycle' => CyclePresenter::summary($cycle),
            'points' => $cycle->cycleDeliveryPoints
                ->map(fn ($p) => CyclePresenter::point($p))
                ->values()
                ->all(),
            'catalog' => $catalog,
        ]);
    }
}
