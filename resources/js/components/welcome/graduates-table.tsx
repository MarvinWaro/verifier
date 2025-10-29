import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle2, User } from 'lucide-react';

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

interface GraduatesTableProps {
    graduates: Graduate[];
    onViewDetails: (graduate: Graduate) => void;
}

export default function GraduatesTable({
    graduates,
    onViewDetails,
}: GraduatesTableProps) {
    return (
        <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Registered Graduates ({graduates.length})
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b bg-gray-50/50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                    Graduate Name
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                    Student ID
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                    Year Graduated
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                    Board Exam Status
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {graduates.map((graduate) => (
                                <tr
                                    key={graduate.id}
                                    className="border-b transition-colors hover:bg-gray-50/50"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {graduate.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span className="font-mono text-sm text-gray-600">
                                            {graduate.studentId}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-700">
                                                {graduate.yearGraduated}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <Badge
                                            className={
                                                graduate.eligibility ===
                                                'Eligible'
                                                    ? 'border-0 bg-green-100 text-green-800'
                                                    : 'border-0 bg-red-100 text-red-800'
                                            }
                                        >
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            {graduate.eligibility}
                                        </Badge>
                                    </td>

                                    <td className="px-4 py-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                onViewDetails(graduate)
                                            }
                                            className="text-blue-600 hover:text-blue-800"
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
    );
}
