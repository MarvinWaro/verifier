<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ConcernController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // User Management (Settings)
    Route::prefix('settings')->group(function () {
        Route::get('users', [UserController::class, 'index'])
            ->middleware('can:view_users')
            ->name('settings.users');
        Route::post('users', [UserController::class, 'store'])
            ->middleware('can:create_users');
        Route::put('users/{user}', [UserController::class, 'update'])
            ->middleware('can:update_users');
        Route::delete('users/{user}', [UserController::class, 'destroy'])
            ->middleware('can:delete_users');
        Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive'])
            ->middleware('can:toggle_user_active');

        // Role Management (Settings)
        Route::get('roles', [RoleController::class, 'index'])
            ->middleware('can:manage_roles')
            ->name('settings.roles');
        Route::post('roles', [RoleController::class, 'store'])
            ->middleware('can:manage_roles');
        Route::put('roles/{role}', [RoleController::class, 'update'])
            ->middleware('can:manage_roles');
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])
            ->middleware('can:manage_roles');

        // Import Management (Settings)
        Route::get('import', [ImportController::class, 'index'])
            ->middleware('can:view_imports')
            ->name('settings.import');

        // Concerns (Settings)
        Route::get('concerns', [ConcernController::class, 'index'])
            ->middleware('can:view_concerns')
            ->name('settings.concerns');
    });
});
