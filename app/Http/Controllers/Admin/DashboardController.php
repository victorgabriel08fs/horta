<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryCycle;
use App\Models\Product;
use App\Services\PickingListService;
use App\Support\CyclePresenter;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(PickingListService $pickingList): Response
    {
        $cycle = DeliveryCycle::open()->orderByDesc('delivery_date')->first()
            ?? DeliveryCycle::orderByDesc('delivery_date')->first();

        $summary = null;
        $picking = null;
        $recent = [];

        if ($cycle) {
            $summary = CyclePresenter::summary($cycle);
            $picking = $pickingList->forCycle($cycle);
            $recent = $cycle->reservations()
                ->with('cycleDeliveryPoint.deliveryPoint')
                ->orderByDesc('created_at')
                ->limit(8)
                ->get()
                ->map(fn ($r) => [
                    'id' => $r->id,
                    'customer_name' => $r->customerName(),
                    'delivery_point_name' => $r->delivery_point_name,
                    'status' => $r->status->value,
                    'status_label' => $r->status->label(),
                    'total_amount' => round((float) $r->total_amount, 2),
                    'confirmation_code' => $r->confirmation_code,
                ])->all();
        }

        return Inertia::render('admin/Dashboard', [
            'cycle' => $summary,
            'stats' => [
                'products' => Product::count(),
                'active_cycles' => DeliveryCycle::open()->count(),
                'reservations' => $picking['totals']['reservations'] ?? 0,
                'expected_amount' => $picking['totals']['amount'] ?? 0,
            ],
            'topProducts' => $picking['byProduct'] ?? [],
            'byPoint' => $picking['byPoint'] ?? [],
            'recentReservations' => $recent,
        ]);
    }
}
