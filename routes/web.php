<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\GraduateController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ProgramCatalogController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermitPdfProxyController;
use App\Http\Controllers\ConcernController;
// Note: ConcernController and WelcomeController API methods are handled in api.php

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/hei-map', [MapController::class, 'heiMap'])->name('hei-map');

// Public Proxy endpoint for permit viewing
Route::post('/api/permit-pdf-proxy', [PermitPdfProxyController::class, 'proxy'])
    ->name('permit.pdf.proxy');
    

/*
|--------------------------------------------------------------------------
| Authenticated App Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard & Logs
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/search', [DashboardController::class, 'searchGraduates'])->name('dashboard.search');
    Route::get('dashboard/graduate/{id}', [DashboardController::class, 'getGraduateDetails'])->name('dashboard.graduate.details');
    Route::get('logs', [ActivityLogController::class, 'index'])->name('logs.index');

    /*
    |--------------------------------------------------------------------------
    | Institutions (Authenticated)
    |--------------------------------------------------------------------------
    */
    Route::prefix('institutions')->name('institutions.')->group(function () {
        Route::get('/', [InstitutionController::class, 'index'])->name('index');

        // Lazy JSON loading for table expansion
        Route::get('{instCode}/programs', [InstitutionController::class, 'programs'])
            ->where('instCode', '[A-Za-z0-9\-]+')
            ->middleware('throttle:120,1')
            ->name('programs');

        // Fetch graduates for program modal
        Route::get('{instCode}/programs/graduates', [InstitutionController::class, 'programGraduates'])
            ->name('programs.graduates');
    });

    /*
    |--------------------------------------------------------------------------
    | Programs (Authenticated)
    |--------------------------------------------------------------------------
    */
    Route::get('programs', [ProgramController::class, 'index'])->name('programs.index');

    /*
    |--------------------------------------------------------------------------
    | Program Catalog (Authenticated)
    |--------------------------------------------------------------------------
    */
    Route::get('programs/catalog', [ProgramCatalogController::class, 'index'])
        ->name('programs.catalog.index');

    Route::patch('programs/catalog/{programCatalog}', [ProgramCatalogController::class, 'update'])
        ->name('programs.catalog.update');

    /*
    |--------------------------------------------------------------------------
    | Admin Only Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['admin'])->group(function () {

        // Graduates Management
        Route::prefix('graduates')->name('graduates.')->group(function () {
            Route::get('/', [GraduateController::class, 'index'])->name('index');
            Route::put('{graduate}', [GraduateController::class, 'update'])->name('update');
            Route::delete('{graduate}', [GraduateController::class, 'destroy'])->name('destroy');
        });

        // User Management
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::post('/', [UserController::class, 'store'])->name('store');
            Route::put('{user}', [UserController::class, 'update'])->name('update');
            Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');
            Route::patch('{user}/toggle-active', [UserController::class, 'toggleActive'])->name('toggle-active');
        });

        // Import Tools
        Route::prefix('import')->name('import.')->group(function () {
            Route::get('/', [ImportController::class, 'index'])->name('index');
            Route::post('institutions', [ImportController::class, 'importInstitutions'])->name('institutions');
            Route::post('institutions/clear', [ImportController::class, 'clearInstitutions'])->name('institutions.clear');
            Route::post('graduates', [ImportController::class, 'importGraduates'])->name('graduates');
            Route::post('graduates/clear', [ImportController::class, 'clearGraduates'])->name('graduates.clear');
        });

        /* |--------------------------------------------------------------------------
        | Concerns (Admin)
        |--------------------------------------------------------------------------
        */
        // Concerns
        Route::get('/concerns', [ConcernController::class, 'index'])->name('concerns.index');
        });


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
