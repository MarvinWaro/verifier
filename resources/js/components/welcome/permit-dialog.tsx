// resources/js/components/welcome/permit-dialog.tsx

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, School, AlertCircle, Loader2, Maximize2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';

// Import CSS styles for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pdfWidth, setPdfWidth] = useState(600);

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

    // Calculate PDF width based on window size
    useEffect(() => {
        const calculateWidth = () => {
            if (isFullscreen) {
                // Fullscreen: use most of window width, max 1400px
                setPdfWidth(Math.min(window.innerWidth * 0.85, 1400));
            } else {
                // Dialog: use wider width for better fit
                setPdfWidth(Math.min(window.innerWidth * 0.6, 900));
            }
        };

        calculateWidth();
        window.addEventListener('resize', calculateWidth);
        return () => window.removeEventListener('resize', calculateWidth);
    }, [isFullscreen]);

    // Fetch PDF and create blob URL using Axios
    useEffect(() => {
        if (!open || !permitUrl) {
            return;
        }

        setIsLoadingBlob(true);
        setBlobError(null);
        setPageNumber(1);

        // Get CSRF token from meta tag for safety, though Axios usually handles it automatically
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        axios.post('/api/permit-pdf-proxy', { url: permitUrl }, {
            responseType: 'blob', // Important: Tell axios we expect a binary blob
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        })
        .then(response => {
            // Create object URL from the Blob response
            const url = URL.createObjectURL(response.data);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, permitUrl]); // re-run if open state or url changes

    // Also cleanup when dialog closes explicitly
    useEffect(() => {
        if (!open && blobUrl) {
            URL.revokeObjectURL(blobUrl);
            setBlobUrl(null);
            setNumPages(null);
            setPageNumber(1);
            setIsFullscreen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Handle ESC key to close fullscreen
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        if (isFullscreen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    function goToPrevPage() {
        setPageNumber(prev => Math.max(prev - 1, 1));
    }

    function goToNextPage() {
        setPageNumber(prev => Math.min(prev + 1, numPages || 1));
    }

    function toggleFullscreen() {
        setIsFullscreen(!isFullscreen);
    }

    // Fullscreen PDF Viewer
    if (isFullscreen && hasPermitFile) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col bg-black/95">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between bg-black/60 px-6 py-4 backdrop-blur-sm">
                    <div className="text-white">
                        <h3 className="text-lg font-semibold">{program?.name}</h3>
                        {permitNumberValue && (
                            <p className="text-sm text-gray-300">
                                {permitNumberLabel}: <span className="font-mono">{permitNumberValue}</span>
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={() => setIsFullscreen(false)}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* PDF Viewer - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center py-8">
                        {blobUrl && (
                            <Document
                                file={blobUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                    <div className="flex min-h-[500px] items-center justify-center">
                                        <Loader2 className="h-12 w-12 animate-spin text-white" />
                                    </div>
                                }
                                error={
                                    <div className="flex min-h-[500px] flex-col items-center justify-center p-8">
                                        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                                        <p className="text-sm font-semibold text-white">Failed to load PDF</p>
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className="shadow-2xl"
                                    width={pdfWidth}
                                />
                            </Document>
                        )}
                    </div>
                </div>

                {/* Footer Navigation */}
                {numPages && numPages > 1 && (
                    <div className="flex-shrink-0 flex items-center justify-center gap-4 bg-black/60 px-6 py-4 backdrop-blur-sm">
                        <Button
                            onClick={goToPrevPage}
                            disabled={pageNumber <= 1}
                            variant="secondary"
                            size="sm"
                            className="bg-white/10 text-white hover:bg-white/20"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                        </Button>
                        <span className="text-sm font-medium text-white">
                            Page {pageNumber} of {numPages}
                        </span>
                        <Button
                            onClick={goToNextPage}
                            disabled={pageNumber >= numPages}
                            variant="secondary"
                            size="sm"
                            className="bg-white/10 text-white hover:bg-white/20"
                        >
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
                {program && (
                    <>
                        <DialogHeader className="flex-shrink-0">
                            <DialogTitle className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/40">
                                        <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-sm font-semibold leading-snug sm:text-base">
                                        {program.name}
                                    </span>
                                </div>
                                {/* Maximize button moved to header for better UX */}
                                {hasPermitFile && blobUrl && (
                                    <Button
                                        onClick={toggleFullscreen}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Fullscreen</span>
                                    </Button>
                                )}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-2">
                            {/* Program summary */}
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                                {program.major && (
                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Major:</span> {program.major}
                                    </p>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    {program.copNumber && (
                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-[11px] text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300">
                                            <span className="font-medium">COP:</span>
                                            <span className="ml-1 font-mono">{program.copNumber}</span>
                                        </Badge>
                                    )}
                                    {program.grNumber && (
                                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-[11px] text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                            <span className="font-medium">GR:</span>
                                            <span className="ml-1 font-mono">{program.grNumber}</span>
                                        </Badge>
                                    )}
                                    {program.institution && (
                                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <School className="h-4 w-4" />
                                            <span>{program.institution.name}</span>
                                            <Badge variant={program.institution.type === 'public' ? 'default' : 'secondary'} className="ml-2 text-[11px] dark:bg-gray-700 dark:text-gray-200">
                                                {program.institution.type === 'public' ? 'Public' : 'Private'}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Permit area */}
                            {hasPermitFile ? (
                                <div className="rounded-lg border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900">
                                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Permit Document</h4>
                                        {permitNumberValue && (
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                {permitNumberLabel}: <span className="font-mono font-semibold">{permitNumberValue}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative bg-gray-100 dark:bg-gray-950">
                                        {isLoadingBlob ? (
                                            <div className="flex min-h-[500px] flex-col items-center justify-center p-8">
                                                <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Loading PDF preview...</p>
                                            </div>
                                        ) : blobError ? (
                                            <div className="flex min-h-[500px] flex-col items-center justify-center p-8">
                                                <AlertCircle className="mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
                                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">{blobError}</p>
                                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Please try again later</p>
                                            </div>
                                        ) : blobUrl ? (
                                            <div className="relative flex justify-center p-6">
                                                <div className="relative group cursor-pointer" onClick={toggleFullscreen}>
                                                    <Document
                                                        file={blobUrl}
                                                        onLoadSuccess={onDocumentLoadSuccess}
                                                        loading={
                                                            <div className="flex min-h-[500px] items-center justify-center">
                                                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                        }
                                                        error={
                                                            <div className="flex min-h-[500px] flex-col items-center justify-center p-8">
                                                                <AlertCircle className="mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
                                                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Failed to load PDF</p>
                                                            </div>
                                                        }
                                                    >
                                                        <Page
                                                            pageNumber={pageNumber}
                                                            renderTextLayer={true}
                                                            renderAnnotationLayer={true}
                                                            className="shadow-lg transition-opacity duration-200 group-hover:opacity-90"
                                                            width={280}
                                                        />
                                                    </Document>

                                                    {/* Hover Overlay: Click to View Fullscreen */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-sm">
                                                        <div className="bg-black/70 text-white px-4 py-2 rounded-md flex items-center gap-2 backdrop-blur-sm">
                                                            <Maximize2 className="h-4 w-4" />
                                                            <span className="text-sm font-medium">Click to Enlarge</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Pagination Controls */}
                                    {numPages && numPages > 1 && (
                                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
                                            <div className="flex items-center justify-between">
                                                <Button onClick={goToPrevPage} disabled={pageNumber <= 1} variant="outline" size="sm">
                                                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                                                </Button>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">Page {pageNumber} of {numPages}</p>
                                                <Button onClick={goToNextPage} disabled={pageNumber >= numPages} variant="outline" size="sm">
                                                    Next <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : hasPermitNumber ? (
                                <div className="relative min-h-[420px] overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-900 dark:to-gray-800">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                                    <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
                                        <div className="mb-6 rounded-full bg-blue-100 p-4 dark:bg-blue-900/40">
                                            <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h4 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Permit Document Preview</h4>
                                        <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                                            {permitNumberLabel}: <span className="font-mono font-semibold">{permitNumberValue}</span>
                                        </p>
                                        <p className="mb-6 max-w-md text-xs text-gray-600 dark:text-gray-400">
                                            A permit number is recorded for this program, but the PDF copy has not yet been uploaded to the registry.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative min-h-[420px] overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-900 dark:to-gray-800">
                                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                                    <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
                                        <div className="mb-6 animate-pulse rounded-full bg-blue-100 p-6 dark:bg-blue-900/30">
                                            <AlertCircle className="h-14 w-14 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h4 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Permit Document Preview</h4>
                                        <p className="mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
                                            No permit number is currently recorded for this program in the registry.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
