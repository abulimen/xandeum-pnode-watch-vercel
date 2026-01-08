import { NextRequest, NextResponse } from 'next/server';
import { creditsService } from '@/lib/services/creditsService';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'devnet';

    try {
        if (network === 'all') {
            const data = await creditsService.getCredits('all');
            return NextResponse.json(data, {
                headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
            });
        }

        const validNetwork = network === 'mainnet' ? 'mainnet' : 'devnet';
        const data = await creditsService.getCredits(validNetwork);

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
        console.error('[credits-api] Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch credits', status: 'error' },
            { status: 500 }
        );
    }
}

