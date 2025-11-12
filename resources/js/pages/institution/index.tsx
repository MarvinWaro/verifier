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
import { ChevronDown, GraduationCap, Search } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

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

    ownership_sector: string | null; // "PUBLIC" | "PRIVATE"
    ownership_type: string | null; // "SUC" | "LUC" | etc.
    x_coordinate: string | null; // latitude
    y_coordinate: string | null; // longitude

    programs: Program[]; // not preloaded
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

    // cache loaded program lists & loading/error flags per instCode
    const [loadedPrograms, setLoadedPrograms] = useState<
        Record<string, Program[]>
    >({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [loadError, setLoadError] = useState<Record<string, string | null>>(
        {},
    );

    // one controller per instCode to avoid overlapping requests
    const controllersRef = useRef<Record<string, AbortController>>({});

    useEffect(() => {
        if (error) {
            toast.error('Failed to load institutions', { description: error });
        }
    }, [error]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return institutions.filter(
            (i) =>
                i.name.toLowerCase().includes(q) ||
                i.institution_code.includes(search),
        );
    }, [institutions, search]);

    const getProgramTypeColor = (type: string | null) =>
        type === 'Board'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800';

    const fmt = (v: string | number | null | undefined) =>
        v === null || v === undefined || String(v).trim() === ''
            ? '-'
            : String(v);

    async function loadPrograms(instCode: string) {
        if (loadedPrograms[instCode] || loading[instCode]) return;

        // abort any in-flight for this inst
        if (controllersRef.current[instCode]) {
            try {
                controllersRef.current[instCode].abort();
            } catch {}
        }

        const controller = new AbortController();
        controllersRef.current[instCode] = controller;
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

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

                        {error ? (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        ) : null}
                    </CardHeader>

                    <CardContent>
                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
                                        <TableHead>Ownership Sector</TableHead>
                                        <TableHead>Ownership Type</TableHead>
                                        <TableHead>X</TableHead>
                                        <TableHead>Y</TableHead>
                                        <TableHead className="w-12 text-right">
                                            {/* chevron only */}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="py-8 text-center text-gray-500"
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

                                            return (
                                                <React.Fragment key={row.id}>
                                                    <TableRow
                                                        className="cursor-pointer hover:bg-gray-50"
                                                        onClick={() =>
                                                            onRowToggle(row)
                                                        }
                                                    >
                                                        <TableCell className="font-medium">
                                                            {
                                                                row.institution_code
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {row.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {fmt(
                                                                row.ownership_sector,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {fmt(
                                                                row.ownership_type,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm">
                                                            {fmt(
                                                                row.x_coordinate,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm">
                                                            {fmt(
                                                                row.y_coordinate,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <ChevronDown
                                                                className={`mx-auto h-4 w-4 transition-transform ${
                                                                    expandedId ===
                                                                    row.id
                                                                        ? 'rotate-180'
                                                                        : ''
                                                                }`}
                                                            />
                                                        </TableCell>
                                                    </TableRow>

                                                    {expandedId === row.id && (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={7}
                                                                className="bg-gray-50 p-0"
                                                            >
                                                                <div className="p-6">
                                                                    {isLoading ? (
                                                                        <p className="text-sm text-gray-500">
                                                                            Loading
                                                                            programs…
                                                                        </p>
                                                                    ) : errText ? (
                                                                        <p className="text-sm text-red-600">
                                                                            {
                                                                                errText
                                                                            }
                                                                        </p>
                                                                    ) : !progs ||
                                                                      progs.length ===
                                                                          0 ? (
                                                                        <p className="text-sm text-gray-500">
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
                                                                                            className="rounded-md border bg-white p-3 shadow-sm"
                                                                                        >
                                                                                            <div className="flex items-start justify-between">
                                                                                                <div className="flex-1">
                                                                                                    <p className="text-sm font-medium">
                                                                                                        {
                                                                                                            program.program_name
                                                                                                        }
                                                                                                    </p>
                                                                                                    {program.major && (
                                                                                                        <p className="mt-1 text-xs text-gray-600">
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

                        {/* results note */}
                        {search && (
                            <p className="mt-4 text-sm text-gray-600">
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
