/**
 * Analytics Dashboard
 * New Bento Grid layout with polished UI
 */

'use client';

import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RefreshBar } from '@/components/layout/RefreshBar';
import { NodeStatusChart } from '@/components/analytics/NodeStatusChart';
import { VersionDistributionChart } from '@/components/analytics/VersionDistributionChart';
import { UptimeDistributionChart } from '@/components/analytics/UptimeDistributionChart';
import { AlertsPanel } from '@/components/analytics/AlertsPanel';
import { CreditsHistoryChart } from '@/components/analytics/CreditsHistoryChart';
import { NetworkHealthScore } from '@/components/analytics/NetworkHealthScore';
import { GeographicDistribution } from '@/components/analytics/GeographicDistribution';
import { BadgeDistribution } from '@/components/analytics/BadgeDistribution';
import { NetworkTraffic } from '@/components/analytics/NetworkTraffic';
import { NetworkSummary } from '@/components/NetworkSummary';
import { useNodes, useNetworkStats, useNodeLocations } from '@/hooks';
import { enrichNodesWithStakingData } from '@/lib/services/analyticsService';
import { useCredits, enrichNodesWithCreditsData } from '@/hooks/useCredits';
import { Card, CardContent } from '@/components/ui/card';
import { formatBytes } from '@/lib/services/analyticsService';
import { Trophy, HardDrive, Users, Activity, Server, Globe, Zap, Shield, Database, Cpu } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { cn } from '@/lib/utils';

// Styled Stat Card - No circles, large icons
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    colorClass,
    bgClass
}: {
    title: string;
    value: string | number;
    subtitle: React.ReactNode;
    icon: any;
    colorClass: string;
    bgClass: string;
}) {
    return (
        <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group relative">
            {/* Subtle gradient background */}
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500", bgClass)} />

            <CardContent className="p-6 flex flex-col justify-between h-full relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                        <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                    </div>
                    {/* Large Icon */}
                    <Icon className={cn("h-8 w-8 opacity-80 transition-transform group-hover:scale-110 duration-300", colorClass)} strokeWidth={1.5} />
                </div>

                <div className="mt-auto pt-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {subtitle}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function AnalyticsDashboard() {
    const { nodes, isLoading, responseTime, isFetching, isError, refetch, lastUpdated } = useNodes();

    // Fetch credits from Xandeum API
    const { creditsMap, avgCredits } = useCredits();

    // Enrich nodes with staking data and credits
    const enrichedNodes = useMemo(() => {
        const withStakingData = enrichNodesWithStakingData(nodes);
        return enrichNodesWithCreditsData(withStakingData, creditsMap);
    }, [nodes, creditsMap]);

    // Get nodes with location data for geographic distribution
    const { nodesWithLocation } = useNodeLocations(enrichedNodes);

    const { stats, issues, issueCount } = useNetworkStats(enrichedNodes);

    const eliteNodes = enrichedNodes.filter(n => n.uptimeBadge === 'elite').length;
    const onlineNodes = enrichedNodes.filter(n => n.status === 'online').length;

    return (
        <div className="min-h-screen flex flex-col bg-muted/5">
            <Header issueCount={issueCount} />

            <RefreshBar
                lastUpdated={lastUpdated}
                isFetching={isFetching}
                isError={isError}
                responseTime={responseTime}
                onRefresh={refetch}
            />

            <main className="flex-1 container px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2" data-tour="analytics-header">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Network Analytics
                        </h1>
                        <p className="text-muted-foreground">
                            Real-time insights into network performance and health
                        </p>
                    </div>
                    {responseTime && (
                        <div className="flex items-center gap-2 text-sm bg-background/80 backdrop-blur px-4 py-2 rounded-full border shadow-sm">
                            <Zap className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                            <span className="text-muted-foreground">Latency:</span>
                            <span className="font-mono font-bold">{responseTime}ms</span>
                        </div>
                    )}
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="analytics-charts">

                    {/* Row 1: Credits Trend (Hero) + Health Score */}
                    <div className="lg:col-span-3">
                        <CreditsHistoryChart
                            creditsMap={creditsMap}
                            nodes={enrichedNodes}
                            currentValue={avgCredits}
                            className="h-full border-none shadow-md"
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <NetworkHealthScore
                            nodes={enrichedNodes}
                            avgCredits={avgCredits}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Row 2: Quick Stats - Updated Design */}
                    <StatCard
                        title="Total Nodes"
                        value={enrichedNodes.length}
                        icon={Server}
                        colorClass="text-blue-500"
                        bgClass="bg-blue-500"
                        subtitle={
                            <span className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                                {onlineNodes} online
                            </span>
                        }
                    />
                    <StatCard
                        title="Avg Credits"
                        value={avgCredits.toLocaleString()}
                        icon={Trophy}
                        colorClass="text-amber-500"
                        bgClass="bg-amber-500"
                        subtitle="Network-wide average"
                    />
                    <StatCard
                        title="Elite Nodes"
                        value={eliteNodes}
                        icon={Shield}
                        colorClass="text-emerald-500"
                        bgClass="bg-emerald-500"
                        subtitle="99.5%+ uptime reliability"
                    />
                    <StatCard
                        title="Total Storage"
                        value={formatBytes(stats.totalStorage)}
                        icon={Database}
                        colorClass="text-purple-500"
                        bgClass="bg-purple-500"
                        subtitle={`~${stats.storageUtilization?.toFixed(1) || 0}% utilized`}
                    />

                    {/* Row 3: Distributions */}
                    <div className="lg:col-span-2">
                        <GeographicDistribution
                            nodes={nodesWithLocation}
                            isLoading={isLoading}
                            limit={3}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <UptimeDistributionChart
                            nodes={enrichedNodes}
                            isLoading={isLoading}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <VersionDistributionChart
                            nodes={enrichedNodes}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Row 4: AI Summary + Alerts */}
                    <div className="lg:col-span-2">
                        <NetworkSummary />
                    </div>
                    <div className="lg:col-span-2">
                        <AlertsPanel issues={issues} isLoading={isLoading} />
                    </div>

                    {/* Row 5: Badge Distribution + Network Traffic - Side by Side */}
                    <div className="lg:col-span-2">
                        <BadgeDistribution nodes={enrichedNodes} isLoading={isLoading} />
                    </div>
                    <div className="lg:col-span-2">
                        <NetworkTraffic nodes={enrichedNodes} isLoading={isLoading} />
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
