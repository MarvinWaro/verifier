<?php

use App\Http\Controllers\ImportController;
use Illuminate\Support\Facades\Route;

// Import API routes
Route::post('/import/institutions', [ImportController::class, 'importInstitutions']);
Route::post('/import/institutions/clear', [ImportController::class, 'clearInstitutions']);
Route::post('/import/graduates', [ImportController::class, 'importGraduates']);
Route::post('/import/graduates/clear', [ImportController::class, 'clearGraduates']);
