/**
 * Cron Snapshot API Route
 * Creates periodic network snapshots for historical tracking
 * 
 * This can be called by:
 * 1. Vercel Cron (add to vercel.json)
 * 2. External cron service (curl request)
 * 3. Manual trigger for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import http from 'http';
import { enrichNodesWithStakingData } from '@/lib/services/analyticsService';
// DB imports moved to inside handler to catch initialization errors
import { processAlerts } from '@/lib/services/alertService';
import { RawPodData, PNode } from '@/types/pnode';

// Configuration
const SEED_IPS = (process.env.NEXT_PUBLIC_PNODE_SEED_IPS || '').split(',').filter(Boolean);
const RPC_PORT = parseInt(process.env.NEXT_PUBLIC_PNODE_RPC_PORT || '6000', 10);
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_PNODE_RPC_ENDPOINT || '/rpc';
const CRON_SECRET = process.env.CRON_SECRET;
const CREDITS_API_URL = 'https://podcredits.xandeum.network/api/pods-credits';

// Constants for status determination (MUST match prpcService.ts)
const ONLINE_THRESHOLD_SECONDS = 60;
const DEGRADED_THRESHOLD_SECONDS = 300;

/**
 * Server-side HTTP request to pNode RPC
 */
function httpRequest(seedIP: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            method: 'get-pods-with-stats',
            id: 1,
        });

        const options: http.RequestOptions = {
            hostname: seedIP,
            port: RPC_PORT,
            path: RPC_ENDPOINT,
            method: 'POST',
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (data.error) {
                        resolve({ success: false, error: data.error });
                        return;
                    }
                    resolve({ success: true, data: data.result });
                } catch {
                    resolve({ success: false, error: 'Invalid JSON' });
                }
            });
        });

        req.on('error', (e) => resolve({ success: false, error: e.message }));
        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, error: 'Timeout' });
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Fetch credits from Xandeum API
 */
async function fetchCredits(): Promise<Map<string, number>> {
    try {
        const response = await fetch(CREDITS_API_URL, { next: { revalidate: 0 } });
        if (!response.ok) return new Map();

        const json = await response.json();
        if (json.status !== 'success' || !Array.isArray(json.pods_credits)) {
            return new Map();
        }

        const creditsMap = new Map<string, number>();
        for (const item of json.pods_credits) {
            if (item.pod_id && typeof item.credits === 'number') {
                creditsMap.set(item.pod_id, item.credits);
            }
        }
        return creditsMap;
    } catch (error) {
        console.error('[cron/snapshot] Failed to fetch credits:', error);
        return new Map();
    }
}

/**
 * Determine node status based on last seen timestamp
 * MUST match prpcService.determineStatus
 */
function determineStatus(lastSeenTimestamp: number, maxTimestamp: number): 'online' | 'degraded' | 'offline' {
    const secondsAgo = maxTimestamp - lastSeenTimestamp;
    if (secondsAgo <= ONLINE_THRESHOLD_SECONDS) return 'online';
    if (secondsAgo <= DEGRADED_THRESHOLD_SECONDS) return 'degraded';
    return 'offline';
}

/**
 * Calculate uptime percentage from seconds with offline penalty
 * MUST match prpcService.calculateUptimePercent
 */
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

/**
 * Calculate health score based on multiple factors
 * MUST match prpcService.calculateHealthScore
 */
function calculateHealthScore(pod: RawPodData, status: 'online' | 'degraded' | 'offline'): number {
    let score = 0;

    // Status weight (40%)
    if (status === 'online') score += 40;
    else if (status === 'degraded') score += 20;

    // Uptime weight (30%)
    const uptimeHours = (pod.uptime || 0) / 3600;
    const uptimeScore = Math.min(30, (uptimeHours / 24) * 30);
    score += uptimeScore;

    // Storage health (20%)
    if (pod.storage_committed && pod.storage_committed > 0) {
        score += 10;
        const usagePercent = pod.storage_usage_percent || 0;
        if (usagePercent < 80) score += 10;
        else if (usagePercent < 95) score += 5;
    }

    // Version/completeness (10%)
    if (pod.version && pod.version !== 'unknown') score += 5;
    if (pod.pubkey) score += 5;

    return Math.round(score);
}

/**
 * Generate unique ID matching prpcService
 */
function generateUniqueId(pubkey?: string, address?: string): string {
    const pubkeyPart = pubkey?.substring(0, 8) || 'unknown';
    const addressPart = address?.split(':')[0]?.split('.').pop() || 'unknown';
    return `${pubkeyPart}-${addressPart}`;
}

/**
 * Transform raw pod data to PNode format
 * MUST produce the same results as prpcService.transformPodToNode
 */
function transformPod(pod: RawPodData, maxTimestamp: number): PNode {
    const status = determineStatus(pod.last_seen_timestamp, maxTimestamp);
    const secondsAgo = maxTimestamp - pod.last_seen_timestamp;
    const lastSeenDate = new Date(Date.now() - (secondsAgo * 1000));
    const ipAddress = pod.address?.split(':')[0] || 'unknown';
    const port = parseInt(pod.address?.split(':')[1] || '9001', 10);

    return {
        id: generateUniqueId(pod.pubkey ?? undefined, pod.address ?? undefined),
        publicKey: pod.pubkey || 'unknown',
        status,
        uptime: calculateUptimePercent(pod.uptime || 0, status, pod.last_seen_timestamp, maxTimestamp),
        uptimeSeconds: pod.uptime || 0,
        responseTime: 0,
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
            port,
            rpcPort: pod.rpc_port || 6000,
        },
    };
}

export async function GET(request: NextRequest) {
    try {
        // Check auth in production only
        if (CRON_SECRET && process.env.NODE_ENV === 'production') {
            const { searchParams } = new URL(request.url);
            const queryKey = searchParams.get('key');
            const authHeader = request.headers.get('authorization');
            const bearerToken = authHeader?.replace('Bearer ', '');

            if (queryKey !== CRON_SECRET && bearerToken !== CRON_SECRET) {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
        }

        // Check configuration
        if (SEED_IPS.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No seed nodes configured. Set NEXT_PUBLIC_PNODE_SEED_IPS env var.',
            }, { status: 500 });
        }

        console.log(`[cron/snapshot] Fetching from ${SEED_IPS.length} seeds...`);

        // Try each seed until one works
        let rawPods: RawPodData[] = [];
        for (const seedIP of SEED_IPS) {
            const result = await httpRequest(seedIP);
            if (result.success && result.data?.pods?.length > 0) {
                rawPods = result.data.pods;
                console.log(`[cron/snapshot] Got ${rawPods.length} pods from ${seedIP}`);
                break;
            }
        }

        if (rawPods.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No pods returned from any seed node',
            }, { status: 502 });
        }

        // Fetch credits
        const creditsMap = await fetchCredits();
        console.log(`[cron/snapshot] Got credits for ${creditsMap.size} nodes`);

        // Transform pods to nodes (matching prpcService exactly)
        const maxTimestamp = Math.max(...rawPods.map(p => p.last_seen_timestamp || 0));
        const nodes = rawPods.map(pod => transformPod(pod, maxTimestamp));

        // Enrich with staking data (legacy)
        const enrichedNodes = enrichNodesWithStakingData(nodes);

        // Enrich with credits
        const nodesWithCredits = enrichedNodes.map(node => ({
            ...node,
            credits: creditsMap.get(node.publicKey) ?? 0
        }));

        // Calculate stats
        const onlineNodes = nodesWithCredits.filter(n => n.status === 'online').length;
        const offlineNodes = nodesWithCredits.filter(n => n.status === 'offline').length;
        const degradedNodes = nodesWithCredits.filter(n => n.status === 'degraded').length;
        const totalStorage = nodesWithCredits.reduce((sum, n) => sum + (n.storage?.total || 0), 0);
        const usedStorage = nodesWithCredits.reduce((sum, n) => sum + (n.storage?.used || 0), 0);

        // Average uptime
        const avgUptime = nodesWithCredits.length > 0
            ? nodesWithCredits.reduce((sum, n) => sum + n.uptime, 0) / nodesWithCredits.length
            : 0;

        // Average staking score
        const avgStakingScore = nodesWithCredits.length > 0
            ? nodesWithCredits.reduce((sum, n) => sum + (n.stakingScore || 0), 0) / nodesWithCredits.length
            : 0;

        // Credits stats
        const totalCredits = Array.from(creditsMap.values()).reduce((sum, c) => sum + c, 0);
        const avgCredits = creditsMap.size > 0 ? totalCredits / creditsMap.size : 0;

        console.log(`[cron/snapshot] Stats - avgUptime: ${avgUptime.toFixed(2)}%, avgCredits: ${avgCredits.toFixed(0)}`);

        // Dynamically import DB functions to catch initialization errors (e.g. read-only FS)
        let createSnapshot, insertNodeSnapshots, pruneOldSnapshots;
        try {
            const dbQueries = await import('@/lib/db/queries');
            createSnapshot = dbQueries.createSnapshot;
            insertNodeSnapshots = dbQueries.insertNodeSnapshots;
            pruneOldSnapshots = dbQueries.pruneOldSnapshots;
        } catch (dbError) {
            console.error('[cron/snapshot] Database initialization failed:', dbError);
            return NextResponse.json({
                success: false,
                error: 'Database initialization failed',
                details: dbError instanceof Error ? dbError.message : String(dbError),
                stack: dbError instanceof Error ? dbError.stack : undefined
            }, { status: 500 });
        }

        // Create snapshot
        const snapshotId = createSnapshot({
            total_nodes: nodesWithCredits.length,
            online_nodes: onlineNodes,
            degraded_nodes: degradedNodes,
            offline_nodes: offlineNodes,
            total_storage_bytes: totalStorage,
            used_storage_bytes: usedStorage,
            avg_uptime: avgUptime,
            avg_staking_score: avgStakingScore,
            total_credits: totalCredits,
            avg_credits: avgCredits
        });

        // Insert node snapshots (deduplicated by node_id)
        const nodeDataMap = new Map<string, typeof nodesWithCredits[0]>();
        for (const node of nodesWithCredits) {
            nodeDataMap.set(node.id, node);
        }

        const nodeData = Array.from(nodeDataMap.values()).map(node => ({
            node_id: node.id,
            public_key: node.publicKey,
            status: node.status,
            uptime_percent: node.uptime,
            storage_usage_percent: node.storage?.usagePercent || 0,
            staking_score: node.stakingScore || 0,
            credits: node.credits || 0,
            version: node.version,
            is_public: node.isPublic,
        }));

        insertNodeSnapshots(snapshotId, nodeData);

        // Prune old snapshots
        const prunedCount = pruneOldSnapshots(30);

        // Process alerts for subscribers
        const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
        console.log(`[cron/snapshot] Processing alerts with baseUrl: ${baseUrl}`);
        const alertStats = await processAlerts(nodeData, baseUrl);
        console.log(`[cron/snapshot] Alerts sent - offline: ${alertStats.offlineAlerts}, score drops: ${alertStats.scoreDropAlerts}, errors: ${alertStats.errors}`);

        return NextResponse.json({
            success: true,
            data: {
                snapshotId,
                nodeCount: nodesWithCredits.length,
                onlineNodes,
                offlineNodes,
                degradedNodes,
                avgUptime: Math.round(avgUptime * 100) / 100,
                avgStakingScore: Math.round(avgStakingScore * 100) / 100,
                avgCredits: Math.round(avgCredits),
                prunedSnapshots: prunedCount,
                alertsSent: alertStats.offlineAlerts + alertStats.scoreDropAlerts,
                alertErrors: alertStats.errors,
            },
            message: `Snapshot created with ${nodesWithCredits.length} nodes, ${alertStats.offlineAlerts + alertStats.scoreDropAlerts} alerts sent`,
        });

    } catch (error) {
        console.error('[cron/snapshot] Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return GET(request);
}
