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
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface HeiItem {
    instCode: string;
    instName: string;
}

interface Institution {
    institution_code: string;
    name: string;
    type: string | null;
}

interface Program {
    id: number;
    program_name: string;
    major: string | null;
    program_type: string | null;
    permit_number: string | null;
    institution: Institution;
}

interface Props {
    programs: Program[];
    hei: HeiItem[];
    selectedInstCode: string | null;
    error?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Programs', href: '/programs' },
];

export default function ProgramIndex({
    programs,
    hei,
    selectedInstCode,
    error,
}: Props) {
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (error) {
            toast.error('Failed to load programs', { description: error });
        }
    }, [error]);

    const filteredPrograms = useMemo(() => {
        const q = search.toLowerCase();
        return programs.filter(
            (p) =>
                p.program_name.toLowerCase().includes(q) ||
                p.institution.name.toLowerCase().includes(q) ||
                (p.permit_number || '').toLowerCase().includes(q),
        );
    }, [programs, search]);

    const getProgramTypeColor = (type: string | null) => {
        switch (type) {
            case 'Board':
                return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
            case 'Non-Board':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getInstitutionTypeColor = (type: string | null) => {
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
        router.get(
            '/programs',
            { instCode: val },
            { preserveScroll: true, preserveState: true },
        );
    };

    const fmt = (v: string | number | null | undefined) =>
        v === null || v === undefined || String(v).trim() === ''
            ? '-'
            : String(v);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Programs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>All Programs</CardTitle>
                        <CardDescription>
                            {selectedInstCode
                                ? `Showing programs for ${selectedInstCode} — ${filteredPrograms.length} item${
                                      filteredPrograms.length !== 1 ? 's' : ''
                                  }`
                                : `Total of ${filteredPrograms.length} program${
                                      filteredPrograms.length !== 1 ? 's' : ''
                                  }`}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Institution selector + Search */}
                        <div className="mb-4 flex flex-col gap-3 lg:flex-row">
                            {/* Institution Dropdown - BLUE CODE, theme-aware */}
                            <div className="w-full lg:w-2/3">
                                <Select
                                    value={selectedInstCode ?? ''}
                                    onValueChange={onSelectInst}
                                >
                                    <SelectTrigger
                                        aria-label="Choose institution"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Choose an institution…" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-80 max-w-[800px]">
                                        {hei.map((h) => (
                                            <SelectItem
                                                key={h.instCode}
                                                value={h.instCode}
                                                className="py-2.5"
                                            >
                                                <span className="whitespace-nowrap">
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                        {h.instCode}
                                                    </span>
                                                    <span className="text-muted-foreground"> — </span>
                                                    <span>{h.instName}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full lg:w-1/3">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Search by program name, institution, or permit number..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10"
                                    aria-label="Search programs"
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
                                                                    .type ??
                                                                    null,
                                                            )}
                                                            variant="outline"
                                                        >
                                                            {fmt(
                                                                program
                                                                    .institution
                                                                    .type,
                                                            )}
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
                                                    {program.program_type ? (
                                                        <Badge
                                                            className={getProgramTypeColor(
                                                                program.program_type,
                                                            )}
                                                        >
                                                            {
                                                                program.program_type
                                                            }
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-gray-600">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {fmt(program.permit_number)}
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
