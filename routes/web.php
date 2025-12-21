<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\GarageJobController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    // Route::resource('uom-categories', UomCategoryController::class);
    // Route::resource('uoms', UomController::class);
    // Route::resource('countries', CountryController::class);
    Route::resource('companies', CompanyController::class);
    Route::resource('partners', PartnerController::class);
    Route::resource('vehicles', VehicleController::class);
    Route::resource('product-categories', ProductCategoryController::class);
    Route::resource('products', ProductController::class);
    Route::resource('garage-jobs', GarageJobController::class);
    Route::resource('invoices', InvoiceController::class);

});

require __DIR__.'/settings.php';
