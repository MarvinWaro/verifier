import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface Institution {
    institution_code: string;
    name: string;
    type: string;
}

interface Program {
    program_name: string;
    major: string | null;
    program_type: string;
    permit_number: string;
    institution: Institution;
}

interface Graduate {
    id: number;
    student_id_number: string | null;
    date_of_birth: string | null;
    last_name: string;
    first_name: string;
    middle_name: string | null;
    extension_name: string | null;
    sex: string | null;
    year_graduated: string;
    academic_year: string | null;
    hei_uii: string | null;
    program: Program;
    so_number: string | null;
}

interface Props {
    graduates: Graduate[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Graduates',
        href: '/graduates',
    },
];

export default function GraduateIndex({ graduates }: Props) {
    const [search, setSearch] = useState('');

    // Filter graduates based on search
    const filteredGraduates = graduates.filter((graduate) => {
        const term = search.toLowerCase();

        return (
            graduate.last_name?.toLowerCase().includes(term) ||
            graduate.first_name?.toLowerCase().includes(term) ||
            graduate.middle_name?.toLowerCase().includes(term) ||
            graduate.program.program_name.toLowerCase().includes(term) ||
            graduate.program.institution.name.toLowerCase().includes(term) ||
            graduate.program.institution.institution_code
                .toLowerCase()
                .includes(term) ||
            graduate.year_graduated.includes(search) ||
            (graduate.academic_year ?? '').includes(search) ||
            graduate.so_number?.toLowerCase().includes(term)
        );
    });

    // Get badge color based on program type
    const getProgramTypeColor = (type: string) => {
        switch (type) {
            case 'Board':
                return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
            case 'Non-Board':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    // Get badge color based on institution type
    const getInstitutionTypeColor = (type: string) => {
        switch (type) {
            case 'Private':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'SUCs':
                return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'LUCs':
                return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    // Get badge color based on sex
    const getSexColor = (sex: string | null) => {
        switch (sex?.toUpperCase()) {
            case 'MALE':
                return 'bg-blue-50 text-blue-700 hover:bg-blue-50';
            case 'FEMALE':
                return 'bg-pink-50 text-pink-700 hover:bg-pink-50';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Graduates" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>All Graduates</CardTitle>
                        <CardDescription>
                            Total of {graduates.length} graduate
                            {graduates.length !== 1 ? 's' : ''} registered
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, SO number, program, institution, or year..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SO Number</TableHead>
                                        <TableHead>Last Name</TableHead>
                                        <TableHead>First Name</TableHead>
                                        <TableHead>Middle Name</TableHead>
                                        <TableHead>Ext</TableHead>
                                        <TableHead>Sex</TableHead>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Institution Code</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Major</TableHead>
                                        <TableHead>Program Type</TableHead>
                                        <TableHead>Date Graduated</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGraduates.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={13}
                                                className="py-8 text-center text-gray-500"
                                            >
                                                {search
                                                    ? 'No graduates found'
                                                    : 'No graduates available'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredGraduates.map((graduate) => (
                                            <TableRow
                                                key={graduate.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell className="text-sm">
                                                    {graduate.so_number ? (
                                                        <span className="font-medium text-blue-600">
                                                            {graduate.so_number}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {graduate.last_name}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {graduate.first_name}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {graduate.middle_name}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {graduate.extension_name ||
                                                        '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {graduate.sex ? (
                                                        <Badge
                                                            variant="outline"
                                                            className={getSexColor(
                                                                graduate.sex,
                                                            )}
                                                        >
                                                            {graduate.sex}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {
                                                        graduate.program
                                                            .institution.name
                                                    }
                                                </TableCell>

                                                <TableCell className="font-mono text-sm text-gray-600">
                                                    {
                                                        graduate.program
                                                            .institution
                                                            .institution_code
                                                    }
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {
                                                        graduate.program
                                                            .program_name
                                                    }
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {graduate.program.major ||
                                                        '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getProgramTypeColor(
                                                            graduate.program
                                                                .program_type,
                                                        )}
                                                    >
                                                        {
                                                            graduate.program
                                                                .program_type
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-orange-50 text-orange-800 hover:bg-orange-50"
                                                    >
                                                        {
                                                            graduate.year_graduated
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {graduate.academic_year ||
                                                        '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Results count */}
                        {search && (
                            <p className="mt-4 text-sm text-gray-600">
                                Showing {filteredGraduates.length} of{' '}
                                {graduates.length} graduates
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
