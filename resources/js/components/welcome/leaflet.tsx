// resources/js/components/welcome/leaflet.tsx

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface HeiPoint {
    instCode: string;
    instName: string;
    province: string | null;
    municipalityCity: string | null;
    status?: string | null;
    ownershipSector: string | null;   // "PUBLIC" / "PRIVATE"
    ownershipHei_type: string | null; // "SUC", etc.
    latitude: number;
    longitude: number;
}

// Rough center of Region XII
const REGION_12_CENTER: [number, number] = [6.5, 124.5];
const REGION_12_ZOOM = 8;

// Try to guess correct lat/lng from raw x/y
function normalizeCoords(item: any): { lat: number; lng: number } | null {
    const rawX = item.xCoordinate ?? item.longitude ?? item.lng ?? null;
    const rawY = item.yCoordinate ?? item.latitude ?? item.lat ?? null;

    if (rawX == null || rawY == null) return null;

    let lat = Number(rawY);
    let lng = Number(rawX);

    // If this looks wrong, try swapping (some APIs mislabel x/y)
    const inPhilippines = (la: number, ln: number) =>
        la >= 4 && la <= 15 && ln >= 118 && ln <= 128;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    if (!inPhilippines(lat, lng)) {
        // swap
        const lat2 = Number(rawX);
        const lng2 = Number(rawY);

        if (!Number.isFinite(lat2) || !Number.isFinite(lng2)) {
            return null;
        }

        if (inPhilippines(lat2, lng2)) {
            lat = lat2;
            lng = lng2;
        }
    }

    return { lat, lng };
}

// Return stroke/fill colors based on sector
function getMarkerColors(sector: string | null) {
    const normalized = (sector ?? '').toUpperCase();

    if (normalized === 'PUBLIC') {
        // 🔵 Public HEI – blue
        return {
            color: '#1d4ed8',     // blue-700
            fillColor: '#3b82f6', // blue-500
        };
    }

    if (normalized === 'PRIVATE') {
        // 🟠 Private HEI – orange
        return {
            color: '#c2410c',     // orange-700
            fillColor: '#f97316', // orange-500
        };
    }

    // Fallback for unknown/other
    return {
        color: '#6b21a8',     // purple-700
        fillColor: '#a855f7', // purple-500
    };
}

export default function WelcomeLeaflet() {
    const [heis, setHeis] = useState<HeiPoint[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadHeis = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.get('/hei-map');
                const raw = (response.data?.heis ?? []) as any[];

                const parsed: HeiPoint[] = raw
                    .map((item) => {
                        const coords = normalizeCoords(item);
                        if (!coords) return null;

                        return {
                            instCode: String(item.instCode ?? ''),
                            instName: String(item.instName ?? ''),
                            province: item.province ?? null,
                            municipalityCity: item.municipalityCity ?? null,
                            status: item.status ?? null,
                            ownershipSector: item.ownershipSector ?? item.instOwnership ?? null,
                            ownershipHei_type: item.ownershipHei_type ?? null,
                            latitude: coords.lat,
                            longitude: coords.lng,
                        } as HeiPoint;
                    })
                    .filter((v): v is HeiPoint => v !== null && v.instCode !== '');

                if (isMounted) {
                    console.log('HEIs parsed for map:', parsed.length, parsed.slice(0, 5));
                    setHeis(parsed);
                }
            } catch (err) {
                console.error('Failed to load HEI map data:', err);
                if (isMounted) {
                    setError('Unable to load HEI map data at the moment.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadHeis();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-800/90 lg:col-span-8">
            <CardContent className="p-0">
                <div className="relative h-[360px] overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-slate-900 sm:h-[420px] lg:h-[520px]">
                    {/* Map */}
                    <MapContainer
                        center={REGION_12_CENTER}
                        zoom={REGION_12_ZOOM}
                        scrollWheelZoom={true}
                        className="h-full w-full"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        {heis.map((hei) => {
                            const { latitude: lat, longitude: lng } = hei;
                            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

                            const { color, fillColor } = getMarkerColors(hei.ownershipSector);

                            return (
                                <CircleMarker
                                    key={hei.instCode}
                                    center={[lat, lng]}
                                    radius={8}
                                    pathOptions={{
                                        color,
                                        fillColor,
                                        fillOpacity: 0.9,
                                        weight: 2,
                                        fill: true,
                                    }}
                                >
                                    <Popup>
                                        <div className="space-y-1">
                                            <div className="text-sm font-semibold">
                                                {hei.instName}
                                            </div>
                                            {(hei.municipalityCity || hei.province) && (
                                                <div className="text-xs text-gray-600">
                                                    {hei.municipalityCity}
                                                    {hei.municipalityCity && hei.province ? ', ' : ''}
                                                    {hei.province}
                                                </div>
                                            )}
                                            <div className="mt-1 text-[11px] text-gray-500">
                                                Sector:{' '}
                                                {hei.ownershipSector
                                                    ? hei.ownershipSector
                                                    : 'Unknown'}
                                                {hei.ownershipHei_type &&
                                                    ` • ${hei.ownershipHei_type}`}
                                            </div>
                                            <div className="mt-1 text-[11px] text-gray-500">
                                                Code: {hei.instCode}
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>

                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-white/80 dark:bg-gray-900/80">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1 text-center">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Loading HEI map…
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Fetching locations from CHED portal.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error overlay */}
                    {error && !isLoading && (
                        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/85 dark:bg-gray-900/85">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                            <p className="max-w-xs text-center text-sm text-red-600 dark:text-red-300">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Tiny debug badge: how many HEIs are plotted */}
                    {!isLoading && !error && (
                        <div className="pointer-events-none absolute top-3 right-3 z-[1000] rounded-full bg-white/80 px-3 py-1 text-[10px] font-medium text-gray-600 shadow-sm dark:bg-gray-900/80 dark:text-gray-300">
                            {heis.length} HEIs plotted
                        </div>
                    )}

                    {/* Legend (bottom-left, above map) */}
                    <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] w-56 rounded-lg bg-white/90 p-3 text-[11px] shadow-md dark:bg-gray-900/90">
                        <p className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                            Legend
                        </p>
                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded-full border border-blue-700 bg-blue-500" />
                                <span>Public HEI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded-full border border-orange-700 bg-orange-500" />
                                <span>Private HEI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded-full border border-purple-700 bg-purple-500" />
                                <span>Other / Unknown</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
