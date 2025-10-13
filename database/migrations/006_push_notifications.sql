-- ============================================
-- MIGRATION 006: Push Notifications System
-- ============================================
-- Date: 5 octobre 2025
-- Description: Système de notifications push avec Web Push API

-- ============================================
-- Table: push_subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription data (JSON from PushSubscription API)
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  
  -- Device info
  user_agent TEXT,
  device_name TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Preferences
  notifications_enabled BOOLEAN DEFAULT true,
  challenge_reminders BOOLEAN DEFAULT true,
  badge_alerts BOOLEAN DEFAULT true,
  level_up_alerts BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: notification_queue
-- ============================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification data
  type TEXT NOT NULL, -- 'challenge', 'badge', 'level', 'reminder'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  data JSONB,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_type ON notification_queue(type);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can view their own notification history
CREATE POLICY "Users can view own notifications"
  ON notification_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage notifications
CREATE POLICY "Service role can manage notifications"
  ON notification_queue
  FOR ALL
  USING (true);

-- ============================================
-- Fonction: Enqueue notification
-- ============================================
CREATE OR REPLACE FUNCTION enqueue_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_icon TEXT DEFAULT NULL,
  p_badge TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'::JSONB,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notification_queue (
    user_id,
    type,
    title,
    body,
    icon,
    badge,
    data,
    scheduled_for
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_icon,
    p_badge,
    p_data,
    p_scheduled_for
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- ============================================
-- Fonction: Get pending notifications
-- ============================================
CREATE OR REPLACE FUNCTION get_pending_notifications()
RETURNS TABLE (
  notification_id UUID,
  user_id UUID,
  type TEXT,
  title TEXT,
  body TEXT,
  icon TEXT,
  badge TEXT,
  data JSONB,
  subscriptions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nq.id as notification_id,
    nq.user_id,
    nq.type,
    nq.title,
    nq.body,
    nq.icon,
    nq.badge,
    nq.data,
    jsonb_agg(
      jsonb_build_object(
        'endpoint', ps.endpoint,
        'keys', jsonb_build_object(
          'p256dh', ps.p256dh_key,
          'auth', ps.auth_key
        )
      )
    ) as subscriptions
  FROM notification_queue nq
  INNER JOIN push_subscriptions ps ON ps.user_id = nq.user_id
  WHERE nq.status = 'pending'
    AND nq.scheduled_for <= NOW()
    AND ps.is_active = true
    AND ps.notifications_enabled = true
  GROUP BY nq.id, nq.user_id, nq.type, nq.title, nq.body, nq.icon, nq.badge, nq.data
  ORDER BY nq.scheduled_for ASC
  LIMIT 100;
END;
$$;

-- ============================================
-- Fonction: Mark notification as sent
-- ============================================
CREATE OR REPLACE FUNCTION mark_notification_sent(
  p_notification_id UUID,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_success THEN
    UPDATE notification_queue
    SET 
      status = 'sent',
      sent_at = NOW()
    WHERE id = p_notification_id;
  ELSE
    UPDATE notification_queue
    SET 
      status = 'failed',
      error_message = p_error_message,
      retry_count = retry_count + 1
    WHERE id = p_notification_id;
  END IF;
END;
$$;

-- ============================================
-- Vérifications
-- ============================================
SELECT 'Push subscriptions table' as table_name, COUNT(*) as row_count FROM push_subscriptions;
SELECT 'Notification queue table' as table_name, COUNT(*) as row_count FROM notification_queue;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Tables créées:
--   • push_subscriptions (0 rows)
--   • notification_queue (0 rows)
--
-- Fonctions créées:
--   • enqueue_notification() → Ajouter notification à la queue
--   • get_pending_notifications() → Récupérer notifications à envoyer
--   • mark_notification_sent() → Marquer comme envoyée
--
-- RLS policies activées
-- Indexes créés pour performance
-- ============================================
