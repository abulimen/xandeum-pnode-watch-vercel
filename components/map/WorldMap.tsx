/**
 * WorldMap Component - Interactive map visualization using MapLibre GL
 * Supports 3D Globe and 2D Mercator views with individual node markers
 */

'use client';

import { useMemo, memo, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PNode } from '@/types/pnode';
import { Button } from '@/components/ui/button';
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from '@/components/ui/map';
import { Server, Activity, Clock, Shield, ChevronRight, Globe, Map as MapIcon, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Map as MapLibreMap } from 'maplibre-gl';

type Vector3 = [number, number, number];

const DEG2RAD = Math.PI / 180;

function lngLatToVector(lng: number, lat: number): Vector3 {
    const radLng = lng * DEG2RAD;
    const radLat = lat * DEG2RAD;
    const x = Math.cos(radLat) * Math.cos(radLng);
    const y = Math.sin(radLat);
    const z = Math.cos(radLat) * Math.sin(radLng);
    return [x, y, z];
}

function dot(a: Vector3, b: Vector3) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

interface WorldMapProps {
    nodes: PNode[];
    totalNodes?: number;
    isLoadingLocations?: boolean;
}

function WorldMapComponent({ nodes, isLoadingLocations }: WorldMapProps) {
    const router = useRouter();
    const mapRef = useRef<MapLibreMap>(null);
    const [is3D, setIs3D] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [viewVector, setViewVector] = useState<Vector3 | null>(null);

    // Wait for map instance to become available
    useEffect(() => {
        if (mapReady) return;
        let rafId: number;
        const checkMap = () => {
            if (mapRef.current) {
                setMapReady(true);
                return;
            }
            rafId = requestAnimationFrame(checkMap);
        };
        checkMap();
        return () => cancelAnimationFrame(rafId);
    }, [mapReady]);

    // Toggle between Globe (3D) and Mercator (2D) projections
    useEffect(() => {
        const map = mapRef.current as any; // Cast to any to access newer MapLibre features if types are outdated
        if (!map) return;

        if (is3D) {
            if (map.setProjection) {
                map.setProjection({ type: 'globe' });
            }
            // Add atmosphere/fog for realistic 3D effect
            if (map.setFog) {
                try {
                    map.setFog({
                        range: [1.5, 8],
                        color: '#242b4b',
                        'horizon-blend': 0.1,
                        'high-color': '#161b33', // Slightly lighter than space-color
                        'space-color': '#020617', // Match the card background
                        'star-intensity': 0.4
                    });
                } catch (e) {
                    console.error("Error setting fog:", e);
                }
            }
            // Zoom out slightly to see the curve if zoomed in common levels
            if (map.getZoom() < 2.5) map.zoomTo(2.5, { duration: 1500 });
        } else {
            if (map.setProjection) {
                map.setProjection({ type: 'mercator' });
            }
            // Reset/remove fog
            if (map.setFog) {
                try {
                    map.setFog({});
                } catch (e) {
                    console.error("Error clearing fog:", e);
                }
            }
            // Reset rotation/pitch for 2D view
            map.easeTo({ pitch: 0, bearing: 0, duration: 1500 });
        }
    }, [is3D]);

    // Track camera orientation to hide back-facing markers in 3D mode
    useEffect(() => {
        if (!mapReady || !mapRef.current) {
            setViewVector(null);
            return;
        }

        const map = mapRef.current;

        if (!is3D) {
            setViewVector(null);
            return;
        }

        const updateVector = () => {
            const center = map.getCenter();
            setViewVector(lngLatToVector(center.lng, center.lat));
        };

        updateVector();
        map.on('move', updateVector);

        return () => {
            map.off('move', updateVector);
        };
    }, [is3D, mapReady]);

    // Filter nodes with valid coordinates
    const validNodes = useMemo(() => {
        return nodes.filter(n => n.location?.coordinates && n.location.coordinates.lng && n.location.coordinates.lat);
    }, [nodes]);

    const nodesToRender = useMemo(() => {
        if (!is3D || !viewVector) return validNodes;

        return validNodes.filter((node) => {
            const coords = node.location!.coordinates!;
            const nodeVector = lngLatToVector(coords.lng, coords.lat);
            return dot(viewVector, nodeVector) >= 0;
        });
    }, [validNodes, viewVector, is3D]);

    // Handle Reset View
    const handleResetView = () => {
        const map = mapRef.current;
        if (map) {
            map.flyTo({
                center: [0, 20],
                zoom: 1.5,
                pitch: 0,
                bearing: 0,
                essential: true
            });
        }
    };

    return (
        <div className="w-full h-full min-h-[500px] relative bg-background overflow-hidden">
            <Map
                ref={mapRef}
                center={[0, 20]}
                zoom={1.5}
                styles={{ dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json", light: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" }}
                attributionControl={false}
                scrollZoom={false}
                dragRotate={false}
                touchPitch={false}
            >
                {/* Map Controls: 3D Toggle and Reset - Top Right */}
                <div className="absolute top-4 right-4 z-10 flex text-left gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIs3D(!is3D)}
                        className="bg-slate-900/90 backdrop-blur text-slate-200 hover:bg-slate-800 border border-slate-700/50 shadow-lg h-9"
                    >
                        {is3D ? (
                            <>
                                <MapIcon className="w-4 h-4 mr-2" />
                                2D
                            </>
                        ) : (
                            <>
                                <Globe className="w-4 h-4 mr-2" />
                                3D
                            </>
                        )}
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResetView}
                        className="bg-slate-900/90 backdrop-blur text-slate-200 hover:bg-slate-800 border border-slate-700/50 shadow-lg h-9 px-3"
                        title="Reset View"
                    >
                        <Maximize className="w-4 h-4" />
                    </Button>
                </div>

                <MapControls position="bottom-right" showCompass={false} showLocate={false} />

                {/* Render a marker for each node */}
                {nodesToRender.map((node) => (
                    <MapMarker
                        key={node.id}
                        longitude={node.location!.coordinates!.lng}
                        latitude={node.location!.coordinates!.lat}
                    >
                        <MarkerContent>
                            <div className="relative group cursor-pointer">
                                {/* Pulse effect for online nodes */}
                                {node.status === 'online' && (
                                    <div className="absolute -inset-1 bg-emerald-500/30 rounded-full animate-ping opacity-75" />
                                )}
                                {/* Main Dot */}
                                <div className={cn(
                                    "w-3 h-3 rounded-full border border-white/90 shadow-lg transition-transform group-hover:scale-125",
                                    node.status === 'online' ? "bg-emerald-500" :
                                        node.status === 'degraded' ? "bg-amber-500" :
                                            "bg-red-500"
                                )} />
                            </div>
                        </MarkerContent>

                        <MarkerPopup className="p-0 border-none bg-transparent shadow-none max-w-[320px]">
                            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 w-[300px]">
                                {/* Header */}
                                <div className="p-3 border-b border-slate-700/50 bg-slate-800/50 text-left">
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn(
                                            "flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
                                            node.status === 'online' ? "bg-emerald-500/20 text-emerald-500" :
                                                node.status === 'degraded' ? "bg-amber-500/20 text-amber-500" :
                                                    "bg-red-500/20 text-red-500"
                                        )}>
                                            <Server className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-xs text-slate-100 truncate" title={node.id}>
                                                {node.id}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                <span className={cn(
                                                    "w-1 h-1 rounded-full",
                                                    node.status === 'online' ? "bg-emerald-500" :
                                                        node.status === 'degraded' ? "bg-amber-500" :
                                                            "bg-red-500"
                                                )} />
                                                <span className="capitalize">{node.status}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-3 space-y-3 text-left">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-800/20 p-2 rounded-lg">
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
                                                <Activity className="w-3 h-3" />
                                                <span>Uptime</span>
                                            </div>
                                            <div className="text-xs font-semibold text-slate-200">
                                                {node.uptime.toFixed(2)}%
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/20 p-2 rounded-lg">
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
                                                <Clock className="w-3 h-3" />
                                                <span>Latency</span>
                                            </div>
                                            <div className="text-xs font-semibold text-slate-200">
                                                {node.responseTime}ms
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/30">
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
                                            <Shield className="w-3 h-3" />
                                            <span>Location</span>
                                        </div>
                                        <div className="text-xs text-slate-300 truncate">
                                            {node.location?.city || 'Unknown'}, {node.location?.country || 'Unknown'}
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                            {node.location?.coordinates?.lat.toFixed(4)}, {node.location?.coordinates?.lng.toFixed(4)}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-white"
                                        onClick={() => router.push(`/nodes/${node.id}`)}
                                    >
                                        View Details <ChevronRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}
            </Map>
        </div>
    );
}

export const WorldMap = memo(WorldMapComponent);
