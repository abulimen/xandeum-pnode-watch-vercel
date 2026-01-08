/**
 * Analytics Service - Calculations and issue detection for pNode network
 * Updated for real pRPC data
 */

import { PNode, NetworkStats } from '@/types/pnode';
import { NodeIssue } from '@/types/issues';


/**
 * Thresholds for issue detection
 */
const THRESHOLDS = {
    UPTIME_WARNING: 90,
    UPTIME_CRITICAL: 80,
    RESPONSE_TIME_WARNING: 1000,
    RESPONSE_TIME_CRITICAL: 2000,
    STORAGE_WARNING: 85,
    STORAGE_CRITICAL: 95,
    STALE_DATA_MINUTES: 10,
    HEALTH_SCORE_WARNING: 40, // Lower threshold - only flag truly unhealthy nodes
    HEALTH_SCORE_CRITICAL: 25,
};

/**
 * Weights for network health score calculation
 */
const HEALTH_WEIGHTS = {
    availability: 0.4,
    performance: 0.3,
    storage: 0.3,
};

/**
 * Calculate the overall network health score (0-100)
 */
export function calculateNetworkHealth(nodes: PNode[]): number {
    if (nodes.length === 0) return 0;

    // Availability score: percentage of non-offline nodes
    const onlineCount = nodes.filter(n => n.status !== 'offline').length;
    const availability = onlineCount / nodes.length;

    // Average node health scores
    const avgHealthScore = nodes.reduce((sum, n) => sum + (n.healthScore || 0), 0) / nodes.length;

    // Performance score: inverse of average response time (capped at 1000ms)
    const avgResponseTime = nodes.reduce((sum, n) => sum + n.responseTime, 0) / nodes.length;
    const performance = Math.max(0, 1 - (avgResponseTime / 1000));

    // Storage score: use usagePercent safely
    const nodesWithStorage = nodes.filter(n => n.storage.total > 0);
    let storage = 1;
    if (nodesWithStorage.length > 0) {
        const avgStorageUtil = nodesWithStorage.reduce((sum, n) =>
            sum + (n.storage.usagePercent || 0), 0) / nodesWithStorage.length / 100;
        storage = avgStorageUtil < 0.9 ? 1 : Math.max(0, 1 - (avgStorageUtil - 0.9) * 10);
    }

    // Combined weighted score
    const health = (
        availability * HEALTH_WEIGHTS.availability +
        performance * HEALTH_WEIGHTS.performance +
        storage * HEALTH_WEIGHTS.storage
    ) * 100;

    // Factor in average node health
    const finalHealth = (health * 0.6) + (avgHealthScore * 0.4);

    return Math.round(finalHealth * 10) / 10;
}

/**
 * Calculate aggregate network statistics
 */
export function calculateNetworkStats(nodes: PNode[]): NetworkStats {
    if (nodes.length === 0) {
        return {
            totalNodes: 0,
            onlineNodes: 0,
            offlineNodes: 0,
            degradedNodes: 0,
            avgUptime: 0,
            avgResponseTime: 0,
            totalStorage: 0,
            usedStorage: 0,
            storageUtilization: 0,
            healthScore: 0,
            timestamp: new Date().toISOString(),
            publicNodes: 0,
            privateNodes: 0,
            versionDistribution: {},
            avgHealthScore: 0,
            avgCredits: 0,
            avgStakingScore: 0,
            totalCredits: 0,
            creditsThreshold: 0,
            eliteNodes: 0,
        };
    }

    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const offlineNodes = nodes.filter(n => n.status === 'offline').length;
    const degradedNodes = nodes.filter(n => n.status === 'degraded').length;
    const publicNodes = nodes.filter(n => n.isPublic).length;
    const privateNodes = nodes.length - publicNodes;
    const eliteNodes = nodes.filter(n => n.uptime >= 99.5).length; // All nodes with 99.5%+ uptime (regardless of current status)

    const avgUptime = nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length;
    const avgResponseTime = nodes.reduce((sum, n) => sum + n.responseTime, 0) / nodes.length;
    const avgHealthScore = nodes.reduce((sum, n) => sum + (n.healthScore || 0), 0) / nodes.length;

    const totalStorage = nodes.reduce((sum, n) => sum + n.storage.total, 0);
    const usedStorage = nodes.reduce((sum, n) => sum + n.storage.used, 0);
    const storageUtilization = totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;

    // Version distribution
    const versionDistribution: Record<string, number> = {};
    nodes.forEach(node => {
        const version = node.version || 'unknown';
        versionDistribution[version] = (versionDistribution[version] || 0) + 1;
    });

    return {
        totalNodes: nodes.length,
        onlineNodes,
        offlineNodes,
        degradedNodes,
        avgUptime: Math.round(avgUptime * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime),
        totalStorage,
        usedStorage,
        storageUtilization: Math.round(storageUtilization * 100) / 100,
        healthScore: calculateNetworkHealth(nodes),
        timestamp: new Date().toISOString(),
        publicNodes,
        privateNodes,
        versionDistribution,
        avgHealthScore: Math.round(avgHealthScore * 10) / 10,
        avgCredits: 0, // Will be calculated separately with credits data
        avgStakingScore: 0, // Deprecated
        totalCredits: 0, // Will be calculated separately
        creditsThreshold: 0, // Will be calculated separately
        eliteNodes,
    };
}

/**
 * Detect issues and anomalies across all nodes
 * Simplified to only flag offline nodes as issues
 */
export function detectIssues(nodes: PNode[]): NodeIssue[] {
    const issues: NodeIssue[] = [];

    nodes.forEach(node => {
        // Offline detection only
        if (node.status === 'offline') {
            issues.push({
                id: `${node.id}-offline-${Date.now()}`,
                nodeId: node.id,
                type: 'offline',
                severity: 'high',
                message: `Node ${node.id} is offline`,
                timestamp: new Date().toISOString(),
            });
        }
    });

    return issues;
}

/**
 * Get top performing nodes by health score
 */
export function getTopNodesByHealthScore(nodes: PNode[], limit: number = 10): PNode[] {
    return [...nodes]
        .filter(n => n.status !== 'offline')
        .sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0))
        .slice(0, limit);
}

/**
 * Get top performing nodes by uptime seconds
 */
export function getTopNodesByUptime(nodes: PNode[], limit: number = 10): PNode[] {
    return [...nodes]
        .filter(n => n.status !== 'offline')
        .sort((a, b) => (b.uptimeSeconds || 0) - (a.uptimeSeconds || 0))
        .slice(0, limit);
}

/**
 * Get top performing nodes by response time (fastest first)
 */
export function getTopNodesByResponseTime(nodes: PNode[], limit: number = 10): PNode[] {
    return [...nodes]
        .filter(n => n.status !== 'offline')
        .sort((a, b) => a.responseTime - b.responseTime)
        .slice(0, limit);
}

/**
 * Get top nodes by storage committed
 */
export function getTopNodesByStorage(nodes: PNode[], limit: number = 10): PNode[] {
    return [...nodes]
        .sort((a, b) => b.storage.total - a.storage.total)
        .slice(0, limit);
}

/**
 * Get geographic distribution of nodes
 */
export function getGeographicDistribution(nodes: PNode[]): Record<string, { count: number; countries: Record<string, number> }> {
    const distribution: Record<string, { count: number; countries: Record<string, number> }> = {};

    nodes.forEach(node => {
        if (!node.location) return;

        const region = node.location.region || 'Unknown';
        if (!distribution[region]) {
            distribution[region] = { count: 0, countries: {} };
        }

        distribution[region].count++;

        const country = node.location.country || 'Unknown';
        if (!distribution[region].countries[country]) {
            distribution[region].countries[country] = 0;
        }
        distribution[region].countries[country]++;
    });

    return distribution;
}

/**
 * Get version distribution summary
 */
export function getVersionDistribution(nodes: PNode[]): { version: string; count: number; percentage: number }[] {
    const versionCounts: Record<string, number> = {};

    nodes.forEach(node => {
        const version = node.version || 'unknown';
        versionCounts[version] = (versionCounts[version] || 0) + 1;
    });

    return Object.entries(versionCounts)
        .map(([version, count]) => ({
            version,
            count,
            percentage: (count / nodes.length) * 100,
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get storage distribution by node
 */
export function getStorageDistribution(nodes: PNode[]): { nodeId: string; committed: number; used: number }[] {
    return nodes
        .filter(n => n.storage.total > 0)
        .map(node => ({
            nodeId: node.id,
            committed: node.storage.total,
            used: node.storage.used,
        }))
        .sort((a, b) => b.committed - a.committed);
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format uptime seconds to human-readable string
 */
export function formatUptime(seconds: number): string {
    if (seconds === 0) return '0s';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(isoTimestamp: string): string {
    const now = Date.now();
    const then = new Date(isoTimestamp).getTime();
    const diffMs = now - then;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

/**
 * Format duration from seconds to human-readable format (e.g., "3d 12h" or "4h 30m")
 */
export function formatDuration(seconds: number): string {
    if (seconds <= 0) return '0m';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
    if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
}

// ============================================
// NODE ENRICHMENT (simplified - credits come from API)
// ============================================

/**
 * Get the most common version among nodes (considered "latest")
 */
export function getMostCommonVersion(nodes: PNode[]): string {
    const versionCounts: Record<string, number> = {};

    nodes.forEach(node => {
        const version = node.version || 'unknown';
        versionCounts[version] = (versionCounts[version] || 0) + 1;
    });

    let mostCommon = 'unknown';
    let maxCount = 0;

    Object.entries(versionCounts).forEach(([version, count]) => {
        if (count > maxCount && version !== 'unknown') {
            mostCommon = version;
            maxCount = count;
        }
    });

    return mostCommon;
}

/**
 * Get version status compared to most common version
 */
export function getVersionStatus(
    nodeVersion: string,
    latestVersion: string
): 'current' | 'outdated' | 'unknown' {
    if (!nodeVersion || nodeVersion === 'unknown') return 'unknown';
    if (!latestVersion || latestVersion === 'unknown') return 'unknown';
    if (nodeVersion === latestVersion) return 'current';
    return 'outdated';
}

/**
 * Version types for node software
 */
export type VersionType = 'mainnet' | 'trynet' | 'devnet' | 'unknown';

/**
 * Detect the version type from version string
 */
export function getVersionType(version: string): VersionType {
    if (!version) return 'unknown';
    const v = version.toLowerCase();
    if (v.includes('trynet')) return 'trynet';
    if (v.includes('devnet')) return 'devnet';
    if (/^v?\d+\.\d+\.\d+$/.test(version)) return 'mainnet';
    return 'unknown';
}

/**
 * Get uptime reliability badge
 */
export function getUptimeBadge(uptime: number): 'elite' | 'reliable' | 'average' | 'unreliable' {
    if (uptime >= 99.5) return 'elite';    // 🏆 99.5%+
    if (uptime >= 95) return 'reliable';   // ✅ 95-99%
    if (uptime >= 80) return 'average';    // ⚡ 80-95%
    return 'unreliable';                    // ⚠️ < 80%
}

/**
 * Enrich nodes with version and uptime metadata
 * Credits come from the official API via useCredits hook
 */
export function enrichNodesWithStakingData(nodes: PNode[]): PNode[] {
    const latestVersion = getMostCommonVersion(nodes);

    return nodes.map(node => ({
        ...node,
        versionStatus: getVersionStatus(node.version, latestVersion),
        versionType: getVersionType(node.version),
        uptimeBadge: getUptimeBadge(node.uptime),
    }));
}


/**
 * Get top nodes by credits
 */
export function getTopStakingNodes(nodes: PNode[], count: number = 5): PNode[] {
    return nodes
        .filter(n => (n.credits ?? 0) > 0) // Include all nodes with credits (even offline)
        .sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0))
        .slice(0, count);
}
