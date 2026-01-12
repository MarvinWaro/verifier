// resources/js/components/welcome/concerns.tsx

import { Info } from 'lucide-react';

export default function Concerns() {
    return (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                <div className="text-sm">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-400">
                        Important Notice
                    </h4>
                    <p className="mt-1 text-amber-800 dark:text-amber-500">
                        For permits corrections, discrepancies, and/or other concerns, please notify us here:{' '}
                        <span className="font-semibold">
                            <a
                                href="#"
                                className="text-blue-600 underline transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Programs and Permits Concerns
                            </a>
                        </span>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
