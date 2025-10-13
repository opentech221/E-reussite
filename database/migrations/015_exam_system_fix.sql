-- ============================================
-- Migration 015 FIX: Correction table exam_results
-- ============================================
-- Date: 8 octobre 2025
-- Description: 
--   Ajoute la colonne 'answers' manquante à exam_results
--   et crée les fonctions RPC nécessaires

-- ============================================
-- Ajouter la colonne answers si elle n'existe pas
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'exam_results' 
    AND column_name = 'answers'
  ) THEN
    ALTER TABLE exam_results ADD COLUMN answers JSONB;
    RAISE NOTICE 'Colonne answers ajoutée à exam_results';
  ELSE
    RAISE NOTICE 'Colonne answers existe déjà dans exam_results';
  END IF;
END $$;

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

-- Donner les permissions nécessaires
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
-- Vérifier les politiques RLS
-- ============================================
DO $$ 
BEGIN
  -- Vérifier si RLS est activé
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'exam_results' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS activé sur exam_results';
  END IF;

  -- Créer les politiques si elles n'existent pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exam_results' 
    AND policyname = 'Les utilisateurs peuvent voir leurs propres résultats'
  ) THEN
    CREATE POLICY "Les utilisateurs peuvent voir leurs propres résultats"
      ON exam_results FOR SELECT
      USING (auth.uid() = user_id);
    RAISE NOTICE 'Politique SELECT créée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exam_results' 
    AND policyname = 'Les utilisateurs peuvent insérer leurs propres résultats'
  ) THEN
    CREATE POLICY "Les utilisateurs peuvent insérer leurs propres résultats"
      ON exam_results FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE 'Politique INSERT créée';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exam_results' 
    AND policyname = 'Les admins peuvent voir tous les résultats'
  ) THEN
    CREATE POLICY "Les admins peuvent voir tous les résultats"
      ON exam_results FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      );
    RAISE NOTICE 'Politique admin SELECT créée';
  END IF;
END $$;

-- ============================================
-- Vérifier la structure finale
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'exam_results'
ORDER BY ordinal_position;

COMMENT ON TABLE exam_results IS 'Résultats des examens passés par les utilisateurs';
COMMENT ON FUNCTION add_user_points IS 'Ajoute des points à un utilisateur et enregistre dans l''historique';
COMMENT ON FUNCTION get_user_exam_stats IS 'Retourne les statistiques d''examens pour un utilisateur';

SELECT '✅ Migration 015 FIX : Système d''examens corrigé avec succès !' AS message;
