/**
 * Database Query Functions for Supabase
 * Provides typed async query functions for the analytics database
 */

import { getSupabase, isSupabaseConfigured } from './index';

// Types
export interface SnapshotRecord {
    id: number;
    timestamp: string;
    network: 'mainnet' | 'devnet';
    total_nodes: number;
    online_nodes: number;
    degraded_nodes: number;
    offline_nodes: number;
    total_storage_bytes: number;
    used_storage_bytes: number;
    avg_uptime: number;
    avg_staking_score: number;
    total_credits: number;
    avg_credits: number;
}

export interface NodeSnapshotRecord {
    id: number;
    snapshot_id: number;
    node_id: string;
    public_key: string | null;
    status: string;
    uptime_percent: number;
    storage_usage_percent: number;
    staking_score: number;
    credits: number;
    version: string | null;
    is_public: boolean;
}

export interface AlertSubscription {
    id: number;
    email: string | null;
    push_endpoint: string | null;
    push_p256dh: string | null;
    push_auth: string | null;
    node_ids: string[]; // JSON array stored as JSONB
    alert_offline: boolean;
    alert_score_drop: boolean;
    score_threshold: number;
    created_at: string;
    verified: boolean;
}

export interface UserAlert {
    id: number;
    subscription_id: number;
    node_id: string;
    alert_type: string;
    title: string;
    message: string;
    created_at: string;
    read: boolean;
}

// ================== SNAPSHOT QUERIES ==================

/**
 * Create a new network snapshot
 */
export async function createSnapshot(data: {
    network?: 'mainnet' | 'devnet';
    total_nodes: number;
    online_nodes: number;
    degraded_nodes: number;
    offline_nodes: number;
    total_storage_bytes: number;
    used_storage_bytes: number;
    avg_uptime: number;
    avg_staking_score: number;
    total_credits: number;
    avg_credits: number;
}): Promise<number> {
    const supabase = getSupabase();

    const insertData = {
        ...data,
        network: data.network || 'devnet',
    };

    const { data: result, error } = await supabase
        .from('snapshots')
        .insert(insertData)
        .select('id')
        .single();

    if (error) {
        console.error('[db] createSnapshot error:', error);
        throw new Error(`Failed to create snapshot: ${error.message}`);
    }

    return result.id;
}

/**
 * Insert node snapshot data (batch insert)
 */
export async function insertNodeSnapshots(snapshotId: number, nodes: Array<{
    node_id: string;
    public_key?: string;
    status: string;
    uptime_percent: number;
    storage_usage_percent: number;
    staking_score: number;
    credits: number;
    version?: string;
    is_public: boolean;
}>): Promise<void> {
    const supabase = getSupabase();

    const insertData = nodes.map(node => ({
        snapshot_id: snapshotId,
        node_id: node.node_id,
        public_key: node.public_key || null,
        status: node.status,
        uptime_percent: node.uptime_percent,
        storage_usage_percent: node.storage_usage_percent,
        staking_score: node.staking_score,
        credits: node.credits,
        version: node.version || null,
        is_public: node.is_public,
    }));

    // Batch insert in chunks of 500 to avoid payload limits
    const chunkSize = 500;
    for (let i = 0; i < insertData.length; i += chunkSize) {
        const chunk = insertData.slice(i, i + chunkSize);
        const { error } = await supabase.from('node_snapshots').insert(chunk);
        if (error) {
            console.error('[db] insertNodeSnapshots error:', error);
            throw new Error(`Failed to insert node snapshots: ${error.message}`);
        }
    }
}

/**
 * Get network history for the last N days
 * @param days - Number of days to look back
 * @param network - Optional network filter ('mainnet', 'devnet', or undefined for all)
 */
export async function getNetworkHistory(
    days: number = 7,
    network?: 'mainnet' | 'devnet'
): Promise<SnapshotRecord[]> {
    if (!isSupabaseConfigured()) {
        console.warn('[db] Supabase not configured, returning empty history');
        return [];
    }

    const supabase = getSupabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let query = supabase
        .from('snapshots')
        .select('*')
        .gte('timestamp', cutoffDate.toISOString())
        .order('timestamp', { ascending: true });

    // Filter by network if specified
    if (network) {
        query = query.eq('network', network);
    }

    const { data, error } = await query;

    if (error) {
        console.error('[db] getNetworkHistory error:', error);
        return [];
    }

    return data || [];
}

/**
 * Get node history for a specific node
 */
export async function getNodeHistory(nodeId: string, days: number = 30): Promise<Array<{
    timestamp: string;
    status: string;
    uptime_percent: number;
    storage_usage_percent: number;
    staking_score: number;
    credits: number;
    version: string | null;
}>> {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const supabase = getSupabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
        .from('node_snapshots')
        .select(`
            status,
            uptime_percent,
            storage_usage_percent,
            staking_score,
            credits,
            version,
            snapshots!inner(timestamp)
        `)
        .eq('node_id', nodeId)
        .gte('snapshots.timestamp', cutoffDate.toISOString())
        .order('snapshots(timestamp)', { ascending: true });

    if (error) {
        console.error('[db] getNodeHistory error:', error);
        return [];
    }

    // Flatten the joined data
    return (data || []).map((row: any) => ({
        timestamp: row.snapshots.timestamp,
        status: row.status,
        uptime_percent: row.uptime_percent,
        storage_usage_percent: row.storage_usage_percent,
        staking_score: row.staking_score,
        credits: row.credits,
        version: row.version,
    }));
}

/**
 * Get the most recent snapshot
 */
export async function getLatestSnapshot(): Promise<SnapshotRecord | null> {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('snapshots')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // Not "no rows" error
            console.error('[db] getLatestSnapshot error:', error);
        }
        return null;
    }

    return data;
}

/**
 * Get previous snapshot (for comparison/alerts)
 */
export async function getPreviousSnapshot(): Promise<SnapshotRecord | null> {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('snapshots')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(1, 1);

    if (error) {
        console.error('[db] getPreviousSnapshot error:', error);
        return null;
    }

    return data?.[0] || null;
}

/**
 * Get node data from a specific snapshot
 */
export async function getNodesFromSnapshot(snapshotId: number): Promise<NodeSnapshotRecord[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('node_snapshots')
        .select('*')
        .eq('snapshot_id', snapshotId);

    if (error) {
        console.error('[db] getNodesFromSnapshot error:', error);
        return [];
    }

    return data || [];
}

/**
 * Prune old snapshots (keep last N days)
 */
export async function pruneOldSnapshots(keepDays: number = 30): Promise<number> {
    const supabase = getSupabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);

    // Delete old snapshots (cascade will handle node_snapshots)
    const { data, error } = await supabase
        .from('snapshots')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('id');

    if (error) {
        console.error('[db] pruneOldSnapshots error:', error);
        return 0;
    }

    return data?.length || 0;
}

// ================== ALERT QUERIES ==================

/**
 * Create an alert subscription
 */
export async function createAlertSubscription(data: {
    email?: string;
    push_endpoint?: string;
    push_p256dh?: string;
    push_auth?: string;
    node_ids: string[];
    alert_offline?: boolean;
    alert_score_drop?: boolean;
    score_threshold?: number;
}): Promise<number> {
    const supabase = getSupabase();

    const { data: result, error } = await supabase
        .from('alert_subscriptions')
        .insert({
            email: data.email || null,
            push_endpoint: data.push_endpoint || null,
            push_p256dh: data.push_p256dh || null,
            push_auth: data.push_auth || null,
            node_ids: data.node_ids,
            alert_offline: data.alert_offline !== false,
            alert_score_drop: data.alert_score_drop !== false,
            score_threshold: data.score_threshold || 70,
        })
        .select('id')
        .single();

    if (error) {
        console.error('[db] createAlertSubscription error:', error);
        throw new Error(`Failed to create subscription: ${error.message}`);
    }

    return result.id;
}

/**
 * Get subscriptions watching a specific node
 */
export async function getSubscriptionsForNode(nodeId: string): Promise<AlertSubscription[]> {
    const supabase = getSupabase();

    // Use a raw filter with the @> operator for JSONB array containment
    // The value must be a valid JSON array string
    const { data, error } = await supabase
        .from('alert_subscriptions')
        .select('*')
        .filter('node_ids', 'cs', JSON.stringify([nodeId]))
        .eq('verified', true);

    if (error) {
        console.error('[db] getSubscriptionsForNode error:', error);
        return [];
    }

    return data || [];
}

/**
 * Get subscription by email address
 */
export async function getSubscriptionByEmail(email: string): Promise<AlertSubscription | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('alert_subscriptions')
        .select('*')
        .eq('email', email)
        .limit(1)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('[db] getSubscriptionByEmail error:', error);
        }
        return null;
    }

    return data;
}

/**
 * Record that an alert was sent (for deduplication)
 */
export async function recordAlertSent(subscriptionId: number, nodeId: string, alertType: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from('alert_history')
        .insert({
            subscription_id: subscriptionId,
            node_id: nodeId,
            alert_type: alertType,
        });

    if (error) {
        console.error('[db] recordAlertSent error:', error);
    }
}

/**
 * Check if an alert was already sent recently (within hours)
 */
export async function wasAlertSentRecently(subscriptionId: number, nodeId: string, alertType: string, hours: number = 6): Promise<boolean> {
    const supabase = getSupabase();
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const { count, error } = await supabase
        .from('alert_history')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_id', subscriptionId)
        .eq('node_id', nodeId)
        .eq('alert_type', alertType)
        .gte('sent_at', cutoffDate.toISOString());

    if (error) {
        console.error('[db] wasAlertSentRecently error:', error);
        return false;
    }

    return (count || 0) > 0;
}

/**
 * Verify an email subscription
 */
export async function verifySubscription(id: number): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from('alert_subscriptions')
        .update({ verified: true })
        .eq('id', id);

    if (error) {
        console.error('[db] verifySubscription error:', error);
        throw new Error(`Failed to verify subscription: ${error.message}`);
    }
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: number): Promise<void> {
    const supabase = getSupabase();

    // Cascade deletes will handle related records
    const { error } = await supabase
        .from('alert_subscriptions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[db] deleteSubscription error:', error);
        throw new Error(`Failed to delete subscription: ${error.message}`);
    }
}

/**
 * Create a verification token for a subscription
 */
export async function createVerificationToken(subscriptionId: number, token: string, expiresInHours: number = 24): Promise<void> {
    const supabase = getSupabase();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const { error } = await supabase
        .from('verification_tokens')
        .insert({
            token,
            subscription_id: subscriptionId,
            expires_at: expiresAt.toISOString(),
        });

    if (error) {
        console.error('[db] createVerificationToken error:', error);
        throw new Error(`Failed to create verification token: ${error.message}`);
    }
}

/**
 * Get subscription by verification token
 */
export async function getSubscriptionByToken(token: string): Promise<AlertSubscription | null> {
    const supabase = getSupabase();

    // First get the token to find subscription_id
    const { data: tokenData, error: tokenError } = await supabase
        .from('verification_tokens')
        .select('subscription_id')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (tokenError || !tokenData) {
        return null;
    }

    // Then get the subscription
    const { data, error } = await supabase
        .from('alert_subscriptions')
        .select('*')
        .eq('id', tokenData.subscription_id)
        .single();

    if (error) {
        return null;
    }

    return data;
}

/**
 * Delete a verification token after use
 */
export async function deleteVerificationToken(token: string): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from('verification_tokens')
        .delete()
        .eq('token', token);

    if (error) {
        console.error('[db] deleteVerificationToken error:', error);
    }
}

/**
 * Clean up expired verification tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('verification_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

    if (error) {
        console.error('[db] cleanupExpiredTokens error:', error);
        return 0;
    }

    return data?.length || 0;
}

// ================== USER ALERTS QUERIES ==================

/**
 * Insert a user alert (called when sending email/push)
 */
export async function insertUserAlert(data: {
    subscription_id: number;
    node_id: string;
    alert_type: string;
    title: string;
    message: string;
}): Promise<number> {
    const supabase = getSupabase();

    const { data: result, error } = await supabase
        .from('user_alerts')
        .insert(data)
        .select('id')
        .single();

    if (error) {
        console.error('[db] insertUserAlert error:', error);
        throw new Error(`Failed to insert user alert: ${error.message}`);
    }

    return result.id;
}

/**
 * Get alerts for a subscription (most recent first)
 */
export async function getUserAlerts(subscriptionId: number, limit: number = 50): Promise<UserAlert[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[db] getUserAlerts error:', error);
        return [];
    }

    return data || [];
}

/**
 * Get all alerts for an email (across all subscriptions)
 */
export async function getUserAlertsByEmail(email: string, limit: number = 50): Promise<UserAlert[]> {
    const supabase = getSupabase();

    // First get subscription IDs for this email
    const { data: subs, error: subsError } = await supabase
        .from('alert_subscriptions')
        .select('id')
        .eq('email', email)
        .eq('verified', true);

    if (subsError || !subs?.length) {
        return [];
    }

    const subIds = subs.map(s => s.id);

    const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .in('subscription_id', subIds)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[db] getUserAlertsByEmail error:', error);
        return [];
    }

    return data || [];
}

/**
 * Get unread alert count for a subscription
 */
export async function getUnreadAlertCount(subscriptionId: number): Promise<number> {
    const supabase = getSupabase();

    const { count, error } = await supabase
        .from('user_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_id', subscriptionId)
        .eq('read', false);

    if (error) {
        console.error('[db] getUnreadAlertCount error:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Get unread count by email (across all subscriptions)
 */
export async function getUnreadAlertCountByEmail(email: string): Promise<number> {
    const supabase = getSupabase();

    // First get subscription IDs
    const { data: subs, error: subsError } = await supabase
        .from('alert_subscriptions')
        .select('id')
        .eq('email', email)
        .eq('verified', true);

    if (subsError || !subs?.length) {
        return 0;
    }

    const subIds = subs.map(s => s.id);

    const { count, error } = await supabase
        .from('user_alerts')
        .select('*', { count: 'exact', head: true })
        .in('subscription_id', subIds)
        .eq('read', false);

    if (error) {
        console.error('[db] getUnreadAlertCountByEmail error:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Mark alert as read
 */
export async function markAlertRead(alertId: number): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from('user_alerts')
        .update({ read: true })
        .eq('id', alertId);

    if (error) {
        console.error('[db] markAlertRead error:', error);
    }
}

/**
 * Mark all alerts as read for a subscription
 */
export async function markAllAlertsRead(subscriptionId: number): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from('user_alerts')
        .update({ read: true })
        .eq('subscription_id', subscriptionId);

    if (error) {
        console.error('[db] markAllAlertsRead error:', error);
    }
}

/**
 * Delete an alert
 */
export async function deleteUserAlert(alertId: number): Promise<void> {
    const supabase = getSupabase();

    const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', alertId);

    if (error) {
        console.error('[db] deleteUserAlert error:', error);
    }
}

/**
 * Clean up old alerts (older than 30 days)
 */
export async function cleanupOldAlerts(): Promise<number> {
    const supabase = getSupabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const { data, error } = await supabase
        .from('user_alerts')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

    if (error) {
        console.error('[db] cleanupOldAlerts error:', error);
        return 0;
    }

    return data?.length || 0;
}
