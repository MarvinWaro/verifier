<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call(RolesAndPermissionsSeeder::class);

        // User::factory(10)->create();

        // Create default admin user
        $adminRole = Role::where('name', 'admin')->first();

        $admin = User::firstOrCreate(
            ['email' => 'chedro12hemis@ched.gov.ph'],
            [
                'name' => 'CHED ADMIN',
                'password' => 'cwc123',
                'email_verified_at' => now(),
                'role' => 'admin',
                'role_id' => $adminRole?->id,
                'is_active' => true,
            ]
        );

        // Ensure admin role is assigned even if user already existed
        if ($adminRole && !$admin->role_id) {
            $admin->update([
                'role' => 'admin',
                'role_id' => $adminRole->id,
            ]);
        }
    }
}
