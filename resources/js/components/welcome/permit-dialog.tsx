// resources/js/components/welcome/permit-dialog.tsx

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, School, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProgramInstitution {
    code: string;
    name: string;
    type: string;
}

interface Program {
    id: number | null;
    name: string;
    major: string | null;
    copNumber: string | null;
    grNumber: string | null;
    institution?: ProgramInstitution | undefined;
    permitPdfUrl?: string | null;
}

interface PermitDialogProps {
    open: boolean;
    program: Program | null;
    onOpenChange: (open: boolean) => void;
}

export default function PermitDialog({
    open,
    program,
    onOpenChange,
}: PermitDialogProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isLoadingBlob, setIsLoadingBlob] = useState(false);
    const [blobError, setBlobError] = useState<string | null>(null);

    const permitUrl = program?.permitPdfUrl ?? null;

    const hasCopNumber = !!program?.copNumber;
    const hasGrNumber = !!program?.grNumber;
    const hasPermitNumber = hasCopNumber || hasGrNumber;
    const hasPermitFile = !!permitUrl;

    const permitNumberLabel = hasCopNumber
        ? 'COPC Number'
        : hasGrNumber
        ? 'GR Number'
        : 'Permit Number';

    const permitNumberValue = hasCopNumber
        ? program?.copNumber
        : hasGrNumber
        ? program?.grNumber
        : null;

    const permitContainerHeightClass = hasPermitFile
        ? 'min-h-[260px]'
        : 'min-h-[420px]';

    // Fetch PDF and create blob URL
    useEffect(() => {
        if (!open || !permitUrl) {
            return;
        }

        setIsLoadingBlob(true);
        setBlobError(null);

        // Get CSRF token from meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        // Fetch the PDF through our proxy endpoint
        fetch('/api/permit-pdf-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({ url: permitUrl }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch PDF');
                }
                return response.blob();
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
                setIsLoadingBlob(false);
            })
            .catch(error => {
                console.error('Error fetching PDF:', error);
                setBlobError('Failed to load PDF document');
                setIsLoadingBlob(false);
            });

        // Cleanup blob URL when dialog closes or component unmounts
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
                setBlobUrl(null);
            }
        };
    }, [open, permitUrl]);

    // Also cleanup when dialog closes
    useEffect(() => {
        if (!open && blobUrl) {
            URL.revokeObjectURL(blobUrl);
            setBlobUrl(null);
        }
    }, [open, blobUrl]);

    const handleOpenPdf = () => {
        if (blobUrl) {
            window.open(blobUrl, '_blank');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                {program && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/40">
                                    <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-sm font-semibold leading-snug sm:text-base">
                                    {program.name}
                                </span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="mt-4 space-y-6">
                            {/* Program summary */}
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                                {program.major && (
                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Major:</span>{' '}
                                        {program.major}
                                    </p>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    {program.copNumber && (
                                        <Badge
                                            variant="outline"
                                            className="border-green-200 bg-green-50 text-[11px] text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                                        >
                                            <span className="font-medium">COP:</span>
                                            <span className="ml-1 font-mono">
                                                {program.copNumber}
                                            </span>
                                        </Badge>
                                    )}
                                    {program.grNumber && (
                                        <Badge
                                            variant="outline"
                                            className="border-purple-200 bg-purple-50 text-[11px] text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                        >
                                            <span className="font-medium">GR:</span>
                                            <span className="ml-1 font-mono">
                                                {program.grNumber}
                                            </span>
                                        </Badge>
                                    )}
                                    {program.institution && (
                                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <School className="h-4 w-4" />
                                            <span>{program.institution.name}</span>
                                            <Badge
                                                variant={
                                                    program.institution.type === 'public'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="ml-2 text-[11px] dark:bg-gray-700 dark:text-gray-200"
                                            >
                                                {program.institution.type === 'public'
                                                    ? 'Public'
                                                    : 'Private'}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Permit area */}
                            <div
                                className={`relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-900 dark:to-gray-800 ${permitContainerHeightClass}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                                <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
                                    {hasPermitFile ? (
                                        // =========================
                                        // 1. Has permit number + PDF
                                        // =========================
                                        <>
                                            <h4 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                                Permit Document
                                            </h4>
                                            {permitNumberValue && (
                                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                                    {permitNumberLabel}:{' '}
                                                    <span className="font-mono font-semibold">
                                                        {permitNumberValue}
                                                    </span>
                                                </p>
                                            )}

                                            <div className="flex flex-col items-center gap-3">
                                                {isLoadingBlob ? (
                                                    <Button
                                                        disabled
                                                        className="px-4 py-2 text-sm font-semibold shadow-md"
                                                    >
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Loading PDF...
                                                    </Button>
                                                ) : blobError ? (
                                                    <div className="text-red-600 dark:text-red-400">
                                                        <p className="text-sm font-semibold">{blobError}</p>
                                                        <p className="mt-1 text-xs">Please try again later</p>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={handleOpenPdf}
                                                        disabled={!blobUrl}
                                                        className="px-4 py-2 text-sm font-semibold shadow-md"
                                                    >
                                                        Open permit PDF in new tab
                                                    </Button>
                                                )}
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    The permit will open in a separate browser tab.
                                                </p>
                                            </div>
                                        </>
                                    ) : hasPermitNumber ? (
                                        // ==========================================
                                        // 2. Has COPC / GR number but no PDF uploaded
                                        // ==========================================
                                        <>
                                            <div className="mb-6 rounded-full bg-blue-100 p-4 dark:bg-blue-900/40">
                                                <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                            </div>

                                            <h4 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                                Permit Document Preview
                                            </h4>

                                            <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                                                {permitNumberLabel}:{' '}
                                                <span className="font-mono font-semibold">
                                                    {permitNumberValue}
                                                </span>
                                            </p>

                                            <p className="mb-6 max-w-md text-xs text-gray-600 dark:text-gray-400">
                                                A permit number is recorded for this program, but
                                                the PDF copy has not yet been uploaded to the
                                                registry.
                                            </p>

                                            <div className="mb-6 w-full max-w-md space-y-3 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800/90">
                                                <div className="flex justify-between border-b border-gray-200 pb-2 text-xs sm:text-sm dark:border-gray-700">
                                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                                        Program:
                                                    </span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {program.name}
                                                    </span>
                                                </div>
                                                {program.major && (
                                                    <div className="flex justify-between border-b border-gray-200 pb-2 text-xs sm:text-sm dark:border-gray-700">
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">
                                                            Major:
                                                        </span>
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {program.major}
                                                        </span>
                                                    </div>
                                                )}
                                                {program.institution && (
                                                    <div className="flex justify-between text-xs sm:text-sm">
                                                        <span className="font-medium text-gray-600 dark:text-gray-400">
                                                            Institution:
                                                        </span>
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {program.institution.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/30">
                                                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/40">
                                                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                        Document not yet available
                                                    </p>
                                                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                                                        The digital copy of the permit (PDF) will
                                                        appear here once it is uploaded to the
                                                        system.
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        // ==========================================
                                        // 3. No COPC / GR number and no PDF at all
                                        // ==========================================
                                        <>
                                            <div className="mb-6 animate-pulse rounded-full bg-blue-100 p-6 dark:bg-blue-900/30">
                                                <svg
                                                    className="h-14 w-14 text-blue-600 dark:text-blue-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>

                                            <h4 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                                Permit Document Preview
                                            </h4>
                                            <p className="mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
                                                No permit number is currently recorded for this
                                                program in the registry.
                                            </p>

                                            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/30">
                                                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/40">
                                                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                        Permit information not available
                                                    </p>
                                                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                                                        Once a COPC or GR is issued and uploaded,
                                                        the permit details and document will be
                                                        displayed here.
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
