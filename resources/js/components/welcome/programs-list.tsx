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

    // Helper: Determine badge style based on PDF availability
    const getPermitStyle = (hasPdf: boolean) => {
        if (hasPdf) {
            // Green: Has Permit + PDF
            return "border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300";
        }
        // Purple: Has Permit but No PDF
        return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    };

    // Sort Programs Function
    const sortPrograms = (list: Program[]) => {
        return [...list].sort((a, b) => {
            const aHasPermit = !!(a.copNumber || a.grNumber);
            const aHasPdf = !!a.permitPdfUrl;

            const bHasPermit = !!(b.copNumber || b.grNumber);
            const bHasPdf = !!b.permitPdfUrl;

            // Assign weights (Lower number = Higher priority)
            const getWeight = (hasPermit: boolean, hasPdf: boolean) => {
                if (hasPermit && hasPdf) return 1; // Green
                if (hasPermit && !hasPdf) return 2; // Purple
                return 3; // Red
            };

            const weightA = getWeight(aHasPermit, aHasPdf);
            const weightB = getWeight(bHasPermit, bHasPdf);

            if (weightA !== weightB) {
                return weightA - weightB;
            }

            return a.name.localeCompare(b.name);
        });
    };

    const sortedPrograms = sortPrograms(programs);

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
                {sortedPrograms.map((program, index) => {
                    const isLoading = loadingProgramId !== null && loadingProgramId === program.id;
                    const hasPdf = !!program.permitPdfUrl;
                    const hasAnyPermit = program.copNumber || program.grNumber;

                    // UPDATED: Card styles
                    // If no permit: Red-400 border, Red-50 background, and 60% opacity
                    const cardStyle = !hasAnyPermit
                        ? "border-red-400 bg-red-50 opacity-60 dark:border-red-500/50 dark:bg-red-900/20"
                        : "border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/90";

                    return (
                        <Card
                            key={program.id ?? `${program.name}-${program.major ?? 'nomajor'}-${index}`}
                            // Apply the conditional cardStyle here
                            className={`py-0 group border border-dashed shadow-sm transition-all hover:shadow-md ${cardStyle}`}
                        >
                            <CardContent className="px-4 py-3 sm:px-5 sm:py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-1 items-start gap-3">
                                        <div className={`rounded-lg p-2.5 transition-colors ${!hasAnyPermit ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-purple-100 group-hover:bg-purple-200 dark:bg-purple-900/40 dark:group-hover:bg-purple-900/60'}`}>
                                            {isLoading ? (
                                                <Loader2 className={`h-5 w-5 animate-spin ${!hasAnyPermit ? 'text-red-600' : 'text-purple-600 dark:text-purple-400'}`} />
                                            ) : (
                                                <GraduationCap className={`h-5 w-5 ${!hasAnyPermit ? 'text-red-600' : 'text-purple-600 dark:text-purple-400'}`} />
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
                                                {/* Case 1: Public (COP) */}
                                                {program.copNumber && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`px-2 py-0.5 text-[11px] ${getPermitStyle(hasPdf)}`}
                                                    >
                                                        <span className="font-medium">No:</span>
                                                        <span className="ml-1 font-mono text-sm">{program.copNumber}</span>
                                                    </Badge>
                                                )}

                                                {/* Case 2: Private (GR) */}
                                                {program.grNumber && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`px-2 py-0.5 text-[11px] ${getPermitStyle(hasPdf)}`}
                                                    >
                                                        <span className="font-medium">No:</span>
                                                        <span className="ml-1 font-mono text-sm">{program.grNumber}</span>
                                                    </Badge>
                                                )}

                                                {/* Case 3: No Permit Number */}
                                                {!hasAnyPermit && (
                                                    <Badge
                                                        variant="outline"
                                                        // UPDATED: Reverted to Red Text / Outline style (Background removed)
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
                                            className={`mt-0.5 h-8 px-3 text-xs ${!hasPdf ? 'opacity-50 cursor-not-allowed' : ''} ${!hasAnyPermit ? 'border-red-200 bg-white hover:bg-red-50 text-red-700' : ''}`}
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
