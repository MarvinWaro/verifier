import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProgramsList from '@/components/welcome/programs-list';
import { Building2, ChevronDown } from 'lucide-react';

interface Program {
    id: number | null;
    name: string;
    major: string | null;
    copNumber: string | null;
    grNumber: string | null;
    graduates_count?: number;
}

interface Institution {
    id: number | null;
    code: string;
    name: string;
    type: 'public' | 'private';
    programs: Program[];
}

interface InstitutionResultsListProps {
    institutions: Institution[];
    expandedInstitutionCode: string | null;
    onToggleInstitution: (institution: Institution) => void;
    programsByInstitution: Record<string, Program[]>;
    programsLoading: Record<string, boolean>;
    programsError: Record<string, string | null>;
    onProgramClick: (program: Program) => void;
    loadingProgramId?: number | null;
}

export default function InstitutionResultsList({
    institutions,
    expandedInstitutionCode,
    onToggleInstitution,
    programsByInstitution,
    programsLoading,
    programsError,
    onProgramClick,
    loadingProgramId = null,
}: InstitutionResultsListProps) {
    return (
        <div className="mx-auto max-w-6xl">
            <div className="grid gap-4">
                {institutions.map((institution) => {
                    const isExpanded = expandedInstitutionCode === institution.code;

                    // Programs that have actually been loaded for this institution
                    const loadedPrograms = programsByInstitution[institution.code];

                    // Use loaded programs if present, otherwise fall back to the
                    // institution's inline programs array (usually empty from search)
                    const programs =
                        loadedPrograms ?? institution.programs ?? [];

                    const isLoading = programsLoading[institution.code] === true;
                    const errorText = programsError[institution.code] ?? null;

                    // Has this institution ever had its programs loaded at least once?
                    // - Before first click: undefined  -> false  -> show "Tap to view programs"
                    // - After first fetch: [] or [...]-> true   -> show "X programs loaded"
                    const hasLoadedOnce = loadedPrograms !== undefined;

                    return (
                        <Card
                            key={institution.code}
                            className="group border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-gray-800/90"
                        >
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4">
                                    {/* Header row behaves like accordion button */}
                                    <button
                                        type="button"
                                        onClick={() => onToggleInstitution(institution)}
                                        className="flex w-full items-center justify-between text-left"
                                        aria-expanded={isExpanded}
                                        aria-label={
                                            isExpanded
                                                ? 'Collapse programs list'
                                                : 'Expand programs list'
                                        }
                                    >
                                        <div className="flex flex-1 items-start gap-4">
                                            <div className="rounded-lg bg-blue-100 p-3 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/40 dark:group-hover:bg-blue-900/60">
                                                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="mb-2 truncate text-lg font-semibold text-gray-900 dark:text-white">
                                                    {institution.name}
                                                </h3>

                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                        Code: {institution.code}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            institution.type === 'public'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="dark:bg-gray-700 dark:text-gray-200"
                                                    >
                                                        {institution.type === 'public'
                                                            ? 'Public Institution'
                                                            : 'Private Institution'}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                            />
                                                        </svg>

                                                        {hasLoadedOnce ? (
                                                            <>
                                                                <span className="font-medium">
                                                                    {programs.length}
                                                                </span>
                                                                <span>
                                                                    {' '}
                                                                    program
                                                                    {programs.length !== 1 ? 's' : ''} loaded
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                Tap to view programs
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <ChevronDown
                                            className={`ml-4 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${
                                                isExpanded ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {/* Expanded content */}
                                    {isExpanded && (
                                        <div className="border-t pt-4">
                                            {isLoading ? (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Loading programs…
                                                </p>
                                            ) : errorText ? (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    {errorText}
                                                </p>
                                            ) : programs.length === 0 ? (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    No programs available for this institution.
                                                </p>
                                            ) : (
                                                <ProgramsList
                                                    programs={programs}
                                                    onProgramClick={onProgramClick}
                                                    loadingProgramId={loadingProgramId}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
