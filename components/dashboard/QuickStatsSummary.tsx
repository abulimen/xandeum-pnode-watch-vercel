/**
 * QuickStatsSummary Component
 * Provides a concise overview of the current network state and filter results
 */

'use client';

import { PNode } from '@/types/pnode';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStatsSummaryProps {
    nodes: PNode[];
    filteredCount: number;
    startItem?: number;
    endItem?: number;
}

export function QuickStatsSummary({ nodes, filteredCount, startItem, endItem }: QuickStatsSummaryProps) {
    const totalNodes = nodes.length;
    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const degradedNodes = nodes.filter(n => n.status === 'degraded').length;
    const offlineNodes = nodes.filter(n => n.status === 'offline').length;

    // Calculate network health percentage
    const healthScore = totalNodes > 0
        ? ((onlineNodes + (degradedNodes * 0.5)) / totalNodes) * 100
        : 0;

    // Display range if pagination info provided, otherwise just filtered count
    const displayText = startItem !== undefined && endItem !== undefined
        ? `Showing ${startItem}-${endItem} of ${filteredCount} nodes`
        : `Showing ${filteredCount} of ${totalNodes} nodes`;

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/30 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-full",
                    healthScore >= 90 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        healthScore >= 70 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            "bg-red-500/10 text-red-600 dark:text-red-400"
                )}>
                    {healthScore >= 90 ? <CheckCircle2 className="h-5 w-5" /> :
                        healthScore >= 70 ? <AlertTriangle className="h-5 w-5" /> :
                            <XCircle className="h-5 w-5" />}
                </div>
                <div>
                    <h3 className="font-medium text-sm">
                        {healthScore >= 90 ? "Network is Healthy" :
                            healthScore >= 70 ? "Network has Minor Issues" :
                                "Network requires Attention"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {onlineNodes} online, {degradedNodes} degraded, {offlineNodes} offline
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border border-border/50">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Online</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Degraded</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Offline</span>
                </div>
                <div className="w-px h-4 bg-border mx-1" />
                <span className="font-medium text-foreground">
                    {displayText}
                </span>
            </div>
        </div>
    );
}
