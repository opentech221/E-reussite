-- ============================================
-- ADD NOTIFICATION TRACKING COLUMNS TO PROFILES
-- ============================================
-- Date: 21 Octobre 2025
-- Purpose: Track login count and notification dismiss count for permission modal strategy

-- Add login_count column (tracks total logins)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Add notification_dismiss_count column (tracks notification permission dismissals)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notification_dismiss_count INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN profiles.login_count IS 'Total number of user logins (incremented on each auth)';
COMMENT ON COLUMN profiles.notification_dismiss_count IS 'Number of times user dismissed notification permission modal (max 3 before stopping)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_login_count ON profiles(login_count);
CREATE INDEX IF NOT EXISTS idx_profiles_notification_dismiss ON profiles(notification_dismiss_count);

-- ============================================
-- TRIGGER TO INCREMENT LOGIN COUNT
-- ============================================

-- Function to increment login count on auth
CREATE OR REPLACE FUNCTION increment_login_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment login_count every time user authenticates
  UPDATE profiles 
  SET login_count = COALESCE(login_count, 0) + 1,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.sessions table (fires on each login)
DROP TRIGGER IF EXISTS on_auth_login ON auth.sessions;
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION increment_login_count();

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to check columns were added:
-- SELECT id, email, login_count, notification_dismiss_count FROM profiles LIMIT 5;
