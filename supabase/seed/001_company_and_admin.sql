-- =============================================================================
-- HailiteManager - Seed Data: Company & Admin User
-- STEP 1: Run this AFTER creating the Supabase Auth user via the dashboard.
--
-- Instructions:
--   1. Go to Supabase Dashboard → Authentication → Users → Add User
--      Email: patrick@hailite.com
--      Password: 0000  ← CHANGE IMMEDIATELY AFTER FIRST LOGIN
--   2. Copy the UUID from auth.users for patrick@hailite.com
--   3. Replace 'REPLACE_WITH_AUTH_UUID' below with that UUID
--   4. Run this SQL in Supabase SQL Editor
-- =============================================================================

-- Insert Hailite company
INSERT INTO companies (id, name, logo_url, theme, settings, created_at)
VALUES (
  'company-hailite-001',
  'Hailite Xteriors Inc.',
  NULL,  -- upload logo after first login
  'cosmic-space',
  '{
    "currency": "CAD",
    "timezone": "America/Edmonton",
    "country": "CA",
    "province": "AB",
    "gst_rate": 0.05
  }',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert admin user record
-- ⚠️  Replace 'REPLACE_WITH_AUTH_UUID' with the actual UUID from auth.users
INSERT INTO users (
  id,
  company_id,
  profile_name,
  email,
  avatar_url,
  role,
  biometric_enabled,
  theme_preference,
  created_at
)
VALUES (
  'REPLACE_WITH_AUTH_UUID',
  'company-hailite-001',
  'Patrick Bisaillon',
  'patrick@hailite.com',
  NULL,
  'admin',
  FALSE,
  'cosmic-space',
  NOW()
) ON CONFLICT (id) DO NOTHING;
