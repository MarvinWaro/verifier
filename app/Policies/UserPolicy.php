<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::VIEW_USERS);
    }

    /**
     * Determine if the user can view the user.
     */
    public function view(User $user, User $model): bool
    {
        return $user->hasPermission(Permission::VIEW_USERS);
    }

    /**
     * Determine if the user can create users.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::CREATE_USERS);
    }

    /**
     * Determine if the user can update the user.
     */
    public function update(User $user, User $model): bool
    {
        return $user->hasPermission(Permission::UPDATE_USERS);
    }

    /**
     * Determine if the user can delete the user.
     */
    public function delete(User $user, User $model): bool
    {
        // Cannot delete yourself
        if ($user->id === $model->id) {
            return false;
        }

        return $user->hasPermission(Permission::DELETE_USERS);
    }

    /**
     * Determine if the user can toggle active status.
     */
    public function toggleActive(User $user, User $model): bool
    {
        // Cannot deactivate yourself
        if ($user->id === $model->id) {
            return false;
        }

        return $user->hasPermission(Permission::TOGGLE_USER_ACTIVE);
    }
}
