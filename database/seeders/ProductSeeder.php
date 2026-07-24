<?php

namespace Database\Seeders;

use App\Enums\ProductUnit;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id', 'slug');

        $products = [
            ['folhas', 'Alface Crespa', ProductUnit::Unidade, 3.50, 'Colhida no dia, folhas firmes e crocantes.'],
            ['folhas', 'Rúcula', ProductUnit::Maco, 4.00, 'Maço fresco, sabor levemente picante.'],
            ['folhas', 'Espinafre', ProductUnit::Maco, 4.50, null],
            ['folhas', 'Couve Manteiga', ProductUnit::Maco, 3.80, 'Maço com cerca de 8 folhas.'],
            ['legumes', 'Tomate Italiano', ProductUnit::Kg, 8.90, 'Maduro, ideal para molhos.'],
            ['legumes', 'Cenoura', ProductUnit::Kg, 5.50, null],
            ['legumes', 'Abobrinha Italiana', ProductUnit::Kg, 6.20, null],
            ['legumes', 'Beterraba', ProductUnit::Kg, 5.00, null],
            ['temperos', 'Manjericão', ProductUnit::Maco, 3.00, 'Aromático, colhido fresco.'],
            ['temperos', 'Cebolinha', ProductUnit::Maco, 2.50, null],
            ['temperos', 'Salsa', ProductUnit::Maco, 2.50, null],
            ['frutas', 'Morango', ProductUnit::Bandeja, 12.00, 'Bandeja de 250g, sem agrotóxicos.'],
            ['frutas', 'Ovos Caipira', ProductUnit::Duzia, 15.00, 'Dúzia de ovos de galinhas criadas soltas.'],
        ];

        foreach ($products as [$categorySlug, $name, $unit, $price, $description]) {
            $slug = \Illuminate\Support\Str::slug($name);

            Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $categories[$categorySlug] ?? null,
                    'name' => $name,
                    'unit' => $unit,
                    'price' => $price,
                    'description' => $description,
                    'is_active' => true,
                ],
            );
        }
    }
}
