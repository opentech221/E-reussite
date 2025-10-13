-- ============================================
-- Migration 015 FIX v2: Correction complète exam_results
-- ============================================
-- Date: 8 octobre 2025
-- Description: 
--   Ajoute TOUTES les colonnes manquantes à exam_results

-- ============================================
-- Vérifier et ajouter les colonnes manquantes
-- ============================================

-- Colonne: answers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exam_results' AND column_name = 'answers'
  ) THEN
    ALTER TABLE exam_results ADD COLUMN answers JSONB;
    RAISE NOTICE '✅ Colonne answers ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne answers existe déjà';
  END IF;
END $$;

-- Colonne: time_taken
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exam_results' AND column_name = 'time_taken'
  ) THEN
    ALTER TABLE exam_results ADD COLUMN time_taken INT NOT NULL DEFAULT 0;
    RAISE NOTICE '✅ Colonne time_taken ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne time_taken existe déjà';
  END IF;
END $$;

-- Colonne: completed_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exam_results' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE exam_results ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✅ Colonne completed_at ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne completed_at existe déjà';
  END IF;
END $$;

-- Vérifier que les colonnes essentielles existent
DO $$ 
BEGIN
  -- user_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exam_results' AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'Colonne user_id manquante ! La table exam_results doit être recréée.';
  END IF;

  -- exam_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exam_results' AND column_name = 'exam_id'
  ) THEN
    RAISE EXCEPTION 'Colonne exam_id manquante ! La table exam_results doit être recréée.';
  END IF;

  -- score
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exam_results' AND column_name = 'score'
  ) THEN
    RAISE EXCEPTION 'Colonne score manquante ! La table exam_results doit être recréée.';
  END IF;

  RAISE NOTICE '✓ Colonnes essentielles vérifiées';
END $$;

-- ============================================
-- Créer les index si nécessaires
-- ============================================
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_completed_at ON exam_results(completed_at);

-- ============================================
-- Fonction RPC: add_user_points
-- ============================================
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INT,
  p_description TEXT DEFAULT NULL,
  p_category TEXT DEFAULT 'general'
)
RETURNS void AS $$
BEGIN
  -- Ajouter les points au profil de l'utilisateur
  UPDATE user_profiles
  SET points = COALESCE(points, 0) + p_points
  WHERE id = p_user_id;

  -- Enregistrer dans l'historique des points (si la table existe)
  BEGIN
    INSERT INTO user_points_history (user_id, points, description, category, earned_at)
    VALUES (p_user_id, p_points, p_description, p_category, NOW());
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table user_points_history non trouvée, points ajoutés au profil uniquement';
  END;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erreur lors de l''ajout de points: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_user_points(UUID, INT, TEXT, TEXT) TO authenticated;

-- ============================================
-- Fonction: get_user_exam_stats
-- ============================================
CREATE OR REPLACE FUNCTION get_user_exam_stats(p_user_id UUID)
RETURNS TABLE (
  total_exams INT,
  completed_exams INT,
  average_score NUMERIC,
  best_score INT,
  total_time_spent INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INT FROM examens) as total_exams,
    COUNT(*)::INT as completed_exams,
    ROUND(AVG(score), 2) as average_score,
    COALESCE(MAX(score), 0)::INT as best_score,
    COALESCE(SUM(time_taken), 0)::INT as total_time_spent
  FROM exam_results
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_exam_stats(UUID) TO authenticated;

-- ============================================
-- Vérifier et créer les politiques RLS
-- ============================================
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- Drop les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres résultats" ON exam_results;
DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leurs propres résultats" ON exam_results;
DROP POLICY IF EXISTS "Les admins peuvent voir tous les résultats" ON exam_results;

-- Créer les nouvelles politiques
CREATE POLICY "Les utilisateurs peuvent voir leurs propres résultats"
  ON exam_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leurs propres résultats"
  ON exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les admins peuvent voir tous les résultats"
  ON exam_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- Afficher la structure finale
-- ============================================
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'exam_results'
ORDER BY ordinal_position;

COMMENT ON TABLE exam_results IS 'Résultats des examens passés par les utilisateurs';
COMMENT ON FUNCTION add_user_points IS 'Ajoute des points à un utilisateur et enregistre dans l''historique';
COMMENT ON FUNCTION get_user_exam_stats IS 'Retourne les statistiques d''examens pour un utilisateur';

SELECT '✅ Migration 015 FIX v2 : Toutes les colonnes ajoutées avec succès !' AS message;
