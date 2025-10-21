<?php

use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

// Public API routes for landing page search
Route::post('/search-institution', [WelcomeController::class, 'searchInstitution']);
Route::get('/program/{programId}', [WelcomeController::class, 'getProgram']);
Route::post('/search-student', [WelcomeController::class, 'searchStudent']);
