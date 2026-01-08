/**
 * Trade Page - Buy & Trade XAND
 * Features TradingView chart, Jupiter swap widget, and token stats
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenData } from '@/hooks/useTokenData';
import {
    TrendingUp,
    ExternalLink,
    Copy,
    Check,
    BarChart3,
    Coins,
    Info,
    RefreshCw,
    Globe,

} from 'lucide-react';
import { cn } from '@/lib/utils';

const XAND_MINT = 'XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx';

// TradingView Widget Component
function TradingViewChart() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !containerRef.current) return;

        // Clear previous widget
        containerRef.current.innerHTML = '';

        const isDark = resolvedTheme === 'dark';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            allow_symbol_change: false,
            calendar: false,
            details: false,
            hide_side_toolbar: true,
            hide_top_toolbar: false,
            hide_legend: false,
            hide_volume: false,
            hotlist: false,
            interval: 'D',
            locale: 'en',
            save_image: true,
            style: '1',
            symbol: 'RAYDIUMCPMM:XANDSOL_C9ZJUG',
            theme: isDark ? 'dark' : 'light',
            timezone: 'Etc/UTC',
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            gridColor: isDark ? 'rgba(242, 242, 242, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            watchlist: [],
            withdateranges: false,
            compareSymbols: [],
            studies: [],
            autosize: true,
        });

        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container__widget';
        widgetContainer.style.height = 'calc(100% - 32px)';
        widgetContainer.style.width = '100%';

        const copyright = document.createElement('div');
        copyright.className = 'tradingview-widget-copyright';
        copyright.innerHTML = `
            <a href="https://www.tradingview.com/symbols/XANDSOL_C9ZJUG/?exchange=RAYDIUMCPMM" 
               rel="noopener nofollow" target="_blank" 
               class="text-xs text-muted-foreground hover:text-primary transition-colors">
                Chart by TradingView
            </a>
        `;

        containerRef.current.appendChild(widgetContainer);
        containerRef.current.appendChild(copyright);
        widgetContainer.appendChild(script);

    }, [resolvedTheme, mounted]);

    if (!mounted) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted/20">
                <div className="flex flex-col items-center gap-3">
                    <BarChart3 className="h-12 w-12 text-muted-foreground animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading chart...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="tradingview-widget-container w-full h-full"
            style={{ minHeight: '400px' }}
        />
    );
}

// Jupiter Swap Widget Component
function JupiterSwapWidget() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const isDark = resolvedTheme === 'dark';

        // Set CSS variables for Jupiter theme
        document.documentElement.style.setProperty('--jupiter-plugin-primary', isDark ? '199, 242, 132' : '22, 163, 74');
        document.documentElement.style.setProperty('--jupiter-plugin-background', isDark ? '10, 10, 10' : '255, 255, 255');
        document.documentElement.style.setProperty('--jupiter-plugin-primary-text', isDark ? '232, 249, 255' : '15, 23, 42');
        document.documentElement.style.setProperty('--jupiter-plugin-warning', '251, 191, 36');
        document.documentElement.style.setProperty('--jupiter-plugin-interactive', isDark ? '33, 42, 54' : '241, 245, 249');
        document.documentElement.style.setProperty('--jupiter-plugin-module', isDark ? '16, 23, 31' : '248, 250, 252');

        // Load Jupiter Plugin script
        const existingScript = document.querySelector('script[src="https://plugin.jup.ag/plugin-v1.js"]');

        const initJupiter = () => {
            if (typeof window !== 'undefined' && (window as any).Jupiter) {
                (window as any).Jupiter.init({
                    displayMode: 'integrated',
                    integratedTargetId: 'jupiter-swap-container',
                    formProps: {
                        initialAmount: '1000000',
                        initialOutputMint: XAND_MINT,
                        fixedMint: XAND_MINT,
                    },
                    branding: {
                        logoUri: 'https://raw.githubusercontent.com/bernieblume/XAND-meta-2024/main/XandToken.png',
                        name: 'Buy XAND',
                    },
                });
                setIsLoading(false);
            }
        };

        if (existingScript) {
            initJupiter();
        } else {
            const script = document.createElement('script');
            script.src = 'https://plugin.jup.ag/plugin-v1.js';
            script.async = true;
            script.onload = () => {
                setTimeout(initJupiter, 500); // Give Jupiter time to initialize
            };
            document.head.appendChild(script);
        }
    }, [resolvedTheme, mounted]);

    if (!mounted) {
        return (
            <div className="w-full h-[568px] flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="flex flex-col items-center gap-3">
                    <Coins className="h-12 w-12 text-muted-foreground animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading swap widget...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card rounded-lg z-10">
                    <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Initializing swap...</p>
                    </div>
                </div>
            )}
            <div
                id="jupiter-swap-container"
                ref={containerRef}
                className="w-full rounded-lg overflow-hidden"
                style={{ minHeight: '568px' }}
            />
        </div>
    );
}

// Token Overview Section (Hero)
function TokenOverview() {
    const { tokenData, isLoading, isRefetching, refetch } = useTokenData();
    const [copied, setCopied] = useState(false);

    const copyAddress = () => {
        navigator.clipboard.writeText(XAND_MINT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatPrice = (price: number) => {
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
        return num.toFixed(2);
    };

    const formatUSD = (num: number) => `$${formatNumber(num)}`;

    const formatPriceChange = (change: number) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    };

    return (
        <Card className="mb-6 overflow-hidden border border-border/50 shadow-md bg-gradient-to-br from-card to-muted/20" data-tour="trade-stats">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                    {/* Top Section: Identity & Price */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center min-w-0">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                                <img
                                    src={tokenData?.logoURI || '/logo.png'}
                                    alt="XAND"
                                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                                />
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                                    {isLoading ? <Skeleton className="h-8 w-32" /> : tokenData?.name || 'Xandeum'}
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground hidden sm:inline-flex">
                                        {tokenData?.symbol || 'XAND'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-xl sm:text-2xl font-bold text-foreground">
                                            {isLoading ? <Skeleton className="h-8 w-24" /> : formatPrice(tokenData?.price || 0)}
                                        </div>
                                        {tokenData && (
                                            <span className={cn(
                                                "text-sm font-medium px-2 py-0.5 rounded-full",
                                                tokenData.priceChange24h >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {formatPriceChange(tokenData.priceChange24h)} (24h)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-8 grow lg:justify-end">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Market Cap</p>
                            <div className="font-semibold text-sm sm:text-base">
                                {isLoading ? <Skeleton className="h-5 w-20" /> : formatUSD(tokenData?.marketCap || 0)}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Volume (24h)</p>
                            <div className="font-semibold text-sm sm:text-base">
                                {isLoading ? <Skeleton className="h-5 w-20" /> : formatUSD(tokenData?.volume24h || 0)}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Liquidity</p>
                            <div className="font-semibold text-sm sm:text-base">
                                {isLoading ? <Skeleton className="h-5 w-20" /> : formatUSD(tokenData?.liquidity || 0)}
                            </div>
                        </div>
                        <div className="space-y-1 hidden sm:block">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Holders</p>
                            <div className="font-semibold text-sm sm:text-base">
                                {isLoading ? <Skeleton className="h-5 w-20" /> : formatNumber(tokenData?.holders || 0)}
                            </div>
                        </div>
                        <div className="space-y-1 hidden sm:block">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">FDV</p>
                            <div className="font-semibold text-sm sm:text-base">
                                {isLoading ? <Skeleton className="h-5 w-20" /> : formatUSD(tokenData?.fdv || 0)}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 lg:w-full font-medium shadow-sm hover:shadow-md transition-all active:scale-95"
                            onClick={copyAddress}
                        >
                            {copied ? (
                                <Check className="h-3.5 w-3.5 mr-2 text-green-600" />
                            ) : (
                                <Copy className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            )}
                            {copied ? "Copied!" : "Copy Address"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 lg:w-full text-muted-foreground hover:text-foreground"
                            onClick={() => refetch()}
                            disabled={isLoading || isRefetching}
                        >
                            <RefreshCw className={cn(
                                "h-3.5 w-3.5 sm:mr-2",
                                (isLoading || isRefetching) && "animate-spin"
                            )} />
                            <span className="hidden sm:inline">
                                {(isLoading || isRefetching) ? "Refreshing..." : "Refresh Data"}
                            </span>
                            <span className="sm:hidden">
                                {(isLoading || isRefetching) ? "..." : "Refresh"}
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Additional Info Row: Contract & Links */}
                <div className="mt-6 pt-4 border-t border-border/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 max-w-full overflow-hidden">
                        <span className="text-muted-foreground shrink-0">CA:</span>
                        <code className="bg-muted px-2 py-1 rounded font-mono truncate text-xs">
                            {XAND_MINT}
                        </code>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex gap-2 mr-auto md:mr-0">
                            <a
                                href={`https://solscan.io/token/${XAND_MINT}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-primary transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Solscan
                            </a>
                            <a
                                href="https://raydium.io/swap/?inputCurrency=sol&outputCurrency=XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-primary transition-colors"
                            >
                                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                Raydium
                            </a>
                        </div>

                        {tokenData && (
                            <div className="flex gap-3 pl-3 border-l border-border/50">
                                <span className={cn(tokenData.priceChange7d >= 0 ? "text-green-500" : "text-red-500")}>
                                    7d: {formatPriceChange(tokenData.priceChange7d)}
                                </span>
                                <span className={cn(tokenData.priceChange30d >= 0 ? "text-green-500" : "text-red-500")}>
                                    30d: {formatPriceChange(tokenData.priceChange30d)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


// About Card
function AboutCard() {
    return (
        <Card data-tour="trade-about">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    About Xandeum
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                    <strong className="text-foreground">Xandeum</strong> is building a scalable, decentralized
                    storage layer for the Solana blockchain. It solves the "blockchain storage trilemma"
                    by providing a solution that is scalable, smart contract native, and allows for random access.
                </p>
                <p>
                    Xandeum's liquid staking pool allows SOL holders to earn rewards from both staking
                    and storage fees, making it the first multi-validator pool sharing block rewards with stakers.
                </p>
                <p>
                    The <strong className="text-foreground">XAND</strong> token serves as the governance token,
                    granting holders voting rights in the Xandeum DAO to shape the platform's future.
                </p>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                        <a href="https://xandeum.network" target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href="https://x.com/Xandeum" target="_blank" rel="noopener noreferrer">
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            X (Twitter)
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href="https://discord.com/invite/mGAxAuwnR9" target="_blank" rel="noopener noreferrer">
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                            </svg>
                            Discord
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href="https://www.facebook.com/xandeumlabs" target="_blank" rel="noopener noreferrer">
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Main Trade Page
export default function TradePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container px-3 sm:px-4 py-4 sm:py-6">

                {/* 1. Statistics (First as requested) */}
                <TokenOverview />

                {/* 2. Main Grid: Chart & Swap */}
                <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                    {/* Left/Top: Chart */}
                    <Card className="overflow-hidden h-[500px] lg:h-[600px]" data-tour="trade-chart">
                        <CardHeader className="py-4 px-6 border-b border-border/40">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <BarChart3 className="h-5 w-5" />
                                XAND/SOL Price Chart
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[calc(100%-60px)]">
                            <TradingViewChart />
                        </CardContent>
                    </Card>

                    {/* Right/Bottom: Swap */}
                    <Card className="overflow-hidden h-fit" data-tour="trade-swap">
                        <CardHeader className="py-4 px-6 border-b border-border/40">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Coins className="h-5 w-5" />
                                Swap to XAND
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Powered by Jupiter Aggregator
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <JupiterSwapWidget />
                        </CardContent>
                    </Card>
                </div>

                {/* 3. About Section (Bottom) */}
                <div className="mt-4">
                    <AboutCard />
                </div>
            </main>

            <Footer />
        </div>
    );
}
