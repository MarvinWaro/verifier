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
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    const [open, setOpen] = useState(false);

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

    const fmt = (v: string | number | null | undefined) =>
        v === null || v === undefined || String(v).trim() === ''
            ? '-'
            : String(v);

    // Get selected institution display name
    const selectedInstitution = hei.find((h) => h.instCode === selectedInstCode);

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
                        {/* Institution selector + Search - IMPROVED SPACING */}
                        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
                            {/* Institution Dropdown with Search */}
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
                                            <CommandInput
                                                placeholder="Search institutions..."
                                                className="h-10"
                                            />
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
                                                                    selectedInstCode === h.instCode
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0',
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

                            {/* Search Input - MATCHED HEIGHT */}
                            <div className="relative w-full lg:w-1/3">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search programs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-10 w-full pl-10"
                                    aria-label="Search programs"
                                />
                            </div>
                        </div>

                        {/* Table - IMPROVED SPACING */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="h-12">Institution</TableHead>
                                        <TableHead className="h-12">Institution Code</TableHead>
                                        <TableHead className="h-12">Program Name</TableHead>
                                        <TableHead className="h-12">Major</TableHead>
                                        <TableHead className="h-12">Program Type</TableHead>
                                        <TableHead className="h-12">Permit Number</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPrograms.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-32 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                No programs available
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPrograms.map((program) => (
                                            <TableRow
                                                key={program.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <TableCell className="py-4 font-medium">
                                                    {program.institution.name}
                                                </TableCell>
                                                <TableCell className="py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                                                    {program.institution.institution_code}
                                                </TableCell>
                                                <TableCell className="py-4 font-medium">
                                                    {program.program_name}
                                                </TableCell>
                                                <TableCell className="py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {program.major || '-'}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {program.program_type ? (
                                                        <Badge
                                                            className={getProgramTypeColor(
                                                                program.program_type,
                                                            )}
                                                        >
                                                            {program.program_type}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4 font-mono text-sm">
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
