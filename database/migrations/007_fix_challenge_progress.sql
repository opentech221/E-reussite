-- ============================================
-- MIGRATION 007: Fix update_challenge_progress Function
-- ============================================
-- Date: 6 octobre 2025
-- Description: Correction de l'ambiguïté "challenge_id" dans update_challenge_progress

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS update_challenge_progress(UUID, TEXT, INT, JSONB);

-- Recréer avec la correction
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
      progress = LEAST(user_challenges.progress + p_progress_value, v_user_challenge.target),
      status = CASE 
        WHEN user_challenges.progress + p_progress_value >= v_user_challenge.target THEN 'completed'
        ELSE 'active'
      END,
      completed_at = CASE
        WHEN user_challenges.progress + p_progress_value >= v_user_challenge.target THEN NOW()
        ELSE user_challenges.completed_at
      END
    WHERE id = v_user_challenge.id
    RETURNING 
      user_challenges.challenge_id,
      (user_challenges.status = 'completed') as completed,
      user_challenges.progress,
      user_challenges.target
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
-- Test de la fonction
-- ============================================
-- Note: Exécuter après avoir complété un quiz pour tester
-- SELECT * FROM update_challenge_progress(auth.uid(), 'quiz_complete', 1, '{"quiz_id": "test"}'::JSONB);

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Fonction update_challenge_progress recréée avec la correction
-- Plus d'erreur "challenge_id is ambiguous"
-- La progression des défis sera mise à jour correctement après les quiz
-- ============================================
