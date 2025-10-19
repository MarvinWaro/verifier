import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface Institution {
    institution_code: string;
    name: string;
    type: string;
}

interface Program {
    id: number;
    program_name: string;
    major: string | null;
    program_type: string;
    permit_number: string;
    institution: Institution;
}

interface Props {
    programs: Program[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Programs',
        href: '/programs',
    },
];

export default function ProgramIndex({ programs }: Props) {
    const [search, setSearch] = useState('');

    // Filter programs based on search
    const filteredPrograms = programs.filter(
        (program) =>
            program.program_name.toLowerCase().includes(search.toLowerCase()) ||
            program.institution.name.toLowerCase().includes(search.toLowerCase()) ||
            program.permit_number.toLowerCase().includes(search.toLowerCase())
    );

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
            case 'Public':
                return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'Private':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'LUCs':
                return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Programs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>All Programs</CardTitle>
                        <CardDescription>
                            Total of {programs.length} program{programs.length !== 1 ? 's' : ''} registered
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Search by program name, institution, or permit number..."
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
                                        <TableHead>Program Name</TableHead>
                                        <TableHead>Major</TableHead>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>HEI Code</TableHead>
                                        <TableHead>Permit Number</TableHead>
                                        <TableHead>Program Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPrograms.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                {search ? 'No programs found' : 'No programs available'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPrograms.map((program) => (
                                            <TableRow key={program.id} className="cursor-pointer hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {program.program_name}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {program.major || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm">{program.institution.name}</span>
                                                        <Badge className={getInstitutionTypeColor(program.institution.type)} variant="outline">
                                                            {program.institution.type}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-gray-600">
                                                        {program.institution.institution_code}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {program.permit_number}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getProgramTypeColor(program.program_type)}>
                                                        {program.program_type}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Results count */}
                        {search && (
                            <p className="text-sm text-gray-600 mt-4">
                                Showing {filteredPrograms.length} of {programs.length} programs
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
