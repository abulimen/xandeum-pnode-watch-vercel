/**
 * Map Page - Geographic visualization of pNodes
 * Unified Dashboard: 3D Map + Regional Statistics
 */

'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { RefreshBar } from '@/components/layout/RefreshBar';
import { useNodes, useNetworkStats, useNodeLocations } from '@/hooks';
import { RegionGrid } from '@/components/regions/RegionGrid';
import {
    Globe,
    Loader2,
    Server,
    HardDrive,
    Activity,
} from 'lucide-react';
import Link from 'next/link';
import { formatBytes, enrichNodesWithStakingData } from '@/lib/services/analyticsService';

// Dynamic import to avoid SSR issues with react-simple-maps
const WorldMap = dynamic(
    () => import('@/components/map/WorldMap').then(mod => mod.WorldMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-full min-h-[400px] bg-slate-900/50 rounded-lg animate-pulse flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
);

function MapPageContent() {
    const { nodes, isLoading, isFetching, isError, refetch, lastUpdated, responseTime } = useNodes();
    const { issueCount } = useNetworkStats(nodes);
    const searchParams = useSearchParams();
    const countryParam = searchParams.get('country');
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

    // Initial mount effect to handle hydration safe rendering
    useEffect(() => {
        setMounted(true);
        setLastSync(new Date());
    }, []);

    // Enrich nodes with staking data
    const enrichedNodes = useMemo(() => enrichNodesWithStakingData(nodes), [nodes]);

    // Fetch geolocation for ALL nodes
    const { nodesWithLocation, isLoading: geoLoading } = useNodeLocations(enrichedNodes);

    // Update last sync time periodically
    useEffect(() => {
        if (!isLoading && !geoLoading) {
            setLastSync(new Date());
        }
    }, [isLoading, geoLoading, nodes.length]);

    // Calculate stats
    const stats = useMemo(() => {
        const countries = new Set(nodesWithLocation.map(n => n.location?.country).filter(Boolean));
        const totalStorage = nodes.reduce((sum, n) => sum + (n.storage?.total || 0), 0);
        const avgUptime = nodes.length > 0
            ? nodes.reduce((sum, n) => sum + (n.uptime || 0), 0) / nodes.length
            : 0;

        return {
            totalNodes: nodes.length,
            countryCount: countries.size,
            totalStorage,
            avgUptime,
        };
    }, [nodes, nodesWithLocation]);

    // Nodes with coordinates for map
    const nodesWithCoordinates = useMemo(() =>
        nodesWithLocation.filter(n => n.location?.coordinates),
        [nodesWithLocation]
    );

    const handleRegionClick = (country: string) => {
        // Scroll to top to see map
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            <Header issueCount={issueCount} />

            <RefreshBar
                lastUpdated={lastUpdated}
                isFetching={isFetching}
                isError={isError}
                responseTime={responseTime}
                onRefresh={refetch}
            />

            <main className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent bg-background text-foreground">
                {/* Breadcrumb */}
                <div className="container px-4 py-3 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">Dashboard</Link>
                    <span className="mx-2">›</span>
                    <span className="text-foreground">Network Intelligence</span>
                </div>

                {/* Map Hero Section - Smaller on mobile for easier scrolling */}
                <div className="relative w-full h-[40vh] md:h-[65vh] min-h-[280px] md:min-h-[500px] bg-background">

                    {/* Stats Bar - Overlay */}
                    <div className="absolute top-4 left-4 right-4 z-10 hidden md:block pointer-events-none" data-tour="map-stats">
                        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-lg max-w-4xl mx-auto">
                            <div className="px-6 py-4">
                                <div className="grid grid-cols-4 gap-8 divide-x divide-slate-700/50">
                                    {/* Total Nodes */}
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            <Server className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Nodes</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-slate-100">
                                                    {isLoading ? '—' : stats.totalNodes.toLocaleString()}
                                                </span>
                                                {!isLoading && (
                                                    <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Countries */}
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                            <Globe className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Countries</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-slate-100">
                                                    {geoLoading ? '—' : stats.countryCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Storage */}
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                            <HardDrive className="h-5 w-5 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Capacity</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-slate-100 whitespace-nowrap">
                                                    {isLoading ? '—' : `~${formatBytes(stats.totalStorage)}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Network Uptime */}
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Activity className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Avg Uptime</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-slate-100">
                                                    {isLoading ? '—' : `${stats.avgUptime.toFixed(1)}%`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Component */}
                    <div className="absolute inset-0 z-0 text-foreground" data-tour="world-map">
                        <WorldMap
                            nodes={nodesWithCoordinates}
                            totalNodes={stats.totalNodes}
                            isLoadingLocations={geoLoading}
                        />
                    </div>

                    {/* Live Updates Indicator (Bottom) - Only show if mounted to avoid hydration mismatch on time */}
                    <div className="absolute bottom-4 right-4 z-10 pointer-events-none hidden sm:block">
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-card/80 backdrop-blur border border-border rounded-full shadow-lg">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono min-w-[80px]">
                                LIVE: {mounted && lastSync ? lastSync.toLocaleTimeString() : '--:--:--'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Regions Grid Section */}
                <div className="container mx-auto px-4 py-8 pb-24" data-tour="map-regions">
                    <RegionGrid
                        nodes={nodesWithLocation}
                        onRegionClick={handleRegionClick}
                    />
                </div>
            </main>
        </div>
    );
}

export default function MapPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </main>
            </div>
        }>
            <MapPageContent />
        </Suspense>
    );
}
