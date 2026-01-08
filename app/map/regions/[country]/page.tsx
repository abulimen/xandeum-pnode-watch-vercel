/**
 * Country Analytics Page - Detailed view of nodes in a specific country
 */

'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { RefreshBar } from '@/components/layout/RefreshBar';
import { useNodes, useNetworkStats, useNodeLocations } from '@/hooks';
import { useCredits, enrichNodesWithCreditsData } from '@/hooks/useCredits';
import { enrichNodesWithStakingData, formatBytes } from '@/lib/services/analyticsService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Server,
    Activity,
    HardDrive,
    Wifi,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Globe,
    TrendingUp,
    Clock,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for country flag emoji
function getFlagEmoji(countryName: string): string {
    const codePoints = (code: string) => {
        return code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    };

    const countryCodes: Record<string, string> = {
        'United States': 'US', 'USA': 'US',
        'United Kingdom': 'GB', 'UK': 'GB',
        'Germany': 'DE', 'France': 'FR', 'Japan': 'JP',
        'China': 'CN', 'Taiwan': 'TW', 'Singapore': 'SG',
        'Australia': 'AU', 'Canada': 'CA', 'India': 'IN',
        'Brazil': 'BR', 'Netherlands': 'NL', 'Russia': 'RU',
        'Korea': 'KR', 'South Korea': 'KR', 'Sweden': 'SE',
        'Finland': 'FI', 'Poland': 'PL', 'Italy': 'IT',
        'Spain': 'ES', 'Switzerland': 'CH', 'Austria': 'AT',
        'Belgium': 'BE', 'Denmark': 'DK', 'Norway': 'NO',
        'Ireland': 'IE', 'Portugal': 'PT', 'Romania': 'RO',
        'Czech Republic': 'CZ', 'Hungary': 'HU', 'Turkey': 'TR',
        'Vietnam': 'VN', 'Thailand': 'TH', 'Indonesia': 'ID',
        'Philippines': 'PH', 'Malaysia': 'MY', 'Mexico': 'MX',
        'Argentina': 'AR', 'Chile': 'CL', 'Colombia': 'CO',
        'Peru': 'PE', 'South Africa': 'ZA', 'Egypt': 'EG',
        'Saudi Arabia': 'SA', 'UAE': 'AE', 'Israel': 'IL',
        'Ukraine': 'UA', 'Hong Kong': 'HK', 'New Zealand': 'NZ',
        'Nigeria': 'NG', 'The Netherlands': 'NL',
    };

    const code = countryCodes[countryName] || countryCodes[Object.keys(countryCodes).find(k => countryName.includes(k)) || ''];
    if (code) {
        return String.fromCodePoint(...codePoints(code));
    }
    return '🌍';
}

export default function CountryAnalyticsPage({ params }: { params: Promise<{ country: string }> }) {
    const { country: encodedCountry } = use(params);
    const country = decodeURIComponent(encodedCountry);
    const router = useRouter();

    const { nodes, isLoading, isFetching, isError, refetch, lastUpdated, responseTime } = useNodes();
    const { issueCount } = useNetworkStats(nodes);
    const { creditsMap } = useCredits();

    // Enrich nodes with additional data
    const enrichedNodes = useMemo(() => {
        let result = enrichNodesWithStakingData(nodes);
        result = enrichNodesWithCreditsData(result, creditsMap);
        return result;
    }, [nodes, creditsMap]);

    // Fetch geolocation for nodes
    const { nodesWithLocation, isLoading: geoLoading } = useNodeLocations(enrichedNodes);

    // Filter nodes for this country
    const countryNodes = useMemo(() => {
        return nodesWithLocation.filter(n => n.location?.country === country);
    }, [nodesWithLocation, country]);

    // Calculate stats
    const stats = useMemo(() => {
        const online = countryNodes.filter(n => n.status === 'online').length;
        const degraded = countryNodes.filter(n => n.status === 'degraded').length;
        const offline = countryNodes.filter(n => n.status === 'offline').length;
        const totalStorage = countryNodes.reduce((sum, n) => sum + (n.storage?.total || 0), 0);
        const avgUptime = countryNodes.length > 0
            ? countryNodes.reduce((sum, n) => sum + (n.uptime || 0), 0) / countryNodes.length
            : 0;
        const validLatencyNodes = countryNodes.filter(n => n.responseTime > 0);
        const avgLatency = validLatencyNodes.length > 0
            ? validLatencyNodes.reduce((sum, n) => sum + n.responseTime, 0) / validLatencyNodes.length
            : 0;
        const totalCredits = countryNodes.reduce((sum, n) => sum + (n.credits || 0), 0);
        const healthScore = countryNodes.length > 0
            ? Math.round(((online + degraded * 0.5) / countryNodes.length) * 100)
            : 0;

        return { online, degraded, offline, totalStorage, avgUptime, avgLatency, totalCredits, healthScore };
    }, [countryNodes]);

    // Sort by status then uptime
    const sortedNodes = useMemo(() => {
        return [...countryNodes].sort((a, b) => {
            const statusOrder = { online: 0, degraded: 1, offline: 2 };
            const statusDiff = (statusOrder[a.status] || 2) - (statusOrder[b.status] || 2);
            if (statusDiff !== 0) return statusDiff;
            return (b.uptime || 0) - (a.uptime || 0);
        });
    }, [countryNodes]);

    const isPageLoading = isLoading || geoLoading;

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

            <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <div className="container mx-auto px-4 py-6 space-y-6">
                    {/* Breadcrumb & Back */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-foreground transition-colors">Dashboard</Link>
                            <span className="mx-2">›</span>
                            <Link href="/map" className="hover:text-foreground transition-colors">Network Intelligence</Link>
                            <span className="mx-2">›</span>
                            <span className="text-foreground">{country}</span>
                        </div>
                    </div>

                    {/* Country Header */}
                    <div className="flex items-center gap-4">
                        <div className="text-5xl">{getFlagEmoji(country)}</div>
                        <div>
                            <h1 className="text-3xl font-bold">{country}</h1>
                            <p className="text-muted-foreground">
                                {isPageLoading ? 'Loading...' : `${countryNodes.length} node${countryNodes.length !== 1 ? 's' : ''} in this region`}
                            </p>
                        </div>
                        <div className={cn(
                            "ml-auto px-4 py-2 rounded-lg text-2xl font-bold",
                            stats.healthScore >= 90 ? "bg-emerald-500/10 text-emerald-500" :
                                stats.healthScore >= 70 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {stats.healthScore}% Health
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Online
                            </div>
                            <div className="text-2xl font-bold text-emerald-500">{stats.online}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                Degraded
                            </div>
                            <div className="text-2xl font-bold text-amber-500">{stats.degraded}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                                Offline
                            </div>
                            <div className="text-2xl font-bold text-red-500">{stats.offline}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <HardDrive className="h-3.5 w-3.5" />
                                Storage
                            </div>
                            <div className="text-2xl font-bold">{formatBytes(stats.totalStorage)}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <Activity className="h-3.5 w-3.5" />
                                Avg Uptime
                            </div>
                            <div className="text-2xl font-bold">{stats.avgUptime.toFixed(1)}%</div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <Wifi className="h-3.5 w-3.5" />
                                Avg Latency
                            </div>
                            <div className="text-2xl font-bold">{Math.round(stats.avgLatency)} ms</div>
                        </Card>
                    </div>

                    {/* Node List */}
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-border">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                Nodes in {country}
                            </h2>
                        </div>

                        {isPageLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : countryNodes.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                No nodes found in {country}.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Node ID</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">City</th>
                                            <th className="px-4 py-3 text-right">Uptime</th>
                                            <th className="px-4 py-3 text-right">Storage</th>
                                            <th className="px-4 py-3 text-right">Latency</th>
                                            <th className="px-4 py-3 text-right">Credits</th>
                                            <th className="px-4 py-3 text-left">Version</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {sortedNodes.map(node => (
                                            <tr
                                                key={node.id}
                                                className="hover:bg-muted/30 cursor-pointer transition-colors"
                                                onClick={() => router.push(`/nodes/${node.id}`)}
                                            >
                                                <td className="px-4 py-3 font-mono text-xs truncate max-w-[200px]" title={node.id}>
                                                    {node.id.slice(0, 8)}...{node.id.slice(-4)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                                                        node.status === 'online' ? "bg-emerald-500/10 text-emerald-500" :
                                                            node.status === 'degraded' ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            node.status === 'online' ? "bg-emerald-500" :
                                                                node.status === 'degraded' ? "bg-amber-500" : "bg-red-500"
                                                        )} />
                                                        {node.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {node.location?.city || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {node.uptime.toFixed(1)}%
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatBytes(node.storage?.total || 0)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-muted-foreground">
                                                    {node.responseTime} ms
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {(node.credits || 0).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {node.version || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}
