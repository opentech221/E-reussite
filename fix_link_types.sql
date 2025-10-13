-- Script pour corriger manuellement les types de liens
-- À exécuter dans le Dashboard Supabase > SQL Editor

-- 1. Vérifier l'état actuel
SELECT 
  link_type,
  title,
  original_url,
  COUNT(*) OVER (PARTITION BY link_type) as count_per_type
FROM shared_links
ORDER BY created_at DESC;

-- 2. Corriger les quiz (chercher 'quiz' dans l'URL ou le titre)
UPDATE shared_links
SET link_type = 'quiz'
WHERE link_type = 'course' 
  AND (
    original_url ILIKE '%/quiz/%' 
    OR title ILIKE '%quiz%'
  );

-- 3. Corriger les examens (chercher 'exam' dans l'URL ou le titre)
UPDATE shared_links
SET link_type = 'exam'
WHERE link_type = 'course' 
  AND (
    original_url ILIKE '%/exam/%' 
    OR title ILIKE '%examen%' 
    OR title ILIKE '%exam%'
  );

-- 4. Vérifier le résultat
SELECT 
  link_type,
  COUNT(*) as count,
  STRING_AGG(DISTINCT title, ', ') as exemples
FROM shared_links
GROUP BY link_type
ORDER BY link_type;
