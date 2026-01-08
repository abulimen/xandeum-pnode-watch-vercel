import { useQuery } from '@tanstack/react-query';
import { useNetworkData, NetworkType } from '@/contexts/NetworkDataContext';

export interface Operator {
    manager: string;
    totalOwned: number;
    registeredCount: number;
    pnodeIds: string[];
    credits: number;
    networks: ('devnet' | 'mainnet')[];
    fleetShare?: number;
}

export interface OperatorsResponse {
    data: Operator[];
    total: number;
    totalNodes: number;
}

async function fetchOperators(): Promise<OperatorsResponse> {
    const res = await fetch('/api/operators');
    if (!res.ok) throw new Error('Failed to fetch data');
    const data = await res.json();

    const totalNodes = data.totalNodes || 1;
    data.data.forEach((op: any) => {
        op.fleetShare = (op.totalOwned / totalNodes) * 100;
    });

    return data;
}

/**
 * Filter operators based on selected network
 * - 'all': show all operators
 * - 'mainnet': show only operators that have nodes on mainnet
 * - 'devnet': show only operators that have nodes on devnet
 */
function filterOperatorsByNetwork(
    operators: Operator[],
    network: NetworkType,
    devnetPods: Set<string>,
    mainnetPods: Set<string>
): Operator[] {
    if (network === 'all') {
        return operators;
    }

    const targetPods = network === 'mainnet' ? mainnetPods : devnetPods;

    return operators
        .map(op => {
            // Filter pnodeIds to only those in the target network
            const filteredPnodeIds = op.pnodeIds.filter(id => targetPods.has(id));

            if (filteredPnodeIds.length === 0) {
                return null; // No nodes on this network
            }

            // Recalculate totals based on filtered nodes
            return {
                ...op,
                pnodeIds: filteredPnodeIds,
                totalOwned: filteredPnodeIds.length,
                registeredCount: filteredPnodeIds.filter(id => targetPods.has(id)).length,
                networks: [network] as ('devnet' | 'mainnet')[],
            };
        })
        .filter((op): op is Operator => op !== null);
}

export function useOperators() {
    const { network, devnetPods, mainnetPods, devnetCreditsMap, mainnetCreditsMap } = useNetworkData();

    const query = useQuery({
        queryKey: ['operators'],
        queryFn: fetchOperators,
        staleTime: 5 * 60 * 1000,
    });

    // Return filtered data based on selected network
    const filteredData = query.data ? {
        ...query.data,
        data: filterOperatorsByNetwork(query.data.data, network, devnetPods, mainnetPods).map(op => {
            // Recalculate credits based on filtered network
            let credits = 0;
            const creditsMap = network === 'mainnet' ? mainnetCreditsMap
                : network === 'devnet' ? devnetCreditsMap
                    : new Map([...devnetCreditsMap, ...mainnetCreditsMap]);

            for (const pnodeId of op.pnodeIds) {
                if (network === 'all') {
                    const devCredit = devnetCreditsMap.get(pnodeId) || 0;
                    const mainCredit = mainnetCreditsMap.get(pnodeId) || 0;
                    credits += Math.max(devCredit, mainCredit);
                } else {
                    credits += creditsMap.get(pnodeId) || 0;
                }
            }

            return { ...op, credits };
        }),
        total: query.data.data.length,
        totalNodes: network === 'mainnet' ? mainnetPods.size
            : network === 'devnet' ? devnetPods.size
                : query.data.totalNodes,
    } : undefined;

    // Recalculate fleet share based on filtered totals
    if (filteredData?.data) {
        const totalNodes = filteredData.totalNodes || 1;
        filteredData.data.forEach(op => {
            op.fleetShare = (op.totalOwned / totalNodes) * 100;
        });
        // Re-sort by totalOwned
        filteredData.data.sort((a, b) => b.totalOwned - a.totalOwned);
    }

    return {
        ...query,
        data: filteredData,
        rawData: query.data, // Unfiltered data for global stats like unregistered nodes
        network, // Expose current network for display
    };
}

