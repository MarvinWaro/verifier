<?php

namespace App\Models;

use App\Enums\Permission;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'role_id',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the role that the user belongs to.
     */
    public function roleModel(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is PRC.
     */
    public function isPrc(): bool
    {
        return $this->role === 'prc';
    }

    /**
     * Check if user is active.
     */
    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(Permission $permission): bool
    {
        // Inactive users have no permissions
        if (! $this->is_active) {
            return false;
        }

        // If user has a dynamic role (role_id), check database permissions
        if ($this->role_id && $this->relationLoaded('roleModel')) {
            return $this->roleModel->permissions()
                ->where('name', $permission->value)
                ->exists();
        }

        if ($this->role_id) {
            return $this->roleModel()->first()?->permissions()
                ->where('name', $permission->value)
                ->exists() ?? false;
        }

        // Fallback to static role-based permissions (backward compatibility)
        $rolePermissions = Permission::forRole($this->role);

        return in_array($permission, $rolePermissions, strict: true);
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(Permission ...$permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(Permission ...$permissions): bool
    {
        foreach ($permissions as $permission) {
            if (! $this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all permissions for this user.
     *
     * @return array<Permission>
     */
    public function getPermissions(): array
    {
        if (! $this->is_active) {
            return [];
        }

        // If user has a dynamic role (role_id), get permissions from database
        if ($this->role_id) {
            $role = $this->relationLoaded('roleModel')
                ? $this->roleModel
                : $this->roleModel()->with('permissions')->first();

            if ($role) {
                $permissionNames = $role->permissions->pluck('name')->toArray();

                // Convert permission names to Permission enum instances
                return collect($permissionNames)
                    ->map(fn($name) => Permission::tryFrom($name))
                    ->filter()
                    ->values()
                    ->all();
            }
        }

        // Fallback to static role-based permissions (backward compatibility)
        return Permission::forRole($this->role);
    }
}
