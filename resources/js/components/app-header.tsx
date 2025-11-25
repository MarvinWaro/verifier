import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Building2, Ribbon, GraduationCap, Import, Menu, Moon, Sun, Monitor, Users } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Institutions',
        href: '/institutions',
        icon: Building2,
    },
    {
        title: 'Programs',
        href: '/programs',
        icon: Ribbon,
    },
    {
        title: 'Graduates',
        href: '/graduates',
        icon: GraduationCap,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Import',
        href: '/import',
        icon: Import,
    },
];

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { appearance, updateAppearance } = useAppearance();

    // Function to cycle through themes
    const toggleTheme = () => {
        switch (appearance) {
            case 'light':
                updateAppearance('dark');
                break;
            case 'dark':
                updateAppearance('system');
                break;
            case 'system':
                updateAppearance('light');
                break;
            default:
                updateAppearance('dark');
        }
    };

    // Get current icon and tooltip text based on appearance
    const getThemeIcon = () => {
        switch (appearance) {
            case 'light':
                return { icon: Sun, tooltip: 'Switch to Dark Mode' };
            case 'dark':
                return { icon: Moon, tooltip: 'Switch to System Mode' };
            case 'system':
                return { icon: Monitor, tooltip: 'Switch to Light Mode' };
            default:
                return { icon: Sun, tooltip: 'Toggle theme' };
        }
    };

    const { icon: ThemeIcon, tooltip } = getThemeIcon();

    return (
        <>
            {/* Royal Blue Header */}
            <div className="bg-[#1e40af] dark:bg-[#1e3a8a] shadow-lg">
                <div className="mx-auto flex h-14 items-center justify-between px-4 md:max-w-7xl">
                    {/* Left side - Mobile Menu and Logo/Title */}
                    <div className="flex items-center space-x-3">
                        {/* Mobile Menu */}
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-[34px] w-[34px] text-white hover:bg-white/10"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                                >
                                    <SheetTitle className="sr-only">
                                        Navigation Menu
                                    </SheetTitle>
                                    <SheetHeader className="flex justify-start text-left">
                                        <AppLogoIcon className="h-6 w-6 fill-current text-[#1e40af]" />
                                    </SheetHeader>
                                    <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                        <div className="flex h-full flex-col justify-between text-sm">
                                            <div className="flex flex-col space-y-4">
                                                {mainNavItems.map((item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        className={cn(
                                                            'flex items-center space-x-2 rounded-md px-3 py-2 font-medium transition-colors',
                                                            page.url === item.href
                                                                ? 'bg-[#1e40af] text-white'
                                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                                                        )}
                                                    >
                                                        {item.icon && (
                                                            <Icon
                                                                iconNode={item.icon}
                                                                className="h-5 w-5"
                                                            />
                                                        )}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Logo and Title */}
                        <Link
                            href={dashboard()}
                            prefetch
                            className="flex items-center space-x-3"
                        >
                            <AppLogoIcon className="h-10 w-10 fill-current text-white" />
                            <div className="flex flex-col">
                                <h1 className="text-sm font-bold uppercase leading-tight text-white md:text-base">
                                    CHEDRO XII HEI
                                </h1>
                                <p className="hidden text-xs text-blue-100 md:block">
                                    Programs and Permits Registry
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Right side - Theme Toggle and User Menu */}
                    <div className="flex items-center space-x-2">
                        {/* Theme Toggle */}
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-md text-white hover:bg-white/10 transition-colors"
                                        onClick={toggleTheme}
                                    >
                                        <ThemeIcon className="h-[1.2rem] w-[1.2rem]" />
                                        <span className="sr-only">Toggle theme</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full bg-white/10 p-1 hover:bg-white/20"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full border-2 border-white/20">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="bg-white text-[#1e40af] font-semibold">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* White Navigation Bar */}
            <div className="border-b border-border/50 bg-background">
                <div className="mx-auto flex h-12 items-center px-4 md:max-w-7xl">
                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex h-full items-center">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-0">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'flex h-full items-center space-x-2 border-b-2 px-4 text-sm font-medium transition-colors',
                                                page.url === item.href
                                                    ? 'border-[#1e40af] text-[#1e40af] bg-[#1e40af]/5'
                                                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                                            )}
                                        >
                                            {item.icon && (
                                                <Icon
                                                    iconNode={item.icon}
                                                    className="h-4 w-4"
                                                />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Breadcrumbs for mobile */}
                    <div className="lg:hidden flex-1">
                        {breadcrumbs.length > 1 && <Breadcrumbs breadcrumbs={breadcrumbs} />}
                    </div>
                </div>
            </div>

            {/* Breadcrumbs for desktop */}
            {breadcrumbs.length > 1 && (
                <div className="hidden lg:flex w-full border-b border-border/30 bg-muted/20">
                    <div className="mx-auto flex h-10 w-full items-center justify-start px-4 text-sm md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
