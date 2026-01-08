/**
 * FilterBar Component - Search and filter controls
 * Supports: search, status, country, and public/private filtering
 */

'use client';

import { Search, X, Globe, Shield, ShieldOff, Filter, Check, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExportCSV } from '@/components/dashboard/ExportCSV';
import { PNode } from '@/types/pnode';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { StatusFilter } from '@/types/filters';
import { AccessFilter } from '@/hooks/useNodeFilters';
import { useCallback, useState, useEffect } from 'react';

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: StatusFilter;
    onStatusFilterChange: (status: StatusFilter) => void;
    regionFilter: string[];
    onRegionFilterChange: (regions: string[]) => void;
    countryFilter: string;
    onCountryFilterChange: (country: string) => void;
    cityFilter: string;
    onCityFilterChange: (city: string) => void;
    versionFilter: string;
    onVersionFilterChange: (filter: string) => void;
    accessFilter: AccessFilter;
    onAccessFilterChange: (access: AccessFilter) => void;
    favoritesOnly: boolean;
    onFavoritesOnlyChange: (value: boolean) => void;
    favoritesCount: number;
    onClearFilters: () => void;
    resultCount: number;
    totalCount: number;
    availableRegions: string[];
    availableCountries: string[];
    availableCities: string[];
    availableVersions: string[];
    hasActiveFilters: boolean;
    filteredNodes?: PNode[]; // For export
    viewMode?: 'table' | 'cards';
    onViewModeChange?: (mode: 'table' | 'cards') => void;
}

export function FilterBar({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    regionFilter,
    onRegionFilterChange,
    countryFilter,
    onCountryFilterChange,
    cityFilter,
    onCityFilterChange,
    versionFilter,
    onVersionFilterChange,
    accessFilter,
    onAccessFilterChange,
    favoritesOnly,
    onFavoritesOnlyChange,
    favoritesCount,
    onClearFilters,
    resultCount,
    totalCount,
    availableRegions,
    availableCountries,
    availableCities,
    availableVersions,
    hasActiveFilters,
    filteredNodes,
    viewMode = 'table',
    onViewModeChange,
}: FilterBarProps) {
    const [localSearch, setLocalSearch] = useState(searchQuery);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(localSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearch, onSearchChange]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearch(e.target.value);
    }, []);

    const FilterControls = () => (
        <div className="flex flex-col gap-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="degraded">Degraded</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium">Access</label>
                <Select value={accessFilter} onValueChange={(value) => onAccessFilterChange(value as AccessFilter)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Access" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Nodes</SelectItem>
                        <SelectItem value="public">
                            <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3 text-emerald-500" />
                                Public
                            </div>
                        </SelectItem>
                        <SelectItem value="private">
                            <div className="flex items-center gap-2">
                                <ShieldOff className="h-3 w-3 text-amber-500" />
                                Private
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {availableCountries.length > 0 && (
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Country</label>
                    <Select value={countryFilter} onValueChange={(val) => {
                        onCountryFilterChange(val);
                        // Reset city filter when country changes
                        if (val !== countryFilter) {
                            onCityFilterChange('all');
                        }
                    }}>
                        <SelectTrigger>
                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {availableCountries.map((country) => (
                                <SelectItem key={country} value={country}>
                                    {country}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {availableCities.length > 0 && (
                <div className="grid gap-2">
                    <label className="text-sm font-medium">City</label>
                    <Select value={cityFilter} onValueChange={onCityFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="City" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {availableCities.map((city) => (
                                <SelectItem key={city} value={city}>
                                    {city}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {hasActiveFilters && (
                <Button variant="outline" onClick={onClearFilters} className="mt-2">
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                </Button>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border shadow-sm">
            {/* Top Row: Search + Export */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                {/* Search Input */}
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by ID, IP, or version..."
                        className="pl-9 bg-background"
                        value={localSearch}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* View Mode Toggle - Desktop */}
                {onViewModeChange && (
                    <div className="hidden lg:flex items-center rounded-lg border bg-muted/50 p-1">
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 px-3 gap-2"
                            onClick={() => onViewModeChange('table')}
                        >
                            <List className="h-4 w-4" />
                            Table
                        </Button>
                        <Button
                            variant={viewMode === 'cards' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 px-3 gap-2"
                            onClick={() => onViewModeChange('cards')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Cards
                        </Button>
                    </div>
                )}

                {/* Mobile/Tablet: Filter Button + Export */}
                <div className="flex items-center gap-2 lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="flex-1">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                        Active
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>
                                    Refine the node list by status, location, and more.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6">
                                <FilterControls />
                            </div>
                        </SheetContent>
                    </Sheet>
                    {filteredNodes && <ExportCSV nodes={filteredNodes} />}
                </div>

                {/* Desktop Filters (Inline) - only show on lg screens */}
                <div className="hidden lg:flex items-center gap-2 flex-wrap">
                    <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}>
                        <SelectTrigger className="w-[120px] bg-background">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="degraded">Degraded</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={accessFilter} onValueChange={(value) => onAccessFilterChange(value as AccessFilter)}>
                        <SelectTrigger className="w-[120px] bg-background">
                            <SelectValue placeholder="Access" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Nodes</SelectItem>
                            <SelectItem value="public">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-3 w-3 text-emerald-500" />
                                    Public
                                </div>
                            </SelectItem>
                            <SelectItem value="private">
                                <div className="flex items-center gap-2">
                                    <ShieldOff className="h-3 w-3 text-amber-500" />
                                    Private
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={versionFilter} onValueChange={onVersionFilterChange}>
                        <SelectTrigger className="w-[140px] bg-background">
                            <SelectValue placeholder="Version" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Versions</SelectItem>
                            {availableVersions.map((version) => (
                                <SelectItem key={version} value={version}>
                                    {version}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {availableCountries.length > 0 && (
                        <Select value={countryFilter} onValueChange={onCountryFilterChange}>
                            <SelectTrigger className="w-[150px] bg-background">
                                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Countries</SelectItem>
                                {availableCountries.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {hasActiveFilters && (
                        <Button variant="ghost" size="icon" onClick={onClearFilters} title="Clear Filters">
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Export on Desktop */}
                    {filteredNodes && <ExportCSV nodes={filteredNodes} />}
                </div>
            </div>
        </div>
    );
}
