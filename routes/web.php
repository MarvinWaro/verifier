<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ConcernController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GraduateController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ProgramCatalogController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

// Note: ConcernController and WelcomeController API methods are handled in api.php

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/hei-map', [MapController::class, 'heiMap'])->name('hei-map');

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

    Route::get('logs', [ActivityLogController::class, 'index'])
        ->middleware('can:view_activity_logs')
        ->name('logs.index');

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
    Route::get('programs', [ProgramController::class, 'index'])->middleware('can:view_programs')->name('programs.index');
    Route::post('programs/refresh', [ProgramController::class, 'refresh'])
        ->middleware(['can:view_programs', 'throttle:12,1'])->name('programs.refresh');

    /*
    |--------------------------------------------------------------------------
    | Program Catalog (Authenticated)
    |--------------------------------------------------------------------------
    */
    Route::get('programs/catalog', [ProgramCatalogController::class, 'index'])
        ->middleware('can:view_programs')
        ->name('programs.catalog.index');

    Route::post('programs/catalog/sync', [ProgramCatalogController::class, 'startSync'])
        ->middleware(['can:update_program_catalog', 'throttle:6,1'])->name('programs.catalog.sync');
    Route::get('programs/catalog/sync/{run}', [ProgramCatalogController::class, 'syncStatus'])
        ->middleware(['can:update_program_catalog', 'throttle:60,1'])->name('programs.catalog.sync-status');
    Route::patch('programs/catalog/{programCatalog}', [ProgramCatalogController::class, 'update'])
        ->middleware('can:update_program_catalog')
        ->name('programs.catalog.update');

    /*
    |--------------------------------------------------------------------------
    | Protected Routes - Permission-Based Access Control
    |--------------------------------------------------------------------------
    */

    // Graduates Management
    Route::prefix('graduates')->name('graduates.')->group(function () {
        Route::get('/', [GraduateController::class, 'index'])
            ->middleware('can:view_graduates')
            ->name('index');
        Route::put('{graduate}', [GraduateController::class, 'update'])
            ->middleware('can:update_graduates')
            ->name('update');
        Route::delete('{graduate}', [GraduateController::class, 'destroy'])
            ->middleware('can:delete_graduates')
            ->name('destroy');
    });

    // User Management
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])
            ->middleware('can:view_users')
            ->name('index');
        Route::post('/', [UserController::class, 'store'])
            ->middleware('can:create_users')
            ->name('store');
        Route::put('{user}', [UserController::class, 'update'])
            ->middleware('can:update_users')
            ->name('update');
        Route::delete('{user}', [UserController::class, 'destroy'])
            ->middleware('can:delete_users')
            ->name('destroy');
        Route::patch('{user}/toggle-active', [UserController::class, 'toggleActive'])
            ->middleware('can:toggle_user_active')
            ->name('toggle-active');
    });

    // Role Management
    Route::prefix('roles')->name('roles.')->middleware('can:manage_roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('index');
        Route::post('/', [RoleController::class, 'store'])->name('store');
        Route::put('{role}', [RoleController::class, 'update'])->name('update');
        Route::delete('{role}', [RoleController::class, 'destroy'])->name('destroy');
        Route::get('list', [RoleController::class, 'list'])->name('list');
        Route::get('permissions', [RoleController::class, 'permissions'])->name('permissions');
    });

    // Import Tools
    Route::prefix('import')->name('import.')->group(function () {
        Route::get('/', [ImportController::class, 'index'])
            ->middleware('can:view_imports')
            ->name('index');
        Route::post('institutions', [ImportController::class, 'importInstitutions'])
            ->middleware('can:import_institutions')
            ->name('institutions');
        Route::post('institutions/clear', [ImportController::class, 'clearInstitutions'])
            ->middleware('can:clear_data')
            ->name('institutions.clear');
        Route::post('graduates', [\App\Http\Controllers\GraduateImportController::class, 'store'])
            ->middleware(['can:import_graduates', 'throttle:6,1'])
            ->name('graduates');
        Route::prefix('graduates/runs')->middleware('can:import_graduates')->group(function () {
            Route::get('/', [\App\Http\Controllers\GraduateImportController::class, 'index']);
            Route::get('{run}', [\App\Http\Controllers\GraduateImportController::class, 'show'])->middleware('throttle:60,1');
            Route::post('{run}/retry', [\App\Http\Controllers\GraduateImportController::class, 'retry'])->middleware('throttle:6,1');
            Route::post('{run}/process', [\App\Http\Controllers\GraduateImportController::class, 'process'])->middleware('throttle:60,1');
            Route::get('{run}/review', [\App\Http\Controllers\GraduateImportController::class, 'review'])->middleware('throttle:60,1');
            Route::get('{run}/issues', [\App\Http\Controllers\GraduateImportController::class, 'issues']);
        });
        Route::post('graduates/clear', [ImportController::class, 'clearGraduates'])
            ->middleware('can:clear_data')
            ->name('graduates.clear');
    });

    // Concerns
    Route::get('/concerns', [ConcernController::class, 'index'])
        ->middleware('can:view_concerns')
        ->name('concerns.index');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
