-- ============================================
-- MIGRATION 004: Points History Tracking
-- ============================================
-- Date: 5 octobre 2025
-- Description: Ajoute le suivi de l'historique des points pour les graphiques

-- Créer la table d'historique des points
CREATE TABLE IF NOT EXISTS user_points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_earned INT NOT NULL,
  action_type TEXT NOT NULL, -- 'quiz_completion', 'lesson_completed', 'streak_bonus', etc.
  action_details JSONB, -- Détails supplémentaires (quiz_id, score, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_points_history_user_id ON user_points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_history_created_at ON user_points_history(created_at);
CREATE INDEX IF NOT EXISTS idx_user_points_history_user_created ON user_points_history(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE user_points_history ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre historique
CREATE POLICY "Users can view their own points history"
  ON user_points_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Seul le système peut insérer (via service_role ou functions)
CREATE POLICY "Service role can insert points history"
  ON user_points_history
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Fonction pour récupérer l'historique agrégé par jour
-- ============================================
CREATE OR REPLACE FUNCTION get_user_points_history(
  p_user_id UUID,
  p_days INT DEFAULT 7
)
RETURNS TABLE (
  date DATE,
  points_earned INT,
  actions_count INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    SUM(points_earned)::INT as points_earned,
    COUNT(*)::INT as actions_count
  FROM user_points_history
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) ASC;
END;
$$;

-- ============================================
-- Trigger pour logger automatiquement dans l'historique
-- ============================================
-- Note: Cette fonction sera appelée manuellement depuis awardPoints
-- pour avoir plus de contrôle sur les détails

-- ============================================
-- Peupler l'historique avec les données existantes (optionnel)
-- ============================================
-- Cette section est commentée car elle nécessite des données existantes
-- Décommenter et adapter selon votre cas

/*
INSERT INTO user_points_history (user_id, points_earned, action_type, created_at)
SELECT 
  user_id,
  total_points / GREATEST(quizzes_completed, 1) as avg_points, -- Estimation
  'quiz_completion',
  NOW() - (random() * 30 || ' days')::INTERVAL -- Distribution sur 30 jours
FROM user_points
WHERE quizzes_completed > 0
  AND total_points > 0;
*/

-- ============================================
-- Vérification
-- ============================================
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'user_points_history'
ORDER BY ordinal_position;

-- Vérifier les indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_points_history';

-- Vérifier les policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_points_history';

-- ============================================
-- Test de la fonction
-- ============================================
-- Remplacer 'USER_ID' par un vrai user_id pour tester
-- SELECT * FROM get_user_points_history('USER_ID', 7);

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Table user_points_history créée avec:
-- - id (UUID)
-- - user_id (UUID FK)
-- - points_earned (INT)
-- - action_type (TEXT)
-- - action_details (JSONB)
-- - created_at (TIMESTAMP)
--
-- Indexes créés pour performance
-- RLS policies activées
-- Fonction get_user_points_history disponible
-- ============================================
