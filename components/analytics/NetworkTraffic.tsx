/**
 * NetworkTraffic Component
 * Displays network packet statistics with visual representation
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PNode } from '@/types/pnode';
import { Activity, ArrowUpRight, ArrowDownRight, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface NetworkTrafficProps {
    nodes: PNode[];
    isLoading?: boolean;
}

function formatPackets(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
}

export function NetworkTraffic({ nodes, isLoading }: NetworkTrafficProps) {
    // Calculate packet statistics based on node activity
    // Since actual packet data isn't in the API, we estimate based on uptime and storage activity
    const trafficStats = useMemo(() => {
        const onlineNodes = nodes.filter(n => n.status === 'online').length;
        const totalNodes = nodes.length;

        // Estimate packets based on heartbeats (30 second intervals) and storage operations
        // Each online node sends ~2880 heartbeats/day (every 30 seconds)
        // Plus storage read/write operations estimated from storage usage

        const avgUptimeSeconds = nodes.reduce((sum, n) => sum + (n.uptimeSeconds || 0), 0) / (nodes.length || 1);
        const totalStorageUsed = nodes.reduce((sum, n) => sum + (n.storage.used || 0), 0);

        // Estimate packet counts (heartbeats + storage operations + gossip protocol)
        const heartbeatPackets = Math.round(avgUptimeSeconds / 30) * onlineNodes; // 1 packet per 30 seconds
        const storagePackets = Math.round(totalStorageUsed / (1024 * 1024)); // 1 packet per MB
        const gossipPackets = Math.round(onlineNodes * onlineNodes * 0.1 * (avgUptimeSeconds / 3600)); // Inter-node gossip

        const totalPackets = heartbeatPackets + storagePackets + gossipPackets;

        // Split between received and sent (nodes both send and receive)
        // Typically more received than sent due to gossip fanout
        const sentPackets = Math.round(totalPackets * 0.45);
        const receivedPackets = Math.round(totalPackets * 0.55);

        return {
            total: totalPackets,
            sent: sentPackets,
            received: receivedPackets,
            onlineNodes,
            totalNodes,
            // For pie chart
            pieData: [
                { name: 'Received', value: receivedPackets, color: '#22c55e' },
                { name: 'Sent', value: sentPackets, color: '#3b82f6' },
            ]
        };
    }, [nodes]);

    return (
        <Card className="shadow-md h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Network Traffic
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Estimated packet flow across the network
                </p>
            </CardHeader>
            <CardContent>
                {/* Total Packets - Hero Stat */}
                <div className="text-center mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Radio className="h-5 w-5 text-blue-500 animate-pulse" />
                        <span className="text-sm text-muted-foreground">Total Packets</span>
                    </div>
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        {formatPackets(trafficStats.total)}
                    </span>
                </div>

                {/* Pie Chart + Stats Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Pie Chart */}
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={trafficStats.pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={50}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {trafficStats.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatPackets(value)}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col justify-center gap-3">
                        {/* Received */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
                                <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Received</p>
                                <p className="font-bold text-emerald-500">{formatPackets(trafficStats.received)}</p>
                            </div>
                        </div>

                        {/* Sent */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10">
                                <ArrowUpRight className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Sent</p>
                                <p className="font-bold text-blue-500">{formatPackets(trafficStats.sent)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Nodes Indicator */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Nodes</span>
                    <span className="font-medium">
                        <span className="text-emerald-500">{trafficStats.onlineNodes}</span>
                        <span className="text-muted-foreground"> / {trafficStats.totalNodes}</span>
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
