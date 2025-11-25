// resources/js/pages/welcome.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import InstitutionResultsList from '@/components/welcome/institution-results-list';
import WelcomeLeaflet from '@/components/welcome/leaflet';
import SearchInstitutionCard from '@/components/welcome/search-institution-card';
import PermitDialog from '@/components/welcome/permit-dialog';
import Footer from '@/components/footer';
import { useAppearance } from '@/hooks/use-appearance';
import WelcomeNav from '@/components/welcome/welcome-nav';
import axios from 'axios';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface HeiLocation {
    instCode: string;
    instName: string;
    latitude: number;
    longitude: number;
    ownershipSector?: string | null;
    ownershipHei_type?: string | null;
    province?: string | null;
    municipalityCity?: string | null;
}

interface Props {
    stats: {
        institutions: number;
        programs: number;
    };
}

export default function PRCCheckLanding({ stats }: Props) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [institutions, setInstitutions] = useState<Institution[]>([]);

    const [expandedInstitutionCode, setExpandedInstitutionCode] =
        useState<string | null>(null);
    const [institutionPrograms, setInstitutionPrograms] = useState<
        Record<string, Program[]>
    >({});
    const [institutionProgramsLoading, setInstitutionProgramsLoading] =
        useState<Record<string, boolean>>({});
    const [institutionProgramsError, setInstitutionProgramsError] = useState<
        Record<string, string | null>
    >({});

    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [permitDialogOpen, setPermitDialogOpen] = useState(false);

    const [isSearching, setIsSearching] = useState(false);
    const [loadingProgramId, setLoadingProgramId] = useState<number | null>(null);

    const [searchMessage, setSearchMessage] = useState<string | null>(null);
    const [searchMessageType, setSearchMessageType] = useState<
        'warning' | 'error' | null
    >(null);

    const [heiMapLoading, setHeiMapLoading] = useState(false);
    const [heiMapError, setHeiMapError] = useState<string | null>(null);
    const [heiMapCenter, setHeiMapCenter] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [heiMapZoom, setHeiMapZoom] = useState<number>(8);
    const [heiLocations, setHeiLocations] = useState<HeiLocation[]>([]);

    const { appearance, updateAppearance } = useAppearance();

    const resetAll = () => {
        setInstitutions([]);
        setExpandedInstitutionCode(null);
        setInstitutionPrograms({});
        setInstitutionProgramsLoading({});
        setInstitutionProgramsError({});
        setSelectedProgram(null);
        setPermitDialogOpen(false);
        setSearchMessage(null);
        setSearchMessageType(null);
    };

    const handleSearchTermChange = (value: string) => {
        setSearchTerm(value);
        setSearchMessage(null);
        setSearchMessageType(null);
    };

    // ------------------------------
    // HEI map load
    // ------------------------------
    const loadHeiMap = async () => {
        setHeiMapLoading(true);
        setHeiMapError(null);

        try {
            const response = await axios.get('/hei-map');
            const data = response.data ?? {};

            const centerRaw = data.center ?? {};
            const center = {
                lat: Number(centerRaw.lat ?? 6.5),
                lng: Number(centerRaw.lng ?? 124.5),
            };

            const zoom = Number(data.zoom ?? 8);
            const heisRaw: any[] = Array.isArray(data.heis) ? data.heis : [];

            const normalized: HeiLocation[] = heisRaw
                .map((item) => {
                    const lat = Number(
                        item.latitude ??
                            item.lat ??
                            item.xCoordinate ??
                            item.yCoordinate ??
                            NaN,
                    );
                    const lng = Number(
                        item.longitude ??
                            item.lng ??
                            item.yCoordinate ??
                            item.xCoordinate ??
                            NaN,
                    );

                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                        return null;
                    }

                    return {
                        instCode: String(item.instCode ?? ''),
                        instName: String(item.instName ?? 'Unknown HEI'),
                        latitude: lat,
                        longitude: lng,
                        ownershipSector: item.ownershipSector ?? item.instOwnership ?? null,
                        ownershipHei_type: item.ownershipHei_type ?? null,
                        province: item.province ?? null,
                        municipalityCity: item.municipalityCity ?? null,
                    } as HeiLocation;
                })
                .filter((v): v is HeiLocation => v !== null && v.instCode !== '');

            setHeiMapCenter(center);
            setHeiMapZoom(zoom);
            setHeiLocations(normalized);
        } catch (error) {
            console.error('Failed to load HEI map:', error);
            setHeiMapError('Unable to load HEI locations at the moment.');
        } finally {
            setHeiMapLoading(false);
        }
    };

    useEffect(() => {
        void loadHeiMap();
    }, []);

    // ------------------------------
    // Search institutions
    // ------------------------------
    const performInstitutionSearch = async (rawSearch: string) => {
        setSearchMessage(null);
        setSearchMessageType(null);
        setSelectedProgram(null);
        setPermitDialogOpen(false);
        setExpandedInstitutionCode(null);

        const trimmed = rawSearch.trim();

        if (!trimmed) {
            setInstitutions([]);
            setSearchMessage('Please enter an institution code or name to search.');
            setSearchMessageType('warning');
            return;
        }

        const isNumeric = /^\d+$/.test(trimmed);
        if (isNumeric && trimmed.length < 4) {
            setInstitutions([]);
            setSearchMessage(
                'For institution codes, please enter at least 4 digits (e.g., 1201).',
            );
            setSearchMessageType('warning');
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.post('/api/search-institution', {
                search: trimmed,
            });

            const result: Institution[] = response.data.institutions ?? [];

            setInstitutions(result);
            setInstitutionPrograms({});
            setInstitutionProgramsLoading({});
            setInstitutionProgramsError({});
            setExpandedInstitutionCode(null);

            if (result.length === 0) {
                setSearchMessage(
                    `No institution found for "${trimmed}". Please check the code or name.`,
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

    const handleInstitutionSearch = () => {
        void performInstitutionSearch(searchTerm);
    };

    const handleHeiMarkerClick = (instCode: string) => {
        setSearchTerm(instCode);
        void performInstitutionSearch(instCode);
    };

    // ------------------------------
    // Load programs
    // ------------------------------
    const loadProgramsForInstitution = async (institution: Institution) => {
        const code = institution.code;

        if (institutionPrograms[code] || institutionProgramsLoading[code]) return;

        try {
            setInstitutionProgramsLoading((s) => ({ ...s, [code]: true }));
            setInstitutionProgramsError((s) => ({ ...s, [code]: null }));

            const response = await axios.get(`/api/institution/${code}/programs`);
            const programs: Program[] = response.data.programs ?? [];

            setInstitutionPrograms((s) => ({ ...s, [code]: programs }));

            setInstitutions((prev) =>
                prev.map((inst) => (inst.code === code ? { ...inst, programs } : inst)),
            );
        } catch (error) {
            console.error('Failed to load programs:', error);
            setInstitutionProgramsError((s) => ({
                ...s,
                [code]: 'Unable to load programs for this institution.',
            }));
        } finally {
            setInstitutionProgramsLoading((s) => ({ ...s, [code]: false }));
        }
    };

    const handleInstitutionToggle = (institution: Institution) => {
        const code = institution.code;
        const isSame = expandedInstitutionCode === code;
        const nextCode = isSame ? null : code;

        setExpandedInstitutionCode(nextCode);
        setSelectedProgram(null);
        setPermitDialogOpen(false);

        if (!isSame) {
            void loadProgramsForInstitution(institution);
        }
    };

    // ------------------------------
    // Program click
    // ------------------------------
    const handleProgramClick = async (program: Program) => {
        if (!program.id) {
            setSelectedProgram(program);
            setPermitDialogOpen(true);
            return;
        }

        setLoadingProgramId(program.id);
        try {
            const response = await axios.get(`/api/program/${program.id}`);
            setSelectedProgram(response.data.program);
            setPermitDialogOpen(true);
        } catch (error) {
            console.error('Failed to load program:', error);
            alert('Failed to load program details. Please try again.');
        } finally {
            setLoadingProgramId(null);
        }
    };

    // ------------------------------
    // Theming
    // ------------------------------
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
        <div className="relative min-h-screen bg-gray-50 font-sans dark:bg-gray-950">
            {/* Top Navbar (extracted component) */}
            <WelcomeNav ThemeIcon={ThemeIcon} tooltip={tooltip} onToggleTheme={toggleTheme} />

            {/* Soft background */}
            <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-5"
                style={{ backgroundImage: 'url(/assets/img/bg-ched.jpg)' }}
            />
            <div className="pointer-events-none absolute inset-0 bg-white/70 dark:bg-gray-950/60" />

            {/* MAIN */}
            <main className="relative z-10 mx-auto mt-5 w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
                {/* grid: map (8) + search (4) */}
                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
                    {/* Map – 8/12 */}
                    <WelcomeLeaflet
                        center={heiMapCenter}
                        zoom={heiMapZoom}
                        heis={heiLocations}
                        isLoading={heiMapLoading}
                        error={heiMapError}
                        onHeiClick={handleHeiMarkerClick}
                    />

                    {/* Search card – 4/12 */}
                    <div className="flex flex-col gap-4 lg:col-span-4">
                        <SearchInstitutionCard
                            searchTerm={searchTerm}
                            onSearchTermChange={handleSearchTermChange}
                            isSearching={isSearching}
                            onSearch={handleInstitutionSearch}
                            searchMessage={searchMessage}
                            searchMessageType={searchMessageType}
                            institutionsCount={institutions.length}
                            onClear={() => {
                                setSearchTerm('');
                                resetAll();
                            }}
                        />
                    </div>
                </div>

                {/* Search results skeleton – when searching and no results yet */}
                {isSearching && institutions.length === 0 && (
                    <div className="mt-8">
                        <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-900/95">
                            <CardContent className="p-6 sm:p-8">
                                <div className="mb-4 space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-28" />
                                </div>

                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4 rounded-lg border bg-white/80 p-4 dark:border-gray-800 dark:bg-gray-900/80"
                                        >
                                            <Skeleton className="h-10 w-10 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-1/2" />
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-3 w-20" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Full-width Results */}
                {institutions.length > 0 && (
                    <div className="mt-8">
                        <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-900/95">
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
                                    expandedInstitutionCode={expandedInstitutionCode}
                                    onToggleInstitution={handleInstitutionToggle}
                                    programsByInstitution={institutionPrograms}
                                    programsLoading={institutionProgramsLoading}
                                    programsError={institutionProgramsError}
                                    onProgramClick={handleProgramClick}
                                    loadingProgramId={loadingProgramId}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* About / Footer anchor */}
                <div id="about" className="mt-10">
                    <Footer />
                </div>
            </main>

            {/* Permit Preview Dialog */}
            <PermitDialog
                open={permitDialogOpen && !!selectedProgram}
                program={selectedProgram}
                onOpenChange={(open) => {
                    setPermitDialogOpen(open);
                    if (!open) {
                        setSelectedProgram(null);
                    }
                }}
            />
        </div>
    );
}
