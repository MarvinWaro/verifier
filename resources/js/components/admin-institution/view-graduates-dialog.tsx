import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface GraduateLite {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    so_number: string | null;
    year_graduated: string | null;
}

interface ViewGraduatesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    programName: string | null;
    institutionName: string | null;
    institutionCode: string | null;
    graduates: GraduateLite[];
    loading: boolean;
}

export default function ViewGraduatesDialog({
    open,
    onOpenChange,
    programName,
    institutionName,
    institutionCode,
    graduates,
    loading,
}: ViewGraduatesDialogProps) {
    const [yearFilter, setYearFilter] = useState<string>('');

    // Extract year only from date strings (e.g., "2025-06-15" or "2025" -> "2025")
    const extractYear = (dateString: string | null): string | null => {
        if (!dateString) return null;

        // If it's already just a year (4 digits)
        if (/^\d{4}$/.test(dateString.trim())) {
            return dateString.trim();
        }

        // If it's a date string, extract the year
        const yearMatch = dateString.match(/(\d{4})/);
        return yearMatch ? yearMatch[1] : null;
    };

    // Get unique years for the filter dropdown (YEAR ONLY)
    const availableYears = useMemo(() => {
        const years = graduates
            .map((g) => extractYear(g.year_graduated))
            .filter((year): year is string => year !== null && year !== undefined)
            .sort()
            .reverse();
        return [...new Set(years)];
    }, [graduates]);

    // Filter graduates by selected year (compares extracted year with filter)
    const filteredGraduates = useMemo(() => {
        if (!yearFilter) return graduates;

        return graduates.filter((grad) => {
            const gradYear = extractYear(grad.year_graduated);
            return gradYear === yearFilter;
        });
    }, [graduates, yearFilter]);

    // Reset filter when dialog closes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setYearFilter('');
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-4xl w-full max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {programName || 'Program Details'}
                    </DialogTitle>
                    <DialogDescription>
                        {institutionName} ({institutionCode})
                    </DialogDescription>
                </DialogHeader>

                {/* Filter Section */}
                {!loading && graduates.length > 0 && (
                    <div className="flex items-center gap-4 pb-3 border-b">
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="year-filter"
                                className="text-sm font-medium whitespace-nowrap"
                            >
                                Filter by Year:
                            </label>
                            <select
                                id="year-filter"
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[120px]"
                            >
                                <option value="">All Years</option>
                                {/* FILTER: Shows only years (2024, 2025, etc.) */}
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="text-sm text-muted-foreground ml-auto">
                            Showing {filteredGraduates.length} of{' '}
                            {graduates.length} graduate
                            {graduates.length !== 1 ? 's' : ''}
                        </div>

                        {yearFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setYearFilter('')}
                                className="h-8 text-xs"
                            >
                                Clear Filter
                            </Button>
                        )}
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto border rounded-md min-h-[400px] max-h-[calc(85vh-280px)]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center min-h-[300px]">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Loading graduates...
                                </p>
                            </div>
                        </div>
                    ) : graduates.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center min-h-[300px] text-gray-500 p-8">
                            <GraduationCap className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-base font-medium mb-1">
                                No graduates found for this program
                            </p>
                            <p className="text-xs text-muted-foreground text-center max-w-md">
                                This could mean the program name in your
                                database doesn't match the API data, or no
                                students have graduated from this program yet.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
                                <TableRow>
                                    <TableHead className="w-[50%]">
                                        Student Name
                                    </TableHead>
                                    <TableHead className="w-[35%]">
                                        SO Number
                                    </TableHead>
                                    <TableHead className="text-right w-[15%]">
                                        Year Graduated
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGraduates.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="text-center py-12 text-gray-500"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <GraduationCap className="h-8 w-8 opacity-20" />
                                                <p>
                                                    No graduates found for year{' '}
                                                    <span className="font-semibold">
                                                        {yearFilter}
                                                    </span>
                                                </p>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() =>
                                                        setYearFilter('')
                                                    }
                                                    className="text-xs"
                                                >
                                                    View all graduates
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredGraduates.map((grad) => (
                                        <TableRow
                                            key={grad.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>
                                                        {grad.last_name},{' '}
                                                        {grad.first_name}
                                                    </span>
                                                    {grad.middle_name && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {grad.middle_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {grad.so_number ? (
                                                    <span className="text-blue-600 dark:text-blue-400">
                                                        {grad.so_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {grad.year_graduated ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-orange-50 text-orange-800 hover:bg-orange-50 dark:bg-orange-900 dark:text-orange-300"
                                                    >
                                                        {/* TABLE: Shows FULL original date */}
                                                        {grad.year_graduated}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Footer Stats */}
                {!loading && graduates.length > 0 && (
                    <div className="flex justify-between items-center pt-3 border-t">
                        <div className="text-sm text-muted-foreground">
                            <span className="font-medium">
                                {filteredGraduates.length}
                            </span>{' '}
                            graduate{filteredGraduates.length !== 1 ? 's' : ''}{' '}
                            {yearFilter && (
                                <>
                                    in{' '}
                                    <span className="font-medium">
                                        {yearFilter}
                                    </span>{' '}
                                    <span className="text-xs">
                                        ({graduates.length} total)
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
