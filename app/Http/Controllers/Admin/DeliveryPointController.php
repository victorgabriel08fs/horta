<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeliveryPointRequest;
use App\Models\DeliveryPoint;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryPointController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/points/Index', [
            'points' => DeliveryPoint::withCount('cycleDeliveryPoints')
                ->orderBy('name')
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'address' => $p->address,
                    'reference' => $p->reference,
                    'is_active' => $p->is_active,
                    'cycles_count' => $p->cycle_delivery_points_count,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/points/Form', ['point' => null]);
    }

    public function store(StoreDeliveryPointRequest $request): RedirectResponse
    {
        DeliveryPoint::create($this->data($request));

        return redirect()->route('admin.pontos.index')->with('success', 'Ponto de entrega criado.');
    }

    public function edit(DeliveryPoint $ponto): Response
    {
        return Inertia::render('admin/points/Form', [
            'point' => [
                'id' => $ponto->id,
                'name' => $ponto->name,
                'address' => $ponto->address,
                'reference' => $ponto->reference,
                'latitude' => $ponto->latitude !== null ? (float) $ponto->latitude : null,
                'longitude' => $ponto->longitude !== null ? (float) $ponto->longitude : null,
                'is_active' => $ponto->is_active,
            ],
        ]);
    }

    public function update(StoreDeliveryPointRequest $request, DeliveryPoint $ponto): RedirectResponse
    {
        $ponto->update($this->data($request));

        return redirect()->route('admin.pontos.index')->with('success', 'Ponto de entrega atualizado.');
    }

    public function destroy(DeliveryPoint $ponto): RedirectResponse
    {
        $ponto->delete();

        return back()->with('success', 'Ponto de entrega removido.');
    }

    private function data(StoreDeliveryPointRequest $request): array
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->boolean('is_active');

        return $validated;
    }
}
