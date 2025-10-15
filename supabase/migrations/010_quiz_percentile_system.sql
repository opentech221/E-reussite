-- ═══════════════════════════════════════════════════════════════════
-- 📊 MIGRATION 010 - SYSTÈME DE PERCENTILE & BADGES DE RANG QUIZ
-- ═══════════════════════════════════════════════════════════════════
-- Date: 15 octobre 2025
-- Description: Ajoute table rankings et fonction percentile pour quiz
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────
-- 1️⃣ TABLE user_quiz_rankings
-- ───────────────────────────────────────────────────────────────────
-- Stocke les classements et percentiles des utilisateurs pour les quiz

CREATE TABLE IF NOT EXISTS user_quiz_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Statistiques quiz
  total_quizzes INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0, -- Moyenne des scores (0-100)
  best_score INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  
  -- Classement
  percentile NUMERIC(5,2) DEFAULT 0, -- 0-100 (ex: 85.50 = Top 15%)
  rank_tier VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond
  global_rank INTEGER, -- Position globale (1, 2, 3...)
  
  -- Métadonnées
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contraintes
  UNIQUE(user_id),
  CONSTRAINT valid_percentile CHECK (percentile >= 0 AND percentile <= 100),
  CONSTRAINT valid_rank_tier CHECK (rank_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'))
);

-- Index pour performances
CREATE INDEX idx_user_quiz_rankings_user ON user_quiz_rankings(user_id);
CREATE INDEX idx_user_quiz_rankings_percentile ON user_quiz_rankings(percentile DESC);
CREATE INDEX idx_user_quiz_rankings_rank ON user_quiz_rankings(global_rank ASC);
CREATE INDEX idx_user_quiz_rankings_tier ON user_quiz_rankings(rank_tier);

-- ───────────────────────────────────────────────────────────────────
-- 2️⃣ FONCTION calculate_user_quiz_percentile
-- ───────────────────────────────────────────────────────────────────
-- Calcule le percentile d'un utilisateur basé sur son score moyen

CREATE OR REPLACE FUNCTION calculate_user_quiz_percentile(p_user_id UUID)
RETURNS TABLE (
  percentile NUMERIC,
  rank_tier VARCHAR,
  global_rank INTEGER,
  total_users INTEGER
) AS $$
DECLARE
  v_avg_score NUMERIC;
  v_percentile NUMERIC;
  v_rank_tier VARCHAR;
  v_global_rank INTEGER;
  v_total_users INTEGER;
BEGIN
  -- Récupérer le score moyen de l'utilisateur
  SELECT average_score INTO v_avg_score
  FROM user_quiz_rankings
  WHERE user_id = p_user_id;
  
  -- Si pas de données, retourner valeurs par défaut
  IF v_avg_score IS NULL THEN
    RETURN QUERY SELECT 0::NUMERIC, 'bronze'::VARCHAR, 0::INTEGER, 0::INTEGER;
    RETURN;
  END IF;
  
  -- Compter le nombre total d'utilisateurs avec au moins 1 quiz
  SELECT COUNT(*) INTO v_total_users
  FROM user_quiz_rankings
  WHERE total_quizzes > 0;
  
  -- Calculer le nombre d'utilisateurs avec un score inférieur
  SELECT COUNT(*) INTO v_global_rank
  FROM user_quiz_rankings
  WHERE average_score > v_avg_score
    AND total_quizzes > 0;
  
  -- Le rang global est le nombre d'utilisateurs meilleurs + 1
  v_global_rank := v_global_rank + 1;
  
  -- Calculer le percentile (% d'utilisateurs avec score inférieur)
  IF v_total_users > 0 THEN
    v_percentile := ROUND(
      ((v_total_users - v_global_rank + 1)::NUMERIC / v_total_users::NUMERIC) * 100,
      2
    );
  ELSE
    v_percentile := 0;
  END IF;
  
  -- Déterminer le tier basé sur le percentile
  CASE
    WHEN v_percentile >= 95 THEN v_rank_tier := 'diamond';
    WHEN v_percentile >= 85 THEN v_rank_tier := 'platinum';
    WHEN v_percentile >= 70 THEN v_rank_tier := 'gold';
    WHEN v_percentile >= 50 THEN v_rank_tier := 'silver';
    ELSE v_rank_tier := 'bronze';
  END CASE;
  
  -- Retourner les résultats
  RETURN QUERY SELECT v_percentile, v_rank_tier, v_global_rank, v_total_users;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────
-- 3️⃣ FONCTION update_user_quiz_ranking
-- ───────────────────────────────────────────────────────────────────
-- Met à jour le ranking d'un utilisateur après chaque quiz

CREATE OR REPLACE FUNCTION update_user_quiz_ranking(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_quizzes INTEGER;
  v_average_score NUMERIC;
  v_best_score INTEGER;
  v_total_time INTEGER;
  v_percentile NUMERIC;
  v_rank_tier VARCHAR;
  v_global_rank INTEGER;
BEGIN
  -- Calculer les statistiques depuis interactive_quiz_sessions
  SELECT 
    COUNT(*),
    ROUND(AVG(score_percentage), 2),
    MAX(score_percentage),
    SUM(time_elapsed)
  INTO 
    v_total_quizzes,
    v_average_score,
    v_best_score,
    v_total_time
  FROM interactive_quiz_sessions
  WHERE user_id = p_user_id
    AND status = 'completed';
  
  -- Si pas de quiz, initialiser à zéro
  IF v_total_quizzes IS NULL THEN
    v_total_quizzes := 0;
    v_average_score := 0;
    v_best_score := 0;
    v_total_time := 0;
  END IF;
  
  -- Upsert dans user_quiz_rankings
  INSERT INTO user_quiz_rankings (
    user_id,
    total_quizzes,
    average_score,
    best_score,
    total_time_seconds,
    updated_at
  )
  VALUES (
    p_user_id,
    v_total_quizzes,
    v_average_score,
    v_best_score,
    v_total_time,
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_quizzes = EXCLUDED.total_quizzes,
    average_score = EXCLUDED.average_score,
    best_score = EXCLUDED.best_score,
    total_time_seconds = EXCLUDED.total_time_seconds,
    updated_at = now();
  
  -- Calculer le percentile
  SELECT p.percentile, p.rank_tier, p.global_rank
  INTO v_percentile, v_rank_tier, v_global_rank
  FROM calculate_user_quiz_percentile(p_user_id) p;
  
  -- Mettre à jour le percentile et le tier
  UPDATE user_quiz_rankings
  SET 
    percentile = v_percentile,
    rank_tier = v_rank_tier,
    global_rank = v_global_rank,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────
-- 4️⃣ TRIGGER auto_update_ranking
-- ───────────────────────────────────────────────────────────────────
-- Met à jour automatiquement le ranking après chaque quiz complété

CREATE OR REPLACE FUNCTION trigger_update_quiz_ranking()
RETURNS TRIGGER AS $$
BEGIN
  -- Seulement si le quiz est complété
  IF NEW.status = 'completed' THEN
    PERFORM update_user_quiz_ranking(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_quiz_ranking
AFTER INSERT OR UPDATE ON interactive_quiz_sessions
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION trigger_update_quiz_ranking();

-- ───────────────────────────────────────────────────────────────────
-- 5️⃣ VUE quiz_leaderboard
-- ───────────────────────────────────────────────────────────────────
-- Vue pour récupérer facilement le classement complet

CREATE OR REPLACE VIEW quiz_leaderboard AS
SELECT 
  r.user_id,
  p.full_name,
  p.avatar_url,
  r.total_quizzes,
  r.average_score,
  r.best_score,
  r.percentile,
  r.rank_tier,
  r.global_rank,
  r.updated_at
FROM user_quiz_rankings r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.total_quizzes > 0
ORDER BY r.global_rank ASC;

-- ───────────────────────────────────────────────────────────────────
-- 6️⃣ FONCTION get_quiz_leaderboard
-- ───────────────────────────────────────────────────────────────────
-- Récupère le classement avec filtre optionnel par tier

CREATE OR REPLACE FUNCTION get_quiz_leaderboard(
  p_limit INTEGER DEFAULT 100,
  p_tier VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  total_quizzes INTEGER,
  average_score NUMERIC,
  best_score INTEGER,
  percentile NUMERIC,
  rank_tier VARCHAR,
  global_rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ql.user_id,
    ql.full_name,
    ql.avatar_url,
    ql.total_quizzes,
    ql.average_score,
    ql.best_score,
    ql.percentile,
    ql.rank_tier,
    ql.global_rank
  FROM quiz_leaderboard ql
  WHERE (p_tier IS NULL OR ql.rank_tier = p_tier)
  ORDER BY ql.global_rank ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────
-- 7️⃣ FONCTION get_user_quiz_stats
-- ───────────────────────────────────────────────────────────────────
-- Récupère les stats complètes d'un utilisateur pour affichage

CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id UUID)
RETURNS TABLE (
  total_quizzes INTEGER,
  average_score NUMERIC,
  best_score INTEGER,
  percentile NUMERIC,
  rank_tier VARCHAR,
  global_rank INTEGER,
  total_users INTEGER,
  users_below INTEGER
) AS $$
DECLARE
  v_total_users INTEGER;
  v_users_below INTEGER;
BEGIN
  -- Compter le total d'utilisateurs
  SELECT COUNT(*) INTO v_total_users
  FROM user_quiz_rankings
  WHERE total_quizzes > 0;
  
  -- Calculer les utilisateurs en dessous
  SELECT v_total_users - global_rank INTO v_users_below
  FROM user_quiz_rankings
  WHERE user_id = p_user_id;
  
  -- Retourner les stats
  RETURN QUERY
  SELECT 
    r.total_quizzes,
    r.average_score,
    r.best_score,
    r.percentile,
    r.rank_tier,
    r.global_rank,
    v_total_users,
    v_users_below
  FROM user_quiz_rankings r
  WHERE r.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────
-- 8️⃣ PERMISSIONS RLS
-- ───────────────────────────────────────────────────────────────────

-- Activer RLS
ALTER TABLE user_quiz_rankings ENABLE ROW LEVEL SECURITY;

-- Lecture : Tout le monde peut voir tous les rankings (anonymisés côté app)
CREATE POLICY "Public can view quiz rankings"
  ON user_quiz_rankings FOR SELECT
  TO public
  USING (true);

-- Écriture : Seulement via triggers/fonctions
CREATE POLICY "Only triggers can modify rankings"
  ON user_quiz_rankings FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- ───────────────────────────────────────────────────────────────────
-- 9️⃣ COMMENTAIRES
-- ───────────────────────────────────────────────────────────────────

COMMENT ON TABLE user_quiz_rankings IS 'Classements et percentiles des utilisateurs pour les quiz interactifs';
COMMENT ON COLUMN user_quiz_rankings.percentile IS 'Percentile 0-100 (95 = Top 5%)';
COMMENT ON COLUMN user_quiz_rankings.rank_tier IS 'Tier: bronze (0-50%), silver (50-70%), gold (70-85%), platinum (85-95%), diamond (95-100%)';
COMMENT ON FUNCTION calculate_user_quiz_percentile IS 'Calcule le percentile d''un utilisateur basé sur son score moyen';
COMMENT ON FUNCTION update_user_quiz_ranking IS 'Met à jour le ranking après chaque quiz complété';
COMMENT ON FUNCTION get_quiz_leaderboard IS 'Récupère le classement complet avec filtre optionnel par tier';
COMMENT ON FUNCTION get_user_quiz_stats IS 'Récupère les stats complètes d''un utilisateur pour affichage dans l''UI';

-- ═══════════════════════════════════════════════════════════════════
-- ✅ MIGRATION TERMINÉE
-- ═══════════════════════════════════════════════════════════════════
-- Tables créées: user_quiz_rankings (1)
-- Fonctions créées: 5 (calculate, update, trigger, get_leaderboard, get_stats)
-- Vue créée: quiz_leaderboard (1)
-- Triggers créés: auto_update_quiz_ranking (1)
-- ═══════════════════════════════════════════════════════════════════
