<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\GraduateController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\WelcomeController;

// Landing page - publicly accessible
Route::get('/', [WelcomeController::class, 'index'])->name('home');

// Add this temporary route to debug
Route::get('/debug-institutions', function() {
    $institutions = \App\Models\Institution::all();
    return response()->json([
        'count' => $institutions->count(),
        'types' => $institutions->pluck('type')->unique(),
        'sample' => $institutions->take(5)->map(fn($i) => [
            'code' => $i->institution_code,
            'name' => $i->name,
            'type' => $i->type,
        ]),
    ]);
});


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
