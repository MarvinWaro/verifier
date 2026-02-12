import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editPassword } from '@/routes/password';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useMemo } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { can } = usePermissions();

    // Personal settings items
    const personalItems: NavItem[] = [
        {
            title: 'Profile',
            href: edit(),
            icon: null,
        },
        {
            title: 'Password',
            href: editPassword(),
            icon: null,
        },
        {
            title: 'Two-Factor Auth',
            href: show(),
            icon: null,
        },
        {
            title: 'Appearance',
            href: editAppearance(),
            icon: null,
        },
    ];

    // Admin management items (conditionally built)
    const adminItems: NavItem[] = useMemo(() => {
        const items: NavItem[] = [];

        if (can('view_users')) {
            items.push({
                title: 'Users',
                href: '/settings/users',
                icon: null,
            });
        }

        if (can('manage_roles')) {
            items.push({
                title: 'Roles',
                href: '/settings/roles',
                icon: null,
            });
        }

        if (can('view_imports')) {
            items.push({
                title: 'Import',
                href: '/settings/import',
                icon: null,
            });
        }

        if (can('view_concerns')) {
            items.push({
                title: 'Concerns',
                href: '/settings/concerns',
                icon: null,
            });
        }

        return items;
    }, [can]);

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {/* Personal Settings Section */}
                        <div className="pb-2">
                            <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Personal Settings
                            </h3>
                            {personalItems.map((item, index) => (
                                <Button
                                    key={`${typeof item.href === 'string' ? item.href : item.href.url}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted':
                                            currentPath ===
                                            (typeof item.href === 'string'
                                                ? item.href
                                                : item.href.url),
                                    })}
                                >
                                    <Link href={item.href}>
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </div>

                        {/* Admin Management Section */}
                        {adminItems.length > 0 && (
                            <>
                                <Separator className="my-3" />
                                <div className="pt-2">
                                    <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Admin Management
                                    </h3>
                                    {adminItems.map((item, index) => (
                                        <Button
                                            key={`${typeof item.href === 'string' ? item.href : item.href.url}-${index}`}
                                            size="sm"
                                            variant="ghost"
                                            asChild
                                            className={cn('w-full justify-start', {
                                                'bg-muted':
                                                    currentPath ===
                                                    (typeof item.href === 'string'
                                                        ? item.href
                                                        : item.href.url),
                                            })}
                                        >
                                            <Link href={item.href}>
                                                {item.icon && (
                                                    <item.icon className="h-4 w-4" />
                                                )}
                                                {item.title}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </>
                        )}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 min-w-0 overflow-x-auto">
                    <section className="space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
