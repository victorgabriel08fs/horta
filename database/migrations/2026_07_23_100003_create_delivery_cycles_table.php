<?php

use App\Enums\CycleStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->date('delivery_date');
            $table->dateTime('order_opens_at');
            $table->dateTime('order_closes_at');
            $table->string('status')->default(CycleStatus::Draft->value);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_cycles');
    }
};
