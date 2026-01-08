'use client';

import { useMemo, useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { VersionBadge } from '@/components/ui/VersionBadge';
import {
    ArrowLeft,
    Copy,
    Check,
    ExternalLink,
    Wallet,
    Server,
    Coins,
    Database,
    HardDrive,
    Activity,
    Globe,
    Clock,
    TrendingUp,
    Zap,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useOperators } from '@/hooks/useOperators';
import { useNodes, useNodeLocations } from '@/hooks';
import { useCredits, enrichNodesWithCreditsData } from '@/hooks/useCredits';
import { enrichNodesWithStakingData } from '@/lib/services/analyticsService';
import { useNetworkData } from '@/contexts/NetworkDataContext';
import { NetworkBadge } from '@/components/NetworkToggle';
import Link from 'next/link';
import { formatBytes, formatDuration } from '@/lib/services/analyticsService';
import { cn } from '@/lib/utils';
import { PNode } from '@/types/pnode';

interface WalletBalance {
    address: string;
    xandBalance: number;
}

async function fetchWalletBalance(address: string): Promise<WalletBalance> {
    const res = await fetch(`/api/wallet/${address}`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
}

// Stats calculation helper
function calculateAggregateStats(nodes: PNode[]) {
    if (nodes.length === 0) {
        return {
            totalStorage: 0,
            usedStorage: 0,
            avgCredits: 0,
            avgUptime: 0,
            onlineCount: 0,
            offlineCount: 0
        };
    }

    const totalStorage = nodes.reduce((sum, n) => sum + (n.storage?.total || 0), 0);
    const usedStorage = nodes.reduce((sum, n) => sum + (n.storage?.used || 0), 0);
    const totalCredits = nodes.reduce((sum, n) => sum + (n.credits || 0), 0);
    const totalUptime = nodes.reduce((sum, n) => sum + (n.uptime || 0), 0);
    const onlineCount = nodes.filter(n => n.status === 'online').length;
    const offlineCount = nodes.filter(n => n.status === 'offline').length;

    return {
        totalStorage,
        usedStorage,
        avgCredits: nodes.length > 0 ? Math.round(totalCredits / nodes.length) : 0,
        avgUptime: nodes.length > 0 ? totalUptime / nodes.length : 0,
        onlineCount,
        offlineCount
    };
}

export default function OperatorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: managerId } = use(params);
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    // 1. Fetch Operator Data
    const { data: operatorsData, isLoading: isLoadingOp } = useOperators();
    const operator = useMemo(() =>
        operatorsData?.data.find(op => op.manager === managerId),
        [operatorsData, managerId]
    );

    // 2. Fetch Wallet Balance
    const { data: balance, isLoading: isLoadingBalance } = useQuery({
        queryKey: ['wallet', managerId],
        queryFn: () => fetchWalletBalance(managerId),
        enabled: !!managerId
    });

    // 3. Fetch all Nodes from pRPC and enrich with credits/staking data
    const { nodes, isLoading: isLoadingNodes } = useNodes();
    const { creditsMap } = useCredits();
    const { getNodeNetworks } = useNetworkData();

    // Enrich all nodes with staking data and credits (same as dashboard)
    const enrichedNodes = useMemo(() => {
        const withStakingData = enrichNodesWithStakingData(nodes);
        return enrichNodesWithCreditsData(withStakingData, creditsMap);
    }, [nodes, creditsMap]);

    // Apply location enrichment to enriched nodes
    const { nodesWithLocation } = useNodeLocations(enrichedNodes);

    // 4. Match operator's pnodeIds (pubkeys) with enriched nodes
    const operatorNodes = useMemo(() => {
        if (!operator || !nodesWithLocation.length) return [];
        // operator.pnodeIds contains full pubkeys, nodes have node.publicKey
        return nodesWithLocation.filter(n => operator.pnodeIds.includes(n.publicKey));
    }, [nodesWithLocation, operator]);

    // 5. Calculate aggregate stats for operator's nodes
    const aggregateStats = useMemo(() => calculateAggregateStats(operatorNodes), [operatorNodes]);

    const copyAddress = () => {
        navigator.clipboard.writeText(managerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Loading state
    if (isLoadingOp) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 container px-4 py-8 max-w-7xl mx-auto space-y-8">
                    <Skeleton className="h-12 w-1/3" />
                    <div className="grid gap-4 md:grid-cols-4">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32" />)}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Not found state
    if (!operator) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 container px-4 py-20 max-w-7xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4">Operator Not Found</h1>
                    <p className="text-muted-foreground mb-8">The operator with address {managerId} could not be found.</p>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container px-4 py-8 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" className="-ml-2 h-8 text-muted-foreground" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Operators
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                        Operator Details
                                    </h1>
                                    <p className="text-muted-foreground text-sm">
                                        Managing {operator.totalOwned} pNodes on Xandeum
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <code className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground break-all">
                                    {managerId}
                                </code>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyAddress}>
                                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                                <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
                                    <Link href={`https://solscan.io/account/${managerId}`} target="_blank" rel="noopener noreferrer">
                                        Solscan <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <NetworkBadge networks={operator.networks} />
                    </div>
                </div>

                <Separator />

                {/* Primary Stats Grid */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nodes Owned</CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{operator.totalOwned}</div>
                            <p className="text-xs text-muted-foreground">
                                {operator.fleetShare?.toFixed(2)}% of network
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">XAND Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-1">
                                {isLoadingBalance ? (
                                    <Skeleton className="h-8 w-20" />
                                ) : (
                                    <span>{balance?.xandBalance?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0'}</span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">XAND tokens held</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{operator.credits.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Accumulated credits</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Node Status</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">
                                {aggregateStats.onlineCount}
                                <span className="text-muted-foreground text-lg font-normal"> / {operatorNodes.length}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Online nodes</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatBytes(aggregateStats.totalStorage)}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatBytes(aggregateStats.usedStorage)} used
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Credits/Node</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{aggregateStats.avgCredits.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Per node average</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Uptime (24h)</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={cn(
                                "text-2xl font-bold",
                                aggregateStats.avgUptime >= 99 ? "text-emerald-500" :
                                    aggregateStats.avgUptime >= 80 ? "text-amber-500" : "text-red-500"
                            )}>
                                {aggregateStats.avgUptime.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">24h uptime average</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Registered</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{operator.registeredCount}</div>
                            <p className="text-xs text-muted-foreground">Visible on network</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Managed Nodes Table */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Managed Nodes ({operatorNodes.length})
                        </h2>
                        {isLoadingNodes && (
                            <span className="text-sm text-muted-foreground animate-pulse">Loading nodes...</span>
                        )}
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Node ID</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Network</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead>Uptime (24h)</TableHead>
                                        <TableHead>Storage</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {operatorNodes.length > 0 ? (
                                        operatorNodes.map((node) => (
                                            <TableRow
                                                key={node.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => router.push(`/nodes/${node.id}`)}
                                            >
                                                <TableCell>
                                                    <StatusBadge status={node.status} size="sm" />
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/nodes/${node.id}`}
                                                        className="font-mono text-sm text-primary hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {node.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                                        {node.network.ipAddress}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Globe className="h-3 w-3 text-muted-foreground" />
                                                        <span className="truncate max-w-[100px]">
                                                            {node.location?.city || node.location?.country || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const networks = getNodeNetworks(node.publicKey);
                                                        if (networks.includes('devnet') && networks.includes('mainnet')) {
                                                            return <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-500">Both</Badge>;
                                                        } else if (networks.includes('mainnet')) {
                                                            return <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-500">Mainnet</Badge>;
                                                        } else if (networks.includes('devnet')) {
                                                            return <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">Devnet</Badge>;
                                                        }
                                                        return <span className="text-muted-foreground text-xs">--</span>;
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    {node.versionType && node.versionType !== 'unknown' ? (
                                                        <VersionBadge version={node.version} versionType={node.versionType} />
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">{node.version || '--'}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        {node.credits?.toLocaleString() ?? '--'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        "font-medium",
                                                        node.uptime >= 99 ? "text-emerald-500" :
                                                            node.uptime >= 80 ? "text-amber-500" : "text-red-500"
                                                    )}>
                                                        {node.uptime.toFixed(1)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="w-24 space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span>{formatBytes(node.storage.total)}</span>
                                                        </div>
                                                        <ProgressBar value={node.storage.usagePercent || 0} size="sm" showLabel={false} />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                                        <Link href={`/nodes/${node.id}`}>
                                                            <ExternalLink className="h-3 w-3 mr-1" /> View
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : isLoadingNodes ? (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                {[...Array(9)].map((_, j) => (
                                                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                                <div className="space-y-2">
                                                    <p>No matching pRPC node data found for this operator's pNodes.</p>
                                                    <p className="text-xs">
                                                        This operator has {operator.pnodeIds.length} registered pNodes in the CSV data.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Fallback: Show pNode pubkeys if no pRPC data matched */}
                    {operatorNodes.length === 0 && operator.pnodeIds.length > 0 && !isLoadingNodes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {operator.registeredCount > 0 && operator.networks.length > 0
                                        ? 'Registered pNode Public Keys'
                                        : 'Unregistered pNode Public Keys'}
                                </CardTitle>
                                <CardDescription>
                                    {operator.registeredCount > 0 && operator.networks.length > 0
                                        ? 'These pNodes have on-chain identity (registered on mainnet, devnet, or both).'
                                        : 'These pNodes do not have on-chain identity yet. They are not registered on any network and do not earn credits.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {operator.pnodeIds.map((pubkey, i) => (
                                        <div key={pubkey} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-sm">#{i + 1}</span>
                                                <code className="text-xs font-mono truncate max-w-[300px]" title={pubkey}>
                                                    {pubkey}
                                                </code>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`https://solscan.io/account/${pubkey}`} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                                    <strong>Note:</strong> Registered nodes are pNodes that have an on-chain identity. They are visible on the Xandeum network (mainnet, devnet, or both) and earn credits based on their uptime and performance.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
