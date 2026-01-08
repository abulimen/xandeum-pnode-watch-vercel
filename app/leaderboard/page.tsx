/**
 * Leaderboard Page - Top performing nodes ranked by credits
 * Updated to use official Xandeum credits API
 * Enhanced with Framer Motion animations
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Clock, Target, Shield, TrendingUp, Activity, Award, Crown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RefreshBar } from '@/components/layout/RefreshBar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNodes, useNetworkStats, useNodeLocations } from '@/hooks';
import { enrichNodesWithStakingData, formatDuration, formatBytes } from '@/lib/services/analyticsService';
import { useCredits, enrichNodesWithCreditsData } from '@/hooks/useCredits';
import { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { BadgeDisplay } from '@/components/ui/BadgeDisplay';
import { calculateBadges } from '@/lib/services/badgeService';

interface LeaderboardEntryProps {
    rank: number;
    node: PNode;
    allNodes: PNode[];
    category: 'overall' | 'uptime' | 'storage' | 'duration';
    index: number;
}

function getMedalColor(rank: number): string {
    switch (rank) {
        case 1: return 'text-yellow-500 fill-yellow-500/20';
        case 2: return 'text-gray-400 fill-gray-400/20';
        case 3: return 'text-amber-700 fill-amber-700/20';
        default: return 'text-muted-foreground';
    }
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
}

function LeaderboardEntry({ rank, node, allNodes, category, index }: LeaderboardEntryProps) {
    const isTop3 = rank <= 3;
    const badges = useMemo(() => calculateBadges(node, allNodes), [node, allNodes]);

    const getValue = () => {
        switch (category) {
            case 'overall':
                return (
                    <div className="text-right">
                        <div className="font-bold text-base sm:text-lg">{(node.credits ?? 0).toLocaleString()}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">Credits</div>
                    </div>
                );
            case 'uptime':
                return (
                    <div className="text-right">
                        <div className="font-bold text-base sm:text-lg text-emerald-600">{node.uptime.toFixed(2)}%</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">Uptime</div>
                    </div>
                );
            case 'storage':
                return (
                    <div className="text-right">
                        <div className="font-bold text-base sm:text-lg text-blue-600">{formatBytes(node.storage.total || 0)}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">{node.storage.usagePercent?.toFixed(1) || 0}% Used</div>
                    </div>
                );
            case 'duration':
                return (
                    <div className="text-right">
                        <div className="font-bold text-xs sm:text-sm text-purple-600">{formatDuration(node.uptimeSeconds || 0)}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">Online</div>
                    </div>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
        >
            <Link
                href={`/nodes/${node.id}`}
                className={cn(
                    "flex items-center justify-between p-3 sm:p-4 rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/20",
                    isTop3 && "border-primary/20 bg-primary/5"
                )}
            >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <motion.div
                        className={cn(
                            "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-lg shrink-0",
                            isTop3 ? "bg-background shadow-sm" : "bg-muted text-muted-foreground"
                        )}
                        whileHover={isTop3 ? { rotate: [0, -10, 10, 0], scale: 1.1 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        {isTop3 ? (
                            <Crown className={cn("h-4 w-4 sm:h-5 sm:w-5", getMedalColor(rank))} />
                        ) : (
                            <span>{rank}</span>
                        )}
                    </motion.div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <p className="font-semibold font-mono text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{node.id}</p>
                            {node.isPublic && (
                                <Badge variant="secondary" className="hidden sm:flex h-5 px-1.5 text-[10px] gap-0.5 shrink-0">
                                    <Shield className="h-3 w-3" /> Public
                                </Badge>
                            )}
                            {node.uptimeBadge === 'elite' && (
                                <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[8px] sm:text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 shrink-0">
                                    Elite
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                            <span className="truncate max-w-[80px] sm:max-w-none">{node.location?.country ? `${node.location.city || node.location.country}${node.location.city && node.location.countryCode ? `, ${node.location.countryCode}` : ''}` : 'Location pending...'}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">v{node.version || 'Unknown'}</span>
                            {badges.filter(b => b.earned).length > 0 && (
                                <>
                                    <span className="hidden sm:inline">•</span>
                                    <BadgeDisplay badges={badges} size="sm" maxDisplay={3} className="hidden sm:flex" />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <FavoriteButton nodeId={node.id} size="sm" />
                    <div className="pl-2 sm:pl-0">
                        {getValue()}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function LeaderboardSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-16" />
                </div>
            ))}
        </div>
    );
}

export default function LeaderboardPage() {
    const { nodes, isLoading, isFetching, isError, refetch, lastUpdated, responseTime } = useNodes();
    const { issueCount } = useNetworkStats(nodes);
    const [activeTab, setActiveTab] = useState('overall');

    // Fetch credits from Xandeum API
    const { creditsMap } = useCredits();

    // Enrich nodes with staking data and credits
    const enrichedNodes = useMemo(() => {
        const withStakingData = enrichNodesWithStakingData(nodes);
        return enrichNodesWithCreditsData(withStakingData, creditsMap);
    }, [nodes, creditsMap]);

    // Fetch geolocation data for nodes
    const { nodesWithLocation } = useNodeLocations(enrichedNodes);

    // Different leaderboard categories - use nodes with location data
    // Show all nodes with credits (regardless of online status)
    const leaderboards = useMemo(() => {
        const ranked = nodesWithLocation.filter(n => (n.credits ?? 0) > 0);

        return {
            overall: [...ranked].sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0)).slice(0, 20),
            uptime: [...ranked].sort((a, b) => b.uptime - a.uptime).slice(0, 20),
            storage: [...ranked].sort((a, b) => (b.storage.total || 0) - (a.storage.total || 0)).slice(0, 20),
            duration: [...ranked].sort((a, b) => (b.uptimeSeconds || 0) - (a.uptimeSeconds || 0)).slice(0, 20),
        };
    }, [nodesWithLocation]);

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

            <main className="flex-1 container px-4 py-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-tour="leaderboard-header">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <motion.div
                                animate={{
                                    rotate: [0, -5, 5, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 5,
                                    ease: 'easeInOut'
                                }}
                            >
                                <Trophy className="h-8 w-8 text-amber-500" />
                            </motion.div>
                            Credits Leaderboard
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Top pNodes ranked by official credits, uptime, and storage
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background border px-4 py-2 rounded-lg shadow-sm" data-tour="leaderboard-stats">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        <span>{leaderboards.overall.length} ranked nodes</span>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid p-1 bg-muted/50" data-tour="leaderboard-tabs">
                        <TabsTrigger value="overall" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Trophy className="h-4 w-4" />
                            <span className="hidden sm:inline">Credit Score</span>
                        </TabsTrigger>
                        <TabsTrigger value="uptime" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Uptime</span>
                        </TabsTrigger>
                        <TabsTrigger value="storage" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Storage</span>
                        </TabsTrigger>
                        <TabsTrigger value="duration" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Clock className="h-4 w-4" />
                            <span className="hidden sm:inline">Longevity</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overall - Best Credits */}
                    <TabsContent value="overall" className="space-y-4">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-xl">Top Performers</CardTitle>
                                <CardDescription>
                                    Ranked by official credits from Xandeum heartbeat system
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                {isLoading ? (
                                    <LeaderboardSkeleton />
                                ) : (
                                    <div className="grid gap-3" data-tour="leaderboard-list">
                                        {leaderboards.overall.map((node, index) => (
                                            <LeaderboardEntry
                                                key={node.id}
                                                rank={index + 1}
                                                node={node}
                                                allNodes={nodesWithLocation}
                                                category="overall"
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Uptime */}
                    <TabsContent value="uptime" className="space-y-4">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-xl">Most Reliable Nodes</CardTitle>
                                <CardDescription>
                                    Ranked by highest uptime percentage
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                {isLoading ? (
                                    <LeaderboardSkeleton />
                                ) : (
                                    <div className="grid gap-3">
                                        {leaderboards.uptime.map((node, index) => (
                                            <LeaderboardEntry
                                                key={node.id}
                                                rank={index + 1}
                                                node={node}
                                                allNodes={nodesWithLocation}
                                                category="uptime"
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Storage */}
                    <TabsContent value="storage" className="space-y-4">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-xl">Top Storage Providers</CardTitle>
                                <CardDescription>
                                    Ranked by total storage capacity
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                {isLoading ? (
                                    <LeaderboardSkeleton />
                                ) : (
                                    <div className="grid gap-3">
                                        {leaderboards.storage.map((node, index) => (
                                            <LeaderboardEntry
                                                key={node.id}
                                                rank={index + 1}
                                                node={node}
                                                allNodes={nodesWithLocation}
                                                category="storage"
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Duration */}
                    <TabsContent value="duration" className="space-y-4">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-xl">Longest Running Nodes</CardTitle>
                                <CardDescription>
                                    Ranked by continuous online duration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                {isLoading ? (
                                    <LeaderboardSkeleton />
                                ) : (
                                    <div className="grid gap-3">
                                        {leaderboards.duration.map((node, index) => (
                                            <LeaderboardEntry
                                                key={node.id}
                                                rank={index + 1}
                                                node={node}
                                                allNodes={nodesWithLocation}
                                                category="duration"
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
        </div>
    );
}
