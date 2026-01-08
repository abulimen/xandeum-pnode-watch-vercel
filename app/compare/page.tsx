'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNodes, useNodeLocations } from '@/hooks';
import { useCredits, enrichNodesWithCreditsData } from '@/hooks/useCredits';
import { enrichNodesWithStakingData } from '@/lib/services/analyticsService';
import {
    GitCompareArrows,
    Plus,
    X,
    Search,
    TrendingUp,
    TrendingDown,
    Minus,
    Server,
    Clock,
    HardDrive,
    Activity,
    Sparkles,
    BarChart3,
    Globe,
    Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PNode } from '@/types/pnode';

const MAX_NODES = 4;

// Colors for nodes in charts
const NODE_COLORS = [
    'hsl(var(--primary))',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
];

export default function ComparePage() {
    const { nodes: rawNodes, isLoading } = useNodes();
    const { creditsMap, avgCredits: networkAvgCredits } = useCredits();
    const [selectedNodes, setSelectedNodes] = useState<PNode[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Enrich nodes with staking metadata and credits from API
    const enrichedNodes = useMemo(() => {
        const withStaking = enrichNodesWithStakingData(rawNodes);
        return enrichNodesWithCreditsData(withStaking, creditsMap);
    }, [rawNodes, creditsMap]);

    // Fetch geolocation for all nodes
    const { nodesWithLocation: nodes } = useNodeLocations(enrichedNodes);

    // Calculate network averages
    const networkAverages = useMemo(() => {
        if (!nodes.length) return null;

        const onlineNodes = nodes.filter(n => n.status === 'online');
        const totalCredits = nodes.reduce((sum, n) => sum + (n.credits || 0), 0);
        const avgCredits = totalCredits / nodes.length;
        const avgUptime = nodes.reduce((sum, n) => sum + (n.uptime || 0), 0) / nodes.length;
        const avgHealth = nodes.reduce((sum, n) => sum + (n.healthScore || 0), 0) / nodes.length;
        const avgStorage = nodes.reduce((sum, n) => sum + (n.storage?.total || 0), 0) / nodes.length;

        return {
            totalNodes: nodes.length,
            onlineNodes: onlineNodes.length,
            avgCredits,
            avgUptime,
            avgHealth,
            avgStorage,
        };
    }, [nodes]);

    // Filter nodes for search
    const filteredNodes = useMemo(() => {
        if (!searchQuery.trim()) return nodes.slice(0, 20);

        const query = searchQuery.toLowerCase();
        return nodes.filter(n =>
            n.id.toLowerCase().includes(query) ||
            n.publicKey?.toLowerCase().includes(query) ||
            n.location?.country?.toLowerCase().includes(query) ||
            n.location?.city?.toLowerCase().includes(query)
        ).slice(0, 20);
    }, [nodes, searchQuery]);

    const addNode = (node: PNode) => {
        if (selectedNodes.length >= MAX_NODES) return;
        if (selectedNodes.find(n => n.id === node.id)) return;
        setSelectedNodes([...selectedNodes, node]);
        setSearchQuery('');
        setIsSearchOpen(false);
    };

    const removeNode = (nodeId: string) => {
        setSelectedNodes(selectedNodes.filter(n => n.id !== nodeId));
    };

    const clearAll = () => {
        setSelectedNodes([]);
    };


    const formatNumber = (num: number) => {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toFixed(0);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const value = bytes / Math.pow(1024, i);
        // Use whole number if possible, otherwise 1 decimal
        return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}${units[i]}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'degraded': return 'bg-yellow-500';
            default: return 'bg-red-500';
        }
    };

    const getComparisonIndicator = (value: number, avg: number) => {
        const diff = ((value - avg) / avg) * 100;
        if (Math.abs(diff) < 5) return <Minus className="h-3 w-3 text-muted-foreground" />;
        if (diff > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
        return <TrendingDown className="h-3 w-3 text-red-500" />;
    };

    // Get heatmap background color based on value vs average
    const getHeatmapClass = (value: number, avg: number, higherIsBetter: boolean = true) => {
        if (avg === 0) return 'bg-muted';
        const diff = ((value - avg) / avg) * 100;

        if (Math.abs(diff) < 5) return 'bg-muted'; // Around average

        const isGood = higherIsBetter ? diff > 0 : diff < 0;

        if (isGood) {
            if (Math.abs(diff) > 20) return 'bg-green-500/20 text-green-700 dark:text-green-400';
            return 'bg-green-500/10 text-green-600 dark:text-green-500';
        } else {
            if (Math.abs(diff) > 20) return 'bg-red-500/20 text-red-700 dark:text-red-400';
            return 'bg-red-500/10 text-red-600 dark:text-red-500';
        }
    };

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-6 pb-20 max-w-full overflow-x-hidden">
                {/* Page Header */}
                <div className="mb-6" data-tour="compare-header">
                    <div className="flex items-center gap-3 mb-2">
                        <GitCompareArrows className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Compare Nodes</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Select up to {MAX_NODES} nodes to compare their performance side-by-side
                    </p>
                </div>

                {/* Node Selector */}
                <Card className="mb-6 relative z-10" data-tour="compare-search">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Selected Nodes</CardTitle>
                                <CardDescription>
                                    {selectedNodes.length} of {MAX_NODES} nodes selected
                                </CardDescription>
                            </div>
                            {selectedNodes.length > 0 && (
                                <Button variant="outline" size="sm" onClick={clearAll}>
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {/* Selected node badges */}
                            {selectedNodes.map((node, index) => (
                                <div
                                    key={node.id}
                                    className="flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 max-w-[140px] sm:max-w-none"
                                    style={{ borderLeft: `3px solid ${NODE_COLORS[index]}` }}
                                >
                                    <div className={cn("w-2 h-2 rounded-full shrink-0", getStatusColor(node.status))} />
                                    <span className="font-mono text-xs sm:text-sm truncate">{node.id}</span>
                                    <button
                                        onClick={() => removeNode(node.id)}
                                        className="p-0.5 hover:bg-background rounded shrink-0"
                                    >
                                        <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </div>
                            ))}

                            {/* Add node button/search */}
                            {selectedNodes.length < MAX_NODES && (
                                <div className="relative z-50">
                                    {isSearchOpen ? (
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search by ID, location..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9 w-[200px] sm:w-64"
                                                    autoFocus
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setIsSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => setIsSearchOpen(true)}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Node
                                        </Button>
                                    )}

                                    {/* Search results dropdown */}
                                    {isSearchOpen && (
                                        <Card className="absolute top-12 left-0 z-[9999] w-80 shadow-lg bg-background border">
                                            <ScrollArea className="h-64">
                                                <div className="p-2">
                                                    {isLoading ? (
                                                        <div className="p-4 text-center text-muted-foreground">
                                                            Loading nodes...
                                                        </div>
                                                    ) : filteredNodes.length === 0 ? (
                                                        <div className="p-4 text-center text-muted-foreground">
                                                            No nodes found
                                                        </div>
                                                    ) : (
                                                        filteredNodes.map(node => (
                                                            <button
                                                                key={node.id}
                                                                onClick={() => addNode(node)}
                                                                disabled={selectedNodes.some(n => n.id === node.id)}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-muted transition-colors",
                                                                    selectedNodes.some(n => n.id === node.id) && "opacity-50 cursor-not-allowed"
                                                                )}
                                                            >
                                                                <div className={cn("w-2 h-2 rounded-full shrink-0", getStatusColor(node.status))} />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-mono text-sm truncate">{node.id}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {node.location?.country || 'Unknown'} • {formatNumber(node.credits || 0)} credits
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Comparison Content */}
                {selectedNodes.length > 0 ? (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Comparison Table - Desktop Only */}
                        <Card className="lg:col-span-2 hidden md:block" data-tour="compare-table">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <BarChart3 className="h-4 w-4" />
                                    Performance Comparison
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 px-2 font-medium">Metric</th>
                                                <th className="text-center py-2 px-2 font-medium text-muted-foreground text-xs">
                                                    Avg
                                                </th>
                                                {selectedNodes.map((node, index) => (
                                                    <th
                                                        key={node.id}
                                                        className="text-center py-2 px-1 font-medium text-xs"
                                                        style={{ color: NODE_COLORS[index] }}
                                                    >
                                                        {node.id.slice(0, 6)}...
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs">
                                            <tr className="border-b">
                                                <td className="py-2 px-2">Status</td>
                                                <td className="text-center py-2 px-2 text-muted-foreground">—</td>
                                                {selectedNodes.map(node => (
                                                    <td key={node.id} className="text-center py-2 px-1">
                                                        <Badge variant="default" className={cn("text-[10px] px-1.5", getStatusColor(node.status))}>
                                                            {node.status}
                                                        </Badge>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-2">Uptime 24h</td>
                                                <td className="text-center py-2 px-2 text-muted-foreground">{networkAverages?.avgUptime.toFixed(0)}%</td>
                                                {selectedNodes.map(node => (
                                                    <td key={node.id} className="text-center py-2 px-1">
                                                        {(node.uptime || 0).toFixed(0)}%
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-2">Credits</td>
                                                <td className="text-center py-2 px-2 text-muted-foreground">{formatNumber(networkAverages?.avgCredits || 0)}</td>
                                                {selectedNodes.map(node => (
                                                    <td key={node.id} className="text-center py-2 px-1">{formatNumber(node.credits || 0)}</td>
                                                ))}
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-2">Health</td>
                                                <td className="text-center py-2 px-2 text-muted-foreground">{networkAverages?.avgHealth.toFixed(0)}</td>
                                                {selectedNodes.map(node => (
                                                    <td key={node.id} className="text-center py-2 px-1">{node.healthScore || 0}</td>
                                                ))}
                                            </tr>
                                            <tr className="border-b">
                                                <td className="py-2 px-2">Storage</td>
                                                <td className="text-center py-2 px-2 text-muted-foreground">{formatBytes(networkAverages?.avgStorage || 0)}</td>
                                                {selectedNodes.map(node => (
                                                    <td key={node.id} className="text-center py-2 px-1">{formatBytes(node.storage?.total || 0)}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="py-2 px-2">Location</td>
                                                <td className="text-center py-2 px-2 text-muted-foreground">—</td>
                                                {selectedNodes.map(node => (
                                                    <td key={node.id} className="text-center py-2 px-1 truncate max-w-[60px]">{node.location?.country || '—'}</td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mobile Cards - One per node */}
                        <div className="md:hidden space-y-4 col-span-full">
                            <h3 className="font-semibold flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Performance Comparison
                            </h3>

                            {/* Network Average Card */}
                            <Card className="border-dashed">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                                        <span className="font-medium text-sm text-muted-foreground">Network Average</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <div className="text-muted-foreground">Uptime 24h</div>
                                            <div className="font-mono font-medium">{networkAverages?.avgUptime.toFixed(0)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Credits</div>
                                            <div className="font-mono font-medium">{formatNumber(networkAverages?.avgCredits || 0)}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Health</div>
                                            <div className="font-mono font-medium">{networkAverages?.avgHealth.toFixed(0)}/100</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Individual Node Cards */}
                            {selectedNodes.map((node, index) => (
                                <Card key={node.id} style={{ borderLeftColor: NODE_COLORS[index], borderLeftWidth: 3 }}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2.5 h-2.5 rounded-full", getStatusColor(node.status))} />
                                                <span className="font-mono text-sm font-medium">{node.id}</span>
                                            </div>
                                            <Badge variant="default" className={cn("text-[10px]", getStatusColor(node.status))}>
                                                {node.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                                            <div>
                                                <div className="text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Uptime 24h
                                                </div>
                                                <div className="font-mono font-medium flex items-center gap-1">
                                                    {(node.uptime || 0).toFixed(0)}%
                                                    {networkAverages && getComparisonIndicator(node.uptime || 0, networkAverages.avgUptime)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground flex items-center gap-1">
                                                    <Coins className="h-3 w-3" />
                                                    Credits
                                                </div>
                                                <div className="font-mono font-medium flex items-center gap-1">
                                                    {formatNumber(node.credits || 0)}
                                                    {networkAverages && getComparisonIndicator(node.credits || 0, networkAverages.avgCredits)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground flex items-center gap-1">
                                                    <Activity className="h-3 w-3" />
                                                    Health
                                                </div>
                                                <div className="font-mono font-medium flex items-center gap-1">
                                                    {node.healthScore || 0}/100
                                                    {networkAverages && getComparisonIndicator(node.healthScore || 0, networkAverages.avgHealth)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
                                            <div>
                                                <div className="text-muted-foreground flex items-center gap-1">
                                                    <HardDrive className="h-3 w-3" />
                                                    Storage
                                                </div>
                                                <div className="font-mono font-medium">{formatBytes(node.storage?.total || 0)}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground flex items-center gap-1">
                                                    <Globe className="h-3 w-3" />
                                                    Location
                                                </div>
                                                <div className="font-medium">{node.location?.country || 'Unknown'}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Heatmap Comparison Table */}
                        <Card className="lg:col-span-2" data-tour="compare-heatmap">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <BarChart3 className="h-4 w-4" />
                                    Quick Compare
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    🟢 Above avg  🔴 Below avg  ⬜ Around avg
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs sm:text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 px-1 sm:px-2 font-medium w-16 sm:w-20">Node</th>
                                                <th className="text-center py-2 px-1 sm:px-2 font-medium">24h</th>
                                                <th className="text-center py-2 px-1 sm:px-2 font-medium">Credits</th>
                                                <th className="text-center py-2 px-1 sm:px-2 font-medium">Health</th>
                                                <th className="text-center py-2 px-1 sm:px-2 font-medium">Storage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Network Average Row */}
                                            <tr className="border-b bg-muted/30">
                                                <td className="py-2 px-1 sm:px-2 font-medium text-muted-foreground">
                                                    <span className="hidden sm:inline">Network</span>
                                                    <span className="sm:hidden">Avg</span>
                                                </td>
                                                <td className="text-center py-2 px-1 sm:px-2 font-mono text-muted-foreground">
                                                    {networkAverages?.avgUptime.toFixed(0)}%
                                                </td>
                                                <td className="text-center py-2 px-1 sm:px-2 font-mono text-muted-foreground">
                                                    {formatNumber(networkAverages?.avgCredits || 0)}
                                                </td>
                                                <td className="text-center py-2 px-1 sm:px-2 font-mono text-muted-foreground">
                                                    {networkAverages?.avgHealth.toFixed(0)}
                                                </td>
                                                <td className="text-center py-2 px-1 sm:px-2 font-mono text-muted-foreground">
                                                    {formatBytes(networkAverages?.avgStorage || 0)}
                                                </td>
                                            </tr>

                                            {/* Node Rows */}
                                            {selectedNodes.map((node, index) => (
                                                <tr key={node.id} className="border-b last:border-0">
                                                    <td className="py-2 px-1 sm:px-2">
                                                        <div className="flex items-center gap-1">
                                                            <div
                                                                className="w-2 h-2 rounded-full shrink-0"
                                                                style={{ backgroundColor: NODE_COLORS[index] }}
                                                            />
                                                            <span className="font-mono truncate max-w-[50px] sm:max-w-[70px]">
                                                                {node.id.slice(0, 6)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className={cn(
                                                        "text-center py-2 px-1 sm:px-2 font-mono rounded",
                                                        networkAverages && getHeatmapClass(node.uptime || 0, networkAverages.avgUptime)
                                                    )}>
                                                        {(node.uptime || 0).toFixed(0)}%
                                                    </td>
                                                    <td className={cn(
                                                        "text-center py-2 px-1 sm:px-2 font-mono rounded",
                                                        networkAverages && getHeatmapClass(node.credits || 0, networkAverages.avgCredits)
                                                    )}>
                                                        {formatNumber(node.credits || 0)}
                                                    </td>
                                                    <td className={cn(
                                                        "text-center py-2 px-1 sm:px-2 font-mono rounded",
                                                        networkAverages && getHeatmapClass(node.healthScore || 0, networkAverages.avgHealth)
                                                    )}>
                                                        {node.healthScore || 0}
                                                    </td>
                                                    <td className={cn(
                                                        "text-center py-2 px-1 sm:px-2 font-mono rounded",
                                                        networkAverages && getHeatmapClass(node.storage?.total || 0, networkAverages.avgStorage)
                                                    )}>
                                                        {formatBytes(node.storage?.total || 0)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Compare */}
                        <Card className="lg:col-span-2" data-tour="compare-ai">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    AI Comparison
                                </CardTitle>
                                <CardDescription>
                                    Get intelligent insights about these nodes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Use the Copilot to get an AI-powered analysis of the selected nodes.
                                    It will compare their performance, identify strengths and weaknesses,
                                    and provide recommendations.
                                </p>
                                <Button
                                    className="w-full gap-2"
                                    onClick={() => {
                                        // Build detailed node info to avoid Copilot fetching stale data
                                        const nodeDetails = selectedNodes.map(n =>
                                            `${n.id}: ${formatNumber(n.credits || 0)} Credits, ${(n.uptime || 0).toFixed(1)}% Uptime, Health ${n.healthScore || 0}`
                                        ).join('\n');
                                        const message = `Compare these pNodes and tell me which is best for staking:\n${nodeDetails}`;
                                        // Dispatch custom event to trigger Copilot
                                        window.dispatchEvent(new CustomEvent('copilot:trigger', {
                                            detail: { message }
                                        }));
                                    }}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Ask Copilot to Compare
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Empty State */
                    <Card className="border-dashed">
                        <CardContent className="py-16 text-center">
                            <GitCompareArrows className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Nodes Selected</h3>
                            <p className="text-muted-foreground mb-4">
                                Click "Add Node" above to start comparing nodes
                            </p>
                            <Button onClick={() => setIsSearchOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Your First Node
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>

            <Footer />
        </div>
    );
}
