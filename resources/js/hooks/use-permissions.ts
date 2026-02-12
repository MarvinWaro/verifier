import { usePage } from '@inertiajs/react';
import { type SharedData, type Permission } from '@/types';

export function usePermissions() {
    const { auth } = usePage<SharedData>().props;

    const permissions = auth.user?.permissions || [];

    /**
     * Check if user has a specific permission
     */
    const can = (permission: Permission): boolean => {
        return permissions.includes(permission);
    };

    /**
     * Check if user has any of the given permissions
     */
    const canAny = (...perms: Permission[]): boolean => {
        return perms.some((p) => permissions.includes(p));
    };

    /**
     * Check if user has all of the given permissions
     */
    const canAll = (...perms: Permission[]): boolean => {
        return perms.every((p) => permissions.includes(p));
    };

    /**
     * Check if user has a specific role
     */
    const hasRole = (role: 'admin' | 'prc'): boolean => {
        return auth.user?.role === role;
    };

    /**
     * Check if user is active
     */
    const isActive = (): boolean => {
        return auth.user?.is_active ?? false;
    };

    return {
        permissions,
        can,
        canAny,
        canAll,
        hasRole,
        isActive,
    };
}
