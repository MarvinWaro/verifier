<?php

namespace App\Enums;

enum Permission: string
{
    // User Management
    case VIEW_USERS = 'view_users';
    case CREATE_USERS = 'create_users';
    case UPDATE_USERS = 'update_users';
    case DELETE_USERS = 'delete_users';
    case TOGGLE_USER_ACTIVE = 'toggle_user_active';

    // Graduate Management
    case VIEW_GRADUATES = 'view_graduates';
    case UPDATE_GRADUATES = 'update_graduates';
    case DELETE_GRADUATES = 'delete_graduates';

    // Import Management
    case VIEW_IMPORTS = 'view_imports';
    case IMPORT_INSTITUTIONS = 'import_institutions';
    case IMPORT_GRADUATES = 'import_graduates';
    case CLEAR_DATA = 'clear_data';

    // Concerns
    case VIEW_CONCERNS = 'view_concerns';

    // Activity Logs
    case VIEW_ACTIVITY_LOGS = 'view_activity_logs';

    // Role Management
    case MANAGE_ROLES = 'manage_roles';

    // Dashboard & Programs (available to all authenticated users)
    case VIEW_DASHBOARD = 'view_dashboard';
    case VIEW_INSTITUTIONS = 'view_institutions';
    case VIEW_PROGRAMS = 'view_programs';
    case UPDATE_PROGRAM_CATALOG = 'update_program_catalog';

    /**
     * Get all permissions for a given role
     *
     * @return array<Permission>
     */
    public static function forRole(string $role): array
    {
        return match ($role) {
            'admin' => [
                // Admins have all permissions
                self::VIEW_USERS,
                self::CREATE_USERS,
                self::UPDATE_USERS,
                self::DELETE_USERS,
                self::TOGGLE_USER_ACTIVE,
                self::VIEW_GRADUATES,
                self::UPDATE_GRADUATES,
                self::DELETE_GRADUATES,
                self::VIEW_IMPORTS,
                self::IMPORT_INSTITUTIONS,
                self::IMPORT_GRADUATES,
                self::CLEAR_DATA,
                self::VIEW_CONCERNS,
                self::VIEW_ACTIVITY_LOGS,
                self::MANAGE_ROLES,
                self::VIEW_DASHBOARD,
                self::VIEW_INSTITUTIONS,
                self::VIEW_PROGRAMS,
                self::UPDATE_PROGRAM_CATALOG,
            ],
            'prc' => [
                // PRC users have limited permissions
                self::VIEW_DASHBOARD,
                self::VIEW_INSTITUTIONS,
                self::VIEW_PROGRAMS,
            ],
            default => [],
        };
    }

    /**
     * Get permission label for display
     */
    public function label(): string
    {
        return match ($this) {
            self::VIEW_USERS => 'View Users',
            self::CREATE_USERS => 'Create Users',
            self::UPDATE_USERS => 'Update Users',
            self::DELETE_USERS => 'Delete Users',
            self::TOGGLE_USER_ACTIVE => 'Toggle User Active Status',
            self::VIEW_GRADUATES => 'View Graduates',
            self::UPDATE_GRADUATES => 'Update Graduates',
            self::DELETE_GRADUATES => 'Delete Graduates',
            self::VIEW_IMPORTS => 'View Import Tools',
            self::IMPORT_INSTITUTIONS => 'Import Institutions',
            self::IMPORT_GRADUATES => 'Import Graduates',
            self::CLEAR_DATA => 'Clear Data',
            self::VIEW_CONCERNS => 'View Concerns',
            self::VIEW_ACTIVITY_LOGS => 'View Activity Logs',
            self::MANAGE_ROLES => 'Manage Roles & Permissions',
            self::VIEW_DASHBOARD => 'View Dashboard',
            self::VIEW_INSTITUTIONS => 'View Institutions',
            self::VIEW_PROGRAMS => 'View Programs',
            self::UPDATE_PROGRAM_CATALOG => 'Update Program Catalog',
        };
    }
}
