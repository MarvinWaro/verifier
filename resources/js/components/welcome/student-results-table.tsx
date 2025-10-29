import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

interface Graduate {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    extensionName: string | null;
    yearGraduated: string;
    studentId: string;
    eligibility: string;
    dateOfBirth: string | null;
    sex: string | null;
    soNumber: string | null;
    lrn: string | null;
    philsysId: string | null;
    program?: {
        id: number;
        name: string;
        major: string | null;
        copNumber: string | null;
        grNumber: string | null;
    };
    institution?: {
        code: string;
        name: string;
        type: string;
    };
}

interface StudentResultsTableProps {
    students: Graduate[];
    onViewDetails: (graduate: Graduate) => void;
}

export default function StudentResultsTable({
    students,
    onViewDetails,
}: StudentResultsTableProps) {
    return (
        <div className="mx-auto mt-8 max-w-6xl">
            <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Student Search Results ({students.length} found)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                        Student ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                        Year Graduated
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((graduate) => (
                                    <tr
                                        key={graduate.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="font-medium">
                                                    {graduate.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 font-mono text-sm">
                                            {graduate.studentId}
                                        </td>

                                        <td className="px-4 py-3">
                                            {graduate.yearGraduated}
                                        </td>

                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    graduate.eligibility ===
                                                    'Eligible'
                                                        ? 'border-green-200 bg-green-50 text-green-700'
                                                        : 'border-red-200 bg-red-50 text-red-700'
                                                }
                                            >
                                                {graduate.eligibility}
                                            </Badge>
                                        </td>

                                        <td className="px-4 py-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    onViewDetails(graduate)
                                                }
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
