import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ address: string }> }
) {
    const { address } = await params;
    const apiKey = process.env.JUPITER_API_KEY?.trim();

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    if (!apiKey) {
        console.warn('JUPITER_API_KEY is missing');
        // Return 0 balance if key is missing to avoid crashing UI, or error?
        // Let's return error so UI handles it gracefully or hides it.
        return NextResponse.json({ error: 'API Configuration Error' }, { status: 500 });
    }

    try {
        const response = await fetch(`https://api.jup.ag/ultra/v1/balances/${address}`, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            throw new Error(`Jupiter API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Find XAND token balance
        // Jupiter returns an object with token mint addresses as keys
        // Mint: XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx
        const XAND_MINT = 'XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx';
        const xandData = data[XAND_MINT];

        return NextResponse.json({
            address,
            xandBalance: xandData ? xandData.uiAmount : 0,
            xandRaw: xandData ? xandData.amount : '0',
            raw: xandData || null
        });

    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }
}
