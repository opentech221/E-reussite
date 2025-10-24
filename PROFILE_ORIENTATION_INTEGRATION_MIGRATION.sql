-- ============================================
-- MIGRATION : INTÉGRATION PROFIL ↔ ORIENTATION
-- Date : 24 octobre 2025
-- Objectif : Lier profil utilisateur et résultats orientation
-- ============================================

-- PARTIE 1 : EXTENSION TABLE PROFILES
-- ====================================

-- Ajout colonnes orientation dans profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS orientation_test_id UUID REFERENCES orientation_tests(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_careers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS orientation_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS top_career_match_score INTEGER;

-- Commentaires
COMMENT ON COLUMN profiles.orientation_test_id IS 'Référence au dernier test d''orientation effectué';
COMMENT ON COLUMN profiles.preferred_careers IS 'Top 3-5 carrières recommandées avec scores [{"slug": "...", "title": "...", "score": 85}]';
COMMENT ON COLUMN profiles.orientation_completed_at IS 'Date de complétion du dernier test d''orientation';
COMMENT ON COLUMN profiles.top_career_match_score IS 'Score de la meilleure carrière (pour Coach IA)';

-- PARTIE 2 : EXTENSION TABLE ORIENTATION_TESTS
-- =============================================

-- Ajout colonne profil pré-rempli depuis profil
ALTER TABLE orientation_tests ADD COLUMN IF NOT EXISTS prefilled_from_profile BOOLEAN DEFAULT false;

COMMENT ON COLUMN orientation_tests.prefilled_from_profile IS 'Indique si le test a été pré-rempli avec données profil (Q13-Q17)';

-- PARTIE 3 : INDEX POUR PERFORMANCES
-- ===================================

CREATE INDEX IF NOT EXISTS idx_profiles_orientation_test_id ON profiles(orientation_test_id);
CREATE INDEX IF NOT EXISTS idx_profiles_orientation_completed_at ON profiles(orientation_completed_at);
CREATE INDEX IF NOT EXISTS idx_orientation_tests_user_id_created_at ON orientation_tests(user_id, created_at DESC);

-- PARTIE 4 : FONCTION TRIGGER AUTO-UPDATE
-- ========================================

-- Fonction pour synchroniser automatiquement profil quand test orientation complété
CREATE OR REPLACE FUNCTION sync_profile_orientation()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand un test orientation est complété, mettre à jour le profil
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR NEW.completed_at <> OLD.completed_at) THEN
    UPDATE profiles
    SET 
      orientation_test_id = NEW.id,
      orientation_completed_at = NEW.completed_at
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur orientation_tests
DROP TRIGGER IF EXISTS trigger_sync_profile_orientation ON orientation_tests;
CREATE TRIGGER trigger_sync_profile_orientation
  AFTER UPDATE ON orientation_tests
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_orientation();

-- PARTIE 5 : FONCTION UTILITAIRE - RÉCUPÉRER TOP CARRIÈRES
-- =========================================================

CREATE OR REPLACE FUNCTION get_user_top_careers(p_user_id UUID, p_limit INTEGER DEFAULT 3)
RETURNS TABLE (
  career_slug VARCHAR,
  career_title VARCHAR,
  match_score INTEGER,
  category VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oa.career_slug,
    c.title,
    oa.score,
    c.category
  FROM orientation_answers oa
  JOIN orientation_tests ot ON oa.test_id = ot.id
  JOIN careers c ON oa.career_slug = c.slug
  WHERE ot.user_id = p_user_id
    AND ot.completed_at IS NOT NULL
  ORDER BY ot.completed_at DESC, oa.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_top_careers IS 'Récupère les top carrières pour un utilisateur depuis son dernier test';

-- PARTIE 6 : POLITIQUE RLS (SI NÉCESSAIRE)
-- =========================================

-- Vérifier que les utilisateurs peuvent lire leurs propres données orientation depuis profil
-- (RLS déjà en place, cette partie est préventive)

-- Les policies existantes sur profiles permettent déjà:
-- - SELECT: utilisateur authentifié peut lire son profil
-- - UPDATE: utilisateur peut mettre à jour son profil

-- Aucune modification RLS nécessaire si policies déjà correctes

-- ============================================
-- VÉRIFICATION POST-MIGRATION
-- ============================================

-- Vérifier nouvelles colonnes profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('orientation_test_id', 'preferred_careers', 'orientation_completed_at', 'top_career_match_score')
ORDER BY ordinal_position;

-- Vérifier nouvelle colonne orientation_tests
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orientation_tests'
  AND column_name = 'prefilled_from_profile';

-- Vérifier index créés
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
  AND indexname LIKE '%orientation%';

-- Vérifier trigger créé
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_sync_profile_orientation';

-- Vérifier fonction utilitaire
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'get_user_top_careers';

-- ============================================
-- NOTES D'UTILISATION
-- ============================================

/*
APRÈS CETTE MIGRATION:

1. Le profil stockera automatiquement le dernier test d'orientation
2. Le trigger sync_profile_orientation() mettra à jour profiles.orientation_test_id 
   automatiquement quand orientation_tests.completed_at est défini
3. Le frontend devra appeler manuellement la mise à jour de preferred_careers 
   après calcul des scores (via service)
4. La fonction get_user_top_careers() peut être appelée depuis le backend 
   pour récupérer rapidement les top carrières d'un utilisateur

EXEMPLE D'USAGE FRONTEND:
- Après calcul scores orientation, appeler:
  UPDATE profiles 
  SET preferred_careers = '[{"slug": "data-scientist", "title": "Data Scientist", "score": 92}, ...]'::jsonb,
      top_career_match_score = 92
  WHERE user_id = 'xxx';

- Pour afficher section "Mon Orientation" dans profil:
  SELECT preferred_careers, orientation_completed_at, top_career_match_score
  FROM profiles
  WHERE user_id = 'xxx';
*/

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
