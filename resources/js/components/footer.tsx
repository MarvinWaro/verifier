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
            title: 'Programs',
            links: [
                { text: 'Overview', url: '#' },
                { text: 'Accreditation', url: '#' },
                { text: 'Scholarships', url: '#' },
                { text: 'Institution Finder', url: '#' },
            ],
        },
        {
            title: 'About',
            links: [
                { text: 'Our Mission', url: '#' },
                { text: 'Leadership', url: '#' },
                { text: 'Offices', url: '#' },
                { text: 'Careers', url: '#' },
                { text: 'Contact', url: '#' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { text: 'Help Center', url: '#' },
                { text: 'FAQs', url: '#' },
                { text: 'Downloads', url: '#' },
                { text: 'News & Updates', url: '#' },
            ],
        },
        {
            title: 'Connect',
            links: [
                { text: 'Facebook', url: '#' },
                { text: 'Twitter', url: '#' },
                { text: 'Instagram', url: '#' },
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
        : 'mt-16 border-t border-gray-200 bg-white py-12 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300';

    const topGridClass = compact
        ? 'grid grid-cols-2 gap-6 lg:grid-cols-6'
        : 'grid grid-cols-2 gap-8 lg:grid-cols-6';
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
                    <div className="col-span-2 mb-4 lg:mb-0">
                        <a href={logo.url} className="flex items-center gap-3">
                            <img
                                src={logo.src}
                                alt={logo.alt}
                                className="h-10 w-10 object-contain dark:invert"
                            />
                            <span
                                className={`text-sm font-semibold ${compact ? 'text-gray-900 dark:text-gray-100' : 'text-lg text-gray-900 dark:text-gray-100'}`}
                            >
                                {logo.title}
                            </span>
                        </a>
                        <p
                            className={`mt-2 ${compact ? 'text-xs text-gray-500 dark:text-gray-300' : 'mt-4 text-sm font-medium text-gray-600 dark:text-gray-400'}`}
                        >
                            {tagline}
                        </p>
                    </div>

                    {/* Menu Columns */}
                    {menuItems.map((section, idx) => (
                        <div key={idx}>
                            <h3
                                className={`mb-3 ${compact ? 'text-xs' : 'text-sm font-semibold'} tracking-wide text-gray-900 uppercase dark:text-gray-100`}
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
                    <ul className="flex flex-wrap gap-4">
                        {bottomLinks.map((link, linkIdx) => (
                            <li key={linkIdx}>
                                <a
                                    href={link.url}
                                    className={`${compact ? 'text-xs' : ''} underline-offset-2 hover:text-blue-600 hover:underline dark:hover:text-blue-400`}
                                >
                                    {link.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
