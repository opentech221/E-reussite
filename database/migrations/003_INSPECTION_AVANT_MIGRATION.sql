-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INSPECTION DES DONNÉES EXISTANTES
-- À exécuter AVANT la migration 003
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- 1. INSPECTER LA TABLE user_badges EXISTANTE
-- ============================================================================

-- Vérifier la structure actuelle
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_badges'
ORDER BY ordinal_position;

-- Compter les enregistrements
SELECT COUNT(*) as total_badges_earned 
FROM public.user_badges;

-- Voir quelques exemples
SELECT * FROM public.user_badges LIMIT 10;

-- ============================================================================
-- 2. INSPECTER LA TABLE badges (si elle existe)
-- ============================================================================

-- Vérifier si la table badges existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'badges'
) as badges_table_exists;

-- Si elle existe, voir sa structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'badges'
ORDER BY ordinal_position;

-- Voir les badges disponibles
SELECT * FROM public.badges LIMIT 20;

-- ============================================================================
-- 3. VÉRIFIER LES AUTRES TABLES DE LA MIGRATION
-- ============================================================================

-- Vérifier si user_points existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_points'
) as user_points_exists;

-- Vérifier si user_progress existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_progress'
) as user_progress_exists;

-- ============================================================================
-- 4. RÉSUMÉ DES CONFLITS POTENTIELS
-- ============================================================================

-- Cette requête utilise pg_class pour éviter les erreurs sur les tables inexistantes
SELECT 
    'user_badges' as table_name,
    COALESCE((
      SELECT COUNT(*) FROM public.user_badges
    ), 0) as row_count,
    'CONFLIT: Table existe avec structure différente' as status

UNION ALL

SELECT 
    'user_points' as table_name,
    COALESCE((
      SELECT reltuples::bigint FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'user_points'
    ), 0) as row_count,
    CASE 
        WHEN EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'user_points'
        )
        THEN 'CONFLIT: Table existe déjà'
        ELSE 'OK: Table n''existe pas'
    END as status

UNION ALL

SELECT 
    'user_progress' as table_name,
    COALESCE((
      SELECT reltuples::bigint FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'user_progress'
    ), 0) as row_count,
    CASE 
        WHEN EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'user_progress'
        )
        THEN 'CONFLIT: Table existe déjà'
        ELSE 'OK: Table n''existe pas'
    END as status;

-- ============================================================================
-- FIN DE L'INSPECTION
-- ============================================================================

-- 👉 INSTRUCTIONS:
-- 1. Exécutez toutes ces requêtes dans Supabase SQL Editor
-- 2. Copiez les résultats et partagez-les
-- 3. Nous déciderons ensemble de la meilleure approche:
--    - Option A: Migrer les données existantes vers la nouvelle structure
--    - Option B: Renommer l'ancienne table et créer la nouvelle
--    - Option C: Supprimer l'ancienne (si aucune donnée importante)
