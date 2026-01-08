/**
 * useCredits Hook - Returns credits data from centralized data store
 * Uses NetworkDataContext for network-aware credits fetching
 */

'use client';

import { useMemo } from 'react';
import { useNetworkData } from '@/contexts/NetworkDataContext';
import { PNode } from '@/types/pnode';

interface UseCreditsResult {
    creditsMap: Map<string, number>;
    isLoading: boolean;
    error: Error | null;
    totalCredits: number;
    avgCredits: number;
    creditsThreshold: number;
}

export function useCredits(): UseCreditsResult {
    const { creditsMap, isLoading, error } = useNetworkData();

    const stats = useMemo(() => {
        const values = Array.from(creditsMap.values()).filter(v => v > 0);
        if (values.length === 0) {
            return { totalCredits: 0, avgCredits: 0, creditsThreshold: 0 };
        }

        values.sort((a, b) => a - b);
        const total = values.reduce((sum, v) => sum + v, 0);
        const avg = total / values.length;
        const p95Index = Math.floor(values.length * 0.95);
        const p95 = values[p95Index] || values[values.length - 1];
        const threshold = p95 * 0.8;

        return {
            totalCredits: total,
            avgCredits: Math.round(avg),
            creditsThreshold: Math.round(threshold),
        };
    }, [creditsMap]);

    return {
        creditsMap,
        isLoading,
        error,
        ...stats,
    };
}

/**
 * Enriches nodes with credits from the provided creditsMap
 */
export function enrichNodesWithCreditsData(
    nodes: PNode[],
    creditsMap: Map<string, number>
): PNode[] {
    return nodes.map(node => ({
        ...node,
        credits: creditsMap.get(node.publicKey) ?? 0,
    }));
}
