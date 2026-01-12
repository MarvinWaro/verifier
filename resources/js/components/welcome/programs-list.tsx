// resources/js/components/welcome/programs-list.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';

interface Program {
    id: number | null;
    name: string;
    major: string | null;
    copNumber: string | null;
    grNumber: string | null;
    graduates_count?: number;
    permitPdfUrl?: string | null;
}

interface ProgramsListProps {
    programs: Program[];
    onProgramClick: (program: Program) => void;
    loadingProgramId?: number | null;
    showHeader?: boolean;
}

export default function ProgramsList({
    programs,
    onProgramClick,
    loadingProgramId = null,
    showHeader = true,
}: ProgramsListProps) {

    // Helper function to determine badge style based on PDF availability
    const getPermitStyle = (hasPdf: boolean) => {
        if (hasPdf) {
            // Green (Complete: Number + PDF)
            return "border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300";
        }
        // Purple (Number Only: No PDF)
        return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    };

    return (
        <>
            {showHeader && (
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                        Available Programs
                    </h3>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {programs.length} {programs.length === 1 ? 'program' : 'programs'}
                    </span>
                </div>
            )}

            <div className="space-y-3">
                {programs.map((program, index) => {
                    const isLoading = loadingProgramId !== null && loadingProgramId === program.id;
                    const hasPdf = !!program.permitPdfUrl;

                    // Check if we have any permit number at all
                    const hasAnyPermit = program.copNumber || program.grNumber;

                    return (
                        <Card
                            key={program.id ?? `${program.name}-${program.major ?? 'nomajor'}-${index}`}
                            className="group border border-dashed border-gray-200 bg-white/95 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900/90 py-0!"
                        >
                            <CardContent className="px-4 py-3 sm:px-5 sm:py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-1 items-start gap-3">
                                        <div className="rounded-lg bg-purple-100 p-2.5 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/40 dark:group-hover:bg-purple-900/60">
                                            {isLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
                                            ) : (
                                                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h4 className="mb-1 break-words text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                                                {program.name}
                                            </h4>

                                            {program.major && (
                                                <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">Major:</span> {program.major}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Case 1: Public (COP) -> Label: No: */}
                                                {program.copNumber && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`px-2 py-0.5 text-[11px] ${getPermitStyle(hasPdf)}`}
                                                    >
                                                        <span className="font-medium">No:</span>
                                                        <span className="ml-1 font-mono font-bold text-sm">{program.copNumber}</span>
                                                    </Badge>
                                                )}

                                                {/* Case 2: Private (GR) -> Label: No: */}
                                                {program.grNumber && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`px-2 py-0.5 text-[11px] ${getPermitStyle(hasPdf)}`}
                                                    >
                                                        <span className="font-medium">No:</span>
                                                        <span className="ml-1 font-mono font-bold text-sm">{program.grNumber}</span>
                                                    </Badge>
                                                )}

                                                {/* Case 3: No Permit Number (Red) */}
                                                {!hasAnyPermit && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-red-200 bg-red-50 px-2 py-0.5 text-[11px] text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
                                                    >
                                                        <AlertCircle className="mr-1 h-3 w-3" />
                                                        <span className="font-bold text-sm">CHECK WITH CHED</span>
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={isLoading || !hasPdf}
                                            onClick={() => !isLoading && hasPdf && onProgramClick(program)}
                                            className={`mt-0.5 h-8 px-3 text-xs ${!hasPdf ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                            {isLoading ? 'Loading…' : (hasPdf ? 'View permit' : 'No PDF')}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
