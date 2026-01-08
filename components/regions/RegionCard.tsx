import { PNode } from "@/types/pnode";
import { cn } from "@/lib/utils";
import { Server, Database, Wifi, Activity } from "lucide-react";
import { formatBytes as formatBytesService } from "@/lib/services/analyticsService";

interface RegionCardProps {
    country: string;
    nodes: PNode[];
    onClick?: () => void;
}

export function RegionCard({ country, nodes, onClick }: RegionCardProps) {
    const totalNodes = nodes.length;
    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const degradedNodes = nodes.filter(n => n.status === 'degraded').length;
    const offlineNodes = nodes.filter(n => n.status === 'offline').length;

    // Calculate health score
    const healthScore = Math.round(((onlineNodes * 1 + degradedNodes * 0.5) / totalNodes) * 100);

    // Calculate total storage
    const totalStorage = nodes.reduce((acc, node) => acc + (node.storage?.total || 0), 0);

    // Get average latency
    const validLatencyNodes = nodes.filter(n => n.responseTime > 0);
    const avgLatency = validLatencyNodes.length > 0
        ? Math.round(validLatencyNodes.reduce((acc, n) => acc + n.responseTime, 0) / validLatencyNodes.length)
        : 0;

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg shadow-sm">
                        {getFlagEmoji(country)}
                    </div>
                    <div>
                        <h3 className="font-semibold leading-none tracking-tight">{country}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{totalNodes} Node{totalNodes !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className={cn(
                    "flex flex-col items-end",
                    healthScore >= 90 ? "text-emerald-500" :
                        healthScore >= 70 ? "text-amber-500" : "text-red-500"
                )}>
                    <span className="text-xl font-bold">{healthScore}%</span>
                    <span className="text-[10px] opacity-80 font-medium tracking-wider">HEALTH</span>
                </div>
            </div>

            <div className="px-4 py-2 space-y-3">
                {/* Status Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        <span>Status Distribution</span>
                        <div className="flex gap-2">
                            <span className="text-emerald-500 font-bold">{onlineNodes}</span>
                            <span className="text-amber-500 font-bold">{degradedNodes}</span>
                            <span className="text-red-500 font-bold">{offlineNodes}</span>
                        </div>
                    </div>
                    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(onlineNodes / totalNodes) * 100}%` }} />
                        <div className="bg-amber-500 h-full transition-all" style={{ width: `${(degradedNodes / totalNodes) * 100}%` }} />
                        <div className="bg-red-500 h-full transition-all" style={{ width: `${(offlineNodes / totalNodes) * 100}%` }} />
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg bg-muted/50 p-2 border border-border/50">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mb-1 font-medium">
                            <Database className="w-3 h-3" />
                            STORAGE
                        </div>
                        <div className="text-sm font-semibold truncate" title={formatBytesService(totalStorage)}>
                            {formatBytesService(totalStorage)}
                        </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2 border border-border/50">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mb-1 font-medium">
                            <Wifi className="w-3 h-3" />
                            LATENCY
                        </div>
                        <div className="text-sm font-semibold truncate">
                            {avgLatency} ms
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Highlight */}
            <div className="absolute inset-0 ring-1 ring-inset ring-transparent group-hover:ring-primary/20 rounded-xl transition-all pointer-events-none" />
        </div>
    );
}

// Helper to get flag emoji
function getFlagEmoji(countryName: string): string {
    const codePoints = (code: string) => {
        return code
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
    }

    const countryCodes: Record<string, string> = {
        'United States': 'US', 'USA': 'US',
        'United Kingdom': 'GB', 'UK': 'GB',
        'Germany': 'DE', 'France': 'FR', 'Japan': 'JP',
        'China': 'CN', 'Taiwan': 'TW', 'Singapore': 'SG',
        'Australia': 'AU', 'Canada': 'CA', 'India': 'IN',
        'Brazil': 'BR', 'Netherlands': 'NL', 'Russia': 'RU',
        'Korea': 'KR', 'South Korea': 'KR', 'Sweden': 'SE',
        'Finland': 'FI', 'Poland': 'PL', 'Italy': 'IT',
        'Spain': 'ES', 'Switzerland': 'CH', 'Austria': 'AT',
        'Belgium': 'BE', 'Denmark': 'DK', 'Norway': 'NO',
        'Ireland': 'IE', 'Portugal': 'PT', 'Romania': 'RO',
        'Czech Republic': 'CZ', 'Hungary': 'HU', 'Turkey': 'TR',
        'Vietnam': 'VN', 'Thailand': 'TH', 'Indonesia': 'ID',
        'Philippines': 'PH', 'Malaysia': 'MY', 'Mexico': 'MX',
        'Argentina': 'AR', 'Chile': 'CL', 'Colombia': 'CO',
        'Peru': 'PE', 'South Africa': 'ZA', 'Egypt': 'EG',
        'Saudi Arabia': 'SA', 'UAE': 'AE', 'Israel': 'IL',
        'Ukraine': 'UA', 'Hong Kong': 'HK', 'New Zealand': 'NZ'
    };

    const code = countryCodes[countryName] || countryCodes[Object.keys(countryCodes).find(k => countryName.includes(k)) || ''];
    if (code) {
        return String.fromCodePoint(...codePoints(code));
    }
    return '🌍';
}
