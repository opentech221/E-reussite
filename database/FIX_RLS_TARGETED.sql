-- ============================================================================
-- CORRECTION CIBLÉE RLS - Basée sur diagnostic
-- Date: 10 octobre 2025
-- Problèmes: profiles sans politiques, user_points avec doublons
-- ============================================================================

BEGIN;

-- ============================================================================
-- PARTIE 1: CORRIGER LA TABLE profiles (AUCUNE POLITIQUE ACTUELLEMENT)
-- ============================================================================

COMMENT ON TABLE profiles IS 'AVANT: Aucune politique - erreurs 401 garanties';

-- Supprimer toutes les anciennes politiques sur profiles (si elles existent)
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "System can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "No one can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Prevent profile deletion" ON profiles;

-- Politique 1: SELECT - Lecture publique
CREATE POLICY "Anyone can view profiles"
ON profiles
FOR SELECT
USING (true);

-- Politique 2: INSERT - Système uniquement (pour trigger)
CREATE POLICY "System can create profiles"
ON profiles
FOR INSERT
WITH CHECK (true);

-- Politique 3: UPDATE - Propriétaire uniquement
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique 4: DELETE - Interdit
CREATE POLICY "No one can delete profiles"
ON profiles
FOR DELETE
USING (false);

COMMENT ON TABLE profiles IS 'APRÈS: 4 politiques créées - SELECT, INSERT (system), UPDATE (owner), DELETE (blocked)';

-- ============================================================================
-- PARTIE 2: NETTOYER LES DOUBLONS sur user_points
-- ============================================================================

-- Supprimer TOUTES les anciennes politiques sur user_points
DROP POLICY IF EXISTS "user_points_insert_own" ON user_points;
DROP POLICY IF EXISTS "user_points_select_own_and_public" ON user_points;
DROP POLICY IF EXISTS "user_points_update_own" ON user_points;
DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
DROP POLICY IF EXISTS "Users can view all points" ON user_points;
DROP POLICY IF EXISTS "Public points are viewable" ON user_points;
DROP POLICY IF EXISTS "Allow system inserts" ON user_points;
DROP POLICY IF EXISTS "System can insert points" ON user_points;
DROP POLICY IF EXISTS "Users can update own points" ON user_points;

-- Supprimer aussi les politiques avec noms propres (pour les recréer proprement)
DROP POLICY IF EXISTS "System can create points" ON user_points;
DROP POLICY IF EXISTS "Anyone can view points" ON user_points;
DROP POLICY IF EXISTS "System can update points" ON user_points;
DROP POLICY IF EXISTS "No one can delete points" ON user_points;

-- Recréer les 4 politiques système proprement

-- Politique 1: SELECT - Lecture publique (pour leaderboard)
CREATE POLICY "Anyone can view points"
ON user_points
FOR SELECT
USING (true);

-- Politique 2: INSERT - Système uniquement
CREATE POLICY "System can create points"
ON user_points
FOR INSERT
WITH CHECK (true);

-- Politique 3: UPDATE - Système uniquement via fonctions
CREATE POLICY "System can update points"
ON user_points
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Politique 4: DELETE - Interdit
CREATE POLICY "No one can delete points"
ON user_points
FOR DELETE
USING (false);

COMMENT ON TABLE user_points IS 'Doublons supprimés - 4 politiques système recréées proprement';

-- ============================================================================
-- PARTIE 3: VÉRIFICATION FINALE
-- ============================================================================

-- Compter les politiques par table
SELECT 
    tablename,
    COUNT(*) as nombre_politiques,
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ Correct (4 politiques)'
        WHEN COUNT(*) > 4 THEN '⚠️ Trop de politiques'
        WHEN COUNT(*) < 4 THEN '❌ Politiques manquantes'
    END as status
FROM pg_policies
WHERE tablename IN ('profiles', 'user_points')
GROUP BY tablename
ORDER BY tablename;

-- Détail des politiques sur profiles (devrait montrer 4)
SELECT 
    'profiles' as table_name,
    policyname,
    cmd as operation,
    CASE cmd
        WHEN 'SELECT' THEN '✅ Lecture publique'
        WHEN 'INSERT' THEN '✅ Création système'
        WHEN 'UPDATE' THEN '✅ Modification propriétaire'
        WHEN 'DELETE' THEN '❌ Suppression interdite'
    END as description
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- Détail des politiques sur user_points (devrait montrer 4)
SELECT 
    'user_points' as table_name,
    policyname,
    cmd as operation,
    CASE cmd
        WHEN 'SELECT' THEN '✅ Lecture publique'
        WHEN 'INSERT' THEN '✅ Création système'
        WHEN 'UPDATE' THEN '✅ Modification système'
        WHEN 'DELETE' THEN '❌ Suppression interdite'
    END as description
FROM pg_policies
WHERE tablename = 'user_points'
ORDER BY cmd;

-- Vérifier qu'il n'y a plus de doublons
SELECT 
    tablename,
    cmd,
    COUNT(*) as nombre,
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ OK'
        ELSE '❌ DOUBLON'
    END as status
FROM pg_policies
WHERE tablename IN ('profiles', 'user_points')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1;  -- N'affiche que les doublons s'il y en a

COMMIT;

-- ============================================================================
-- TEST POST-CORRECTION
-- ============================================================================

-- Tester l'inscription maintenant devrait:
-- 1. ✅ Créer le compte (auth.users)
-- 2. ✅ Trigger crée le profil (profiles) - MAINTENANT POSSIBLE
-- 3. ✅ Trigger crée les points (user_points) - DÉJÀ POSSIBLE
-- 4. ✅ Application update le profil - MAINTENANT POSSIBLE
-- 5. ✅ Aucune erreur 401 dans la console

-- Pour vérifier qu'un nouveau compte a tout:
/*
SELECT 
    au.email,
    au.created_at,
    CASE WHEN p.id IS NOT NULL THEN '✅ Profil créé' ELSE '❌ Pas de profil' END as profil_status,
    CASE WHEN up.user_id IS NOT NULL THEN '✅ Points créés' ELSE '❌ Pas de points' END as points_status,
    p.full_name,
    up.total_points
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_points up ON up.user_id = au.id
WHERE au.created_at > NOW() - INTERVAL '5 minutes'
ORDER BY au.created_at DESC;
*/

-- ============================================================================
-- EXPLICATION DES CORRECTIONS
-- ============================================================================

-- ❓ POURQUOI profiles N'AVAIT AUCUNE POLITIQUE?
-- Probablement:
-- - Table créée mais politiques jamais appliquées
-- - Ou politiques supprimées accidentellement
-- - Ou migration incomplète

-- ❓ POURQUOI user_points AVAIT DES DOUBLONS?
-- Probablement:
-- - Script FIX_RLS_COMPLETE.sql exécuté PUIS politiques manuelles ajoutées
-- - Ou politiques créées deux fois (manuellement + script)
-- - Les politiques "user_points_*" sont probablement des anciennes

-- ✅ SOLUTION APPLIQUÉE:
-- - profiles: Créer les 4 politiques manquantes
-- - user_points: Supprimer les doublons, garder les politiques avec noms clairs

-- 🎯 RÉSULTAT ATTENDU:
-- - Chaque table a exactement 4 politiques
-- - Une politique par opération (SELECT, INSERT, UPDATE, DELETE)
-- - Trigger peut créer des profils (INSERT autorisé avec WITH CHECK true)
-- - Utilisateurs peuvent modifier leur profil (UPDATE avec auth.uid() = id)
-- - Plus d'erreurs 401 lors de l'inscription
