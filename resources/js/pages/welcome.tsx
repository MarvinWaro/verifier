import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GraduateViewModal from '@/components/welcome/view-modal';
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

    // with this:
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

            console.log('Search response:', response.data); // Debug log
            setInstitutions(response.data.institutions);

            // Show message if no results
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

    // replace handleStudentSearch with:
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

    // replace clearStudentFilters with:
    const clearStudentSearch = () => {
        setStudentQuery('');
        setStudentSearchResults([]);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 via-white to-blue-50">
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            ></div>

            <div className="absolute top-0 left-0 h-96 w-96 animate-pulse rounded-full bg-blue-300 opacity-40 mix-blend-multiply blur-3xl filter"></div>
            <div
                className="absolute top-0 right-0 h-96 w-96 animate-pulse rounded-full bg-indigo-300 opacity-40 mix-blend-multiply blur-3xl filter"
                style={{ animationDelay: '2s' }}
            ></div>
            <div
                className="absolute bottom-0 left-1/2 h-96 w-96 animate-pulse rounded-full bg-blue-200 opacity-40 mix-blend-multiply blur-3xl filter"
                style={{ animationDelay: '4s' }}
            ></div>

            <header className="relative z-10 border-b border-white/20 bg-gradient-to-r from-white/40 via-white/60 to-white/40 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/assets/img/prc.png"
                                alt="PRC Logo"
                                className="h-14 w-14 object-contain"
                            />
                            <img
                                src="/assets/img/ched-logo.png"
                                alt="CHED Logo"
                                className="h-14 w-14 object-contain"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    CHECK with CHED
                                </h1>
                                <p className="text-xs text-gray-600">
                                    Higher Education Institution Graduates
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {!selectedInstitution && !selectedProgram && (
                <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    Official PRC Verification Portal
                                </span>
                            </div>
                            <h1 className="mb-4 text-5xl font-bold text-gray-900">
                                Verify Graduate Eligibility
                            </h1>
                            <p className="mx-auto max-w-3xl text-xl text-gray-600">
                                Access the official database to verify higher
                                education graduates' eligibility for
                                Professional Regulation Commission board
                                examinations
                            </p>
                        </div>

                        <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                <CardContent className="p-6 text-center">
                                    <Building2 className="mx-auto mb-3 h-10 w-10 text-blue-600" />
                                    <div className="text-3xl font-bold text-gray-900">
                                        {stats.institutions}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Verified Institutions
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                <CardContent className="p-6 text-center">
                                    <Award className="mx-auto mb-3 h-10 w-10 text-green-600" />
                                    <div className="text-3xl font-bold text-gray-900">
                                        {stats.graduates}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Eligible Graduates
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card className="border-0 bg-white/90 shadow-xl backdrop-blur-sm">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-lg bg-blue-100 p-2">
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Search by Institution
                                        </h2>
                                    </div>
                                    <p className="mb-6 text-gray-600">
                                        Find graduates by selecting their
                                        educational institution
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="h-12 pl-10 text-base"
                                                />
                                            </div>
                                            <Button
                                                onClick={
                                                    handleInstitutionSearch
                                                }
                                                className="h-12 bg-blue-600 hover:bg-blue-700"
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
                                            <div className="text-sm text-gray-600">
                                                Found {institutions.length}{' '}
                                                institution(s)
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/90 shadow-xl backdrop-blur-sm">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-lg bg-purple-100 p-2">
                                            <User className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Search by Student
                                        </h2>
                                    </div>
                                    <p className="mb-6 text-gray-600">
                                        Directly search for a specific graduate.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                                    className="h-12 pl-10 text-base"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleStudentSearch}
                                                className="h-12 bg-purple-600 text-base hover:bg-purple-700"
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
                                                className="h-12"
                                            >
                                                Clear
                                            </Button>
                                        </div>

                                        {studentSearchResults.length > 0 && (
                                            <div className="text-sm text-gray-600">
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
                            <div className="mx-auto mt-8 max-w-6xl">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    Search Results
                                </h3>
                                <div className="grid gap-4">
                                    {institutions.map((institution) => (
                                        <Card
                                            key={institution.id}
                                            className="cursor-pointer border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
                                            onClick={() =>
                                                setSelectedInstitution(
                                                    institution,
                                                )
                                            }
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="rounded-lg bg-blue-100 p-3">
                                                            <Building2 className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="mb-1 text-lg font-semibold text-gray-900">
                                                                {
                                                                    institution.name
                                                                }
                                                            </h3>
                                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                                <span>
                                                                    Code:{' '}
                                                                    {
                                                                        institution.code
                                                                    }
                                                                </span>
                                                                <Badge
                                                                    variant={
                                                                        institution.type ===
                                                                        'public'
                                                                            ? 'default'
                                                                            : 'secondary'
                                                                    }
                                                                >
                                                                    {institution.type ===
                                                                    'public'
                                                                        ? 'Public'
                                                                        : 'Private'}
                                                                </Badge>
                                                            </div>
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                {
                                                                    institution
                                                                        .programs
                                                                        .length
                                                                }{' '}
                                                                programs
                                                                available
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {studentSearchResults.length > 0 &&
                            !selectedInstitution && (
                                <div className="mx-auto mt-8 max-w-6xl">
                                    <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
                                        <CardContent className="p-6">
                                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                                Student Search Results (
                                                {studentSearchResults.length}{' '}
                                                found)
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                                Name
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                                Student ID
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                                Year Graduated
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                                Status
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                                Action
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {studentSearchResults.map(
                                                            (
                                                                graduate: Graduate,
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        graduate.id
                                                                    }
                                                                    className="border-b hover:bg-gray-50"
                                                                >
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                                                <User className="h-4 w-4 text-blue-600" />
                                                                            </div>
                                                                            <span className="font-medium">
                                                                                {
                                                                                    graduate.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </td>

                                                                    <td className="px-4 py-3 font-mono text-sm">
                                                                        {
                                                                            graduate.studentId
                                                                        }
                                                                    </td>

                                                                    <td className="px-4 py-3">
                                                                        {
                                                                            graduate.yearGraduated
                                                                        }
                                                                    </td>

                                                                    <td className="px-4 py-3">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={
                                                                                graduate.eligibility === 'Eligible'
                                                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                                                    : 'border-red-200 bg-red-50 text-red-700'
                                                                            }
                                                                        >
                                                                            {graduate.eligibility}
                                                                        </Badge>
                                                                    </td>

                                                                    <td className="px-4 py-3">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                setSelectedGraduate(
                                                                                    graduate,
                                                                                )
                                                                            }
                                                                        >
                                                                            View
                                                                            Details
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                        {!searchTerm &&
                            studentSearchResults.length === 0 &&
                            institutions.length === 0 && (
                                <div className="mt-16 text-center">
                                    <h3 className="mb-6 text-lg font-semibold text-gray-900">
                                        Key Features
                                    </h3>
                                    <div className="flex flex-wrap justify-center gap-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            Real-time Verification
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            Official CHED Database
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            Secure & Authenticated
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            24/7 Accessibility
                                        </div>
                                    </div>
                                </div>
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

                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Available Programs
                            </h3>
                            <div className="grid gap-4">
                                {selectedInstitution.programs.map((program) => (
                                    <Card
                                        key={program.id}
                                        className="cursor-pointer border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
                                        onClick={() =>
                                            handleProgramClick(program)
                                        }
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className="rounded-lg bg-purple-100 p-3">
                                                        <GraduationCap className="h-6 w-6 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            {program.name}
                                                        </h4>
                                                        {program.major && (
                                                            <p className="text-sm text-gray-600">
                                                                Major:{' '}
                                                                {program.major}
                                                            </p>
                                                        )}
                                                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                                                            {program.copNumber && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-gray-600">
                                                                        COP:
                                                                    </span>
                                                                    <span className="font-mono text-green-600">
                                                                        {
                                                                            program.copNumber
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {program.grNumber && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-gray-600">
                                                                        GR:
                                                                    </span>
                                                                    <span className="font-mono text-purple-600">
                                                                        {
                                                                            program.grNumber
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {program.graduates_count !==
                                                                undefined && (
                                                                <span className="text-gray-500">
                                                                    •{' '}
                                                                    {
                                                                        program.graduates_count
                                                                    }{' '}
                                                                    graduates
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}

                    {selectedProgram && selectedProgram.graduates && (
                        <>
                            <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-purple-100 p-3">
                                            <GraduationCap className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {selectedProgram.name}
                                            </h2>
                                            {selectedProgram.major && (
                                                <p className="mt-1 text-gray-600">
                                                    Major:{' '}
                                                    {selectedProgram.major}
                                                </p>
                                            )}
                                            <div className="mt-3 flex flex-wrap items-center gap-4">
                                                {selectedProgram.copNumber && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-green-200 bg-green-50 text-green-700"
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
                                                        className="border-purple-200 bg-purple-50 text-purple-700"
                                                    >
                                                        GR:{' '}
                                                        {
                                                            selectedProgram.grNumber
                                                        }
                                                    </Badge>
                                                )}
                                                {selectedProgram.institution && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
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

                            <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                        Registered Graduates (
                                        {selectedProgram.graduates.length})
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b bg-gray-50/50">
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                        Graduate Name
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                        Student ID
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                        Year Graduated
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                        Board Exam Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedProgram.graduates.map(
                                                    (graduate: Graduate) => (
                                                        <tr
                                                            key={graduate.id}
                                                            className="border-b transition-colors hover:bg-gray-50/50"
                                                        >
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                                                                        <User className="h-5 w-5 text-blue-600" />
                                                                    </div>
                                                                    <span className="font-medium text-gray-900">
                                                                        {
                                                                            graduate.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-4">
                                                                <span className="font-mono text-sm text-gray-600">
                                                                    {
                                                                        graduate.studentId
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-gray-700">
                                                                        {
                                                                            graduate.yearGraduated
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-4">
                                                                <Badge
                                                                    className={
                                                                        graduate.eligibility === 'Eligible'
                                                                            ? 'border-0 bg-green-100 text-green-800'
                                                                            : 'border-0 bg-red-100 text-red-800'
                                                                    }
                                                                >
                                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                    {graduate.eligibility}
                                                                </Badge>
                                                            </td>

                                                            <td className="px-4 py-4">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setSelectedGraduate(
                                                                            graduate,
                                                                        )
                                                                    }
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
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
