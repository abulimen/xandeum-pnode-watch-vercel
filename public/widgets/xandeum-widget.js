/**
 * Xandeum Network Widget - Embeddable Script
 * Uses Shadow DOM for complete style isolation from host page
 * 
 * Usage:
 *   <div id="xandeum-badge"></div>
 *   <script src="YOUR_DOMAIN/widgets/xandeum-widget.js"></script>
 *   <script>XandeumWidget.badge('xandeum-badge');</script>
 * 
 * Or for ticker:
 *   <div id="xandeum-ticker"></div>
 *   <script src="YOUR_DOMAIN/widgets/xandeum-widget.js"></script>
 *   <script>XandeumWidget.ticker('xandeum-ticker');</script>
 */

(function () {
    'use strict';

    // Auto-detect the base URL from the script's src attribute
    function getBaseUrl() {
        const scripts = document.querySelectorAll('script[src*="xandeum-widget.js"]');
        if (scripts.length > 0) {
            const src = scripts[scripts.length - 1].src;
            // Extract base URL (everything before /widgets/)
            const match = src.match(/^(https?:\/\/[^\/]+)/);
            if (match) {
                return match[1];
            }
        }
        // Fallback to current page origin
        return window.location.origin;
    }

    const BASE_URL = getBaseUrl();
    const API_URL = BASE_URL + '/api/stats';
    const DASHBOARD_URL = BASE_URL;
    const widgetStates = {}; // { containerId: { type: 'badge', network: 'all' } }

    // Format bytes using 1024-based calculation
    function formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        let value = bytes;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }
        return value.toFixed(1) + ' ' + units[unitIndex];
    }

    // Format duration
    function formatDuration(seconds) {
        if (!seconds) return '0m';
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);

        if (d > 0) return `${d}d ${h}h`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }

    // Fetch network stats
    async function fetchStats(network = 'all') {
        try {
            const url = network === 'all'
                ? API_URL
                : `${API_URL}?network=${network}`;

            const response = await fetch(url);
            const result = await response.json();
            if (result.success && result.data) {
                return result.data;
            }
            return null;
        } catch (e) {
            console.error('[Xandeum Widget] Failed to fetch stats:', e);
            return null;
        }
    }

    // Create toggle HTML
    function createToggleHtml(currentNetwork, containerId) {
        const networks = [
            { id: 'devnet', label: 'Dev' },
            { id: 'mainnet', label: 'Main' },
            { id: 'all', label: 'All' }
        ];

        return `
            <div class="xw-toggle" onclick="event.stopPropagation()">
                ${networks.map(n => `
                    <button 
                        class="xw-toggle-btn ${currentNetwork === n.id ? 'active' : ''}" 
                        data-network="${n.id}"
                        data-container="${containerId}"
                    >${n.label}</button>
                `).join('')}
            </div>
        `;
    }

    const toggleStyles = `
        .xw-toggle {
            display: inline-flex;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 20px;
            padding: 2px;
            border: 1px solid rgba(148, 163, 184, 0.1);
            margin-left: auto;
            pointer-events: auto;
        }
        .xw-toggle-btn {
            background: transparent;
            border: none;
            color: #64748b;
            font-family: inherit;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 8px;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.2s;
            line-height: 1.4;
        }
        .xw-toggle-btn:hover {
            color: #94a3b8;
        }
        .xw-toggle-btn.active {
            background: #6366f1;
            color: white;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
    `;

    // Update widget network
    async function updateWidgetNetwork(containerId, network) {
        if (widgetStates[containerId]) {
            widgetStates[containerId].network = network;

            // Re-init with new network
            const container = document.getElementById(containerId);
            if (container) {
                if (widgetStates[containerId].type === 'nodeStatus') {
                    await initNodeStatusWidget(containerId, widgetStates[containerId].nodeId);
                } else {
                    await initWidget(containerId, widgetStates[containerId].type);
                }
            }
        }
    }

    // Bind toggle events
    function bindToggleEvents(container, containerId) {
        const shadow = container.shadowRoot;
        if (!shadow) return;

        const btns = shadow.querySelectorAll('.xw-toggle-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const network = btn.dataset.network;
                updateWidgetNetwork(containerId, network);
            });
        });
    }

    // Helper to update Shadow DOM
    function updateShadowRoot(container, html, styles) {
        let shadow = container.shadowRoot;
        if (!shadow) {
            container.innerHTML = '';
            shadow = container.attachShadow({ mode: 'open' });
        }
        shadow.innerHTML = `<style>${styles}</style>${html}`;
    }

    // Create badge widget
    function createBadgeWidget(container, stats, containerId) {
        const state = widgetStates[containerId] || { network: 'all' };
        const healthScore = stats.totalNodes > 0
            ? Math.round((stats.onlineNodes / stats.totalNodes) * 100)
            : 0;
        const healthClass = healthScore >= 90 ? 'excellent' : healthScore >= 70 ? 'good' : 'warning';

        const html = `
            <div class="xw-badge-container">
                <div class="xw-badge">
                    <div class="xw-badge-header">
                        <img src="${BASE_URL}/logo.png" alt="Xandeum" class="xw-logo-icon" />
                        <span class="xw-brand">PNODE WATCH</span>
                        ${createToggleHtml(state.network, containerId)}
                    </div>
                    <a href="${DASHBOARD_URL}" target="_blank" rel="noopener noreferrer" class="xw-badge-link">
                        <div class="xw-stats-grid">
                            <div class="xw-stat">
                                <span class="xw-stat-value">${stats.totalNodes}</span>
                                <span class="xw-stat-label">Nodes</span>
                            </div>
                            <div class="xw-stat">
                                <span class="xw-stat-value xw-online">${stats.onlineNodes}</span>
                                <span class="xw-stat-label">Online</span>
                            </div>
                            <div class="xw-stat">
                                <span class="xw-stat-value">${stats.avgUptime.toFixed(1)}%</span>
                                <span class="xw-stat-label">Uptime</span>
                            </div>
                        </div>
                        <div class="xw-health">
                            <div class="xw-health-header">
                                <span class="xw-health-label">Network Health</span>
                                <span class="xw-health-value ${healthClass}">${healthScore}%</span>
                            </div>
                            <div class="xw-health-bar">
                                <div class="xw-health-fill ${healthClass}" style="width: ${healthScore}%"></div>
                            </div>
                        </div>
                        <div class="xw-footer">
                            <span class="xw-elite">🏆 ${stats.eliteNodes || 0} Elite</span>
                            <span class="xw-powered">Xandeum Network</span>
                        </div>
                    </a>
                </div>
            </div>
        `;

        const styles = `
            :host { display: block; font-family: 'Inter', system-ui, sans-serif; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            .xw-badge-link { text-decoration: none; display: block; color: inherit; }
            .xw-badge-container { display: flex; justify-content: center; } 
            .xw-badge {
                width: 280px; max-width: 100%; padding: 20px;
                background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
                border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.2);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                position: relative; overflow: hidden;
            }
            .xw-badge::before {
                content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
                background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
            }
            .xw-badge-header {
                display: flex; align-items: center; gap: 10px;
                margin-bottom: 18px; padding-bottom: 14px;
                border-bottom: 1px solid rgba(100, 116, 139, 0.2);
            }
            .xw-logo-icon { width: 26px; height: 26px; object-fit: contain; }
            .xw-brand {
                font-size: 14px; font-weight: 700; letter-spacing: 1px;
                background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            }
            .xw-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
            .xw-stat {
                display: flex; flex-direction: column; align-items: center; gap: 4px;
                padding: 12px 8px; background: rgba(15, 23, 42, 0.6);
                border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.1);
            }
            .xw-stat-value { font-size: 18px; font-weight: 700; color: #f1f5f9; }
            .xw-stat-value.xw-online { color: #10b981; }
            .xw-stat-label { font-size: 10px; font-weight: 500; color: #64748b; text-transform: uppercase; }
            .xw-health { margin-bottom: 16px; }
            .xw-health-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .xw-health-label { font-size: 11px; font-weight: 500; color: #94a3b8; text-transform: uppercase; }
            .xw-health-value { font-size: 13px; font-weight: 700; }
            .xw-health-value.excellent { color: #10b981; }
            .xw-health-value.good { color: #f59e0b; }
            .xw-health-value.warning { color: #ef4444; }
            .xw-health-bar { height: 6px; background: rgba(100, 116, 139, 0.2); border-radius: 3px; overflow: hidden; }
            .xw-health-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
            .xw-health-fill.excellent { background: #10b981; }
            .xw-health-fill.good { background: #f59e0b; }
            .xw-health-fill.warning { background: #ef4444; }
            .xw-footer { display: flex; justify-content: space-between; padding-top: 14px; border-top: 1px solid rgba(100, 116, 139, 0.15); }
            .xw-elite { font-size: 11px; font-weight: 500; color: #f59e0b; }
            .xw-powered { font-size: 10px; font-weight: 500; color: #475569; }
            
            ${toggleStyles}
        `;

        updateShadowRoot(container, html, styles);
        bindToggleEvents(container, containerId);
    }

    // Create ticker widget
    function createTickerWidget(container, stats, containerId) {
        const state = widgetStates[containerId] || { network: 'all' };
        const healthScore = stats.totalNodes > 0
            ? Math.round((stats.onlineNodes / stats.totalNodes) * 100)
            : 0;

        const toggleHtml = createToggleHtml(state.network, containerId);

        const html = `
            <div class="xw-ticker">
                <div class="xw-ticker-controls">
                    ${toggleHtml}
                </div>
                <div class="xw-ticker-track">
                    <div class="xw-ticker-content">
                        ${[0, 1].map(() => `
                            <div class="xw-ticker-items">
                                <div class="xw-ticker-item xw-brand-item">
                                    <img src="${BASE_URL}/logo.png" alt="Xandeum" class="xw-logo" />
                                    <span class="xw-brand-text">PNODE WATCH</span>
                                    <span class="xw-live-badge"><span class="xw-dot"></span>LIVE</span>
                                </div>
                                <div class="xw-divider"></div>
                                <div class="xw-ticker-item">
                                    <span class="xw-label">NODES</span>
                                    <span class="xw-value">${stats.totalNodes}</span>
                                </div>
                                <div class="xw-ticker-item">
                                    <span class="xw-label">ONLINE</span>
                                    <span class="xw-value xw-green">${stats.onlineNodes}</span>
                                </div>
                                <div class="xw-ticker-item">
                                    <span class="xw-label">STORAGE</span>
                                    <span class="xw-value">${formatBytes(stats.totalStorage)}</span>
                                </div>
                                <div class="xw-ticker-item">
                                    <span class="xw-label">UPTIME</span>
                                    <span class="xw-value xw-purple">${stats.avgUptime.toFixed(1)}%</span>
                                </div>
                                <div class="xw-ticker-item">
                                    <span class="xw-label">HEALTH</span>
                                    <span class="xw-value ${healthScore >= 90 ? 'xw-green' : healthScore >= 70 ? 'xw-amber' : 'xw-red'}">${healthScore}%</span>
                                </div>
                                <div class="xw-spacer"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const styles = `
            :host { display: block; width: 100%; font-family: 'Inter', system-ui, sans-serif; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            .xw-ticker {
                width: 100%; height: 48px; position: relative;
                background: linear-gradient(135deg, #0a0f1a 0%, #0f172a 100%);
                border-top: 1px solid rgba(99, 102, 241, 0.15);
                border-bottom: 1px solid rgba(99, 102, 241, 0.15);
                overflow: hidden;
            }
            .xw-ticker-controls {
                position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                z-index: 10; padding-left: 20px;
                background: linear-gradient(90deg, transparent, #0f172a 20%);
            }
            .xw-ticker-track { height: 100%; display: flex; align-items: center; }
            .xw-ticker-content { display: flex; animation: xw-scroll 40s linear infinite; }
            @keyframes xw-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .xw-ticker-items { display: flex; align-items: center; gap: 32px; padding: 0 24px; white-space: nowrap; }
            .xw-ticker-item { display: flex; align-items: center; gap: 8px; }
            .xw-brand-item { gap: 10px; }
            .xw-logo { width: 22px; height: 22px; }
            .xw-brand-text { font-size: 15px; font-weight: 700; background: linear-gradient(135deg, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .xw-live-badge { display: flex; align-items: center; gap: 5px; padding: 3px 8px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); border-radius: 4px; font-size: 10px; color: #10b981; }
            .xw-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; }
            .xw-divider { width: 1px; height: 24px; background: rgba(100,116,139,0.3); }
            .xw-label { font-size: 10px; font-weight: 600; color: #64748b; }
            .xw-value { font-size: 14px; font-weight: 600; color: #e2e8f0; }
            .xw-green { color: #10b981; } .xw-purple { color: #6366f1; }
            ${toggleStyles}
        `;

        updateShadowRoot(container, html, styles);
        bindToggleEvents(container, containerId);
    }

    // Loading state
    function showLoading(container, type) {
        const styles = `
            :host {
                display: block;
                font-family: 'Inter', -apple-system, sans-serif;
            }
            .xw-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: ${type === 'badge' ? '40px' : '12px'};
                background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
                border-radius: ${type === 'badge' ? '16px' : '0'};
                color: #64748b;
                font-size: 13px;
                font-weight: 500;
            }
            .xw-pulse {
                width: 8px;
                height: 8px;
                background: #6366f1;
                border-radius: 50%;
                animation: xw-pulse 1.5s ease-in-out infinite;
            }
            @keyframes xw-pulse {
                0%, 100% { opacity: 0.4; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `;
        const html = `
            <div class="xw-loading">
                <div class="xw-pulse"></div>
                <span>Connecting to Xandeum Network...</span>
            </div>
        `;
        // Use existing shadow root or create new one
        let shadow = container.shadowRoot;
        if (!shadow) {
            container.innerHTML = '';
            shadow = container.attachShadow({ mode: 'open' });
        }
        shadow.innerHTML = `<style>${styles}</style>${html}`;
    }

    // Error state
    function showError(container, type) {
        const styles = `
            :host {
                display: block;
                font-family: 'Inter', -apple-system, sans-serif;
            }
            .xw-error {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: ${type === 'badge' ? '40px' : '12px'};
                background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
                border-radius: ${type === 'badge' ? '16px' : '0'};
                color: #ef4444;
                font-size: 13px;
                font-weight: 500;
            }
        `;
        const html = `
            <div class="xw-error">
                <span>⚠️</span>
                <span>Unable to connect to Xandeum Network</span>
            </div>
        `;
        container.innerHTML = '';
        // Check if shadow root already exists
        if (container.shadowRoot) {
            container.shadowRoot.innerHTML = `<style>${styles}</style>${html}`;
        } else {
            const shadow = container.attachShadow({ mode: 'open' });
            shadow.innerHTML = `<style>${styles}</style>${html}`;
        }
    }

    // Initialize widget
    async function initWidget(containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[Xandeum Widget] Container not found:', containerId);
            return;
        }

        // Initialize state if checking for the first time
        if (!widgetStates[containerId]) {
            widgetStates[containerId] = { type, network: 'all' };
        } else {
            widgetStates[containerId].type = type;
        }

        showLoading(container, type);

        const stats = await fetchStats(widgetStates[containerId].network);

        if (!stats) {
            showError(container, type);
            return;
        }

        if (type === 'badge') {
            createBadgeWidget(container, stats, containerId);
        } else if (type === 'ticker') {
            createTickerWidget(container, stats, containerId);
        } else if (type === 'leaderboard') {
            createLeaderboardWidget(container, stats, containerId);
        } else {
            createBadgeWidget(container, stats, containerId);
        }

        // Auto-refresh every 60 seconds
        setInterval(async () => {
            const newStats = await fetchStats();
            if (newStats) {
                // Need to recreate since shadow DOM is already attached
                if (container.shadowRoot) {
                    if (type === 'badge') {
                        createBadgeContent(container.shadowRoot, newStats);
                    } else if (type === 'leaderboard') {
                        createLeaderboardWidget(container, newStats, containerId);
                    } else {
                        createTickerContent(container.shadowRoot, newStats);
                    }
                }
            }
        }, 60000);
    }

    // Update functions for refresh
    function createBadgeContent(shadowRoot, stats) {
        const healthScore = stats.totalNodes > 0
            ? Math.round((stats.onlineNodes / stats.totalNodes) * 100)
            : 0;
        const healthClass = healthScore >= 90 ? 'excellent' : healthScore >= 70 ? 'good' : 'warning';

        const badge = shadowRoot.querySelector('.xw-badge');
        if (badge) {
            const statsValues = badge.querySelectorAll('.xw-stat-value');
            if (statsValues[0]) statsValues[0].textContent = stats.totalNodes;
            if (statsValues[1]) statsValues[1].textContent = stats.onlineNodes;
            if (statsValues[2]) statsValues[2].textContent = stats.avgUptime.toFixed(1) + '%';

            const healthValue = badge.querySelector('.xw-health-value');
            if (healthValue) {
                healthValue.textContent = healthScore + '%';
                healthValue.className = 'xw-health-value ' + healthClass;
            }

            const healthFill = badge.querySelector('.xw-health-fill');
            if (healthFill) {
                healthFill.style.width = healthScore + '%';
                healthFill.className = 'xw-health-fill ' + healthClass;
            }

            const elite = badge.querySelector('.xw-elite');
            if (elite) elite.textContent = '🏆 ' + (stats.eliteNodes || 0) + ' Elite';
        }
    }

    function createTickerContent(shadowRoot, stats) {
        // For ticker, we'd need to update the values in place
        // This is more complex due to the animation, so for now just log
        console.log('[Xandeum Widget] Stats updated:', stats);
    }

    // Create leaderboard widget with Shadow DOM
    function createLeaderboardWidget(container, stats, containerId) {
        const state = widgetStates[containerId] || { network: 'all' };
        const topNodes = stats.topNodes || [];

        const getRankIcon = (rank) => {
            switch (rank) {
                case 1: return '🥇';
                case 2: return '🥈';
                case 3: return '🥉';
                default: return '#' + rank;
            }
        };

        const getScoreClass = (score) => {
            if (score >= 25000) return 'excellent';
            if (score >= 10000) return 'good';
            return 'warning';
        };

        const nodesHtml = topNodes.map(node => `
            <div class="xw-lb-item rank-${node.rank}">
                <span class="xw-lb-rank">${getRankIcon(node.rank)}</span>
                <div class="xw-lb-info">
                    <span class="xw-lb-id">${node.id}</span>
                    <span class="xw-lb-uptime">${formatDuration(node.uptimeSeconds)} online</span>
                </div>
                <span class="xw-lb-score ${getScoreClass(node.credits)}">${(node.credits || 0).toLocaleString()}</span>
            </div>
        `).join('');

        const html = `
            <div class="xw-leaderboard">
                <div class="xw-lb-header">
                    <img src="${BASE_URL}/logo.png" alt="Xandeum" class="xw-logo-icon" />
                    <span class="xw-lb-brand">TOP NODES</span>
                    ${createToggleHtml(state.network, containerId)}
                </div>
                <a href="${DASHBOARD_URL}/leaderboard" target="_blank" rel="noopener noreferrer" class="xw-lb-link">
                    <div class="xw-lb-list">
                        ${nodesHtml || '<div class="xw-lb-empty">No data available</div>'}
                    </div>
                </a>
                <div class="xw-lb-footer">
                    <span class="xw-lb-more">View Full Leaderboard →</span>
                    <span class="xw-lb-powered">Xandeum Network</span>
                </div>
            </div>
        `;

        const styles = `
            :host { display: block; font-family: 'Inter', system-ui, sans-serif; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            .xw-lb-link { text-decoration: none; display: block; color: inherit; }
            .xw-leaderboard {
                width: 300px; padding: 16px; background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
                border-radius: 14px; border: 1px solid rgba(245, 158, 11, 0.2);
                box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            }
            .xw-lb-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(100,116,139,0.2); }
            .xw-logo-icon { width: 22px; height: 22px; }
            .xw-lb-brand { font-size: 13px; font-weight: 700; background: linear-gradient(135deg, #f59e0b, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; flex: 1; }
            .xw-lb-list { display: flex; flex-direction: column; gap: 8px; min-height: 200px; }
            .xw-lb-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(15,23,42,0.4); border-radius: 8px; border: 1px solid rgba(100,116,139,0.1); }
            .xw-lb-rank { font-size: 14px; width: 20px; text-align: center; }
            .xw-lb-info { flex: 1; overflow: hidden; }
            .xw-lb-id { display: block; font-size: 12px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .xw-lb-uptime { display: block; font-size: 10px; color: #64748b; }
            .xw-lb-score { font-size: 12px; font-weight: 700; color: #f59e0b; }
            .xw-lb-footer { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(100,116,139,0.15); }
            .xw-lb-more { font-size: 11px; color: #6366f1; font-weight: 500; cursor: pointer; }
            .xw-lb-powered { font-size: 10px; color: #475569; }
            ${toggleStyles}
        `;

        updateShadowRoot(container, html, styles);
        bindToggleEvents(container, containerId);
    }

    // Create node status widget with Shadow DOM
    // NOTE: This widget displays a SINGLE node's status - NO network toggle needed
    function createNodeStatusWidget(container, node, containerId) {
        const formatBytes = (bytes) => {
            if (bytes >= 1e12) return (bytes / 1e12).toFixed(1) + ' TB';
            if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
            return (bytes / 1e6).toFixed(0) + ' MB';
        };

        const getScoreClass = (score) => {
            if (score >= 25000) return 'excellent';
            if (score >= 10000) return 'good';
            return 'warning';
        };

        const storagePercent = node.storage > 0 ? Math.round((node.storageUsed / node.storage) * 100) : 0;

        const html = `
            <div class="xw-node-status">
                <div class="xw-ns-header">
                    <img src="${BASE_URL}/logo.png" alt="Xandeum" class="xw-logo-icon" />
                    <span class="xw-ns-brand">NODE STATUS</span>
                </div>
                <a href="${DASHBOARD_URL}/nodes/${node.fullId}" target="_blank" rel="noopener noreferrer" class="xw-ns-link">
                    <div class="xw-ns-header-status">
                        <span class="xw-ns-status ${node.status}">
                            <span class="xw-ns-dot"></span>
                            ${node.status.toUpperCase()}
                        </span>
                    </div>
                    <div class="xw-ns-id-section">
                        <span class="xw-ns-id">${node.id}</span>
                    </div>
                    <div class="xw-ns-stats">
                        <div class="xw-ns-stat">
                            <span class="xw-ns-value">${formatDuration(node.uptimeSeconds)}</span>
                            <span class="xw-ns-label">ONLINE</span>
                        </div>
                        <div class="xw-ns-stat">
                            <span class="xw-ns-value ${getScoreClass(node.credits)}">${(node.credits || 0).toLocaleString()}</span>
                            <span class="xw-ns-label">CREDITS</span>
                        </div>
                        <div class="xw-ns-stat">
                            <span class="xw-ns-value">${formatBytes(node.storage)}</span>
                            <span class="xw-ns-label">STORAGE</span>
                        </div>
                    </div>
                    <div class="xw-ns-storage">
                        <div class="xw-ns-storage-header">
                            <span class="xw-ns-storage-label">Storage Usage</span>
                            <span class="xw-ns-storage-value">${storagePercent}%</span>
                        </div>
                        <div class="xw-ns-bar-bg">
                            <div class="xw-ns-bar-fill" style="width: ${storagePercent}%"></div>
                        </div>
                    </div>
                    <div class="xw-ns-footer">
                        <span class="xw-ns-version">v${node.version}</span>
                        <span class="xw-ns-powered">Xandeum Network</span>
                    </div>
                </a>
            </div>
        `;

        const styles = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            .xw-ns-link { text-decoration: none; display: block; color: inherit; }
            .xw-node-status {
                width: 280px;
                padding: 16px;
                background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
                border-radius: 14px;
                border: 1px solid rgba(99, 102, 241, 0.2);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                font-family: 'Inter', -apple-system, sans-serif;
                transition: all 0.3s ease;
            }
            .xw-node-status:hover {
                transform: translateY(-4px);
                border-color: rgba(99, 102, 241, 0.4);
            }
            .xw-ns-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(100, 116, 139, 0.2);
            }
            .xw-ns-header-status { display: flex; justify-content: flex-end; margin-bottom: 8px; }
            .xw-logo-icon {
                width: 20px;
                height: 20px;
                object-fit: contain;
            }
            .xw-ns-brand {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1.5px;
                background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                flex: 1;
            }
            .xw-ns-status {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 3px 8px;
                border-radius: 5px;
                font-size: 9px;
                font-weight: 600;
                letter-spacing: 1px;
            }
            .xw-ns-status.online {
                background: rgba(16, 185, 129, 0.12);
                border: 1px solid rgba(16, 185, 129, 0.25);
                color: #10b981;
            }
            .xw-ns-status.degraded {
                background: rgba(245, 158, 11, 0.12);
                border: 1px solid rgba(245, 158, 11, 0.25);
                color: #f59e0b;
            }
            .xw-ns-status.offline {
                background: rgba(239, 68, 68, 0.12);
                border: 1px solid rgba(239, 68, 68, 0.25);
                color: #ef4444;
            }
            .xw-ns-dot {
                width: 5px;
                height: 5px;
                background: currentColor;
                border-radius: 50%;
                animation: xw-blink 1.5s ease-in-out infinite;
            }
            @keyframes xw-blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
            .xw-ns-id-section {
                margin-bottom: 12px;
            }
            .xw-ns-id {
                font-size: 13px;
                font-weight: 600;
                font-family: 'SF Mono', monospace;
                color: #f1f5f9;
            }
            .xw-ns-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 12px;
            }
            .xw-ns-stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 3px;
                padding: 10px 6px;
                background: rgba(15, 23, 42, 0.6);
                border-radius: 8px;
                border: 1px solid rgba(100, 116, 139, 0.1);
            }
            .xw-ns-value {
                font-size: 14px;
                font-weight: 700;
                color: #f1f5f9;
            }
            .xw-ns-value.excellent { color: #10b981; }
            .xw-ns-value.good { color: #f59e0b; }
            .xw-ns-value.warning { color: #ef4444; }
            .xw-ns-label {
                font-size: 8px;
                font-weight: 500;
                letter-spacing: 0.5px;
                color: #64748b;
            }
            .xw-ns-storage { margin-bottom: 12px; }
            .xw-ns-storage-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            .xw-ns-storage-label {
                font-size: 9px;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .xw-ns-storage-value {
                font-size: 10px;
                font-weight: 600;
                color: #cbd5e1;
            }
            .xw-ns-bar-bg {
                height: 4px;
                background: rgba(100, 116, 139, 0.2);
                border-radius: 2px;
                overflow: hidden;
            }
            .xw-ns-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #6366f1, #8b5cf6);
                border-radius: 2px;
            }
            .xw-ns-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 10px;
                border-top: 1px solid rgba(100, 116, 139, 0.15);
            }
            .xw-ns-version {
                font-size: 10px;
                font-weight: 500;
                color: #64748b;
                font-family: 'SF Mono', monospace;
            }
            .xw-ns-powered { font-size: 9px; color: #475569; }
        `;

        updateShadowRoot(container, html, styles);
        // No toggle events for node status widget - it shows a single specific node
    }

    // Initialize node status widget
    async function initNodeStatusWidget(containerId, nodeId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[Xandeum Widget] Container not found:', containerId);
            return;
        }

        // Initialize state if checking for the first time
        if (!widgetStates[containerId]) {
            widgetStates[containerId] = { type: 'nodeStatus', network: 'all', nodeId };
        } else {
            widgetStates[containerId].type = 'nodeStatus';
            if (nodeId !== undefined) {
                widgetStates[containerId].nodeId = nodeId;
            }
        }

        showLoading(container, 'badge');

        const stats = await fetchStats(widgetStates[containerId].network);

        if (!stats || !stats.topNodes || stats.topNodes.length === 0) {
            showError(container, 'badge');
            return;
        }

        // Find node by ID, or use first top node if no ID specified
        let node = null;
        if (nodeId) {
            node = stats.topNodes.find(n => n.fullId === nodeId || n.id === nodeId || n.fullId.includes(nodeId));
        }
        if (!node) {
            // Use first ranked node as default
            node = stats.topNodes[0];
        }

        createNodeStatusWidget(container, node, containerId);

        // Auto-refresh every 60 seconds
        setInterval(async () => {
            const newStats = await fetchStats(widgetStates[containerId].network);
            if (newStats && newStats.topNodes && newStats.topNodes.length > 0) {
                let refreshNode = null;
                if (nodeId) {
                    refreshNode = newStats.topNodes.find(n => n.fullId === nodeId || n.id === nodeId || n.fullId.includes(nodeId));
                }
                if (!refreshNode) {
                    refreshNode = newStats.topNodes[0];
                }
                createNodeStatusWidget(container, refreshNode, containerId);
            }
        }, 60000);
    }

    // Expose global API
    window.XandeumWidget = {
        badge: function (containerId) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => initWidget(containerId, 'badge'));
            } else {
                initWidget(containerId, 'badge');
            }
        },
        ticker: function (containerId) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => initWidget(containerId, 'ticker'));
            } else {
                initWidget(containerId, 'ticker');
            }
        },
        nodeStatus: function (containerId, nodeId) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => initNodeStatusWidget(containerId, nodeId));
            } else {
                initNodeStatusWidget(containerId, nodeId);
            }
        },
        leaderboard: function (containerId) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => initWidget(containerId, 'leaderboard'));
            } else {
                initWidget(containerId, 'leaderboard');
            }
        }
    };

    console.log('[Xandeum Widget] Loaded from ' + BASE_URL + '. Available methods: badge, ticker, nodeStatus, leaderboard');
})();
