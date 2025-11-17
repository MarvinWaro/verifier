import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import InstitutionResultsList from '@/components/welcome/institution-results-list';
import ProgramsList from '@/components/welcome/programs-list';
import Footer from '@/components/footer';
import { useAppearance } from '@/hooks/use-appearance';
import axios from 'axios';
import {
    Building2,
    ChevronRight,
    GraduationCap,
    School,
    Search,
    Sun,
    Moon,
    Monitor,
    Loader2,
    MapPin,
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
        id: number | null;
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
    id: number | null;
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
    id: number | null;
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
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [loadingProgramId, setLoadingProgramId] = useState<number | null>(null);
    const [loadingPrograms, setLoadingPrograms] = useState(false);

    const [searchMessage, setSearchMessage] = useState<string | null>(null);
    const [searchMessageType, setSearchMessageType] = useState<'warning' | 'error' | null>(
        null
    );

    const { appearance, updateAppearance } = useAppearance();

    const resetFilters = () => {
        setSelectedInstitution(null);
        setSelectedProgram(null);
        setSelectedGraduate(null);
        setInstitutions([]);
    };

    const handleInstitutionSearch = async () => {
        // reset message every search
        setSearchMessage(null);
        setSearchMessageType(null);

        const trimmed = searchTerm.trim();

        // 1. empty input
        if (!trimmed) {
            setInstitutions([]);
            setSearchMessage('Please enter an institution code or name to search.');
            setSearchMessageType('warning');
            return;
        }

        // 2. if it looks like a numeric code, require at least 4 digits (e.g., 1201)
        const isNumeric = /^\d+$/.test(trimmed);
        if (isNumeric && trimmed.length < 4) {
            setInstitutions([]);
            setSearchMessage(
                'For institution codes, please enter at least 4 digits (e.g., 1201).'
            );
            setSearchMessageType('warning');
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.post('/api/search-institution', {
                search: trimmed,
            });

            console.log('Search response:', response.data);
            const result: Institution[] = response.data.institutions ?? [];
            setInstitutions(result);

            if (result.length === 0) {
                setSearchMessage(
                    `No institution found for "${trimmed}". Please check the code or name.`
                );
                setSearchMessageType('warning');
            } else {
                setSearchMessage(null);
                setSearchMessageType(null);
            }
        } catch (error) {
            console.error('Search failed:', error);
            setSearchMessage('Search failed. Please try again in a moment.');
            setSearchMessageType('error');
        } finally {
            setIsSearching(false);
        }
    };

    const handleInstitutionClick = async (institution: Institution) => {
        setLoadingPrograms(true);
        try {
            const response = await axios.get(
                `/api/institution/${institution.code}/programs`
            );

            const institutionWithPrograms = {
                ...institution,
                programs: response.data.programs,
            };

            setSelectedInstitution(institutionWithPrograms);
        } catch (error) {
            console.error('Failed to load programs:', error);
            alert('Failed to load programs. Please try again.');
            setSelectedInstitution(institution);
        } finally {
            setLoadingPrograms(false);
        }
    };

    const handleProgramClick = async (program: Program) => {
        if (!program.id) {
            setSelectedProgram(program);
            return;
        }

        setLoadingProgramId(program.id);
        try {
            const response = await axios.get(`/api/program/${program.id}`);
            setSelectedProgram(response.data.program);
        } catch (error) {
            console.error('Failed to load program:', error);
            alert('Failed to load program details. Please try again.');
        } finally {
            setLoadingProgramId(null);
        }
    };

    const toggleTheme = () => {
        switch (appearance) {
            case 'light':
                return updateAppearance('dark');
            case 'dark':
                return updateAppearance('system');
            case 'system':
                return updateAppearance('light');
            default:
                return updateAppearance('light');
        }
    };

    const getThemeIcon = () => {
        switch (appearance) {
            case 'light':
                return { icon: Sun, tooltip: 'Switch to Dark Mode' };
            case 'dark':
                return { icon: Moon, tooltip: 'Switch to System Mode' };
            case 'system':
                return { icon: Monitor, tooltip: 'Switch to Light Mode' };
            default:
                return { icon: Sun, tooltip: 'Toggle theme' };
        }
    };

    const { icon: ThemeIcon, tooltip } = getThemeIcon();

    return (
        <div className="relative min-h-screen overflow-hidden bg-gray-50 font-sans dark:bg-gray-900">
            {/* background layers */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-18 dark:opacity-10"
                style={{ backgroundImage: 'url(/assets/img/bg-ched.jpg)' }}
            />
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/65" />

            {/* header */}
            <header className="absolute top-0 right-0 z-20 p-6">
                <div className="flex items-center gap-4">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleTheme}
                                    className="rounded-full bg-white p-2 shadow-sm transition-all hover:bg-gray-100 hover:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700"
                                    aria-label="Toggle theme"
                                >
                                    <ThemeIcon className="h-5 w-5 text-gray-700 transition-transform hover:rotate-12 dark:text-gray-200" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <a
                        href="/login"
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-100 hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        Log in
                    </a>
                </div>
            </header>

            {/* =======================
                LANDING: MAP + SEARCH
               ======================= */}
            {!selectedInstitution && !selectedProgram && (
                <div className="relative z-10 flex min-h-screen flex-col px-4 pt-8 pb-16 sm:px-6 lg:px-8">
                    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
                        {/* Branding */}
                        <div className="mb-8 pt-4 text-center lg:text-left">
                            <div className="mb-4 flex justify-center lg:justify-start">
                                <div className="rounded-full bg-white/50 p-2 shadow-lg dark:bg-gray-800/50">
                                    <img
                                        src="/assets/img/ched-logo.png"
                                        alt="CHED Logo"
                                        className="h-20 w-20 object-contain drop-shadow-md"
                                    />
                                </div>
                            </div>
                            <h1 className="mb-1 text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">
                                Commission on Higher Education
                            </h1>
                            <p className="mt-1 mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                Regional Office XII
                            </p>
                            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-300 md:text-5xl">
                                CHECK with CHED
                            </h2>
                            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
                                Verify institutional programs and permits
                            </p>
                        </div>

                        {/* grid: map (8) + search (4) */}
                        <div className="mt-2 flex-1">
                            <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
                                {/* Map placeholder – 8/12 */}
                                <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-800/90 lg:col-span-8">
                                    <CardContent className="p-0">
                                        <div className="relative h-[360px] rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-sky-100 via-blue-100 to-blue-200 dark:border-gray-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:h-[420px] lg:h-[520px]">
                                            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,#00000011_1px,transparent_0)] [background-size:22px_22px] dark:opacity-30" />
                                            <div className="relative flex h-full flex-col items-center justify-center gap-4 text-center">
                                                <div className="rounded-full bg-white/90 p-4 shadow-md dark:bg-gray-900/80">
                                                    <MapPin className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        HEI Map Placeholder
                                                    </p>
                                                    <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
                                                        An interactive Leaflet map showing Higher Education
                                                        Institutions in Region XII will appear here.
                                                    </p>
                                                </div>
                                                <p className="mt-2 rounded-full bg-white/80 px-4 py-1 text-xs font-medium uppercase tracking-wide text-blue-700 shadow-sm dark:bg-gray-900/80 dark:text-blue-300">
                                                    Map coming soon – frontend layout ready
                                                </p>
                                            </div>

                                            <div className="pointer-events-none absolute bottom-4 left-4 w-48 rounded-lg bg-white/90 p-3 text-left text-[11px] shadow-md dark:bg-gray-900/90">
                                                <p className="mb-1 font-semibold text-gray-800 dark:text-gray-100">
                                                    Legend (sample)
                                                </p>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                                                    <li>● Public HEI</li>
                                                    <li>● Private HEI</li>
                                                    <li>● Satellite Campus</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Search card – 4/12 */}
                                <div className="flex flex-col gap-4 lg:col-span-4">
                                    <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md transition-all hover:shadow-3xl dark:bg-gray-800/90">
                                        <CardContent className="p-6 sm:p-8">
                                            <div className="mb-6 flex items-center gap-3">
                                                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
                                                    <Building2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Search by Institution
                                                    </h2>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Find schools and programs offered by educational
                                                        institutions
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-stretch gap-3">
                                                <div className="relative flex-1">
                                                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 dark:bg-gray-700/60">
                                                            <Search className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                                                        </div>
                                                    </div>

                                                    <Input
                                                        type="text"
                                                        placeholder="Enter institution code or name..."
                                                        value={searchTerm}
                                                        onChange={(e) => {
                                                            setSearchTerm(e.target.value);
                                                            // clear message while typing
                                                            setSearchMessage(null);
                                                            setSearchMessageType(null);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleInstitutionSearch();
                                                        }}
                                                        className="h-14 rounded-full border border-gray-200 bg-white pl-16 pr-4 text-base shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-800/90 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500"
                                                        disabled={isSearching}
                                                    />
                                                </div>

                                                <Button
                                                    onClick={handleInstitutionSearch}
                                                    className="h-14 rounded-full bg-blue-600 px-8 text-base font-semibold shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                                                    disabled={isSearching}
                                                >
                                                    {isSearching ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                            Searching...
                                                        </>
                                                    ) : (
                                                        'Search'
                                                    )}
                                                </Button>

                                                {/* Inline feedback / validation */}
                                                {searchMessage && (
                                                    <div
                                                        className={`mt-1 rounded-lg border px-4 py-3 text-sm ${
                                                            searchMessageType === 'error'
                                                                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-900/30 dark:text-red-200'
                                                                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/30 dark:text-amber-200'
                                                        }`}
                                                    >
                                                        {searchMessage}
                                                    </div>
                                                )}
                                            </div>

                                            {institutions.length > 0 && (
                                                <div className="mt-5 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-4 transition-all dark:border-blue-700 dark:bg-blue-900/30">
                                                    <div className="flex items-center gap-2">
                                                        <div className="rounded-full bg-blue-600 p-1 dark:bg-blue-500">
                                                            <svg
                                                                className="h-4 w-4 text-white"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                                            Found {institutions.length} institution
                                                            {institutions.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setInstitutions([]);
                                                            setSearchMessage(null);
                                                            setSearchMessageType(null);
                                                        }}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800"
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Full-width results under the grid */}
                            {institutions.length > 0 && !selectedInstitution && (
                                <div className="mt-8">
                                    <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-800/95">
                                        <CardContent className="p-6 sm:p-8">
                                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                        Search Results
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {institutions.length} institution
                                                        {institutions.length !== 1 ? 's' : ''} found
                                                    </p>
                                                </div>
                                            </div>

                                            <InstitutionResultsList
                                                institutions={institutions}
                                                onSelectInstitution={handleInstitutionClick}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    <Footer />
                </div>
            )}

            {/* =======================
                DETAILS VIEW (unchanged)
               ======================= */}
            {(selectedInstitution || selectedProgram) && (
                <>
                    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                resetFilters();
                                setSearchTerm('');
                                setSearchMessage(null);
                                setSearchMessageType(null);
                            }}
                            className="mb-6 transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            ← Back to Search
                        </Button>

                        <Card className="mb-6 border-0 bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:bg-gray-800/90">
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <button
                                        onClick={resetFilters}
                                        className="font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        All Institutions
                                    </button>
                                    {selectedInstitution && (
                                        <>
                                            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <button
                                                onClick={() => {
                                                    setSelectedProgram(null);
                                                    setSelectedGraduate(null);
                                                }}
                                                className="font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {selectedInstitution.name}
                                            </button>
                                        </>
                                    )}
                                    {selectedProgram && (
                                        <>
                                            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {selectedProgram.name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {selectedInstitution && !selectedProgram && (
                            <>
                                <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-gray-800/90">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/40">
                                                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {selectedInstitution.name}
                                                </h2>
                                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                        Code: {selectedInstitution.code}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            selectedInstitution.type === 'public'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="dark:bg-gray-700 dark:text-gray-200"
                                                    >
                                                        {selectedInstitution.type === 'public'
                                                            ? 'Public Institution'
                                                            : 'Private Institution'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {loadingPrograms ? (
                                    <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-800/90">
                                        <CardContent className="p-12">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                                                <p className="text-center text-gray-600 dark:text-gray-400">
                                                    Loading programs...
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <ProgramsList
                                        programs={selectedInstitution.programs}
                                        onProgramClick={handleProgramClick}
                                        loadingProgramId={loadingProgramId}
                                    />
                                )}
                            </>
                        )}

                        {selectedProgram && (
                            <>
                                <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:bg-gray-800/90">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/40">
                                                <GraduationCap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {selectedProgram.name}
                                                </h2>
                                                {selectedProgram.major && (
                                                    <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">Major:</span>{' '}
                                                        {selectedProgram.major}
                                                    </p>
                                                )}
                                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                                    {selectedProgram.copNumber && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                        >
                                                            <span className="font-medium">COP:</span>{' '}
                                                            <span className="ml-1 font-mono">
                                                                {selectedProgram.copNumber}
                                                            </span>
                                                        </Badge>
                                                    )}
                                                    {selectedProgram.grNumber && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                        >
                                                            <span className="font-medium">GR:</span>{' '}
                                                            <span className="ml-1 font-mono">
                                                                {selectedProgram.grNumber}
                                                            </span>
                                                        </Badge>
                                                    )}
                                                    {selectedProgram.institution && (
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                            <School className="h-4 w-4" />
                                                            <span>
                                                                {selectedProgram.institution.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-800/90">
                                    <CardContent className="p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Program Permit Document
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className="dark:border-gray-600 dark:text-gray-300"
                                            >
                                                {selectedProgram.copNumber
                                                    ? 'COPC Document'
                                                    : 'GR Document'}
                                            </Badge>
                                        </div>

                                        <div className="relative min-h-[600px] overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-900 dark:to-gray-800">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                                            <div className="relative flex h-[600px] flex-col items-center justify-center p-8 text-center">
                                                <div className="mb-6 animate-pulse rounded-full bg-blue-100 p-6 dark:bg-blue-900/30">
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

                                                <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                                    Permit Document Preview
                                                </h4>
                                                <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
                                                    {selectedProgram.copNumber
                                                        ? `COPC Number: ${selectedProgram.copNumber}`
                                                        : `GR Number: ${selectedProgram.grNumber}`}
                                                </p>

                                                <div className="mb-6 w-full max-w-md space-y-3 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800/90">
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
                                                        <Badge
                                                            variant={
                                                                selectedProgram.institution?.type ===
                                                                'public'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className="dark:bg-gray-700 dark:text-gray-200"
                                                        >
                                                            {selectedProgram.institution?.type ===
                                                            'public'
                                                                ? 'Public'
                                                                : 'Private'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-900/30">
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
                                                            The actual permit document (PDF) will be
                                                            displayed here once uploaded to the system.
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

                    <Footer />
                </>
            )}
        </div>
    );
}
