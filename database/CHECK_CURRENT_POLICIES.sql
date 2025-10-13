-- ============================================================================
-- VÉRIFICATION DES POLITIQUES RLS ACTUELLES
-- Date: 10 octobre 2025
-- ============================================================================

-- Voir toutes les politiques sur profiles
SELECT 
    'profiles' as table_name,
    policyname,
    cmd as operation,
    permissive,
    qual as using_clause,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Separator
SELECT '---' as separator;

-- Voir toutes les politiques sur user_points
SELECT 
    'user_points' as table_name,
    policyname,
    cmd as operation,
    permissive,
    qual as using_clause,
    with_check
FROM pg_policies
WHERE tablename = 'user_points'
ORDER BY cmd, policyname;
