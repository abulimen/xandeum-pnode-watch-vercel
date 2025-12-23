/**
 * Network Stats API - Returns pre-computed network statistics
 * Uses the EXACT SAME scoring logic as the leaderboard page via analyticsService
 */

import { NextResponse } from 'next/server';
import { getTopStakingNodes, calculateNetworkStats } from '@/lib/services/analyticsService';
import { PNode } from '@/types/pnode';

interface RawPod {
    pubkey?: string | null;
    uptime?: number;
    storage_committed?: number;
    storage_used?: number;
    storage_usage_percent?: number;
    last_seen_timestamp: number;
    address: string;
    is_public?: boolean;
    version?: string;
    rpc_port?: number;
}

// Constants matching prpcService.ts exactly
const ONLINE_THRESHOLD_SECONDS = 60;
const DEGRADED_THRESHOLD_SECONDS = 300;

function determineStatus(lastSeenTimestamp: number, maxTimestamp: number): 'online' | 'offline' | 'degraded' {
    const secondsSinceLastSeen = maxTimestamp - lastSeenTimestamp;
    if (secondsSinceLastSeen <= ONLINE_THRESHOLD_SECONDS) return 'online';
    if (secondsSinceLastSeen <= DEGRADED_THRESHOLD_SECONDS) return 'degraded';
    return 'offline';
}

function calculateUptimePercent(
    uptimeSeconds: number,
    status: string,
    lastSeenTimestamp: number,
    maxTimestamp: number
): number {
    const DAY_IN_SECONDS = 86400;
    let baseUptime = Math.min(100, (uptimeSeconds / DAY_IN_SECONDS) * 100);

    if (status !== 'online') {
        const offlineSeconds = maxTimestamp - lastSeenTimestamp;
        const penalty = (offlineSeconds / DAY_IN_SECONDS) * 100;
        baseUptime = Math.max(0, baseUptime - penalty);
    }

    return Math.round(baseUptime * 10) / 10;
}

function calculateHealthScore(pod: RawPod, status: 'online' | 'offline' | 'degraded'): number {
    let score = 0;
    if (status === 'online') score += 40;
    else if (status === 'degraded') score += 20;
    const uptimeHours = (pod.uptime || 0) / 3600;
    const uptimeScore = Math.min(30, (uptimeHours / 24) * 30);
    score += uptimeScore;
    if (pod.storage_committed && pod.storage_committed > 0) {
        score += 10;
        const usagePercent = pod.storage_usage_percent || 0;
        if (usagePercent < 80) score += 10;
        else if (usagePercent < 95) score += 5;
    }
    if (pod.version && pod.version !== 'unknown') score += 5;
    if (pod.pubkey) score += 5;
    return Math.round(score);
}

function extractIP(address: string): string {
    return address.split(':')[0];
}

function extractPort(address: string): number {
    const parts = address.split(':');
    return parseInt(parts[1] || '9001', 10);
}

function generateUniqueId(pubkey: string | null, address: string): string {
    if (!pubkey) return 'unknown-' + Math.random().toString(36).substring(2, 8);
    const addrHash = address.split(':')[0].split('.').slice(-2).join('');
    return `${pubkey.substring(0, 8)}-${addrHash}`;
}

/**
 * Transform raw pod to PNode format (EXACT MATCH with prpcService.transformPodToNode)
 */
function transformPodToNode(pod: RawPod, responseTime: number, maxTimestamp: number): PNode {
    const status = determineStatus(pod.last_seen_timestamp, maxTimestamp);
    const ipAddress = extractIP(pod.address);
    const secondsAgo = maxTimestamp - pod.last_seen_timestamp;
    const lastSeenDate = new Date(Date.now() - (secondsAgo * 1000));

    return {
        id: generateUniqueId(pod.pubkey || null, pod.address),
        publicKey: pod.pubkey || 'unknown',
        status,
        uptime: calculateUptimePercent(pod.uptime || 0, status, pod.last_seen_timestamp, maxTimestamp),
        uptimeSeconds: pod.uptime || 0,
        responseTime,
        healthScore: calculateHealthScore(pod, status),
        storage: {
            total: pod.storage_committed || 0,
            used: pod.storage_used || 0,
            usagePercent: pod.storage_usage_percent || 0,
        },
        location: undefined,
        lastSeen: lastSeenDate.toISOString(),
        lastSeenTimestamp: pod.last_seen_timestamp,
        version: pod.version || 'unknown',
        isPublic: pod.is_public ?? false,
        network: {
            ipAddress,
            port: extractPort(pod.address),
            rpcPort: pod.rpc_port || 6000,
        },
    };
}

export async function GET() {
    try {
        // Call the internal pRPC API with absolute URL (server-side needs this)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

        let response;
        try {
            response = await fetch(`${baseUrl}/api/prpc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: 'get-pods-with-stats' }),
                cache: 'no-store',
            });
        } catch (fetchError) {
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch from pRPC API',
                details: fetchError instanceof Error ? fetchError.message : String(fetchError),
                baseUrl,
            }, { status: 500 });
        }

        let result;
        try {
            result = await response.json();
        } catch (parseError) {
            return NextResponse.json({
                success: false,
                error: 'Failed to parse pRPC response',
                details: parseError instanceof Error ? parseError.message : String(parseError),
                status: response.status,
            }, { status: 500 });
        }

        if (!result.success || !result.data?.pods) {
            return NextResponse.json({
                success: false,
                error: 'pRPC API returned failure',
                details: result.error || 'No pods data',
                result,
            }, { status: 500 });
        }

        const pods: RawPod[] = result.data.pods;
        const responseTime = result.responseTime || 0;

        // Filter and transform pods to PNodes (SAME as prpcService)
        const validPods = pods.filter(pod => pod.pubkey);

        if (validPods.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    totalNodes: 0,
                    onlineNodes: 0,
                    avgUptime: 0,
                    totalStorage: 0,
                    eliteNodes: 0,
                    topNodes: [],
                },
            });
        }

        // Fetch credits from Xandeum API
        let creditsMap = new Map<string, number>();
        try {
            const creditsResponse = await fetch('https://podcredits.xandeum.network/api/pods-credits', { next: { revalidate: 60 } });
            if (creditsResponse.ok) {
                const json = await creditsResponse.json();
                if (json.status === 'success' && Array.isArray(json.pods_credits)) {
                    for (const item of json.pods_credits) {
                        if (item.pod_id && typeof item.credits === 'number') {
                            creditsMap.set(item.pod_id, item.credits);
                        }
                    }
                }
            }
        } catch (creditsError) {
            // Non-fatal: continue without credits
            console.warn('Failed to fetch credits:', creditsError);
        }

        const maxTimestamp = Math.max(...validPods.map(p => p.last_seen_timestamp));

        // Transform pods to PNodes (EXACT MATCH with prpcService)
        const nodes: PNode[] = validPods.map(pod => {
            const node = transformPodToNode(pod, responseTime, maxTimestamp);
            // Enrich with credits
            node.credits = creditsMap.get(node.publicKey) || 0;
            return node;
        });

        // Now use the EXACT SAME functions as the leaderboard page
        const networkStats = calculateNetworkStats(nodes);

        // Calculate avg credits
        const totalCredits = Array.from(creditsMap.values()).reduce((sum, c) => sum + c, 0);
        const avgCredits = creditsMap.size > 0 ? Math.round(totalCredits / creditsMap.size) : 0;

        // Get top nodes by CREDITS (not staking score)
        const topNodesList = [...nodes]
            .sort((a, b) => (b.credits || 0) - (a.credits || 0))
            .slice(0, 5);

        // Format top nodes for the widget
        const topNodes = topNodesList.map((node, index) => ({
            id: node.id,
            fullId: node.publicKey,
            uptime: Math.round(node.uptime * 10) / 10,
            uptimeSeconds: node.uptimeSeconds || 0,
            stakingScore: node.stakingScore || 0,
            credits: node.credits || 0,
            status: node.status,
            storage: node.storage.total || 0,
            storageUsed: node.storage.used || 0,
            version: node.version || 'Unknown',
            rank: index + 1,
        }));

        return NextResponse.json({
            success: true,
            data: {
                totalNodes: networkStats.totalNodes,
                onlineNodes: networkStats.onlineNodes,
                avgUptime: networkStats.avgUptime,
                totalStorage: networkStats.totalStorage,
                eliteNodes: networkStats.eliteNodes,
                avgCredits,
                topNodes,
            },
        });
    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
    }
}
