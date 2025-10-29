import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ChevronRight } from 'lucide-react';

interface Institution {
    id: number;
    code: string;
    name: string;
    type: 'public' | 'private';
    programs: Array<{
        id: number;
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
        <div className="mx-auto mt-8 max-w-6xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Search Results
            </h3>
            <div className="grid gap-4">
                {institutions.map((institution) => (
                    <Card
                        key={institution.id}
                        className="cursor-pointer border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
                        onClick={() => onSelectInstitution(institution)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-100 p-3">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-lg font-semibold text-gray-900">
                                            {institution.name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span>Code: {institution.code}</span>
                                            <Badge
                                                variant={
                                                    institution.type === 'public'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {institution.type === 'public'
                                                    ? 'Public'
                                                    : 'Private'}
                                            </Badge>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">
                                            {institution.programs.length} programs
                                            available
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
