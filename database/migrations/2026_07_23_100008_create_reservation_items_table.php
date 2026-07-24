<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->foreignId('cycle_product_id')->constrained('cycle_products');
            $table->string('product_name');
            $table->string('unit');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('quantity', 10, 2);
            $table->decimal('line_total', 10, 2);
            $table->timestamps();

            $table->index('cycle_product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_items');
    }
};
