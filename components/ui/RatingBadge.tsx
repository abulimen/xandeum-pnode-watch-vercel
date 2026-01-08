import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BenchmarkResult } from '@/lib/services/benchmarkService';

interface RatingBadgeProps {
    rating: BenchmarkResult['overallRating'];
    className?: string;
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
    const styles = {
        excellent: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
        good: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
        average: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        below_average: 'bg-red-500/20 text-red-500 border-red-500/30',
    };

    const labels = {
        excellent: 'Excellent',
        good: 'Good',
        average: 'Average',
        below_average: 'Below Average',
    };

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium whitespace-nowrap shrink-0",
            styles[rating],
            className
        )}>
            <Star className="h-3.5 w-3.5" />
            {labels[rating]}
        </span>
    );
}
