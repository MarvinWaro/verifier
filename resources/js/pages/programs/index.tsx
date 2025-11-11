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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface HeiItem {
    instCode: string;
    instName: string;
}

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
    hei: HeiItem[];
    selectedInstCode: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Programs', href: '/programs' },
];

export default function ProgramIndex({
    programs,
    hei,
    selectedInstCode,
}: Props) {
    const [search, setSearch] = useState('');

    const filteredPrograms = useMemo(() => {
        const q = search.toLowerCase();
        return programs.filter(
            (p) =>
                p.program_name.toLowerCase().includes(q) ||
                p.institution.name.toLowerCase().includes(q) ||
                (p.permit_number || '').toLowerCase().includes(q),
        );
    }, [programs, search]);

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

    const onSelectInst = (val: string) => {
        // No Ziggy; use a plain path
        router.get(
            '/programs',
            { instCode: val },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Programs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>All Programs</CardTitle>
                        <CardDescription>
                            {selectedInstCode
                                ? `Showing programs for ${selectedInstCode} — ${filteredPrograms.length} item${filteredPrograms.length !== 1 ? 's' : ''}`
                                : `Total of ${filteredPrograms.length} program${filteredPrograms.length !== 1 ? 's' : ''}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Institution selector + Search */}
                        <div className="mb-4 flex flex-col gap-3 md:flex-row">
                            <div className="w-full md:w-96">
                                <Select
                                    value={selectedInstCode ?? ''}
                                    onValueChange={onSelectInst}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an institution…" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-80">
                                        {hei.map((h) => (
                                            <SelectItem
                                                key={h.instCode}
                                                value={h.instCode}
                                            >
                                                {h.instCode} — {h.instName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="relative md:flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Institution Code</TableHead>
                                        <TableHead>Program Name</TableHead>
                                        <TableHead>Major</TableHead>
                                        <TableHead>Program Type</TableHead>
                                        <TableHead>Permit Number</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPrograms.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-8 text-center text-gray-500"
                                            >
                                                No programs available
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPrograms.map((program) => (
                                            <TableRow
                                                key={program.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium">
                                                            {
                                                                program
                                                                    .institution
                                                                    .name
                                                            }
                                                        </span>
                                                        <Badge
                                                            className={getInstitutionTypeColor(
                                                                program
                                                                    .institution
                                                                    .type,
                                                            )}
                                                            variant="outline"
                                                        >
                                                            {
                                                                program
                                                                    .institution
                                                                    .type
                                                            }
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-gray-600">
                                                    {
                                                        program.institution
                                                            .institution_code
                                                    }
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {program.program_name}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {program.major || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getProgramTypeColor(
                                                            program.program_type,
                                                        )}
                                                    >
                                                        {program.program_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {program.permit_number ||
                                                        '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
