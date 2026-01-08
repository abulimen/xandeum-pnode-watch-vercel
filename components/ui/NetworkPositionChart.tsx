import { cn } from '@/lib/utils';

interface NetworkPositionChartProps {
    value: number;
    allValues: number[];
    label: string;
    className?: string;
}

export function NetworkPositionChart({
    value,
    allValues,
    label,
    className
}: NetworkPositionChartProps) {
    // Create a simple distribution chart
    const sorted = [...allValues].sort((a, b) => a - b);
    const min = sorted[0] || 0;
    const max = sorted[sorted.length - 1] || 100;
    const range = max - min || 1;

    // Calculate position percentage (0-100)
    const position = ((value - min) / range) * 100;

    // Generate buckets for histogram
    const bucketCount = 20;
    const buckets = new Array(bucketCount).fill(0);
    sorted.forEach(v => {
        const bucketIndex = Math.min(
            Math.floor(((v - min) / range) * bucketCount),
            bucketCount - 1
        );
        buckets[bucketIndex]++;
    });

    const maxCount = Math.max(...buckets) || 1;

    return (
        <div className={cn("space-y-2 w-full max-w-full overflow-hidden", className)}>
            <div className="flex flex-col sm:flex-row sm:justify-between text-[10px] sm:text-xs text-muted-foreground gap-1">
                <span className="truncate">{label} Distribution</span>
                <span>Top {Math.max(1, 100 - Math.round((sorted.findIndex(v => v >= value) / sorted.length) * 100))}%</span>
            </div>
            <div className="h-16 flex items-end gap-0.5 sm:gap-1 relative">
                {buckets.map((count, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-muted dark:bg-white/20 rounded-t-sm transition-all hover:bg-muted-foreground/30 dark:hover:bg-white/40"
                        style={{ height: `${Math.max(10, (count / maxCount) * 100)}%` }}
                    />
                ))}
                {/* Current Node Indicator */}
                <div
                    className="absolute bottom-0 w-1 bg-primary h-full shadow-[0_0_10px_rgba(var(--primary),0.5)] z-10"
                    style={{ left: `${Math.max(0, Math.min(100, position))}%` }}
                >
                    <div className="absolute -top-2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
                </div>
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground font-mono">
                <span>{min.toFixed(0)}</span>
                <span>{value.toFixed(0)}</span>
                <span>{max.toFixed(0)}</span>
            </div>
        </div>
    );
}
