-- =============================================
-- SCRIPT DE RÉINSTALLATION COMPLÈTE
-- Compétitions Phase 1 + Phase 2
-- =============================================

-- ====================================
-- ÉTAPE 1: NETTOYAGE TOTAL
-- ====================================

-- Supprimer les triggers
DROP TRIGGER IF EXISTS trigger_competition_registration ON competition_participants CASCADE;
DROP TRIGGER IF EXISTS trigger_leaderboard_update ON competition_leaderboards CASCADE;
DROP TRIGGER IF EXISTS trigger_badge_earned ON user_badges CASCADE;

-- Supprimer toutes les fonctions
DROP FUNCTION IF EXISTS join_competition CASCADE;
DROP FUNCTION IF EXISTS submit_competition_answer CASCADE;
DROP FUNCTION IF EXISTS complete_competition_participant CASCADE;
DROP FUNCTION IF EXISTS update_competition_ranks CASCADE;
DROP FUNCTION IF EXISTS update_francophone_leaderboard CASCADE;
DROP FUNCTION IF EXISTS get_competition_leaderboard CASCADE;

DROP FUNCTION IF EXISTS notify_competition_registration CASCADE;
DROP FUNCTION IF EXISTS notify_leaderboard_update CASCADE;
DROP FUNCTION IF EXISTS notify_badge_earned CASCADE;
DROP FUNCTION IF EXISTS schedule_competition_reminders CASCADE;
DROP FUNCTION IF EXISTS get_user_notifications CASCADE;
DROP FUNCTION IF EXISTS mark_notifications_read CASCADE;
DROP FUNCTION IF EXISTS create_notification CASCADE;
DROP FUNCTION IF EXISTS check_and_award_badges CASCADE;
DROP FUNCTION IF EXISTS get_user_badges CASCADE;
DROP FUNCTION IF EXISTS get_unread_notifications_count CASCADE;
DROP FUNCTION IF EXISTS check_personal_record CASCADE;

-- Supprimer les policies
DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can view their own notifications" ON competition_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON competition_notifications;
DROP POLICY IF EXISTS "Anyone can view badges" ON competition_badges;
DROP POLICY IF EXISTS "Anyone can view user badges" ON user_badges;

-- ====================================
-- ÉTAPE 2: RÉINSTALLER DANS L'ORDRE
-- ====================================

-- 1️⃣ Copier-coller tout le contenu de ADD_COMPETITIONS_NOTIFICATIONS.sql
--    (Tables, triggers, policies, seed des badges)

-- 2️⃣ Copier-coller tout le contenu de ADD_COMPETITIONS_NOTIFICATIONS_FUNCTIONS.sql
--    (Fonctions de notifications: create_notification, check_and_award_badges, etc.)

-- 3️⃣ Copier-coller tout le contenu de ADD_COMPETITIONS_FUNCTIONS.sql
--    (Fonctions de compétitions: join_competition, submit_competition_answer, complete_competition_participant, etc.)

-- ====================================
-- VÉRIFICATION
-- ====================================

-- Vérifier que toutes les fonctions existent
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
      'join_competition',
      'submit_competition_answer',
      'complete_competition_participant',
      'update_competition_ranks',
      'update_francophone_leaderboard',
      'get_competition_leaderboard',
      'create_notification',
      'check_and_award_badges',
      'check_personal_record',
      'get_user_notifications',
      'mark_notifications_read',
      'get_user_badges',
      'schedule_competition_reminders'
  )
ORDER BY routine_name;

-- ✅ Si vous voyez 13 fonctions, tout est OK !
-- ❌ Si vous en voyez moins, une fonction n'a pas été créée correctement
