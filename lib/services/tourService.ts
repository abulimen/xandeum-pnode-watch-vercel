/**
 * Tour Service - Driver.js Interactive Tour Guide
 * Supports both desktop and mobile with device-specific tour steps
 */

import { driver, DriveStep, Config } from 'driver.js';
import 'driver.js/dist/driver.css';

// Check if current device is mobile
export function isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024; // lg breakpoint
}

// Custom theme configuration matching app theme
const getThemeConfig = (): Partial<Config> => ({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    stagePadding: isMobile() ? 6 : 10,
    stageRadius: 12,
    popoverClass: 'driverjs-theme',
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: 'Finish ✓',
    progressText: '{{current}} of {{total}}',
    showProgress: true,
});

// ============================================
// DESKTOP TOUR STEPS
// ============================================

// Dashboard tour steps - Desktop
const dashboardTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="header"]',
        popover: {
            title: '🧭 Navigation Header',
            description: 'Access all pages and features from here.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="network-stats"]',
        popover: {
            title: '📊 Network Statistics',
            description: 'Real-time overview of nodes, uptime, credits, and storage.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="search-bar"]',
        popover: {
            title: '🔍 Search & Filter',
            description: 'Search by node ID, IP, or version. Filter by status.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="node-table"]',
        popover: {
            title: '📋 Node Explorer',
            description: 'Browse all pNodes. Click any row for details.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="top-performers"]',
        popover: {
            title: '🏆 Top Performers',
            description: 'Highest-ranking nodes by credits.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="copilot-button"]',
        popover: {
            title: '✨ AI Copilot',
            description: 'Ask the AI assistant about nodes and network stats.',
            side: 'left',
            align: 'end'
        }
    },
    {
        element: '[data-tour="price-ticker"]',
        popover: {
            title: '💰 Live Price Ticker',
            description: 'Real-time XAND token price from Jupiter.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="tour-button"]',
        popover: {
            title: '❓ Need Help?',
            description: 'Click this button anytime to get a guided tour of any page you\'re on!',
            side: 'right',
            align: 'center'
        }
    }
];

// ============================================
// MOBILE TOUR STEPS
// (Skip desktop-only elements like header nav, sidebars)
// ============================================

// Dashboard tour steps - Mobile
const dashboardTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="network-stats"]',
        popover: {
            title: '📊 Network Statistics',
            description: 'Swipe to see all stats: nodes, uptime, credits, and storage.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="search-bar"]',
        popover: {
            title: '🔍 Search & Filter',
            description: 'Tap to search nodes or apply filters.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-table"]',
        popover: {
            title: '📋 Node Cards',
            description: 'Tap any card to view full node details.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="copilot-button"]',
        popover: {
            title: '✨ AI Copilot',
            description: 'Tap to chat with the AI assistant.',
            side: 'left',
            align: 'end'
        }
    },
    {
        element: '[data-tour="price-ticker"]',
        popover: {
            title: '💰 Price Ticker',
            description: 'Live XAND price. Tap "Buy" to trade.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="tour-button"]',
        popover: {
            title: '❓ Need Help?',
            description: 'Tap this button anytime for a guided tour of any page!',
            side: 'right',
            align: 'center'
        }
    }
];

// Leaderboard tour steps - Desktop
const leaderboardTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="leaderboard-header"]',
        popover: {
            title: '🏆 Credits Leaderboard',
            description: 'Top nodes ranked by various metrics.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="leaderboard-tabs"]',
        popover: {
            title: '📑 Category Tabs',
            description: 'Switch between Overall, Uptime, Storage, and Longevity.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Leaderboard tour steps - Mobile
const leaderboardTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="leaderboard-header"]',
        popover: {
            title: '🏆 Leaderboard',
            description: 'Top nodes ranked by performance metrics.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="leaderboard-tabs"]',
        popover: {
            title: '📑 Categories',
            description: 'Swipe or tap to switch ranking categories.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Map tour steps - Desktop
const mapTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="map-sidebar"]',
        popover: {
            title: '🌍 Geographic Browser',
            description: 'Browse nodes by country and city.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '[data-tour="map-stats"]',
        popover: {
            title: '📈 Network Stats',
            description: 'Overview of nodes, countries, and uptime.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="world-map"]',
        popover: {
            title: '🗺️ Interactive Map',
            description: 'Click markers to view node details.',
            side: 'left',
            align: 'center'
        }
    }
];

// Map tour steps - Mobile (sidebar is hidden, uses menu button)
const mapTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="map-stats"]',
        popover: {
            title: '📈 Network Stats',
            description: 'Quick overview of nodes and network status.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="world-map"]',
        popover: {
            title: '🗺️ Interactive Map',
            description: 'Tap markers to see node details. Pinch to zoom.',
            side: 'top',
            align: 'center'
        }
    },
    {
        popover: {
            title: '📂 Browse by Location',
            description: 'Use the filter button (☰) at top-right to browse nodes by country.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Compare tour steps - Desktop (Removed step 2 as requested)
const compareTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="compare-search"]',
        popover: {
            title: '🔍 Node Search',
            description: 'Select up to 4 nodes to compare.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Compare tour steps - Mobile
const compareTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="compare-search"]',
        popover: {
            title: '🔍 Add Nodes',
            description: 'Tap to search and add nodes to compare.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        popover: {
            title: '📊 Scroll to Compare',
            description: 'Swipe horizontally to see all node metrics.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Node details tour steps - Desktop
const nodeDetailsTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="node-header"]',
        popover: {
            title: '🖥️ Node Identity',
            description: 'Node ID, status, and quick actions.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-metrics"]',
        popover: {
            title: '📊 Key Metrics',
            description: 'Credits, uptime, storage, and health score.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Node details tour steps - Mobile
const nodeDetailsTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="node-header"]',
        popover: {
            title: '🖥️ Node Info',
            description: 'Node ID and current status.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-metrics"]',
        popover: {
            title: '📊 Metrics',
            description: 'Tap any metric card for details.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Analytics tour steps - Desktop
const analyticsTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="analytics-header"]',
        popover: {
            title: '📊 Network Analytics',
            description: 'Deep dive into network performance and health metrics.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="analytics-charts"]',
        popover: {
            title: '📈 Interactive Charts',
            description: 'Credits history, health score, distributions, and more. Hover for details.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Analytics tour steps - Mobile
const analyticsTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="analytics-header"]',
        popover: {
            title: '📊 Analytics',
            description: 'Network performance and health insights.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="analytics-charts"]',
        popover: {
            title: '📈 Charts & Stats',
            description: 'Scroll to explore all charts. Tap for more details.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Watchlist tour steps - Desktop
const watchlistTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="watchlist-header"]',
        popover: {
            title: '❤️ Your Watchlist',
            description: 'Quick access to your saved nodes.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="watchlist-nodes"]',
        popover: {
            title: '📋 Saved Nodes',
            description: 'Click any node for details.',
            side: 'top',
            align: 'center'
        }
    }
];

// Watchlist tour steps - Mobile
const watchlistTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="watchlist-header"]',
        popover: {
            title: '❤️ Watchlist',
            description: 'Your favorite nodes in one place.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="watchlist-nodes"]',
        popover: {
            title: '📋 Tap to View',
            description: 'Tap any node card for full details.',
            side: 'top',
            align: 'center'
        }
    }
];

// Calculator tour steps - Desktop
const calculatorTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="roi-inputs"]',
        popover: {
            title: '⚙️ Configuration',
            description: 'Set your node count, storage, stake, and boosts.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '[data-tour="roi-results"]',
        popover: {
            title: '💰 Estimated Rewards',
            description: 'View your potential monthly and annual earnings.',
            side: 'left',
            align: 'start'
        }
    }
];

// Calculator tour steps - Mobile
const calculatorTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="roi-inputs"]',
        popover: {
            title: '⚙️ Inputs',
            description: 'Configure your pNode parameters.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="roi-results"]',
        popover: {
            title: '💰 Results',
            description: 'Scroll down to see your estimated rewards.',
            side: 'top',
            align: 'center'
        }
    }
];

// Trade tour steps - Desktop
const tradeTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="trade-chart"]',
        popover: {
            title: '📈 Price Chart',
            description: 'Live XAND/SOL price chart from TradingView.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '[data-tour="trade-swap"]',
        popover: {
            title: '🔄 Jupiter Swap',
            description: 'Swap SOL or USDC for XAND directly with best rates.',
            side: 'left',
            align: 'center'
        }
    },
    {
        element: '[data-tour="trade-stats"]',
        popover: {
            title: '📊 Token Stats',
            description: 'Current price, market cap, and liquidity info.',
            side: 'left',
            align: 'center'
        }
    },
    {
        element: '[data-tour="trade-about"]',
        popover: {
            title: 'ℹ️ About Xandeum',
            description: 'Learn more about the project and community links.',
            side: 'top',
            align: 'center'
        }
    }
];

// Trade tour steps - Mobile
const tradeTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="trade-swap"]',
        popover: {
            title: '🔄 Swap',
            description: 'Buy XAND tokens here.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="trade-chart"]',
        popover: {
            title: '📈 Chart',
            description: 'Live price action.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="trade-stats"]',
        popover: {
            title: '📊 Stats',
            description: 'Token metrics and info.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Staking tour steps - Desktop
const stakingTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="staking-header"]',
        popover: {
            title: '🥩 Liquid Staking',
            description: 'Stake SOL to receive XANDSOL and earn rewards.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="staking-stats"]',
        popover: {
            title: '📈 Staking Stats',
            description: 'Current APY, prices, and TVL.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="staking-calculator"]',
        popover: {
            title: '🧮 Rewards Calculator',
            description: 'Estimate your earnings based on amount and timeframe.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '[data-tour="staking-info"]',
        popover: {
            title: 'ℹ️ Information',
            description: 'Learn about XANDSOL and XAND governance staking.',
            side: 'left',
            align: 'center'
        }
    }
];

// Staking tour steps - Mobile
const stakingTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="staking-header"]',
        popover: {
            title: '🥩 Stake SOL',
            description: 'Earn rewards with liquid staking.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="staking-calculator"]',
        popover: {
            title: '🧮 Calculator',
            description: 'Calculate your potential returns.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// ============================================
// TOUR MANAGEMENT FUNCTIONS
// ============================================

// Create and start a tour
export function startTour(steps: DriveStep[], onComplete?: () => void) {
    // Filter out steps without elements (info-only steps are fine)
    const validSteps = steps.filter(step => {
        if (!step.element) return true; // Info-only steps
        const el = document.querySelector(step.element as string);
        return el !== null;
    });

    if (validSteps.length === 0) {
        console.warn('No valid tour steps found');
        return null;
    }

    const driverObj = driver({
        ...getThemeConfig(),
        steps: validSteps,
        onDestroyStarted: () => {
            if (onComplete) onComplete();
            driverObj.destroy();
        }
    });

    driverObj.drive();
    return driverObj;
}

// Check if tour has been completed before (or globally dismissed)
export function hasCompletedTour(tourId: string): boolean {
    if (typeof window === 'undefined') return true;
    if (isGlobalTourDismissed()) return true;
    const suffix = isMobile() ? '_mobile' : '_desktop';
    return localStorage.getItem(`tour_${tourId}${suffix}_completed`) === 'true';
}

// Mark tour as completed
export function markTourCompleted(tourId: string): void {
    if (typeof window === 'undefined') return;
    const suffix = isMobile() ? '_mobile' : '_desktop';
    localStorage.setItem(`tour_${tourId}${suffix}_completed`, 'true');
}

// Check if tours are globally dismissed
export function isGlobalTourDismissed(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('tour_global_dismissed') === 'true';
}

// Mark tours as globally dismissed
export function markGlobalTourDismissed(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('tour_global_dismissed', 'true');
}

// Reset all tours
export function resetAllTours(): void {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage).filter(key => key.startsWith('tour_'));
    keys.forEach(key => localStorage.removeItem(key));
}

// Get tour steps for a specific page (responsive)
export function getTourStepsForPage(pathname: string): DriveStep[] {
    const mobile = isMobile();

    if (pathname === '/' || pathname === '') {
        return mobile ? dashboardTourStepsMobile : dashboardTourStepsDesktop;
    }
    if (pathname === '/leaderboard') {
        return mobile ? leaderboardTourStepsMobile : leaderboardTourStepsDesktop;
    }
    if (pathname === '/map') {
        return mobile ? mapTourStepsMobile : mapTourStepsDesktop;
    }
    if (pathname === '/compare') {
        return mobile ? compareTourStepsMobile : compareTourStepsDesktop;
    }
    if (pathname.startsWith('/nodes/')) {
        return mobile ? nodeDetailsTourStepsMobile : nodeDetailsTourStepsDesktop;
    }
    if (pathname === '/analytics') {
        return mobile ? analyticsTourStepsMobile : analyticsTourStepsDesktop;
    }
    if (pathname === '/watchlist') {
        return mobile ? watchlistTourStepsMobile : watchlistTourStepsDesktop;
    }
    if (pathname === '/calculator') {
        return mobile ? calculatorTourStepsMobile : calculatorTourStepsDesktop;
    }
    if (pathname === '/trade') {
        return mobile ? tradeTourStepsMobile : tradeTourStepsDesktop;
    }
    if (pathname === '/staking') {
        return mobile ? stakingTourStepsMobile : stakingTourStepsDesktop;
    }
    if (pathname === '/guide' || pathname.startsWith('/guide/')) {
        return [];
    }

    // Default: just show a welcome message
    return [{
        popover: {
            title: '👋 Welcome!',
            description: 'Explore this page to discover its features.',
            side: 'bottom',
            align: 'center'
        }
    }];
}

// Export for backward compatibility
export const dashboardTourSteps = dashboardTourStepsDesktop;
export const leaderboardTourSteps = leaderboardTourStepsDesktop;
export const mapTourSteps = mapTourStepsDesktop;
export const compareTourSteps = compareTourStepsDesktop;
export const nodeDetailsTourSteps = nodeDetailsTourStepsDesktop;
export const analyticsTourSteps = analyticsTourStepsDesktop;
export const watchlistTourSteps = watchlistTourStepsDesktop;
export const calculatorTourSteps = calculatorTourStepsDesktop;
export const tradeTourSteps = tradeTourStepsDesktop;
export const stakingTourSteps = stakingTourStepsDesktop;
