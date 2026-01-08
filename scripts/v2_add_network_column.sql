-- ============================================
-- V2 Migration: Add network column to snapshots
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add network column to snapshots table
-- 'devnet' is default for backward compatibility with existing data
ALTER TABLE snapshots ADD COLUMN IF NOT EXISTS network TEXT NOT NULL DEFAULT 'devnet';

-- Add index for network filtering
CREATE INDEX IF NOT EXISTS idx_snapshots_network ON snapshots(network);

-- Composite index for efficient network + timestamp queries
CREATE INDEX IF NOT EXISTS idx_snapshots_network_timestamp ON snapshots(network, timestamp DESC);
