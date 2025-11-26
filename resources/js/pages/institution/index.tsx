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
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronDown, GraduationCap, Search } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Program {
    id: number;
    program_name: string;
    major: string | null;
    program_type: string | null;
    permit_number: string | null;
}

interface Institution {
    id: number;
    institution_code: string;
    name: string;
    ownership_sector: string | null;
    ownership_type: string | null;
    x_coordinate: string | null;
    y_coordinate: string | null;
    programs: Program[];
}

interface Props {
    institutions: Institution[];
    error?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Institutions', href: '/institutions' },
];

export default function InstitutionIndex({ institutions, error }: Props) {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [loadedPrograms, setLoadedPrograms] = useState<
        Record<string, Program[]>
    >({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [loadError, setLoadError] = useState<Record<string, string | null>>(
        {},
    );

    const controllersRef = useRef<Record<string, AbortController>>({});

    useEffect(() => {
        if (error) {
            toast.error('Failed to load institutions', { description: error });
        }
    }, [error]);

    useEffect(() => {
        return () => {
            Object.values(controllersRef.current).forEach((controller) => {
                try {
                    controller.abort();
                } catch {
                    // ignore
                }
            });
        };
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return institutions.filter(
            (i) =>
                i.name.toLowerCase().includes(q) ||
                i.institution_code.toLowerCase().includes(q),
        );
    }, [institutions, search]);

    const getProgramTypeColor = (type: string | null) => {
        switch (type) {
            case 'Board':
                return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300';
            case 'Non-Board':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const getOwnershipSectorBadge = (sector: string | null) => {
        if (!sector) return null;
        const colors =
            sector === 'PUBLIC'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        return (
            <Badge className={colors} variant="outline">
                {sector}
            </Badge>
        );
    };

    const getOwnershipTypeBadge = (type: string | null) => {
        if (!type) return null;
        const colors =
            type === 'SUC'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                : type === 'LUC'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        return (
            <Badge className={colors} variant="outline">
                {type}
            </Badge>
        );
    };

    const fmt = (v: string | number | null | undefined) =>
        v === null || v === undefined || String(v).trim() === ''
            ? '-'
            : String(v);

    async function loadPrograms(instCode: string) {
        if (loadedPrograms[instCode] || loading[instCode]) return;

        if (controllersRef.current[instCode]) {
            try {
                controllersRef.current[instCode].abort();
            } catch {
                // ignore
            }
        }

        const controller = new AbortController();
        controllersRef.current[instCode] = controller;
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            setLoading((s) => ({ ...s, [instCode]: true }));
            setLoadError((s) => ({ ...s, [instCode]: null }));

            const res = await fetch(
                `/institutions/${encodeURIComponent(instCode)}/programs`,
                {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                },
            );

            clearTimeout(timeoutId);

            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(text || `Request failed (${res.status})`);
            }

            const json = await res.json().catch(() => ({ data: [] }));
            const items: Program[] = json?.data ?? [];
            setLoadedPrograms((s) => ({ ...s, [instCode]: items }));
        } catch (e: any) {
            clearTimeout(timeoutId);
            if (e?.name === 'AbortError') return;
            console.error(e);
            setLoadError((s) => ({
                ...s,
                [instCode]: 'Unable to load programs.',
            }));
            setLoadedPrograms((s) => ({ ...s, [instCode]: [] }));
            toast.error('Unable to load programs', {
                description: 'Please try again.',
            });
        } finally {
            setLoading((s) => ({ ...s, [instCode]: false }));
        }
    }

    const onRowToggle = (row: Institution) => {
        const newId = expandedId === row.id ? null : row.id;
        setExpandedId(newId);
        if (newId === row.id) {
            void loadPrograms(row.institution_code);
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
                            Total of {institutions.length} institution
                            {institutions.length !== 1 ? 's' : ''} registered
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by institution code or name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-10 pl-10"
                                    aria-label="Search institutions"
                                />
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="h-12">
                                            Institution Code
                                        </TableHead>
                                        <TableHead className="h-12">
                                            Institution Name
                                        </TableHead>
                                        <TableHead className="h-12">
                                            Ownership
                                        </TableHead>
                                        <TableHead className="h-12">
                                            Coordinates
                                        </TableHead>
                                        <TableHead className="h-12 w-12 text-right"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-32 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                {search
                                                    ? 'No institutions found'
                                                    : 'No institutions available'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((row) => {
                                            const instCode =
                                                row.institution_code;
                                            const progs =
                                                loadedPrograms[instCode];
                                            const isLoading =
                                                loading[instCode] === true;
                                            const errText =
                                                loadError[instCode] || null;
                                            const isExpanded =
                                                expandedId === row.id;

                                            return (
                                                <React.Fragment key={row.id}>
                                                    <TableRow
                                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                        onClick={() =>
                                                            onRowToggle(row)
                                                        }
                                                    >
                                                        <TableCell className="py-4 font-mono font-medium text-blue-600 dark:text-blue-400">
                                                            {
                                                                row.institution_code
                                                            }
                                                        </TableCell>
                                                        <TableCell className="py-4 font-medium">
                                                            {row.name}
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {getOwnershipSectorBadge(
                                                                    row.ownership_sector,
                                                                )}
                                                                {getOwnershipTypeBadge(
                                                                    row.ownership_type,
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                                                            {row.x_coordinate &&
                                                            row.y_coordinate
                                                                ? `${parseFloat(row.x_coordinate).toFixed(2)}, ${parseFloat(row.y_coordinate).toFixed(2)}`
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    onRowToggle(
                                                                        row,
                                                                    );
                                                                }}
                                                                aria-label={
                                                                    isExpanded
                                                                        ? 'Collapse programs list'
                                                                        : 'Expand programs list'
                                                                }
                                                                aria-expanded={
                                                                    isExpanded
                                                                }
                                                                className="inline-flex items-center justify-center rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                <ChevronDown
                                                                    className={`h-4 w-4 transition-transform ${
                                                                        isExpanded
                                                                            ? 'rotate-180'
                                                                            : ''
                                                                    }`}
                                                                />
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>

                                                    {isExpanded && (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={5}
                                                                className="bg-gray-50 p-0 dark:bg-gray-900"
                                                            >
                                                                <div className="p-6">
                                                                    {isLoading ? (
                                                                        <div
                                                                            className="space-y-4"
                                                                            aria-busy="true"
                                                                            aria-label="Loading programs"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <Skeleton className="h-4 w-4 rounded-full" />
                                                                                <Skeleton className="h-4 w-40" />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                {Array.from(
                                                                                    {
                                                                                        length: 3,
                                                                                    },
                                                                                ).map(
                                                                                    (
                                                                                        _,
                                                                                        i,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                i
                                                                                            }
                                                                                            className="rounded-md border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                                                                        >
                                                                                            <div className="flex items-start justify-between gap-3">
                                                                                                <div className="flex-1 space-y-2">
                                                                                                    <Skeleton className="h-4 w-56" />
                                                                                                    <Skeleton className="h-3 w-40" />
                                                                                                    <Skeleton className="h-3 w-32" />
                                                                                                </div>
                                                                                                <Skeleton className="h-6 w-20 rounded-full" />
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ) : errText ? (
                                                                        <p className="text-sm text-red-600 dark:text-red-400">
                                                                            {
                                                                                errText
                                                                            }
                                                                        </p>
                                                                    ) : !progs ||
                                                                      progs.length ===
                                                                          0 ? (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            No
                                                                            programs
                                                                            available
                                                                        </p>
                                                                    ) : (
                                                                        <>
                                                                            <h4 className="mb-3 flex items-center gap-2 font-semibold">
                                                                                <GraduationCap className="h-4 w-4" />
                                                                                Programs
                                                                                Offered
                                                                            </h4>
                                                                            <div className="space-y-2">
                                                                                {progs.map(
                                                                                    (
                                                                                        program,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                program.id
                                                                                            }
                                                                                            className="rounded-md border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                                                                        >
                                                                                            <div className="flex items-start justify-between">
                                                                                                <div className="flex-1">
                                                                                                    <p className="text-sm font-medium">
                                                                                                        {
                                                                                                            program.program_name
                                                                                                        }
                                                                                                    </p>
                                                                                                    {program.major && (
                                                                                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                                                                            Major:{' '}
                                                                                                            {
                                                                                                                program.major
                                                                                                            }
                                                                                                        </p>
                                                                                                    )}
                                                                                                    <p className="mt-1 font-mono text-xs text-gray-500">
                                                                                                        Permit:{' '}
                                                                                                        {fmt(
                                                                                                            program.permit_number,
                                                                                                        )}
                                                                                                    </p>
                                                                                                </div>
                                                                                                <div>
                                                                                                    {program.program_type && (
                                                                                                        <Badge
                                                                                                            className={getProgramTypeColor(
                                                                                                                program.program_type,
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
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {search && (
                            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Showing {filtered.length} of{' '}
                                {institutions.length} institutions
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
