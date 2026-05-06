<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\AccessControlController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerGroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
         return redirect()->route('orders.index');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware('permission:permission manage')->group(function () {
        Route::get('/access-control', [AccessControlController::class, 'index'])
            ->name('access-control.index');
        Route::put('/access-control/{role}', [AccessControlController::class, 'update'])
            ->name('access-control.update');
    });

    Route::middleware('permission:company create')->group(function () {
        Route::resource('companies', CompanyController::class)->only(['create', 'store']);
    });
    Route::middleware('permission:company view')->group(function () {
        Route::resource('companies', CompanyController::class)->only(['index', 'show']);
    });
    Route::middleware('permission:company edit')->group(function () {
        Route::resource('companies', CompanyController::class)->only(['edit', 'update']);
    });
    Route::middleware('permission:company delete')->group(function () {
        Route::resource('companies', CompanyController::class)->only(['destroy']);
    });

    Route::middleware('permission:user create')->group(function () {
        Route::resource('users', UserController::class)->only(['create', 'store']);
    });
    Route::middleware('permission:user create')->group(function () {
        Route::resource('users', UserController::class)->only(['create', 'store']);
    });
    Route::middleware('permission:user view')->group(function () {
        Route::resource('users', UserController::class)->only(['index', 'show']);
    });
    Route::middleware('permission:user edit')->group(function () {
        Route::resource('users', UserController::class)->only(['edit', 'update']);
    });
    Route::middleware('permission:user delete')->group(function () {
        Route::resource('users', UserController::class)->only(['destroy']);
    });

    Route::middleware('permission:customer create')->group(function () {
        Route::resource('customers', CustomerController::class)->only(['create', 'store']);
        Route::post('customers/quick-create', [CustomerController::class, 'quickCreate'])
            ->name('customers.quickCreate');
    });
    Route::middleware('permission:customer create')->group(function () {
        Route::resource('customers', CustomerController::class)->only(['create', 'store']);
        Route::post('customers/quick-create', [CustomerController::class, 'quickCreate'])
            ->name('customers.quickCreate');
    });
    Route::middleware('permission:customer view')->group(function () {
        Route::resource('customers', CustomerController::class)->only(['index', 'show']);
        Route::get('/customers/{customer}/prices', [\App\Http\Controllers\CustomerPriceController::class, 'index'])
            ->name('customers.prices.index');
    });
    Route::middleware('permission:customer edit')->group(function () {
        Route::resource('customers', CustomerController::class)->only(['edit', 'update']);
        Route::post('/customers/{customer}/prices', [\App\Http\Controllers\CustomerPriceController::class, 'bulkUpdate'])
            ->name('customers.prices.bulk');
    });
    Route::middleware('permission:customer delete')->group(function () {
        Route::resource('customers', CustomerController::class)->only(['destroy']);
    });

    Route::post('customer-groups/quick-create', [CustomerGroupController::class, 'quickCreate'])
        ->name('customer_groups.quickCreate');

    Route::resource('suppliers', SupplierController::class);
    Route::post('suppliers/quick-create', [SupplierController::class, 'quickCreate'])
        ->name('suppliers.quickCreate');

    Route::resource('vehicles', VehicleController::class);
    Route::post('vehicles/quick-create', [VehicleController::class, 'quickCreate'])
        ->name('vehicles.quickCreate');

    Route::resource('product-categories', ProductCategoryController::class);

    Route::middleware('permission:product create')->group(function () {
        Route::resource('products', ProductController::class)->only(['create', 'store']);
    });
    Route::middleware('permission:product view')->group(function () {
        Route::resource('products', ProductController::class)->only(['index', 'show']);
    });
    Route::middleware('permission:product edit')->group(function () {
        Route::resource('products', ProductController::class)->only(['edit', 'update']);
    });
    Route::middleware('permission:product delete')->group(function () {
        Route::resource('products', ProductController::class)->only(['destroy']);
    });

    Route::middleware('permission:order create')->group(function () {
        Route::resource('orders', OrderController::class)->only(['create', 'store']);
    });
    Route::middleware('permission:order create')->group(function () {
        Route::resource('orders', OrderController::class)->only(['create', 'store']);
    });
    Route::middleware('permission:order view')->group(function () {
        Route::post('/orders/filter', [OrderController::class, 'filter'])
            ->name('orders.filter');
        Route::resource('orders', OrderController::class)->only(['index', 'show']);
        Route::get('/orders/{order}/invoice', [OrderController::class, 'downloadInvoice'])
            ->name('orders.invoice');
    });
    Route::middleware('permission:order edit')->group(function () {
        Route::resource('orders', OrderController::class)->only(['edit', 'update']);
        Route::post('/orders/{order}/send-invoice', [OrderController::class, 'sendInvoice'])
            ->name('orders.send-invoice');
        Route::put('/orders/{order}/state', [OrderController::class, 'updateState'])
            ->name('orders.update.state');
    });
    Route::middleware('permission:order delete')->group(function () {
        Route::resource('orders', OrderController::class)->only(['destroy']);
    });

    Route::middleware('permission:employee create')->group(function () {
        Route::resource('employees', EmployeeController::class)->only(['create', 'store']);
    });
    Route::middleware('permission:employee view')->group(function () {
        Route::resource('employees', EmployeeController::class)->only(['index', 'show']);
    });
    Route::middleware('permission:employee edit')->group(function () {
        Route::resource('employees', EmployeeController::class)->only(['edit', 'update']);
    });
    Route::middleware('permission:employee delete')->group(function () {
        Route::resource('employees', EmployeeController::class)->only(['destroy']);
    });

    Route::resource('purchase-orders', PurchaseOrderController::class);
    Route::post('/purchase-orders/filter', [PurchaseOrderController::class, 'filter'])
        ->name('purchase-orders.filter');
    Route::put('/purchase-orders/{order}/state', [PurchaseOrderController::class, 'updateState'])
        ->name('purchase-orders.update.state');

    Route::middleware('permission:report view')->group(function () {
        Route::get('/reports/billing', [OrderController::class, 'billingReport'])
            ->name('reports.billingReport');
        Route::post('/reports/billing/filter', [OrderController::class, 'filterBillingReport'])
            ->name('reports.billing.filter');
        Route::get('/reports/brake-fluid-billing', [OrderController::class, 'brakeFluidBillingReport'])
            ->name('reports.brakeFluidBillingReport');
        Route::post('/reports/brake-fluid-billing/filter', [OrderController::class, 'filterBrakeFluidBillingReport'])
            ->name('reports.brakeFluidBillingReport.filter');
    });
});

require __DIR__.'/settings.php';
