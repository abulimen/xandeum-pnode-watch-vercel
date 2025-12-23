/**
 * Shared Bot Command Handlers
 * Used by both Telegram and Discord bots
 */

// Types for handler responses
export interface BotResponse {
    text: string;
    markdown?: boolean;
}

// Fetch network stats from our API
async function fetchNetworkStats(baseUrl: string) {
    try {
        const res = await fetch(`${baseUrl}/api/prpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'get-pods-with-stats' }),
            cache: 'no-store'
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data.success && data.data?.pods) {
            const pods = data.data.pods;
            const maxTimestamp = Math.max(...pods.map((p: any) => p.last_seen_timestamp || 0));

            let online = 0, degraded = 0, offline = 0;
            pods.forEach((p: any) => {
                const diff = maxTimestamp - (p.last_seen_timestamp || 0);
                if (diff <= 60) online++;
                else if (diff <= 300) degraded++;
                else offline++;
            });

            return {
                total: pods.length,
                online,
                degraded,
                offline,
                onlinePercent: ((online / pods.length) * 100).toFixed(1)
            };
        }
    } catch (e) {
        console.error('[bot] Failed to fetch network stats:', e);
    }
    return null;
}

// Fetch token price
async function fetchTokenPrice(baseUrl: string) {
    try {
        const res = await fetch(`${baseUrl}/api/token`, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('[bot] Failed to fetch token price:', e);
    }
    return null;
}

// Fetch node by ID
async function fetchNode(baseUrl: string, nodeId: string) {
    try {
        const res = await fetch(`${baseUrl}/api/prpc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'get-pods-with-stats' }),
            cache: 'no-store'
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data.success && data.data?.pods) {
            const node = data.data.pods.find((p: any) =>
                p.pubkey?.toLowerCase().includes(nodeId.toLowerCase()) ||
                p.address?.includes(nodeId)
            );
            return node || null;
        }
    } catch (e) {
        console.error('[bot] Failed to fetch node:', e);
    }
    return null;
}

// Fetch top nodes by credits
async function fetchTopNodes(baseUrl: string, count: number = 5) {
    try {
        const [prpcRes, creditsRes] = await Promise.all([
            fetch(`${baseUrl}/api/prpc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: 'get-pods-with-stats' }),
                cache: 'no-store'
            }),
            fetch(`${baseUrl}/api/credits`, { cache: 'no-store' })
        ]);

        if (!prpcRes.ok || !creditsRes.ok) return null;

        const prpcData = await prpcRes.json();
        const creditsData = await creditsRes.json();

        if (!prpcData.success || !prpcData.data?.pods) return null;

        const creditsMap: Record<string, number> = {};
        if (creditsData.status === 'success' && creditsData.pods_credits) {
            creditsData.pods_credits.forEach((c: any) => {
                if (c.pod_id) creditsMap[c.pod_id] = c.credits || 0;
            });
        }

        const nodesWithCredits = prpcData.data.pods.map((p: any) => ({
            ...p,
            credits: creditsMap[p.pubkey] || 0
        }));

        return nodesWithCredits
            .sort((a: any, b: any) => b.credits - a.credits)
            .slice(0, count);
    } catch (e) {
        console.error('[bot] Failed to fetch top nodes:', e);
    }
    return null;
}

// Command Handlers

export async function handleStart(): Promise<BotResponse> {
    return {
        text: `🌐 *Xandeum pNode Watch Bot*

Welcome! I can help you monitor the Xandeum network.

*Available Commands:*
/stats - Network overview
/price - XAND token price
/node <id> - Node details
/top [n] - Top nodes by credits
/help - Show this message`,
        markdown: true
    };
}

export async function handleStats(baseUrl: string): Promise<BotResponse> {
    const stats = await fetchNetworkStats(baseUrl);

    if (!stats) {
        return { text: '❌ Failed to fetch network stats. Please try again later.' };
    }

    return {
        text: `📊 *Xandeum Network Stats*

🖥️ *Total Nodes:* ${stats.total}
🟢 *Online:* ${stats.online} (${stats.onlinePercent}%)
🟡 *Degraded:* ${stats.degraded}
🔴 *Offline:* ${stats.offline}

🔗 [View Dashboard](${baseUrl})`,
        markdown: true
    };
}

export async function handlePrice(baseUrl: string): Promise<BotResponse> {
    const data = await fetchTokenPrice(baseUrl);

    if (!data || !data.price) {
        return { text: '❌ Failed to fetch token price. Please try again later. --> ' + baseUrl };
    }

    const changeEmoji = data.change24h >= 0 ? '📈' : '📉';
    const changeSign = data.change24h >= 0 ? '+' : '';

    return {
        text: `💰 *XAND Token Price*

💵 *Price:* $${data.price.toFixed(6)}
${changeEmoji} *24h Change:* ${changeSign}${data.change24h?.toFixed(2) || 0}%
📊 *Market Cap:* $${(data.marketCap || 0).toLocaleString()}

🔗 [Trade XAND](${baseUrl}/trade)`,
        markdown: true
    };
}

export async function handleNode(baseUrl: string, nodeId: string): Promise<BotResponse> {
    if (!nodeId) {
        return { text: '❌ Please provide a node ID. Usage: /node <id>' };
    }

    const node = await fetchNode(baseUrl, nodeId);

    if (!node) {
        return { text: `❌ Node not found: ${nodeId}` };
    }

    const shortId = node.pubkey?.substring(0, 8) || 'Unknown';

    return {
        text: `🖥️ *Node ${shortId}*

📍 *Address:* \`${node.address}\`
🔑 *Public Key:* \`${node.pubkey?.substring(0, 16)}...\`
📦 *Version:* ${node.version || 'Unknown'}
⏱️ *Uptime:* ${Math.round((node.uptime || 0) / 3600)}h
💾 *Storage:* ${((node.storage_committed || 0) / (1024 ** 3)).toFixed(2)} GB

🔗 [View Details](${baseUrl}/nodes/${node.pubkey})`,
        markdown: true
    };
}

export async function handleTop(baseUrl: string, count: number = 5): Promise<BotResponse> {
    const nodes = await fetchTopNodes(baseUrl, Math.min(count, 10));

    if (!nodes || nodes.length === 0) {
        return { text: '❌ Failed to fetch top nodes. Please try again later.' };
    }

    const list = nodes.map((n: any, i: number) => {
        const shortId = n.pubkey?.substring(0, 8) || 'Unknown';
        return `${i + 1}. \`${shortId}\` - ${n.credits.toLocaleString()} credits`;
    }).join('\n');

    return {
        text: `🏆 *Top ${nodes.length} Nodes by Credits*

${list}

🔗 [View Leaderboard](${baseUrl}/leaderboard)`,
        markdown: true
    };
}
