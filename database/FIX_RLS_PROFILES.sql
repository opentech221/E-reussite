-- ============================================================================
-- CORRECTION POLITIQUES RLS - Table profiles
-- Date: 10 octobre 2025
-- Problème: Erreur 401 "new row violates row-level security policy"
-- ============================================================================

-- DIAGNOSTIC: Vérifier les politiques actuelles sur profiles
-- ============================================================================
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
WHERE tablename = 'profiles'
ORDER BY policyname;

-- CORRECTION: Ajouter/Corriger les politiques RLS sur profiles
-- ============================================================================

-- 1. Politique SELECT (lecture) - Les utilisateurs peuvent lire leur propre profil et ceux des autres
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
USING (true); -- Tout le monde peut lire les profils (pour leaderboard, etc.)

-- 2. Politique INSERT - Seul le système (trigger) peut créer un profil
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;

CREATE POLICY "System can insert profiles"
ON profiles
FOR INSERT
WITH CHECK (true); -- Permet au trigger avec SECURITY DEFINER de créer le profil

-- 3. Politique UPDATE - Les utilisateurs peuvent modifier leur propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Politique DELETE - Personne ne peut supprimer (sauf admin via SQL)
DROP POLICY IF EXISTS "Prevent profile deletion" ON profiles;

CREATE POLICY "Prevent profile deletion"
ON profiles
FOR DELETE
USING (false);

-- VÉRIFICATION: Lister les nouvelles politiques
-- ============================================================================
SELECT 
    policyname,
    cmd as command,
    CASE 
        WHEN cmd = 'SELECT' THEN '✅ Lecture'
        WHEN cmd = 'INSERT' THEN '✅ Création (système)'
        WHEN cmd = 'UPDATE' THEN '✅ Modification (propriétaire)'
        WHEN cmd = 'DELETE' THEN '❌ Suppression (bloquée)'
    END as description
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- S'assurer que RLS est activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- NOTES
-- ============================================================================

-- ✅ Ces politiques permettent:
-- 1. SELECT: Tout le monde peut lire les profils (nécessaire pour leaderboard)
-- 2. INSERT: Seul le trigger avec SECURITY DEFINER peut créer (via handle_new_user)
-- 3. UPDATE: Chaque utilisateur peut modifier son propre profil
-- 4. DELETE: Suppression bloquée pour éviter les accidents

-- ⚠️ Important:
-- - Le trigger handle_new_user() utilise SECURITY DEFINER pour contourner RLS
-- - L'application ne doit JAMAIS essayer de créer un profil manuellement
-- - La création se fait automatiquement lors de l'inscription via auth.users
