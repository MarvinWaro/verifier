<?php

namespace Database\Seeders;

use App\Enums\Permission as PermissionEnum;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create all permissions from the Permission enum
        $permissions = $this->createPermissions();

        // Create default roles
        $this->createRoles($permissions);
    }

    /**
     * Create all permissions in the database
     */
    private function createPermissions(): array
    {
        $permissionsData = [
            // User Management
            [
                'name' => PermissionEnum::VIEW_USERS->value,
                'display_name' => PermissionEnum::VIEW_USERS->label(),
                'description' => 'View the users list and user details',
                'group' => 'users',
            ],
            [
                'name' => PermissionEnum::CREATE_USERS->value,
                'display_name' => PermissionEnum::CREATE_USERS->label(),
                'description' => 'Create new users',
                'group' => 'users',
            ],
            [
                'name' => PermissionEnum::UPDATE_USERS->value,
                'display_name' => PermissionEnum::UPDATE_USERS->label(),
                'description' => 'Update existing users',
                'group' => 'users',
            ],
            [
                'name' => PermissionEnum::DELETE_USERS->value,
                'display_name' => PermissionEnum::DELETE_USERS->label(),
                'description' => 'Delete users from the system',
                'group' => 'users',
            ],
            [
                'name' => PermissionEnum::TOGGLE_USER_ACTIVE->value,
                'display_name' => PermissionEnum::TOGGLE_USER_ACTIVE->label(),
                'description' => 'Activate or deactivate user accounts',
                'group' => 'users',
            ],

            // Graduate Management
            [
                'name' => PermissionEnum::VIEW_GRADUATES->value,
                'display_name' => PermissionEnum::VIEW_GRADUATES->label(),
                'description' => 'View graduates list and details',
                'group' => 'graduates',
            ],
            [
                'name' => PermissionEnum::UPDATE_GRADUATES->value,
                'display_name' => PermissionEnum::UPDATE_GRADUATES->label(),
                'description' => 'Update graduate information',
                'group' => 'graduates',
            ],
            [
                'name' => PermissionEnum::DELETE_GRADUATES->value,
                'display_name' => PermissionEnum::DELETE_GRADUATES->label(),
                'description' => 'Delete graduates from the system',
                'group' => 'graduates',
            ],

            // Import Management
            [
                'name' => PermissionEnum::VIEW_IMPORTS->value,
                'display_name' => PermissionEnum::VIEW_IMPORTS->label(),
                'description' => 'Access import tools and view import history',
                'group' => 'imports',
            ],
            [
                'name' => PermissionEnum::IMPORT_INSTITUTIONS->value,
                'display_name' => PermissionEnum::IMPORT_INSTITUTIONS->label(),
                'description' => 'Import institutions data from files',
                'group' => 'imports',
            ],
            [
                'name' => PermissionEnum::IMPORT_GRADUATES->value,
                'display_name' => PermissionEnum::IMPORT_GRADUATES->label(),
                'description' => 'Import graduates data from files',
                'group' => 'imports',
            ],
            [
                'name' => PermissionEnum::CLEAR_DATA->value,
                'display_name' => PermissionEnum::CLEAR_DATA->label(),
                'description' => 'Clear data from the system',
                'group' => 'imports',
            ],

            // Concerns
            [
                'name' => PermissionEnum::VIEW_CONCERNS->value,
                'display_name' => PermissionEnum::VIEW_CONCERNS->label(),
                'description' => 'View concerns dashboard',
                'group' => 'concerns',
            ],

            // Activity Logs
            [
                'name' => PermissionEnum::VIEW_ACTIVITY_LOGS->value,
                'display_name' => PermissionEnum::VIEW_ACTIVITY_LOGS->label(),
                'description' => 'View system activity logs',
                'group' => 'logs',
            ],

            // Role Management
            [
                'name' => PermissionEnum::MANAGE_ROLES->value,
                'display_name' => PermissionEnum::MANAGE_ROLES->label(),
                'description' => 'Manage system roles and permissions',
                'group' => 'roles',
            ],

            // Dashboard & Programs
            [
                'name' => PermissionEnum::VIEW_DASHBOARD->value,
                'display_name' => PermissionEnum::VIEW_DASHBOARD->label(),
                'description' => 'Access the main dashboard',
                'group' => 'dashboard',
            ],
            [
                'name' => PermissionEnum::VIEW_INSTITUTIONS->value,
                'display_name' => PermissionEnum::VIEW_INSTITUTIONS->label(),
                'description' => 'View institutions list and details',
                'group' => 'institutions',
            ],
            [
                'name' => PermissionEnum::VIEW_PROGRAMS->value,
                'display_name' => PermissionEnum::VIEW_PROGRAMS->label(),
                'description' => 'View programs list and details',
                'group' => 'programs',
            ],
            [
                'name' => PermissionEnum::UPDATE_PROGRAM_CATALOG->value,
                'display_name' => PermissionEnum::UPDATE_PROGRAM_CATALOG->label(),
                'description' => 'Update program catalog information',
                'group' => 'programs',
            ],
        ];

        $permissions = [];
        foreach ($permissionsData as $permData) {
            $permissions[$permData['name']] = Permission::firstOrCreate(
                ['name' => $permData['name']],
                $permData
            );
        }

        return $permissions;
    }

    /**
     * Create default roles and assign permissions
     */
    private function createRoles(array $permissions): void
    {
        // Create Admin role with all permissions
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'description' => 'Full access to all system features',
            ]
        );

        $adminPermissions = array_map(
            fn($perm) => $permissions[$perm->value]->id,
            PermissionEnum::forRole('admin')
        );
        $adminRole->permissions()->sync($adminPermissions);

        // Create PRC role with limited permissions
        $prcRole = Role::firstOrCreate(
            ['name' => 'prc'],
            [
                'display_name' => 'PRC User',
                'description' => 'Limited access to view dashboard, institutions, and programs',
            ]
        );

        $prcPermissions = array_map(
            fn($perm) => $permissions[$perm->value]->id,
            PermissionEnum::forRole('prc')
        );
        $prcRole->permissions()->sync($prcPermissions);
    }
}
