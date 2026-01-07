<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
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
    Route::resource('users', UserController::class);
    Route::resource('partners', PartnerController::class);
    Route::resource('customers', CustomerController::class);
    Route::resource('suppliers', SupplierController::class);
    Route::post('customers/quick-create', [CustomerController::class, 'quickCreate'])->name('customers.quickCreate');
    Route::resource('vehicles', VehicleController::class);
    Route::resource('product-categories', ProductCategoryController::class);
    Route::resource('products', ProductController::class);
    Route::resource('orders', OrderController::class);
    Route::get('/orders/{order}/invoice', [OrderController::class, 'downloadInvoice'])->name('orders.invoice');
    Route::resource('invoices', InvoiceController::class);
    Route::resource('employees', EmployeeController::class);
    Route::resource('products', ProductController::class);

});

require __DIR__.'/settings.php';
