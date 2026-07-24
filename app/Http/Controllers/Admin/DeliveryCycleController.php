<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CycleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeliveryCycleRequest;
use App\Models\DeliveryCycle;
use App\Models\DeliveryPoint;
use App\Models\Product;
use App\Services\DeliveryCycleService;
use App\Services\PickingListService;
use App\Support\CyclePresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class DeliveryCycleController extends Controller
{
    public function __construct(private readonly DeliveryCycleService $cycles)
    {
    }

    public function index(): Response
    {
        return Inertia::render('admin/cycles/Index', [
            'cycles' => DeliveryCycle::withCount(['reservations', 'cycleProducts', 'cycleDeliveryPoints'])
                ->orderByDesc('delivery_date')
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                    'delivery_date' => $c->delivery_date->toIso8601String(),
                    'status' => $c->status->value,
                    'status_label' => $c->status->label(),
                    'reservations_count' => $c->reservations_count,
                    'products_count' => $c->cycle_products_count,
                    'points_count' => $c->cycle_delivery_points_count,
                ]),
        ]);
    }

    public function create(): Response
    {
        return $this->form(null);
    }

    public function store(StoreDeliveryCycleRequest $request): RedirectResponse
    {
        $cycle = DB::transaction(function () use ($request) {
            $cycle = DeliveryCycle::create($this->cycleData($request));
            $this->syncProducts($cycle, $request->input('products', []));
            $this->syncPoints($cycle, $request->input('points', []));

            return $cycle;
        });

        return redirect()->route('admin.ciclos.show', $cycle)->with('success', 'Ciclo criado.');
    }

    public function show(DeliveryCycle $ciclo): Response
    {
        $ciclo->load(['cycleProducts.product', 'cycleDeliveryPoints.deliveryPoint']);
        $reserved = CyclePresenter::reservedMap($ciclo);

        return Inertia::render('admin/cycles/Show', [
            'cycle' => CyclePresenter::summary($ciclo),
            'notes' => $ciclo->notes,
            'products' => $ciclo->cycleProducts
                ->map(fn ($cp) => CyclePresenter::product($cp, $reserved))
                ->sortBy('name')
                ->values()
                ->all(),
            'points' => $ciclo->cycleDeliveryPoints
                ->map(fn ($p) => CyclePresenter::point($p))
                ->values()
                ->all(),
        ]);
    }

    public function edit(DeliveryCycle $ciclo): Response
    {
        return $this->form($ciclo);
    }

    public function update(StoreDeliveryCycleRequest $request, DeliveryCycle $ciclo): RedirectResponse
    {
        DB::transaction(function () use ($request, $ciclo) {
            $ciclo->update($this->cycleData($request));
            $this->syncProducts($ciclo, $request->input('products', []));
            $this->syncPoints($ciclo, $request->input('points', []));
        });

        return redirect()->route('admin.ciclos.show', $ciclo)->with('success', 'Ciclo atualizado.');
    }

    public function destroy(DeliveryCycle $ciclo): RedirectResponse
    {
        if ($ciclo->reservations()->exists()) {
            return back()->with('error', 'Não é possível excluir um ciclo que já possui reservas.');
        }

        $ciclo->delete();

        return redirect()->route('admin.ciclos.index')->with('success', 'Ciclo removido.');
    }

    public function open(DeliveryCycle $ciclo): RedirectResponse
    {
        try {
            $this->cycles->open($ciclo);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Ciclo aberto para reservas.');
    }

    public function close(DeliveryCycle $ciclo): RedirectResponse
    {
        try {
            $this->cycles->close($ciclo);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Ciclo fechado. Gere a lista de separação.');
    }

    public function markDelivered(DeliveryCycle $ciclo): RedirectResponse
    {
        $this->cycles->markDelivered($ciclo);

        return back()->with('success', 'Ciclo marcado como entregue.');
    }

    public function pickingList(DeliveryCycle $ciclo, PickingListService $pickingList): Response
    {
        return Inertia::render('admin/cycles/PickingList', [
            'cycle' => CyclePresenter::summary($ciclo),
            'picking' => $pickingList->forCycle($ciclo),
        ]);
    }

    private function form(?DeliveryCycle $cycle): Response
    {
        $cycle?->load(['cycleProducts', 'cycleDeliveryPoints']);

        return Inertia::render('admin/cycles/Form', [
            'cycle' => $cycle ? [
                'id' => $cycle->id,
                'title' => $cycle->title,
                'delivery_date' => $cycle->delivery_date->toDateString(),
                'order_opens_at' => $cycle->order_opens_at->format('Y-m-d\TH:i'),
                'order_closes_at' => $cycle->order_closes_at->format('Y-m-d\TH:i'),
                'notes' => $cycle->notes,
                'status' => $cycle->status->value,
                'products' => $cycle->cycleProducts->map(fn ($cp) => [
                    'product_id' => $cp->product_id,
                    'quantity_available' => (float) $cp->quantity_available,
                    'price_override' => $cp->price_override !== null ? (float) $cp->price_override : null,
                ])->all(),
                'points' => $cycle->cycleDeliveryPoints->map(fn ($p) => [
                    'delivery_point_id' => $p->delivery_point_id,
                    'scheduled_at' => optional($p->scheduled_at)->format('Y-m-d\TH:i'),
                    'capacity' => $p->capacity,
                    'notes' => $p->notes,
                ])->all(),
            ] : null,
            'availableProducts' => Product::orderBy('name')->get()->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'unit_label' => $p->unit->label(),
                'price' => (float) $p->price,
                'is_active' => $p->is_active,
            ]),
            'availablePoints' => DeliveryPoint::orderBy('name')->get()->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'address' => $p->address,
                'is_active' => $p->is_active,
            ]),
        ]);
    }

    private function cycleData(StoreDeliveryCycleRequest $request): array
    {
        return $request->safe()->only(['title', 'delivery_date', 'order_opens_at', 'order_closes_at', 'notes']);
    }

    private function syncProducts(DeliveryCycle $cycle, array $products): void
    {
        $sentProductIds = [];

        foreach ($products as $product) {
            $cycle->cycleProducts()->updateOrCreate(
                ['product_id' => $product['product_id']],
                [
                    'quantity_available' => $product['quantity_available'],
                    'price_override' => $product['price_override'] ?? null,
                ],
            );
            $sentProductIds[] = $product['product_id'];
        }

        $cycle->cycleProducts()
            ->whereNotIn('product_id', $sentProductIds ?: [0])
            ->whereDoesntHave('reservationItems')
            ->delete();
    }

    private function syncPoints(DeliveryCycle $cycle, array $points): void
    {
        $sentPointIds = [];

        foreach ($points as $point) {
            $cycle->cycleDeliveryPoints()->updateOrCreate(
                ['delivery_point_id' => $point['delivery_point_id']],
                [
                    'scheduled_at' => $point['scheduled_at'] ?? null,
                    'capacity' => $point['capacity'] ?? null,
                    'notes' => $point['notes'] ?? null,
                ],
            );
            $sentPointIds[] = $point['delivery_point_id'];
        }

        $cycle->cycleDeliveryPoints()
            ->whereNotIn('delivery_point_id', $sentPointIds ?: [0])
            ->whereDoesntHave('reservations')
            ->delete();
    }
}
