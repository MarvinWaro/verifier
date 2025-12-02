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
    programsError: Record<string, string | null>;
    onProgramClick: (program: Program) => void; // kept for compatibility
    loadingProgramId?: number | null;
}

export default function InstitutionResultsList({
    institutions,
    expandedInstitutionCode,
    onToggleInstitution,
    programsByInstitution,
    programsLoading,
    programsError,
}: InstitutionResultsListProps) {
    return (
        <div className="mx-auto max-w-6xl">
            <div className="space-y-3">
                {institutions.map((institution) => {
                    const isSelected = expandedInstitutionCode === institution.code;

                    const loadedPrograms = programsByInstitution[institution.code];
                    const programs = loadedPrograms ?? institution.programs ?? [];
                    const isLoading = programsLoading[institution.code] === true;
                    const errorText = programsError[institution.code] ?? null;
                    const hasLoadedOnce = loadedPrograms !== undefined;

                    return (
                        <Card
                            key={institution.code}
                            className={`group cursor-pointer border border-transparent bg-white/90 shadow-sm transition-all hover:shadow-md dark:bg-gray-800/90 ${
                                isSelected
                                    ? 'border-blue-400 ring-1 ring-blue-200 dark:border-blue-500'
                                    : ''
                            }`}
                        >
                            <CardContent className="p-0">
                                <button
                                    type="button"
                                    onClick={() => onToggleInstitution(institution)}
                                    className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5 sm:py-4"
                                    aria-expanded={isSelected}
                                >
                                    <div className="flex flex-1 items-start gap-3 sm:gap-4">
                                        {/* icon */}
                                        <div className="mt-[2px] rounded-lg bg-blue-100 p-3 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/40 dark:group-hover:bg-blue-900/60">
                                            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>

                                        {/* text */}
                                        <div className="min-w-0 flex-1">
                                            {/* SCHOOL NAME */}
                                            <h3
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
                                                {institution.name}
                                            </h3>

                                            {/* code + type */}
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
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
                                                    className="text-[11px] dark:bg-gray-700 dark:text-gray-200"
                                                >
                                                    {institution.type === 'public'
                                                        ? 'Public Institution'
                                                        : 'Private Institution'}
                                                </Badge>
                                            </div>

                                            {/* status line */}
                                            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                                <svg
                                                    className="h-3.5 w-3.5"
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

                                                {errorText ? (
                                                    <span className="text-red-500">
                                                        Failed to load programs
                                                    </span>
                                                ) : isLoading ? (
                                                    <span>Loading programs…</span>
                                                ) : hasLoadedOnce ? (
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
                                                    <span>Tap to view programs</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* arrow – stays aligned, never overlaps text */}
                                    <ChevronDown
                                        className={`ml-3 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${
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
