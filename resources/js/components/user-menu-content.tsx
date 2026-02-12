import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, History, Users } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { can } = usePermissions();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
                {/* Settings - Visible to everyone */}
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full"
                        href={edit()}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>

                {/* Users - Permission-based */}
                {can('view_users') && (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full"
                            href="/users"
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <Users className="mr-2" />
                            Users
                        </Link>
                    </DropdownMenuItem>
                )}

                {/* Logs - Permission-based */}
                {can('view_activity_logs') && (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full"
                            href="/logs"
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <History className="mr-2" />
                            Logs
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
