/**
 * pRPC Service - Connects to Xandeum pNode RPC endpoints via API proxy
 * IMPORTANT: Does NOT fetch geolocation during initial load - that's done lazily
 */

import { RawPodData, PNode, PNodeListResponse } from '@/types/pnode';



// Constants for status determination (relative to max timestamp in dataset)
const ONLINE_THRESHOLD_SECONDS = 60; // Node is online if seen within 60 seconds of most recent
const DEGRADED_THRESHOLD_SECONDS = 300; // Node is degraded if seen within 5 minutes

/**
 * Determine node status based on last seen timestamp relative to max timestamp
 */
function determineStatus(lastSeenTimestamp: number, maxTimestamp: number): 'online' | 'offline' | 'degraded' {
    const secondsSinceLastSeen = maxTimestamp - lastSeenTimestamp;

    if (secondsSinceLastSeen <= ONLINE_THRESHOLD_SECONDS) {
        return 'online';
    } else if (secondsSinceLastSeen <= DEGRADED_THRESHOLD_SECONDS) {
        return 'degraded';
    }
    return 'offline';
}

/**
 * Calculate health score based on multiple factors
 * Score 0-100 where 100 is best
 */
function calculateHealthScore(pod: RawPodData, status: 'online' | 'offline' | 'degraded'): number {
    let score = 0;

    // Status weight (40%)
    if (status === 'online') score += 40;
    else if (status === 'degraded') score += 20;

    // Uptime weight (30%) - More uptime = better
    const uptimeHours = (pod.uptime || 0) / 3600;
    const uptimeScore = Math.min(30, (uptimeHours / 24) * 30); // Max score at 24+ hours
    score += uptimeScore;

    // Storage health (20%) - Having committed storage is good
    if (pod.storage_committed && pod.storage_committed > 0) {
        score += 10;
        // Usage percentage shouldn't be too high
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
 * Calculate uptime percentage from seconds with offline penalty
 * If node is offline/degraded, deduct the offline time from uptime
 */
function calculateUptimePercent(
    uptimeSeconds: number,
    status: string,
    lastSeenTimestamp: number,
    maxTimestamp: number
): number {
    const DAY_IN_SECONDS = 86400;

    // Base uptime from consecutive runtime (capped at 100%)
    let baseUptime = Math.min(100, (uptimeSeconds / DAY_IN_SECONDS) * 100);

    // If node is offline/degraded, apply penalty based on time since last seen
    if (status !== 'online') {
        const offlineSeconds = maxTimestamp - lastSeenTimestamp;

        // Penalty: deduct offline time from 24h window
        // E.g., offline for 1 hour = 4.2% penalty
        const penalty = (offlineSeconds / DAY_IN_SECONDS) * 100;

        baseUptime = Math.max(0, baseUptime - penalty);
    }

    return Math.round(baseUptime * 10) / 10;
}

/**
 * Extract IP address from address string (IP:Port format)
 */
function extractIP(address: string): string {
    const parts = address.split(':');
    return parts[0];
}

/**
 * Extract port from address string
 */
function extractPort(address: string): number {
    const parts = address.split(':');
    return parseInt(parts[1] || '9001', 10);
}

/**
 * Generate unique ID from pubkey and address
 * Some nodes share the same pubkey but have different addresses
 */
function generateUniqueId(pubkey: string | null, address: string): string {
    if (!pubkey) return 'unknown-' + Math.random().toString(36).substring(2, 8);
    // Combine first 8 chars of pubkey with a hash of the address for uniqueness
    const addrHash = address.split(':')[0].split('.').slice(-2).join('');
    return `${pubkey.substring(0, 8)}-${addrHash}`;
}

/**
 * Transform raw pod data to PNode format
 * NOTE: Does NOT include geolocation - that's fetched lazily for displayed nodes only
 */
function transformPodToNode(
    pod: RawPodData,
    responseTime: number,
    maxTimestamp: number
): PNode {
    const status = determineStatus(pod.last_seen_timestamp, maxTimestamp);
    const ipAddress = extractIP(pod.address);

    // Calculate relative "last seen" for display
    const secondsAgo = maxTimestamp - pod.last_seen_timestamp;
    const lastSeenDate = new Date(Date.now() - (secondsAgo * 1000));

    return {
        id: generateUniqueId(pod.pubkey, pod.address),
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
        // Location is NOT set here - it's fetched lazily for displayed nodes
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

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 8000,  // 8 seconds max
};

/**
 * Custom error class for network errors with user-friendly messages
 */
export class NetworkError extends Error {
    public userMessage: string;
    public isRetryable: boolean;
    public statusCode?: number;

    constructor(message: string, userMessage: string, isRetryable: boolean = true, statusCode?: number) {
        super(message);
        this.name = 'NetworkError';
        this.userMessage = userMessage;
        this.isRetryable = isRetryable;
        this.statusCode = statusCode;
    }
}

/**
 * Get user-friendly error message based on error type
 */
function getUserFriendlyMessage(error: Error, statusCode?: number): string {
    const message = error.message.toLowerCase();

    if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
        return 'The pRPC network is temporarily unavailable. This usually resolves within a few minutes.';
    }

    if (message.includes('timeout') || message.includes('timed out')) {
        return 'Connection to the pRPC network timed out. Please check your internet connection.';
    }

    if (message.includes('network') || message.includes('fetch')) {
        return 'Unable to connect to the pRPC network. Please check your internet connection.';
    }

    if (message.includes('all seed nodes failed')) {
        return 'All pRPC seed nodes are currently unavailable. The network may be under maintenance.';
    }

    return 'Unable to fetch node data. Please try again later.';
}

/**
 * Fetch nodes with retry logic and exponential backoff
 */
async function fetchNodesWithRetry(attempt: number = 1, network?: 'mainnet' | 'devnet' | 'all'): Promise<PNodeListResponse> {
    try {
        // Build request body with optional network filter
        const requestBody: any = {
            method: 'get-pods-with-stats',
        };

        // If using network filter, append to URL for server-side filtering
        const url = network && network !== 'all'
            ? `/api/prpc?network=${network}`
            : '/api/prpc';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const statusCode = response.status;

        if (!response.ok) {
            const errorText = response.statusText || 'Unknown error';
            const error = new Error(`HTTP ${statusCode}: ${errorText}`);
            const userMessage = getUserFriendlyMessage(error, statusCode);

            // 5xx errors are retryable, 4xx are not
            const isRetryable = statusCode >= 500 && statusCode < 600;

            throw new NetworkError(
                `HTTP ${statusCode}: ${errorText}`,
                userMessage,
                isRetryable,
                statusCode
            );
        }

        const result = await response.json();

        if (!result.success) {
            const error = new Error(result.error || 'Failed to fetch nodes');
            throw new NetworkError(
                result.error || 'Failed to fetch nodes',
                getUserFriendlyMessage(error),
                true
            );
        }

        const pods: RawPodData[] = result.data?.pods || [];
        const responseTime = result.responseTime || 0;

        // Find the maximum last_seen_timestamp to use as reference
        const maxTimestamp = pods.reduce((max, pod) =>
            Math.max(max, pod.last_seen_timestamp || 0), 0
        );

        // Transform all pods to nodes (NO geolocation - that's lazy loaded)
        const nodes = pods
            .filter(pod => pod.pubkey)
            .map(pod => transformPodToNode(pod, responseTime, maxTimestamp));

        // Log status distribution
        const online = nodes.filter(n => n.status === 'online').length;
        const degraded = nodes.filter(n => n.status === 'degraded').length;
        const offline = nodes.filter(n => n.status === 'offline').length;
        console.log(`[prpcService] Nodes: ${online} online, ${degraded} degraded, ${offline} offline`);

        return {
            success: true,
            data: {
                nodes,
                total: nodes.length,
            },
            timestamp: new Date().toISOString(),
            responseTime,
        };

    } catch (error) {
        const isNetworkError = error instanceof NetworkError;
        const isRetryable = isNetworkError ? error.isRetryable : true;

        // If we can retry and haven't exceeded max attempts
        if (isRetryable && attempt < RETRY_CONFIG.maxRetries) {
            const delay = Math.min(
                RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
                RETRY_CONFIG.maxDelay
            );

            console.warn(`[prpcService] Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await sleep(delay);

            return fetchNodesWithRetry(attempt + 1, network);
        }

        // All retries exhausted or non-retryable error
        if (isNetworkError) {
            console.error(`[prpcService] Failed after ${attempt} attempts:`, error.message);
            throw error;
        }

        // Wrap unknown errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const userMessage = getUserFriendlyMessage(new Error(errorMessage));
        console.error(`[prpcService] Failed after ${attempt} attempts:`, errorMessage);

        throw new NetworkError(
            `Failed to fetch nodes: ${errorMessage}`,
            userMessage,
            false
        );
    }
}

/**
 * Fetch nodes via the API proxy route with retry logic
 */
export async function fetchNodes(network?: 'mainnet' | 'devnet' | 'all'): Promise<PNodeListResponse> {
    return fetchNodesWithRetry(1, network);
}

export const prpcService = {
    fetchNodes,
};
