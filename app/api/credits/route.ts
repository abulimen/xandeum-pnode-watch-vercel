/**
 * Credits API Proxy Route
 * Proxies requests to the Xandeum Credits API to bypass CORS restrictions
 * Supports ?network=devnet|mainnet|all parameter
 */

import { NextRequest, NextResponse } from 'next/server';

interface CreditsApiResponse {
    pods_credits: Array<{
        credits: number;
        pod_id: string;
    }>;
    status: string;
}

// Cache for 60 seconds per network
const cache: Record<string, { data: CreditsApiResponse; timestamp: number }> = {};
const CACHE_DURATION_MS = 60000;

const API_URLS = {
    devnet: 'https://podcredits.xandeum.network/api/pods-credits',
    mainnet: 'https://podcredits.xandeum.network/api/mainnet-pod-credits',
};

async function fetchCreditsForNetwork(network: 'devnet' | 'mainnet'): Promise<CreditsApiResponse | null> {
    const cacheKey = network;
    const now = Date.now();

    // Return cached data if fresh
    if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_DURATION_MS) {
        return cache[cacheKey].data;
    }

    try {
        const url = API_URLS[network];
        console.log(`[credits-proxy] Fetching ${network} from ${url}...`);

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(`[credits-proxy] ${network} API returned error:`, response.status);
            return null;
        }

        const data = await response.json();

        // Normalize response - some endpoints return different formats
        const normalized: CreditsApiResponse = {
            status: 'success',
            pods_credits: data.pods_credits || [],
        };

        // Update cache
        cache[cacheKey] = { data: normalized, timestamp: now };
        console.log(`[credits-proxy] Loaded ${normalized.pods_credits.length} ${network} credits`);

        return normalized;
    } catch (error: any) {
        console.error(`[credits-proxy] Error fetching ${network}:`, error.message);
        return cache[cacheKey]?.data || null;
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'devnet';

    try {
        if (network === 'all') {
            // Fetch both and merge
            const [devnet, mainnet] = await Promise.all([
                fetchCreditsForNetwork('devnet'),
                fetchCreditsForNetwork('mainnet'),
            ]);

            // Merge credits - if pod exists in both, use higher credits
            const creditsMap = new Map<string, number>();

            if (devnet?.pods_credits) {
                for (const pod of devnet.pods_credits) {
                    creditsMap.set(pod.pod_id, pod.credits);
                }
            }

            if (mainnet?.pods_credits) {
                for (const pod of mainnet.pods_credits) {
                    const existing = creditsMap.get(pod.pod_id) || 0;
                    creditsMap.set(pod.pod_id, Math.max(existing, pod.credits));
                }
            }

            const mergedCredits = Array.from(creditsMap.entries()).map(([pod_id, credits]) => ({
                pod_id,
                credits,
            }));

            return NextResponse.json({
                status: 'success',
                pods_credits: mergedCredits,
                networks: {
                    devnet: devnet?.pods_credits?.length || 0,
                    mainnet: mainnet?.pods_credits?.length || 0,
                },
            }, {
                headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
            });
        }

        // Single network fetch
        const validNetwork = network === 'mainnet' ? 'mainnet' : 'devnet';
        const data = await fetchCreditsForNetwork(validNetwork);

        if (!data) {
            return NextResponse.json(
                { error: 'Failed to fetch credits', status: 'error' },
                { status: 502 }
            );
        }

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
        });

    } catch (error: any) {
        console.error('[credits-proxy] Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch credits', status: 'error' },
            { status: 500 }
        );
    }
}

