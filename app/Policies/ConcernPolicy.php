<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;

class ConcernPolicy
{
    /**
     * Determine if the user can view concerns.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::VIEW_CONCERNS);
    }
}
