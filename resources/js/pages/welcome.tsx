import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GraduateViewModal from '@/components/welcome/view-modal';
import StudentResultsTable from '@/components/welcome/student-results-table';
import InstitutionResultsList from '@/components/welcome/institution-results-list';
import ProgramsList from '@/components/welcome/programs-list';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import {
    Award,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronRight,
    GraduationCap,
    School,
    Search,
    Shield,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface Graduate {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    extensionName: string | null;
    yearGraduated: string;
    studentId: string;
    eligibility: string;
    dateOfBirth: string | null;
    sex: string | null;
    soNumber: string | null;
    lrn: string | null;
    philsysId: string | null;
    program?: {
        id: number;
        name: string;
        major: string | null;
        copNumber: string | null;
        grNumber: string | null;
    };
    institution?: {
        code: string;
        name: string;
        type: string;
    };
}

interface Program {
    id: number;
    name: string;
    major: string | null;
    copNumber: string | null;
    grNumber: string | null;
    graduates_count?: number;
    graduates?: Graduate[];
    institution?: {
        code: string;
        name: string;
        type: string;
    };
}

interface Institution {
    id: number;
    code: string;
    name: string;
    type: 'public' | 'private';
    programs: Program[];
}

interface Props {
    stats: {
        institutions: number;
        programs: number;
        graduates: number;
    };
}

export default function PRCCheckLanding({ stats }: Props) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [selectedInstitution, setSelectedInstitution] =
        useState<Institution | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(
        null,
    );
    const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(
        null,
    );
    const [isSearching, setIsSearching] = useState(false);

    const [studentQuery, setStudentQuery] = useState<string>('');
    const [isSearchingStudents, setIsSearchingStudents] = useState(false);
    const [studentSearchResults, setStudentSearchResults] = useState<
        Graduate[]
    >([]);

    const resetFilters = () => {
        setSelectedInstitution(null);
        setSelectedProgram(null);
        setSelectedGraduate(null);
        setInstitutions([]);
    };

    const handleInstitutionSearch = async () => {
        if (!searchTerm.trim()) {
            setInstitutions([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.post('/api/search-institution', {
                search: searchTerm,
            });

            console.log('Search response:', response.data);
            setInstitutions(response.data.institutions);

            if (response.data.institutions.length === 0) {
                console.log('No institutions found for:', searchTerm);
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Search failed. Please check console for details.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleProgramClick = async (program: Program) => {
        try {
            const response = await axios.get(`/api/program/${program.id}`);
            setSelectedProgram(response.data.program);
        } catch (error) {
            console.error('Failed to load program:', error);
        }
    };

    const handleStudentSearch = async () => {
        if (!studentQuery.trim()) {
            setStudentSearchResults([]);
            return;
        }
        setIsSearchingStudents(true);
        try {
            const response = await axios.post('/api/search-student', {
                search: studentQuery,
            });
            setStudentSearchResults(response.data.graduates);
        } catch (error) {
            console.error('Student search failed:', error);
        } finally {
            setIsSearchingStudents(false);
        }
    };

    const clearStudentSearch = () => {
        setStudentQuery('');
        setStudentSearchResults([]);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Header with Login/Register and Dark Mode Toggle */}
            <header className="absolute top-0 right-0 z-20 p-6">
                <div className="flex items-center gap-4">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => {
                            document.documentElement.classList.toggle('dark');
                        }}
                        className="rounded-lg bg-white p-2 shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                        aria-label="Toggle dark mode"
                    >
                        <svg
                            className="h-5 w-5 text-gray-700 dark:hidden"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                        </svg>
                        <svg
                            className="hidden h-5 w-5 text-gray-200 dark:block"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    </button>

                    {/* Login/Register Links */}
                    <a
                        href="/login"
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        Log in
                    </a>
                    <a
                        href="/register"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                        Register
                    </a>
                </div>
            </header>

            {!selectedInstitution && !selectedProgram && (
                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-7xl">
                        <div className="mb-10 text-center">
                            <div className="mb-6 flex justify-center">
                                <img
                                    src="/assets/img/ched-logo.png"
                                    alt="CHED Logo"
                                    className="h-28 w-28 object-contain"
                                />
                            </div>
                            <h1 className="mb-2 text-5xl font-bold text-gray-900 dark:text-white">
                                Commission on Higher Education
                            </h1>
                            <p className="mb-4 text-base text-gray-600 dark:text-gray-400">
                                Regional Office XII
                            </p>
                            <h2 className="mb-10 text-5xl font-bold text-blue-900 dark:text-blue-400">
                                CHECK with CHED
                            </h2>
                        </div>

                        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card className="border-0 bg-white/90 shadow-xl backdrop-blur-sm dark:bg-gray-800">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                                            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Search by Institution
                                        </h2>
                                    </div>
                                    <p className="mb-6 text-base text-gray-600 dark:text-gray-300">
                                        Find graduates by selecting their
                                        educational institution
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    type="text"
                                                    placeholder="Enter institution code or name..."
                                                    value={searchTerm}
                                                    onChange={(e) =>
                                                        setSearchTerm(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleInstitutionSearch();
                                                        }
                                                    }}
                                                    className="h-12 pl-10 text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                                />
                                            </div>
                                            <Button
                                                onClick={
                                                    handleInstitutionSearch
                                                }
                                                className="h-12 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                                disabled={
                                                    isSearching ||
                                                    !searchTerm.trim()
                                                }
                                            >
                                                {isSearching
                                                    ? 'Searching...'
                                                    : 'Search'}
                                            </Button>
                                        </div>
                                        {institutions.length > 0 && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Found {institutions.length}{' '}
                                                institution(s)
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/90 shadow-xl backdrop-blur-sm dark:bg-gray-800">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                                            <User className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Search by Student
                                        </h2>
                                    </div>
                                    <p className="mb-6 text-base text-gray-600 dark:text-gray-300">
                                        Directly search for a specific graduate
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    type="text"
                                                    placeholder="Search Student Name or ID"
                                                    value={studentQuery}
                                                    onChange={(e) =>
                                                        setStudentQuery(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter')
                                                            handleStudentSearch();
                                                    }}
                                                    className="h-12 pl-10 text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleStudentSearch}
                                                className="h-12 bg-purple-600 text-base text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                                                disabled={
                                                    isSearchingStudents ||
                                                    !studentQuery.trim()
                                                }
                                            >
                                                {isSearchingStudents
                                                    ? 'Searching…'
                                                    : 'Search'}
                                            </Button>
                                            <Button
                                                onClick={clearStudentSearch}
                                                variant="outline"
                                                className="h-12 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                Clear
                                            </Button>
                                        </div>

                                        {studentSearchResults.length > 0 && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Found{' '}
                                                {studentSearchResults.length}{' '}
                                                student
                                                {studentSearchResults.length ===
                                                1
                                                    ? ''
                                                    : 's'}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {institutions.length > 0 && !selectedInstitution && (
                            <InstitutionResultsList
                                institutions={institutions}
                                onSelectInstitution={setSelectedInstitution}
                            />
                        )}

                        {studentSearchResults.length > 0 && !selectedInstitution && (
                            <StudentResultsTable
                                students={studentSearchResults}
                                onViewDetails={(graduate) => {
                                    // Show login requirement message
                                    alert('Please log in to view detailed student information.');
                                    // TODO: Redirect to login page
                                    // window.location.href = '/login';
                                }}
                            />
                        )}
                    </div>
                </div>
            )}

            {(selectedInstitution || selectedProgram) && (
                <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            resetFilters();
                            setSearchTerm('');
                            clearStudentSearch();
                        }}
                        className="mb-6"
                    >
                        ← Back to Search
                    </Button>

                    <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm">
                                <button
                                    onClick={resetFilters}
                                    className="font-medium text-blue-600 hover:text-blue-800"
                                >
                                    All Institutions
                                </button>
                                {selectedInstitution && (
                                    <>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                        <button
                                            onClick={() => {
                                                setSelectedProgram(null);
                                                setSelectedGraduate(null);
                                            }}
                                            className="font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            {selectedInstitution.name}
                                        </button>
                                    </>
                                )}
                                {selectedProgram && (
                                    <>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium text-gray-700">
                                            {selectedProgram.name}
                                        </span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {selectedInstitution && !selectedProgram && (
                        <>
                            <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-blue-100 p-3">
                                            <Building2 className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {selectedInstitution.name}
                                            </h2>
                                            <div className="mt-2 flex items-center gap-3">
                                                <span className="text-sm text-gray-600">
                                                    Code:{' '}
                                                    {selectedInstitution.code}
                                                </span>
                                                <Badge
                                                    variant={
                                                        selectedInstitution.type ===
                                                        'public'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {selectedInstitution.type ===
                                                    'public'
                                                        ? 'Public Institution'
                                                        : 'Private Institution'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <ProgramsList
                                programs={selectedInstitution.programs}
                                onProgramClick={handleProgramClick}
                            />
                        </>
                    )}

                    {selectedProgram && (
                        <>
                            <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-800">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                                            <GraduationCap className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {selectedProgram.name}
                                            </h2>
                                            {selectedProgram.major && (
                                                <p className="mt-1 text-gray-600 dark:text-gray-300">
                                                    Major:{' '}
                                                    {selectedProgram.major}
                                                </p>
                                            )}
                                            <div className="mt-3 flex flex-wrap items-center gap-4">
                                                {selectedProgram.copNumber && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                    >
                                                        COP:{' '}
                                                        {
                                                            selectedProgram.copNumber
                                                        }
                                                    </Badge>
                                                )}
                                                {selectedProgram.grNumber && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                    >
                                                        GR:{' '}
                                                        {
                                                            selectedProgram.grNumber
                                                        }
                                                    </Badge>
                                                )}
                                                {selectedProgram.institution && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                        <School className="h-4 w-4" />
                                                        {
                                                            selectedProgram
                                                                .institution
                                                                .name
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* PDF Permit Viewer */}
                            <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-800">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Program Permit Document
                                        </h3>
                                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                            {selectedProgram.copNumber ? 'COPC Document' : 'GR Document'}
                                        </Badge>
                                    </div>

                                    {/* PDF Preview Area */}
                                    <div className="relative min-h-[600px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50">
                                        <div className="flex h-[600px] flex-col items-center justify-center p-8 text-center">
                                            {/* Placeholder Icon */}
                                            <div className="mb-6 rounded-full bg-blue-100 p-6 dark:bg-blue-900/30">
                                                <svg
                                                    className="h-16 w-16 text-blue-600 dark:text-blue-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>

                                            {/* Placeholder Text */}
                                            <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                                Permit Document Preview
                                            </h4>
                                            <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
                                                {selectedProgram.copNumber
                                                    ? `COPC Number: ${selectedProgram.copNumber}`
                                                    : `GR Number: ${selectedProgram.grNumber}`
                                                }
                                            </p>

                                            {/* Document Details */}
                                            <div className="mb-6 w-full max-w-md space-y-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                                                <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Program:
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {selectedProgram.name}
                                                    </span>
                                                </div>
                                                {selectedProgram.major && (
                                                    <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            Major:
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {selectedProgram.major}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Institution:
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {selectedProgram.institution?.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Type:
                                                    </span>
                                                    <Badge variant={selectedProgram.institution?.type === 'public' ? 'default' : 'secondary'}>
                                                        {selectedProgram.institution?.type === 'public' ? 'Public' : 'Private'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Info Message */}
                                            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/20">
                                                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/40">
                                                    <svg
                                                        className="h-5 w-5 text-blue-600 dark:text-blue-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                        Document Preview Placeholder
                                                    </p>
                                                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                                                        The actual permit document (PDF) will be displayed here once uploaded to the system.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </main>
            )}

            <GraduateViewModal
                graduate={selectedGraduate}
                onClose={() => setSelectedGraduate(null)}
            />
        </div>
    );
}
