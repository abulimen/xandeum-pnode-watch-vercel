/**
 * Dashboard Page - Main landing page for pNode Analytics
 * Enhanced with official credits from Xandeum API
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RefreshBar } from '@/components/layout/RefreshBar';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { NodeTable } from '@/components/dashboard/NodeTable';
import { Pagination } from '@/components/dashboard/Pagination';
import { BestNodesToStake } from '@/components/dashboard/BestNodesToStake';
import { QuickStatsSummary } from '@/components/dashboard/QuickStatsSummary';
import { ComparisonPanel } from '@/components/dashboard/ComparisonPanel';
import { ErrorState } from '@/components/ui/ErrorState';
import {
    useNodes,
    useNetworkStats,
    useNodeFilters,
    useNodeSort,
    usePagination,
    useComparison,
    useNodeLocations,
} from '@/hooks';
import { enrichNodesWithStakingData } from '@/lib/services/analyticsService';
import { useCredits, enrichNodesWithCreditsData } from '@/hooks/useCredits';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useAutoSnapshot } from '@/hooks/useAutoSnapshot';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { ActivityDrawer } from '@/components/activity/ActivityDrawer';

export default function DashboardPage() {
    const { nodes, isLoading, isError, error, errorMessage, refetch, lastUpdated, isFetching, responseTime } = useNodes();

    // Auto-snapshot check - triggers if cron hasn't run in over an hour
    useAutoSnapshot();

    // Fetch credits from Xandeum API
    const { creditsMap, avgCredits, totalCredits, creditsThreshold } = useCredits();

    // Enrich all nodes with staking data and credits
    const enrichedNodes = useMemo(() => {
        const withStakingData = enrichNodesWithStakingData(nodes);
        return enrichNodesWithCreditsData(withStakingData, creditsMap);
    }, [nodes, creditsMap]);

    // Calculate stats - override credits fields with API data
    const { stats: baseStats, issues, issueCount } = useNetworkStats(enrichedNodes);
    const stats = useMemo(() => ({
        ...baseStats,
        avgCredits,
        avgStakingScore: avgCredits, // For backward compat
        totalCredits,
        creditsThreshold,
    }), [baseStats, avgCredits, totalCredits, creditsThreshold]);

    // Fetch locations for ALL nodes (needed for country/city filters)
    const { nodesWithLocation } = useNodeLocations(enrichedNodes);

    // Filtering (use nodes with location data for country/city filters)
    const {
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
        hasActiveFilters,
        availableRegions,
        availableCountries,
        availableCities,
        availableVersions,
    } = useNodeFilters(nodesWithLocation);

    // Sorting
    const { sortedNodes, sortColumn, sortDirection, setSort } = useNodeSort(filteredNodes);

    // Pagination
    const {
        paginatedItems: paginatedNodes,
        currentPage,
        pageSize,
        totalPages,
        setPage,
        setPageSize,
        hasNextPage,
        hasPrevPage,
    } = usePagination(sortedNodes, 10);

    // Comparison
    const { selectedNodes, addNode, removeNode, clearSelection, isSelected } = useComparison();

    // Get full node objects for comparison panel
    const selectedNodeObjects = useMemo(() =>
        selectedNodes.map(id => nodesWithLocation.find(n => n.id === id)).filter(Boolean) as typeof nodesWithLocation,
        [selectedNodes, nodesWithLocation]
    );

    // Activity feed
    const { events, clearEvents } = useActivityFeed(enrichedNodes, isLoading);

    // View mode state
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    // Load view mode from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('pnode-watch-view-mode');
        if (stored === 'table' || stored === 'cards') {
            setViewMode(stored);
        }
    }, []);

    // Handle view mode change
    const handleViewModeChange = (mode: 'table' | 'cards') => {
        setViewMode(mode);
        localStorage.setItem('pnode-watch-view-mode', mode);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                issueCount={issueCount}
                issues={issues}
                onSearch={setSearchQuery}
                lastUpdated={lastUpdated}
                isRefreshing={isLoading}
                onRefresh={refetch}
                isError={isError}
                activitySlot={<ActivityDrawer events={events} onClear={clearEvents} />}
            />

            <RefreshBar
                lastUpdated={lastUpdated}
                isFetching={isFetching}
                isError={isError}
                responseTime={responseTime}
                onRefresh={refetch}
            />

            <main className="flex-1 container px-4 py-6 space-y-6">
                {/* Stats Cards - Full Width */}
                <div data-tour="network-stats">
                    <StatsCards stats={stats} isLoading={isLoading} />
                </div>

                {/* Main Content */}
                {isError ? (
                    <ErrorState
                        message={errorMessage || 'Failed to load pNode data'}
                        onRetry={refetch}
                    />
                ) : (
                    <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
                        {/* Main Content - Node Explorer */}
                        <div className="space-y-6 min-w-0">
                            {/* Quick Stats Summary */}
                            <QuickStatsSummary
                                nodes={enrichedNodes}
                                filteredCount={filteredNodes.length}
                                startItem={filteredNodes.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                                endItem={Math.min(currentPage * pageSize, filteredNodes.length)}
                            />

                            {/* Filter Bar */}
                            <div data-tour="search-bar">
                                <FilterBar
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    statusFilter={statusFilter}
                                    onStatusFilterChange={setStatusFilter}
                                    regionFilter={regionFilter}
                                    onRegionFilterChange={setRegionFilter}
                                    countryFilter={countryFilter}
                                    onCountryFilterChange={setCountryFilter}
                                    cityFilter={cityFilter}
                                    onCityFilterChange={setCityFilter}
                                    versionFilter={versionFilter}
                                    onVersionFilterChange={setVersionFilter}
                                    accessFilter={accessFilter}
                                    onAccessFilterChange={setAccessFilter}
                                    favoritesOnly={favoritesOnly}
                                    onFavoritesOnlyChange={setFavoritesOnly}
                                    favoritesCount={favoritesCount}
                                    onClearFilters={clearFilters}
                                    resultCount={filteredNodes.length}
                                    totalCount={enrichedNodes.length}
                                    availableRegions={availableRegions}
                                    availableCountries={availableCountries}
                                    availableCities={availableCities}
                                    availableVersions={availableVersions}
                                    hasActiveFilters={hasActiveFilters}
                                    filteredNodes={filteredNodes}
                                    viewMode={viewMode}
                                    onViewModeChange={handleViewModeChange}
                                />
                            </div>

                            {/* Node Table */}
                            <div data-tour="node-table">
                                <NodeTable
                                    nodes={paginatedNodes}
                                    isLoading={isLoading}
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    onSort={setSort}
                                    onCompareAdd={addNode}
                                    selectedForCompare={selectedNodes}
                                    viewMode={viewMode}
                                />
                            </div>

                            {/* Comparison Panel */}
                            {selectedNodeObjects.length > 0 && (
                                <ComparisonPanel
                                    nodes={selectedNodeObjects}
                                    onRemove={removeNode}
                                    onClear={clearSelection}
                                />
                            )}

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                totalItems={filteredNodes.length}
                                onPageChange={setPage}
                                onPageSizeChange={setPageSize}
                                hasNextPage={hasNextPage}
                                hasPrevPage={hasPrevPage}
                            />
                        </div>

                        {/* Sidebar - Hidden on small screens, sticky on desktop */}
                        <aside className="hidden xl:block" data-tour="top-performers">
                            <div className="sticky top-20 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                                {/* Top Performers Card */}
                                <BestNodesToStake
                                    nodes={enrichedNodes}
                                    isLoading={isLoading}
                                    count={10}
                                />
                            </div>
                        </aside>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
