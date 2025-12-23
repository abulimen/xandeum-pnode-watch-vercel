/**
 * BadgeDistribution Component
 * Displays the count of nodes with each achievement badge
 * Uses the same SVG icons as the leaderboard page
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PNode } from '@/types/pnode';
import { Award, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { badgeService, BadgeType } from '@/lib/services/badgeService';

interface BadgeDistributionProps {
    nodes: PNode[];
    isLoading?: boolean;
}

// Custom SVG Badge Icons (same as in BadgeDisplay.tsx)
const BadgeIcons: Record<BadgeType, React.FC<{ className?: string; color?: string }>> = {
    'elite-uptime': ({ className, color = '#FFD700' }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.3" />
        </svg>
    ),
    'speed-demon': ({ className, color = '#00BFFF' }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    'storage-champion': ({ className, color = '#9B59B6' }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="6" rx="1" fill={color} stroke={color} strokeWidth="1.5" />
            <rect x="2" y="9" width="20" height="6" rx="1" fill={color} stroke={color} strokeWidth="1.5" fillOpacity="0.7" />
            <rect x="2" y="15" width="20" height="6" rx="1" fill={color} stroke={color} strokeWidth="1.5" fillOpacity="0.4" />
            <circle cx="6" cy="6" r="1" fill="white" />
            <circle cx="6" cy="12" r="1" fill="white" />
            <circle cx="6" cy="18" r="1" fill="white" />
        </svg>
    ),
    'hot-streak': ({ className, color = '#FF6B35' }) => (
        <Flame className={className} color={color} fill={color} fillOpacity={0.2} strokeWidth={1.5} />
    ),
    'credits-leader': ({ className, color = '#00D9A5' }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        </svg>
    ),
};

const BADGE_COLORS: Record<BadgeType, string> = {
    'elite-uptime': '#FFD700',
    'speed-demon': '#00BFFF',
    'storage-champion': '#9B59B6',
    'hot-streak': '#FF6B35',
    'credits-leader': '#00D9A5',
};

export function BadgeDistribution({ nodes, isLoading }: BadgeDistributionProps) {
    const badgeCounts = useMemo(() => {
        const counts: Record<BadgeType, number> = {
            'elite-uptime': 0,
            'speed-demon': 0,
            'storage-champion': 0,
            'hot-streak': 0,
            'credits-leader': 0,
        };

        for (const node of nodes) {
            const earnedBadges = badgeService.getEarnedBadges(node, nodes);
            for (const badge of earnedBadges) {
                counts[badge.id]++;
            }
        }

        return counts;
    }, [nodes]);

    const totalNodes = nodes.length;
    const definitions = badgeService.BADGE_DEFINITIONS;

    return (
        <Card className="border-none shadow-md h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    Achievement Badges
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Nodes with special achievements
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {(Object.keys(definitions) as BadgeType[]).map((badgeId) => {
                    const def = definitions[badgeId];
                    const Icon = BadgeIcons[badgeId];
                    const color = BADGE_COLORS[badgeId];
                    const count = badgeCounts[badgeId];
                    const percentage = totalNodes > 0 ? ((count / totalNodes) * 100).toFixed(1) : '0';

                    return (
                        <div
                            key={badgeId}
                            className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm"
                            style={{
                                backgroundColor: `${color}10`,
                                borderColor: `${color}30`,
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="flex items-center justify-center h-10 w-10 rounded-lg shrink-0"
                                style={{
                                    backgroundColor: `${color}20`,
                                    boxShadow: `0 0 8px ${color}40`,
                                }}
                            >
                                <Icon className="h-6 w-6" color={color} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-sm" style={{ color }}>
                                        {def.name}
                                    </span>
                                    <span className="text-lg font-bold">{count}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {def.description}
                                </p>
                                {/* Progress bar */}
                                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${percentage}%`, backgroundColor: color }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
