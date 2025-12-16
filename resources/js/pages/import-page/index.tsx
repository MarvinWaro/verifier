import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Upload,
    Trash2,
    CheckCircle,
    AlertCircle,
    FileSpreadsheet,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Import',
        href: '/import',
    },
];

export default function ImportPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Data" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold">Import Data</h1>
                    <p className="text-gray-600">
                        Import institutions, programs, and graduates data from Excel files
                    </p>
                </div>

                <Tabs defaultValue="institutions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="institutions" className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            Institutions &amp; Programs
                        </TabsTrigger>
                        <TabsTrigger value="graduates" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Graduates
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="institutions" className="mt-4">
                        <InstitutionsImport />
                    </TabsContent>

                    <TabsContent value="graduates" className="mt-4">
                        <GraduatesImport />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function InstitutionsImport() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            setError(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/import/institutions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setResult(response.data);
                setFile(null);
                const input = document.getElementById('institutions-file-input') as HTMLInputElement;
                if (input) input.value = '';
                toast.success('Import successful!', {
                    description: response.data.message,
                });
            } else {
                setError(response.data.message);
                toast.error('Import failed', {
                    description: response.data.message,
                });
            }
        } catch (err: any) {
            console.error('Import error:', err);
            const errorMsg = err.response?.data?.message || err.message;
            setError('An error occurred during import: ' + errorMsg);
            toast.error('Import failed', {
                description: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        setShowClearDialog(false);
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/import/institutions/clear');

            if (response.data.success) {
                setResult({ message: response.data.message, success: true });
                toast.success('Data cleared successfully!', {
                    description: response.data.message,
                });
            } else if (response.data.isEmpty) {
                toast.info('No data to clear', {
                    description: 'The database is already empty. No institutions or programs found.',
                });
            } else {
                setError(response.data.message);
                toast.error('Clear failed', {
                    description: response.data.message,
                });
            }
        } catch (err: any) {
            console.error('Clear error:', err);
            const errorMsg = err.response?.data?.message || err.message;

            if (err.response?.data?.isEmpty) {
                toast.info('No data to clear', {
                    description: 'The database is already empty. No institutions or programs found.',
                });
            } else {
                setError('An error occurred: ' + errorMsg);
                toast.error('Clear failed', {
                    description: errorMsg,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Import Institutions &amp; Programs</CardTitle>
                    <CardDescription>
                        Upload an Excel file containing institution codes, names, and their programs
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input
                                id="institutions-file-input"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <Button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className="flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            {loading ? 'Importing...' : 'Import'}
                        </Button>
                    </div>

                    {file && (
                        <div className="text-sm text-gray-600">
                            Selected: <span className="font-medium">{file.name}</span>
                        </div>
                    )}

                    {result && result.success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {result.message}
                                {result.data && (
                                    <div className="mt-2 font-medium">
                                        • Institutions: {result.data.institutions}
                                        <br />
                                        • Programs: {result.data.programs}
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-3">Excel Format Requirements:</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <table className="text-xs w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Column</th>
                                        <th className="text-left py-2">Field</th>
                                        <th className="text-left py-2">Required</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr>
                                        <td className="py-1">A</td>
                                        <td>Institution Code</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">B</td>
                                        <td>HEI (Institution Name)</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">C</td>
                                        <td>Programs</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">D</td>
                                        <td>Program Type (Board/Non-Board)</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">E</td>
                                        <td>Major</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">F</td>
                                        <td>Permit Number</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">G</td>
                                        <td>Type (Private/SUCs/LUCs)</td>
                                        <td>✓</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <Button
                            variant="destructive"
                            onClick={() => setShowClearDialog(true)}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All Institutions &amp; Programs
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                            Warning: This will permanently delete all institutions and their programs
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all institutions
                            and programs from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClearData}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Yes, clear all data
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function GraduatesImport() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            setError(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/import/graduates', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setResult(response.data);
                setFile(null);
                const input = document.getElementById('graduates-file-input') as HTMLInputElement;
                if (input) input.value = '';
                toast.success('Import successful!', {
                    description: response.data.message,
                });
            } else {
                setError(response.data.message);
                toast.error('Import failed', {
                    description: response.data.message,
                });
            }
        } catch (err: any) {
            console.error('Import error:', err);
            const errorMsg = err.response?.data?.message || err.message;
            setError('An error occurred during import: ' + errorMsg);
            toast.error('Import failed', {
                description: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        setShowClearDialog(false);
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/import/graduates/clear');

            if (response.data.success) {
                setResult({ message: response.data.message, success: true });
                toast.success('Graduates cleared successfully!', {
                    description: response.data.message,
                });
            } else if (response.data.isEmpty) {
                // Handle empty database case
                toast.info('No graduates to clear', {
                    description: 'The database is already empty. No graduate records found.',
                });
            } else {
                setError(response.data.message);
                toast.error('Clear failed', {
                    description: response.data.message,
                });
            }
        } catch (err: any) {
            console.error('Clear error:', err);
            const errorMsg = err.response?.data?.message || err.message;

            // Check if it's the "empty database" response
            if (err.response?.data?.isEmpty) {
                toast.info('No graduates to clear', {
                    description: 'The database is already empty. No graduate records found.',
                });
            } else {
                setError('An error occurred: ' + errorMsg);
                toast.error('Clear failed', {
                    description: errorMsg,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Import Graduates</CardTitle>
                    <CardDescription>
                        Upload the SOAIS Excel file (MASTERLIST OF APPROVED SPECIAL ORDER APPLICATIONS).
                        The system will read only the required columns.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input
                                id="graduates-file-input"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>
                        <Button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                            <Upload className="w-4 h-4" />
                            {loading ? 'Importing...' : 'Import'}
                        </Button>
                    </div>

                    {file && (
                        <div className="text-sm text-gray-600">
                            Selected: <span className="font-medium">{file.name}</span>
                        </div>
                    )}

                    {result && result.success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {result.message}
                                {result.data && (
                                    <div className="mt-2 font-medium space-y-1">
                                        <div>
                                            • New records created:{' '}
                                            {result.data.created ?? 0}
                                        </div>
                                        <div>
                                            • Existing records updated:{' '}
                                            {result.data.updated ?? 0}
                                        </div>
                                        <div>
                                            • Unchanged rows (same data):{' '}
                                            {result.data.unchanged ?? 0}
                                        </div>
                                        <div>
                                            • Blank rows skipped:{' '}
                                            {result.data.blank_rows ?? 0}
                                        </div>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-3">Excel Format (SOAIS Template):</h3>
                        <p className="text-xs text-gray-600 mb-2">
                            Use the official SOAIS export. The system will read the following columns:
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <table className="text-xs w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Column</th>
                                        <th className="text-left py-2">Field</th>
                                        <th className="text-left py-2">Required</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr>
                                        <td className="py-1">D</td>
                                        <td>HEI UII</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">E</td>
                                        <td>Special Order Number</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">F</td>
                                        <td>Last Name</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">G</td>
                                        <td>First Name</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">H</td>
                                        <td>Middle Name</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">I</td>
                                        <td>Extension Name (II, Jr., etc.)</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">J</td>
                                        <td>Sex (Male/Female)</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">K</td>
                                        <td>Program</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">L</td>
                                        <td>PSCED Code</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">M</td>
                                        <td>Major</td>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">P</td>
                                        <td>Date of Graduation</td>
                                        <td>✓</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">R</td>
                                        <td>Last Enrollment Academic Year (used as Academic Year)</td>
                                        <td>-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Note: Other columns in the SOAIS file (e.g. Region, Province, Started Semester)
                            are ignored by the system.
                        </p>
                    </div>

                    <div className="pt-4 border-t">
                        <Button
                            variant="destructive"
                            onClick={() => setShowClearDialog(true)}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All Graduates
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                            Warning: This will permanently delete all graduate records
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all graduate
                            records from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClearData}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Yes, clear all graduates
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
