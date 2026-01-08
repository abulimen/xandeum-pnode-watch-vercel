
import { unstable_cache } from 'next/cache';

interface CreditsApiResponse {
    pods_credits: Array<{
        credits: number;
        pod_id: string;
    }>;
    status: string;
}

export interface PodCredit {
    pod_id: string;
    credits: number;
}

// In-memory cache fallback (though Next.js cache is preferred)
const memoryCache: Record<string, { data: CreditsApiResponse; timestamp: number }> = {};
const CACHE_DURATION_MS = 60000;

const API_URLS = {
    devnet: 'https://podcredits.xandeum.network/api/pods-credits',
    mainnet: 'https://podcredits.xandeum.network/api/mainnet-pod-credits',
};

async function fetchFromApi(network: 'devnet' | 'mainnet'): Promise<CreditsApiResponse | null> {
    const cacheKey = network;
    const now = Date.now();

    // Check memory cache first
    if (memoryCache[cacheKey] && (now - memoryCache[cacheKey].timestamp) < CACHE_DURATION_MS) {
        return memoryCache[cacheKey].data;
    }

    try {
        const url = API_URLS[network];
        console.log(`[credits-service] Fetching ${network} from ${url}...`);

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 } // Next.js fetch caching
        });

        if (!response.ok) {
            console.error(`[credits-service] ${network} API returned error:`, response.status);
            return null;
        }

        const data = await response.json();

        const normalized: CreditsApiResponse = {
            status: 'success',
            pods_credits: data.pods_credits || [],
        };

        // Update memory cache
        memoryCache[cacheKey] = { data: normalized, timestamp: now };

        return normalized;
    } catch (error: any) {
        console.error(`[credits-service] Error fetching ${network}:`, error.message);
        return memoryCache[cacheKey]?.data || null;
    }
}

export const creditsService = {
    getCredits: async (network: 'devnet' | 'mainnet' | 'all') => {
        if (network === 'all') {
            const [devnet, mainnet] = await Promise.all([
                fetchFromApi('devnet'),
                fetchFromApi('mainnet'),
            ]);

            // Merge logic
            const creditsMap = new Map<string, number>();

            if (devnet?.pods_credits) {
                devnet.pods_credits.forEach(p => creditsMap.set(p.pod_id, p.credits));
            }

            if (mainnet?.pods_credits) {
                mainnet.pods_credits.forEach(p => {
                    const existing = creditsMap.get(p.pod_id) || 0;
                    creditsMap.set(p.pod_id, Math.max(existing, p.credits));
                });
            }

            return {
                pods_credits: Array.from(creditsMap.entries()).map(([pod_id, credits]) => ({
                    pod_id,
                    credits,
                })),
                networks: {
                    devnet: devnet?.pods_credits?.length || 0,
                    mainnet: mainnet?.pods_credits?.length || 0,
                }
            };
        }

        return await fetchFromApi(network);
    },

    // Helper to get a simple map of pod_id -> credits
    getCreditsMap: async (network: 'devnet' | 'mainnet' | 'all' = 'all') => {
        const data = await creditsService.getCredits(network);
        const map = new Map<string, number>();

        if (data?.pods_credits) {
            data.pods_credits.forEach(p => map.set(p.pod_id, p.credits));
        }

        return map;
    }
};
