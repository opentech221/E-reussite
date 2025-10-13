-- ============================================
-- VÉRIFICATION DES NOMS DE MATIÈRES
-- ============================================
-- Exécutez cette requête pour voir les noms EXACTS dans votre base

SELECT 
  id,
  name,
  level,
  CONCAT(name, ' ', UPPER(level)) as nom_complet
FROM matieres
ORDER BY level, name;
