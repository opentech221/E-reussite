-- =============================================
-- CONFIGURATION CRON - Rappels Automatiques
-- =============================================

-- Ce script configure pg_cron pour envoyer des rappels automatiques
-- 1h avant chaque compétition

-- ====================================
-- PRÉREQUIS
-- ====================================

-- 1️⃣ Activer pg_cron dans Supabase Dashboard
-- Aller dans: Database > Extensions > Rechercher "pg_cron" > Enable

-- Vérifier que pg_cron est installé
SELECT * FROM pg_available_extensions WHERE name = 'pg_cron';

-- Créer l'extension si elle n'existe pas
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ====================================
-- CRÉER LE JOB CRON
-- ====================================

-- Exécuter schedule_competition_reminders() toutes les 15 minutes
-- Cela vérifiera s'il y a des compétitions qui commencent dans 1h

SELECT cron.schedule(
    'competition-reminders', -- Nom du job
    '*/15 * * * *',          -- Toutes les 15 minutes (format cron)
    $$
    SELECT schedule_competition_reminders();
    $$
);

-- ====================================
-- JOBS CRON DISPONIBLES
-- ====================================

-- Voir tous les jobs planifiés
SELECT 
    jobid,
    jobname,
    schedule,
    command,
    active
FROM cron.job
ORDER BY jobid;

-- ====================================
-- GESTION DES JOBS
-- ====================================

-- Désactiver temporairement un job
-- SELECT cron.unschedule('competition-reminders');

-- Réactiver un job
-- SELECT cron.schedule('competition-reminders', '*/15 * * * *', 'SELECT schedule_competition_reminders();');

-- Supprimer définitivement un job
-- SELECT cron.unschedule('competition-reminders');

-- ====================================
-- HISTORIQUE D'EXÉCUTION
-- ====================================

-- Voir les dernières exécutions du job
SELECT 
    jobid,
    runid,
    job_pid,
    database,
    username,
    command,
    status,
    return_message,
    start_time,
    end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'competition-reminders')
ORDER BY start_time DESC
LIMIT 10;

-- ====================================
-- TEST MANUEL
-- ====================================

-- Tester la fonction manuellement (sans attendre le cron)
SELECT schedule_competition_reminders();

-- Voir les notifications créées
SELECT 
    id,
    user_id,
    type,
    title,
    scheduled_for,
    is_sent,
    created_at
FROM competition_notifications
WHERE type = 'reminder'
ORDER BY created_at DESC
LIMIT 5;

-- ====================================
-- ALTERNATIVE: VERCEL CRON (si Supabase Free Tier)
-- ====================================

/*
Si pg_cron n'est pas disponible dans votre plan Supabase,
utilisez Vercel Cron Jobs (gratuit jusqu'à 100 invocations/jour)

1. Créer un fichier: /api/cron/competition-reminders.js

export default async function handler(req, res) {
  // Vérifier le secret pour sécuriser l'endpoint
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Appeler la fonction Supabase
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase.rpc('schedule_competition_reminders');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ 
    success: true, 
    notifications_created: data 
  });
}

2. Configurer dans vercel.json:

{
  "crons": [{
    "path": "/api/cron/competition-reminders",
    "schedule": "0,15,30,45 * * * *"
  }]
}

3. Ajouter CRON_SECRET dans .env.local et Variables Vercel
*/

-- ====================================
-- MONITORING
-- ====================================

-- Statistiques des notifications envoyées
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN is_sent = true THEN 1 END) as sent,
    COUNT(CASE WHEN is_sent = false THEN 1 END) as pending
FROM competition_notifications
GROUP BY type;

-- Dernières notifications planifiées
SELECT 
    cn.title,
    cn.body,
    cn.scheduled_for,
    cn.is_sent,
    c.title as competition_title,
    c.starts_at
FROM competition_notifications cn
LEFT JOIN competitions c ON c.id = cn.competition_id
WHERE cn.type = 'reminder'
  AND cn.scheduled_for IS NOT NULL
ORDER BY cn.scheduled_for DESC
LIMIT 10;
