-- 🔍 DÉCOUVERTE STRUCTURE BASE DE DONNÉES
-- Date : 7 octobre 2025
-- Objectif : Lister toutes les tables disponibles

-- ============================================================
-- LISTER TOUTES LES TABLES
-- ============================================================

SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================
-- ALTERNATIVE : Voir les tables avec leurs colonnes
-- ============================================================

SELECT 
  table_name,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;
