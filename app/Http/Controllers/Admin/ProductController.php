<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductUnit;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/products/Index', [
            'products' => Product::with('category')
                ->orderBy('name')
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'category' => $p->category?->name,
                    'unit_label' => $p->unit->label(),
                    'price' => round((float) $p->price, 2),
                    'is_active' => $p->is_active,
                    'image_url' => $p->image_url,
                ]),
        ]);
    }

    public function create(): Response
    {
        return $this->form(null);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Product::create($this->data($request));

        return redirect()->route('admin.produtos.index')->with('success', 'Produto criado.');
    }

    public function edit(Product $produto): Response
    {
        return $this->form($produto);
    }

    public function update(StoreProductRequest $request, Product $produto): RedirectResponse
    {
        $produto->update($this->data($request, $produto));

        return redirect()->route('admin.produtos.index')->with('success', 'Produto atualizado.');
    }

    public function destroy(Product $produto): RedirectResponse
    {
        if ($produto->image_path) {
            Storage::disk('public')->delete($produto->image_path);
        }

        $produto->delete();

        return back()->with('success', 'Produto removido.');
    }

    private function form(?Product $product): Response
    {
        return Inertia::render('admin/products/Form', [
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_id' => $product->category_id,
                'description' => $product->description,
                'unit' => $product->unit->value,
                'price' => (float) $product->price,
                'is_active' => $product->is_active,
                'image_url' => $product->image_url,
            ] : null,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'units' => collect(ProductUnit::cases())->map(fn ($u) => [
                'value' => $u->value,
                'label' => $u->label(),
            ]),
        ]);
    }

    private function data(StoreProductRequest $request, ?Product $product = null): array
    {
        $validated = $request->safe()->except(['image']);
        $validated['slug'] = $validated['slug']
            ?? Str::slug($validated['name']).'-'.Str::lower(Str::random(4));
        $validated['is_active'] = $request->boolean('is_active');

        if ($request->hasFile('image')) {
            if ($product?->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('products', 'public');
        }

        return $validated;
    }
}
