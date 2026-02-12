<?php

namespace App\Providers;

use App\Enums\Permission;
use App\Models\Graduate;
use App\Models\User;
use App\Policies\ConcernPolicy;
use App\Policies\GraduatePolicy;
use App\Policies\ImportPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model policies
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Graduate::class, GraduatePolicy::class);

        // Register ability-based gates for non-model resources
        Gate::define('viewImports', [ImportPolicy::class, 'viewAny']);
        Gate::define('importInstitutions', [ImportPolicy::class, 'importInstitutions']);
        Gate::define('importGraduates', [ImportPolicy::class, 'importGraduates']);
        Gate::define('clearData', [ImportPolicy::class, 'clearData']);

        Gate::define('viewConcerns', [ConcernPolicy::class, 'viewAny']);
        Gate::define('viewActivityLogs', fn (User $user) => $user->hasPermission(Permission::VIEW_ACTIVITY_LOGS));

        // Permission-based gates (for simple checks and middleware)
        foreach (Permission::cases() as $permission) {
            Gate::define($permission->value, fn (User $user) => $user->hasPermission($permission));
        }
    }
}
