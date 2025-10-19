<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\GraduateController;
use App\Http\Controllers\ImportController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Institution routes
    Route::get('institutions', [InstitutionController::class, 'index'])->name('institutions.index');

    // Program routes
    Route::get('programs', [ProgramController::class, 'index'])->name('programs.index');

    // Graduate routes
    Route::get('graduates', [GraduateController::class, 'index'])->name('graduates.index');

    // Import routes
    Route::get('import', [ImportController::class, 'index'])->name('import.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
