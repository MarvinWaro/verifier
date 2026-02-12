import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

// Permission enum matching backend
export type Permission =
    | 'view_users'
    | 'create_users'
    | 'update_users'
    | 'delete_users'
    | 'toggle_user_active'
    | 'view_graduates'
    | 'update_graduates'
    | 'delete_graduates'
    | 'view_imports'
    | 'import_institutions'
    | 'import_graduates'
    | 'clear_data'
    | 'view_concerns'
    | 'view_activity_logs'
    | 'manage_roles'
    | 'view_dashboard'
    | 'view_institutions'
    | 'view_programs'
    | 'update_program_catalog';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'prc';
    is_active: boolean;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    permissions: Permission[];
    [key: string]: unknown; // This allows for additional properties...
}
