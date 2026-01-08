'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown, ChevronDown, Sparkles, Zap } from 'lucide-react';

interface FormulaVisualizerProps {
    // Inputs
    storage: number;
    performance: number;
    numNodes: number;
    stake: number;
    eraBoost: number;
    nftBoost: number;
    totalBoost: number;
    networkFees: number;
    networkCredits: number;

    // Calculated values
    baseCredits: number;
    boostedWeight: number;
    networkShare: number;
    stoincPerEpoch: number;
}

// Animated number component
function AnimatedValue({
    value,
    format = 'number',
    className,
    highlight = false
}: {
    value: number;
    format?: 'number' | 'percent' | 'decimal';
    className?: string;
    highlight?: boolean;
}) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);
    const prevValue = useRef(value);

    useEffect(() => {
        if (prevValue.current !== value) {
            setIsAnimating(true);

            // Animate the number change
            const startValue = prevValue.current;
            const endValue = value;
            const duration = 400;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = startValue + (endValue - startValue) * eased;

                setDisplayValue(current);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setDisplayValue(endValue);
                    setIsAnimating(false);
                    prevValue.current = endValue;
                }
            };

            requestAnimationFrame(animate);
        }
    }, [value]);

    const formatted = format === 'percent'
        ? `${displayValue.toFixed(2)}%`
        : format === 'decimal'
            ? displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 });

    return (
        <span
            className={cn(
                "font-mono font-bold transition-all duration-200",
                isAnimating && "scale-110",
                highlight && isAnimating && "text-white",
                className
            )}
        >
            {formatted}
        </span>
    );
}

// Flow connector arrow
function FlowArrow({ active = false }: { active?: boolean }) {
    return (
        <div className="flex justify-center py-2">
            <div className={cn(
                "flex flex-col items-center transition-all duration-300",
                active ? "text-cyan-400" : "text-gray-600"
            )}>
                <div className={cn(
                    "w-0.5 h-4 bg-current transition-all",
                    active && "animate-pulse"
                )} />
                <ArrowDown className="h-4 w-4" />
            </div>
        </div>
    );
}

// Formula stage component
function FormulaStage({
    title,
    icon,
    children,
    result,
    resultLabel,
    colorClass = "border-cyan-500/30",
    resultColorClass = "text-cyan-400"
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    result: React.ReactNode;
    resultLabel: string;
    colorClass?: string;
    resultColorClass?: string;
}) {
    return (
        <div className={cn(
            "relative rounded-lg border p-4 bg-black/40 backdrop-blur-sm",
            colorClass
        )}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider text-gray-400">
                {icon}
                {title}
            </div>

            {/* Formula */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
                {children}
            </div>

            {/* Result */}
            <div className="mt-3 pt-3 border-t border-gray-700/50 text-center">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    {resultLabel}
                </div>
                <div className={cn("text-xl font-bold", resultColorClass)}>
                    {result}
                </div>
            </div>
        </div>
    );
}

// Operator component
function Op({ children }: { children: React.ReactNode }) {
    return <span className="text-gray-500 font-mono mx-1">{children}</span>;
}

// Variable box component
function VarBox({
    label,
    value,
    format = 'number',
    colorClass = "text-cyan-400",
    bgClass = "bg-cyan-500/10 border-cyan-500/30"
}: {
    label: string;
    value: number;
    format?: 'number' | 'percent' | 'decimal';
    colorClass?: string;
    bgClass?: string;
}) {
    return (
        <div className={cn(
            "flex flex-col items-center px-2 py-1 rounded border",
            bgClass
        )}>
            <span className="text-[9px] uppercase tracking-wider text-gray-400">{label}</span>
            <AnimatedValue value={value} format={format} className={colorClass} />
        </div>
    );
}

export function FormulaVisualizer({
    storage,
    performance,
    numNodes,
    stake,
    eraBoost,
    nftBoost,
    totalBoost,
    networkFees,
    networkCredits,
    baseCredits,
    boostedWeight,
    networkShare,
    stoincPerEpoch
}: FormulaVisualizerProps) {
    // Collapsed by default on mobile, expanded on desktop
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            setIsExpanded(!mobile); // Collapsed on mobile, expanded on desktop
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="relative rounded-xl bg-gradient-to-b from-gray-900/80 to-black/90 border border-gray-800 overflow-hidden">
            {/* Background grid effect */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Header - Clickable on mobile */}
            <button
                type="button"
                onClick={() => isMobile && setIsExpanded(!isExpanded)}
                className={cn(
                    "relative w-full flex items-center gap-2 p-4 border-b border-gray-700/50",
                    isMobile && "cursor-pointer hover:bg-gray-800/30 transition-colors",
                    !isExpanded && "border-b-0"
                )}
            >
                <Zap className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-gray-200">Live Formula Breakdown</h3>
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        LIVE
                    </div>
                    {isMobile && (
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-gray-400 transition-transform duration-200",
                                isExpanded && "rotate-180"
                            )}
                        />
                    )}
                </div>
            </button>

            {/* Collapsible Content */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="p-4 pt-0 space-y-2">

                    {/* Stage 1: Base Credits */}
                    <FormulaStage
                        title="Stage 1: Base Credits"
                        icon={<Sparkles className="h-3 w-3" />}
                        result={<AnimatedValue value={baseCredits} className="text-cyan-400" />}
                        resultLabel="Base Credits"
                        colorClass="border-cyan-500/20"
                        resultColorClass="text-cyan-400"
                    >
                        <VarBox label="Storage" value={storage} />
                        <Op>×</Op>
                        <VarBox label="Perf" value={performance} format="percent" />
                        <Op>×</Op>
                        <VarBox label="Nodes" value={numNodes} />
                        <Op>×</Op>
                        <VarBox label="Stake" value={stake} />
                    </FormulaStage>

                    <FlowArrow active />

                    {/* Stage 2: Boosted Weight */}
                    <FormulaStage
                        title="Stage 2: Boosted Weight"
                        icon={<Sparkles className="h-3 w-3" />}
                        result={<AnimatedValue value={boostedWeight} className="text-amber-400" />}
                        resultLabel="Boosted Weight"
                        colorClass="border-amber-500/20"
                        resultColorClass="text-amber-400"
                    >
                        <VarBox
                            label="Base"
                            value={baseCredits}
                            colorClass="text-cyan-400"
                            bgClass="bg-cyan-500/10 border-cyan-500/30"
                        />
                        <Op>×</Op>
                        <VarBox
                            label="GeoMean"
                            value={totalBoost}
                            format="decimal"
                            colorClass="text-amber-400"
                            bgClass="bg-amber-500/10 border-amber-500/30"
                        />
                    </FormulaStage>

                    <FlowArrow active />

                    {/* Stage 3: STOINC per Epoch */}
                    <FormulaStage
                        title="Stage 3: STOINC Reward"
                        icon={<Sparkles className="h-3 w-3" />}
                        result={
                            <div className="flex items-baseline gap-1">
                                <AnimatedValue value={stoincPerEpoch} format="decimal" className="text-green-400" />
                                <span className="text-sm text-gray-400">XAND/epoch</span>
                            </div>
                        }
                        resultLabel="Your Reward"
                        colorClass="border-green-500/20"
                        resultColorClass="text-green-400"
                    >
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400">(</span>
                            <VarBox
                                label="Weight"
                                value={boostedWeight}
                                colorClass="text-amber-400"
                                bgClass="bg-amber-500/10 border-amber-500/30"
                            />
                            <Op>÷</Op>
                            <VarBox
                                label="Network"
                                value={networkCredits}
                                colorClass="text-purple-400"
                                bgClass="bg-purple-500/10 border-purple-500/30"
                            />
                            <span className="text-gray-400">)</span>
                        </div>
                        <Op>×</Op>
                        <VarBox
                            label="Fees"
                            value={networkFees}
                            colorClass="text-purple-400"
                            bgClass="bg-purple-500/10 border-purple-500/30"
                        />
                        <Op>×</Op>
                        <div className="px-2 py-1 rounded border bg-green-500/10 border-green-500/30">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400">Share</span>
                            <div className="text-green-400 font-mono font-bold">94%</div>
                        </div>
                    </FormulaStage>

                    {/* Epoch Explanation & Monthly Derivation */}
                    <div className="relative mt-4 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-start gap-2">
                            <div className="p-1 rounded bg-blue-500/20 mt-0.5 shrink-0">
                                <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                                <div>
                                    <span className="text-xs font-semibold text-blue-400">What is an Epoch?</span>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                                        An epoch is a <span className="text-blue-300 font-medium">~2 day reward cycle</span> on the Xandeum network.
                                        Rewards are calculated and distributed at the end of each epoch.
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-blue-500/20">
                                    <div className="text-[10px] text-gray-400 mb-2">Monthly STOINC Calculation:</div>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                        <div className="px-2 py-1 rounded bg-green-500/10 border border-green-500/30 whitespace-nowrap">
                                            <span className="text-green-400 font-mono font-bold">
                                                <AnimatedValue value={stoincPerEpoch} format="decimal" className="text-green-400" />
                                            </span>
                                            <span className="text-gray-400 ml-1 text-[10px]">/epoch</span>
                                        </div>
                                        <span className="text-gray-500 font-mono">×</span>
                                        <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 whitespace-nowrap">
                                            <span className="text-blue-400 font-mono font-bold">15.2</span>
                                            <span className="text-gray-400 ml-1 text-[10px]">epochs</span>
                                        </div>
                                        <span className="text-gray-500 font-mono">=</span>
                                        <div className="px-2 py-1 rounded bg-green-500/20 border border-green-500/40 whitespace-nowrap">
                                            <span className="text-green-300 font-mono font-bold">
                                                <AnimatedValue value={stoincPerEpoch * 15.2} format="decimal" className="text-green-300" />
                                            </span>
                                            <span className="text-gray-300 ml-1 text-[10px]">/month</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer legend */}
                    <div className="relative mt-4 pt-3 border-t border-gray-700/50 flex flex-wrap gap-3 justify-center text-[10px] text-gray-500">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span>Inputs</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Intermediate</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>Network</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>Result</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
