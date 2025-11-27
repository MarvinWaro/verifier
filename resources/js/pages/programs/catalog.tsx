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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Search, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProgramCatalogItem {
    id: number;
    program_name: string;
    program_type: 'Board' | 'Non-Board' | 'Unknown';
    notes?: string | null;
}

interface Pagination<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Filters {
    q?: string;
    type?: string;
}

interface Props {
    programs: Pagination<ProgramCatalogItem>;
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Program Catalog', href: '/programs/catalog' },
];

export default function ProgramCatalogIndex({ programs, filters }: Props) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [typeFilter, setTypeFilter] = useState<string>(filters.type ?? '');
    const [items, setItems] = useState<ProgramCatalogItem[]>(programs.data);

    // When Inertia sends new props (pagination / filters), sync local items
    useEffect(() => {
        setItems(programs.data);
    }, [programs.data]);

    const applyFilters = (nextSearch: string, nextType: string) => {
        router.get(
            '/programs/catalog',
            {
                q: nextSearch || undefined,
                type: nextType || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(search, typeFilter);
    };

    const handleTypeFilter = (type: string) => {
        const newType = type === typeFilter ? '' : type;
        setTypeFilter(newType);
        applyFilters(search, newType);
    };

    const getProgramTypeBadgeClasses = (type: string) => {
        switch (type) {
            case 'Board':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
            case 'Non-Board':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
            default:
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
        }
    };

    const handleToggleType = async (
        program: ProgramCatalogItem,
        checked: boolean,
    ) => {
        const previousType = program.program_type;
        const newType: ProgramCatalogItem['program_type'] = checked
            ? 'Board'
            : 'Non-Board';

        // Optimistic update
        setItems((prev) =>
            prev.map((p) =>
                p.id === program.id ? { ...p, program_type: newType } : p,
            ),
        );

        try {
            const tokenElement = document.querySelector(
                'meta[name="csrf-token"]',
            ) as HTMLMetaElement | null;
            const csrfToken = tokenElement?.content;

            const response = await fetch(`/programs/catalog/${program.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ program_type: newType }),
            });

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                console.error('Toggle update failed:', response.status, text);
                throw new Error(`Request failed (${response.status})`);
            }

            // ✅ Success toast
            toast.success('Program type updated', {
                description: `${program.program_name} is now marked as ${newType}.`,
            });
        } catch (error) {
            console.error(error);
            // Revert optimistic update on error
            setItems((prev) =>
                prev.map((p) =>
                    p.id === program.id
                        ? { ...p, program_type: previousType }
                        : p,
                ),
            );
            toast.error('Failed to update program type');
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Program Catalog" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Program Catalog</CardTitle>
                        <CardDescription>
                            Central list of unique programs across all HEIs.
                            Toggle whether each program is classified as Board or
                            Non-Board.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Search + Filters */}
                        <div className="mb-6 space-y-3">
                            {/* Search bar */}
                            <form onSubmit={onSearchSubmit}>
                                <div className="relative w-full">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search program name..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="h-10 w-full pl-10"
                                        aria-label="Search programs in catalog"
                                    />
                                </div>
                            </form>

                            {/* Type filter row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Filter className="h-4 w-4" />
                                    <span>Filter by type:</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={
                                            typeFilter === ''
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => handleTypeFilter('')}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={
                                            typeFilter === 'Board'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handleTypeFilter('Board')
                                        }
                                    >
                                        Board
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={
                                            typeFilter === 'Non-Board'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handleTypeFilter('Non-Board')
                                        }
                                    >
                                        Non-Board
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={
                                            typeFilter === 'Unknown'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handleTypeFilter('Unknown')
                                        }
                                    >
                                        Unknown
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="h-12">
                                            Program Name
                                        </TableHead>
                                        <TableHead className="h-12 w-40">
                                            Type
                                        </TableHead>
                                        <TableHead className="h-12 w-40">
                                            Toggle
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="h-32 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                No programs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((program) => {
                                            const isBoard =
                                                program.program_type ===
                                                'Board';

                                            return (
                                                <TableRow
                                                    key={program.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <TableCell className="py-3 text-sm font-medium">
                                                        {program.program_name}
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <Badge
                                                            className={cn(
                                                                'text-xs',
                                                                getProgramTypeBadgeClasses(
                                                                    program.program_type,
                                                                ),
                                                            )}
                                                        >
                                                            {
                                                                program.program_type
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={
                                                                    isBoard
                                                                }
                                                                onCheckedChange={(
                                                                    checked: boolean,
                                                                ) =>
                                                                    handleToggleType(
                                                                        program,
                                                                        checked,
                                                                    )
                                                                }
                                                                aria-label="Toggle board/non-board"
                                                            />
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                {isBoard
                                                                    ? 'Board'
                                                                    : 'Non-Board'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {programs.links && programs.links.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {programs.links.map((link, idx) => {
                                    const label = link.label
                                        .replace('&laquo;', '«')
                                        .replace('&raquo;', '»');

                                    return (
                                        <Button
                                            key={idx}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (!link.url) return;
                                                router.get(link.url, {}, {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                });
                                            }}
                                        >
                                            {label}
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
