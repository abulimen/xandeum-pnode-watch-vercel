
import { NextRequest, NextResponse } from 'next/server';
import { creditsService } from '@/lib/services/creditsService';
import fs from 'fs';
import path from 'path';

interface Operator {
    manager: string;
    totalOwned: number;
    registeredCount: number;
    pnodeIds: string[];
    credits: number;
    networks: string[];
}

// Simple CSV line parser handling quoted values
function parseCSVLine(text: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(cur.replace(/^"|"$/g, '').trim()); // unquote and trim
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur.replace(/^"|"$/g, '').trim());
    return result;
}

export async function GET(request: NextRequest) {
    try {
        const csvPath = path.join(process.cwd(), 'data/pnodes.csv');
        let fileContent = '';

        try {
            fileContent = fs.readFileSync(csvPath, 'utf-8');
        } catch (e) {
            console.warn('[operators-api] CSV file missing, returning empty list');
            return NextResponse.json({ data: [], total: 0, totalNodes: 0 });
        }

        // Fetch credits maps separately to determine network presence
        // Using getCreditsMap with specific network returns map for just that network
        const [devnetCredits, mainnetCredits] = await Promise.all([
            creditsService.getCreditsMap('devnet'),
            creditsService.getCreditsMap('mainnet')
        ]);

        const operatorMap = new Map<string, {
            manager: string;
            totalOwned: number;
            registeredCount: number;
            pnodeIds: string[];
            credits: number;
            networks: Set<string>;
        }>();

        const lines = fileContent.split('\n');
        let totalNodes = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = parseCSVLine(line);
            if (cols.length < 3) continue;

            const pnodeId = cols[1];
            const manager = cols[2];

            if (!manager || !pnodeId) continue;

            totalNodes++;

            if (!operatorMap.has(manager)) {
                operatorMap.set(manager, {
                    manager,
                    totalOwned: 0,
                    registeredCount: 0,
                    pnodeIds: [],
                    credits: 0,
                    networks: new Set(),
                });
            }

            const op = operatorMap.get(manager)!;
            op.totalOwned++;
            op.pnodeIds.push(pnodeId);

            // Check if node has on-chain identity (exists in credits maps)
            const isOnDevnet = devnetCredits.has(pnodeId);
            const isOnMainnet = mainnetCredits.has(pnodeId);
            const isRegistered = isOnDevnet || isOnMainnet;

            if (isRegistered) {
                op.registeredCount++;
                if (isOnDevnet) op.networks.add('devnet');
                if (isOnMainnet) op.networks.add('mainnet');
            }

            const devCredit = devnetCredits.get(pnodeId) || 0;
            const mainCredit = mainnetCredits.get(pnodeId) || 0;

            // Sum credits (max to avoid double counting if same node on both networks)
            op.credits += Math.max(devCredit, mainCredit);
        }

        const operators = Array.from(operatorMap.values())
            .map(op => ({
                manager: op.manager,
                totalOwned: op.totalOwned,
                registeredCount: op.registeredCount,
                pnodeIds: op.pnodeIds,
                credits: op.credits,
                networks: Array.from(op.networks).sort()
            }))
            .sort((a, b) => b.totalOwned - a.totalOwned);

        return NextResponse.json({
            data: operators,
            total: operators.length,
            totalNodes
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
        });

    } catch (error: any) {
        console.error('[operators-api] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch operators', details: error.message },
            { status: 500 }
        );
    }
}
