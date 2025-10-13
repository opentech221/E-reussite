-- 🔍 VÉRIFIER LES POLITIQUES RLS SUR PROFILES
-- Date : 7 octobre 2025

-- Voir si RLS est activé sur la table profiles
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- Voir toutes les politiques RLS sur profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Test direct : Compter TOUS les profils (sans RLS)
SET ROLE postgres;
SELECT COUNT(*) as total_profiles FROM profiles;
RESET ROLE;

-- Test avec RLS : Compter les profils visibles par l'utilisateur actuel
SELECT COUNT(*) as visible_profiles FROM profiles;
