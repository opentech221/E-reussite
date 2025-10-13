-- Migration pour corriger les link_type basés sur les URLs
-- Date: 2025-10-12

-- Mettre à jour les liens de quiz
UPDATE shared_links
SET link_type = 'quiz'
WHERE link_type = 'course' 
  AND (original_url LIKE '%/quiz/%' OR title ILIKE '%quiz%');

-- Mettre à jour les liens d'examens
UPDATE shared_links
SET link_type = 'exam'
WHERE link_type = 'course' 
  AND (original_url LIKE '%/exam/%' OR title ILIKE '%examen%' OR title ILIKE '%exam%');

-- Mettre à jour les liens de certificats
UPDATE shared_links
SET link_type = 'certificate'
WHERE link_type = 'course' 
  AND (original_url LIKE '%/certificate/%' OR title ILIKE '%certificat%');

-- Afficher le résultat
SELECT 
  link_type,
  COUNT(*) as count
FROM shared_links
GROUP BY link_type
ORDER BY link_type;
