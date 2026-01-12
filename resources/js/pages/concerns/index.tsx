import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
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
import { Button } from '@/components/ui/button';
import { Search, School, BookOpen, Calendar, MessageSquareWarning, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// --- Interfaces ---

interface Concern {
    id: number;
    school: string;
    program: string;
    concern: string;
    created_at: string;
}

interface Pagination<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    total?: number;
}

interface Filters {
    q?: string | null;
}

interface Props {
    concerns: Pagination<Concern>;
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Concerns',
        href: '/concerns',
    },
];

export default function ConcernsIndex({ concerns, filters }: Props) {
    const [items, setItems] = useState<Concern[]>(concerns.data);
    const [total, setTotal] = useState<number>(
        concerns.total ?? concerns.data.length,
    );
    const [search, setSearch] = useState(filters.q ?? '');

    // Sync local items when Inertia sends new page
    useEffect(() => {
        setItems(concerns.data);
        setTotal(concerns.total ?? concerns.data.length);
    }, [concerns.data, concerns.total]);

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/concerns',
            { q: search || undefined },
            { preserveScroll: true, preserveState: true },
        );
    };

    const clearSearch = () => {
        setSearch('');
        router.get(
            '/concerns',
            { q: undefined },
            { preserveScroll: true, preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Concerns & Issues" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquareWarning className="h-5 w-5 text-amber-600" />
                            Concerns & Issues
                        </CardTitle>
                        <CardDescription>
                            {filters.q ? (
                                <>
                                    Showing {items.length} of {total} report
                                    {total !== 1 ? 's' : ''} matching "
                                    {filters.q}"
                                </>
                            ) : (
                                <>
                                    Total of {total} report
                                    {total !== 1 ? 's' : ''} submitted
                                </>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search Bar */}
                        <form onSubmit={onSearchSubmit} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Search by school, program, or concern details..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-10"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Table */}
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[200px]">School / HEI</TableHead>
                                        <TableHead className="min-w-[200px]">Program</TableHead>
                                        <TableHead className="min-w-[400px]">Concern Details</TableHead>
                                        <TableHead className="w-[200px]">Date Submitted</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                {filters.q
                                                    ? 'No concerns found for your search.'
                                                    : 'No concerns logged yet.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-gray-50 align-top">
                                                <TableCell className="text-sm font-medium">
                                                    <div className="flex items-start gap-2">
                                                        <School className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                                                        {item.school}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <BookOpen className="h-4 w-4 mt-0.5 text-purple-600 shrink-0" />
                                                        {item.program}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-700">
                                                    <p className="whitespace-pre-wrap leading-relaxed">
                                                        {item.concern}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {item.created_at}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {concerns.links && concerns.links.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {concerns.links.map((link, idx) => {
                                    const label = link.label
                                        .replace('&laquo;', '«')
                                        .replace('&raquo;', '»');

                                    return (
                                        <Button
                                            key={idx}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => {
                                                if (!link.url) return;
                                                router.get(
                                                    link.url,
                                                    { q: search || undefined },
                                                    { preserveScroll: true, preserveState: true }
                                                );
                                            }}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: label }} />
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
