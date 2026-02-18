import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, ChevronsUpDown, Search, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

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
    program_status: string; // ✅ Added
    permit_number: string | null;
    permit_pdf_url: string | null;
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
    const { auth } = usePage<SharedData>().props;
    const canClearCache = auth.user.permissions.includes('manage_roles');

    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [clearingCache, setClearingCache] = useState(false);

    const handleClearCache = async () => {
        setClearingCache(true);
        try {
            const res = await fetch('/artisan/optimize-clear');
            if (res.ok) {
                toast.success('Cache cleared', {
                    description: 'All application caches have been cleared successfully.',
                });
            } else {
                toast.error('Failed to clear cache', {
                    description: 'Something went wrong. Please try again.',
                });
            }
        } catch {
            toast.error('Failed to clear cache', {
                description: 'Network error. Please check your connection.',
            });
        } finally {
            setClearingCache(false);
        }
    };

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
                return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300';
            case 'Non-Board':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
            case 'Unknown':
            default:
                return 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300';
        }
    };

    // ✅ Added: Program Status Badge Color
    const getProgramStatusColor = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        switch (normalizedStatus) {
            case 'active':
                return 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300';
            case 'inactive':
            case 'closed':
                return 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300';
            case 'suspended':
                return 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const onSelectInst = (val: string) => {
        setOpen(false);
        router.get(
            '/programs',
            { instCode: val },
            { preserveScroll: true, preserveState: true },
        );
    };

    const selectedInstitution = hei.find((h) => h.instCode === selectedInstCode);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Programs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
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
                        </div>
                        {canClearCache && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearCache}
                                disabled={clearingCache}
                                className="shrink-0 gap-2"
                            >
                                <RefreshCw className={cn('h-4 w-4', clearingCache && 'animate-spin')} />
                                {clearingCache ? 'Clearing Cache…' : 'Clear Cache'}
                            </Button>
                        )}
                    </CardHeader>

                    <CardContent>
                        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
                            {/* Institution Selector */}
                            <div className="w-full lg:w-2/3">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            aria-label="Choose institution"
                                            className="h-10 w-full justify-between"
                                        >
                                            <span className="truncate text-left">
                                                {selectedInstitution ? (
                                                    <>
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                            {selectedInstitution.instCode}
                                                        </span>
                                                        <span className="text-muted-foreground"> — </span>
                                                        <span>{selectedInstitution.instName}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Choose an institution…
                                                    </span>
                                                )}
                                            </span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[650px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search institutions..." className="h-10" />
                                            <CommandList>
                                                <CommandEmpty>No institution found.</CommandEmpty>
                                                <CommandGroup>
                                                    {hei.map((h) => (
                                                        <CommandItem
                                                            key={h.instCode}
                                                            value={`${h.instCode} ${h.instName}`}
                                                            onSelect={() => onSelectInst(h.instCode)}
                                                            className="flex items-center gap-3 py-3"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'h-4 w-4 shrink-0',
                                                                    selectedInstCode === h.instCode ? 'opacity-100' : 'opacity-0',
                                                                )}
                                                            />
                                                            <span className="flex-1">
                                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                    {h.instCode}
                                                                </span>
                                                                <span className="text-muted-foreground"> — </span>
                                                                <span>{h.instName}</span>
                                                            </span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full lg:w-1/3">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search programs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-10 w-full pl-10"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="h-12">Program Name</TableHead>
                                        <TableHead className="h-12">Major</TableHead>
                                        <TableHead className="h-12">Type</TableHead>
                                        <TableHead className="h-12">Status</TableHead>
                                        <TableHead className="h-12">Permit Number</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPrograms.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                                No programs available
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPrograms.map((program) => {
                                            const typeLabel = program.program_type || 'Unknown';
                                            const hasPermit = !!program.permit_number;
                                            const hasPdf = !!program.permit_pdf_url;

                                            return (
                                                <TableRow key={program.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <TableCell className="py-4 font-medium">
                                                        {program.program_name}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-sm text-gray-600 dark:text-gray-400">
                                                        {program.major || '-'}
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Badge className={getProgramTypeColor(program.program_type)}>
                                                            {typeLabel}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* ✅ PROGRAM STATUS BADGE */}
                                                    <TableCell className="py-4">
                                                        <Badge className={getProgramStatusColor(program.program_status)}>
                                                            {program.program_status}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* ✅ PERMIT BADGE LOGIC */}
                                                    <TableCell className="py-4">
                                                        {hasPermit ? (
                                                            hasPdf ? (
                                                                // CASE 1: Has Permit + Has PDF = GREEN
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300 gap-1.5"
                                                                >
                                                                    <FileText className="h-3 w-3" />
                                                                    <span className="font-mono">{program.permit_number}</span>
                                                                </Badge>
                                                            ) : (
                                                                // CASE 2: Has Permit + No PDF = PURPLE
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                                >
                                                                    <span className="font-mono">{program.permit_number}</span>
                                                                </Badge>
                                                            )
                                                        ) : (
                                                            // CASE 3: No Permit = RED (Check with CHED)
                                                            <Badge
                                                                variant="outline"
                                                                className="border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 gap-1.5"
                                                            >
                                                                <AlertCircle className="h-3 w-3" />
                                                                <span className="font-bold text-[10px]">CHECK WITH CHED</span>
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
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
