'use server';

import { NextResponse } from 'next/server';
import http from 'http';

// Configuration from environment
const SEED_IPS = (process.env.NEXT_PUBLIC_PNODE_SEED_IPS || '').split(',').filter(Boolean);
const RPC_PORT = parseInt(process.env.NEXT_PUBLIC_PNODE_RPC_PORT || '6000', 10);
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_PNODE_RPC_ENDPOINT || '/rpc';
const LONGCAT_API_KEY = process.env.LONGCAT_API_KEY || '';
const LONGCAT_API_URL = process.env.LONGCAT_API_URL || 'https://api.longcat.chat/openai/v1/chat/completions';

// Cache for network summary (1 hour TTL) - keyed by network
let cachedSummary: Record<string, { data: NetworkSummaryData; timestamp: number }> = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export interface NetworkSummaryData {
    generatedAt: string;
    title: string;
    content: string; // Markdown content
    keyRecommendation: string;
}

// Promise-based HTTP request using Node.js http module
function httpRequest(seedIP: string, method: string): Promise<{
    success: boolean;
    data?: any;
    seedIP: string;
    error?: string;
}> {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            method,
            id: 1,
        });

        const options: http.RequestOptions = {
            hostname: seedIP,
            port: RPC_PORT,
            path: RPC_ENDPOINT,
            method: 'POST',
            timeout: 5000,
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
                        resolve({ success: false, error: `RPC Error: ${data.error}`, seedIP });
                        return;
                    }
                    resolve({ success: true, data: data.result, seedIP });
                } catch {
                    resolve({ success: false, error: 'Invalid JSON response', seedIP });
                }
            });
        });

        req.on('error', (error) => {
            resolve({ success: false, error: error.message, seedIP });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, error: 'Request timed out', seedIP });
        });

        req.write(postData);
        req.end();
    });
}

async function fetchNetworkData(network: 'mainnet' | 'devnet' | 'all' = 'all'): Promise<{ nodes: any[]; credits: Record<string, number> }> {
    // Use the host from environment or fallback to localhost
    const baseUrl = process.env.BASE_URL
        ? `https://${process.env.BASE_URL}`
        : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

    console.log(`[network-summary] Fetching data for network: ${network}, using base URL:`, baseUrl);

    let nodes: any[] = [];
    let credits: Record<string, number> = {};

    // Fetch nodes from our existing /api/prpc endpoint (POST method)
    try {
        console.log('[network-summary] Calling /api/prpc...');
        const nodesRes = await fetch(`${baseUrl}/api/prpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'get-pods-with-stats' }),
            cache: 'no-store',
            signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (nodesRes.ok) {
            const data = await nodesRes.json();
            // The API returns { success, data: { pods: [...], total_count } }
            if (data.success && data.data?.pods && Array.isArray(data.data.pods)) {
                nodes = data.data.pods;
                console.log(`[network-summary] Got ${nodes.length} nodes from prpc`);
            } else if (data.success && Array.isArray(data.data)) {
                nodes = data.data;
                console.log(`[network-summary] Got ${nodes.length} nodes (alt structure)`);
            } else {
                console.error('[network-summary] prpc unexpected structure');
            }
        } else {
            console.error('[network-summary] prpc failed:', nodesRes.status);
        }
    } catch (e: any) {
        console.error('[network-summary] Failed to fetch nodes:', e.message || e);
    }

    // Fetch credits from our existing /api/credits endpoint with network filter
    try {
        const creditsUrl = network !== 'all'
            ? `${baseUrl}/api/credits?network=${network}`
            : `${baseUrl}/api/credits`;
        console.log(`[network-summary] Calling ${creditsUrl}...`);
        const creditsRes = await fetch(creditsUrl, { cache: 'no-store' });

        if (creditsRes.ok) {
            const data = await creditsRes.json();
            if (data.status === 'success' && Array.isArray(data.pods_credits)) {
                for (const entry of data.pods_credits) {
                    if (entry.pod_id && typeof entry.credits === 'number') {
                        credits[entry.pod_id] = entry.credits;
                    }
                }
                console.log(`[network-summary] Got ${Object.keys(credits).length} credits for ${network}`);
            }
        }
    } catch (e) {
        console.error('[network-summary] Failed to fetch credits:', e);
    }

    // Process nodes to add calculated fields (status, health, uptime)
    const processedNodes = processNodes(nodes);

    return { nodes: processedNodes, credits };
}

// Constants for status determination
const ONLINE_THRESHOLD_SECONDS = 60;
const DEGRADED_THRESHOLD_SECONDS = 300;

function processNodes(rawNodes: any[]) {
    if (!rawNodes.length) return [];

    // Find max timestamp to determine relative status
    const maxTimestamp = Math.max(...rawNodes.map(n => n.last_seen_timestamp || 0));

    return rawNodes.map(node => {
        const lastSeen = node.last_seen_timestamp || 0;
        const secondsSinceLastSeen = maxTimestamp - lastSeen;

        let status = 'offline';
        if (secondsSinceLastSeen <= ONLINE_THRESHOLD_SECONDS) status = 'online';
        else if (secondsSinceLastSeen <= DEGRADED_THRESHOLD_SECONDS) status = 'degraded';

        const uptimeSeconds = node.uptime || 0;
        const uptimePercent = Math.min(100, (uptimeSeconds / 86400) * 100);

        // Calculate health score
        let healthScore = 0;
        // Status weight (40%)
        if (status === 'online') healthScore += 40;
        else if (status === 'degraded') healthScore += 20;

        // Uptime weight (30%)
        const uptimeHours = uptimeSeconds / 3600;
        const uptimeScore = Math.min(30, (uptimeHours / 24) * 30);
        healthScore += uptimeScore;

        // Storage health (20%)
        if (node.storage_committed && node.storage_committed > 0) {
            healthScore += 10;
            const usagePercent = node.storage_usage_percent || 0;
            if (usagePercent < 80) healthScore += 10;
            else if (usagePercent < 95) healthScore += 5;
        }

        // Version/completeness (10%)
        if (node.version && node.version !== 'unknown') healthScore += 5;
        if (node.pubkey) healthScore += 5;

        return {
            ...node,
            status,
            uptime: uptimePercent, // Convert to percentage for analysis
            healthScore: Math.round(healthScore),
            location: { country: 'Unknown' } // Default since we don't fetch geo here
        };
    });
}

function analyzeNetworkData(nodes: any[], creditsMap: Record<string, number>) {
    const totalNodes = nodes.length;
    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const degradedNodes = nodes.filter(n => n.status === 'degraded').length;
    const offlineNodes = nodes.filter(n => n.status === 'offline').length;

    const onlinePercent = totalNodes > 0 ? (onlineNodes / totalNodes) * 100 : 0;
    const avgUptime = nodes.length > 0
        ? nodes.reduce((sum, n) => sum + (n.uptime || 0), 0) / nodes.length
        : 0;
    const avgHealth = nodes.length > 0
        ? nodes.reduce((sum, n) => sum + (n.healthScore || 0), 0) / nodes.length
        : 0;

    // Version analysis
    const versionCounts: Record<string, number> = {};
    nodes.forEach(n => {
        const v = n.version || 'unknown';
        versionCounts[v] = (versionCounts[v] || 0) + 1;
    });
    const versions = Object.entries(versionCounts)
        .map(([version, count]) => ({ version, count, percent: (count / totalNodes) * 100 }))
        .sort((a, b) => b.count - a.count);

    // Geographic analysis
    const countryCounts: Record<string, number> = {};
    nodes.forEach(n => {
        const country = n.location?.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Calculate health score (0-100)
    const healthScore = Math.round(
        (onlinePercent * 0.4) +
        (avgUptime * 0.3) +
        (avgHealth * 0.3)
    );

    return {
        totalNodes,
        onlineNodes,
        degradedNodes,
        offlineNodes,
        onlinePercent,
        avgUptime,
        avgHealth,
        healthScore,
        versions,
        topCountries,
        countryCount: Object.keys(countryCounts).length,
        creditsMap
    };
}

async function generateAISummary(analysis: ReturnType<typeof analyzeNetworkData>, network: string = 'all'): Promise<NetworkSummaryData> {
    const networkLabel = network === 'all' ? 'All Networks' : network.charAt(0).toUpperCase() + network.slice(1);

    const prompt = `You are a network analyst for Xandeum, a decentralized storage network. Analyze the following network data and provide a professional executive summary.

NETWORK: ${networkLabel}

NETWORK DATA:
- Total pNodes: ${analysis.totalNodes}
- Online: ${analysis.onlineNodes} (${analysis.onlinePercent.toFixed(1)}%)
- Degraded: ${analysis.degradedNodes}
- Offline: ${analysis.offlineNodes}
- Average Uptime (24h): ${analysis.avgUptime.toFixed(1)}%
- Average Health Score: ${analysis.avgHealth.toFixed(1)}/100
- Version distribution: ${analysis.versions.slice(0, 5).map(v => `${v.version}: ${v.count} (${v.percent.toFixed(0)}%)`).join(', ')}

INSTRUCTIONS:
1. Write a title "Xandeum ${networkLabel} pNode Network Analysis".
2. Write 2-3 paragraphs analyzing the network health, performance, and version adoption.
3. Use **bold** for key metrics and positive/negative indicators (e.g., **good operational health**, **excellent performance**, **severe lack of geographic diversity**).
4. Provide one "Key Recommendation" at the end.

Respond ONLY with valid JSON in this format:
{
  "title": "Xandeum ${networkLabel} pNode Network Analysis",
  "content": "Markdown content with paragraphs and **bold** highlights...",
  "keyRecommendation": "Your recommendation here..."
}`;

    try {
        const response = await fetch(LONGCAT_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${LONGCAT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'LongCat-Flash-Chat',
                messages: [
                    { role: 'system', content: 'You are a helpful AI assistant that analyzes network data.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`LongCat API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in AI response');

        const aiResponse = JSON.parse(jsonMatch[0]);

        return {
            generatedAt: new Date().toISOString(),
            title: aiResponse.title || 'Xandeum pNode Network Analysis',
            content: aiResponse.content || 'Analysis unavailable.',
            keyRecommendation: aiResponse.keyRecommendation || 'Monitor network health.'
        };

    } catch (error) {
        console.error('[network-summary] AI generation failed:', error);

        // Fallback without AI
        const networkLabel = network === 'all' ? 'All Networks' : network.charAt(0).toUpperCase() + network.slice(1);
        return {
            generatedAt: new Date().toISOString(),
            title: `Xandeum ${networkLabel} pNode Network Analysis`,
            content: `The Xandeum ${networkLabel.toLowerCase()} network currently has **${analysis.totalNodes} pNodes** with **${analysis.onlinePercent.toFixed(1)}% online**. The average health score is **${analysis.avgHealth.toFixed(1)}/100**.\n\nVersion adoption shows **${analysis.versions[0]?.version || 'unknown'}** is the dominant version with **${analysis.versions[0]?.percent.toFixed(1)}%** of nodes.`,
            keyRecommendation: 'Ensure all nodes are running the latest version for optimal performance.'
        };
    }
}

export async function GET(request: Request) {
    try {
        // Get network from query params
        const { searchParams } = new URL(request.url);
        const network = (searchParams.get('network') as 'mainnet' | 'devnet' | 'all') || 'all';
        const cacheKey = network;

        // Check cache
        if (cachedSummary[cacheKey] && (Date.now() - cachedSummary[cacheKey].timestamp) < CACHE_TTL) {
            console.log(`[network-summary] Returning cached summary for ${network}`);
            return NextResponse.json(cachedSummary[cacheKey].data);
        }

        console.log(`[network-summary] Generating new summary for ${network}...`);

        // Fetch data with network filter
        const { nodes, credits } = await fetchNetworkData(network);

        if (!nodes.length) {
            return NextResponse.json(
                { error: 'No network data available' },
                { status: 503 }
            );
        }

        // Analyze data
        const analysis = analyzeNetworkData(nodes, credits);

        // Generate AI summary with network context
        const summary = await generateAISummary(analysis, network);

        // Cache result
        cachedSummary[cacheKey] = { data: summary, timestamp: Date.now() };

        return NextResponse.json(summary);
    } catch (error) {
        console.error('[network-summary] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate network summary' },
            { status: 500 }
        );
    }
}

// Force regenerate (bypasses cache)
export async function POST(request: Request) {
    console.log('[network-summary] Force regenerating summary...');

    // Get network from query params
    const { searchParams } = new URL(request.url);
    const network = (searchParams.get('network') as 'mainnet' | 'devnet' | 'all') || 'all';

    // Clear cache for this network
    delete cachedSummary[network];

    return GET(request); // Generate fresh
}
