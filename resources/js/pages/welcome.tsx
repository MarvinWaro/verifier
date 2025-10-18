import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

// ─────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────
interface Graduate {
    id: number;
    name: string;
    yearGraduated: number;
    studentId: string;
    eligibility: string;
}

interface Program {
    id: number;
    name: string;
    copNumber: string | null;
    grNumber: string | null;
    graduates: Graduate[];
}

interface Institution {
    id: number;
    code: string;
    name: string;
    type: 'public' | 'private';
    programs: Program[];
}

// ─────────────────────────────────────────────
// Dummy Data
// ─────────────────────────────────────────────
const dummyData: { institutions: Institution[] } = {
    institutions: [
        {
            id: 1,
            code: 'INST001',
            name: 'University of the Philippines Manila',
            type: 'public',
            programs: [
                {
                    id: 1,
                    name: 'Bachelor of Science in Nursing (BSN)',
                    copNumber: 'COPC-2023-001',
                    grNumber: null,
                    graduates: [
                        {
                            id: 1,
                            name: 'Maria Clara Santos',
                            yearGraduated: 2023,
                            studentId: '2019-12345',
                            eligibility: 'Eligible',
                        },
                        {
                            id: 2,
                            name: 'Juan Dela Cruz',
                            yearGraduated: 2023,
                            studentId: '2019-12346',
                            eligibility: 'Eligible',
                        },
                        {
                            id: 3,
                            name: 'Ana Marie Reyes',
                            yearGraduated: 2022,
                            studentId: '2018-12347',
                            eligibility: 'Eligible',
                        },
                    ],
                },
                {
                    id: 2,
                    name: 'Bachelor of Science in Pharmacy',
                    copNumber: 'COPC-2023-002',
                    grNumber: null,
                    graduates: [
                        {
                            id: 4,
                            name: 'Pedro Martinez',
                            yearGraduated: 2023,
                            studentId: '2019-22345',
                            eligibility: 'Eligible',
                        },
                        {
                            id: 5,
                            name: 'Sofia Garcia',
                            yearGraduated: 2023,
                            studentId: '2019-22346',
                            eligibility: 'Eligible',
                        },
                    ],
                },
            ],
        },
        {
            id: 2,
            code: 'INST002',
            name: 'Ateneo de Manila University',
            type: 'private',
            programs: [
                {
                    id: 3,
                    name: 'Bachelor of Science in Computer Science (BSCS)',
                    copNumber: null,
                    grNumber: 'GR-2023-ATN-001',
                    graduates: [
                        {
                            id: 6,
                            name: 'Carlos Mendoza',
                            yearGraduated: 2023,
                            studentId: '2019-33345',
                            eligibility: 'Eligible',
                        },
                        {
                            id: 7,
                            name: 'Isabel Torres',
                            yearGraduated: 2023,
                            studentId: '2019-33346',
                            eligibility: 'Eligible',
                        },
                        {
                            id: 8,
                            name: 'Miguel Ramos',
                            yearGraduated: 2022,
                            studentId: '2018-33347',
                            eligibility: 'Eligible',
                        },
                    ],
                },
                {
                    id: 4,
                    name: 'Bachelor of Science in Information Technology (BSIT)',
                    copNumber: null,
                    grNumber: 'GR-2023-ATN-002',
                    graduates: [
                        {
                            id: 9,
                            name: 'Elena Fernandez',
                            yearGraduated: 2023,
                            studentId: '2019-43345',
                            eligibility: 'Eligible',
                        },
                    ],
                },
            ],
        },
        {
            id: 3,
            code: 'INST003',
            name: 'De La Salle University',
            type: 'private',
            programs: [
                {
                    id: 5,
                    name: 'Bachelor of Science in Civil Engineering (BSCE)',
                    copNumber: null,
                    grNumber: 'GR-2023-DLS-001',
                    graduates: [
                        {
                            id: 10,
                            name: 'Roberto Cruz',
                            yearGraduated: 2023,
                            studentId: '2019-53345',
                            eligibility: 'Eligible',
                        },
                        {
                            id: 11,
                            name: 'Carmen Lopez',
                            yearGraduated: 2023,
                            studentId: '2019-53346',
                            eligibility: 'Eligible',
                        },
                    ],
                },
            ],
        },
        {
            id: 4,
            code: 'INST004',
            name: 'Polytechnic University of the Philippines',
            type: 'public',
            programs: [
                {
                    id: 6,
                    name: 'Bachelor of Science in Accountancy (BSA)',
                    copNumber: 'COPC-2023-003',
                    grNumber: null,
                    graduates: [
                        {
                            id: 12,
                            name: 'Andrea Villanueva',
                            yearGraduated: 2023,
                            studentId: '2019-63345',
                            eligibility: 'Eligible',
                        },
                        {
                            id: 13,
                            name: 'Jose Alvarez',
                            yearGraduated: 2022,
                            studentId: '2018-63346',
                            eligibility: 'Eligible',
                        },
                    ],
                },
            ],
        },
    ],
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function PRCCheckLanding() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedInstitution, setSelectedInstitution] =
        useState<Institution | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(
        null,
    );
    const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(
        null,
    );

    // Student Search Filters
    const [studentFilters, setStudentFilters] = useState({
        lastName: '',
        firstName: '',
        middleName: '',
        extensionName: '',
        birthdate: '',
        yearGraduated: '',
    });
    const [studentSearchResults, setStudentSearchResults] = useState<
        Graduate[]
    >([]);

    // Helpers
    const norm = (s: string) => s.trim().toLowerCase();

    // Filter institutions based on search
    const filteredInstitutions = dummyData.institutions.filter(
        (inst) =>
            inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inst.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const resetFilters = () => {
        setSelectedInstitution(null);
        setSelectedProgram(null);
        setSelectedGraduate(null);
    };

    // ── UPDATED: tolerant search (first/last can swap, partials allowed)
    const handleStudentSearch = () => {
        const allGraduates: Graduate[] = [];
        dummyData.institutions.forEach((inst) => {
            inst.programs.forEach((prog) => {
                prog.graduates.forEach((grad) => allGraduates.push(grad));
            });
        });

        const qLast = norm(studentFilters.lastName);
        const qFirst = norm(studentFilters.firstName);
        const qMiddle = norm(studentFilters.middleName);
        const qExt = norm(studentFilters.extensionName);
        const qYear = studentFilters.yearGraduated.trim();
        const qBirth = studentFilters.birthdate.trim(); // not in dummy data yet

        const results = allGraduates.filter((grad) => {
            const full = norm(grad.name);
            const tokens = full.split(/\s+/);
            const firstToken = tokens[0] || '';
            const lastToken = tokens[tokens.length - 1] || '';

            const matchFirstName =
                !qFirst ||
                firstToken.startsWith(qFirst) ||
                full.includes(qFirst);

            const matchLastName =
                !qLast || lastToken.startsWith(qLast) || full.includes(qLast);

            const matchMiddleName = !qMiddle || full.includes(qMiddle);
            const matchExtension = !qExt || full.includes(qExt);

            const matchYear = !qYear || grad.yearGraduated.toString() === qYear;

            const matchBirthdate = !qBirth; // placeholder until birthdate exists

            return (
                matchFirstName &&
                matchLastName &&
                matchMiddleName &&
                matchExtension &&
                matchYear &&
                matchBirthdate
            );
        });

        setStudentSearchResults(results);
    };

    const clearStudentFilters = () => {
        setStudentFilters({
            lastName: '',
            firstName: '',
            middleName: '',
            extensionName: '',
            birthdate: '',
            yearGraduated: '',
        });
        setStudentSearchResults([]);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 via-white to-blue-50">
            {/* Grid Pattern Background */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            ></div>

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 h-96 w-96 animate-pulse rounded-full bg-blue-300 opacity-40 mix-blend-multiply blur-3xl filter"></div>
            <div
                className="absolute top-0 right-0 h-96 w-96 animate-pulse rounded-full bg-indigo-300 opacity-40 mix-blend-multiply blur-3xl filter"
                style={{ animationDelay: '2s' }}
            ></div>
            <div
                className="absolute bottom-0 left-1/2 h-96 w-96 animate-pulse rounded-full bg-blue-200 opacity-40 mix-blend-multiply blur-3xl filter"
                style={{ animationDelay: '4s' }}
            ></div>

            {/* Header */}
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
                                    CHECK with CHED ***
                                </h1>
                                <p className="text-xs text-gray-600">
                                    Higher Education Institution Graduates
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </header>

            {/* Hero Section */}
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

                        {/* Stats Cards */}
                        <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                <CardContent className="p-6 text-center">
                                    <Building2 className="mx-auto mb-3 h-10 w-10 text-blue-600" />
                                    <div className="text-3xl font-bold text-gray-900">
                                        4+
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Verified Institutions
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                <CardContent className="p-6 text-center">
                                    <GraduationCap className="mx-auto mb-3 h-10 w-10 text-purple-600" />
                                    <div className="text-3xl font-bold text-gray-900">
                                        6+
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Academic Programs
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
                                <CardContent className="p-6 text-center">
                                    <Award className="mx-auto mb-3 h-10 w-10 text-green-600" />
                                    <div className="text-3xl font-bold text-gray-900">
                                        13+
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Eligible Graduates
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search Options */}
                        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Institution Search */}
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
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Enter institution code or name..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(
                                                        e.target.value,
                                                    );
                                                    resetFilters();
                                                }}
                                                className="h-12 pl-10 text-base"
                                            />
                                        </div>
                                        {searchTerm && (
                                            <div className="text-sm text-gray-600">
                                                Found{' '}
                                                {filteredInstitutions.length}{' '}
                                                institution(s)
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Student Search */}
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
                                        Directly search for a specific
                                        graduate's information
                                    </p>

                                    <div className="mb-4 grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Last Name"
                                            value={studentFilters.lastName}
                                            onChange={(e) =>
                                                setStudentFilters({
                                                    ...studentFilters,
                                                    lastName: e.target.value,
                                                })
                                            }
                                            className="h-12"
                                        />
                                        <Input
                                            placeholder="First Name"
                                            value={studentFilters.firstName}
                                            onChange={(e) =>
                                                setStudentFilters({
                                                    ...studentFilters,
                                                    firstName: e.target.value,
                                                })
                                            }
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="mb-4 grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Middle Name"
                                            value={studentFilters.middleName}
                                            onChange={(e) =>
                                                setStudentFilters({
                                                    ...studentFilters,
                                                    middleName: e.target.value,
                                                })
                                            }
                                            className="h-10"
                                        />
                                        <Input
                                            placeholder="Extension (Jr., Sr., III)"
                                            value={studentFilters.extensionName}
                                            onChange={(e) =>
                                                setStudentFilters({
                                                    ...studentFilters,
                                                    extensionName:
                                                        e.target.value,
                                                })
                                            }
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="mb-4 grid grid-cols-2 gap-3">
                                        <Input
                                            type="date"
                                            placeholder="Birthdate"
                                            value={studentFilters.birthdate}
                                            onChange={(e) =>
                                                setStudentFilters({
                                                    ...studentFilters,
                                                    birthdate: e.target.value,
                                                })
                                            }
                                            className="h-10"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Year Graduated"
                                            value={studentFilters.yearGraduated}
                                            onChange={(e) =>
                                                setStudentFilters({
                                                    ...studentFilters,
                                                    yearGraduated:
                                                        e.target.value,
                                                })
                                            }
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleStudentSearch}
                                            className="h-12 flex-1 bg-purple-600 text-base hover:bg-purple-700"
                                            disabled={
                                                !studentFilters.lastName &&
                                                !studentFilters.firstName
                                            }
                                        >
                                            <Search className="mr-2 h-4 w-4" />
                                            Search
                                        </Button>
                                        <Button
                                            onClick={clearStudentFilters}
                                            variant="outline"
                                            className="h-12"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                    {studentSearchResults.length > 0 && (
                                        <div className="mt-3 text-sm font-medium text-green-600">
                                            ✓ Found{' '}
                                            {studentSearchResults.length}{' '}
                                            matching student(s)
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Institution Search Results */}
                        {searchTerm && !selectedInstitution && (
                            <div className="mx-auto mt-8 max-w-6xl">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    Search Results
                                </h3>
                                <div className="grid gap-4">
                                    {filteredInstitutions.map((institution) => (
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

                        {/* Student Search Results (from hero view) */}
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
                                                            (graduate) => (
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
                                                                            className="border-green-200 bg-green-50 text-green-700"
                                                                        >
                                                                            {
                                                                                graduate.eligibility
                                                                            }
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

                        {/* Features (only when no queries/results) */}
                        {!searchTerm && studentSearchResults.length === 0 && (
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

            {/* Main Content Area (when institution/program selected) */}
            {(selectedInstitution || selectedProgram) && (
                <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back to Search */}
                    <Button
                        variant="ghost"
                        onClick={() => {
                            resetFilters();
                            setSearchTerm('');
                            clearStudentFilters();
                        }}
                        className="mb-6"
                    >
                        ← Back to Search
                    </Button>

                    {/* Breadcrumb */}
                    {(selectedInstitution || selectedProgram) && (
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
                    )}

                    {/* Student Search Results (also visible in this area) */}
                    {studentSearchResults.length > 0 &&
                        !selectedInstitution && (
                            <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                        Student Search Results (
                                        {studentSearchResults.length} found)
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
                                                    (graduate) => (
                                                        <tr
                                                            key={graduate.id}
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
                                                                    className="border-green-200 bg-green-50 text-green-700"
                                                                >
                                                                    {
                                                                        graduate.eligibility
                                                                    }
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
                        )}

                    {/* Institution List */}
                    {!selectedInstitution && searchTerm && (
                        <div className="grid gap-4">
                            {filteredInstitutions.map((institution) => (
                                <Card
                                    key={institution.id}
                                    className="cursor-pointer border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
                                    onClick={() =>
                                        setSelectedInstitution(institution)
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
                                                        {institution.name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <span>
                                                            Code:{' '}
                                                            {institution.code}
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
                                                            institution.programs
                                                                .length
                                                        }{' '}
                                                        programs available
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Program List */}
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
                                            setSelectedProgram(program)
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
                                                            <span className="text-gray-500">
                                                                •{' '}
                                                                {
                                                                    program
                                                                        .graduates
                                                                        .length
                                                                }{' '}
                                                                graduates
                                                            </span>
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

                    {/* Graduate List */}
                    {selectedProgram && (
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
                                            <div className="mt-3 flex flex-wrap items-center gap-4">
                                                {selectedProgram.copNumber && (
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-green-200 bg-green-50 text-green-700"
                                                        >
                                                            COP:{' '}
                                                            {
                                                                selectedProgram.copNumber
                                                            }
                                                        </Badge>
                                                    </div>
                                                )}
                                                {selectedProgram.grNumber && (
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-purple-200 bg-purple-50 text-purple-700"
                                                        >
                                                            GR:{' '}
                                                            {
                                                                selectedProgram.grNumber
                                                            }
                                                        </Badge>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <School className="h-4 w-4" />
                                                    {selectedInstitution?.name}
                                                </div>
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
                                                    (graduate) => (
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
                                                                <Badge className="border-0 bg-green-100 text-green-800">
                                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                    {
                                                                        graduate.eligibility
                                                                    }
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

            {/* Graduate Details Modal */}
            <Dialog
                open={!!selectedGraduate}
                onOpenChange={() => setSelectedGraduate(null)}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            Graduate Verification Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedGraduate && (
                        <div className="space-y-6">
                            {/* Profile */}
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                                    <User className="h-12 w-12 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {selectedGraduate.name}
                                </h3>
                                <Badge className="mt-2 border-0 bg-green-100 text-green-800">
                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                    PRC Board Exam Eligible
                                </Badge>
                            </div>

                            {/* Details */}
                            <div className="grid gap-6">
                                <Card className="border-gray-200">
                                    <CardContent className="p-4">
                                        <h4 className="mb-3 text-sm font-semibold text-gray-600">
                                            Personal Information
                                        </h4>
                                        <div className="grid gap-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Full Name
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {selectedGraduate.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Student ID
                                                </span>
                                                <span className="font-mono text-sm font-medium">
                                                    {selectedGraduate.studentId}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Year Graduated
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {
                                                        selectedGraduate.yearGraduated
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200">
                                    <CardContent className="p-4">
                                        <h4 className="mb-3 text-sm font-semibold text-gray-600">
                                            Academic Information
                                        </h4>
                                        <div className="grid gap-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Program
                                                </span>
                                                <span className="text-right text-sm font-medium">
                                                    {selectedProgram?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Institution
                                                </span>
                                                <span className="text-right text-sm font-medium">
                                                    {selectedInstitution?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Institution Code
                                                </span>
                                                <span className="font-mono text-sm font-medium">
                                                    {selectedInstitution?.code}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Institution Type
                                                </span>
                                                <Badge
                                                    variant={
                                                        selectedInstitution?.type ===
                                                        'public'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {selectedInstitution?.type ===
                                                    'public'
                                                        ? 'Public'
                                                        : 'Private'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200">
                                    <CardContent className="p-4">
                                        <h4 className="mb-3 text-sm font-semibold text-gray-600">
                                            Certification Details
                                        </h4>
                                        <div className="grid gap-3">
                                            {selectedProgram?.copNumber && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        COP Number
                                                    </span>
                                                    <span className="font-mono text-sm font-medium text-green-600">
                                                        {
                                                            selectedProgram.copNumber
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {selectedProgram?.grNumber && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        GR Number
                                                    </span>
                                                    <span className="font-mono text-sm font-medium text-purple-600">
                                                        {
                                                            selectedProgram.grNumber
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Eligibility Status
                                                </span>
                                                <Badge className="border-0 bg-green-100 text-xs text-green-800">
                                                    {
                                                        selectedGraduate.eligibility
                                                    }
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Verification Notice */}
                            <Card className="border-0 bg-blue-50">
                                <CardContent className="p-4">
                                    <div className="flex gap-3">
                                        <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                        <div className="text-sm text-blue-900">
                                            <p className="mb-1 font-semibold">
                                                Verification Notice
                                            </p>
                                            <p>
                                                This graduate is eligible to
                                                take the PRC board examination
                                                based on CHED's official
                                                records.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
