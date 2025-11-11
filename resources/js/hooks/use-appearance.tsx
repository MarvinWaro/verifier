import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

/** True if OS theme is dark */
const prefersDark = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

/** Write a simple cookie (for SSR if you need it) */
const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

/** Apply the theme to <html> (Tailwind/shadcn expects the 'dark' class) */
const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const mediaQuery = () =>
    typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)');

let systemListener: ((e: MediaQueryListEvent) => void) | null = null;

const handleSystemThemeChange = () => {
    const currentAppearance = (localStorage.getItem('appearance') as Appearance) || 'light';
    // Only apply if we're in system mode
    if (currentAppearance === 'system') {
        applyTheme(currentAppearance);
    }
};

/** Call this once before React renders to avoid FOUC/flash */
export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'light';
    applyTheme(savedAppearance);

    // Set up system listener
    const mq = mediaQuery();
    if (mq && !systemListener) {
        systemListener = handleSystemThemeChange;
        mq.addEventListener('change', systemListener);
    }
}

export function useAppearance() {
    // Initialize with a function to avoid unnecessary re-renders
    const [appearance, setAppearance] = useState<Appearance>(() => {
        if (typeof window === 'undefined') return 'light';
        return (localStorage.getItem('appearance') as Appearance) || 'light';
    });

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode); // client persistence
        setCookie('appearance', mode); // optional SSR hint
        applyTheme(mode);
    }, []);

    useEffect(() => {
        // Apply the saved appearance on mount
        const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'light';

        // Only update if different from current state
        if (savedAppearance !== appearance) {
            setAppearance(savedAppearance);
            applyTheme(savedAppearance);
        }

        // Set up system theme listener
        const mq = mediaQuery();
        if (mq) {
            const listener = () => {
                const current = (localStorage.getItem('appearance') as Appearance) || 'light';
                if (current === 'system') {
                    applyTheme(current);
                }
            };
            mq.addEventListener('change', listener);

            return () => {
                mq.removeEventListener('change', listener);
            };
        }
    }, []); // Empty dependency array - only run once on mount

    return { appearance, updateAppearance } as const;
}
