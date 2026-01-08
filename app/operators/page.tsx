'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Users,
    Server,
    Search,
    Archive,
    Database,
    AlertCircle,
    Coins,
    Check,
    ArrowLeft,
    LayoutGrid,
    List,
    ExternalLink,
    Copy,
    Info,
    HelpCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useOperators, Operator } from '@/hooks/useOperators';
import { toast } from 'sonner';

type ViewMode = 'cards' | 'list';

// Info tooltip component for explanations
function InfoTooltip({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button type="button" className="inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-muted/80 transition-colors">
                        <Info className="h-3 w-3 text-muted-foreground" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px] text-xs">
                    {children}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Network badge with proper logic
function OperatorNetworkBadge({ operator }: { operator: Operator }) {
    const { networks, registeredCount, totalOwned } = operator;

    // If no registered nodes, show "Unregistered" badge
    if (registeredCount === 0 || networks.length === 0) {
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs border-zinc-400/50 text-zinc-400 cursor-help">
                            Unregistered
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px] text-xs">
                        None of this operator's nodes have on-chain identity (not registered on any network).
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Determine network status based on what networks the nodes are on
    const hasDevnet = networks.includes('devnet');
    const hasMainnet = networks.includes('mainnet');

    let badgeContent: { label: string; className: string; tooltip: string };

    if (hasDevnet && hasMainnet) {
        badgeContent = {
            label: 'Both',
            className: 'border-purple-500/50 text-purple-500',
            tooltip: "This operator has nodes registered on both Devnet and Mainnet networks."
        };
    } else if (hasMainnet) {
        badgeContent = {
            label: 'Mainnet',
            className: 'border-emerald-500/50 text-emerald-500',
            tooltip: "All of this operator's registered nodes are on Mainnet only."
        };
    } else {
        badgeContent = {
            label: 'Devnet',
            className: 'border-amber-500/50 text-amber-500',
            tooltip: "All of this operator's registered nodes are on Devnet only."
        };
    }

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={cn("text-xs cursor-help", badgeContent.className)}>
                        {badgeContent.label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-xs">
                    {badgeContent.tooltip}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function StatCard({ title, value, icon: Icon, description }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

function OperatorCard({ operator, rank }: { operator: Operator; rank: number }) {
    const [copied, setCopied] = useState(false);

    const copyAddress = () => {
        navigator.clipboard.writeText(operator.manager);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const truncatedAddress = `${operator.manager.substring(0, 6)}...${operator.manager.substring(operator.manager.length - 4)}`;

    // Consider unregistered if registeredCount is 0 OR no network data
    const isUnregistered = operator.registeredCount === 0 || operator.networks.length === 0;
    const allRegistered = !isUnregistered && operator.registeredCount === operator.totalOwned;

    return (
        <Card className="hover:shadow-md transition-shadow relative group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-sm">#{rank}</span>
                        <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded cursor-pointer hover:bg-muted/80 transition-colors" onClick={copyAddress} title="Click to copy">
                            {truncatedAddress}
                        </code>
                        {copied && <Check className="h-3 w-3 text-green-500 animate-in fade-in" />}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <OperatorNetworkBadge operator={operator} />
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="cursor-help text-right">
                                    <span className="text-2xl font-bold">{operator.totalOwned}</span>
                                    <span className="text-xs text-muted-foreground block">
                                        {allRegistered ? 'All registered' : isUnregistered ? 'None registered' : `${operator.registeredCount} registered`}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] text-xs">
                                <div className="space-y-1">
                                    <p><strong>{operator.totalOwned}</strong> total nodes owned by this operator.</p>
                                    <p><strong>{operator.registeredCount}</strong> have on-chain identity (registered).</p>
                                    {isUnregistered && <p className="text-amber-500">Unregistered nodes don't earn credits.</p>}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1">
                            <p className="text-xs text-muted-foreground">Network Share</p>
                            <InfoTooltip>
                                Percentage of total network nodes owned by this operator.
                            </InfoTooltip>
                        </div>
                        <p className="text-sm font-medium">{operator.fleetShare?.toFixed(2)}%</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <p className="text-xs text-muted-foreground">Total Credits</p>
                            <InfoTooltip>
                                Cumulative credits earned by all registered nodes from this operator.
                            </InfoTooltip>
                        </div>
                        <p className="text-sm font-medium">{operator.credits.toLocaleString()}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/operators/${operator.manager}`}>
                        View Details
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function OperatorTableView({ operators, startRank }: { operators: Operator[]; startRank: number }) {
    const router = useRouter();

    const copyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        toast.success('Address copied');
    };

    return (
        <Card>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Network</TableHead>
                            <TableHead className="text-center">Nodes</TableHead>
                            <TableHead className="text-center">Fleet Share</TableHead>
                            <TableHead className="text-right">Credits</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {operators.map((op, i) => {
                            const truncated = `${op.manager.substring(0, 6)}...${op.manager.substring(op.manager.length - 4)}`;
                            const isUnregistered = op.registeredCount === 0 || op.networks.length === 0;
                            const allRegistered = !isUnregistered && op.registeredCount === op.totalOwned;
                            return (
                                <TableRow
                                    key={op.manager}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/operators/${op.manager}`)}
                                >
                                    <TableCell className="font-mono text-muted-foreground">
                                        {startRank + i}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
                                                {truncated}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyAddress(op.manager);
                                                }}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <OperatorNetworkBadge operator={op} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <TooltipProvider delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="cursor-help">
                                                        <span className="font-bold">{op.totalOwned}</span>
                                                        <span className="text-muted-foreground text-xs ml-1">
                                                            ({allRegistered ? 'all reg.' : isUnregistered ? 'none' : op.registeredCount + ' reg.'})
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs">
                                                    {op.totalOwned} nodes, {op.registeredCount} registered
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {op.fleetShare?.toFixed(2)}%
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {op.credits.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/operators/${op.manager}`}>
                                                <ExternalLink className="h-3 w-3 mr-1" /> View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}


export default function OperatorsPage() {
    const { data: apiResponse, rawData, isLoading, network } = useOperators();
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('cards');
    const router = useRouter();

    const data = apiResponse?.data || [];

    // Filter to only registered operators (those with on-chain identity)
    const registeredOperators = useMemo(() => {
        return data.filter(op => op.registeredCount > 0 && op.networks.length > 0);
    }, [data]);

    const stats = useMemo(() => {
        if (!data.length) return null;

        // Calculate registered vs unregistered nodes
        const registeredNodes = data.reduce((acc, op) => acc + op.registeredCount, 0);
        const totalNodes = data.reduce((acc, op) => acc + op.totalOwned, 0);

        // EXCEPTION: Unregistered nodes always shows data from ALL networks
        // Use rawData (unfiltered) to calculate global unregistered count
        const rawOperators = rawData?.data || [];
        const globalTotalNodes = rawOperators.reduce((acc, op) => acc + op.totalOwned, 0);
        const globalRegisteredNodes = rawOperators.reduce((acc, op) => acc + op.registeredCount, 0);
        const unregisteredNodes = globalTotalNodes - globalRegisteredNodes;

        // Only count operators with registered nodes
        const activeOperators = registeredOperators.length;

        // Credits only come from registered operators
        const totalCredits = registeredOperators.reduce((acc, op) => acc + op.credits, 0);
        const avgNodes = activeOperators > 0 ? registeredOperators.reduce((acc, op) => acc + op.totalOwned, 0) / activeOperators : 0;

        return {
            activeOperators,
            totalOperators: data.length,
            registeredNodes,
            unregisteredNodes, // Always from all networks
            totalNodes,
            totalCredits,
            avgNodes
        };
    }, [data, rawData, registeredOperators]);

    const filteredOperators = useMemo(() => {
        // Only show registered operators, then apply search
        if (!search) return registeredOperators;
        return registeredOperators.filter(op => op.manager.toLowerCase().includes(search.toLowerCase()));
    }, [registeredOperators, search]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container px-4 py-6 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" data-tour="operators-header">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="ghost" size="sm" className="-ml-2 h-8" onClick={() => router.back()}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Operators</h2>
                        <p className="text-muted-foreground">
                            Overview of pNode fleet managers{network !== 'all' ? ` on ${network}` : ''} and their performance.
                        </p>
                    </div>
                    <div className="flex items-center gap-2" data-tour="operators-search">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search managers..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {/* View Toggle */}
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-9 w-9 rounded-r-none"
                                onClick={() => setViewMode('cards')}
                                title="Card View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                className="h-9 w-9 rounded-l-none"
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="operators-stats">
                    {/* Active Operators - only registered */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-1">
                                <CardTitle className="text-sm font-medium">Active Operators</CardTitle>
                                <InfoTooltip>
                                    Only operators with at least one registered node are counted. Registered nodes have on-chain identity (visible on mainnet, devnet, or both).
                                </InfoTooltip>
                            </div>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-20" /> : stats?.activeOperators}</div>
                            <p className="text-xs text-muted-foreground">
                                With registered nodes
                            </p>
                        </CardContent>
                    </Card>

                    {/* Registered Nodes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-1">
                                <CardTitle className="text-sm font-medium">Registered Nodes</CardTitle>
                                <InfoTooltip>
                                    Nodes with on-chain identity visible on mainnet and/or devnet. These nodes earn credits based on uptime and performance.
                                </InfoTooltip>
                            </div>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">{isLoading ? <Skeleton className="h-8 w-20" /> : stats?.registeredNodes}</div>
                            <p className="text-xs text-muted-foreground">
                                On-chain identity
                            </p>
                        </CardContent>
                    </Card>

                    {/* Unregistered Nodes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-1">
                                <CardTitle className="text-sm font-medium">Unregistered Nodes</CardTitle>
                                <InfoTooltip>
                                    Nodes without on-chain identity. They are not visible on mainnet/devnet and do not earn credits until registered.
                                </InfoTooltip>
                            </div>
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-400">{isLoading ? <Skeleton className="h-8 w-20" /> : stats?.unregisteredNodes}</div>
                            <p className="text-xs text-muted-foreground">
                                No on-chain identity
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Credits */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-1">
                                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                                <InfoTooltip>
                                    Cumulative credits earned by all registered operators. Only registered nodes contribute to credits.
                                </InfoTooltip>
                            </div>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : stats?.totalCredits.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                From registered nodes
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Registry</h3>
                        <span className="text-sm text-muted-foreground">
                            {filteredOperators.length} operators
                        </span>
                    </div>
                    {isLoading ? (
                        viewMode === 'cards' ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(8)].map((_, i) => (
                                    <Skeleton key={i} className="h-[180px] rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <div className="p-4 space-y-3">
                                    {[...Array(6)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            </Card>
                        )
                    ) : filteredOperators.length > 0 ? (
                        viewMode === 'cards' ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-tour="operators-list">
                                {filteredOperators.map((op, i) => (
                                    <OperatorCard key={op.manager} operator={op} rank={i + 1} />
                                ))}
                            </div>
                        ) : (
                            <OperatorTableView operators={filteredOperators} startRank={1} />
                        )
                    ) : (
                        <Card className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-dashed">
                            <Archive className="h-10 w-10 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No operators found</p>
                            <p className="text-sm">Try adjusting your search terms</p>
                        </Card>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
