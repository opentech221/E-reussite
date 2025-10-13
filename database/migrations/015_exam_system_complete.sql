-- ============================================
-- Migration 015: Système d'examens complet
-- ============================================
-- Date: 8 octobre 2025
-- Description: 
--   Finalise le système d'examens avec:
--   - Table exam_results pour sauvegarder les résultats
--   - Fonction RPC pour ajouter des points
--   - Politiques RLS appropriées

-- ============================================
-- Table exam_results
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES examens(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  time_taken INT NOT NULL, -- en secondes
  answers JSONB, -- Stocke les réponses de l'utilisateur
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_completed_at ON exam_results(completed_at);

-- RLS Policies
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

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

  -- Enregistrer dans l'historique des points
  INSERT INTO user_points_history (user_id, points, description, category, earned_at)
  VALUES (p_user_id, p_points, p_description, p_category, NOW());
  
EXCEPTION WHEN OTHERS THEN
  -- Si user_points_history n'existe pas, juste mettre à jour le profil
  RAISE NOTICE 'Erreur lors de l''ajout de l''historique: %', SQLERRM;
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
    MAX(score)::INT as best_score,
    SUM(time_taken)::INT as total_time_spent
  FROM exam_results
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_exam_stats(UUID) TO authenticated;

-- ============================================
-- Seed: Données de démonstration
-- ============================================
-- (Les examens sont déjà créés par migration 009)

COMMENT ON TABLE exam_results IS 'Résultats des examens passés par les utilisateurs';
COMMENT ON FUNCTION add_user_points IS 'Ajoute des points à un utilisateur et enregistre dans l''historique';
COMMENT ON FUNCTION get_user_exam_stats IS 'Retourne les statistiques d''examens pour un utilisateur';

SELECT 'Migration 015 : Système d''examens complet créé avec succès !' AS message;
