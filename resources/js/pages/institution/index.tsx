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
import React, { useMemo, useRef, useState } from 'react';

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

    ownership_sector: string | null;
    ownership_type: string | null;
    x_coordinate: string | null;
    y_coordinate: string | null;

    // programs are NOT preloaded (lazy)
    programs: Program[];
}

interface Props {
    institutions: Institution[];
    // optional error from server (shown as a banner if present)
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Institutions', href: '/institutions' },
];

export default function InstitutionIndex({ institutions, error }: Props) {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // cache of loaded programs per instCode
    const [loadedPrograms, setLoadedPrograms] = useState<
        Record<string, Program[]>
    >({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [loadError, setLoadError] = useState<Record<string, string | null>>(
        {},
    );

    // track active requests so we can abort on collapse / navigation
    const controllersRef = useRef<Record<string, AbortController>>({});

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
        // already loaded or actively loading => skip
        if (loadedPrograms[instCode] || loading[instCode]) return;

        // make sure any previous controller is cleared
        if (controllersRef.current[instCode]) {
            try {
                controllersRef.current[instCode].abort();
            } catch {}
        }

        const controller = new AbortController();
        controllersRef.current[instCode] = controller;

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

            if (!res.ok) {
                // backend may return JSON with message
                let message = `Request failed (${res.status})`;
                try {
                    const j = await res.json();
                    if (j?.message) message = j.message;
                } catch {}
                throw new Error(message);
            }

            const json = await res.json();
            const items: Program[] = json?.data ?? [];
            setLoadedPrograms((s) => ({ ...s, [instCode]: items }));
        } catch (err: any) {
            // ignore abort noise
            if (err?.name === 'AbortError') return;
            console.error(err);
            setLoadError((s) => ({
                ...s,
                [instCode]: err?.message || 'Failed to load programs.',
            }));
            setLoadedPrograms((s) => ({ ...s, [instCode]: [] }));
        } finally {
            setLoading((s) => ({ ...s, [instCode]: false }));
            // cleanup controller for this instCode
            delete controllersRef.current[instCode];
        }
    }

    const onRowToggle = (row: Institution) => {
        const opening = expandedId !== row.id;
        const newId = opening ? row.id : null;

        // if closing, abort any in-flight request for this instCode
        if (!opening) {
            const c = controllersRef.current[row.institution_code];
            if (c) {
                try {
                    c.abort();
                } catch {}
                delete controllersRef.current[row.institution_code];
            }
        }

        setExpandedId(newId);

        if (opening) {
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

                        {error && (
                            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}
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
                                            {/* arrow only (no count) */}
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
                                            const progs =
                                                loadedPrograms[
                                                    row.institution_code
                                                ];
                                            const isLoading =
                                                loading[
                                                    row.institution_code
                                                ] === true;
                                            const errMsg =
                                                loadError[row.institution_code];

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
                                                                    ) : errMsg ? (
                                                                        <p className="text-sm text-red-600">
                                                                            {
                                                                                errMsg
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
