<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InstitutionController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Institution routes
    Route::get('/institutions', [InstitutionController::class, 'index'])->name('institutions.index');
    Route::post('/institutions/import', [InstitutionController::class, 'import'])->name('institutions.import');

    Route::post('/institutions/import', function() {
        \Log::info('Import route hit!');
        return response()->json(['test' => 'Route is working']);
    })->name('institutions.import');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
