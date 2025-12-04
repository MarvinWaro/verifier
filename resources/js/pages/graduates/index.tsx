import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface Institution {
    institution_code: string;
    name: string;
    type: string;
}

interface Program {
    program_name: string;
    major: string | null;
    program_type: string;
    permit_number: string;
    institution: Institution;
}

interface Graduate {
    id: number;
    student_id_number: string | null;
    date_of_birth: string | null;
    last_name: string;
    first_name: string;
    middle_name: string | null;
    extension_name: string | null;
    sex: string | null;
    year_graduated: string;
    academic_year: string | null;
    hei_uii: string | null;
    program: Program;
    so_number: string | null;
}

interface Props {
    graduates: Graduate[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Graduates',
        href: '/graduates',
    },
];

export default function GraduateIndex({ graduates }: Props) {
    const [items, setItems] = useState<Graduate[]>(graduates);
    const [search, setSearch] = useState('');

    const [editOpen, setEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editing, setEditing] = useState<Graduate | null>(null);

    const [editForm, setEditForm] = useState({
        last_name: '',
        first_name: '',
        middle_name: '',
        extension_name: '',
        sex: '',
        date_graduated: '',
        academic_year: '',
        so_number: '',
        program_name: '',
        major: '',
    });

    useEffect(() => {
        setItems(graduates);
    }, [graduates]);

    const filteredGraduates = items.filter((graduate) => {
        const term = search.toLowerCase();

        return (
            graduate.last_name?.toLowerCase().includes(term) ||
            graduate.first_name?.toLowerCase().includes(term) ||
            (graduate.middle_name ?? '').toLowerCase().includes(term) ||
            graduate.program.program_name.toLowerCase().includes(term) ||
            graduate.program.institution.name.toLowerCase().includes(term) ||
            graduate.program.institution.institution_code.toLowerCase().includes(term) ||
            graduate.year_graduated.includes(search) ||
            (graduate.academic_year ?? '').includes(search) ||
            graduate.so_number?.toLowerCase().includes(term)
        );
    });

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

    const getSexColor = (sex: string | null) => {
        switch (sex?.toUpperCase()) {
            case 'MALE':
                return 'bg-blue-50 text-blue-700 hover:bg-blue-50';
            case 'FEMALE':
                return 'bg-pink-50 text-pink-700 hover:bg-pink-50';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const openEditDialog = (graduate: Graduate) => {
        setEditing(graduate);
        setEditForm({
            last_name: graduate.last_name,
            first_name: graduate.first_name,
            middle_name: graduate.middle_name ?? '',
            extension_name: graduate.extension_name ?? '',
            sex: graduate.sex ?? '',
            date_graduated: graduate.year_graduated ?? '',
            academic_year: graduate.academic_year ?? '',
            so_number: graduate.so_number ?? '',
            program_name: graduate.program.program_name,
            major: graduate.program.major ?? '',
        });
        setEditOpen(true);
    };

    const handleEditChange = (field: keyof typeof editForm, value: string) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveEdit = async () => {
        if (!editing) return;

        setEditLoading(true);
        try {
            const payload = {
                ...editForm,
                sex: editForm.sex || null,
            };

            await axios.put(`/graduates/${editing.id}`, payload);

            setItems((prev) =>
                prev.map((g) =>
                    g.id === editing.id
                        ? {
                              ...g,
                              last_name: editForm.last_name,
                              first_name: editForm.first_name,
                              middle_name: editForm.middle_name || null,
                              extension_name: editForm.extension_name || null,
                              sex: editForm.sex || null,
                              year_graduated: editForm.date_graduated || g.year_graduated,
                              academic_year: editForm.academic_year || null,
                              so_number: editForm.so_number || null,
                              program: {
                                  ...g.program,
                                  program_name: editForm.program_name,
                                  major: editForm.major || null,
                              },
                          }
                        : g,
                ),
            );

            toast.success('Graduate updated successfully.');
            setEditOpen(false);
            setEditing(null);
        } catch (error: any) {
            console.error(error);
            const msg = error?.response?.data?.message ?? 'Failed to update graduate.';
            toast.error(msg);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/graduates/${id}`);
            setItems((prev) => prev.filter((g) => g.id !== id));
            toast.success('Graduate removed successfully.');
        } catch (error: any) {
            console.error(error);
            const msg = error?.response?.data?.message ?? 'Failed to remove graduate.';
            toast.error(msg);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Graduates" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>All Graduates</CardTitle>
                        <CardDescription>
                            Total of {items.length} graduate{items.length !== 1 ? 's' : ''} registered
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, SO number, program, institution, or year..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SO Number</TableHead>
                                        <TableHead>Last Name</TableHead>
                                        <TableHead>First Name</TableHead>
                                        <TableHead>Middle Name</TableHead>
                                        <TableHead>Ext</TableHead>
                                        <TableHead>Sex</TableHead>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Institution Code</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Major</TableHead>
                                        <TableHead>Program Type</TableHead>
                                        <TableHead>Date Graduated</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGraduates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={14} className="text-center py-8 text-gray-500">
                                                {search ? 'No graduates found' : 'No graduates available'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredGraduates.map((graduate) => (
                                            <TableRow key={graduate.id} className="hover:bg-gray-50">
                                                <TableCell className="text-sm">
                                                    {graduate.so_number ? (
                                                        <span className="font-medium text-blue-600">
                                                            {graduate.so_number}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {graduate.last_name}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {graduate.first_name}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {graduate.middle_name}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {graduate.extension_name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {graduate.sex ? (
                                                        <Badge
                                                            variant="outline"
                                                            className={getSexColor(graduate.sex)}
                                                        >
                                                            {graduate.sex}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {graduate.program.institution.name}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-gray-600">
                                                    {graduate.program.institution.institution_code}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {graduate.program.program_name ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {graduate.program.major || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getProgramTypeColor(
                                                            graduate.program.program_type,
                                                        )}
                                                    >
                                                        {graduate.program.program_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-orange-50 text-orange-800 hover:bg-orange-50"
                                                    >
                                                        {graduate.year_graduated}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {graduate.academic_year || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-1"
                                                            onClick={() => openEditDialog(graduate)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                            <span className="hidden md:inline">Edit</span>
                                                        </Button>

                                                        {/* Delete popover */}
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="hidden md:inline">
                                                                        Remove
                                                                    </span>
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent
                                                                className="w-72 border border-red-100 shadow-lg"
                                                                align="end"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="mt-0.5">
                                                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm font-semibold">
                                                                            Delete graduate
                                                                        </p>
                                                                        <p className="text-xs text-gray-600">
                                                                            Delete{' '}
                                                                            <span className="font-medium">
                                                                                {graduate.first_name}{' '}
                                                                                {graduate.last_name}
                                                                            </span>
                                                                            ? This action cannot be undone.
                                                                        </p>
                                                                        <div className="flex justify-end gap-2 pt-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-7 px-3 text-xs"
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700"
                                                                                onClick={() =>
                                                                                    handleDelete(graduate.id)
                                                                                }
                                                                            >
                                                                                Delete
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {search && (
                            <p className="text-sm text-gray-600 mt-4">
                                Showing {filteredGraduates.length} of {items.length} graduates
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Graduate</DialogTitle>
                        <DialogDescription>
                            Update basic information for this graduate. Changes are saved immediately to
                            the database.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-2">
                        {/* Names */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-700">Last Name</label>
                                <Input
                                    value={editForm.last_name}
                                    onChange={(e) => handleEditChange('last_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700">First Name</label>
                                <Input
                                    value={editForm.first_name}
                                    onChange={(e) => handleEditChange('first_name', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Middle / Ext / Sex */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-700">Middle Name</label>
                                <Input
                                    value={editForm.middle_name}
                                    onChange={(e) => handleEditChange('middle_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700">Extension</label>
                                <Input
                                    value={editForm.extension_name}
                                    onChange={(e) =>
                                        handleEditChange('extension_name', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700">Sex</label>
                                <Select
                                    value={editForm.sex || ''}
                                    onValueChange={(value) => handleEditChange('sex', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">MALE</SelectItem>
                                        <SelectItem value="FEMALE">FEMALE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dates (still half/half) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-700">Date Graduated</label>
                                <Input
                                    type="text"
                                    placeholder="YYYY-MM-DD"
                                    value={editForm.date_graduated}
                                    onChange={(e) =>
                                        handleEditChange('date_graduated', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700">Academic Year</label>
                                <Input
                                    placeholder="e.g. 2023-2024"
                                    value={editForm.academic_year}
                                    onChange={(e) =>
                                        handleEditChange('academic_year', e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* SO number – full width */}
                        <div>
                            <label className="text-xs font-medium text-gray-700">SO Number</label>
                            <Input
                                value={editForm.so_number}
                                onChange={(e) => handleEditChange('so_number', e.target.value)}
                            />
                        </div>

                        {/* Program – full width */}
                        <div>
                            <label className="text-xs font-medium text-gray-700">Program</label>
                            <Input
                                value={editForm.program_name}
                                onChange={(e) => handleEditChange('program_name', e.target.value)}
                            />
                        </div>

                        {/* Major – full width */}
                        <div>
                            <label className="text-xs font-medium text-gray-700">Major</label>
                            <Input
                                value={editForm.major}
                                onChange={(e) => handleEditChange('major', e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setEditOpen(false)}
                            disabled={editLoading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={editLoading}>
                            {editLoading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
