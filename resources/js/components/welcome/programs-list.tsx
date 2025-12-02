import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Loader2 } from 'lucide-react';

interface Program {
    id: number | null; // null for portal-only programs
    name: string;
    major: string | null;
    copNumber: string | null;
    grNumber: string | null;
    graduates_count?: number; // still allowed in data, just not shown
}

interface ProgramsListProps {
    programs: Program[];
    onProgramClick: (program: Program) => void; // triggers dialog open in parent
    loadingProgramId?: number | null;
}

export default function ProgramsList({
    programs,
    onProgramClick,
    loadingProgramId = null,
}: ProgramsListProps) {
    return (
        <div className="grid gap-4">
            {programs.map((program, index) => {
                const isLoading =
                    loadingProgramId !== null && loadingProgramId === program.id;

                return (
                    <Card
                        key={
                            program.id ??
                            `${program.name}-${program.major ?? 'nomajor'}-${index}`
                        }
                        className="group border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.01] hover:shadow-xl dark:bg-gray-800/90"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-1 items-start gap-4">
                                    <div className="rounded-lg bg-purple-100 p-3 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/40 dark:group-hover:bg-purple-900/60">
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
                                        ) : (
                                            <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        {/* Program name – same size style as institutions */}
                                        <h4
                                            className="
                                                mb-1
                                                text-[13px]
                                                font-semibold
                                                leading-snug
                                                text-gray-900
                                                break-words
                                                line-clamp-2
                                                dark:text-white
                                            "
                                        >
                                            {program.name}
                                        </h4>

                                        {program.major && (
                                            <p className="mb-2 text-[11px] text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Major:</span>{' '}
                                                {program.major}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-2">
                                            {program.copNumber && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                >
                                                    <span className="text-[10px] font-medium">
                                                        COP:
                                                    </span>
                                                    <span className="ml-1 font-mono text-[10px]">
                                                        {program.copNumber}
                                                    </span>
                                                </Badge>
                                            )}

                                            {program.grNumber && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                >
                                                    <span className="text-[10px] font-medium">
                                                        GR:
                                                    </span>
                                                    <span className="ml-1 font-mono text-[10px]">
                                                        {program.grNumber}
                                                    </span>
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* View permit button */}
                                <div className="flex flex-col items-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isLoading}
                                        onClick={() => !isLoading && onProgramClick(program)}
                                        className="mt-1"
                                    >
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {isLoading ? 'Loading…' : 'View permit'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
