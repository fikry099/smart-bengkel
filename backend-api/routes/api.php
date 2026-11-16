<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\CustomerPortalController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReceptionController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\WorkshopController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
// Admin Auth
Route::post('/login', [AuthController::class, 'login']);

// Customer Auth (WhatsApp OTP)
Route::post('/customer/request-otp', [CustomerAuthController::class, 'requestOtp']);
Route::post('/customer/verify-otp', [CustomerAuthController::class, 'verifyOtp']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum Auth)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Laporan keuangan & pencatatan pengeluaran
    Route::get('/finance/report', [FinanceController::class, 'report']);
    Route::post('/finance/expenses', [FinanceController::class, 'storeExpense']);

    // POS Admin Routes (Reception & Vehicle)
    Route::get('/vehicles/search/{plateNumber}', [VehicleController::class, 'searchByPlate']);
    Route::post('/reception/check-in', [ReceptionController::class, 'checkIn']);

    // Modul Service Workshop
    Route::get('/workshop/orders', [WorkshopController::class, 'index']);
    Route::get('/workshop/orders/{id}', [WorkshopController::class, 'show']);
    Route::post('/workshop/orders/{id}/items', [WorkshopController::class, 'addItem']);
    Route::put('/workshop/orders/{id}/items/{itemId}', [WorkshopController::class, 'updateItem']);
    Route::delete('/workshop/orders/{id}/items/{itemId}', [WorkshopController::class, 'deleteItem']);

    // Route Biaya Tambahan Khusus
    Route::patch('/workshop/orders/{id}/additional-cost', [WorkshopController::class, 'updateAdditionalCost']);

    // Route Catatan Inspeksi Mekanik & Transisi Status
    Route::patch('/workshop/orders/{id}/notes', [WorkshopController::class, 'updateNotes']);
    Route::patch('/workshop/orders/{id}/status', [WorkshopController::class, 'updateStatus']);
    Route::post('/workshop/orders/{id}/submit-acc', [WorkshopController::class, 'submitCustomerAcc']);
    Route::post('/workshop/orders/{id}/payment', [WorkshopController::class, 'recordPayment']);

    // Modul Category
    Route::get('/categories', [CategoryController::class, 'index']);

    // Modul Inventory & Katalog
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::patch('/products/{id}/restock', [ProductController::class, 'restock']);

});

/*
|--------------------------------------------------------------------------
| Customer Portal Routes (Read-only)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'customer'])->group(function () {
    Route::get('/customer/active-service', [CustomerPortalController::class, 'getActiveService']);
    Route::get('/customer/history', [CustomerPortalController::class, 'getHistory']);
});
