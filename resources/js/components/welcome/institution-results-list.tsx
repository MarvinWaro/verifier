import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ChevronRight } from 'lucide-react';

interface Institution {
    id: number | null; // may be fallback index from backend
    code: string;
    name: string;
    type: 'public' | 'private';
    programs: Array<{
        id: number | null;           // allow null for portal-only programs
        name: string;
        major: string | null;
        copNumber: string | null;
        grNumber: string | null;
        graduates_count?: number;
    }>;
}

interface InstitutionResultsListProps {
    institutions: Institution[];
    onSelectInstitution: (institution: Institution) => void;
}

export default function InstitutionResultsList({
    institutions,
    onSelectInstitution,
}: InstitutionResultsListProps) {
    return (
        <div className="mx-auto mt-6 max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Search Results
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {institutions.length}{' '}
                    {institutions.length === 1 ? 'institution' : 'institutions'} found
                </span>
            </div>
            <div className="grid gap-4">
                {institutions.map((institution) => (
                    <Card
                        // use instCode – unique and stable, fixes duplicate key `5`
                        key={institution.code}
                        className="group cursor-pointer border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.01] hover:shadow-xl dark:bg-gray-800/90"
                        onClick={() => onSelectInstitution(institution)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
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
                                                <span className="font-medium">
                                                    {institution.programs.length}
                                                </span>
                                                <span>
                                                    program
                                                    {institution.programs.length !== 1
                                                        ? 's'
                                                        : ''}{' '}
                                                    available
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
