<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cycle_delivery_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_cycle_id')->constrained('delivery_cycles')->cascadeOnDelete();
            $table->foreignId('delivery_point_id')->constrained('delivery_points')->cascadeOnDelete();
            $table->dateTime('scheduled_at')->nullable();
            $table->integer('capacity')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->unique(['delivery_cycle_id', 'delivery_point_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycle_delivery_points');
    }
};
