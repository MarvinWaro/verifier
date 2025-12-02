// resources/js/components/welcome/institution-results-list.tsx

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
    programsError: Record<string, string | null>; // kept for compatibility
    onProgramClick: (program: Program) => void;   // kept for compatibility
    loadingProgramId?: number | null;            // kept for compatibility
}

export default function InstitutionResultsList({
    institutions,
    expandedInstitutionCode,
    onToggleInstitution,
    programsByInstitution,
    programsLoading,
}: InstitutionResultsListProps) {
    return (
        <div className="mx-auto max-w-full">
            <div className="flex flex-col gap-2">
                {institutions.map((institution) => {
                    const isSelected = expandedInstitutionCode === institution.code;

                    const loadedPrograms = programsByInstitution[institution.code];
                    const hasLoadedOnce = loadedPrograms !== undefined;

                    const programsCount =
                        loadedPrograms?.length ??
                        institution.programs?.length ??
                        0;

                    const isLoadingPrograms =
                        programsLoading[institution.code] === true;

                    let helperText: string;
                    if (isLoadingPrograms) {
                        helperText = 'Loading programs...';
                    } else if (hasLoadedOnce && programsCount > 0) {
                        helperText = `${programsCount} program${
                            programsCount !== 1 ? 's' : ''
                        } loaded`;
                    } else {
                        helperText = 'Tap to view programs';
                    }

                    return (
                        <Card
                            key={institution.code}
                            className={`group border border-transparent bg-white/95 shadow-sm transition-all hover:shadow-md dark:bg-gray-900/90 ${
                                isSelected
                                    ? 'border-blue-400 ring-1 ring-blue-100 dark:border-blue-500/70'
                                    : ''
                            }`}
                        >
                            <CardContent className="px-4 py-3">
                                <button
                                    type="button"
                                    onClick={() => onToggleInstitution(institution)}
                                    className="flex w-full items-center justify-between gap-3 text-left"
                                    aria-pressed={isSelected}
                                >
                                    <div className="flex flex-1 items-start gap-3">
                                        <div className="mt-0.5 rounded-lg bg-blue-100 p-2.5 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/40 dark:group-hover:bg-blue-900/60">
                                            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            {/* SCHOOL NAME – wrapped, compact */}
                                            <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white break-words">
                                                {institution.name}
                                            </h3>

                                            {/* Code + type */}
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                    Code:{' '}
                                                    <span className="ml-1 font-mono">
                                                        {institution.code}
                                                    </span>
                                                </span>

                                                <Badge
                                                    variant={
                                                        institution.type === 'public'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="px-2 py-0.5 text-[11px] font-medium dark:bg-gray-800 dark:text-gray-100"
                                                >
                                                    {institution.type === 'public'
                                                        ? 'Public Institution'
                                                        : 'Private Institution'}
                                                </Badge>
                                            </div>

                                            {/* Helper text: Tap to view / X programs loaded */}
                                            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                                <svg
                                                    className="h-3 w-3 flex-shrink-0"
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
                                                <span>{helperText}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronDown
                                        className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-hover:text-gray-500 dark:text-gray-500 ${
                                            isSelected ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
