/**
 * NodeTable Component - Sortable table of pNodes
 * Enhanced with Framer Motion animations
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Plus, MoreHorizontal, ChevronDown } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { VersionBadge } from '@/components/ui/VersionBadge';
import { PNode } from '@/types/pnode';
import { SortColumn, SortDirection } from '@/types/filters';
import { formatRelativeTime, formatBytes, formatDuration } from '@/lib/services/analyticsService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useNetwork } from '@/contexts/NetworkDataContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NodeTableProps {
    nodes: PNode[];
    isLoading: boolean;
    sortColumn: SortColumn;
    sortDirection: SortDirection;
    onSort: (column: SortColumn) => void;
    onNodeSelect?: (nodeId: string) => void;
    onCompareAdd?: (nodeId: string) => void;
    selectedForCompare?: string[];
    viewMode?: 'table' | 'cards';
}

interface SortableHeaderProps {
    column: SortColumn;
    label: string;
    currentColumn: SortColumn;
    direction: SortDirection;
    onSort: (column: SortColumn) => void;
}

function SortableHeader({ column, label, currentColumn, direction, onSort }: SortableHeaderProps) {
    const isActive = column === currentColumn;

    return (
        <Button
            variant="ghost"
            className="h-8 px-2 -ml-2 font-semibold hover:bg-transparent"
            onClick={() => onSort(column)}
        >
            {label}
            {isActive ? (
                direction === 'asc' ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                )
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
        </Button>
    );
}

function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                </TableRow>
            ))}
        </>
    );
}

function MobileNodeCard({ node, onSelect, onCompareAdd, isSelected }: {
    node: PNode;
    onSelect?: (id: string) => void;
    onCompareAdd?: (id: string) => void;
    isSelected: boolean;
}) {
    const router = useRouter();
    const { getNodeNetworks } = useNetwork();
    const storagePercent = node.storage.usagePercent || 0;
    const networks = getNodeNetworks(node.publicKey || node.id);

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on buttons/dropdowns
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[role="menu"]') || target.closest('[role="menuitem"]')) {
            return;
        }
        router.push(`/nodes/${node.id}`);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            <div
                className={cn(
                    "p-4 rounded-lg border bg-card shadow-sm space-y-3 cursor-pointer hover:bg-muted/50 hover:shadow-md transition-all",
                    isSelected && "border-primary ring-1 ring-primary"
                )}
                onClick={handleCardClick}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StatusBadge status={node.status} size="sm" />
                        <span className="font-mono text-sm font-medium truncate max-w-[120px]">
                            {node.id}
                        </span>
                        {node.isPublic && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                                Public
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <FavoriteButton nodeId={node.id} size="sm" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(node.publicKey || node.id);
                                    toast.success('Public key copied');
                                }}>
                                    <Copy className="mr-2 h-4 w-4" /> Copy Pubkey
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(node.id);
                                    toast.success('ID copied');
                                }}>
                                    <Copy className="mr-2 h-4 w-4" /> Copy ID
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    onCompareAdd?.(node.id);
                                }} disabled={isSelected}>
                                    <Plus className="mr-2 h-4 w-4" /> Compare
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/nodes/${node.id}`}>
                                        <ExternalLink className="mr-2 h-4 w-4" /> View Details
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Uptime (24h)</span>
                        <span className={cn(
                            "font-medium",
                            node.uptime >= 99 ? "text-emerald-500" :
                                node.uptime >= 80 ? "text-amber-500" : "text-red-500"
                        )}>
                            {node.uptime.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Credits</span>
                        <span className="font-bold">
                            {node.credits?.toLocaleString() ?? '--'}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Version</span>
                        <span className="font-medium font-mono text-xs">
                            {node.version || '--'}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Network</span>
                        {networks.length === 0 ? (
                            <span className="text-muted-foreground">--</span>
                        ) : networks.includes('mainnet') && networks.includes('devnet') ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium border border-purple-500/20 w-fit">
                                Both
                            </span>
                        ) : networks.includes('mainnet') ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20 w-fit">
                                Mainnet
                            </span>
                        ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20 w-fit">
                                Devnet
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Online For</span>
                        <span className="font-medium">
                            {formatDuration(node.uptimeSeconds || 0)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Storage</span>
                        <span className="font-medium">{formatBytes(node.storage.total)}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Usage</span>
                        <span>{storagePercent.toFixed(2)}%</span>
                    </div>
                    <ProgressBar value={storagePercent} size="sm" showLabel={false} />
                </div>

                {node.location && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>📍</span>
                        {node.location.city}, {node.location.country}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Sort column options for mobile dropdown
const sortOptions: { value: SortColumn; label: string }[] = [
    { value: 'status', label: 'Status' },
    { value: 'id', label: 'Node ID' },
    { value: 'uptime', label: 'Uptime (24h)' },
    { value: 'stakingScore', label: 'Credits' },
    { value: 'responseTime', label: 'Online For' },
    { value: 'storage', label: 'Storage' },
    { value: 'lastSeen', label: 'Last Seen' },
];

function MobileSortControls({
    sortColumn,
    sortDirection,
    onSort
}: {
    sortColumn: SortColumn;
    sortDirection: SortDirection;
    onSort: (column: SortColumn) => void;
}) {
    const currentLabel = sortOptions.find(o => o.value === sortColumn)?.label || 'Sort by';

    const handleDirectionToggle = () => {
        // Calling onSort with same column toggles direction
        onSort(sortColumn);
    };

    return (
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50 border">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-between h-9">
                        <span className="text-sm">Sort by: <span className="font-medium">{currentLabel}</span></span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    {sortOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => onSort(option.value)}
                            className={cn(
                                "cursor-pointer",
                                sortColumn === option.value && "bg-primary/10 text-primary"
                            )}
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={handleDirectionToggle}
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            >
                {sortDirection === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                ) : (
                    <ArrowDown className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}

export function NodeTable({
    nodes,
    isLoading,
    sortColumn,
    sortDirection,
    onSort,
    onNodeSelect,
    onCompareAdd,
    selectedForCompare = [],
    viewMode = 'table',
}: NodeTableProps) {
    const router = useRouter();
    const { getNodeNetworks } = useNetwork();

    const copyToClipboard = (text: string, label: string = 'Node ID') => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const handleRowClick = (e: React.MouseEvent, nodeId: string) => {
        // Don't navigate if clicking on buttons, links, or interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a') || target.closest('[role="menu"]') || target.closest('[role="menuitem"]')) {
            return;
        }
        router.push(`/nodes/${nodeId}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="hidden md:block rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                                <TableHead className="w-20"><Skeleton className="h-4 w-8" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableSkeleton />
                        </TableBody>
                    </Table>
                </div>
                <div className="md:hidden space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-lg border bg-card space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (nodes.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
                No nodes found matching your criteria.
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View - shown when viewMode is 'table' */}
            <div className={cn(
                "rounded-md border shadow-sm overflow-hidden",
                viewMode === 'table' ? "hidden md:block" : "hidden"
            )}>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-12">
                                <SortableHeader column="status" label="Status" currentColumn={sortColumn} direction={sortDirection} onSort={onSort} />
                            </TableHead>
                            <TableHead>
                                <SortableHeader column="id" label="Node ID" currentColumn={sortColumn} direction={sortDirection} onSort={onSort} />
                            </TableHead>
                            <TableHead>
                                <SortableHeader column="uptime" label="Uptime (24h)" currentColumn={sortColumn} direction={sortDirection} onSort={onSort} />
                            </TableHead>
                            <TableHead>
                                <SortableHeader column="stakingScore" label="Credits" currentColumn={sortColumn} direction={sortDirection} onSort={onSort} />
                            </TableHead>
                            <TableHead className="w-[80px]">Version</TableHead>
                            <TableHead className="w-[80px]">Network</TableHead>
                            <TableHead>
                                <SortableHeader column="responseTime" label="Online For" currentColumn={sortColumn} direction={sortDirection} onSort={onSort} />
                            </TableHead>
                            <TableHead>
                                <SortableHeader column="storage" label="Storage" currentColumn={sortColumn} direction={sortDirection} onSort={onSort} />
                            </TableHead>
                            <TableHead>
                                <SortableHeader column="lastSeen" label="Last Seen" currentColumn={sortColumn} direction={sortDirection} onSort={onSort} />
                            </TableHead>
                            <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {nodes.map((node) => {
                            const storagePercent = node.storage.usagePercent || 0;
                            const isSelected = selectedForCompare.includes(node.id);

                            return (
                                <TableRow
                                    key={node.id}
                                    className={cn(
                                        "cursor-pointer transition-colors hover:bg-muted/50",
                                        isSelected && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                    onClick={(e) => handleRowClick(e, node.id)}
                                >
                                    <TableCell>
                                        <StatusBadge status={node.status} size="md" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/nodes/${node.id}`}
                                                className="font-mono text-sm hover:underline font-medium text-primary"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {node.id}
                                            </Link>
                                            {node.isPublic ? (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                                                    Public
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
                                                    Private
                                                </span>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(node.publicKey || node.id, 'Public key');
                                                }}
                                                title="Copy Public Key"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {node.location && (
                                            <p className="text-xs text-muted-foreground">
                                                {node.location.city}, {node.location.country}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <span className={cn(
                                                "font-medium",
                                                node.uptime >= 99 && "text-emerald-500",
                                                node.uptime >= 95 && node.uptime < 99 && "text-emerald-400",
                                                node.uptime >= 80 && node.uptime < 95 && "text-amber-500",
                                                node.uptime < 80 && "text-red-500"
                                            )}>
                                                {node.uptime.toFixed(1)}%
                                            </span>
                                            <span className="text-xs" title={node.uptimeBadge}>
                                                {node.uptimeBadge === 'elite' && '🏆'}
                                                {node.uptimeBadge === 'reliable' && '✅'}
                                                {node.uptimeBadge === 'average' && '⚡'}
                                                {node.uptimeBadge === 'unreliable' && '⚠️'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {node.credits !== undefined ? (
                                                <span className="font-bold text-foreground">
                                                    {node.credits.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">--</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground font-mono">
                                            {node.version || '--'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {(() => {
                                            const networks = getNodeNetworks(node.publicKey || node.id);
                                            if (networks.length === 0) {
                                                return <span className="text-xs text-muted-foreground">--</span>;
                                            }
                                            if (networks.includes('mainnet') && networks.includes('devnet')) {
                                                return (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium border border-purple-500/20">
                                                        Both
                                                    </span>
                                                );
                                            }
                                            if (networks.includes('mainnet')) {
                                                return (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                                                        Mainnet
                                                    </span>
                                                );
                                            }
                                            return (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
                                                    Devnet
                                                </span>
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDuration(node.uptimeSeconds || 0)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-32 space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium">{formatBytes(node.storage.total)}</span>
                                                <span className="text-muted-foreground">{storagePercent.toFixed(2)}%</span>
                                            </div>
                                            <ProgressBar value={storagePercent} size="sm" showLabel={false} />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatRelativeTime(node.lastSeen)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <FavoriteButton nodeId={node.id} size="sm" />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCompareAdd?.(node.id);
                                                }}
                                                disabled={isSelected}
                                                title="Compare"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                asChild
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Link href={`/nodes/${node.id}`}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Desktop Card View - shown when viewMode is 'cards' */}
            <div className={cn(
                "space-y-4",
                viewMode === 'cards' ? "hidden md:block" : "hidden"
            )}>
                <MobileSortControls
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {nodes.map((node) => (
                        <MobileNodeCard
                            key={node.id}
                            node={node}
                            onSelect={onNodeSelect}
                            onCompareAdd={onCompareAdd}
                            isSelected={selectedForCompare.includes(node.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile Card View - always shown on mobile */}
            <div className="md:hidden space-y-4">
                <MobileSortControls
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                />
                {nodes.map((node) => (
                    <MobileNodeCard
                        key={node.id}
                        node={node}
                        onSelect={onNodeSelect}
                        onCompareAdd={onCompareAdd}
                        isSelected={selectedForCompare.includes(node.id)}
                    />
                ))}
            </div>
        </>
    );
}
