<?php

namespace App\Http\Controllers;

use App\Models\DeliveryCycle;
use App\Support\CyclePresenter;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(): Response
    {
        $cycle = DeliveryCycle::open()
            ->with(['cycleProducts.product', 'cycleDeliveryPoints.deliveryPoint'])
            ->orderByDesc('delivery_date')
            ->first();

        if (! $cycle) {
            return Inertia::render('Cart/Index', ['cycle' => null, 'products' => [], 'points' => []]);
        }

        $reserved = CyclePresenter::reservedMap($cycle);

        return Inertia::render('Cart/Index', [
            'cycle' => CyclePresenter::summary($cycle),
            'products' => $cycle->cycleProducts
                ->filter(fn ($cp) => $cp->product && $cp->product->is_active)
                ->map(fn ($cp) => CyclePresenter::product($cp, $reserved))
                ->values()
                ->all(),
            'points' => $cycle->cycleDeliveryPoints
                ->map(fn ($p) => CyclePresenter::point($p))
                ->values()
                ->all(),
        ]);
    }
}
