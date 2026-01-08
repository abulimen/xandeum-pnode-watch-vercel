/**
 * Node Details Page - Variation 2: "Spotlight" Hero Design
 * Diagonal layout with circular map focal point
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Activity,
    Clock,
    Wifi,
    HardDrive,
    MapPin,
    Server,
    Globe,
    Copy,
    Share2,
    Cpu,
    MemoryStick,
    Network,
    Loader2,
    Shield,
    ShieldOff,
    Info,
    Coins,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    ChevronRight,
    Eye,
    Zap,
    Timer,
    BarChart3,
    Sparkles,
    Users,
} from 'lucide-react';
import { useMemo, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AlertSubscribeButton } from '@/components/alerts/AlertSubscribeButton';
import { useNodes, useNetworkStats, useNodeStats, useSingleNodeLocation, useShareComparison, useNodeLocations } from '@/hooks';
import { useNodeNetworks } from '@/hooks/useNodeNetworks';
import { useNodeOperator } from '@/hooks/useNodeOperator';
import { formatBytes, formatRelativeTime, formatDuration, enrichNodesWithStakingData } from '@/lib/services/analyticsService';
import { useCredits, enrichNodesWithCreditsData } from '@/hooks/useCredits';
import { benchmarkNode, benchmarkService } from '@/lib/services/benchmarkService';
import { RatingBadge } from '@/components/ui/RatingBadge';
import { NetworkPositionChart } from '@/components/ui/NetworkPositionChart';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeDisplay } from '@/components/ui/BadgeDisplay';
import { calculateBadges } from '@/lib/services/badgeService';
import { NodeSummary } from '@/components/NodeSummary';
import { Map, MapMarker, MarkerContent, MapControls } from '@/components/ui/map';
import Link from 'next/link';

// Stat Card - Dashboard style (clean, minimal)
function StatCard({
    label,
    value,
    subtitle,
    icon: Icon,
    ranking,
}: {
    label: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    ranking?: { rank: number; total: number };
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="h-full"
        >
            <Card className="overflow-hidden border border-border/50 shadow-sm bg-card h-full hover:shadow-lg hover:border-border transition-shadow duration-200">
                <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            {label}
                        </span>
                        <motion.div
                            className="p-2 rounded-xl bg-muted/50"
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Icon className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                    </div>

                    {/* Value */}
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold tracking-tight">{value}</span>
                        {ranking && (
                            <Badge variant="secondary" className="text-[10px] h-5">
                                #{ranking.rank}
                            </Badge>
                        )}
                    </div>

                    {/* Subtitle */}
                    <p className="text-xs text-muted-foreground font-medium">
                        {subtitle || '\u00A0'}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Info Row Component
function InfoRow({ label, value, icon: Icon, copyable, onCopy }: {
    label: string;
    value: string;
    icon?: any;
    copyable?: boolean;
    onCopy?: () => void;
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-2 text-muted-foreground">
                {Icon && <Icon className="h-4 w-4" />}
                <span className="text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{value}</span>
                {copyable && onCopy && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy}>
                        <Copy className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function NodeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const nodeId = params.id as string;

    const { nodes, isLoading, isError } = useNodes();
    const { issueCount } = useNetworkStats(nodes);
    const { creditsMap, creditsThreshold, totalCredits } = useCredits();
    const { getNodeNetworks, isLoading: networksLoading } = useNodeNetworks();

    const enrichedNodes = useMemo(() => {
        const withStakingData = enrichNodesWithStakingData(nodes);
        return enrichNodesWithCreditsData(withStakingData, creditsMap);
    }, [nodes, creditsMap]);

    const node = useMemo(() => enrichedNodes.find(n => n.id === nodeId), [enrichedNodes, nodeId]);
    const { operator, isLoading: operatorLoading } = useNodeOperator({ nodeId, publicKey: node?.publicKey });

    const { location, isLoading: locationLoading } = useSingleNodeLocation(node || null);
    const { stats: detailedStats } = useNodeStats(node?.network?.ipAddress, node?.network?.rpcPort);
    const { copyLink } = useShareComparison();

    const benchmark = useMemo(() => {
        if (!node || enrichedNodes.length === 0) return null;
        return benchmarkNode(node, enrichedNodes);
    }, [node, enrichedNodes]);

    const rawSimilarNodes = useMemo(() => {
        if (!node || enrichedNodes.length === 0) return [];
        return benchmarkService.findSimilarNodes(node, enrichedNodes, 3);
    }, [node, enrichedNodes]);

    const { nodesWithLocation: similarNodes } = useNodeLocations(rawSimilarNodes);
    const badges = useMemo(() => node ? calculateBadges(node, enrichedNodes) : [], [node, enrichedNodes]);
    const networks = useMemo(() => node ? getNodeNetworks(node.id) : { devnet: false, mainnet: false }, [node, getNodeNetworks]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard?.writeText(text);
        toast.success(`${label} copied`);
    };

    const displayLocation = location || node?.location;
    const mapRef = useRef<any>(null);

    // Animate map zoom in on load
    useEffect(() => {
        if (displayLocation?.coordinates) {
            const { lng, lat } = displayLocation!.coordinates;
            // Wait for map to be ready
            const interval = setInterval(() => {
                if (mapRef.current) {
                    mapRef.current.flyTo({
                        center: [lng, lat],
                        zoom: 10,
                        duration: 3000,
                        essential: true
                    });
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [displayLocation?.coordinates?.lng, displayLocation?.coordinates?.lat]);

    // Calculations
    const storagePercent = node?.storage.total ? (node.storage.used / node.storage.total) * 100 : 0;
    const ramPercent = detailedStats?.ram_total ? (detailedStats.ram_used / detailedStats.ram_total) * 100 : null;
    const nodeCredits = node?.credits ?? 0;
    const isEligible = nodeCredits >= creditsThreshold;
    const sharePercent = totalCredits > 0 ? (nodeCredits / totalCredits) * 100 : 0;

    const formatNumber = (num: number) => {
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header issueCount={0} />
                <div className="flex-1 container px-4 py-6 space-y-6">
                    <Skeleton className="h-8 w-32" />
                    <div className="grid lg:grid-cols-2 gap-6">
                        <Skeleton className="h-[320px] rounded-2xl" />
                        <Skeleton className="h-[320px] rounded-2xl" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Error State
    if (isError || !node) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header issueCount={issueCount} />
                <main className="flex-1 container px-4 py-8 flex items-center justify-center">
                    <Card className="max-w-md w-full">
                        <CardContent className="pt-6 text-center space-y-4">
                            <Server className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h2 className="text-xl font-bold">Node Not Found</h2>
                            <p className="text-muted-foreground">The node "{nodeId}" could not be found.</p>
                            <Button onClick={() => router.push('/')} className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header issueCount={issueCount} />

            <main className="flex-1">
                {/* Hero Section - Spotlight Design */}
                <div className="border-b bg-gradient-to-br from-muted/30 via-background to-primary/5">
                    <div className="container px-4 py-6">
                        {/* Back + Actions Row */}
                        <div className="flex items-center justify-between mb-6" data-tour="node-header">
                            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Button>
                            <div className="flex items-center gap-2">
                                <AlertSubscribeButton nodeId={node.id} nodeName={node.id} />
                                <Button variant="outline" size="sm" onClick={() => router.push(`/calculator?storage=${node.storage?.total || 0}&credits=${node.credits || 0}`)} className="gap-1.5">
                                    <Coins className="h-4 w-4" />
                                    <span className="hidden sm:inline">ROI</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Main Hero Content */}
                        <div className="grid lg:grid-cols-5 gap-8 items-center">
                            {/* Left: Node Identity (3 cols) */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-3 space-y-6"
                            >
                                {/* Status Row */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
                                    <StatusBadge status={node.status} showLabel size="lg" />
                                    <Badge variant="outline" className={cn(
                                        "gap-1 shrink-0 whitespace-nowrap",
                                        node.isPublic
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    )}>
                                        {node.isPublic ? <Shield className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                                        {node.isPublic ? 'Public' : 'Private'}
                                    </Badge>
                                    {benchmark && <RatingBadge rating={benchmark.overallRating} />}
                                    {!networksLoading && (
                                        <>
                                            {networks.devnet && (
                                                <Badge variant="outline" className="gap-1 shrink-0 whitespace-nowrap bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                    <Network className="h-3 w-3" /> Devnet
                                                </Badge>
                                            )}
                                            {networks.mainnet && (
                                                <Badge variant="outline" className="gap-1 shrink-0 whitespace-nowrap bg-purple-500/10 text-purple-500 border-purple-500/20">
                                                    <Network className="h-3 w-3" /> Mainnet
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Node ID */}
                                <div>
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-tighter break-all">
                                        {node.id}
                                    </h1>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    {node.network && (
                                        <span className="flex items-center gap-2 font-mono">
                                            <Globe className="h-4 w-4 text-primary" />
                                            {node.network.ipAddress}:{node.network.port}
                                        </span>
                                    )}
                                    {displayLocation && (
                                        <span className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            {displayLocation.city}, {displayLocation.country}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        {formatRelativeTime(node.lastSeen)}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-primary" />
                                        Online for {formatDuration(node.uptimeSeconds || 0)}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Server className="h-4 w-4 text-primary" />
                                        v{node.version}
                                    </span>
                                </div>

                                {/* Operator Quick Access */}
                                {!operatorLoading && operator && (
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4 text-primary" />
                                            Operator
                                        </span>
                                        <div className="flex items-center gap-2 bg-muted px-2 py-1.5 rounded font-mono text-xs">
                                            <span>{`${operator.manager.substring(0, 6)}...${operator.manager.substring(operator.manager.length - 4)}`}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(operator.manager, 'Operator address')}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-1.5" asChild>
                                            <Link href={`/operators/${operator.manager}`}>
                                                View Operator <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Public Key */}
                                <div className="flex flex-col gap-1 text-xs">
                                    <span className="text-muted-foreground">Node Public Key</span>
                                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border/50 w-full max-w-xl">
                                        <code className="flex-1 text-xs font-mono truncate text-muted-foreground min-w-0">
                                            {node.publicKey}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 h-7 w-7"
                                            onClick={() => copyToClipboard(node.publicKey || '', 'Public key')}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Badges */}
                                {badges.filter(b => b.earned).length > 0 && (
                                    <BadgeDisplay badges={badges} size="sm" maxDisplay={5} />
                                )}
                            </motion.div>

                            {/* Right: Circular Map Spotlight (2 cols) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="lg:col-span-2 w-full lg:w-auto lg:flex lg:justify-end"
                            >
                                <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:w-auto">
                                    {/* Outer Glow Ring */}
                                    <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-xl lg:rounded-full blur-xl" />

                                    {/* Map Container - Box on mobile, Circular on desktop */}
                                    <div className="relative w-full h-64 lg:w-80 lg:h-80 rounded-xl lg:rounded-full overflow-hidden border-4 border-border/50 shadow-2xl">
                                        {displayLocation?.coordinates ? (
                                            <Map
                                                ref={mapRef}
                                                center={[0, 20]} // Start at world view
                                                zoom={1}
                                                interactive={false}
                                            >
                                                <MapMarker
                                                    longitude={displayLocation.coordinates.lng}
                                                    latitude={displayLocation.coordinates.lat}
                                                >
                                                    <MarkerContent>
                                                        <div className="relative">
                                                            <div className="absolute -inset-3 bg-primary/30 rounded-full animate-ping" />
                                                            <div className="relative w-6 h-6 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center">
                                                                <div className="w-2 h-2 rounded-full bg-white" />
                                                            </div>
                                                        </div>
                                                    </MarkerContent>
                                                </MapMarker>
                                            </Map>
                                        ) : locationLoading ? (
                                            <div className="h-full w-full flex items-center justify-center bg-muted/30">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-muted/30">
                                                <Globe className="h-16 w-16 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Floating Location Badge */}
                                    {displayLocation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="absolute -bottom-4 left-1/2 -translate-x-1/2"
                                        >
                                            <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 shadow-lg bg-background border">
                                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                                {displayLocation.city}, {displayLocation.country}
                                            </Badge>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container px-4 py-6 space-y-6">
                    {/* Eligibility Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "p-4 rounded-xl border",
                            isEligible
                                ? "bg-emerald-500/5 border-emerald-500/30"
                                : "bg-amber-500/5 border-amber-500/30"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {isEligible
                                ? <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                                : <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                            }
                            <div className="space-y-1 flex-1">
                                <p className={cn(
                                    "font-semibold text-sm",
                                    isEligible ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                )}>
                                    {isEligible ? "Reward Eligible" : "Below Reward Threshold"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {isEligible
                                        ? `This node meets the credits threshold (${formatNumber(creditsThreshold)}).`
                                        : `Needs ${formatNumber(creditsThreshold - nodeCredits)} more credits to reach threshold.`
                                    }
                                </p>
                            </div>
                            <a
                                href="https://docs.xandeum.network/heartbeat-credit-system"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
                            >
                                Learn more <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tour="node-metrics">
                        <StatCard
                            label="Uptime"
                            value={`${node.uptime.toFixed(1)}%`}
                            subtitle={node.uptime >= 95 ? "Excellent" : "Needs attention"}
                            icon={Activity}
                            ranking={benchmark?.rankings.uptime}
                        />
                        <StatCard
                            label="Credits"
                            value={formatNumber(nodeCredits)}
                            subtitle={`${sharePercent.toFixed(2)}% of network`}
                            icon={Coins}
                            ranking={benchmark?.rankings.credits}
                        />
                        <StatCard
                            label="Storage"
                            value={`${storagePercent.toFixed(1)}%`}
                            subtitle={`${formatBytes(node.storage.used)} / ${formatBytes(node.storage.total)}`}
                            icon={HardDrive}
                            ranking={benchmark?.rankings.storage}
                        />
                        <StatCard
                            label="Health"
                            value={`${node.healthScore}/100`}
                            subtitle={node.healthScore >= 80 ? "Healthy" : "Degraded"}
                            icon={Zap}
                        />
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Performance Tabs */}
                            <Card data-tour="node-performance">
                                <Tabs defaultValue="overview">
                                    <CardHeader className="pb-2 border-b">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4 text-primary" />
                                                Performance
                                            </CardTitle>
                                            <TabsList className="w-full sm:w-auto">
                                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                                <TabsTrigger value="system">System</TabsTrigger>
                                                <TabsTrigger value="network">Network</TabsTrigger>
                                            </TabsList>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <TabsContent value="overview" className="mt-0 space-y-6">
                                            {benchmark && (
                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <NetworkPositionChart
                                                            value={nodeCredits}
                                                            allValues={enrichedNodes.map(n => n.credits || 0)}
                                                            label="Network Position"
                                                            className="h-28"
                                                        />
                                                        <p className="text-center text-xs text-muted-foreground mt-2">
                                                            Rank #{benchmark.rankings.overall.rank} of {benchmark.rankings.overall.total}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex justify-between text-sm mb-2">
                                                                <span className="text-muted-foreground">Storage</span>
                                                                <span className="font-medium">{storagePercent.toFixed(1)}%</span>
                                                            </div>
                                                            <ProgressBar value={storagePercent} size="lg" />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="p-3 bg-muted/30 rounded-lg">
                                                                <span className="text-xs text-muted-foreground">Used</span>
                                                                <p className="font-semibold text-sm">{formatBytes(node.storage.used)}</p>
                                                            </div>
                                                            <div className="p-3 bg-muted/30 rounded-lg">
                                                                <span className="text-xs text-muted-foreground">Total</span>
                                                                <p className="font-semibold text-sm">{formatBytes(node.storage.total)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="system" className="mt-0">
                                            {detailedStats ? (
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <InfoRow label="CPU Usage" value={`${(detailedStats.cpu_percent ?? 0).toFixed(1)}%`} icon={Cpu} />
                                                    <InfoRow label="RAM Usage" value={ramPercent ? `${ramPercent.toFixed(1)}%` : 'N/A'} icon={MemoryStick} />
                                                    <InfoRow label="RAM Used" value={formatBytes(detailedStats.ram_used ?? 0)} />
                                                    <InfoRow label="RAM Total" value={formatBytes(detailedStats.ram_total ?? 0)} />
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center text-muted-foreground">
                                                    <Cpu className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm">System metrics unavailable</p>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="network" className="mt-0">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <InfoRow label="IP Address" value={node.network?.ipAddress || 'N/A'} icon={Globe} copyable onCopy={() => copyToClipboard(node.network?.ipAddress || '', 'IP')} />
                                                <InfoRow label="Port" value={String(node.network?.port || 'N/A')} />
                                                <InfoRow label="RPC Port" value={String(node.network?.rpcPort || 'N/A')} />
                                                <InfoRow label="Active Streams" value={String(detailedStats?.active_streams || 'N/A')} icon={Activity} />
                                            </div>
                                        </TabsContent>
                                    </CardContent>
                                </Tabs>
                            </Card>

                            {/* Similar Nodes - Desktop Position (No Gap) */}
                            {similarNodes.length > 0 && (
                                <Card className="hidden lg:block">
                                    <CardHeader className="pb-3 border-b">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            Similar Nodes
                                        </CardTitle>
                                    </CardHeader>
                                    <div className="divide-y">
                                        {similarNodes.slice(0, 3).map((similar) => (
                                            <button
                                                key={similar.id}
                                                onClick={() => router.push(`/nodes/${similar.id}`)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left group"
                                            >
                                                <div className="min-w-0 flex-1 mr-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-mono text-sm font-medium truncate group-hover:text-primary transition-colors">{similar.id}</span>
                                                        <StatusBadge status={similar.status} size="sm" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <MapPin className="h-3 w-3" />
                                                        {similar.location?.country || 'Unknown'}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            )}

                        </div>

                        {/* Side Column */}
                        <div className="space-y-6">
                            {/* Node Summary */}
                            <div data-tour="node-ai-summary">
                                <NodeSummary
                                    node={node}
                                    networkStats={{
                                        avgUptime: enrichedNodes.reduce((sum, n) => sum + n.uptime, 0) / enrichedNodes.length,
                                        avgHealth: enrichedNodes.reduce((sum, n) => sum + n.healthScore, 0) / enrichedNodes.length,
                                        totalNodes: enrichedNodes.length,
                                        creditsThreshold
                                    }}
                                />
                            </div>

                            {/* Location Card */}
                            {displayLocation && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-primary" />
                                            Location
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Country</p>
                                                <p className="font-medium">{displayLocation.country}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">City</p>
                                                <p className="font-medium">{displayLocation.city || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => router.push(`/map/regions/${encodeURIComponent(displayLocation.country)}`)}
                                        >
                                            <MapPin className="h-3.5 w-3.5 mr-1.5" /> View All {displayLocation.country} Nodes
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Operator Card */}
                            {!operatorLoading && operator && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" />
                                            Operator
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="text-sm">
                                            <p className="text-muted-foreground mb-1">Manager Address</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 text-xs font-mono bg-muted px-2 py-1.5 rounded break-all">
                                                    {operator.manager}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 shrink-0"
                                                    onClick={() => copyToClipboard(operator.manager, 'Operator address')}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Nodes Owned</p>
                                                <p className="font-medium">{operator.totalOwned}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Total Credits</p>
                                                <p className="font-medium">{operator.credits.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full" asChild>
                                            <Link href={`/operators/${operator.manager}`}>
                                                <Users className="h-3.5 w-3.5 mr-1.5" /> View Operator
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Similar Nodes - Mobile Order: Last */}
                        {similarNodes.length > 0 && (
                            <Card className="lg:hidden">
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        Similar Nodes
                                    </CardTitle>
                                </CardHeader>
                                <div className="divide-y">
                                    {similarNodes.slice(0, 3).map((similar) => (
                                        <button
                                            key={similar.id}
                                            onClick={() => router.push(`/nodes/${similar.id}`)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left group"
                                        >
                                            <div className="min-w-0 flex-1 mr-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm font-medium truncate group-hover:text-primary transition-colors">{similar.id}</span>
                                                    <StatusBadge status={similar.status} size="sm" />
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <MapPin className="h-3 w-3" />
                                                    {similar.location?.country || 'Unknown'}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main >

            <Footer />
        </div >
    );
}
