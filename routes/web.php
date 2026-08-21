<?php 
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\ClientAuthController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin login (serve Breeze login at /admin/login)
Route::middleware('guest')->get('/admin/login', [AuthenticatedSessionController::class, 'create'])->name('admin.login');
Route::middleware('guest')->post('/admin/login', [AuthenticatedSessionController::class, 'store'])->name('admin.login.submit');

// Dashboard route used by Laravel Breeze after admin login.
Route::middleware(['auth'])->get('admin/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
 
// Admin Panel Routes (Protected by standard 'auth' middleware)
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard.index');
    Route::get('/preferences', [AdminController::class, 'preferences'])->name('preferences.edit');
    Route::put('/preferences', [AdminController::class, 'updatePreferences'])->name('preferences.update');
    Route::get('/company-settings', [AdminController::class, 'companySettings'])->name('company-settings.edit');
    Route::put('/company-settings', [AdminController::class, 'updateCompanySettings'])->name('company-settings.update');
    Route::post('/logout', [AdminController::class, 'logout'])->name('logout');
    Route::get('/users', [AdminController::class, 'usersIndex'])->name('users.index');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
    Route::put('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::put('/users/{user}/password', [AdminController::class, 'resetUserPassword'])->name('users.password');
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.destroy');

    Route::get('/seafarers', [AdminController::class, 'clientsIndex'])->name('seafarers.index');
    Route::post('/seafarers', [AdminController::class, 'storeClient'])->name('seafarers.store');
    Route::get('/seafarers/{client}/print-preview', [AdminController::class, 'printPreview'])->name('seafarers.print-preview');
    Route::get('/seafarers/{client}', [AdminController::class, 'showClient'])->name('seafarers.show');
    Route::put('/seafarers/{client}', [AdminController::class, 'updateClient'])->name('seafarers.update');
    Route::delete('/seafarers/{client}', [AdminController::class, 'deleteClient'])->name('seafarers.destroy');
});
Route::post('/logout', [AdminController::class, 'logout'])->name('logout');


// Client Portal Login & Dashboard
Route::get('/seafarers/login', [ClientAuthController::class, 'showLogin'])->name('seafarers.login');
Route::get('/seafarers/register', [ClientAuthController::class, 'showGoogleRegister'])->name('seafarers.register');
Route::get('/seafarers/register/google', [ClientAuthController::class, 'googleRedirect'])->name('seafarers.register.google');
Route::get('/seafarers/register/google/callback', [ClientAuthController::class, 'googleCallback'])->name('seafarers.register.google.callback');
Route::get('/seafarers/verify/{token}', [ClientAuthController::class, 'verify'])->name('seafarers.verify');
Route::get('/seafarers/continue', [ClientAuthController::class, 'showContinueProfile'])->name('seafarers.continue');
Route::post('/seafarers/continue', [ClientAuthController::class, 'continueProfile'])->name('seafarers.update-profile');
Route::post('/seafarers/verification/resend', [ClientAuthController::class, 'resendVerification'])->name('seafarers.verification.resend');

Route::patch('/seafarers/continue', [ClientAuthController::class, 'continueProfile']);
Route::put('/seafarers/continue', [ClientAuthController::class, 'continueProfile']);

// Temporary test route to send a verification email to any address (use ?email=you@example.com)
use Illuminate\Http\Request;
Route::get('/seafarers/test-verification', function (Request $request) {
    $email = $request->query('email');
    if (! $email) {
        return response('Provide ?email=you@example.com', 400);
    }

    $client = App\Models\Client::firstOrCreate(
        ['email' => $email],
        ['name' => 'Test User', 'password' => bcrypt(\Illuminate\Support\Str::random(24))]
    );

    $client->verification_token = \Illuminate\Support\Str::random(40);
    $client->save();

    $link = route('seafarers.verify', $client->verification_token);
    App\Jobs\SendClientVerificationEmail::dispatch($client, $link);

    return response('Verification email sent to ' . $email);
});
Route::post('/seafarers/login', [ClientAuthController::class, 'login']);

Route::get('/seafarers/register/google/callback-debug', function () {
    \Log::info('Callback hit: '.request()->fullUrl());
    return 'ok';
});

Route::middleware(['auth:client'])->prefix('seafarers')->name('seafarers.')->group(function () {
    Route::get('/dashboard', [ClientAuthController::class, 'dashboard'])->name('dashboard');
    Route::post('/logout', [ClientAuthController::class, 'logout'])->name('logout');
});



// Include default Breeze auth routes
require __DIR__.'/auth.php';
