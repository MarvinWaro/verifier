// resources/js/pages/welcome.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import InstitutionResultsList from '@/components/welcome/institution-results-list';
import ProgramsList from '@/components/welcome/programs-list';
import WelcomeLeaflet from '@/components/welcome/leaflet';
import SearchInstitutionCard from '@/components/welcome/search-institution-card';
import PermitDialog from '@/components/welcome/permit-dialog';
import Footer from '@/components/footer';
import Concerns from '@/components/welcome/concerns';
import Notice from '@/components/welcome/notice';
import { useAppearance } from '@/hooks/use-appearance';
import WelcomeNav from '@/components/welcome/welcome-nav';
import { Toaster } from '@/components/ui/sonner';
import axios from 'axios';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// --- Types ---
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
    permitPdfUrl?: string | null;
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
    const canClearCache = true;
    const [isClearingCache, setIsClearingCache] = useState(false);

    const handleClearCache = async () => {
        setIsClearingCache(true);
        try {
            const res = await fetch('/artisan/optimize-clear');
            if (res.ok) {
                toast.success('Cache cleared', {
                    description: 'All application caches have been cleared successfully.',
                });
            } else {
                toast.error('Failed to clear cache', {
                    description: 'Something went wrong. Please try again.',
                });
            }
        } catch {
            toast.error('Failed to clear cache', {
                description: 'Network error. Please check your connection.',
            });
        } finally {
            setIsClearingCache(false);
        }
    };

    // --- State ---
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [institutions, setInstitutions] = useState<Institution[]>([]);

    const [expandedInstitutionCode, setExpandedInstitutionCode] = useState<string | null>(null);
    const [institutionPrograms, setInstitutionPrograms] = useState<Record<string, Program[]>>({});
    const [institutionProgramsLoading, setInstitutionProgramsLoading] = useState<Record<string, boolean>>({});
    const [institutionProgramsError, setInstitutionProgramsError] = useState<Record<string, string | null>>({});

    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [permitDialogOpen, setPermitDialogOpen] = useState(false);

    const [isSearching, setIsSearching] = useState(false);
    const [loadingProgramId, setLoadingProgramId] = useState<number | null>(null);

    const [searchMessage, setSearchMessage] = useState<string | null>(null);
    const [searchMessageType, setSearchMessageType] = useState<'warning' | 'error' | null>(null);

    // Map State
    const [heiMapLoading, setHeiMapLoading] = useState(false);
    const [heiMapError, setHeiMapError] = useState<string | null>(null);
    const [heiMapCenter, setHeiMapCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [heiMapZoom, setHeiMapZoom] = useState<number>(8);
    const [heiLocations, setHeiLocations] = useState<HeiLocation[]>([]);
    const [mapFocusLocation, setMapFocusLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mapFitLocations, setMapFitLocations] = useState<{ lat: number; lng: number }[] | null>(null);

    const { appearance, updateAppearance } = useAppearance();

    // Auto-scroll refs
    const resultsRef = useRef<HTMLDivElement | null>(null);
    const [shouldScrollToResults, setShouldScrollToResults] = useState(false);

    // --- Handlers ---

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
        setMapFocusLocation(null);
        setMapFitLocations(null);
    };

    const handleSearchTermChange = (value: string) => {
        setSearchTerm(value);
        setSearchMessage(null);
        setSearchMessageType(null);
    };

    const scrollToResults = () => {
        if (typeof window === 'undefined' || !resultsRef.current) return;
        const rect = resultsRef.current.getBoundingClientRect();
        const offset = 96;
        const absoluteTop = window.scrollY + rect.top - offset;
        window.scrollTo({ top: absoluteTop, behavior: 'smooth' });
    };

    useEffect(() => {
        if (!shouldScrollToResults) return;
        if (!resultsRef.current) return;
        scrollToResults();
        setShouldScrollToResults(false);
    }, [shouldScrollToResults]);

    // --- API Calls ---

    const loadHeiMap = async () => {
        setHeiMapLoading(true);
        setHeiMapError(null);
        try {
            const response = await axios.get('/hei-map');
            const data = response.data ?? {};
            const centerRaw = data.center ?? {};
            const center = { lat: Number(centerRaw.lat ?? 6.5), lng: Number(centerRaw.lng ?? 124.5) };
            const zoom = Number(data.zoom ?? 8);
            const heisRaw: any[] = Array.isArray(data.heis) ? data.heis : [];

            const normalized: HeiLocation[] = heisRaw
                .map((item) => {
                    const lat = Number(item.latitude ?? item.lat ?? item.xCoordinate ?? NaN);
                    const lng = Number(item.longitude ?? item.lng ?? item.yCoordinate ?? NaN);
                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            setSearchMessage('For institution codes, please enter at least 4 digits (e.g., 1201).');
            setSearchMessageType('warning');
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.post('/api/search-institution', { search: trimmed });
            const result: Institution[] = response.data.institutions ?? [];

            setInstitutions(result);
            setInstitutionPrograms({});
            setInstitutionProgramsLoading({});
            setInstitutionProgramsError({});
            setExpandedInstitutionCode(null);

            if (result.length === 0) {
                setSearchMessage(`No institution found for "${trimmed}". Please check the code or name.`);
                setSearchMessageType('warning');
                setMapFocusLocation(null);
                setMapFitLocations(null);
            } else {
                setShouldScrollToResults(true);

                // Find coordinates for all matched institutions
                const matchedLocations = result
                    .map((inst) => heiLocations.find((h) => h.instCode === inst.code))
                    .filter((h): h is HeiLocation => h !== null && h !== undefined)
                    .map((h) => ({ lat: h.latitude, lng: h.longitude }));

                if (matchedLocations.length > 1) {
                    // Multiple results: fit map to show all of them
                    setMapFocusLocation(null);
                    setMapFitLocations(matchedLocations);
                } else if (matchedLocations.length === 1) {
                    // Single result: fly directly to it
                    setMapFitLocations(null);
                    setMapFocusLocation(matchedLocations[0]);
                }
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
                prev.map((inst) => (inst.code === code ? { ...inst, programs } : inst))
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
            scrollToResults();

            // Focus map on the selected institution
            const matchedHei = heiLocations.find((h) => h.instCode === code);
            if (matchedHei) {
                setMapFitLocations(null);
                setMapFocusLocation({ lat: matchedHei.latitude, lng: matchedHei.longitude });
            }
        }
    };

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

    // --- Theme ---
    const toggleTheme = () => {
        switch (appearance) {
            case 'light': return updateAppearance('dark');
            case 'dark': return updateAppearance('system');
            case 'system': return updateAppearance('light');
            default: return updateAppearance('light');
        }
    };

    const getThemeIcon = () => {
        switch (appearance) {
            case 'light': return { icon: Sun, tooltip: 'Switch to Dark Mode' };
            case 'dark': return { icon: Moon, tooltip: 'Switch to System Mode' };
            case 'system': return { icon: Monitor, tooltip: 'Switch to Light Mode' };
            default: return { icon: Sun, tooltip: 'Toggle theme' };
        }
    };

    const { icon: ThemeIcon, tooltip } = getThemeIcon();

    // Derived State
    const selectedInstitution = expandedInstitutionCode
        ? institutions.find((inst) => inst.code === expandedInstitutionCode) ?? null
        : null;

    const selectedPrograms = selectedInstitution
        ? (institutionPrograms[selectedInstitution.code] ?? selectedInstitution.programs ?? [])
        : [];

    const selectedProgramsLoading = selectedInstitution && institutionProgramsLoading[selectedInstitution.code] === true;
    const selectedProgramsError = selectedInstitution && (institutionProgramsError[selectedInstitution.code] ?? null);

    return (
        <div className="relative min-h-screen bg-gray-50 font-sans dark:bg-gray-950">
            <Toaster />

            <WelcomeNav
                ThemeIcon={ThemeIcon}
                tooltip={tooltip}
                onToggleTheme={toggleTheme}
            />

            <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-5"
                style={{ backgroundImage: 'url(/assets/img/bg-ched.jpg)' }}
            />
            <div className="pointer-events-none absolute inset-0 bg-white/70 dark:bg-gray-950/60" />

            <main className="relative z-10 mx-auto mt-5 w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">

                {/* Important Notice (Concerns) stays at top as requested previously */}
                {/* <div className="mb-6">
                    <Concerns />
                </div> */}

                {/* Map + Search Grid */}
                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
                    <WelcomeLeaflet
                        center={heiMapCenter}
                        zoom={heiMapZoom}
                        heis={heiLocations}
                        isLoading={heiMapLoading}
                        error={heiMapError}
                        onHeiClick={handleHeiMarkerClick}
                        focusLocation={mapFocusLocation}
                        fitLocations={mapFitLocations}
                    />

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

                {/* Loading Skeleton */}
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
                                        <div key={i} className="flex items-start gap-4 rounded-lg border bg-white/80 p-4 dark:border-gray-800 dark:bg-gray-900/80">
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

                {/* Results Area */}
                {institutions.length > 0 && (
                    <div ref={resultsRef} className="mt-8">
                        <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-900/95">
                            <CardContent className="p-6 sm:p-8">
                                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Search Results</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {institutions.length} institution{institutions.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                </div>

                                {/* ✅ MOVED HERE: URGENT NOTICE (RED)
                                    Inside the card content, full width, below the results header.
                                */}

                                <div className="mb-6">
                                    <Concerns />
                                </div>
                                {/* <div className="mb-6">
                                    <Notice />
                                </div> */}

                                <div className="grid gap-6 lg:grid-cols-12 lg:h-[460px]">
                                    {/* Left: Institution List */}
                                    <div className="min-w-0 lg:col-span-6 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden lg:pr-2">
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
                                    </div>

                                    {/* Right: Programs Panel */}
                                    <div className="min-w-0 mt-4 lg:col-span-6 lg:mt-0 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden lg:pl-2">
                                        {!selectedInstitution ? (
                                            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400">
                                                Select an institution on the left to view its programs and permits here.
                                            </div>
                                        ) : (
                                            <Card className="border border-gray-100 bg-white/95 shadow-md dark:border-gray-800 dark:bg-gray-900/95">
                                                <CardContent className="p-5 sm:p-6">
                                                    <div className="mb-3">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Programs for</p>
                                                        <h3 className="mt-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                                                            {selectedInstitution.name}
                                                        </h3>
                                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-medium dark:bg-gray-800">
                                                                UII: <span className="ml-1 font-mono">{selectedInstitution.code}</span>
                                                            </span>
                                                            <span className="inline-flex items-center rounded-md bg-gray-900 px-2 py-0.5 font-medium text-white dark:bg-gray-100 dark:text-gray-900">
                                                                {selectedInstitution.type === 'public' ? 'Public Institution' : 'Private Institution'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="font-semibold">Available Programs</span>
                                                        <span>{selectedPrograms ? selectedPrograms.length : 0} program{selectedPrograms && selectedPrograms.length !== 1 ? 's' : ''}</span>
                                                    </div>

                                                    {selectedProgramsLoading ? (
                                                        <div className="space-y-3">
                                                            {[1, 2, 3].map((i) => (
                                                                <div key={i} className="rounded-lg border bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-800/80">
                                                                    <div className="flex items-start gap-4">
                                                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                                                        <div className="flex-1 space-y-2">
                                                                            <Skeleton className="h-4 w-2/3" />
                                                                            <Skeleton className="h-3 w-1/3" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : selectedProgramsError ? (
                                                        <p className="text-sm text-red-600 dark:text-red-400">{selectedProgramsError}</p>
                                                    ) : !selectedPrograms || selectedPrograms.length === 0 ? (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">No programs available for this institution.</p>
                                                    ) : (
                                                        <ProgramsList
                                                            programs={selectedPrograms}
                                                            onProgramClick={handleProgramClick}
                                                            loadingProgramId={loadingProgramId}
                                                            showHeader={false}
                                                            canClearCache={canClearCache}
                                                            onClearCache={handleClearCache}
                                                            isClearingCache={isClearingCache}
                                                        />
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div id="about" className="mt-10">
                    <Footer />
                </div>
            </main>

            {/* Dialog handles the PDF and details */}
            <PermitDialog
                open={permitDialogOpen && !!selectedProgram}
                program={selectedProgram}
                onOpenChange={(open) => {
                    setPermitDialogOpen(open);
                    if (!open) setSelectedProgram(null);
                }}
            />
        </div>
    );
}
