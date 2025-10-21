import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Trash2, CheckCircle, AlertCircle, FileSpreadsheet, Users } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

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
                    <p className="text-gray-600">Import institutions, programs, and graduates data from Excel files</p>
                </div>

                <Tabs defaultValue="institutions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="institutions" className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            Institutions & Programs
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
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            console.error('Import error:', err);
            setError('An error occurred during import: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        if (!confirm('Are you sure you want to clear all institutions and programs? This cannot be undone!')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/import/institutions/clear');

            if (response.data.success) {
                setResult({ message: response.data.message, success: true });
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            console.error('Clear error:', err);
            setError('An error occurred: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Import Institutions & Programs</CardTitle>
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
                                    • Institutions: {result.data.institutions}<br />
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
                                <tr><td className="py-1">A</td><td>Institution Code</td><td>✓</td></tr>
                                <tr><td className="py-1">B</td><td>HEI (Institution Name)</td><td>✓</td></tr>
                                <tr><td className="py-1">C</td><td>Programs</td><td>✓</td></tr>
                                <tr><td className="py-1">D</td><td>Program Type (Board/Non-Board)</td><td>-</td></tr>
                                <tr><td className="py-1">E</td><td>Major</td><td>-</td></tr>
                                <tr><td className="py-1">F</td><td>Permit Number</td><td>✓</td></tr>
                                <tr><td className="py-1">G</td><td>Type (Private/SUCs/LUCs)</td><td>✓</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Button
                        variant="destructive"
                        onClick={handleClearData}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All Institutions & Programs
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                        Warning: This will permanently delete all institutions and their programs
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function GraduatesImport() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

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
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            console.error('Import error:', err);
            setError('An error occurred during import: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        if (!confirm('Are you sure you want to clear all graduates? This cannot be undone!')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/import/graduates/clear');

            if (response.data.success) {
                setResult({ message: response.data.message, success: true });
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            console.error('Clear error:', err);
            setError('An error occurred: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Import Graduates</CardTitle>
                <CardDescription>
                    Upload an Excel file containing graduate information
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
                                <div className="mt-2 font-medium">
                                    • Graduates Imported: {result.data.graduates}<br />
                                    • Programs Matched: {result.data.matched}<br />
                                    {result.data.unmatched > 0 && (
                                        <span className="text-orange-700">
                                            • Unmatched Programs: {result.data.unmatched}
                                        </span>
                                    )}
                                </div>
                            )}
                            {result.data && result.data.errors && result.data.errors.length > 0 && (
                                <div className="mt-3 text-xs">
                                    <p className="font-semibold mb-1">First few errors:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {result.data.errors.map((err: string, idx: number) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
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
                                <tr><td className="py-1">A</td><td>Institution Code</td><td>-</td></tr>
                                <tr><td className="py-1">B</td><td>Student ID Number</td><td>✓</td></tr>
                                <tr><td className="py-1">C</td><td>Date of Birth</td><td>-</td></tr>
                                <tr><td className="py-1">D</td><td>Last Name</td><td>✓</td></tr>
                                <tr><td className="py-1">E</td><td>First Name</td><td>✓</td></tr>
                                <tr><td className="py-1">F</td><td>Middle Name</td><td>-</td></tr>
                                <tr><td className="py-1">G</td><td>Extension Name</td><td>-</td></tr>
                                <tr><td className="py-1">H</td><td>Sex</td><td>-</td></tr>
                                <tr><td className="py-1">I</td><td>Date Graduated</td><td>✓</td></tr>
                                <tr><td className="py-1">J</td><td>Course</td><td>✓</td></tr>
                                <tr><td className="py-1">K</td><td>Major</td><td>-</td></tr>
                                <tr><td className="py-1">L</td><td>SO Number</td><td>-</td></tr>
                                <tr><td className="py-1">M</td><td>LRN</td><td>-</td></tr>
                                <tr><td className="py-1">N</td><td>PhilSys ID</td><td>-</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Button
                        variant="destructive"
                        onClick={handleClearData}
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
    );
}
