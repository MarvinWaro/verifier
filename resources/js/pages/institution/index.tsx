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
    id: number;
    institution_code: string;
    name: string;
    type: string;
    programs_count: number;
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

    // Filter institutions based on search
    const filteredInstitutions = institutions.filter(
        (institution) =>
            institution.name.toLowerCase().includes(search.toLowerCase()) ||
            institution.institution_code.includes(search)
    );

    // Get badge color based on type
    const getTypeColor = (type: string) => {
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
            <Head title="Institutions" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>All Institutions</CardTitle>
                        <CardDescription>
                            Total of {institutions.length} institution{institutions.length !== 1 ? 's' : ''} registered
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
                                        <TableHead className="text-right">Programs</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInstitutions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                {search ? 'No institutions found' : 'No institutions available'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredInstitutions.map((institution) => (
                                            <TableRow key={institution.id} className="cursor-pointer hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {institution.institution_code}
                                                </TableCell>
                                                <TableCell>{institution.name}</TableCell>
                                                <TableCell>
                                                    <Badge className={getTypeColor(institution.type)}>
                                                        {institution.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {institution.programs_count}
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
                                Showing {filteredInstitutions.length} of {institutions.length} institutions
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
