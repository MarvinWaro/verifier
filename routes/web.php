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

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/
Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::get('/hei-map', [MapController::class, 'heiMap'])->name('hei-map');

/*
|--------------------------------------------------------------------------
| Authenticated app
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Institutions
    |--------------------------------------------------------------------------
    | - Page route (Inertia)
    | - JSON helper used by the Institutions page (accordion)
    */
    Route::prefix('institutions')->name('institutions.')->group(function () {
        // Page
        Route::get('/', [InstitutionController::class, 'index'])->name('index');

        // Lazy JSON used when expanding a row to load programs
        Route::get('{instCode}/programs', [InstitutionController::class, 'programs'])
            ->where('instCode', '[A-Za-z0-9\-]+')
            ->middleware('throttle:120,1') // 120 req/min per IP
            ->name('programs');
    });

    /*
    |--------------------------------------------------------------------------
    | Programs (page)
    |--------------------------------------------------------------------------
    */
    Route::get('programs', [ProgramController::class, 'index'])->name('programs.index');

    /*
    |--------------------------------------------------------------------------
    | Program Catalog (Board / Non-Board classification)
    |--------------------------------------------------------------------------
    */
    Route::get('programs/catalog', [ProgramCatalogController::class, 'index'])
        ->name('programs.catalog.index');

    // Route model binding: {programCatalog} -> ProgramCatalog $programCatalog
    Route::patch('programs/catalog/{programCatalog}', [ProgramCatalogController::class, 'update'])
        ->name('programs.catalog.update');

    /*
    |--------------------------------------------------------------------------
    | Graduates (page + update/delete)
    |--------------------------------------------------------------------------
    */
    Route::prefix('graduates')->name('graduates.')->group(function () {
        Route::get('/', [GraduateController::class, 'index'])->name('index');
        Route::put('{graduate}', [GraduateController::class, 'update'])->name('update');
        Route::delete('{graduate}', [GraduateController::class, 'destroy'])->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Users (CRUD)
    |--------------------------------------------------------------------------
    */
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('{user}', [UserController::class, 'update'])->name('update');
        Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Import tools
    |--------------------------------------------------------------------------
    */
    Route::prefix('import')->name('import.')->group(function () {
        Route::get('/', [ImportController::class, 'index'])->name('index');
        Route::post('institutions', [ImportController::class, 'importInstitutions'])->name('institutions');
        Route::post('institutions/clear', [ImportController::class, 'clearInstitutions'])->name('institutions.clear');
        Route::post('graduates', [ImportController::class, 'importGraduates'])->name('graduates');
        Route::post('graduates/clear', [ImportController::class, 'clearGraduates'])->name('graduates.clear');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
