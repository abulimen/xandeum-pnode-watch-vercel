'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ExternalLink, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TokenData {
    price: number;
    priceChange24h: number;
    symbol: string;
}

export function PriceTicker() {
    const pathname = usePathname();
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [solPrice, setSolPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Fetch XAND price
                const xandRes = await fetch('/api/token');
                if (!xandRes.ok) throw new Error('Failed to fetch XAND');
                const xandData = await xandRes.json();
                setTokenData({
                    price: xandData.price,
                    priceChange24h: xandData.priceChange24h,
                    symbol: xandData.symbol,
                });

                // Fetch SOL price from our server-side API (which has Jupiter API key)
                const solRes = await fetch('/api/xandsol');
                if (solRes.ok) {
                    const solData = await solRes.json();
                    if (solData.solPrice) {
                        setSolPrice(solData.solPrice);
                    }
                }

                setError(false);
            } catch (err) {
                console.error('Price ticker error:', err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrices();
        // Refresh every 60 seconds
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    const formatPrice = (price: number) => {
        if (price < 0.0001) return `$${price.toFixed(8)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatChange = (change: number) => {
        const prefix = change >= 0 ? '+' : '';
        return `${prefix}${change.toFixed(2)}%`;
    };

    // Hide on map page (interferes with fullscreen map)
    if (pathname === '/map') return null;

    if (error || isLoading) return null;
    if (!tokenData) return null;

    const isPositive = tokenData.priceChange24h >= 0;

    // Calculate XAND to SOL conversion (only if we have real SOL price)
    const xandInSol = solPrice ? (tokenData.price / solPrice) : null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm border-t" data-tour="price-ticker">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-10 sm:h-12 gap-4 text-sm">
                    {/* Left side - Price info */}
                    <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar">
                        {/* XAND Price */}
                        <div className="flex items-center gap-2 shrink-0">
                            <Coins className="h-4 w-4 text-primary" />
                            <span className="font-medium">XAND</span>
                            <span className="font-mono font-semibold">
                                {formatPrice(tokenData.price)}
                            </span>
                            <span className={cn(
                                "flex items-center gap-0.5 text-xs font-medium",
                                isPositive ? "text-green-500" : "text-red-500"
                            )}>
                                {isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {formatChange(tokenData.priceChange24h)}
                            </span>
                        </div>

                        {/* Separator - Desktop only */}
                        <div className="hidden sm:block h-4 w-px bg-border" />

                        {/* SOL Conversion - Desktop only (only show if we have real SOL price) */}
                        {xandInSol !== null && (
                            <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground shrink-0">
                                <span className="text-xs">1 XAND</span>
                                <span className="text-xs">=</span>
                                <span className="text-xs font-mono">
                                    {xandInSol.toFixed(8)} SOL
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right side - Trade button */}
                    <Link href="/trade" className="shrink-0">
                        <Button
                            size="sm"
                            className="h-7 sm:h-8 text-xs font-medium gap-1.5 bg-primary hover:bg-primary/90"
                        >
                            <span className="hidden sm:inline">Buy XAND</span>
                            <span className="sm:hidden">Buy</span>
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

