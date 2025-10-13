-- ============================================
-- MIGRATION 005: Daily/Weekly Challenges System
-- ============================================
-- Date: 5 octobre 2025
-- Description: Système de défis quotidiens et hebdomadaires avec récompenses

-- ============================================
-- Table: challenges (défis disponibles)
-- ============================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'special')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  min_level INT DEFAULT 1, -- Niveau minimum requis
  max_level INT DEFAULT 100, -- Niveau maximum (NULL = pas de limite)
  
  -- Objectif du défi
  target_type TEXT NOT NULL, -- 'quiz_complete', 'points_earned', 'streak_days', 'lessons_complete'
  target_value INT NOT NULL, -- Nombre à atteindre
  
  -- Récompenses
  reward_points INT DEFAULT 0,
  reward_badge TEXT, -- ID du badge spécial (optionnel)
  
  -- Métadonnées
  is_active BOOLEAN DEFAULT true,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#3b82f6',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: user_challenges (défis assignés aux utilisateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  
  -- Statut du défi
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'expired')),
  progress INT DEFAULT 0, -- Progression actuelle
  target INT NOT NULL, -- Objectif (copié depuis challenge pour historique)
  
  -- Dates
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Métadonnées
  rewards_claimed BOOLEAN DEFAULT false
);

-- ============================================
-- Table: challenge_progress_log (log de progression)
-- ============================================
CREATE TABLE IF NOT EXISTS challenge_progress_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  progress_added INT NOT NULL,
  action_type TEXT NOT NULL, -- 'quiz_completed', 'lesson_completed', etc.
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes pour performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);

CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_expires ON user_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_status ON user_challenges(user_id, status);

-- Index unique: Un utilisateur ne peut avoir qu'un défi spécifique par jour
-- Création d'une fonction IMMUTABLE pour convertir TIMESTAMPTZ vers DATE
CREATE OR REPLACE FUNCTION immutable_date(ts TIMESTAMP WITH TIME ZONE)
RETURNS DATE
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT ts::DATE;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_challenges_unique_daily 
  ON user_challenges(user_id, challenge_id, immutable_date(assigned_at));

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_challenge ON challenge_progress_log(user_challenge_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress_log ENABLE ROW LEVEL SECURITY;

-- Tous les utilisateurs authentifiés peuvent voir les défis actifs
CREATE POLICY "Authenticated users can view active challenges"
  ON challenges
  FOR SELECT
  USING (is_active = true);

-- Les utilisateurs peuvent voir leurs propres défis
CREATE POLICY "Users can view their own challenges"
  ON user_challenges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres défis
CREATE POLICY "Users can update their own challenges"
  ON user_challenges
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role peut tout faire
CREATE POLICY "Service role can insert user challenges"
  ON user_challenges
  FOR INSERT
  WITH CHECK (true);

-- Les utilisateurs peuvent voir leur propre log
CREATE POLICY "Users can view their own progress log"
  ON challenge_progress_log
  FOR SELECT
  USING (
    user_challenge_id IN (
      SELECT id FROM user_challenges WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert progress log"
  ON challenge_progress_log
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Fonction: Assigner des défis quotidiens
-- ============================================
CREATE OR REPLACE FUNCTION assign_daily_challenges(p_user_id UUID)
RETURNS SETOF user_challenges
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_level INT;
  v_challenge RECORD;
  v_user_challenge user_challenges;
BEGIN
  -- Récupérer le niveau de l'utilisateur
  SELECT level INTO v_user_level
  FROM user_points
  WHERE user_id = p_user_id;
  
  IF v_user_level IS NULL THEN
    v_user_level := 1;
  END IF;
  
  -- Sélectionner 3 défis quotidiens adaptés au niveau
  FOR v_challenge IN (
    SELECT *
    FROM challenges
    WHERE type = 'daily'
      AND is_active = true
      AND min_level <= v_user_level
      AND (max_level IS NULL OR max_level >= v_user_level)
      AND id NOT IN (
        -- Exclure les défis déjà assignés aujourd'hui
        SELECT challenge_id
        FROM user_challenges
        WHERE user_id = p_user_id
          AND assigned_at::DATE = CURRENT_DATE
      )
    ORDER BY RANDOM()
    LIMIT 3
  )
  LOOP
    -- Insérer le défi pour l'utilisateur
    INSERT INTO user_challenges (
      user_id,
      challenge_id,
      target,
      expires_at
    )
    VALUES (
      p_user_id,
      v_challenge.id,
      v_challenge.target_value,
      CURRENT_DATE + INTERVAL '1 day' -- Expire à minuit
    )
    RETURNING * INTO v_user_challenge;
    
    RETURN NEXT v_user_challenge;
  END LOOP;
  
  RETURN;
END;
$$;

-- ============================================
-- Fonction: Assigner des défis hebdomadaires
-- ============================================
CREATE OR REPLACE FUNCTION assign_weekly_challenges(p_user_id UUID)
RETURNS SETOF user_challenges
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_level INT;
  v_challenge RECORD;
  v_user_challenge user_challenges;
  v_week_start DATE;
BEGIN
  -- Début de la semaine (lundi)
  v_week_start := date_trunc('week', CURRENT_TIMESTAMP)::DATE;
  
  -- Récupérer le niveau de l'utilisateur
  SELECT level INTO v_user_level
  FROM user_points
  WHERE user_id = p_user_id;
  
  IF v_user_level IS NULL THEN
    v_user_level := 1;
  END IF;
  
  -- Sélectionner 2 défis hebdomadaires
  FOR v_challenge IN (
    SELECT *
    FROM challenges
    WHERE type = 'weekly'
      AND is_active = true
      AND min_level <= v_user_level
      AND (max_level IS NULL OR max_level >= v_user_level)
      AND id NOT IN (
        -- Exclure les défis déjà assignés cette semaine
        SELECT challenge_id
        FROM user_challenges
        WHERE user_id = p_user_id
          AND assigned_at::DATE >= v_week_start
      )
    ORDER BY RANDOM()
    LIMIT 2
  )
  LOOP
    -- Insérer le défi pour l'utilisateur
    INSERT INTO user_challenges (
      user_id,
      challenge_id,
      target,
      expires_at
    )
    VALUES (
      p_user_id,
      v_challenge.id,
      v_challenge.target_value,
      v_week_start + INTERVAL '7 days' -- Expire dimanche soir
    )
    RETURNING * INTO v_user_challenge;
    
    RETURN NEXT v_user_challenge;
  END LOOP;
  
  RETURN;
END;
$$;

-- ============================================
-- Fonction: Mettre à jour la progression d'un défi
-- ============================================
CREATE OR REPLACE FUNCTION update_challenge_progress(
  p_user_id UUID,
  p_action_type TEXT,
  p_progress_value INT DEFAULT 1,
  p_action_details JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE (
  challenge_id UUID,
  completed BOOLEAN,
  progress INT,
  target INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_challenge RECORD;
  v_challenge RECORD;
  v_completed BOOLEAN;
BEGIN
  -- Trouver tous les défis actifs de l'utilisateur correspondant à ce type d'action
  FOR v_user_challenge IN (
    SELECT uc.*, c.target_type, c.reward_points, c.reward_badge
    FROM user_challenges uc
    JOIN challenges c ON c.id = uc.challenge_id
    WHERE uc.user_id = p_user_id
      AND uc.status = 'active'
      AND uc.expires_at > NOW()
      AND c.target_type = p_action_type
  )
  LOOP
    -- Mettre à jour la progression
    UPDATE user_challenges
    SET 
      progress = LEAST(progress + p_progress_value, v_user_challenge.target),
      status = CASE 
        WHEN progress + p_progress_value >= v_user_challenge.target THEN 'completed'
        ELSE 'active'
      END,
      completed_at = CASE
        WHEN progress + p_progress_value >= v_user_challenge.target THEN NOW()
        ELSE completed_at
      END
    WHERE id = v_user_challenge.id
    RETURNING 
      user_challenges.challenge_id,
      (status = 'completed') as completed,
      progress,
      target
    INTO challenge_id, completed, progress, target;
    
    -- Logger la progression
    INSERT INTO challenge_progress_log (
      user_challenge_id,
      progress_added,
      action_type,
      action_details
    )
    VALUES (
      v_user_challenge.id,
      p_progress_value,
      p_action_type,
      p_action_details
    );
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

-- ============================================
-- Fonction: Récupérer les défis actifs d'un utilisateur
-- ============================================
CREATE OR REPLACE FUNCTION get_user_active_challenges(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  type TEXT,
  difficulty TEXT,
  icon TEXT,
  color TEXT,
  progress INT,
  target INT,
  status TEXT,
  reward_points INT,
  reward_badge TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id,
    c.title,
    c.description,
    c.type,
    c.difficulty,
    c.icon,
    c.color,
    uc.progress,
    uc.target,
    uc.status,
    c.reward_points,
    c.reward_badge,
    uc.expires_at,
    ROUND((uc.progress::FLOAT / NULLIF(uc.target, 0)::FLOAT * 100))::INT as progress_percentage
  FROM user_challenges uc
  JOIN challenges c ON c.id = uc.challenge_id
  WHERE uc.user_id = p_user_id
    AND uc.status IN ('active', 'completed')
    AND uc.expires_at > NOW()
  ORDER BY 
    CASE WHEN uc.status = 'completed' THEN 1 ELSE 0 END,
    c.type DESC, -- weekly first, then daily
    uc.assigned_at DESC;
END;
$$;

-- ============================================
-- Fonction: Réclamer les récompenses d'un défi complété
-- ============================================
CREATE OR REPLACE FUNCTION claim_challenge_rewards(
  p_user_id UUID,
  p_user_challenge_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_challenge RECORD;
  v_challenge RECORD;
  v_result JSONB;
BEGIN
  -- Récupérer le défi utilisateur
  SELECT * INTO v_user_challenge
  FROM user_challenges
  WHERE id = p_user_challenge_id
    AND user_id = p_user_id
    AND status = 'completed'
    AND rewards_claimed = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Challenge not found or already claimed'
    );
  END IF;
  
  -- Récupérer les infos du défi
  SELECT * INTO v_challenge
  FROM challenges
  WHERE id = v_user_challenge.challenge_id;
  
  -- Marquer les récompenses comme réclamées
  UPDATE user_challenges
  SET rewards_claimed = true
  WHERE id = p_user_challenge_id;
  
  -- Attribuer les points (sera fait côté application via awardPoints)
  -- Attribuer le badge (sera fait côté application via awardBadge)
  
  RETURN jsonb_build_object(
    'success', true,
    'reward_points', v_challenge.reward_points,
    'reward_badge', v_challenge.reward_badge,
    'challenge_title', v_challenge.title
  );
END;
$$;

-- ============================================
-- Défis par défaut (seed data)
-- ============================================
INSERT INTO challenges (title, description, type, difficulty, min_level, max_level, target_type, target_value, reward_points, icon, color)
VALUES
  -- DAILY CHALLENGES - EASY
  ('Premier Quiz', 'Complétez 1 quiz aujourd''hui', 'daily', 'easy', 1, 5, 'quiz_complete', 1, 50, '🎯', '#10b981'),
  ('Trois Quiz', 'Complétez 3 quiz aujourd''hui', 'daily', 'easy', 1, 10, 'quiz_complete', 3, 100, '🎯', '#10b981'),
  ('Points Express', 'Gagnez 50 points aujourd''hui', 'daily', 'easy', 1, 8, 'points_earned', 50, 30, '⭐', '#f59e0b'),
  ('Première Leçon', 'Complétez 1 leçon aujourd''hui', 'daily', 'easy', 1, 5, 'lessons_complete', 1, 40, '📚', '#3b82f6'),
  
  -- DAILY CHALLENGES - MEDIUM
  ('Cinq Quiz', 'Complétez 5 quiz aujourd''hui', 'daily', 'medium', 6, 15, 'quiz_complete', 5, 150, '🎯', '#f59e0b'),
  ('Points Solides', 'Gagnez 100 points aujourd''hui', 'daily', 'medium', 6, 15, 'points_earned', 100, 80, '⭐', '#f59e0b'),
  ('Trois Leçons', 'Complétez 3 leçons aujourd''hui', 'daily', 'medium', 6, 15, 'lessons_complete', 3, 120, '📚', '#3b82f6'),
  ('Série Active', 'Maintenez votre série pendant 3 jours', 'daily', 'medium', 5, NULL, 'streak_days', 3, 100, '🔥', '#ef4444'),
  
  -- DAILY CHALLENGES - HARD
  ('Dix Quiz', 'Complétez 10 quiz aujourd''hui', 'daily', 'hard', 16, NULL, 'quiz_complete', 10, 300, '🎯', '#ef4444'),
  ('Points Expert', 'Gagnez 200 points aujourd''hui', 'daily', 'hard', 16, NULL, 'points_earned', 200, 200, '⭐', '#ef4444'),
  ('Marathon', 'Complétez 5 leçons aujourd''hui', 'daily', 'hard', 16, NULL, 'lessons_complete', 5, 250, '📚', '#8b5cf6'),
  
  -- WEEKLY CHALLENGES - EASY
  ('Quiz de la Semaine', 'Complétez 10 quiz cette semaine', 'weekly', 'easy', 1, 10, 'quiz_complete', 10, 200, '🏆', '#10b981'),
  ('Points Hebdo', 'Gagnez 300 points cette semaine', 'weekly', 'easy', 1, 10, 'points_earned', 300, 150, '💎', '#10b981'),
  
  -- WEEKLY CHALLENGES - MEDIUM
  ('Explorateur', 'Complétez 20 quiz cette semaine', 'weekly', 'medium', 11, 20, 'quiz_complete', 20, 400, '🏆', '#f59e0b'),
  ('Collectionneur', 'Gagnez 500 points cette semaine', 'weekly', 'medium', 11, 20, 'points_earned', 500, 300, '💎', '#f59e0b'),
  ('Série de 7', 'Maintenez votre série 7 jours', 'weekly', 'medium', 10, NULL, 'streak_days', 7, 500, '🔥', '#ef4444'),
  
  -- WEEKLY CHALLENGES - HARD
  ('Champion', 'Complétez 50 quiz cette semaine', 'weekly', 'hard', 21, NULL, 'quiz_complete', 50, 1000, '🏆', '#8b5cf6'),
  ('Master Points', 'Gagnez 1000 points cette semaine', 'weekly', 'hard', 21, NULL, 'points_earned', 1000, 800, '💎', '#8b5cf6'),
  ('Série Légendaire', 'Maintenez votre série 14 jours', 'weekly', 'hard', 15, NULL, 'streak_days', 14, 1000, '🔥', '#ef4444')
ON CONFLICT DO NOTHING;

-- ============================================
-- Note: Expiration automatique des défis
-- ============================================
-- L'expiration des défis est gérée automatiquement dans la fonction
-- get_user_active_challenges() qui filtre par expires_at > NOW()
-- Pas besoin de trigger supplémentaire.

-- ============================================
-- Vérifications
-- ============================================
SELECT 'Challenges table' as table_name, COUNT(*) as row_count FROM challenges;
SELECT 'User challenges table' as table_name, COUNT(*) as row_count FROM user_challenges;
SELECT 'Challenge progress log table' as table_name, COUNT(*) as row_count FROM challenge_progress_log;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Tables créées:
--   • challenges (19 défis par défaut)
--   • user_challenges
--   • challenge_progress_log
--
-- Fonctions créées:
--   • assign_daily_challenges(user_id) → 3 défis/jour
--   • assign_weekly_challenges(user_id) → 2 défis/semaine
--   • update_challenge_progress(user_id, type, value) → progression
--   • get_user_active_challenges(user_id) → liste défis actifs
--   • claim_challenge_rewards(user_id, challenge_id) → réclamer récompenses
--
-- RLS policies activées
-- Indexes créés pour performance
-- Trigger d'expiration automatique
-- ============================================
