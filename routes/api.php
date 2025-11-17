<?php

use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
| These routes are publicly accessible (no authentication required)
| Rate limited to 30 requests per minute per IP to prevent abuse
*/
Route::middleware('throttle:30,1')->group(function () {
    // Search for institutions by code or name
    Route::post('/search-institution', [WelcomeController::class, 'searchInstitution']);

    // ✅ NEW: Get programs for a specific institution (lazy loading)
    Route::get('/institution/{instCode}/programs', [WelcomeController::class, 'getInstitutionPrograms'])
        ->where('instCode', '[A-Za-z0-9\-]+');

    // Get full program details with graduates
    Route::get('/program/{programId}', [WelcomeController::class, 'getProgram'])
        ->where('programId', '[0-9]+');

    // Search for students (placeholder for future implementation)
    Route::post('/search-student', [WelcomeController::class, 'searchStudent']);
});
