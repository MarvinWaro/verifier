import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, School } from 'lucide-react';

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

    // backend may send a full URL
    permitPdfUrl?: string | null;
}

interface PermitDialogProps {
    open: boolean;
    program: Program | null;
    onOpenChange: (open: boolean) => void;
}

export default function PermitDialog({ open, program, onOpenChange }: PermitDialogProps) {
    const permitUrl = program?.permitPdfUrl ?? null;
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
                                <span>{program.name}</span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="mt-4 space-y-6">
                            {/* Program summary */}
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                                {program.major && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">Major:</span> {program.major}
                                    </p>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    {program.copNumber && (
                                        <Badge
                                            variant="outline"
                                            className="border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                                        >
                                            <span className="font-medium">COP:</span>{' '}
                                            <span className="ml-1 font-mono">{program.copNumber}</span>
                                        </Badge>
                                    )}
                                    {program.grNumber && (
                                        <Badge
                                            variant="outline"
                                            className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                        >
                                            <span className="font-medium">GR:</span>{' '}
                                            <span className="ml-1 font-mono">{program.grNumber}</span>
                                        </Badge>
                                    )}
                                    {program.institution && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                            <School className="h-4 w-4" />
                                            <span>{program.institution.name}</span>
                                            <Badge
                                                variant={
                                                    program.institution.type === 'public'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="ml-2 dark:bg-gray-700 dark:text-gray-200"
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
                            <div className="relative min-h-[420px] overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-900 dark:to-gray-800">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                                <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
                                    {permitUrl ? (
                                        <>
                                            <h4 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                                Permit Document
                                            </h4>
                                            <p className="mb-4 max-w-md text-sm text-gray-600 dark:text-gray-400">
                                                {program.copNumber
                                                    ? `COPC Number: ${program.copNumber}`
                                                    : program.grNumber
                                                    ? `GR Number: ${program.grNumber}`
                                                    : ''}
                                            </p>

                                            {/* Same behavior as portal "Open file" */}
                                            <a
                                                href={permitUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                            >
                                                Open permit PDF in new tab
                                            </a>

                                            {/* Optional inline preview (may be blocked by X-Frame-Options, but link above will still work) */}
                                            {/* <div className="mt-6 h-[420px] w-full max-w-3xl">
                                                <iframe
                                                    src={permitUrl}
                                                    className="h-full w-full rounded-lg border dark:border-gray-700"
                                                    title="Permit document"
                                                />
                                            </div> */}
                                        </>
                                    ) : (
                                        <>
                                            {/* Fallback: no permit number at all */}
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
                                                {program.copNumber
                                                    ? `COPC Number: ${program.copNumber}`
                                                    : program.grNumber
                                                    ? `GR Number: ${program.grNumber}`
                                                    : 'No permit number available for this program.'}
                                            </p>

                                            <div className="mb-6 w-full max-w-md space-y-3 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800/90">
                                                <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Program:
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {program.name}
                                                    </span>
                                                </div>
                                                {program.major && (
                                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            Major:
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {program.major}
                                                        </span>
                                                    </div>
                                                )}
                                                {program.institution && (
                                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            Institution:
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {program.institution.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/30">
                                                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/40">
                                                    <svg
                                                        className="h-5 w-5 text-blue-600 dark:text-blue-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                        Document Preview Placeholder
                                                    </p>
                                                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                                                        The actual permit document (PDF) will be displayed here once
                                                        uploaded to the system.
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
