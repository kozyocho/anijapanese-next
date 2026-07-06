-- Migration 018: Add plan_type column for 4-tier pricing model
-- Plans: free | monthly | annual | lifetime

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'free'
CHECK (plan_type IN ('free', 'monthly', 'annual', 'lifetime'));

-- Backfill existing premium users as 'lifetime' (legacy one-time buyers)
UPDATE profiles SET plan_type = 'lifetime' WHERE is_premium = true;
