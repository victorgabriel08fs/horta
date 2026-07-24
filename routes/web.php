<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\Customer;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ReservationLookupController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Loja (público / cliente)
|--------------------------------------------------------------------------
*/
Route::get('/', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/carrinho', [CartController::class, 'index'])->name('cart.index');
Route::get('/checkout', [ReservationController::class, 'create'])->name('checkout');
Route::post('/reservas', [ReservationController::class, 'store'])->name('reservations.store');
Route::get('/reservas/{reservation}/confirmacao', [ReservationController::class, 'confirmation'])->name('reservation.confirmation');
Route::delete('/reservas/{reservation}', [ReservationController::class, 'destroy'])->name('reservations.destroy');
Route::get('/consultar-reserva', [ReservationLookupController::class, 'show'])->name('reservation.lookup');
Route::post('/consultar-reserva', [ReservationLookupController::class, 'find'])->name('reservation.lookup.find');

Route::middleware('auth')->group(function () {
    Route::get('/minhas-reservas', [Customer\ReservationController::class, 'index'])->name('customer.reservations');
});

/*
|--------------------------------------------------------------------------
| Painel (admin / gestor)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

    Route::resource('categorias', Admin\CategoryController::class)
        ->parameters(['categorias' => 'categoria'])->except(['show']);
    Route::resource('produtos', Admin\ProductController::class)
        ->parameters(['produtos' => 'produto'])->except(['show']);
    Route::resource('pontos', Admin\DeliveryPointController::class)
        ->parameters(['pontos' => 'ponto'])->except(['show']);

    Route::post('/ciclos/{ciclo}/abrir', [Admin\DeliveryCycleController::class, 'open'])->name('ciclos.abrir');
    Route::post('/ciclos/{ciclo}/fechar', [Admin\DeliveryCycleController::class, 'close'])->name('ciclos.fechar');
    Route::post('/ciclos/{ciclo}/entregar', [Admin\DeliveryCycleController::class, 'markDelivered'])->name('ciclos.entregar');
    Route::get('/ciclos/{ciclo}/separacao', [Admin\DeliveryCycleController::class, 'pickingList'])->name('ciclos.separacao');
    Route::get('/ciclos/{ciclo}/reservas', [Admin\ReservationController::class, 'index'])->name('ciclos.reservas');
    Route::resource('ciclos', Admin\DeliveryCycleController::class)->parameters(['ciclos' => 'ciclo']);

    Route::patch('/reservas/{reservation}/status', [Admin\ReservationController::class, 'updateStatus'])->name('reservas.status');
});

require __DIR__.'/auth.php';
