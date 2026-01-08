import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PNode } from "@/types/pnode";
import { RegionCard } from "./RegionCard";
import { Globe, Search, Filter, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RegionGridProps {
    nodes: PNode[];
    onRegionClick?: (country: string, nodes: PNode[]) => void;
}

type SortOption = 'nodes-desc' | 'nodes-asc' | 'health-desc' | 'health-asc' | 'name-asc' | 'name-desc';

const sortLabels: Record<SortOption, string> = {
    'nodes-desc': 'Most Nodes',
    'nodes-asc': 'Fewest Nodes',
    'health-desc': 'Highest Health',
    'health-asc': 'Lowest Health',
    'name-asc': 'A to Z',
    'name-desc': 'Z to A',
};

export function RegionGrid({ nodes, onRegionClick }: RegionGridProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('nodes-desc');

    // Group nodes by country
    const regions = useMemo(() => {
        const groups: Record<string, PNode[]> = {};

        nodes.forEach(node => {
            const country = node.location?.country || 'Unknown';
            if (!groups[country]) {
                groups[country] = [];
            }
            groups[country].push(node);
        });

        // Convert to array with calculated health
        return Object.entries(groups).map(([country, regionNodes]) => {
            const onlineCount = regionNodes.filter(n => n.status === 'online').length;
            const degradedCount = regionNodes.filter(n => n.status === 'degraded').length;
            const healthScore = Math.round(((onlineCount + degradedCount * 0.5) / regionNodes.length) * 100);

            return {
                country,
                nodes: regionNodes,
                healthScore,
            };
        });
    }, [nodes]);

    // Filter and sort regions
    const filteredRegions = useMemo(() => {
        let result = regions;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r => r.country.toLowerCase().includes(query));
        }

        // Apply sorting
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case 'nodes-desc':
                    return b.nodes.length - a.nodes.length;
                case 'nodes-asc':
                    return a.nodes.length - b.nodes.length;
                case 'health-desc':
                    return b.healthScore - a.healthScore;
                case 'health-asc':
                    return a.healthScore - b.healthScore;
                case 'name-asc':
                    return a.country.localeCompare(b.country);
                case 'name-desc':
                    return b.country.localeCompare(a.country);
                default:
                    return b.nodes.length - a.nodes.length;
            }
        });

        return result;
    }, [regions, searchQuery, sortBy]);

    const totalCountries = regions.length;

    const handleCardClick = (country: string, regionNodes: PNode[]) => {
        // Don't navigate for Unknown country
        if (country === 'Unknown') {
            return;
        }
        // Navigate to country analytics page
        router.push(`/map/regions/${encodeURIComponent(country)}`);
        // Also call original handler if provided
        onRegionClick?.(country, regionNodes);
    };

    return (
        <div className="space-y-4">
            {/* Header with Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-primary" />
                        Network Regions
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Global distribution across <span className="text-foreground font-medium">{totalCountries} countries</span>
                        {searchQuery && filteredRegions.length !== regions.length && (
                            <span className="text-primary ml-1">
                                (showing {filteredRegions.length})
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search countries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-8 h-9"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5 h-9">
                                <Filter className="h-4 w-4" />
                                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                                <DropdownMenuItem
                                    key={option}
                                    onClick={() => setSortBy(option)}
                                    className={cn(sortBy === option && "bg-muted")}
                                >
                                    {sortLabels[option]}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Region Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredRegions.map((region) => (
                    <RegionCard
                        key={region.country}
                        country={region.country}
                        nodes={region.nodes}
                        onClick={() => handleCardClick(region.country, region.nodes)}
                    />
                ))}
            </div>

            {/* Empty States */}
            {filteredRegions.length === 0 && searchQuery && (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No countries matching "{searchQuery}"</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="text-primary text-sm hover:underline mt-1"
                    >
                        Clear search
                    </button>
                </div>
            )}

            {regions.length === 0 && (
                <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                    No regional data available.
                </div>
            )}
        </div>
    );
}
