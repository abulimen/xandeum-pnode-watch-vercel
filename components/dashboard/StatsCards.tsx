/**
 * StatsCards Component - Network statistics dashboard cards
 * Enhanced with progress bars, modern styling, and Framer Motion animations
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendIndicator } from '@/components/ui/TrendIndicator';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { motion } from 'framer-motion';
import { NetworkStats } from '@/types/pnode';
import { Activity, Server, Wifi, HardDrive, Zap, Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
    stats: NetworkStats;
    previousStats?: NetworkStats;
    isLoading: boolean;
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    trendLabel?: string;
    icon: React.ReactNode;
    iconBg: string;
    progress?: number;
    progressColor?: string;
    badge?: string;
    badgeColor?: string;
    isLoading?: boolean;
    infoTooltip?: 'staking-score' | 'uptime' | 'elite-nodes';
}

function StatCard({
    title,
    value,
    subtitle,
    trend,
    trendLabel,
    icon,
    iconBg,
    progress,
    progressColor = 'bg-primary',
    badge,
    badgeColor = 'text-emerald-500',
    isLoading,
    infoTooltip
}: StatCardProps) {
    if (isLoading) {
        return (
            <Card className="overflow-hidden h-full glass-card">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-9 rounded-xl" />
                    </div>
                    <Skeleton className="h-9 w-28 mb-2" />
                    <Skeleton className="h-3 w-full mb-3" />
                    <Skeleton className="h-4 w-20" />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="h-full"
        >
            <Card className="overflow-hidden h-full min-h-[160px] flex flex-col glass-card glass-glow">
                <CardContent className="p-5 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            {title}
                            {infoTooltip && <InfoTooltip metric={infoTooltip} />}
                            {trend !== undefined && trend !== 0 && (
                                <TrendIndicator value={trend} size="sm" />
                            )}
                        </span>
                        <motion.div
                            className={cn("p-2 rounded-xl", iconBg)}
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {icon}
                        </motion.div>
                    </div>

                    {/* Value */}
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold tracking-tight">{value}</span>
                        {badge && (
                            <span className={cn("text-sm font-medium", badgeColor)}>{badge}</span>
                        )}
                    </div>

                    {/* Spacer to push content to bottom */}
                    <div className="flex-grow" />

                    {/* Progress Bar - Always reserve space */}
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                        {progress !== undefined && (
                            <motion.div
                                className={cn("h-full rounded-full", progressColor)}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                            />
                        )}
                    </div>

                    {/* Subtitle - Always reserve space */}
                    <p className="text-xs text-muted-foreground font-medium min-h-[16px]">
                        {subtitle || '\u00A0'}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export function StatsCards({ stats, previousStats, isLoading }: StatsCardsProps) {
    // Calculate trends
    const healthTrend = previousStats ? stats.healthScore - previousStats.healthScore : 0;
    const uptimeTrend = previousStats ? (stats.avgUptime || 0) - (previousStats.avgUptime || 0) : 0;
    const nodesTrend = previousStats ? stats.totalNodes - previousStats.totalNodes : 0;

    const onlinePercentage = stats.totalNodes > 0
        ? (stats.onlineNodes / stats.totalNodes) * 100
        : 0;

    const storageUsedPercentage = stats.totalStorage > 0
        ? (stats.usedStorage / stats.totalStorage) * 100
        : 0;

    // Calculate elite nodes (uptime > 99.5%)
    const eliteNodes = stats.onlineNodes; // You can refine this with actual calculation

    return (
        <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
            data-tour="network-stats"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                }
            }}
        >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <StatCard
                    title="Total Nodes"
                    value={stats.totalNodes.toLocaleString()}
                    trend={nodesTrend}
                    subtitle={`${stats.onlineNodes} active • ${stats.degradedNodes} degraded • ${stats.offlineNodes} offline`}
                    icon={<Zap className="h-5 w-5 text-blue-400" />}
                    iconBg="bg-blue-500/10"
                    isLoading={isLoading}
                />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <StatCard
                    title="Avg Uptime (24h)"
                    value={`${(stats.avgUptime || 0).toFixed(2)}%`}
                    subtitle={`Avg Health: ${stats.healthScore || 0}/100`}
                    trend={uptimeTrend}
                    progress={stats.avgUptime || 0}
                    progressColor="bg-emerald-500"
                    icon={<Activity className="h-5 w-5 text-emerald-400" />}
                    iconBg="bg-emerald-500/10"
                    isLoading={isLoading}
                    infoTooltip="uptime"
                />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <StatCard
                    title="Avg Credits"
                    value={(stats.avgCredits || stats.avgStakingScore || 0).toLocaleString()}
                    trend={healthTrend}
                    icon={<Server className="h-5 w-5 text-amber-400" />}
                    iconBg="bg-amber-500/10"
                    isLoading={isLoading}
                    infoTooltip="staking-score"
                />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <StatCard
                    title="Network Capacity"
                    value={formatBytes(stats.totalStorage)}
                    subtitle={`~${storageUsedPercentage.toFixed(1)}% utilized`}
                    progress={storageUsedPercentage}
                    progressColor="bg-purple-500"
                    icon={<HardDrive className="h-5 w-5 text-purple-400" />}
                    iconBg="bg-purple-500/10"
                    isLoading={isLoading}
                />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <StatCard
                    title="Elite Nodes"
                    value={stats.eliteNodes || 0}
                    badgeColor="text-emerald-500"
                    subtitle="99.5%+ uptime nodes"
                    icon={<Trophy className="h-5 w-5 text-yellow-400" />}
                    iconBg="bg-yellow-500/10"
                    isLoading={isLoading}
                    infoTooltip="elite-nodes"
                />
            </motion.div>
        </motion.div>
    );
}

function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
}

