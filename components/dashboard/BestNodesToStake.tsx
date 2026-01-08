/**
 * BestNodesToStake Component - Top performers widget
 * Merged design from TopContributors with credits-based ranking
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BadgeDisplay } from '@/components/ui/BadgeDisplay';
import { Trophy, ChevronRight, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PNode } from '@/types/pnode';
import { calculateBadges } from '@/lib/services/badgeService';
import { formatDuration } from '@/lib/services/analyticsService';

// Tier colors based on rank
const RANK_TIERS = [
    { color: '#FFD700', bgColor: 'bg-yellow-500/10', label: 'Gold' },      // 1st
    { color: '#C0C0C0', bgColor: 'bg-slate-400/10', label: 'Silver' },     // 2nd
    { color: '#CD7F32', bgColor: 'bg-orange-600/10', label: 'Bronze' },    // 3rd
    { color: '#4B5563', bgColor: 'bg-gray-500/10', label: 'Top 5' },       // 4th-5th
];

function getTierByRank(rank: number) {
    if (rank <= 3) return RANK_TIERS[rank - 1];
    return RANK_TIERS[3];
}

// Custom rank icon as SVG (star for top 3, number for others)
function RankIcon({ rank, className }: { rank: number; className?: string }) {
    const tier = getTierByRank(rank);

    if (rank <= 3) {
        return (
            <svg className={className} viewBox="0 0 24 24" fill="none">
                <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill={tier.color}
                    stroke={tier.color}
                    strokeWidth="1.5"
                />
                <text
                    x="12"
                    y="14"
                    textAnchor="middle"
                    fontSize="8"
                    fill="white"
                    fontWeight="bold"
                >
                    {rank}
                </text>
            </svg>
        );
    }

    return (
        <div
            className={cn("flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-sm", className)}
            style={{ width: '100%', height: '100%' }}
        >
            {rank}
        </div>
    );
}

interface BestNodesToStakeProps {
    nodes: PNode[];
    isLoading?: boolean;
    count?: number;
}

export function BestNodesToStake({ nodes, isLoading, count = 5 }: BestNodesToStakeProps) {
    // Sort by credits and take top N (show all nodes with credits, regardless of status)
    const topNodes = useMemo(() => {
        return nodes
            .filter(n => n.credits !== undefined && (n.credits ?? 0) > 0)
            .sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0))
            .slice(0, count);
    }, [nodes, count]);

    if (isLoading) {
        return (
            <Card className="border border-border/50 shadow-sm bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Top Performers
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(count)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (topNodes.length === 0) {
        return (
            <Card className="border border-border/50 shadow-sm bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Top Performers
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                        No ranking data available yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-border/50 shadow-sm bg-card" data-tour="best-nodes">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            Top Performers
                        </CardTitle>
                        <CardDescription>
                            Ranked by credits earned
                        </CardDescription>
                    </div>
                    <Link href="/leaderboard">
                        <Button variant="ghost" size="sm" className="gap-1">
                            View All
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                {topNodes.map((node, index) => {
                    const rank = index + 1;
                    const tier = getTierByRank(rank);
                    const badges = calculateBadges(node, nodes);

                    return (
                        <Link
                            key={node.id}
                            href={`/nodes/${node.id}`}
                            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                            {/* Rank Icon */}
                            <div
                                className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                    tier.bgColor
                                )}
                            >
                                <RankIcon rank={rank} className="h-6 w-6" />
                            </div>

                            {/* Node Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-medium truncate max-w-[100px] group-hover:text-primary transition-colors">
                                        {node.id}
                                    </span>
                                    <StatusBadge status={node.status} size="sm" />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {/* Online Duration */}
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(node.uptimeSeconds || 0)}
                                    </span>
                                    {/* Badges */}
                                    {badges.filter(b => b.earned).length > 0 && (
                                        <>
                                            <span>•</span>
                                            <BadgeDisplay badges={badges} size="sm" maxDisplay={2} />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Credits */}
                            <div className="text-right shrink-0">
                                <div className="font-bold text-sm">{(node.credits ?? 0).toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground">
                                    credits
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}
