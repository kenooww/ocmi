<?php 
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\ClientAuthController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin login (serve Breeze login at /admin/login)
Route::middleware('guest')->get('/admin/login', [AuthenticatedSessionController::class, 'create'])->name('admin.login');
Route::middleware('guest')->post('/admin/login', [AuthenticatedSessionController::class, 'store'])->name('admin.login.submit');
Route::get('/admin', function () {
    return auth()->check()
        ? redirect()->route('admin.dashboard.index')
        : redirect()->route('admin.login');
})->name('admin.entry');

// Dashboard route used by Laravel Breeze after admin login.
Route::middleware(['auth'])->get('admin/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
 
// Admin Panel Routes (Protected by standard 'auth' middleware)
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard.index');
    Route::get('/preferences', [AdminController::class, 'preferences'])->name('preferences.edit');
    Route::put('/preferences', [AdminController::class, 'updatePreferences'])->name('preferences.update');
    Route::post('/logout', [AdminController::class, 'logout'])->name('logout');
    Route::get('/certificates/stcw', [AdminController::class, 'stcwCertificates'])->name('certificates.stcw.index');
    Route::post('/certificates/stcw', [AdminController::class, 'storeStcwCertificate'])->name('certificates.stcw.store');
    Route::put('/certificates/stcw/{certificate}', [AdminController::class, 'updateStcwCertificate'])->name('certificates.stcw.update');
    Route::delete('/certificates/stcw/{certificate}', [AdminController::class, 'deleteStcwCertificate'])->name('certificates.stcw.destroy');
    Route::get('/certificates/offshore-training', [AdminController::class, 'offshoreTrainings'])->name('certificates.offshore-training.index');
    Route::post('/certificates/offshore-training', [AdminController::class, 'storeOffshoreTraining'])->name('certificates.offshore-training.store');
    Route::put('/certificates/offshore-training/{training}', [AdminController::class, 'updateOffshoreTraining'])->name('certificates.offshore-training.update');
    Route::delete('/certificates/offshore-training/{training}', [AdminController::class, 'deleteOffshoreTraining'])->name('certificates.offshore-training.destroy');
    Route::get('/ranks', [AdminController::class, 'ranks'])->name('ranks.index');
    Route::post('/ranks', [AdminController::class, 'storeRank'])->name('ranks.store');
    Route::put('/ranks/{rank}', [AdminController::class, 'updateRank'])->name('ranks.update');
    Route::delete('/ranks/{rank}', [AdminController::class, 'deleteRank'])->name('ranks.destroy');

    Route::middleware('admin.role')->group(function () {
        Route::get('/company-settings', [AdminController::class, 'companySettings'])->name('company-settings.edit');
        Route::put('/company-settings', [AdminController::class, 'updateCompanySettings'])->name('company-settings.update');
        Route::get('/users', [AdminController::class, 'usersIndex'])->name('users.index');
        Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
        Route::put('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
        Route::put('/users/{user}/password', [AdminController::class, 'resetUserPassword'])->name('users.password');
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.destroy');
    });

    Route::get('/seafarers', [AdminController::class, 'clientsIndex'])->name('seafarers.index');
    Route::post('/seafarers', [AdminController::class, 'storeClient'])->name('seafarers.store');
    Route::get('/seafarers/{client}/print-preview', [AdminController::class, 'printPreview'])->name('seafarers.print-preview');
    Route::get('/seafarers/{client}/resume', [AdminController::class, 'viewClientResume'])->name('seafarers.resume.view');
    Route::get('/seafarers/{client}/resume/file', [AdminController::class, 'inlineClientResume'])->name('seafarers.resume.file');
    Route::get('/seafarers/{client}/resume/download', [AdminController::class, 'downloadClientResume'])->name('seafarers.resume.download');
    Route::get('/seafarers/{client}/attachments/{folder}/download', [AdminController::class, 'downloadClientAttachmentsFolder'])->name('seafarers.attachments.download');
    Route::put('/seafarers/{client}/application-status', [AdminController::class, 'updateApplicationStatus'])->name('seafarers.application-status.update');
    Route::get('/seafarers/{client}', [AdminController::class, 'showClient'])->name('seafarers.show');
    Route::put('/seafarers/{client}', [AdminController::class, 'updateClient'])->name('seafarers.update');
    Route::delete('/seafarers/{client}', [AdminController::class, 'deleteClient'])->name('seafarers.destroy');
});
Route::post('/logout', [AdminController::class, 'logout'])->name('logout');


// Client Portal Login & Dashboard
Route::middleware('seafarer.live')->group(function () {
    Route::get('/seafarers', function () {
        return auth('client')->check()
            ? redirect()->route('seafarers.dashboard')
            : redirect()->route('seafarers.login');
    })->name('seafarers.entry');
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
    Route::get('/seafarers/test-verification', function (Request $request) {
        $email = $request->query('email');
        if (! $email) {
            return response('Provide ?email=you@example.com', 400);
        }

        $client = App\Models\Client::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'Test User',
                'password' => bcrypt(\Illuminate\Support\Str::random(24)),
                'application_status' => App\Models\Client::DEFAULT_APPLICATION_STATUS,
            ]
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
        Route::get('/password/mandatory', [ClientAuthController::class, 'showMandatoryPassword'])->name('password.mandatory');
        Route::put('/password/mandatory', [ClientAuthController::class, 'updateMandatoryPassword'])->name('password.mandatory.update');
        Route::get('/dashboard', [ClientAuthController::class, 'dashboard'])->name('dashboard');
        Route::get('/resume', [ClientAuthController::class, 'viewResume'])->name('resume.view');
        Route::get('/resume/file', [ClientAuthController::class, 'inlineResume'])->name('resume.file');
        Route::get('/resume/download', [ClientAuthController::class, 'downloadResume'])->name('resume.download');
        Route::get('/attachments/{folder}/download', [ClientAuthController::class, 'downloadAttachmentsFolder'])->name('attachments.download');
        Route::put('/password', [ClientAuthController::class, 'updatePassword'])->name('password.update');
        Route::post('/logout', [ClientAuthController::class, 'logout'])->name('logout');
    });
});



// Include default Breeze auth routes
require __DIR__.'/auth.php';
