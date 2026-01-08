/**
 * useNodeNetworks Hook - Determines which networks (devnet/mainnet) a node belongs to
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

type NetworkMembership = {
    devnet: boolean;
    mainnet: boolean;
};

interface UseNodeNetworksResult {
    getNodeNetworks: (nodeId: string) => NetworkMembership;
    isLoading: boolean;
    devnetNodeIds: Set<string>;
    mainnetNodeIds: Set<string>;
}

/**
 * Generate unique ID from pubkey and address - MUST match prpcService.generateUniqueId
 */
function generateUniqueId(pubkey: string | null, address: string): string {
    if (!pubkey) return 'unknown-' + Math.random().toString(36).substring(2, 8);
    // Combine first 8 chars of pubkey with last 2 octets of the IP address
    const addrHash = address.split(':')[0].split('.').slice(-2).join('');
    return `${pubkey.substring(0, 8)}-${addrHash}`;
}

async function fetchNetworkNodeIds(network: 'devnet' | 'mainnet'): Promise<Set<string>> {
    try {
        // Use the prpc POST endpoint with network filter
        const response = await fetch(`/api/prpc?network=${network}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'get-pods-with-stats' }),
        });

        if (!response.ok) {
            console.warn(`[useNodeNetworks] Non-OK response for ${network}:`, response.status);
            return new Set();
        }

        const data = await response.json();
        const pods = data?.data?.pods || [];

        // Extract unique IDs using the same algorithm as prpcService
        const nodeIds = new Set<string>();
        pods.forEach((pod: any) => {
            if (pod.pubkey && pod.address) {
                const id = generateUniqueId(pod.pubkey, pod.address);
                nodeIds.add(id);
            }
        });

        console.log(`[useNodeNetworks] ${network}: found ${nodeIds.size} nodes`);
        return nodeIds;
    } catch (error) {
        console.error(`[useNodeNetworks] Error fetching ${network}:`, error);
        return new Set();
    }
}

export function useNodeNetworks(): UseNodeNetworksResult {
    // Fetch devnet node IDs
    const { data: devnetNodeIds = new Set<string>(), isLoading: devnetLoading } = useQuery({
        queryKey: ['network-membership', 'devnet'],
        queryFn: () => fetchNetworkNodeIds('devnet'),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 60 * 1000, // 1 minute
        retry: 2,
    });

    // Fetch mainnet node IDs
    const { data: mainnetNodeIds = new Set<string>(), isLoading: mainnetLoading } = useQuery({
        queryKey: ['network-membership', 'mainnet'],
        queryFn: () => fetchNetworkNodeIds('mainnet'),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 60 * 1000,
        retry: 2,
    });

    const getNodeNetworks = useMemo(() => {
        return (nodeId: string): NetworkMembership => {
            return {
                devnet: devnetNodeIds.has(nodeId),
                mainnet: mainnetNodeIds.has(nodeId),
            };
        };
    }, [devnetNodeIds, mainnetNodeIds]);

    return {
        getNodeNetworks,
        isLoading: devnetLoading || mainnetLoading,
        devnetNodeIds,
        mainnetNodeIds,
    };
}
