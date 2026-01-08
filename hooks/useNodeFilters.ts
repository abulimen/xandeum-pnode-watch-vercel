/**
 * useNodeFilters Hook - Search and filter functionality for pNodes
 * Supports: search, status, region, country, city, favorites, version, and public/private filtering
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { PNode } from '@/types/pnode';
import { StatusFilter } from '@/types/filters';
import { useFavorites } from './useFavorites';

export type AccessFilter = 'all' | 'public' | 'private';

interface UseNodeFiltersResult {
    filteredNodes: PNode[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: StatusFilter;
    setStatusFilter: (status: StatusFilter) => void;
    regionFilter: string[];
    setRegionFilter: (regions: string[]) => void;
    countryFilter: string;
    setCountryFilter: (country: string) => void;
    cityFilter: string;
    setCityFilter: (city: string) => void;
    versionFilter: string;
    setVersionFilter: (filter: string) => void;
    accessFilter: AccessFilter;
    setAccessFilter: (access: AccessFilter) => void;
    favoritesOnly: boolean;
    setFavoritesOnly: (value: boolean) => void;
    favoritesCount: number;
    clearFilters: () => void;
    resultCount: number;
    hasActiveFilters: boolean;
    availableRegions: string[];
    availableCountries: string[];
    availableCities: string[];
    availableVersions: string[];
}

export function useNodeFilters(nodes: PNode[]): UseNodeFiltersResult {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [regionFilter, setRegionFilter] = useState<string[]>([]);
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [cityFilter, setCityFilter] = useState<string>('all');
    const [versionFilter, setVersionFilter] = useState<string>('all');
    const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
    const [favoritesOnly, setFavoritesOnly] = useState(false);

    const { favorites, favoritesCount } = useFavorites();

    // Get available regions from node data
    const availableRegions = useMemo(() => {
        const regions = new Set<string>();
        nodes.forEach(node => {
            if (node.location?.region) {
                regions.add(node.location.region);
            }
        });
        return Array.from(regions).sort();
    }, [nodes]);

    // Get available countries from node data
    const availableCountries = useMemo(() => {
        const countries = new Set<string>();
        nodes.forEach(node => {
            if (node.location?.country) {
                countries.add(node.location.country);
            }
        });
        return Array.from(countries).sort();
    }, [nodes]);

    // Get available cities from node data (filtered by country if selected)
    const availableCities = useMemo(() => {
        const cities = new Set<string>();
        nodes.forEach(node => {
            if (node.location?.city) {
                // If country filter is active, only show cities from that country
                if (countryFilter !== 'all') {
                    if (node.location.country === countryFilter) {
                        cities.add(node.location.city);
                    }
                } else {
                    cities.add(node.location.city);
                }
            }
        });
        return Array.from(cities).sort();
    }, [nodes, countryFilter]);

    // Get available versions from node data
    const availableVersions = useMemo(() => {
        const versions = new Set<string>();
        nodes.forEach(node => {
            if (node.version) {
                versions.add(node.version);
            }
        });
        return Array.from(versions).sort();
    }, [nodes]);

    // Apply all filters
    const filteredNodes = useMemo(() => {
        return nodes.filter(node => {
            // Favorites filter - must check first if enabled
            if (favoritesOnly && !favorites.includes(node.id)) {
                return false;
            }

            // Search filter - searches node ID, public key, IP, and version (NOT location)
            if (searchQuery) {
                const query = searchQuery.toLowerCase().trim();

                // Build searchable fields (excluding location - that's handled by filters)
                const searchFields = [
                    node.id,
                    node.publicKey,
                    node.network?.ipAddress,
                    node.version,
                ].filter(Boolean).map(s => s!.toLowerCase());

                // Check if any field contains the search query
                const matchesAny = searchFields.some(field => field.includes(query));

                if (!matchesAny) {
                    return false;
                }
            }

            // Status filter
            if (statusFilter !== 'all' && node.status !== statusFilter) {
                return false;
            }

            // Region filter
            if (regionFilter.length > 0) {
                if (!node.location?.region || !regionFilter.includes(node.location.region)) {
                    return false;
                }
            }

            // Country filter
            if (countryFilter !== 'all') {
                if (!node.location?.country || node.location.country !== countryFilter) {
                    return false;
                }
            }

            // City filter
            if (cityFilter !== 'all') {
                if (!node.location?.city || node.location.city !== cityFilter) {
                    return false;
                }
            }

            // Version filter (exact match)
            if (versionFilter !== 'all') {
                if (!node.version || node.version !== versionFilter) {
                    return false;
                }
            }

            // Access filter (public/private)
            if (accessFilter !== 'all') {
                const isPublic = node.isPublic === true;
                if (accessFilter === 'public' && !isPublic) {
                    return false;
                }
                if (accessFilter === 'private' && isPublic) {
                    return false;
                }
            }

            return true;
        });
    }, [nodes, searchQuery, statusFilter, regionFilter, countryFilter, cityFilter, versionFilter, accessFilter, favoritesOnly, favorites]);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setStatusFilter('all');
        setRegionFilter([]);
        setCountryFilter('all');
        setCityFilter('all');
        setVersionFilter('all');
        setAccessFilter('all');
        setFavoritesOnly(false);
    }, []);

    const hasActiveFilters =
        searchQuery !== '' ||
        statusFilter !== 'all' ||
        regionFilter.length > 0 ||
        countryFilter !== 'all' ||
        cityFilter !== 'all' ||
        versionFilter !== 'all' ||
        accessFilter !== 'all' ||
        favoritesOnly;

    return {
        filteredNodes,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        regionFilter,
        setRegionFilter,
        countryFilter,
        setCountryFilter,
        cityFilter,
        setCityFilter,
        versionFilter,
        setVersionFilter,
        accessFilter,
        setAccessFilter,
        favoritesOnly,
        setFavoritesOnly,
        favoritesCount,
        clearFilters,
        resultCount: filteredNodes.length,
        hasActiveFilters,
        availableRegions,
        availableCountries,
        availableCities,
        availableVersions,
    };
}
