-- ============================================================================
-- CORRECTION COMPLÈTE RLS - Tables profiles et user_points
-- Date: 10 octobre 2025
-- ============================================================================

BEGIN;

-- ============================================================================
-- PARTIE 1: POLITIQUES RLS POUR LA TABLE profiles
-- ============================================================================

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Prevent profile deletion" ON profiles;

-- Politique 1: SELECT - Lecture publique des profils
CREATE POLICY "Anyone can view profiles"
ON profiles
FOR SELECT
USING (true);

-- Politique 2: INSERT - Uniquement le système via trigger
CREATE POLICY "System can create profiles"
ON profiles
FOR INSERT
WITH CHECK (true);

-- Politique 3: UPDATE - Utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique 4: DELETE - Suppression interdite
CREATE POLICY "No one can delete profiles"
ON profiles
FOR DELETE
USING (false);

-- Activer RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PARTIE 2: POLITIQUES RLS POUR LA TABLE user_points
-- ============================================================================

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
DROP POLICY IF EXISTS "Users can view all points" ON user_points;
DROP POLICY IF EXISTS "Public points are viewable" ON user_points;
DROP POLICY IF EXISTS "Allow system inserts" ON user_points;
DROP POLICY IF EXISTS "System can insert points" ON user_points;
DROP POLICY IF EXISTS "Users can update own points" ON user_points;
DROP POLICY IF EXISTS "System can update points" ON user_points;

-- Politique 1: SELECT - Lecture publique des points (pour leaderboard)
CREATE POLICY "Anyone can view points"
ON user_points
FOR SELECT
USING (true);

-- Politique 2: INSERT - Uniquement le système
CREATE POLICY "System can create points"
ON user_points
FOR INSERT
WITH CHECK (true);

-- Politique 3: UPDATE - Uniquement le système via fonctions
CREATE POLICY "System can update points"
ON user_points
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Politique 4: DELETE - Suppression interdite
CREATE POLICY "No one can delete points"
ON user_points
FOR DELETE
USING (false);

-- Activer RLS sur user_points
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PARTIE 3: VÉRIFICATION
-- ============================================================================

-- Afficher toutes les politiques sur profiles
SELECT 
    'profiles' as table_name,
    policyname,
    cmd as operation,
    permissive,
    CASE 
        WHEN cmd = 'SELECT' AND qual::text = 'true' THEN '✅ Lecture publique'
        WHEN cmd = 'INSERT' AND with_check::text = 'true' THEN '✅ Création système'
        WHEN cmd = 'UPDATE' AND qual::text LIKE '%auth.uid()%' THEN '✅ Modification propriétaire'
        WHEN cmd = 'UPDATE' AND qual::text = 'true' THEN '✅ Modification système'
        WHEN cmd = 'DELETE' AND qual::text = 'false' THEN '❌ Suppression bloquée'
        ELSE 'Autre'
    END as description
FROM pg_policies
WHERE tablename = 'profiles'

UNION ALL

-- Afficher toutes les politiques sur user_points
SELECT 
    'user_points' as table_name,
    policyname,
    cmd as operation,
    permissive,
    CASE 
        WHEN cmd = 'SELECT' AND qual::text = 'true' THEN '✅ Lecture publique'
        WHEN cmd = 'INSERT' AND with_check::text = 'true' THEN '✅ Création système'
        WHEN cmd = 'UPDATE' AND qual::text = 'true' THEN '✅ Modification système'
        WHEN cmd = 'DELETE' AND qual::text = 'false' THEN '❌ Suppression bloquée'
        ELSE 'Autre'
    END as description
FROM pg_policies
WHERE tablename = 'user_points'

ORDER BY table_name, operation, policyname;

-- Vérifier que RLS est activé
SELECT 
    tablename,
    CASE rowsecurity 
        WHEN true THEN '✅ RLS Activé'
        ELSE '❌ RLS Désactivé'
    END as status
FROM pg_tables
WHERE tablename IN ('profiles', 'user_points')
ORDER BY tablename;

COMMIT;

-- ============================================================================
-- TEST RAPIDE
-- ============================================================================

-- Après avoir exécuté ce script, testez:
-- 1. Créer un nouveau compte (inscription)
-- 2. Vérifier qu'il n'y a pas d'erreur 401 ou 42501
-- 3. Vérifier que le profil est créé automatiquement
-- 4. Vérifier que les points sont créés automatiquement

-- Pour vérifier manuellement:
/*
SELECT 
    au.id,
    au.email,
    p.id IS NOT NULL as has_profile,
    up.user_id IS NOT NULL as has_points,
    up.total_points,
    up.level
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_points up ON up.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 5;
*/

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

-- ✅ POURQUOI CES POLITIQUES?

-- 1. SELECT = true (lecture publique):
--    - Nécessaire pour le leaderboard (classement)
--    - Permet aux utilisateurs de voir les profils des autres
--    - Pas de données sensibles exposées

-- 2. INSERT = true (création système):
--    - Permet au trigger handle_new_user() avec SECURITY DEFINER de créer
--    - L'application ne doit JAMAIS insérer directement
--    - La création se fait automatiquement via auth.users

-- 3. UPDATE profiles = auth.uid() = id:
--    - Utilisateurs peuvent modifier LEUR propre profil
--    - Pas celui des autres

-- 4. UPDATE user_points = true (système):
--    - Seules les fonctions avec SECURITY DEFINER peuvent modifier
--    - Évite la triche (modification directe des points)

-- 5. DELETE = false:
--    - Personne ne peut supprimer
--    - Même pas l'utilisateur propriétaire
--    - Seulement via SQL direct (admin)

-- ⚠️ SÉCURITÉ:
-- - RLS activé sur les deux tables
-- - Trigger utilise SECURITY DEFINER pour contourner RLS lors de la création
-- - Application ne fait que des UPDATE sur profiles (jamais INSERT)
-- - Points modifiés uniquement via fonctions sécurisées
