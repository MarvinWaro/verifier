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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, GraduationCap, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

interface Program {
    id: number;
    program_name: string;
    major: string | null;
    program_type: string | null;
    permit_number: string;
}

interface Institution {
    id: number;
    institution_code: string;
    name: string;
    type: string;
    programs_count: number;
    programs: Program[];
}

interface Props {
    institutions: Institution[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Institutions',
        href: '/institutions',
    },
];

export default function InstitutionIndex({ institutions }: Props) {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Filter institutions based on search
    const filteredInstitutions = institutions.filter(
        (institution) =>
            institution.name.toLowerCase().includes(search.toLowerCase()) ||
            institution.institution_code.includes(search)
    );

    // Get badge color based on type
    const getTypeColor = (type: string) => {
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

    // Get badge color for program type
    const getProgramTypeColor = (type: string | null) => {
        if (type === 'Board') {
            return 'bg-green-100 text-green-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Institutions" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>All Institutions</CardTitle>
                        <CardDescription>
                            Total of {institutions.length} institution
                            {institutions.length !== 1 ? 's' : ''} registered
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Search by institution code or name..."
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
                                        <TableHead>Institution Code</TableHead>
                                        <TableHead>Institution Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">
                                            Programs
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInstitutions.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                {search
                                                    ? 'No institutions found'
                                                    : 'No institutions available'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredInstitutions.map((institution) => (
                                            <React.Fragment key={institution.id}>
                                                <TableRow
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() =>
                                                        toggleExpand(institution.id)
                                                    }
                                                >
                                                    <TableCell className="font-medium">
                                                        {institution.institution_code}
                                                    </TableCell>
                                                    <TableCell>
                                                        {institution.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={getTypeColor(
                                                                institution.type
                                                            )}
                                                        >
                                                            {institution.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span>
                                                                {
                                                                    institution.programs_count
                                                                }
                                                            </span>
                                                            <ChevronDown
                                                                className={`h-4 w-4 transition-transform ${
                                                                    expandedId ===
                                                                    institution.id
                                                                        ? 'rotate-180'
                                                                        : ''
                                                                }`}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                {expandedId === institution.id && (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={4}
                                                            className="bg-gray-50 p-0"
                                                        >
                                                            <div className="p-6">
                                                                {institution.programs
                                                                    .length === 0 ? (
                                                                    <p className="text-sm text-gray-500">
                                                                        No programs
                                                                        available
                                                                    </p>
                                                                ) : (
                                                                    <>
                                                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                            <GraduationCap className="h-4 w-4" />
                                                                            Programs
                                                                            Offered
                                                                        </h4>
                                                                        <div className="space-y-2">
                                                                            {institution.programs.map(
                                                                                (
                                                                                    program
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            program.id
                                                                                        }
                                                                                        className="bg-white rounded-md p-3 shadow-sm border"
                                                                                    >
                                                                                        <div className="flex items-start justify-between">
                                                                                            <div className="flex-1">
                                                                                                <p className="font-medium text-sm">
                                                                                                    {
                                                                                                        program.program_name
                                                                                                    }
                                                                                                </p>
                                                                                                {program.major && (
                                                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                                                        Major:{' '}
                                                                                                        {
                                                                                                            program.major
                                                                                                        }
                                                                                                    </p>
                                                                                                )}
                                                                                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                                                                                    Permit:{' '}
                                                                                                    {
                                                                                                        program.permit_number
                                                                                                    }
                                                                                                </p>
                                                                                            </div>
                                                                                            <div>
                                                                                                {program.program_type && (
                                                                                                    <Badge
                                                                                                        className={getProgramTypeColor(
                                                                                                            program.program_type
                                                                                                        )}
                                                                                                    >
                                                                                                        {
                                                                                                            program.program_type
                                                                                                        }
                                                                                                    </Badge>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Results count */}
                        {search && (
                            <p className="text-sm text-gray-600 mt-4">
                                Showing {filteredInstitutions.length} of{' '}
                                {institutions.length} institutions
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
