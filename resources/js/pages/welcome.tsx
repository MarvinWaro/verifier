import { Building2, GraduationCap, Search, User, X } from 'lucide-react';
import { useState } from 'react';

// TypeScript Interfaces
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

// Dummy Data Structure
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
    const [showStudentSearch, setShowStudentSearch] = useState(false);
    const [studentSearchResults, setStudentSearchResults] = useState<
        Graduate[]
    >([]);

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

    const handleStudentSearch = () => {
        // Get all graduates from all institutions
        const allGraduates: Graduate[] = [];
        dummyData.institutions.forEach((inst) => {
            inst.programs.forEach((prog) => {
                prog.graduates.forEach((grad) => {
                    allGraduates.push(grad);
                });
            });
        });

        // Filter based on student filters
        const results = allGraduates.filter((grad) => {
            const nameParts = grad.name.toLowerCase().split(' ');
            const fullNameLower = grad.name.toLowerCase();

            // Match First Name (first word)
            const matchFirstName =
                !studentFilters.firstName ||
                nameParts[0]?.includes(studentFilters.firstName.toLowerCase());

            // Match Last Name (last word)
            const matchLastName =
                !studentFilters.lastName ||
                nameParts[nameParts.length - 1]?.includes(
                    studentFilters.lastName.toLowerCase(),
                );

            // Match Middle Name (anywhere in the name)
            const matchMiddleName =
                !studentFilters.middleName ||
                fullNameLower.includes(studentFilters.middleName.toLowerCase());

            // Match Extension Name (anywhere in the name)
            const matchExtension =
                !studentFilters.extensionName ||
                fullNameLower.includes(
                    studentFilters.extensionName.toLowerCase(),
                );

            // Match Year Graduated
            const matchYear =
                !studentFilters.yearGraduated ||
                grad.yearGraduated.toString() === studentFilters.yearGraduated;

            // Match Birthdate (if you add it to dummy data later)
            const matchBirthdate = !studentFilters.birthdate;

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-6">
                        {/* PRC Logo - Left */}
                        <div className="animate-fade-in flex-shrink-0">
                            <img
                                src="/assets/img/prc.png"
                                alt="PRC Logo"
                                className="h-20 w-20 object-contain transition-transform duration-300 hover:scale-105"
                            />
                        </div>

                        {/* Website Name - Center */}
                        <div className="animate-slide-up text-center">
                            <h1 className="mb-1 text-3xl font-bold tracking-tight text-gray-900">
                                CHECK with CHED
                            </h1>
                            <p className="text-sm font-medium text-gray-600">
                                Higher Education Institutions Graduates
                            </p>
                        </div>

                        {/* CHED Logo - Right */}
                        <div className="animate-fade-in flex-shrink-0">
                            <img
                                src="/assets/img/ched-logo.png"
                                alt="CHED Logo"
                                className="h-20 w-20 object-contain transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Search Section */}
                <div className="mb-4 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center gap-2">
                        <Search className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Search Institution
                        </h2>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by institution code or name..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                resetFilters();
                            }}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {searchTerm && (
                        <div className="mt-2 text-sm text-gray-600">
                            Found {filteredInstitutions.length} institution(s)
                        </div>
                    )}
                </div>

                {/* Student Search Filter Section - ALWAYS VISIBLE */}
                <div className="mb-6 rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-md">
                    <div className="mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <h3 className="text-md font-semibold text-gray-800">
                            Search for a particular student? Use the fields
                            below
                        </h3>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Dela Cruz"
                                value={studentFilters.lastName}
                                onChange={(e) =>
                                    setStudentFilters({
                                        ...studentFilters,
                                        lastName: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                First Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Juan"
                                value={studentFilters.firstName}
                                onChange={(e) =>
                                    setStudentFilters({
                                        ...studentFilters,
                                        firstName: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Middle Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Santos"
                                value={studentFilters.middleName}
                                onChange={(e) =>
                                    setStudentFilters({
                                        ...studentFilters,
                                        middleName: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Extension Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Jr., Sr., III"
                                value={studentFilters.extensionName}
                                onChange={(e) =>
                                    setStudentFilters({
                                        ...studentFilters,
                                        extensionName: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Birthdate
                            </label>
                            <input
                                type="date"
                                value={studentFilters.birthdate}
                                onChange={(e) =>
                                    setStudentFilters({
                                        ...studentFilters,
                                        birthdate: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Year Graduated
                            </label>
                            <input
                                type="number"
                                placeholder="e.g., 2023"
                                value={studentFilters.yearGraduated}
                                onChange={(e) =>
                                    setStudentFilters({
                                        ...studentFilters,
                                        yearGraduated: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleStudentSearch}
                            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white shadow-md transition-colors hover:bg-blue-700 hover:shadow-lg"
                        >
                            <div className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Search Student
                            </div>
                        </button>
                        <button
                            onClick={clearStudentFilters}
                            className="rounded-lg bg-gray-200 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                        >
                            Clear Filters
                        </button>
                    </div>

                    {studentSearchResults.length > 0 && (
                        <div className="mt-4 rounded-lg border border-green-300 bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
                            ✓ Found {studentSearchResults.length} matching
                            student(s)
                        </div>
                    )}
                </div>

                {/* Student Search Results */}
                {studentSearchResults.length > 0 && (
                    <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-md">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Student Search Results
                            </h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Graduate Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Student ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Year Graduated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Board Exam Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {studentSearchResults.map(
                                    (graduate: Graduate) => (
                                        <tr
                                            key={graduate.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {graduate.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-600">
                                                {graduate.studentId}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                                                {graduate.yearGraduated}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs leading-5 font-semibold text-green-800">
                                                    {graduate.eligibility}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <button
                                                    onClick={() =>
                                                        setSelectedGraduate(
                                                            graduate,
                                                        )
                                                    }
                                                    className="font-medium text-blue-600 hover:text-blue-900"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Breadcrumb Navigation */}
                {(selectedInstitution || selectedProgram) && (
                    <div className="mb-6 flex items-center gap-2 rounded-lg bg-blue-50 p-4 text-sm">
                        <button
                            onClick={resetFilters}
                            className="font-medium text-blue-600 hover:text-blue-800"
                        >
                            All Institutions
                        </button>
                        {selectedInstitution && (
                            <>
                                <span className="text-gray-400">/</span>
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
                                <span className="text-gray-400">/</span>
                                <span className="font-medium text-gray-700">
                                    {selectedProgram.name}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* Content Area */}
                {!selectedInstitution ? (
                    /* Institution List */
                    <div className="grid gap-4">
                        {filteredInstitutions.map((institution) => (
                            <div
                                key={institution.id}
                                onClick={() =>
                                    setSelectedInstitution(institution)
                                }
                                className="cursor-pointer rounded-lg border-2 border-transparent bg-white p-6 shadow-md transition-shadow hover:border-blue-300 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-blue-100 p-3">
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {institution.name}
                                                </h3>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                        institution.type ===
                                                        'public'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}
                                                >
                                                    {institution.type ===
                                                    'public'
                                                        ? 'Public'
                                                        : 'Private'}
                                                </span>
                                            </div>
                                            <p className="mb-2 text-sm text-gray-600">
                                                Code: {institution.code}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {institution.programs.length}{' '}
                                                programs available
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !selectedProgram ? (
                    /* Program List */
                    <div>
                        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="mb-1 text-xl font-bold text-gray-900">
                                        {selectedInstitution.name}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Code: {selectedInstitution.code}
                                    </p>
                                    <span
                                        className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                                            selectedInstitution.type ===
                                            'public'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-purple-100 text-purple-800'
                                        }`}
                                    >
                                        {selectedInstitution.type === 'public'
                                            ? 'Public Institution'
                                            : 'Private Institution'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Available Programs
                        </h3>
                        <div className="grid gap-4">
                            {selectedInstitution.programs.map(
                                (program: Program) => (
                                    <div
                                        key={program.id}
                                        onClick={() =>
                                            setSelectedProgram(program)
                                        }
                                        className="cursor-pointer rounded-lg border-2 border-transparent bg-white p-6 shadow-md transition-shadow hover:border-blue-300 hover:shadow-lg"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-lg bg-purple-100 p-3">
                                                <GraduationCap className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="mb-2 text-lg font-semibold text-gray-900">
                                                    {program.name}
                                                </h4>
                                                <div className="flex items-center gap-4 text-sm">
                                                    {program.copNumber && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium text-gray-700">
                                                                COP Number:
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
                                                            <span className="font-medium text-gray-700">
                                                                GR Number:
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
                                                            program.graduates
                                                                .length
                                                        }{' '}
                                                        graduates
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                ) : (
                    /* Graduate List */
                    <div>
                        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-purple-100 p-3">
                                    <GraduationCap className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="mb-2 text-xl font-bold text-gray-900">
                                        {selectedProgram.name}
                                    </h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        {selectedProgram.copNumber && (
                                            <div>
                                                <span className="font-medium">
                                                    COP Number:
                                                </span>
                                                <span className="ml-1 font-mono text-green-600">
                                                    {selectedProgram.copNumber}
                                                </span>
                                            </div>
                                        )}
                                        {selectedProgram.grNumber && (
                                            <div>
                                                <span className="font-medium">
                                                    GR Number:
                                                </span>
                                                <span className="ml-1 font-mono text-purple-600">
                                                    {selectedProgram.grNumber}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Registered Graduates
                        </h3>
                        <div className="overflow-hidden rounded-lg bg-white shadow-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Graduate Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Student ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Year Graduated
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Board Exam Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {selectedProgram.graduates.map(
                                        (graduate: Graduate) => (
                                            <tr
                                                key={graduate.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                            <User className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {graduate.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-600">
                                                    {graduate.studentId}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600">
                                                    {graduate.yearGraduated}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs leading-5 font-semibold text-green-800">
                                                        {graduate.eligibility}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedGraduate(
                                                                graduate,
                                                            )
                                                        }
                                                        className="font-medium text-blue-600 hover:text-blue-900"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Graduate Details Modal */}
                {selectedGraduate && selectedProgram && selectedInstitution && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
                            <div className="p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Graduate Details
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setSelectedGraduate(null)
                                        }
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="mb-6 flex items-center justify-center">
                                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
                                            <User className="h-12 w-12 text-blue-600" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Full Name
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {selectedGraduate.name}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Student ID
                                            </label>
                                            <p className="font-mono text-gray-900">
                                                {selectedGraduate.studentId}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Year Graduated
                                            </label>
                                            <p className="text-gray-900">
                                                {selectedGraduate.yearGraduated}
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Program
                                            </label>
                                            <p className="text-gray-900">
                                                {selectedProgram.name}
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Institution
                                            </label>
                                            <p className="text-gray-900">
                                                {selectedInstitution.name}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Institution Code
                                            </label>
                                            <p className="font-mono text-gray-900">
                                                {selectedInstitution.code}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Institution Type
                                            </label>
                                            <span
                                                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                                                    selectedInstitution.type ===
                                                    'public'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}
                                            >
                                                {selectedInstitution.type ===
                                                'public'
                                                    ? 'Public'
                                                    : 'Private'}
                                            </span>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                {selectedProgram.copNumber
                                                    ? 'COP Number'
                                                    : 'GR Number'}
                                            </label>
                                            <p
                                                className={`font-mono ${selectedProgram.copNumber ? 'text-green-600' : 'text-purple-600'}`}
                                            >
                                                {selectedProgram.copNumber ||
                                                    selectedProgram.grNumber}
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                PRC Board Exam Eligibility
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                                                    {
                                                        selectedGraduate.eligibility
                                                    }
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    - Can take the board
                                                    examination
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() =>
                                            setSelectedGraduate(null)
                                        }
                                        className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
