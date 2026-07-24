<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/categories/Index', [
            'categories' => Category::withCount('products')
                ->orderBy('position')
                ->orderBy('name')
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'position' => $c->position,
                    'products_count' => $c->products_count,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/Form', ['category' => null]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($this->data($request));

        return redirect()->route('admin.categorias.index')->with('success', 'Categoria criada.');
    }

    public function edit(Category $categoria): Response
    {
        return Inertia::render('admin/categories/Form', [
            'category' => [
                'id' => $categoria->id,
                'name' => $categoria->name,
                'slug' => $categoria->slug,
                'position' => $categoria->position,
            ],
        ]);
    }

    public function update(StoreCategoryRequest $request, Category $categoria): RedirectResponse
    {
        $categoria->update($this->data($request, $categoria));

        return redirect()->route('admin.categorias.index')->with('success', 'Categoria atualizada.');
    }

    public function destroy(Category $categoria): RedirectResponse
    {
        $categoria->delete();

        return back()->with('success', 'Categoria removida.');
    }

    private function data(StoreCategoryRequest $request, ?Category $category = null): array
    {
        $validated = $request->validated();
        $validated['slug'] = $validated['slug']
            ?? Str::slug($validated['name']).($category ? '' : '-'.Str::lower(Str::random(4)));

        return $validated;
    }
}
