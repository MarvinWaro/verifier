<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\ConcernController;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
| These routes are publicly accessible (no authentication required)
| Laravel automatically prefixes these with "/api"
*/

Route::middleware('throttle:60,1')->group(function () {

    // 1. Dropdown List for "Submit Concern" Modal
    // This allows the frontend to fetch the school list without logging in.
    Route::get('/institutions-list', [WelcomeController::class, 'getInstitutionsList']);

    // 2. Submit Concern Endpoint
    Route::post('/concerns', [ConcernController::class, 'store']);

    // 3. Main Search Endpoint (Welcome Page)
    Route::post('/search-institution', [WelcomeController::class, 'searchInstitution']);

    // 4. Lazy Load Programs (Welcome Page Expansion)
    Route::get('/institution/{instCode}/programs', [WelcomeController::class, 'getInstitutionPrograms'])
        ->where('instCode', '[A-Za-z0-9\-]+');

    // 5. Get Program Details & Graduates (Permit Dialog)
    Route::get('/program/{programId}', [WelcomeController::class, 'getProgram'])
        ->where('programId', '[0-9]+');

    // 6. Student Search (Placeholder)
    Route::post('/search-student', [WelcomeController::class, 'searchStudent']);
});
