<?php 
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\ClientAuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

// Define the missing 'dashboard' route required by Laravel Breeze login redirection
Route::middleware(['auth'])->get('/dashboard', function () {
    return redirect()->route('admin.users.index');
})->name('dashboard');

// Admin Panel Routes (Protected by standard 'auth' middleware)
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', [AdminController::class, 'usersIndex'])->name('users.index');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
    Route::put('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::put('/users/{user}/password', [AdminController::class, 'resetUserPassword'])->name('users.password');
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.destroy');

    Route::get('/clients', [AdminController::class, 'clientsIndex'])->name('clients.index');
    Route::post('/clients', [AdminController::class, 'storeClient'])->name('clients.store');
    Route::put('/clients/{client}', [AdminController::class, 'updateClient'])->name('clients.update');
    Route::delete('/clients/{client}', [AdminController::class, 'deleteClient'])->name('clients.destroy');
});

// Client Portal Login & Dashboard
Route::get('/client/login', [ClientAuthController::class, 'showLogin'])->name('client.login');
Route::post('/client/login', [ClientAuthController::class, 'login']);

Route::middleware(['auth:client'])->prefix('client')->name('client.')->group(function () {
    Route::get('/dashboard', [ClientAuthController::class, 'dashboard'])->name('dashboard');
    Route::post('/logout', [ClientAuthController::class, 'logout'])->name('logout');
});

// Include default Breeze auth routes
require __DIR__.'/auth.php';