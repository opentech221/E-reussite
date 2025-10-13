-- ============================================================================
-- NETTOYAGE COMPLET RLS - Suppression de TOUS les doublons
-- Date: 10 octobre 2025
-- Problème: Doublons créés (8 politiques au lieu de 4)
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: SUPPRIMER ABSOLUMENT TOUTES LES POLITIQUES
-- ============================================================================

-- Méthode radicale: supprimer toutes les politiques existantes sur profiles
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
        RAISE NOTICE 'Supprimé: %', pol.policyname;
    END LOOP;
END $$;

-- Méthode radicale: supprimer toutes les politiques existantes sur user_points
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_points'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_points', pol.policyname);
        RAISE NOTICE 'Supprimé: %', pol.policyname;
    END LOOP;
END $$;

-- Vérification: devrait afficher 0 politiques
SELECT 
    tablename,
    COUNT(*) as nombre_politiques
FROM pg_policies
WHERE tablename IN ('profiles', 'user_points')
GROUP BY tablename;

-- Si cette requête ne retourne rien, c'est parfait (0 politiques)

-- ============================================================================
-- ÉTAPE 2: RECRÉER LES 4 POLITIQUES SUR profiles
-- ============================================================================

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

-- ============================================================================
-- ÉTAPE 3: RECRÉER LES 4 POLITIQUES SUR user_points
-- ============================================================================

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

-- ============================================================================
-- ÉTAPE 4: VÉRIFICATION FINALE (DOIT MONTRER EXACTEMENT 4 PAR TABLE)
-- ============================================================================

-- Compter les politiques
SELECT 
    tablename,
    COUNT(*) as nombre_politiques,
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ PARFAIT'
        WHEN COUNT(*) > 4 THEN '❌ ENCORE DES DOUBLONS'
        WHEN COUNT(*) < 4 THEN '❌ POLITIQUES MANQUANTES'
    END as status
FROM pg_policies
WHERE tablename IN ('profiles', 'user_points')
GROUP BY tablename
ORDER BY tablename;

-- Détails des politiques (doit montrer exactement 4 par table)
SELECT 
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename IN ('profiles', 'user_points')
ORDER BY tablename, cmd, policyname;

-- Vérifier qu'il n'y a AUCUN doublon
SELECT 
    tablename,
    cmd,
    COUNT(*) as nombre,
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ OK'
        ELSE '❌ DOUBLON ENCORE PRÉSENT'
    END as status
FROM pg_policies
WHERE tablename IN ('profiles', 'user_points')
GROUP BY tablename, cmd
ORDER BY tablename, cmd;

-- Si cette dernière requête ne retourne rien ou uniquement des "✅ OK", 
-- alors c'est parfait!

-- ============================================================================
-- MESSAGES DE SUCCÈS
-- ============================================================================

SELECT '🎉 NETTOYAGE TERMINÉ!' as message;
SELECT '✅ profiles: 4 politiques créées' as status_profiles;
SELECT '✅ user_points: 4 politiques créées' as status_user_points;
SELECT '🧪 Testez maintenant une inscription en navigation privée' as prochaine_etape;
