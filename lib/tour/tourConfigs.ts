/**
 * Tour Configuration - Step definitions for driver.js guided tours
 */

import { DriveStep } from 'driver.js';

/**
 * Dashboard tour for first-time visitors
 */
export const dashboardTour: DriveStep[] = [
    {
        popover: {
            title: 'Welcome to pNode Watch! 👋',
            description: 'Your command center for the Xandeum pNode network. Let me show you around in just 60 seconds.',
            side: 'over',
            align: 'center',
        },
    },
    {
        element: '[data-tour="network-stats"]',
        popover: {
            title: '📊 Network Overview',
            description: 'Real-time health metrics for the entire network. Watch the trend arrows to see if things are improving or declining.',
            side: 'bottom',
            align: 'start',
        },
    },
    {
        element: '[data-tour="search"]',
        popover: {
            title: '🔍 Search & Filter',
            description: 'Find nodes by ID, country, city, or version. Use the filters to narrow down to exactly what you need.',
            side: 'bottom',
            align: 'start',
        },
    },
    {
        element: '[data-tour="best-nodes"]',
        popover: {
            title: '⭐ Best Nodes to Stake',
            description: 'Our AI-powered selection of top-performing nodes based on uptime, storage, and reliability. Great for delegators!',
            side: 'left',
            align: 'start',
        },
    },
    {
        element: '[data-tour="activity-feed"]',
        popover: {
            title: '🔴 Live Activity Feed',
            description: 'Real-time events as they happen: nodes coming online, storage milestones, version updates. The network is alive!',
            side: 'left',
            align: 'start',
        },
    },
    {
        element: '[data-tour="node-table"]',
        popover: {
            title: '📋 Node Explorer',
            description: 'Browse all nodes with sortable columns. Click headers to sort, or click a row to see detailed node info.',
            side: 'top',
            align: 'center',
        },
    },
    {
        element: '[data-tour="nav-menu"]',
        popover: {
            title: '🧭 Explore More',
            description: 'Check out the Map for geographic view, Analytics for charts, Simulator to model scenarios, and more!',
            side: 'bottom',
            align: 'center',
        },
    },
    {
        popover: {
            title: 'You\'re All Set! 🎉',
            description: 'Click the "Take Tour" button in the header anytime to restart this guide. Happy exploring!',
            side: 'over',
            align: 'center',
        },
    },
];

/**
 * Map page tour (Network Intelligence Dashboard)
 */
export const mapTour: DriveStep[] = [
    {
        popover: {
            title: '🌐 Network Intelligence',
            description: 'Your unified view of the global pNode network. See nodes on a map and dive into regional statistics—all in one place.',
            side: 'over',
            align: 'center',
        },
    },
    {
        element: '[data-tour="map-stats"]',
        popover: {
            title: '📊 Global Stats',
            description: 'Quick overview of the entire network: total nodes, active countries, storage capacity, and average uptime.',
            side: 'bottom',
            align: 'center',
        },
    },
    {
        element: '.maplibregl-map',
        popover: {
            title: '🗺️ Interactive Map',
            description: 'Explore pNode locations worldwide. Green = online, yellow = degraded, red = offline. Use the 3D toggle for a globe view!',
            side: 'bottom',
            align: 'center',
        },
    },
    {
        popover: {
            title: '🌍 Scroll for Regions',
            description: 'Scroll down to see the Regional Breakdown. Each card shows node counts, health scores, and storage per country.',
            side: 'over',
            align: 'center',
        },
    },
    {
        popover: {
            title: 'You\'re All Set! 🎉',
            description: 'Click any region card to filter the map. Enjoy exploring the network!',
            side: 'over',
            align: 'center',
        },
    },
];

/**
 * Analytics page tour
 */
export const analyticsTour: DriveStep[] = [
    {
        popover: {
            title: '📈 Network Analytics',
            description: 'Deep insights into network performance and trends.',
            side: 'over',
            align: 'center',
        },
    },
    {
        element: '[data-tour="analytics-charts"]',
        popover: {
            title: '📊 Performance Charts',
            description: 'Visualize storage, uptime, and health distribution across the network.',
            side: 'bottom',
            align: 'center',
        },
    },
];

/**
 * Simulator page tour
 */
export const simulatorTour: DriveStep[] = [
    {
        popover: {
            title: '🧪 Storage Simulator',
            description: 'Model what-if scenarios to optimize your node performance.',
            side: 'over',
            align: 'center',
        },
    },
    {
        element: '[data-tour="simulator-controls"]',
        popover: {
            title: '⚙️ Adjust Parameters',
            description: 'Slide to change storage, uptime, and other settings. Results update in real-time.',
            side: 'right',
            align: 'start',
        },
    },
    {
        element: '[data-tour="simulator-results"]',
        popover: {
            title: '🏆 See Your Ranking',
            description: 'Watch your projected rank and percentile change as you adjust the sliders.',
            side: 'left',
            align: 'start',
        },
    },
];

/**
 * Get tour for a specific page
 */
export function getTour(page: 'dashboard' | 'map' | 'analytics' | 'simulator'): DriveStep[] {
    switch (page) {
        case 'dashboard':
            return dashboardTour;
        case 'map':
            return mapTour;
        case 'analytics':
            return analyticsTour;
        case 'simulator':
            return simulatorTour;
        default:
            return dashboardTour;
    }
}
