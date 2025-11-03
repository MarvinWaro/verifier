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
            <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-800">
                <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Student Search Results ({students.length} found)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                                        Year Graduated
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((graduate) => (
                                    <tr
                                        key={graduate.id}
                                        className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {graduate.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                                            {graduate.yearGraduated}
                                        </td>

                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    graduate.eligibility ===
                                                    'Eligible'
                                                        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300'
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
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
