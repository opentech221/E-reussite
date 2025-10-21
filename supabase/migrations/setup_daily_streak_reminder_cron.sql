-- ============================================
-- CRON JOB: DAILY STREAK REMINDER
-- ============================================
-- Date: 22 Octobre 2025
-- Purpose: Envoyer des notifications push quotidiennes à 21h
-- Target: Utilisateurs avec streak actif sans activité aujourd'hui

-- Prérequis:
-- 1. Edge Function 'send-daily-streak-reminder' déployée
-- 2. VAPID keys configurées (supabase secrets)
-- 3. Extension pg_cron activée (normalement activée par défaut dans Supabase)

-- Vérifier que pg_cron est activé
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
-- Si vide, l'activer (nécessite superuser):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- CRÉER LE CRON JOB
-- ============================================

-- Supprimer le job s'il existe déjà (pour réexécuter le script)
SELECT cron.unschedule('daily-streak-reminder');

-- ⚠️ IMPORTANT : Remplacer YOUR_SERVICE_ROLE_KEY par ta clé service_role
-- Trouver la clé : Supabase Dashboard → Project Settings → API → service_role key

-- Créer le nouveau cron job
-- Schedule: Tous les jours à 21h00 UTC (22h Paris en hiver, 23h en été)
-- Note: Ajuster le fuseau horaire si nécessaire
-- Note: Utilise net.http_post (schéma de pg_net dans Supabase)
SELECT cron.schedule(
  'daily-streak-reminder',              -- Job name
  '0 21 * * *',                         -- Cron expression (21h UTC)
  $$
  SELECT net.http_post(
    url := 'https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/send-daily-streak-reminder',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidmRya2hkampwdW93dGh3aW5mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMxNzg2NSwiZXhwIjoyMDc0ODkzODY1fQ.__YZeo2ByS_UiIyMNBlpnTkVavpyfGQ_AruIOlAXplQ", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Lister tous les cron jobs actifs
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  database,
  command
FROM cron.job
WHERE jobname = 'daily-streak-reminder';

-- Résultat attendu:
-- jobid | jobname                 | schedule    | active | database | command
-- ------|-------------------------|-------------|--------|----------|--------
-- 1     | daily-streak-reminder   | 0 21 * * *  | t      | postgres | SELECT net.http_post(...)

-- ============================================
-- TESTER LE CRON JOB MANUELLEMENT
-- ============================================

-- ⚠️ IMPORTANT : Remplacer YOUR_SERVICE_ROLE_KEY par ta clé service_role
-- Trouver la clé : Supabase Dashboard → Project Settings → API → service_role key

-- Option 1: Exécuter la commande directement (test immédiat)
-- Note: Utilise net.http_post (schéma de pg_net)
SELECT net.http_post(
  url := 'https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/send-daily-streak-reminder',
  headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidmRya2hkampwdW93dGh3aW5mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMxNzg2NSwiZXhwIjoyMDc0ODkzODY1fQ.__YZeo2ByS_UiIyMNBlpnTkVavpyfGQ_AruIOlAXplQ", "Content-Type": "application/json"}'::jsonb,
  body := '{}'::jsonb
);

-- Option 2: Voir l'historique des exécutions
SELECT 
  runid,
  jobid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname = 'daily-streak-reminder'
)
ORDER BY start_time DESC
LIMIT 10;

-- ============================================
-- GESTION DU CRON JOB
-- ============================================

-- Désactiver le cron job (sans le supprimer)
-- UPDATE cron.job SET active = false WHERE jobname = 'daily-streak-reminder';

-- Réactiver le cron job
-- UPDATE cron.job SET active = true WHERE jobname = 'daily-streak-reminder';

-- Supprimer définitivement le cron job
-- SELECT cron.unschedule('daily-streak-reminder');

-- ============================================
-- NOTES SUR LE FUSEAU HORAIRE
-- ============================================

-- Les cron jobs Supabase utilisent UTC par défaut.
-- 21h UTC = 22h Paris (hiver) ou 23h Paris (été)
-- 
-- Si tu veux 21h heure de Paris:
-- - Hiver (UTC+1): Schedule à '20 * * *' (20h UTC)
-- - Été (UTC+2):   Schedule à '19 * * *' (19h UTC)
--
-- Alternative: Utiliser une seule horaire toute l'année:
-- - '20 * * *' → 21h Paris en hiver, 22h en été
-- - '19 * * *' → 20h Paris en hiver, 21h en été (RECOMMANDÉ)

-- Pour changer l'horaire:
-- SELECT cron.unschedule('daily-streak-reminder');
-- SELECT cron.schedule(
--   'daily-streak-reminder',
--   '0 19 * * *',  -- 19h UTC = 21h Paris (été)
--   $$ ... $$
-- );

-- ============================================
-- MONITORING ET DEBUGGING
-- ============================================

-- Voir les logs Supabase:
-- 1. Aller sur Supabase Dashboard
-- 2. Edge Functions → send-daily-streak-reminder → Logs
-- 3. Chercher "[Cron]" dans les logs

-- Vérifier quels users recevraient une notification maintenant:
SELECT 
  up.user_id,
  p.full_name,
  u.email,
  up.current_streak,
  up.last_activity_date,
  COUNT(ps.id) AS active_subscriptions
FROM user_points up
LEFT JOIN profiles p ON p.id = up.user_id
LEFT JOIN auth.users u ON u.id = up.user_id
LEFT JOIN push_subscriptions ps ON ps.user_id = up.user_id AND ps.is_active = true
WHERE up.current_streak > 0
  AND up.last_activity_date < CURRENT_DATE
GROUP BY up.user_id, p.full_name, u.email, up.current_streak, up.last_activity_date
ORDER BY up.current_streak DESC;

-- ============================================
-- DÉPANNAGE
-- ============================================

-- Si le cron job ne s'exécute pas:
-- 1. Vérifier que pg_cron est activé
-- 2. Vérifier que l'Edge Function est déployée
-- 3. Vérifier les VAPID keys (supabase secrets list)
-- 4. Vérifier les logs Edge Function
-- 5. Tester manuellement avec net.http_post
-- 6. Vérifier cron.job_run_details pour les erreurs

-- Vérifier la dernière exécution:
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-streak-reminder')
ORDER BY start_time DESC
LIMIT 1;
