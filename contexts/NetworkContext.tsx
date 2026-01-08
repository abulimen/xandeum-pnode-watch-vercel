'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type NetworkType = 'all' | 'devnet' | 'mainnet';

interface NetworkContextType {
    network: NetworkType;
    setNetwork: (network: NetworkType) => void;
    devnetPods: Set<string>;
    mainnetPods: Set<string>;
    isLoading: boolean;
    getNodeNetworks: (pubkey: string) => ('devnet' | 'mainnet')[];
    networkStats: {
        devnet: number;
        mainnet: number;
        both: number;
        total: number;
    };
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const NETWORK_STORAGE_KEY = 'pnode-watch-network';

interface NetworkData {
    devnetPods: Set<string>;
    mainnetPods: Set<string>;
    allPodPubkeys: string[]; // All pods from pRPC
}

/**
 * Fetch network data from both pRPC (for total counts) and credits (for network membership)
 */
async function fetchNetworkData(): Promise<NetworkData> {
    // Fetch all three in parallel
    const [prpcRes, devnetRes, mainnetRes] = await Promise.all([
        fetch('/api/prpc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'get-pods-with-stats' }),
        }),
        fetch('/api/credits?network=devnet'),
        fetch('/api/credits?network=mainnet'),
    ]);

    // Get all pod pubkeys from pRPC
    const allPodPubkeys: string[] = [];
    if (prpcRes.ok) {
        const prpcData = await prpcRes.json();
        if (prpcData.success && prpcData.data?.pods) {
            for (const pod of prpcData.data.pods) {
                if (pod.pubkey) allPodPubkeys.push(pod.pubkey);
            }
        }
    }

    // Get credits data (determines network membership)
    const devnetPods = new Set<string>();
    const mainnetPods = new Set<string>();

    if (devnetRes.ok) {
        const devnetData = await devnetRes.json();
        if (devnetData.pods_credits) {
            for (const pod of devnetData.pods_credits) {
                if (pod.pod_id) devnetPods.add(pod.pod_id);
            }
        }
    }

    if (mainnetRes.ok) {
        const mainnetData = await mainnetRes.json();
        if (mainnetData.pods_credits) {
            for (const pod of mainnetData.pods_credits) {
                if (pod.pod_id) mainnetPods.add(pod.pod_id);
            }
        }
    }

    console.log(`[network] Loaded ${allPodPubkeys.length} total pods, ${devnetPods.size} devnet, ${mainnetPods.size} mainnet`);
    return { devnetPods, mainnetPods, allPodPubkeys };
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [network, setNetworkState] = useState<NetworkType>('all');
    const [devnetPods, setDevnetPods] = useState<Set<string>>(new Set());
    const [mainnetPods, setMainnetPods] = useState<Set<string>>(new Set());
    const [allPodPubkeys, setAllPodPubkeys] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted network preference
    useEffect(() => {
        const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
        if (stored && ['all', 'devnet', 'mainnet'].includes(stored)) {
            setNetworkState(stored as NetworkType);
        }
    }, []);

    // Fetch network data
    useEffect(() => {
        fetchNetworkData()
            .then(({ devnetPods, mainnetPods, allPodPubkeys }) => {
                setDevnetPods(devnetPods);
                setMainnetPods(mainnetPods);
                setAllPodPubkeys(allPodPubkeys);
            })
            .catch(err => console.error('[network] Failed to fetch network data:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const setNetwork = useCallback((newNetwork: NetworkType) => {
        setNetworkState(newNetwork);
        localStorage.setItem(NETWORK_STORAGE_KEY, newNetwork);
    }, []);

    const getNodeNetworks = useCallback((pubkey: string): ('devnet' | 'mainnet')[] => {
        const networks: ('devnet' | 'mainnet')[] = [];
        if (devnetPods.has(pubkey)) networks.push('devnet');
        if (mainnetPods.has(pubkey)) networks.push('mainnet');
        return networks;
    }, [devnetPods, mainnetPods]);

    // Calculate network stats based on pRPC pods filtered by credit membership
    const networkStats = useMemo(() => {
        // Count pRPC pods that have credits on each network
        const devnetCount = allPodPubkeys.filter(pk => devnetPods.has(pk)).length;
        const mainnetCount = allPodPubkeys.filter(pk => mainnetPods.has(pk)).length;
        const bothCount = allPodPubkeys.filter(pk => devnetPods.has(pk) && mainnetPods.has(pk)).length;

        return {
            devnet: devnetCount,
            mainnet: mainnetCount,
            both: bothCount,
            total: allPodPubkeys.length, // Total from pRPC, same as StatsCards
        };
    }, [allPodPubkeys, devnetPods, mainnetPods]);

    return (
        <NetworkContext.Provider value={{
            network,
            setNetwork,
            devnetPods,
            mainnetPods,
            isLoading,
            getNodeNetworks,
            networkStats,
        }}>
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetwork() {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
}

