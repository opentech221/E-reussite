-- 🔧 CORRIGER RLS POUR LEADERBOARD
-- Date : 7 octobre 2025
-- Problème : La politique allow_select_own_profile bloque la vue des autres profils
-- Solution : Ajouter une politique pour permettre de voir tous les profils

-- ============================================================
-- ÉTAPE 1 : SUPPRIMER L'ANCIENNE POLITIQUE RESTRICTIVE
-- ============================================================

DROP POLICY IF EXISTS "allow_select_own_profile" ON profiles;

-- ============================================================
-- ÉTAPE 2 : CRÉER UNE NOUVELLE POLITIQUE PERMISSIVE
-- ============================================================

-- Permettre à tous les utilisateurs authentifiés de voir tous les profils
-- (nécessaire pour le leaderboard, badges, etc.)
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- ============================================================
-- ÉTAPE 3 : VÉRIFICATION
-- ============================================================

-- Voir les politiques actives
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Tester : Compter les profils visibles
SELECT COUNT(*) as visible_profiles FROM profiles;

-- Tester : Voir tous les profils avec leurs points
SELECT 
  p.id, 
  p.full_name,
  COALESCE(up.total_points, 0) as total_points
FROM profiles p
LEFT JOIN user_points up ON up.user_id = p.id
ORDER BY total_points DESC;

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================

/*
Après exécution :
1. La politique "allow_select_own_profile" est supprimée
2. Une nouvelle politique "Public profiles are viewable by authenticated users" est créée
3. La requête de vérification doit retourner 3 profils (ou plus)
4. Le Leaderboard affichera maintenant tous les utilisateurs !

Important : Cette politique permet à tous les utilisateurs authentifiés
de voir tous les profils publics, ce qui est nécessaire pour :
- Le classement (Leaderboard)
- Les badges communautaires
- Les statistiques globales
- Les comparaisons entre utilisateurs

Les autres politiques (INSERT, UPDATE, DELETE) restent restrictives,
donc chaque utilisateur ne peut toujours modifier que son propre profil.
*/
