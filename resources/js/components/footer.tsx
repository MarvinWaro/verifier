// resources/js/components/footer.tsx
import React from 'react';

interface FooterProps {
    copyright?: string;
    tagline?: string;
}

const Footer: React.FC<FooterProps> = ({
    copyright = `© ${new Date().getFullYear()} Commission on Higher Education Region XII. All rights reserved.`,
    tagline = 'Permits and Program Registry - CHECK with CHED',
}) => {
    return (
        <footer className="w-full py-6 mt-10">
            <div className="mx-auto max-w-7xl px-4 text-center">
                {/* Copyright Text */}
                <p className="text-sm text-gray-600 dark:text-gray-600">
                    {copyright}
                </p>

                {/* Tagline */}
                {tagline && (
                    <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                        {tagline}
                    </p>
                )}
            </div>
        </footer>
    );
};

export default Footer;
