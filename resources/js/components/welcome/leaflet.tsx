// resources/js/components/welcome/leaflet.tsx

import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function WelcomeLeaflet() {
    return (
        <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-800/90 lg:col-span-8">
            <CardContent className="p-0">
                <div className="relative h-[360px] rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-sky-100 via-blue-100 to-blue-200 dark:border-gray-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:h-[420px] lg:h-[520px]">
                    <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,#00000011_1px,transparent_0)] [background-size:22px_22px] dark:opacity-30" />
                    <div className="relative flex h-full flex-col items-center justify-center gap-4 text-center">
                        <div className="rounded-full bg-white/90 p-4 shadow-md dark:bg-gray-900/80">
                            <MapPin className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                HEI Map Placeholder
                            </p>
                            <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
                                An interactive Leaflet map showing Higher Education Institutions in Region XII will appear here.
                            </p>
                        </div>
                        <p className="mt-2 rounded-full bg-white/80 px-4 py-1 text-xs font-medium uppercase tracking-wide text-blue-700 shadow-sm dark:bg-gray-900/80 dark:text-blue-300">
                            Map coming soon – frontend layout ready
                        </p>
                    </div>

                    <div className="pointer-events-none absolute bottom-4 left-4 w-48 rounded-lg bg-white/90 p-3 text-left text-[11px] shadow-md dark:bg-gray-900/90">
                        <p className="mb-1 font-semibold text-gray-800 dark:text-gray-100">
                            Legend (sample)
                        </p>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            <li>● Public HEI</li>
                            <li>● Private HEI</li>
                            <li>● Satellite Campus</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
