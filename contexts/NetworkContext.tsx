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

interface NetworkCreditsData {
    devnetPods: Set<string>;
    mainnetPods: Set<string>;
}

async function fetchNetworkCredits(): Promise<NetworkCreditsData> {
    const [devnetRes, mainnetRes] = await Promise.all([
        fetch('/api/credits?network=devnet'),
        fetch('/api/credits?network=mainnet'),
    ]);

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

    console.log(`[network] Loaded ${devnetPods.size} devnet pods, ${mainnetPods.size} mainnet pods`);
    return { devnetPods, mainnetPods };
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [network, setNetworkState] = useState<NetworkType>('all');
    const [devnetPods, setDevnetPods] = useState<Set<string>>(new Set());
    const [mainnetPods, setMainnetPods] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted network preference
    useEffect(() => {
        const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
        if (stored && ['all', 'devnet', 'mainnet'].includes(stored)) {
            setNetworkState(stored as NetworkType);
        }
    }, []);

    // Fetch network pod data
    useEffect(() => {
        fetchNetworkCredits()
            .then(({ devnetPods, mainnetPods }) => {
                setDevnetPods(devnetPods);
                setMainnetPods(mainnetPods);
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

    const networkStats = useMemo(() => {
        const bothCount = [...devnetPods].filter(p => mainnetPods.has(p)).length;
        const devnetOnly = devnetPods.size;
        const mainnetOnly = mainnetPods.size;
        // Total unique pods across both networks
        const allPods = new Set([...devnetPods, ...mainnetPods]);
        return {
            devnet: devnetOnly,
            mainnet: mainnetOnly,
            both: bothCount,
            total: allPods.size,
        };
    }, [devnetPods, mainnetPods]);

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
