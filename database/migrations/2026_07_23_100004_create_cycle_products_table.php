<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cycle_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_cycle_id')->constrained('delivery_cycles')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('quantity_available', 10, 2);
            $table->decimal('price_override', 10, 2)->nullable();
            $table->timestamps();

            $table->unique(['delivery_cycle_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycle_products');
    }
};
