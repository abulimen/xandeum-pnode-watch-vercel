'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
    Calculator,
    Coins,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Info,
    HelpCircle,
    Sparkles,
    Database,
    Rocket,
    Globe
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FormulaVisualizer } from './FormulaVisualizer';

// Boost factors from documentation
const ERA_BOOSTS = [
    { id: 'deep-south', name: 'Deep South', boost: 16, description: '1,500% boost - Early adopters' },
    { id: 'south', name: 'South', boost: 10, description: '900% boost' },
    { id: 'mine', name: 'Mine', boost: 7, description: '600% boost' },
    { id: 'coal', name: 'Coal', boost: 3.5, description: '250% boost' },
    { id: 'central', name: 'Central', boost: 2, description: '100% boost' },
    { id: 'north', name: 'North', boost: 1.25, description: '25% boost' },
    { id: 'none', name: 'No Era Boost', boost: 1, description: 'Standard rate' },
];

const NFT_BOOSTS = [
    { id: 'titan', name: 'Titan', boost: 11, description: '1,000% boost' },
    { id: 'dragon', name: 'Dragon', boost: 4, description: '300% boost' },
    { id: 'coyote', name: 'Coyote', boost: 2.5, description: '150% boost' },
    { id: 'rabbit', name: 'Rabbit', boost: 1.5, description: '50% boost' },
    { id: 'cricket', name: 'Cricket', boost: 1.1, description: '10% boost' },
    { id: 'xeno', name: 'Xeno', boost: 1.1, description: '10% boost (early owner)' },
];

// Constants from STOINC documentation
const STOINC_PNODE_SHARE = 0.94; // 94% of fees go to pNodes (6% protocol fee)
const EPOCHS_PER_MONTH = 15.2; // "currently an epoch last two days" (~15 epochs/month)
const DEFAULT_NETWORK_FEES = 50000; // Default estimate for network fees per epoch

interface ROICalculatorProps {
    initialStorage?: number;
    initialCredits?: number;
    nodeId?: string;
}

export function ROICalculator({ initialStorage, initialCredits, nodeId }: ROICalculatorProps) {
    // 1. User Node Configuration (Numerator)
    const [numNodes, setNumNodes] = useState(1);
    const [storageGB, setStorageGB] = useState(initialStorage || 1000);
    const [stakeAmount, setStakeAmount] = useState(250000); // Default stake
    const [performance, setPerformance] = useState(100);
    const [selectedEra, setSelectedEra] = useState('south');
    const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);

    // 2. Network Assumptions (Denominator & Reward Pot)
    const [totalNetworkFees, setTotalNetworkFees] = useState<number>(50000); // User manual input
    const [userNetworkCredits, setUserNetworkCredits] = useState<number>(100000); // User manual estimate

    const [xandPrice, setXandPrice] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // Fetch ONLY price, do not touch credits for calculation
    useEffect(() => {
        async function fetchPrice() {
            try {
                const tokenRes = await fetch('/api/token');
                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    setXandPrice(tokenData.price || 0);
                }
            } catch (error) {
                console.error('Failed to fetch price:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPrice();
    }, []);

    // Calculate Total Boost using Geometric Mean of ALL factors (Era + NFTs)
    // Per docs: "Boosted Weight = Base Credits × GeoMean(Boost Factors)"
    // We collect all active boost factors (Era + selected NFTs) and calculate their geometric mean.
    const totalBoost = useMemo(() => {
        const factors: number[] = [];

        // 1. Era Boost
        // "No Era Boost" (1x) is still a factor in the geometric mean if selected
        const era = ERA_BOOSTS.find(e => e.id === selectedEra);
        if (era) factors.push(era.boost);

        // 2. NFT Boosts
        selectedNFTs.forEach(id => {
            const nft = NFT_BOOSTS.find(n => n.id === id);
            if (nft) factors.push(nft.boost);
        });

        if (factors.length === 0) return 1;

        // Geometric Mean = (Product of all factors) ^ (1 / Count of factors)
        const product = factors.reduce((acc, val) => acc * val, 1);
        return Math.pow(product, 1 / factors.length);
    }, [selectedEra, selectedNFTs]);

    const calculations = useMemo(() => {
        // 1. Storage Credits = Storage (GB) × Performance × pNodes × max(1, XAND Staked)
        const performanceFactor = performance / 100;
        const stakeMultiplier = Math.max(1, stakeAmount);

        const storageCredits = storageGB * performanceFactor * numNodes * stakeMultiplier;

        // 2. Boosted Weight = Storage Credits × Total GeoBoost
        const boostedWeight = storageCredits * totalBoost;

        // 3. EST. STOINC (XAND/Epoch)
        // Formula: (Boosted Weight / Network Credits) × Total Network Fees × 0.94
        const currentNetworkCredits = Math.max(userNetworkCredits, 1);

        // Note: For STOINC, we assume userNetworkCredits includes or excludes the user based on how they input it.
        // Usually "Total Network Credits" implies the final denominator.
        // If the user inputs a massive global number (750B), adding our small contribution is negligible but technically correct.
        // We'll trust the user's manual input as the *Denominator*.

        const networkShare = boostedWeight / currentNetworkCredits;

        const stoincPerEpoch = networkShare * totalNetworkFees * STOINC_PNODE_SHARE;

        // 4. Monthly Rewards
        const monthlyStoincReward = stoincPerEpoch * EPOCHS_PER_MONTH;

        const totalMonthlyXAND = monthlyStoincReward;
        const totalMonthlyUSD = (totalMonthlyXAND * xandPrice);
        const annualUSD = totalMonthlyUSD * 12;

        return {
            storageCredits: Math.round(storageCredits),
            boostedWeight: Math.round(boostedWeight),
            networkShare: networkShare * 100, // percentage
            stoincPerEpoch,
            monthlyStoincReward,
            totalMonthlyXAND,
            totalMonthlyUSD,
            annualUSD,
        };
    }, [numNodes, storageGB, stakeAmount, performance, totalBoost, userNetworkCredits, totalNetworkFees, xandPrice]);

    const toggleNFT = (id: string) => {
        setSelectedNFTs(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const formatNumber = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const formatUSD = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

    return (
        <div className="w-full h-full">
            {/* Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">

                {/* LEFT COLUMN: All Inputs (3/5 width on desktop) */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Calculator className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">pNode ROI Calculator</h1>
                            <p className="text-sm text-muted-foreground">Estimate your potential STOINC rewards</p>
                        </div>
                    </div>

                    {/* Input Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Node Configuration */}
                        <Card className="border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Database className="h-4 w-4 text-primary" />
                                    Node Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">pNodes</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={numNodes}
                                            onChange={(e) => setNumNodes(Number(e.target.value) || 1)}
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Storage (GB)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={storageGB}
                                            onChange={(e) => setStorageGB(Number(e.target.value) || 0)}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">XAND Staked</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={stakeAmount}
                                        onChange={(e) => setStakeAmount(Number(e.target.value) || 0)}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Performance</Label>
                                    <div className="flex items-center gap-3">
                                        <Slider
                                            value={[performance]}
                                            onValueChange={([v]) => setPerformance(v)}
                                            max={100}
                                            step={1}
                                            className="flex-1"
                                        />
                                        <span className="w-10 text-right text-sm font-medium">{performance}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Boosts */}
                        <Card className="border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Rocket className="h-4 w-4 text-primary" />
                                    Boost Multipliers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Era Boost</Label>
                                    <Select value={selectedEra} onValueChange={setSelectedEra}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ERA_BOOSTS.map(era => (
                                                <SelectItem key={era.id} value={era.id}>
                                                    {era.name} ({era.boost}x)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">NFT Boosts (click to toggle)</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {NFT_BOOSTS.map(nft => (
                                            <Badge
                                                key={nft.id}
                                                variant={selectedNFTs.includes(nft.id) ? "default" : "outline"}
                                                className="cursor-pointer text-xs px-2 py-0.5 hover:bg-primary/80 transition-colors"
                                                onClick={() => toggleNFT(nft.id)}
                                            >
                                                {nft.name} ({nft.boost}x)
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Total Boost (GeoMean)</span>
                                        <span className="font-bold text-primary">{totalBoost.toFixed(2)}x</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Network Assumptions - Full Width */}
                    <Card className="border-yellow-500/30 bg-yellow-500/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2 text-yellow-600">
                                <Globe className="h-4 w-4" />
                                Network Assumptions
                                <span className="text-xs font-normal text-muted-foreground ml-auto">Manual tuning for projections</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs flex items-center gap-1">
                                        Total Network Fees (Reward Pot)
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button type="button" className="cursor-help"><HelpCircle className="h-3 w-3 text-muted-foreground" /></button>
                                            </PopoverTrigger>
                                            <PopoverContent className="text-xs max-w-[200px] p-2">
                                                Total revenue collected by the network per epoch.
                                            </PopoverContent>
                                        </Popover>
                                    </Label>
                                    <Input
                                        type="number"
                                        value={totalNetworkFees}
                                        onChange={(e) => setTotalNetworkFees(Number(e.target.value) || 0)}
                                        className="h-9 font-mono text-right"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs flex items-center gap-1">
                                        Total Network Boosted Credits
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button type="button" className="cursor-help"><HelpCircle className="h-3 w-3 text-muted-foreground" /></button>
                                            </PopoverTrigger>
                                            <PopoverContent className="text-xs max-w-[200px] p-2">
                                                Sum of all pNodes' boosted weights. Default: ~100K.
                                            </PopoverContent>
                                        </Popover>
                                    </Label>
                                    <Input
                                        type="number"
                                        value={userNetworkCredits}
                                        onChange={(e) => setUserNetworkCredits(Number(e.target.value) || 0)}
                                        className="h-9 font-mono text-right"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Live Formula Visualizer */}
                    <FormulaVisualizer
                        storage={storageGB}
                        performance={performance}
                        numNodes={numNodes}
                        stake={stakeAmount}
                        eraBoost={ERA_BOOSTS.find(e => e.id === selectedEra)?.boost || 1}
                        nftBoost={selectedNFTs.reduce((acc, id) => {
                            const nft = NFT_BOOSTS.find(n => n.id === id);
                            return acc * (nft?.boost || 1);
                        }, 1)}
                        totalBoost={totalBoost}
                        networkFees={totalNetworkFees}
                        networkCredits={userNetworkCredits}
                        baseCredits={calculations.storageCredits}
                        boostedWeight={calculations.boostedWeight}
                        networkShare={calculations.networkShare}
                        stoincPerEpoch={calculations.stoincPerEpoch}
                    />
                </div>

                {/* RIGHT COLUMN: Results (2/5 width on desktop, sticky) */}
                <div className="lg:col-span-2">
                    <div className="lg:sticky lg:top-6 space-y-4">

                        {/* Results Card */}
                        <Card className="border-green-500/30 bg-gradient-to-br from-background to-green-500/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    Estimated Rewards
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Based on STOINC formula • {EPOCHS_PER_MONTH} epochs/month
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Key Metrics */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-lg bg-muted/50 p-3">
                                                <div className="text-xs text-muted-foreground mb-1">Storage Credits</div>
                                                <div className="text-lg font-bold font-mono">{formatNumber(calculations.storageCredits)}</div>
                                            </div>
                                            <div className="rounded-lg bg-primary/10 p-3">
                                                <div className="text-xs text-muted-foreground mb-1">Boosted Weight</div>
                                                <div className="text-lg font-bold font-mono text-primary">{formatNumber(calculations.boostedWeight)}</div>
                                            </div>
                                        </div>

                                        {/* Network Share */}
                                        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/30">
                                            <span className="text-sm text-muted-foreground">Your Network Share</span>
                                            <span className="font-mono font-bold">{calculations.networkShare.toFixed(6)}%</span>
                                        </div>

                                        {/* Rewards Breakdown */}
                                        <div className="space-y-2 pt-2 border-t">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">STOINC per Epoch</span>
                                                <span className="font-mono">{calculations.stoincPerEpoch.toLocaleString(undefined, { maximumFractionDigits: 2 })} XAND</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Monthly STOINC</span>
                                                <span className="font-mono">{formatNumber(calculations.monthlyStoincReward)} XAND</span>
                                            </div>
                                        </div>

                                        {/* Total Monthly */}
                                        <div className="rounded-xl bg-gradient-to-r from-primary/20 to-green-500/20 p-4 text-center">
                                            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Monthly Earnings</div>
                                            <div className="text-3xl font-black text-primary">{formatNumber(calculations.totalMonthlyXAND)}</div>
                                            <div className="text-sm text-muted-foreground">XAND</div>
                                            {xandPrice > 0 && (
                                                <div className="text-sm font-medium mt-1">≈ {formatUSD(calculations.totalMonthlyUSD)}</div>
                                            )}
                                        </div>

                                        {/* Annual Projection */}
                                        <div className="text-center pt-2 border-t">
                                            <div className="text-xs text-muted-foreground">Annual Projection</div>
                                            <div className="text-xl font-bold text-green-500">{formatUSD(calculations.annualUSD)}</div>
                                            {xandPrice > 0 && (
                                                <div className="text-xs text-muted-foreground">@ ${xandPrice.toFixed(6)}/XAND</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Formula Info */}
                        <Card className="border-muted">
                            <CardContent className="pt-4">
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p><strong>Formula:</strong> (Your Boosted Weight / Total Network Credits) × Fees × 94%</p>
                                    <p><strong>Boost:</strong> Geometric mean of Era + NFT factors</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
