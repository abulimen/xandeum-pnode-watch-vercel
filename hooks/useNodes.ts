/**
 * useNodes Hook - Returns filtered and enriched nodes from centralized data store
 * Uses NetworkDataContext for network-aware data fetching
 */

'use client';

import { useNetworkData, NetworkType } from '@/contexts/NetworkDataContext';
import { PNode } from '@/types/pnode';

interface UseNodesResult {
    nodes: PNode[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    errorMessage: string | null;
    refetch: () => void;
    lastUpdated: Date | null;
    isFetching: boolean;
    isStale: boolean;
    responseTime: number | null;
    currentNetwork: NetworkType;
}

export function useNodes(): UseNodesResult {
    const {
        nodes,
        isLoading,
        isError,
        error,
        isFetching,
        refetch,
        lastUpdated,
        responseTime,
        network,
    } = useNetworkData();

    // Error message for UI display
    const errorMessage = error ? 'Unable to fetch node data. Please try again later.' : null;

    return {
        nodes,
        isLoading,
        isError,
        error,
        errorMessage,
        refetch,
        lastUpdated,
        isFetching,
        isStale: false, // With centralized caching, we handle this differently
        responseTime,
        currentNetwork: network,
    };
}

/**
 * Prefetch nodes data - now just triggers a refetch on the shared context
 */
export function usePrefetchNodes() {
    const { refetch } = useNetworkData();
    return refetch;
}
