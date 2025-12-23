/**
 * Credits History Chart
 * Shows credits trend over time using Recharts
 * Fetches data from server-side database and appends live current value
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PNode } from '@/types/pnode';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area
} from 'recharts';

interface CreditsHistoryChartProps {
    creditsMap?: Map<string, number>;
    nodes?: PNode[];
    nodePublicKey?: string; // For single node view
    currentValue?: number; // Live current value to append
    className?: string;
}

export function CreditsHistoryChart({
    nodePublicKey,
    currentValue,
    className
}: CreditsHistoryChartProps) {

    // Fetch history from API
    const { data: historyData, isLoading } = useQuery({
        queryKey: ['credits-history', nodePublicKey || 'network'],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (nodePublicKey) {
                params.append('type', 'node');
                params.append('id', nodePublicKey);
            } else {
                params.append('type', 'network');
            }
            params.append('days', '30');

            const res = await fetch(`/api/analytics/history?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch history');
            const json = await res.json();
            return json.data;
        }
    });

    const chartData = useMemo(() => {
        if (!historyData) return null;

        // Map to points
        let points = historyData.map((item: any) => ({
            timestamp: new Date(item.timestamp).getTime(),
            date: new Date(item.timestamp).toLocaleDateString(),
            value: nodePublicKey ? (item.credits || 0) : (item.avg_credits || 0)
        }));

        // Append current live value if provided
        if (currentValue !== undefined && currentValue > 0) {
            points.push({
                timestamp: Date.now(),
                date: 'Now',
                value: currentValue
            });
        }

        // Filter out zeros if needed
        const validPoints = points.filter((p: any) => p.value > 0);
        if (validPoints.length < 2) return null;

        const first = validPoints[0].value;
        const last = validPoints[validPoints.length - 1].value;
        const change = last - first;
        const percentChange = first > 0 ? (change / first) * 100 : 0;

        return {
            points: validPoints,
            current: last,
            previous: first,
            change,
            percentChange
        };
    }, [historyData, nodePublicKey, currentValue]);

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-base">Credits Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    const trend = chartData
        ? chartData.change > 0 ? 'up' : chartData.change < 0 ? 'down' : 'stable'
        : 'stable';

    return (
        <Card className={cn("overflow-hidden flex flex-col", className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold">
                            {nodePublicKey ? 'Credits History' : 'Network Credits Trend'}
                        </CardTitle>
                        <CardDescription>
                            {(!chartData)
                                ? 'Collecting data... Trend will appear after snapshots'
                                : `Last 30 days (${chartData.points.length} snapshots)`}
                        </CardDescription>
                    </div>
                    {chartData && (
                        <div className={cn(
                            "flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full border",
                            trend === 'up' && "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
                            trend === 'down' && "text-red-600 bg-red-500/10 border-red-500/20",
                            trend === 'stable' && "text-blue-600 bg-blue-500/10 border-blue-500/20"
                        )}>
                            {trend === 'up' && <TrendingUp className="h-4 w-4" />}
                            {trend === 'down' && <TrendingDown className="h-4 w-4" />}
                            {trend === 'stable' && <Minus className="h-4 w-4" />}
                            <span>
                                {chartData.percentChange > 0 ? '+' : ''}
                                {chartData.percentChange.toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] pb-4">
                {chartData ? (
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData.points} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis
                                    dataKey="date"
                                    hide={true}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    hide={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'currentColor', fontSize: 12 }}
                                    tickFormatter={(value) => value.toLocaleString()}
                                    width={60}
                                    className="text-muted-foreground"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value: number) => [value.toLocaleString(), 'Credits']}
                                    labelFormatter={(label) => label}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="url(#lineGradient)"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm bg-muted/30 rounded-lg border border-dashed">
                        {/* Show loading animation if currentValue is not yet available */}
                        {currentValue === undefined ? (
                            <>
                                <div className="relative mb-3">
                                    <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                </div>
                                <p>Loading credits data...</p>
                                <p className="text-xs opacity-70">Please wait while we fetch the latest data</p>
                            </>
                        ) : (
                            <>
                                <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                                <p>No historical data yet</p>
                                <p className="text-xs opacity-70">Data will appear as credits are tracked</p>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
