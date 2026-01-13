// resources/js/components/welcome/welcome-nav.tsx

import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { LogIn, Info } from 'lucide-react';

interface WelcomeNavProps {
    ThemeIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    tooltip: string;
    onToggleTheme: () => void;
}

const NavItem = ({
    href,
    label,
    Icon,
}: {
    href: string;
    label: string;
    Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) => (
    <a
        href={href}
        className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
    >
        {Icon && <Icon className="h-4 w-4 opacity-90 group-hover:opacity-100" />}
        {label}
    </a>
);

const WelcomeNav: React.FC<WelcomeNavProps> = ({ ThemeIcon, tooltip, onToggleTheme }) => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-blue-900/95 backdrop-blur dark:bg-blue-950/95">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: Logo + title */}
                <a href="/" className="flex items-center gap-3">
                    <img
                        src="/assets/img/ched-logo.png"
                        alt="CHED Logo"
                        className="h-9 w-9 object-contain"
                    />
                    <div className="leading-tight">
                        <div className="text-sm font-semibold text-white">COMMISSION ON HIGHER EDUCATION - REGIONAL OFFICE XII</div>
                        <div className="text-[13px] text-white/70">
                            Programs and Permits Registry
                        </div>
                    </div>
                </a>

                {/* Right: About + Login + theme toggle */}
                <div className="flex items-center gap-2">
                    {/* About beside Login */}
                    {/* <NavItem href="#about" label="About" Icon={Info} /> */}

                    <a
                        href="/login"
                        className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-900 shadow hover:bg-white/90"
                    >
                        <LogIn className="h-4 w-4" />
                        Log in
                    </a>

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={onToggleTheme}
                                    className="rounded-full bg-white/10 p-2 text-white shadow-sm transition hover:bg-white/20"
                                    aria-label="Toggle theme"
                                >
                                    <ThemeIcon className="h-5 w-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Mobile nav (About only) */}
            {/* <div className="border-t border-white/10 md:hidden">
                <div className="mx-auto flex max-w-7xl items-center gap-1 px-2 py-2">
                    <NavItem href="#about" label="About" Icon={Info} />
                </div>
            </div> */}
        </header>
    );
};

export default WelcomeNav;
