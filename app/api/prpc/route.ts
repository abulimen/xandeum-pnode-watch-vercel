/**
 * pNode RPC Proxy API Route
 * Proxies requests to pNode RPC endpoints to bypass browser port restrictions
 * Uses Node.js http module and fetches from seeds CONCURRENTLY for speed
 */

import { NextRequest, NextResponse } from 'next/server';
import http from 'http';

// Configuration from environment
const SEED_IPS = (process.env.NEXT_PUBLIC_PNODE_SEED_IPS || '').split(',').filter(Boolean);
const RPC_PORT = parseInt(process.env.NEXT_PUBLIC_PNODE_RPC_PORT || '6000', 10);
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_PNODE_RPC_ENDPOINT || '/rpc';

// Promise-based HTTP request using Node.js http module
function httpRequest(seedIP: string, method: string): Promise<{
    success: boolean;
    data?: any;
    responseTime?: number;
    seedIP: string;
    error?: string;
}> {
    return new Promise((resolve) => {
        const startTime = performance.now();
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
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = http.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                const responseTime = Math.round(performance.now() - startTime);

                try {
                    const data = JSON.parse(body);

                    if (data.error) {
                        resolve({
                            success: false,
                            error: `RPC Error: ${data.error}`,
                            seedIP,
                        });
                        return;
                    }

                    resolve({
                        success: true,
                        data: data.result,
                        responseTime,
                        seedIP,
                    });
                } catch (parseError) {
                    resolve({
                        success: false,
                        error: 'Invalid JSON response',
                        seedIP,
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message,
                seedIP,
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                success: false,
                error: 'Request timed out',
                seedIP,
            });
        });

        req.write(postData);
        req.end();
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { method = 'get-pods-with-stats' } = body;

        // Get network filter from URL query params
        const { searchParams } = new URL(request.url);
        const networkFilter = searchParams.get('network') as 'mainnet' | 'devnet' | null;

        if (SEED_IPS.length === 0) {
            return NextResponse.json(
                { error: 'No seed nodes configured', success: false },
                { status: 500 }
            );
        }

        // Fetch from ALL seeds CONCURRENTLY and return first successful response
        console.log(`[prpc] Fetching from ${SEED_IPS.length} seeds concurrently...`);
        const startTime = performance.now();

        const allPromises = SEED_IPS.map(seedIP => httpRequest(seedIP, method));

        // Use Promise.any to get the first successful response
        try {
            const results = await Promise.all(allPromises);

            // Find first successful result
            const successResult = results.find(r => r.success);

            if (successResult) {
                const totalTime = Math.round(performance.now() - startTime);
                console.log(`[prpc] Success from ${successResult.seedIP} in ${successResult.responseTime}ms (total: ${totalTime}ms)`);

                let pods = successResult.data?.pods || [];

                // Apply server-side network filtering if specified
                if (networkFilter && (networkFilter === 'mainnet' || networkFilter === 'devnet')) {
                    console.log(`[prpc] Filtering for network: ${networkFilter}`);

                    // Fetch network credits data to determine network membership
                    try {
                        const creditsRes = await fetch(
                            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/credits?network=${networkFilter}`,
                            { cache: 'no-store' }
                        );

                        if (creditsRes.ok) {
                            const creditsData = await creditsRes.json();
                            const networkPodIds = new Set<string>();

                            if (creditsData.pods_credits) {
                                for (const pod of creditsData.pods_credits) {
                                    if (pod.pod_id) networkPodIds.add(pod.pod_id);
                                }
                            }

                            // Filter pods to only those in the specified network
                            const originalCount = pods.length;
                            pods = pods.filter((p: any) => networkPodIds.has(p.pubkey));
                            console.log(`[prpc] Filtered ${originalCount} -> ${pods.length} pods for ${networkFilter}`);
                        }
                    } catch (filterError) {
                        console.warn('[prpc] Network filter failed, returning all pods:', filterError);
                    }
                }

                return NextResponse.json({
                    success: true,
                    data: { ...successResult.data, pods },
                    responseTime: successResult.responseTime,
                    seedIP: successResult.seedIP,
                    networkFilter: networkFilter || 'all',
                });
            }

            // All failed
            const errors = results.map(r => `${r.seedIP}: ${r.error}`);
            console.error('[prpc] All seed nodes failed:', errors);

            return NextResponse.json(
                {
                    success: false,
                    error: `All seed nodes failed: ${errors.join('; ')}`,
                    data: null,
                },
                { status: 502 }
            );

        } catch (error: any) {
            // All promises rejected
            return NextResponse.json(
                {
                    success: false,
                    error: 'All seed nodes failed',
                    data: null,
                },
                { status: 502 }
            );
        }

    } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error';
        console.error('[prpc] Proxy error:', errorMessage);

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                data: null,
            },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        seedNodes: SEED_IPS.length,
        seeds: SEED_IPS,
        message: 'pNode RPC Proxy is running (concurrent mode)',
    });
}
