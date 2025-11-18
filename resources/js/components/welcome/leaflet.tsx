// resources/js/components/welcome/leaflet.tsx

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths so they work with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure default marker icon once
// (TS is fine with this once @types/leaflet is installed or declared)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export interface HeiLocation {
    instCode: string;
    instName: string;
    latitude: number;
    longitude: number;
    ownershipSector?: string | null;
    ownershipHei_type?: string | null;
    province?: string | null;
    municipalityCity?: string | null;
}

interface WelcomeLeafletProps {
    center: { lat: number; lng: number } | null;
    zoom: number;
    heis: HeiLocation[];
    isLoading?: boolean;
    error?: string | null;
    onHeiClick?: (instCode: string) => void;
}

export default function WelcomeLeaflet({
    center,
    zoom,
    heis,
    isLoading = false,
    error,
    onHeiClick,
}: WelcomeLeafletProps) {
    const mapCenter = useMemo(
        () => [center?.lat ?? 6.5, center?.lng ?? 124.5] as [number, number],
        [center],
    );

    const mapZoom = zoom || 8;

    return (
        <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-800/90 lg:col-span-8">
            <CardContent className="p-0">
                <div className="relative h-[360px] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 sm:h-[420px] lg:h-[520px]">
                    {/* Leaflet map */}
                    <MapContainer
                        {...({
                            center: mapCenter,
                            zoom: mapZoom,
                            scrollWheelZoom: true,
                        } as any)}
                        className="h-full w-full"
                    >
                        <TileLayer
                            {...({
                                attribution:
                                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            } as any)}
                        />

                        {heis.map((hei) => (
                            <Marker
                                key={hei.instCode}
                                position={[hei.latitude, hei.longitude]}
                                eventHandlers={
                                    onHeiClick
                                        ? {
                                              click: () => onHeiClick(hei.instCode),
                                          }
                                        : undefined
                                }
                            >
                                <Popup>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">
                                            {hei.instName}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Code:{' '}
                                            <span className="font-mono">{hei.instCode}</span>
                                        </p>
                                        {hei.municipalityCity && (
                                            <p className="text-xs text-gray-600">
                                                {hei.municipalityCity}
                                                {hei.province ? `, ${hei.province}` : ''}
                                            </p>
                                        )}
                                        {hei.ownershipSector && (
                                            <p className="text-xs text-gray-600">
                                                Sector: {hei.ownershipSector}
                                                {hei.ownershipHei_type
                                                    ? ` (${hei.ownershipHei_type})`
                                                    : ''}
                                            </p>
                                        )}

                                        {onHeiClick && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onHeiClick(hei.instCode);
                                                }}
                                                className="mt-2 inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                                            >
                                                Search this HEI
                                            </button>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* subtle grid overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#00000011_1px,transparent_0)] [background-size:22px_22px] dark:opacity-15" />

                    {/* Legend */}
                    <div className="pointer-events-none absolute bottom-4 left-4 w-52 rounded-lg bg-white/90 p-3 text-left text-[11px] shadow-md dark:bg-gray-900/90">
                        <p className="mb-1 font-semibold text-gray-800 dark:text-gray-100">
                            Legend
                        </p>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                            <li>● Public HEI</li>
                            <li>● Private HEI</li>
                            <li>● Satellite Campus</li>
                        </ul>
                        <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-500">
                            Click a marker to view details and search its programs.
                        </p>
                    </div>

                    {/* Status badges */}
                    {isLoading && (
                        <div className="pointer-events-none absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow dark:bg-gray-900/90 dark:text-gray-200">
                            Loading HEI locations…
                        </div>
                    )}

                    {error && (
                        <div className="pointer-events-auto absolute top-4 left-1/2 z-[400] w-[260px] -translate-x-1/2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 shadow dark:bg-red-900/80 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    {/* Empty-state message */}
                    {!isLoading && !error && heis.length === 0 && (
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                            <div className="rounded-full bg-white/90 p-4 shadow-md dark:bg-gray-900/80">
                                <MapPin className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    HEI Map
                                </p>
                                <p className="max-w-xs text-xs text-gray-600 dark:text-gray-400">
                                    No HEI coordinates available yet. Once the API returns
                                    locations, markers will appear here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
