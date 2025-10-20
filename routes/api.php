<?php

use App\Http\Controllers\ImportController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

// Import API routes (protected)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/import/institutions', [ImportController::class, 'importInstitutions']);
    Route::post('/import/institutions/clear', [ImportController::class, 'clearInstitutions']);
    Route::post('/import/graduates', [ImportController::class, 'importGraduates']);
    Route::post('/import/graduates/clear', [ImportController::class, 'clearGraduates']);
});

// Public API routes for landing page search
Route::post('/search-institution', [WelcomeController::class, 'searchInstitution']);
Route::get('/program/{programId}', [WelcomeController::class, 'getProgram']);
Route::post('/search-student', [WelcomeController::class, 'searchStudent']);
