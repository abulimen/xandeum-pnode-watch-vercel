-- ============================================
-- V1 pNode Watch - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Network Snapshots (aggregate network stats)
CREATE TABLE IF NOT EXISTS snapshots (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    total_nodes INTEGER NOT NULL DEFAULT 0,
    online_nodes INTEGER NOT NULL DEFAULT 0,
    degraded_nodes INTEGER NOT NULL DEFAULT 0,
    offline_nodes INTEGER NOT NULL DEFAULT 0,
    total_storage_bytes BIGINT NOT NULL DEFAULT 0,
    used_storage_bytes BIGINT NOT NULL DEFAULT 0,
    avg_uptime REAL NOT NULL DEFAULT 0,
    avg_staking_score REAL NOT NULL DEFAULT 0,
    total_credits REAL NOT NULL DEFAULT 0,
    avg_credits REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON snapshots(timestamp DESC);

-- 2. Node Snapshots (individual node data per snapshot)
CREATE TABLE IF NOT EXISTS node_snapshots (
    id BIGSERIAL PRIMARY KEY,
    snapshot_id BIGINT NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    public_key TEXT,
    status TEXT NOT NULL,
    uptime_percent REAL NOT NULL DEFAULT 0,
    storage_usage_percent REAL NOT NULL DEFAULT 0,
    staking_score REAL NOT NULL DEFAULT 0,
    credits REAL NOT NULL DEFAULT 0,
    version TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_node_snapshots_snapshot_id ON node_snapshots(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_node_snapshots_node_id ON node_snapshots(node_id);

-- 3. Alert Subscriptions (email/push alert settings)
CREATE TABLE IF NOT EXISTS alert_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    email TEXT,
    push_endpoint TEXT,
    push_p256dh TEXT,
    push_auth TEXT,
    node_ids JSONB NOT NULL DEFAULT '[]',
    alert_offline BOOLEAN NOT NULL DEFAULT TRUE,
    alert_score_drop BOOLEAN NOT NULL DEFAULT TRUE,
    score_threshold INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_email ON alert_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_node_ids ON alert_subscriptions USING GIN (node_ids);

-- 4. Alert History (deduplication tracking)
CREATE TABLE IF NOT EXISTS alert_history (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL REFERENCES alert_subscriptions(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_history_subscription_id ON alert_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_sent_at ON alert_history(sent_at DESC);

-- 5. Verification Tokens (email verification)
CREATE TABLE IF NOT EXISTS verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    subscription_id BIGINT NOT NULL REFERENCES alert_subscriptions(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at);

-- 6. User Alerts (alert log for user dashboard)
CREATE TABLE IF NOT EXISTS user_alerts (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL REFERENCES alert_subscriptions(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_user_alerts_subscription_id ON user_alerts(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_created_at ON user_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_alerts_read ON user_alerts(read);

-- Enable Row Level Security (optional but recommended)
-- ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE node_snapshots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

-- Grant service role full access (needed for server-side operations)
-- Uncomment if using RLS:
-- CREATE POLICY "Service role has full access to snapshots" ON snapshots FOR ALL USING (true);
-- CREATE POLICY "Service role has full access to node_snapshots" ON node_snapshots FOR ALL USING (true);
-- CREATE POLICY "Service role has full access to alert_subscriptions" ON alert_subscriptions FOR ALL USING (true);
-- CREATE POLICY "Service role has full access to alert_history" ON alert_history FOR ALL USING (true);
-- CREATE POLICY "Service role has full access to verification_tokens" ON verification_tokens FOR ALL USING (true);
-- CREATE POLICY "Service role has full access to user_alerts" ON user_alerts FOR ALL USING (true);
