<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $users = $query->paginate(10)->withQueryString();

        // Get all available roles for the dropdown
        $roles = Role::select('id', 'name', 'display_name')->get();

        return Inertia::render('settings/users', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $request->search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role_id' => 'required|exists:roles,id',
        ]);

        // Get the role to set the legacy role column for backward compatibility
        $role = Role::find($request->role_id);

        // Only set legacy role column for default roles (admin/prc)
        // Custom roles will have role = null, role_id is the source of truth
        $legacyRole = in_array($role->name, ['admin', 'prc']) ? $role->name : null;

        // Create user with default password "12345678"
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make('12345678'), // Default password
            'role_id' => $request->role_id,
            'role' => $legacyRole, // Only set for admin/prc, null for custom roles
            'is_active' => true, // Admin-created users are active by default
        ]);

        return redirect()->back()->with('success', 'User created successfully with default password: 12345678');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role_id' => 'required|exists:roles,id',
        ]);

        // Get the role to set the legacy role column for backward compatibility
        $role = Role::find($request->role_id);

        // Only set legacy role column for default roles (admin/prc)
        // Custom roles will have role = null, role_id is the source of truth
        $legacyRole = in_array($role->name, ['admin', 'prc']) ? $role->name : null;

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'role' => $legacyRole, // Only set for admin/prc, null for custom roles
        ]);

        // Only update password if provided
        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(User $user)
    {
        $this->authorize('toggleActive', $user);

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $status = $user->is_active ? 'activated' : 'deactivated';

        return redirect()->back()->with('success', "User {$status} successfully.");
    }
}
