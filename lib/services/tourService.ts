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
            description: 'Your command center! Use the search bar to find nodes by ID or IP, switch between Mainnet/Devnet networks, and access notifications. The sidebar on the left gives you quick access to all pages.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="network-stats"]',
        popover: {
            title: '📊 Network Statistics at a Glance',
            description: 'These cards show the pulse of the Xandeum network in real-time: Total Nodes (active pNodes), Avg Uptime (reliability score), Avg Credits (earnings per node), Network Capacity (total storage), and Elite Nodes (99.5%+ uptime performers).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="search-bar"]',
        popover: {
            title: '🔍 Powerful Search & Filtering',
            description: 'Find exactly what you need! Search by Node ID, IP address, or version. Use filters to narrow by Status (Online/Degraded/Offline), Access Type (Public/Private), Version, and Country. You can also toggle between Table and Card views!',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[data-tour="node-table"]',
        popover: {
            title: '📋 Interactive Node Explorer',
            description: 'Explore all pNodes on the network! Each row shows Status (green=online, yellow=degraded, red=offline), Node ID, Uptime %, Credits earned, and Storage usage. Pro Tip: Click column headers to sort, or click any row for detailed analytics!',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="top-performers"]',
        popover: {
            title: '🏆 Top Performers Leaderboard',
            description: 'The best nodes ranked by credits! To join this elite list: maintain high uptime (99%+), provide reliable storage, and stay online consistently. Click "View All" to see the full leaderboard with more ranking categories!',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="copilot-button"]',
        popover: {
            title: '✨ AI Network Copilot',
            description: 'Your intelligent assistant! Ask questions like: "Which nodes have the highest uptime?", "What\'s the average credit score?", "Show me nodes in Germany", or "Compare node A with node B". The AI knows everything about the network!',
            side: 'left',
            align: 'end'
        }
    },
    {
        element: '[data-tour="price-ticker"]',
        popover: {
            title: '💰 Live XAND Price Ticker',
            description: 'Real-time XAND token price from Jupiter DEX! Shows current price in USD, 24-hour price change, and a quick "Buy XAND" button. Stay updated on token value while monitoring your nodes!',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="tour-button"]',
        popover: {
            title: '❓ Need Help Anytime?',
            description: 'You can restart this tour anytime by clicking this button! Each page has its own guided walkthrough. You\'re all set! 🎉 Explore the dashboard and use the AI Copilot if you have questions!',
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
            description: 'Swipe horizontally to see all stats! These cards show: total active nodes, network uptime average, credits earned, storage capacity, and elite performers count. Tap any card for details!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="search-bar"]',
        popover: {
            title: '🔍 Search & Filter',
            description: 'Tap to search nodes by ID, IP, or version. Use the filter buttons to narrow results by status (Online/Offline), access type (Public/Private), and location!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-table"]',
        popover: {
            title: '📋 Node Cards',
            description: 'Browse all pNodes as easy-to-read cards! Each card shows status, uptime %, credits earned, and storage usage. Tap any card to view detailed analytics and historical data!',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="copilot-button"]',
        popover: {
            title: '✨ AI Assistant',
            description: 'Your personal network expert! Ask questions like "Show top performers", "What\'s the network health?", or "Find nodes in my country". The AI understands natural language!',
            side: 'left',
            align: 'end'
        }
    },
    {
        element: '[data-tour="price-ticker"]',
        popover: {
            title: '💰 XAND Price',
            description: 'Live token price from Jupiter DEX. Tap "Buy" to purchase XAND tokens directly!',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="tour-button"]',
        popover: {
            title: '❓ Help Anytime!',
            description: 'Tap this button on any page for a guided tour of its features. Happy exploring! 🎉',
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
            title: '🏆 Welcome to the Leaderboard!',
            description: 'Discover the top-performing pNodes on the Xandeum network! This page ranks nodes by official credits earned through the heartbeat system. It\'s updated in real-time.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="leaderboard-stats"]',
        popover: {
            title: '📊 Ranked Nodes Count',
            description: 'This shows how many nodes currently have credits and are eligible for ranking. Only nodes with earned credits appear on the leaderboard.',
            side: 'left',
            align: 'center'
        }
    },
    {
        element: '[data-tour="leaderboard-tabs"]',
        popover: {
            title: '📑 Ranking Categories',
            description: 'Switch between different leaderboards: "Credit Score" ranks by total credits earned, "Uptime" shows the most reliable nodes, "Storage" lists top capacity providers, and "Longevity" features nodes with longest continuous operation.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="leaderboard-list"]',
        popover: {
            title: '🥇 Top 20 Performers',
            description: 'Each entry shows the node\'s rank, ID, location, version, and earned badges. Gold/Silver/Bronze crowns mark the top 3! Click any node to view its detailed analytics. Use the heart button to add nodes to your watchlist.',
            side: 'top',
            align: 'center'
        }
    }
];

// Leaderboard tour steps - Mobile
const leaderboardTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="leaderboard-header"]',
        popover: {
            title: '🏆 Credits Leaderboard',
            description: 'Discover top-performing pNodes on Xandeum! Rankings are based on official credits earned through the network\'s heartbeat system.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="leaderboard-tabs"]',
        popover: {
            title: '📑 Switch Categories',
            description: 'Tap tabs to view different rankings: Overall (credits), Uptime (reliability), Storage (capacity), and Longevity (continuous operation time).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="leaderboard-list"]',
        popover: {
            title: '🥇 Top Performers',
            description: 'Crown icons mark the top 3 nodes! Tap any entry to see detailed analytics. Use the heart button to save favorites to your watchlist.',
            side: 'top',
            align: 'center'
        }
    }
];

// Map tour steps - Desktop
const mapTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="map-stats"]',
        popover: {
            title: '📊 Network Overview Bar',
            description: 'Key metrics at a glance! See Total Nodes active on the network, the number of Countries with nodes, total Storage Capacity across all nodes, and Average Uptime percentage.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="world-map"]',
        popover: {
            title: '🗺️ Interactive 3D Globe',
            description: 'The globe visualizes all pNode locations worldwide! Each glowing point represents a node. Drag to rotate the globe, scroll to zoom in/out. Click on any marker to see that node\'s details including uptime, storage, and status.',
            side: 'left',
            align: 'center'
        }
    },
    {
        element: '[data-tour="map-regions"]',
        popover: {
            title: '🌍 Regional Breakdown',
            description: 'Scroll down to explore nodes organized by region! Each card shows a country with its node count, total storage, and health status. Click any region to filter nodes from that location.',
            side: 'top',
            align: 'center'
        }
    }
];

// Map tour steps - Mobile (sidebar is hidden, uses menu button)
const mapTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="world-map"]',
        popover: {
            title: '🗺️ Interactive Globe',
            description: 'Explore the Xandeum network worldwide! Each glowing point is a pNode. Drag to spin the globe, pinch to zoom. Tap any marker to see node details.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="map-regions"]',
        popover: {
            title: '🌍 Browse by Region',
            description: 'Scroll down to see nodes organized by country! Each card shows node count, storage, and health. Tap to explore nodes in that region.',
            side: 'top',
            align: 'center'
        }
    },
    {
        popover: {
            title: '💡 Pro Tip',
            description: 'Use two fingers to rotate the globe. The "LIVE" indicator at the bottom shows real-time data sync status!',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Compare tour steps - Desktop
const compareTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="compare-header"]',
        popover: {
            title: '⚖️ Node Comparison Tool',
            description: 'Compare up to 4 nodes side-by-side! This powerful tool helps you analyze which nodes perform best across key metrics like uptime, credits, health score, and storage.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="compare-search"]',
        popover: {
            title: '🔍 Select Nodes to Compare',
            description: 'Click "Add Node" to search by Node ID, location, or any keyword. Selected nodes appear as badges with color coding. You can add up to 4 nodes and remove any by clicking the X.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="compare-table"]',
        popover: {
            title: '📊 Performance Comparison Table',
            description: 'A detailed side-by-side comparison showing Status, 24h Uptime, Credits, Health Score, Storage, and Location. The "Avg" column shows network averages for reference.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="compare-heatmap"]',
        popover: {
            title: '🎨 Quick Compare Heatmap',
            description: 'Visual color-coded comparison! Green = above network average, Red = below average, Gray = around average. Makes it easy to spot the best performers at a glance.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="compare-ai"]',
        popover: {
            title: '✨ AI-Powered Analysis',
            description: 'Let the AI Copilot analyze your selected nodes! Click the button to get intelligent insights about which node is best for staking, their strengths and weaknesses.',
            side: 'top',
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
            description: 'Tap "Add Node" to search and select up to 4 nodes. Each gets a unique color for easy tracking.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="compare-heatmap"]',
        popover: {
            title: '🎨 Color-Coded Results',
            description: 'Green = above average, Red = below. Scroll horizontally to see all metrics. First row shows network averages for reference.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="compare-ai"]',
        popover: {
            title: '✨ Ask AI for Help',
            description: 'Tap to get an AI analysis of your selected nodes! The Copilot will tell you which node is the best choice.',
            side: 'top',
            align: 'center'
        }
    }
];

// Node details tour steps - Desktop
const nodeDetailsTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="node-header"]',
        popover: {
            title: '🖥️ Node Actions & Quick Info',
            description: 'This is your node\'s control center! Set up email alerts for status changes, estimate ROI in the calculator, or share this node. Status badges show Online/Offline, Public/Private, network (Devnet/Mainnet), and performance rating.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-metrics"]',
        popover: {
            title: '📊 Key Performance Metrics',
            description: 'Four critical stats at a glance: Uptime (24h reliability), Credits (earned from heartbeats), Storage (used vs total capacity), and Health Score (0-100). Each card shows your ranking compared to all network nodes!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-performance"]',
        popover: {
            title: '⚡ Performance Deep Dive',
            description: 'Three tabs for detailed analysis: Overview (network position chart, storage breakdown), System (CPU, RAM usage), and Network (IP, ports, active streams). Switch tabs to explore different metrics.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-ai-summary"]',
        popover: {
            title: '🤖 AI-Powered Analysis',
            description: 'Get intelligent insights about this node! Our AI analyzes performance, compares to network averages, and provides recommendations in plain language. Click "Refresh Analysis" for updated insights.',
            side: 'left',
            align: 'start'
        }
    }
];

// Node details tour steps - Mobile
const nodeDetailsTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="node-header"]',
        popover: {
            title: '🖥️ Node Identity',
            description: 'See status badges (Online/Offline, network, rating). Tap icons to set alerts, check ROI, or share this node.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-metrics"]',
        popover: {
            title: '📊 Key Metrics',
            description: 'Uptime, Credits, Storage, and Health Score. Each card shows your rank! Tap to see details.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-performance"]',
        popover: {
            title: '⚡ Performance Tabs',
            description: 'Swipe between Overview (position chart), System (CPU/RAM), and Network (IP info). Scroll down for more details.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="node-ai-summary"]',
        popover: {
            title: '🤖 AI Insights',
            description: 'Get AI-powered analysis of this node! Plain-language recommendations and comparisons to network averages.',
            side: 'top',
            align: 'center'
        }
    }
];

// Analytics tour steps - Desktop
const analyticsTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="analytics-header"]',
        popover: {
            title: '📊 Welcome to Network Analytics',
            description: 'Your deep-dive command center for Xandeum network insights! Here you can analyze performance trends, monitor health metrics, and understand network behavior over time.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="analytics-credits-chart"]',
        popover: {
            title: '📈 Credits History Chart',
            description: 'Track how credits have evolved over time. This chart shows the historical trend of average credits across the network. Use the time range selector to view 24h, 7d, or 30d data. Hover over points for exact values!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="analytics-health-score"]',
        popover: {
            title: '💚 Network Health Score',
            description: 'The overall health grade of the Xandeum network! This score is calculated from multiple factors: node uptime, response times, storage availability, and credit distribution. Green = Healthy, Yellow = Degraded, Red = Critical.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="analytics-stats"]',
        popover: {
            title: '📋 Quick Stats Cards',
            description: 'Key network metrics at a glance: Total active nodes, average credits per node, elite performers (99.5%+ uptime), and total storage capacity. These update in real-time!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="analytics-ai-summary"]',
        popover: {
            title: '🤖 AI-Powered Network Summary',
            description: 'Our intelligent AI analyzes the entire network and provides a human-readable summary of current conditions, trends, and notable observations. This updates periodically with fresh insights!',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '[data-tour="analytics-alerts"]',
        popover: {
            title: '⚠️ Network Alerts Panel',
            description: 'Monitor active issues and alerts across the network. See which nodes are experiencing problems, degraded performance, or require attention. Click any alert to investigate the affected node.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '[data-tour="analytics-charts"]',
        popover: {
            title: '📊 Charts & Distributions',
            description: 'Scroll down to explore more: Geographic distribution shows where nodes are located, Uptime distribution reveals reliability patterns, Version chart shows software adoption, and Badge distribution displays performance tiers!',
            side: 'top',
            align: 'center'
        }
    }
];

// Analytics tour steps - Mobile
const analyticsTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="analytics-header"]',
        popover: {
            title: '📊 Network Analytics',
            description: 'Deep-dive into Xandeum network performance! Scroll down to explore charts, health scores, and real-time statistics.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="analytics-credits-chart"]',
        popover: {
            title: '📈 Credits History',
            description: 'Track credits over time! Use the time selector (24h/7d/30d) to change the view. Tap on the chart for details.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="analytics-health-score"]',
        popover: {
            title: '💚 Health Score',
            description: 'Overall network health grade based on uptime, response times, and storage. Green = Healthy!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="analytics-ai-summary"]',
        popover: {
            title: '🤖 AI Summary',
            description: 'Our AI analyzes the network and provides insights in plain language. Check back often for updated observations!',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '[data-tour="analytics-charts"]',
        popover: {
            title: '📊 More Charts Below',
            description: 'Keep scrolling to see geographic distribution, uptime patterns, version adoption, and performance badges!',
            side: 'top',
            align: 'center'
        }
    }
];

// Watchlist tour steps - Desktop
const watchlistTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="watchlist-header"]',
        popover: {
            title: '⭐ Your Personal Watchlist',
            description: 'Welcome to your watchlist! Here you can view all the nodes you\'ve saved for quick monitoring. Track your favorite nodes\' performance without searching for them each time.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="watchlist-nodes"]',
        popover: {
            title: '📋 Saved Nodes Overview',
            description: 'Each card shows your saved node\'s key stats: status, uptime percentage, credits earned, and storage capacity. Click any card to view full analytics. Click the heart icon to remove a node from your watchlist.',
            side: 'top',
            align: 'center'
        }
    },
    {
        popover: {
            title: '💡 Pro Tip: Adding Nodes',
            description: 'To add more nodes to your watchlist, go to the Dashboard or any Node Details page and click the heart icon next to any node you want to track!',
            side: 'bottom',
            align: 'center'
        }
    }
];

// Watchlist tour steps - Mobile
const watchlistTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="watchlist-header"]',
        popover: {
            title: '⭐ Your Watchlist',
            description: 'All your saved nodes in one place! Monitor their status, uptime, and credits at a glance.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="watchlist-nodes"]',
        popover: {
            title: '📋 Tap to Explore',
            description: 'Tap any card for full node details. Tap the heart icon to remove from watchlist. Add more nodes from the Dashboard!',
            side: 'top',
            align: 'center'
        }
    }
];

// Operators tour steps - Desktop
const operatorsTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="operators-header"]',
        popover: {
            title: '👥 Welcome to Operators',
            description: 'Explore the fleet managers of Xandeum! This page shows all operators who run pNodes on the network. Operators are ranked by the number of registered nodes they manage.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="operators-stats"]',
        popover: {
            title: '📊 Network Statistics',
            description: 'Key metrics at a glance: Active Operators (those with registered nodes), Registered Nodes (on-chain identity), Unregistered Nodes (no on-chain identity, not earning credits), and Total Credits earned by all operators.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="operators-search"]',
        popover: {
            title: '🔍 Search & View Options',
            description: 'Search for specific operators by their wallet address. Use the view toggle to switch between Card view (visual) and List view (compact table).',
            side: 'left',
            align: 'center'
        }
    },
    {
        element: '[data-tour="operators-list"]',
        popover: {
            title: '📋 Operator Registry',
            description: 'Each card shows the operator\'s wallet address, network (Mainnet/Devnet/Both), node count, fleet share, and total credits. Click "View Details" to see all nodes managed by that operator!',
            side: 'top',
            align: 'center'
        }
    }
];

// Operators tour steps - Mobile
const operatorsTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="operators-header"]',
        popover: {
            title: '👥 Operators Overview',
            description: 'Explore Xandeum fleet managers! Operators run and manage pNodes on the network.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="operators-stats"]',
        popover: {
            title: '📊 Key Stats',
            description: 'Active operators, registered vs unregistered nodes, and total credits earned. Scroll to see all stats.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="operators-list"]',
        popover: {
            title: '📋 Tap for Details',
            description: 'Each card shows operator address, network, and node count. Tap any card to see all nodes they manage!',
            side: 'top',
            align: 'center'
        }
    }
];

// Calculator tour steps - Desktop
const calculatorTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="calculator-inputs"]',
        popover: {
            title: '🧮 pNode ROI Calculator',
            description: 'Welcome! This tool is for pNode operators who run storage nodes on Xandeum. Estimate your potential earnings based on node configuration, stake amount, and performance boosts.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="roi-inputs"]',
        popover: {
            title: '⚙️ Configuration Panel',
            description: 'Set your parameters: Number of nodes you operate, storage capacity per node (in GB), your XAND stake amount, and any applicable boost multipliers. The calculator updates in real-time!',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '[data-tour="roi-results"]',
        popover: {
            title: '💰 Estimated Rewards',
            description: 'See your potential earnings! Shows monthly and annual estimates from the fixed 10,000 XAND/month allocation plus your share of Storage Income (STOINC) from network fees. Rewards vary based on network participation.',
            side: 'left',
            align: 'start'
        }
    }
];

// Calculator tour steps - Mobile
const calculatorTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="calculator-inputs"]',
        popover: {
            title: '🧮 pNode ROI Calculator',
            description: 'For pNode operators! Estimate your earnings based on nodes, storage, stake, and boosts.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="roi-inputs"]',
        popover: {
            title: '⚙️ Set Your Parameters',
            description: 'Enter: node count, storage (GB), stake amount, and boosts. Results update instantly!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="roi-results"]',
        popover: {
            title: '💰 Your Estimated Earnings',
            description: 'See monthly and annual projections. Includes fixed XAND allocation + STOINC from network fees!',
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

// Widgets tour steps - Desktop
const widgetsTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="widgets-header"]',
        popover: {
            title: '🧩 Embeddable Widgets',
            description: 'Welcome to the Widget Gallery! Add live Xandeum network statistics to your own website with our easy-to-use embeddable widgets. No coding experience required!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="widgets-instructions"]',
        popover: {
            title: '📋 How to Use',
            description: 'It\'s simple: 1) Choose a widget below, 2) Copy the embed code, 3) Paste it into your website\'s HTML, 4) The widget automatically updates with live data!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="widgets-gallery"]',
        popover: {
            title: '🎨 Available Widgets',
            description: 'Each card shows a live preview and copy-paste embed code. Available widgets: Network Badge (compact stats), Network Ticker (scrolling stats), Node Status Card (single node info), and Top 5 Leaderboard.',
            side: 'top',
            align: 'center'
        }
    }
];

// Widgets tour steps - Mobile
const widgetsTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="widgets-header"]',
        popover: {
            title: '🧩 Embeddable Widgets',
            description: 'Add live Xandeum stats to your website! Copy-paste embed codes for instant integration.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="widgets-gallery"]',
        popover: {
            title: '🎨 Choose a Widget',
            description: 'Each card has a live preview and embed code. Tap "Copy" to get the code, then paste into your site!',
            side: 'top',
            align: 'center'
        }
    }
];

// Bots tour steps - Desktop
const botsTourStepsDesktop: DriveStep[] = [
    {
        element: '[data-tour="bots-header"]',
        popover: {
            title: '🤖 pNode Watch Bots',
            description: 'Get Xandeum network updates directly in Telegram or Discord! Our bots provide real-time stats, XAND token prices, and node information without leaving your chat app.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="bots-cards"]',
        popover: {
            title: '📱 Choose Your Platform',
            description: 'Telegram Bot (@xpnodewatch_bot): Add to any chat for instant network stats. Discord Bot: Invite to your server with slash command support. Both are free and available 24/7!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="bots-commands"]',
        popover: {
            title: '⌨️ Available Commands',
            description: 'Use /help to see all commands. Key ones: /stats for network overview, /price for XAND token price, /node <id> for specific node details, /top for leaderboard. Works on both platforms!',
            side: 'top',
            align: 'center'
        }
    }
];

// Bots tour steps - Mobile
const botsTourStepsMobile: DriveStep[] = [
    {
        element: '[data-tour="bots-header"]',
        popover: {
            title: '🤖 pNode Watch Bots',
            description: 'Get Xandeum updates in Telegram or Discord! Free, real-time stats and XAND prices.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="bots-cards"]',
        popover: {
            title: '📱 Add to Your Chat',
            description: 'Telegram: @xpnodewatch_bot. Discord: Click "Add to Discord". Both support slash commands!',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '[data-tour="bots-commands"]',
        popover: {
            title: '⌨️ Top Commands',
            description: '/stats, /price, /node <id>, /top. Use /help to see the full list!',
            side: 'top',
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
    if (pathname === '/operators') {
        return mobile ? operatorsTourStepsMobile : operatorsTourStepsDesktop;
    }
    if (pathname === '/widgets') {
        return mobile ? widgetsTourStepsMobile : widgetsTourStepsDesktop;
    }
    if (pathname === '/bots') {
        return mobile ? botsTourStepsMobile : botsTourStepsDesktop;
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
export const operatorsTourSteps = operatorsTourStepsDesktop;
export const widgetsTourSteps = widgetsTourStepsDesktop;
export const botsTourSteps = botsTourStepsDesktop;
