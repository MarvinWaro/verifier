import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Database,
    FileSpreadsheet,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Institutions',
        href: '#',
    },
];

interface InstitutionData {
    id: number;
    name: string;
    code: string;
    program: string;
    major: string | null;
    permitNumber: string;
    yearIssued: string | null;
    status: string | null;
}

interface Stats {
    totalInstitutions: number;
    totalPrograms: number;
    lastImport: string | null;
}

interface Props {
    institutions?: InstitutionData[];
    stats?: Stats;
    success?: string;
    error?: string;
}

export default function InstitutionIndex({
    institutions: initialInstitutions = [],
    stats: initialStats,
    success,
    error,
}: Props) {
    const [institutions, setInstitutions] =
        useState<InstitutionData[]>(initialInstitutions);
    const [stats, setStats] = useState<Stats>(
        initialStats || {
            totalInstitutions: 0,
            totalPrograms: 0,
            lastImport: null,
        },
    );
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(
        success
            ? { type: 'success', text: success }
            : error
              ? { type: 'error', text: error }
              : null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setMessage(null);

        // Use Inertia's router.post which handles CSRF automatically
        router.post(
            '/institutions/import',
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page: any) => {
                    const result = page.props;
                    if (result.success) {
                        setInstitutions(result.data);
                        setStats(result.stats);
                        setMessage({
                            type: 'success',
                            text:
                                result.message || 'Data imported successfully!',
                        });

                        // Auto-hide success message after 5 seconds
                        setTimeout(() => setMessage(null), 5000);
                    }
                    setImporting(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
                onError: (errors: any) => {
                    console.error('Import error:', errors);
                    setMessage({
                        type: 'error',
                        text:
                            errors.message ||
                            'An error occurred while importing the file',
                    });
                    setImporting(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Institution Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Institution Management
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Import and manage institutions and their programs
                    </p>
                </div>

                {/* Success/Error Message */}
                {message && (
                    <div
                        className={`rounded-lg border p-4 ${
                            message.type === 'success'
                                ? 'border-green-200 bg-green-50'
                                : 'border-red-200 bg-red-50'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {message.type === 'success' ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <X className="h-5 w-5 text-red-600" />
                                )}
                                <p
                                    className={`text-sm font-medium ${
                                        message.type === 'success'
                                            ? 'text-green-900'
                                            : 'text-red-900'
                                    }`}
                                >
                                    {message.text}
                                </p>
                            </div>
                            <button
                                onClick={() => setMessage(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Total Institutions
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalInstitutions}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-purple-100 p-3">
                                    <FileSpreadsheet className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Total Programs
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalPrograms}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-green-100 p-3">
                                    <Database className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Last Import
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {stats.lastImport || 'No imports yet'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Table Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Institutions & Programs
                            </h2>
                            <div className="flex gap-2">
                                <Input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                />
                                <Button
                                    onClick={handleImportClick}
                                    disabled={importing}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {importing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Import Excel
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full">
                                <caption className="mt-4 mb-4 text-sm text-gray-500">
                                    {institutions.length === 0
                                        ? 'No data available. Click "Import Excel" to upload institution data.'
                                        : `Showing ${institutions.length} program records from ${stats.totalInstitutions} institutions.`}
                                </caption>
                                <thead className="bg-gray-50">
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                            Institution
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                            Program
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                            Major
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                            Permit Number
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {institutions.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="h-64 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="rounded-full bg-gray-100 p-4">
                                                        <FileSpreadsheet className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-medium text-gray-900">
                                                            No data imported yet
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Upload an Excel file
                                                            to get started
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={
                                                            handleImportClick
                                                        }
                                                        variant="outline"
                                                        className="mt-2"
                                                    >
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Import Excel File
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        institutions.map((institution) => (
                                            <tr
                                                key={institution.id}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <div className="font-semibold">
                                                            {institution.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {institution.code}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {institution.program}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {institution.major || (
                                                        <span className="text-gray-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            institution.permitNumber?.includes(
                                                                'COPC',
                                                            )
                                                                ? 'border-green-200 bg-green-50 text-green-700'
                                                                : 'border-purple-200 bg-purple-50 text-purple-700'
                                                        }
                                                    >
                                                        {
                                                            institution.permitNumber
                                                        }
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions Card */}
                {institutions.length === 0 && (
                    <Card className="mt-6 border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <div className="self-start rounded-lg bg-blue-100 p-2">
                                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="mb-2 font-semibold text-blue-900">
                                        How to Import Data
                                    </h3>
                                    <ol className="space-y-1 text-sm text-blue-800">
                                        <li>
                                            1. Click the "Import Excel" button
                                            above
                                        </li>
                                        <li>
                                            2. Select your Excel file with PHEI,
                                            SUC, and LUC sheets
                                        </li>
                                        <li>
                                            3. The system will automatically
                                            process and import all data
                                        </li>
                                        <li>
                                            4. View the imported institutions
                                            and programs in the table
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
