/**
 * Analytics History API
 * Serves historical data from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNetworkHistory, getNodeHistory } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'network';
        const days = parseInt(searchParams.get('days') || '30', 10);

        if (type === 'node') {
            const nodeId = searchParams.get('id');
            if (!nodeId) {
                return NextResponse.json({ success: false, error: 'Node ID required' }, { status: 400 });
            }

            const history = await getNodeHistory(nodeId, days);
            return NextResponse.json({ success: true, data: history });
        } else {
            // Network history - optionally filter by network (mainnet/devnet)
            const networkFilter = searchParams.get('network') as 'mainnet' | 'devnet' | null;
            const history = await getNetworkHistory(days, networkFilter || undefined);
            return NextResponse.json({ success: true, data: history });
        }
    } catch (error) {
        console.error('[api/analytics/history] Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
