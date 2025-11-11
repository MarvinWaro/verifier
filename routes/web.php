<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\GraduateController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WelcomeController;

/*
|----------------------------------------------------------------------------
| Public
|----------------------------------------------------------------------------
*/
Route::get('/', [WelcomeController::class, 'index'])->name('home');

/*
|----------------------------------------------------------------------------
| Authenticated app
|----------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => Inertia::render('dashboard'))
        ->name('dashboard');

    /*
    |------------------------------------------------------------------------
    | Institutions
    |------------------------------------------------------------------------
    | - Page route (Inertia)
    | - JSON helpers used by the Institutions page (accordion)
    */
    Route::prefix('institutions')->name('institutions.')->group(function () {
        // Page
        Route::get('/', [InstitutionController::class, 'index'])
            ->name('index');

        // Validate instCode as “letters/numbers/- only” and rate-limit the JSON
        Route::get('{instCode}/programs', [InstitutionController::class, 'programs'])
            ->where('instCode', '[A-Za-z0-9\-]+')
            ->middleware('throttle:120,1')  // 120 req/min per IP
            ->name('programs');

        // (Optional) if you later re-enable a separate count endpoint:
        // Route::get('{instCode}/programs/count', [InstitutionController::class, 'programCount'])
        //     ->where('instCode', '[A-Za-z0-9\-]+')
        //     ->middleware('throttle:120,1')
        //     ->name('programs.count');
    });

    /*
    |------------------------------------------------------------------------
    | Programs (page)
    |------------------------------------------------------------------------
    */
    Route::get('programs', [ProgramController::class, 'index'])
        ->name('programs.index');

    /*
    |------------------------------------------------------------------------
    | Graduates (page)
    |------------------------------------------------------------------------
    */
    Route::get('graduates', [GraduateController::class, 'index'])
        ->name('graduates.index');

    /*
    |------------------------------------------------------------------------
    | Users (CRUD)
    |------------------------------------------------------------------------
    */
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('{user}', [UserController::class, 'update'])->name('update');
        Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');
    });

    /*
    |------------------------------------------------------------------------
    | Import tools
    |------------------------------------------------------------------------
    */
    Route::prefix('import')->name('import.')->group(function () {
        Route::get('/', [ImportController::class, 'index'])->name('index');
        Route::post('institutions', [ImportController::class, 'importInstitutions'])->name('institutions');
        Route::post('institutions/clear', [ImportController::class, 'clearInstitutions'])->name('institutions.clear');
        Route::post('graduates', [ImportController::class, 'importGraduates'])->name('graduates');
        Route::post('graduates/clear', [ImportController::class, 'clearGraduates'])->name('graduates.clear');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
