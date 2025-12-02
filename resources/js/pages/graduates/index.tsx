import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

interface Props {
    // kept for future use; currently unused
    graduates: unknown[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Graduates',
        href: '/graduates',
    },
];

export default function GraduateIndex(_props: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Graduates" />

            {/* Full-height, centered “floating” content */}
            <div className="flex h-full flex-1 flex-col items-center justify-center px-4 py-10">
                <div className="mx-auto flex max-w-3xl flex-col items-center text-center space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Graduates Module
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            This feature is currently being aligned with PRC and will be available soon.
                        </p>
                    </div>

                    {/* Illustration / placeholder image */}
                    <div className="w-full max-w-xl overflow-hidden rounded-xl">
                        <img
                            src="/assets/img/system-fix.jpg"
                            alt="System enhancement in progress"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <p className="max-w-xl text-sm text-muted-foreground">
                        The Graduates listing and verification module is under development.
                        CHEDRO XII and PRC are currently finalizing data integration and validation workflows.
                        Once ready, you’ll be able to browse and verify graduates directly from this page.
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => window.location.reload()}
                    >
                        Refresh page
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
