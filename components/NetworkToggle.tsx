'use client';

import React from 'react';
import { useNetworkData, NetworkType } from '@/contexts/NetworkDataContext';
import { cn } from '@/lib/utils';

interface NetworkToggleProps {
    className?: string;
    compact?: boolean;
}

export function NetworkToggle({ className, compact = false }: NetworkToggleProps) {
    const { network, setNetwork, networkStats, isLoading } = useNetworkData();

    const options: { value: NetworkType; label: string; shortLabel: string; color: string; bgColor: string; count: number }[] = [
        {
            value: 'devnet',
            label: 'Devnet',
            shortLabel: 'Dev',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/20 border-emerald-500/40',
            count: networkStats.devnet,
        },
        {
            value: 'mainnet',
            label: 'Mainnet',
            shortLabel: 'Main',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20 border-blue-500/40',
            count: networkStats.mainnet,
        },
        {
            value: 'all',
            label: 'All',
            shortLabel: 'All',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/20 border-purple-500/40',
            count: networkStats.total,
        },
    ];

    if (isLoading) {
        return (
            <div className={cn("inline-flex items-center p-1 rounded-full bg-muted/50 border border-border", className)}>
                <div className="px-3 py-1.5 text-xs text-muted-foreground animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className={cn("inline-flex items-center p-0.5 sm:p-1 rounded-full bg-muted/50 border border-border", className)}>
            {options.map((option, index) => (
                <React.Fragment key={option.value}>
                    <button
                        onClick={() => setNetwork(option.value)}
                        className={cn(
                            "flex items-center justify-center rounded-full transition-all duration-200",
                            compact
                                ? "w-6 h-6 p-0"
                                : "gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5",
                            network === option.value
                                ? `${option.bgColor} border`
                                : "hover:bg-accent"
                        )}
                        title={option.label}
                    >
                        {!compact && (
                            <span
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all",
                                    network === option.value
                                        ? `${option.color.replace('text-', 'bg-')} shadow-[0_0_6px_currentColor]`
                                        : "bg-muted-foreground/50"
                                )}
                            />
                        )}
                        <span
                            className={cn(
                                "font-medium transition-colors",
                                compact ? "text-[10px]" : "text-xs sm:text-sm",
                                network === option.value ? option.color : "text-muted-foreground"
                            )}
                        >
                            {compact ? option.shortLabel : option.label}
                        </span>
                        {!compact && (
                            <span
                                className={cn(
                                    "text-[10px] sm:text-xs font-mono transition-colors",
                                    network === option.value ? option.color : "text-muted-foreground/70"
                                )}
                            >
                                ({option.count})
                            </span>
                        )}
                    </button>
                    {index < options.length - 1 && !compact && (
                        <div className="w-px h-4 bg-border mx-0.5" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// Small badge version for node cards
export function NetworkBadge({ networks }: { networks: ('devnet' | 'mainnet')[] }) {
    if (networks.length === 0) return null;

    const isBoth = networks.length === 2;
    const isDevnet = networks.includes('devnet');
    const isMainnet = networks.includes('mainnet');

    if (isBoth) {
        return (
            <div className="flex items-center gap-0.5">
                <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300">
                    BOTH
                </span>
            </div>
        );
    }

    if (isDevnet) {
        return (
            <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                DEV
            </span>
        );
    }

    if (isMainnet) {
        return (
            <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-blue-500/20 border border-blue-500/30 text-blue-400">
                MAIN
            </span>
        );
    }

    return null;
}

// Inline dot indicator for compact displays
export function NetworkDot({ networks }: { networks: ('devnet' | 'mainnet')[] }) {
    if (networks.length === 0) return null;

    const isBoth = networks.length === 2;
    const isDevnet = networks.includes('devnet');
    const isMainnet = networks.includes('mainnet');

    if (isBoth) {
        return (
            <div className="flex items-center gap-0.5" title="Devnet & Mainnet">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="w-2 h-2 rounded-full bg-blue-400 -ml-1" />
            </div>
        );
    }

    if (isDevnet) {
        return <span className="w-2 h-2 rounded-full bg-emerald-400" title="Devnet" />;
    }

    if (isMainnet) {
        return <span className="w-2 h-2 rounded-full bg-blue-400" title="Mainnet" />;
    }

    return null;
}
