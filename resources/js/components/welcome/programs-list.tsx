import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, GraduationCap, Loader2 } from 'lucide-react';

interface Program {
    id: number;
    name: string;
    major: string | null;
    copNumber: string | null;
    grNumber: string | null;
    graduates_count?: number;
}

interface ProgramsListProps {
    programs: Program[];
    onProgramClick: (program: Program) => void;
    loadingProgramId?: number | null;
}

export default function ProgramsList({
    programs,
    onProgramClick,
    loadingProgramId = null,
}: ProgramsListProps) {
    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Available Programs
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {programs.length} {programs.length === 1 ? 'program' : 'programs'}
                </span>
            </div>
            <div className="grid gap-4">
                {programs.map((program) => {
                    const isLoading = loadingProgramId === program.id;

                    return (
                        <Card
                            key={program.id}
                            className="group cursor-pointer border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.01] hover:shadow-xl dark:bg-gray-800/90 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => !isLoading && onProgramClick(program)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="rounded-lg bg-purple-100 p-3 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/40 dark:group-hover:bg-purple-900/60">
                                            {isLoading ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-purple-600 dark:text-purple-400" />
                                            ) : (
                                                <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                                {program.name}
                                            </h4>
                                            {program.major && (
                                                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">Major:</span> {program.major}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {program.copNumber && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                    >
                                                        <span className="text-xs font-medium">COP:</span>
                                                        <span className="ml-1 font-mono text-xs">{program.copNumber}</span>
                                                    </Badge>
                                                )}
                                                {program.grNumber && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                    >
                                                        <span className="text-xs font-medium">GR:</span>
                                                        <span className="ml-1 font-mono text-xs">{program.grNumber}</span>
                                                    </Badge>
                                                )}
                                                {program.graduates_count !== undefined && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <span className="font-medium">{program.graduates_count}</span>
                                                        <span>graduate{program.graduates_count !== 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {isLoading ? (
                                        <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">
                                            Loading...
                                        </span>
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-500 flex-shrink-0 ml-4" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
