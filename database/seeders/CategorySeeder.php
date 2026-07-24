<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Folhas', 'slug' => 'folhas', 'position' => 1],
            ['name' => 'Legumes', 'slug' => 'legumes', 'position' => 2],
            ['name' => 'Temperos', 'slug' => 'temperos', 'position' => 3],
            ['name' => 'Frutas', 'slug' => 'frutas', 'position' => 4],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
