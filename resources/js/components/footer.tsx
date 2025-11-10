// resources/js/components/footer.tsx
import React from 'react';

interface MenuItem {
    title: string;
    links: {
        text: string;
        url: string;
    }[];
}

interface FooterProps {
    compact?: boolean; // when true the footer will be compact for overlay use
    logo?: {
        url: string;
        src: string;
        alt: string;
        title: string;
    };
    tagline?: string;
    menuItems?: MenuItem[];
    copyright?: string;
    bottomLinks?: {
        text: string;
        url: string;
    }[];
}

const Footer: React.FC<FooterProps> = ({
    compact = false,
    logo = {
        url: '/',
        src: '/assets/img/ched-logo.png',
        alt: 'CHED Logo',
        title: 'CHED - Regional Office XII',
    },
    tagline = 'Empowering Higher Education for the Future.',
    menuItems = [
        {
            title: 'About',
            links: [
                { text: 'Our Mission', url: '#' },
                { text: 'Our Vision', url: '#' },
            ],
        },
    ],
    copyright = `© ${new Date().getFullYear()} Commission on Higher Education Regional Office XII. All rights reserved.`,
    bottomLinks = [
        { text: 'Terms & Conditions', url: '#' },
        { text: 'Privacy Policy', url: '#' },
    ],
}) => {
    // base classes switch depending on compact mode
    const wrapperClass = compact
        ? 'py-6 text-gray-700 dark:text-gray-200' // smaller padding
        : 'relative z-10 mt-16 border-t-2 border-gray-200 bg-white py-12 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300';

    const topGridClass = compact
        ? 'grid grid-cols-2 gap-6 lg:grid-cols-3'
        : 'grid grid-cols-2 gap-8 lg:grid-cols-3';
    const bottomClass = compact
        ? 'mt-6 flex flex-col gap-3 pt-4 text-xs text-gray-400 md:flex-row md:items-center md:justify-between'
        : 'mt-12 flex flex-col justify-between gap-4 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 md:flex-row md:items-center';

    return (
        <footer
            className={`${wrapperClass} ${compact ? 'bg-white/6 dark:bg-black/20' : ''}`}
        >
            <div
                className={
                    compact
                        ? 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'
                        : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
                }
            >
                <div className={topGridClass}>
                    {/* Logo + Tagline */}
                    <div className="col-span-2 mb-8 lg:mb-0">
                        <a href={logo.url} className="flex items-center gap-3">
                            <img
                                src={logo.src}
                                alt={logo.alt}
                                className="h-10 w-10 object-contain dark:brightness-110"
                            />
                            <span
                                className={`font-semibold ${compact ? 'text-sm text-gray-900 dark:text-gray-100' : 'text-lg text-gray-900 dark:text-gray-100'}`}
                            >
                                {logo.title}
                            </span>
                        </a>
                        <p
                            className={`${compact ? 'mt-2 text-xs text-gray-500 dark:text-gray-300' : 'mt-4 text-sm font-medium text-gray-600 dark:text-gray-400'}`}
                        >
                            {tagline}
                        </p>
                    </div>

                    {/* Menu Columns - evenly spaced */}
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="col-span-1">
                            <h3
                                className={`mb-4 ${compact ? 'text-xs' : 'text-sm font-semibold'} tracking-wide text-gray-900 uppercase dark:text-gray-100`}
                            >
                                {section.title}
                            </h3>
                            <ul
                                className={`${compact ? 'space-y-2 text-xs' : 'space-y-3 text-sm'}`}
                            >
                                {section.links.map((link, linkIdx) => (
                                    <li key={linkIdx}>
                                        <a
                                            href={link.url}
                                            className="transition-colors duration-150 hover:text-blue-600 dark:hover:text-blue-400"
                                        >
                                            {link.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className={bottomClass}>
                    <p className={compact ? 'text-xs text-gray-400' : ''}>
                        {copyright}
                    </p>

                    {/* Social Media Icons */}
                    <div className="flex items-center gap-4">
                        <a
                            href="#"
                            className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            aria-label="Facebook"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 transition-colors hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-400"
                            aria-label="Twitter"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 transition-colors hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400"
                            aria-label="Instagram"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
