/**
 * NetworkDataContext - Centralized data store for network data
 * Fetches pods and credits ONCE, caches them, and provides filtered data to all components
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PNode } from '@/types/pnode';
import { prpcService } from '@/lib/services/prpcService';

export type NetworkType = 'all' | 'devnet' | 'mainnet';

interface CreditsData {
    pods_credits: Array<{ pod_id: string; credits: number }>;
}

interface NetworkDataContextType {
    // Network selection
    network: NetworkType;
    setNetwork: (network: NetworkType) => void;

    // Raw data (all networks)
    rawNodes: PNode[];
    devnetCreditsMap: Map<string, number>;
    mainnetCreditsMap: Map<string, number>;

    // Computed: filtered and enriched nodes based on selected network
    nodes: PNode[];
    creditsMap: Map<string, number>;

    // Network membership sets (for filtering)
    devnetPods: Set<string>;
    mainnetPods: Set<string>;

    // Stats
    networkStats: {
        devnet: number;
        mainnet: number;
        total: number;
    };

    // Loading states
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;

    // Refresh
    refetch: () => void;
    lastUpdated: Date | null;
    responseTime: number | null;

    // Helper
    getNodeNetworks: (pubkey: string) => ('devnet' | 'mainnet')[];
}

const NetworkDataContext = createContext<NetworkDataContextType | undefined>(undefined);

const NETWORK_STORAGE_KEY = 'pnode-watch-network';
const REFETCH_INTERVAL = 30000; // 30 seconds
const STALE_TIME = 60000; // 1 minute

async function fetchCredits(network: 'devnet' | 'mainnet'): Promise<Map<string, number>> {
    const response = await fetch(`/api/credits?network=${network}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${network} credits`);
    }

    const data: CreditsData = await response.json();
    const map = new Map<string, number>();

    if (data.pods_credits) {
        for (const item of data.pods_credits) {
            if (item.pod_id && typeof item.credits === 'number') {
                map.set(item.pod_id, item.credits);
            }
        }
    }

    console.log(`[NetworkDataContext] Loaded ${map.size} ${network} credits`);
    return map;
}

export function NetworkDataProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [network, setNetworkState] = useState<NetworkType>('all');

    // Load persisted network preference
    useEffect(() => {
        const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
        if (stored && ['all', 'devnet', 'mainnet'].includes(stored)) {
            setNetworkState(stored as NetworkType);
        }
    }, []);

    const setNetwork = useCallback((newNetwork: NetworkType) => {
        setNetworkState(newNetwork);
        localStorage.setItem(NETWORK_STORAGE_KEY, newNetwork);
    }, []);

    // Fetch ALL pods once (no network filter)
    const {
        data: podsData,
        isLoading: podsLoading,
        isError: podsError,
        error: podsErrorObj,
        isFetching: podsFetching,
        dataUpdatedAt: podsUpdatedAt,
        refetch: refetchPods,
    } = useQuery({
        queryKey: ['raw-pods'],
        queryFn: () => prpcService.fetchNodes(), // No network filter - get all pods
        refetchInterval: REFETCH_INTERVAL,
        staleTime: STALE_TIME,
    });

    // Fetch devnet credits
    const {
        data: devnetCreditsMap,
        isLoading: devnetLoading,
        refetch: refetchDevnet,
    } = useQuery({
        queryKey: ['credits', 'devnet'],
        queryFn: () => fetchCredits('devnet'),
        refetchInterval: REFETCH_INTERVAL,
        staleTime: STALE_TIME,
    });

    // Fetch mainnet credits
    const {
        data: mainnetCreditsMap,
        isLoading: mainnetLoading,
        refetch: refetchMainnet,
    } = useQuery({
        queryKey: ['credits', 'mainnet'],
        queryFn: () => fetchCredits('mainnet'),
        refetchInterval: REFETCH_INTERVAL,
        staleTime: STALE_TIME,
    });

    // Raw nodes from pods
    const rawNodes = useMemo(() => {
        return podsData?.data?.nodes || [];
    }, [podsData]);

    // Create pod sets for network membership
    const devnetPods = useMemo(() => {
        return new Set(devnetCreditsMap?.keys() || []);
    }, [devnetCreditsMap]);

    const mainnetPods = useMemo(() => {
        return new Set(mainnetCreditsMap?.keys() || []);
    }, [mainnetCreditsMap]);

    // Get current credits map based on selected network
    const creditsMap = useMemo(() => {
        if (network === 'devnet') {
            return devnetCreditsMap || new Map();
        } else if (network === 'mainnet') {
            return mainnetCreditsMap || new Map();
        } else {
            // 'all' - merge both, take max credits
            const merged = new Map<string, number>();
            devnetCreditsMap?.forEach((credits, podId) => {
                merged.set(podId, credits);
            });
            mainnetCreditsMap?.forEach((credits, podId) => {
                const existing = merged.get(podId) || 0;
                merged.set(podId, Math.max(existing, credits));
            });
            return merged;
        }
    }, [network, devnetCreditsMap, mainnetCreditsMap]);

    // Filter and enrich nodes based on selected network
    const nodes = useMemo(() => {
        let filtered = rawNodes;

        // Apply network filter
        if (network === 'devnet') {
            filtered = rawNodes.filter(node => devnetPods.has(node.publicKey));
        } else if (network === 'mainnet') {
            filtered = rawNodes.filter(node => mainnetPods.has(node.publicKey));
        }
        // 'all' = no filter

        // Enrich with credits
        return filtered.map(node => ({
            ...node,
            credits: creditsMap.get(node.publicKey) || 0,
        }));
    }, [rawNodes, network, devnetPods, mainnetPods, creditsMap]);

    // Network stats based on credits data
    const networkStats = useMemo(() => {
        // Count raw nodes that have credits on each network
        const devnetCount = rawNodes.filter(n => devnetPods.has(n.publicKey)).length;
        const mainnetCount = rawNodes.filter(n => mainnetPods.has(n.publicKey)).length;

        return {
            devnet: devnetCount,
            mainnet: mainnetCount,
            total: rawNodes.length,
        };
    }, [rawNodes, devnetPods, mainnetPods]);

    // Helper to get networks for a node
    const getNodeNetworks = useCallback((pubkey: string): ('devnet' | 'mainnet')[] => {
        const networks: ('devnet' | 'mainnet')[] = [];
        if (devnetPods.has(pubkey)) networks.push('devnet');
        if (mainnetPods.has(pubkey)) networks.push('mainnet');
        return networks;
    }, [devnetPods, mainnetPods]);

    // Combined loading state
    const isLoading = podsLoading || devnetLoading || mainnetLoading;
    const isFetching = podsFetching;
    const isError = podsError;
    const error = podsErrorObj as Error | null;
    const lastUpdated = podsUpdatedAt ? new Date(podsUpdatedAt) : null;
    const responseTime = podsData?.responseTime || null;

    // Combined refetch
    const refetch = useCallback(() => {
        refetchPods();
        refetchDevnet();
        refetchMainnet();
    }, [refetchPods, refetchDevnet, refetchMainnet]);

    return (
        <NetworkDataContext.Provider value={{
            network,
            setNetwork,
            rawNodes,
            devnetCreditsMap: devnetCreditsMap || new Map(),
            mainnetCreditsMap: mainnetCreditsMap || new Map(),
            nodes,
            creditsMap,
            devnetPods,
            mainnetPods,
            networkStats,
            isLoading,
            isError,
            error,
            isFetching,
            refetch,
            lastUpdated,
            responseTime,
            getNodeNetworks,
        }}>
            {children}
        </NetworkDataContext.Provider>
    );
}

export function useNetworkData() {
    const context = useContext(NetworkDataContext);
    if (!context) {
        throw new Error('useNetworkData must be used within a NetworkDataProvider');
    }
    return context;
}

// Alias for backwards compatibility with existing components
export const useNetwork = useNetworkData;
