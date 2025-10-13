-- ============================================
-- MIGRATION 012 - Defis d'apprentissage hebdomadaires
-- ============================================
-- Date: 7 octobre 2025
-- Description: Systeme de defis hebdomadaires pour encourager l'apprentissage regulier

-- ============================================
-- TABLE 1: learning_challenges (Defis disponibles)
-- ============================================
CREATE TABLE IF NOT EXISTS learning_challenges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  challenge_type VARCHAR(50) NOT NULL, -- 'weekly_lessons', 'weekly_chapters', 'subject_lessons', 'daily_lessons'
  target_value INT NOT NULL, -- Objectif a atteindre
  reward_points INT NOT NULL, -- Points gagnes a la completion
  week_number INT, -- Numero de semaine (pour tracking)
  year INT, -- Annee (pour tracking)
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_challenges_type ON learning_challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_learning_challenges_week ON learning_challenges(week_number, year);
CREATE INDEX IF NOT EXISTS idx_learning_challenges_dates ON learning_challenges(start_date, end_date);

-- ============================================
-- TABLE 2: user_learning_challenges (Progression utilisateur)
-- ============================================
CREATE TABLE IF NOT EXISTS user_learning_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id INT NOT NULL REFERENCES learning_challenges(id) ON DELETE CASCADE,
  current_progress INT DEFAULT 0,
  target_value INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_learning_challenges_user ON user_learning_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_challenges_challenge ON user_learning_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_challenges_completed ON user_learning_challenges(is_completed);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE learning_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_challenges ENABLE ROW LEVEL SECURITY;

-- Lecture des defis: tous les utilisateurs authentifies
CREATE POLICY "learning_challenges_select_all"
  ON learning_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Lecture progression: utilisateur voit sa propre progression
CREATE POLICY "user_learning_challenges_select_own"
  ON user_learning_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insertion progression: utilisateur peut creer sa progression
CREATE POLICY "user_learning_challenges_insert_own"
  ON user_learning_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Mise a jour progression: utilisateur peut mettre a jour sa progression
CREATE POLICY "user_learning_challenges_update_own"
  ON user_learning_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- FONCTION 1: Generer les defis hebdomadaires
-- ============================================
CREATE OR REPLACE FUNCTION generate_weekly_learning_challenges()
RETURNS TABLE (
  challenge_id INT,
  challenge_name TEXT,
  challenge_description TEXT
) AS $$
DECLARE
  v_week_number INT;
  v_year INT;
  v_start_date TIMESTAMP WITH TIME ZONE;
  v_end_date TIMESTAMP WITH TIME ZONE;
  v_existing_count INT;
BEGIN
  -- Calculer la semaine actuelle
  v_week_number := EXTRACT(WEEK FROM NOW());
  v_year := EXTRACT(YEAR FROM NOW());
  
  -- Calculer debut et fin de semaine (lundi a dimanche)
  v_start_date := DATE_TRUNC('week', NOW());
  v_end_date := v_start_date + INTERVAL '7 days';
  
  -- Verifier si les defis de cette semaine existent deja
  SELECT COUNT(*) INTO v_existing_count
  FROM learning_challenges
  WHERE week_number = v_week_number AND year = v_year;
  
  IF v_existing_count > 0 THEN
    RAISE NOTICE 'Defis deja generes pour la semaine % de %', v_week_number, v_year;
    RETURN;
  END IF;
  
  -- Defi 1: Semaine studieuse (5 lecons cette semaine)
  INSERT INTO learning_challenges (
    name, description, icon, challenge_type, target_value, reward_points,
    week_number, year, start_date, end_date
  )
  VALUES (
    'Semaine studieuse',
    'Completez 5 lecons cette semaine',
    '📖',
    'weekly_lessons',
    5,
    100,
    v_week_number,
    v_year,
    v_start_date,
    v_end_date
  )
  RETURNING id, name, description INTO challenge_id, challenge_name, challenge_description;
  
  RETURN QUERY SELECT challenge_id, challenge_name, challenge_description;
  
  -- Defi 2: Marathon d'apprentissage (3 chapitres cette semaine)
  INSERT INTO learning_challenges (
    name, description, icon, challenge_type, target_value, reward_points,
    week_number, year, start_date, end_date
  )
  VALUES (
    'Marathon d''apprentissage',
    'Completez 3 chapitres entiers cette semaine',
    '🎯',
    'weekly_chapters',
    3,
    200,
    v_week_number,
    v_year,
    v_start_date,
    v_end_date
  )
  RETURNING id, name, description INTO challenge_id, challenge_name, challenge_description;
  
  RETURN QUERY SELECT challenge_id, challenge_name, challenge_description;
  
  -- Defi 3: Specialiste (10 lecons dans une matiere)
  INSERT INTO learning_challenges (
    name, description, icon, challenge_type, target_value, reward_points,
    week_number, year, start_date, end_date
  )
  VALUES (
    'Specialiste',
    'Completez 10 lecons dans une seule matiere',
    '🔬',
    'subject_lessons',
    10,
    150,
    v_week_number,
    v_year,
    v_start_date,
    v_end_date
  )
  RETURNING id, name, description INTO challenge_id, challenge_name, challenge_description;
  
  RETURN QUERY SELECT challenge_id, challenge_name, challenge_description;
  
  -- Defi 4: Rapide (5 lecons en un jour)
  INSERT INTO learning_challenges (
    name, description, icon, challenge_type, target_value, reward_points,
    week_number, year, start_date, end_date
  )
  VALUES (
    'Rapide',
    'Completez 5 lecons en une seule journee',
    '⚡',
    'daily_lessons',
    5,
    100,
    v_week_number,
    v_year,
    v_start_date,
    v_end_date
  )
  RETURNING id, name, description INTO challenge_id, challenge_name, challenge_description;
  
  RETURN QUERY SELECT challenge_id, challenge_name, challenge_description;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION 2: Mettre a jour la progression d'un defi
-- ============================================
CREATE OR REPLACE FUNCTION update_learning_challenge_progress(
  p_user_id UUID,
  p_challenge_id INT,
  p_increment INT DEFAULT 1
)
RETURNS TABLE (
  current_progress INT,
  target_value INT,
  is_completed BOOLEAN,
  just_completed BOOLEAN
) AS $$
DECLARE
  v_current_progress INT;
  v_target_value INT;
  v_is_completed BOOLEAN;
  v_was_completed BOOLEAN;
BEGIN
  -- Verifier si l'utilisateur a deja ce defi
  SELECT 
    ulc.current_progress,
    ulc.target_value,
    ulc.is_completed
  INTO v_current_progress, v_target_value, v_was_completed
  FROM user_learning_challenges ulc
  WHERE ulc.user_id = p_user_id AND ulc.challenge_id = p_challenge_id;
  
  -- Si le defi n'existe pas pour cet utilisateur, le creer
  IF v_current_progress IS NULL THEN
    SELECT lc.target_value INTO v_target_value
    FROM learning_challenges lc
    WHERE lc.id = p_challenge_id;
    
    INSERT INTO user_learning_challenges (
      user_id, challenge_id, current_progress, target_value
    )
    VALUES (
      p_user_id, p_challenge_id, p_increment, v_target_value
    );
    
    v_current_progress := p_increment;
    v_was_completed := FALSE;
  ELSE
    -- Mettre a jour la progression
    UPDATE user_learning_challenges
    SET 
      current_progress = current_progress + p_increment,
      updated_at = NOW()
    WHERE user_id = p_user_id AND challenge_id = p_challenge_id
    RETURNING user_learning_challenges.current_progress INTO v_current_progress;
  END IF;
  
  -- Verifier si le defi est maintenant complete
  v_is_completed := v_current_progress >= v_target_value;
  
  -- Si vient d'etre complete, marquer comme complete
  IF v_is_completed AND NOT v_was_completed THEN
    UPDATE user_learning_challenges
    SET 
      is_completed = TRUE,
      completed_at = NOW()
    WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  END IF;
  
  RETURN QUERY SELECT 
    v_current_progress,
    v_target_value,
    v_is_completed,
    (v_is_completed AND NOT v_was_completed) as just_completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION 3: Completer un defi et reclamer la recompense
-- ============================================
CREATE OR REPLACE FUNCTION complete_learning_challenge(
  p_user_id UUID,
  p_challenge_id INT
)
RETURNS TABLE (
  challenge_name TEXT,
  challenge_icon TEXT,
  reward_points INT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_is_completed BOOLEAN;
  v_reward_claimed BOOLEAN;
  v_challenge_name TEXT;
  v_challenge_icon TEXT;
  v_reward_points INT;
BEGIN
  -- Verifier le statut du defi
  SELECT 
    ulc.is_completed,
    ulc.reward_claimed,
    lc.name,
    lc.icon,
    lc.reward_points
  INTO v_is_completed, v_reward_claimed, v_challenge_name, v_challenge_icon, v_reward_points
  FROM user_learning_challenges ulc
  JOIN learning_challenges lc ON lc.id = ulc.challenge_id
  WHERE ulc.user_id = p_user_id AND ulc.challenge_id = p_challenge_id;
  
  -- Verifier si le defi existe
  IF v_is_completed IS NULL THEN
    RETURN QUERY SELECT 
      NULL::TEXT, 
      NULL::TEXT, 
      0, 
      FALSE, 
      'Defi non trouve'::TEXT;
    RETURN;
  END IF;
  
  -- Verifier si le defi est complete
  IF NOT v_is_completed THEN
    RETURN QUERY SELECT 
      v_challenge_name, 
      v_challenge_icon, 
      0, 
      FALSE, 
      'Defi non complete'::TEXT;
    RETURN;
  END IF;
  
  -- Verifier si la recompense a deja ete reclamee
  IF v_reward_claimed THEN
    RETURN QUERY SELECT 
      v_challenge_name, 
      v_challenge_icon, 
      0, 
      FALSE, 
      'Recompense deja reclamee'::TEXT;
    RETURN;
  END IF;
  
  -- Marquer la recompense comme reclamee
  UPDATE user_learning_challenges
  SET reward_claimed = TRUE
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;
  
  -- Attribuer les points
  INSERT INTO user_points_history (user_id, action_type, points_earned, action_details)
  VALUES (
    p_user_id,
    'challenge_completed',
    v_reward_points,
    jsonb_build_object('challenge_id', p_challenge_id, 'challenge_name', v_challenge_name)
  );
  
  -- Mettre a jour les points totaux
  INSERT INTO user_points (user_id, total_points)
  VALUES (p_user_id, v_reward_points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + v_reward_points,
    updated_at = NOW();
  
  -- Retourner le succes
  RETURN QUERY SELECT 
    v_challenge_name,
    v_challenge_icon,
    v_reward_points,
    TRUE,
    'Recompense reclamee avec succes'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Permissions
-- ============================================
GRANT EXECUTE ON FUNCTION generate_weekly_learning_challenges() TO authenticated;
GRANT EXECUTE ON FUNCTION update_learning_challenge_progress(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_learning_challenge(UUID, INT) TO authenticated;

-- ============================================
-- Generer les defis de la semaine actuelle
-- ============================================
SELECT * FROM generate_weekly_learning_challenges();

-- ============================================
-- Message de succes
-- ============================================
SELECT 'Migration 012 : Defis d''apprentissage hebdomadaires crees avec succes !' AS message;
