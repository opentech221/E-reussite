-- ============================================
-- Migration 008: Ajouter rewards_claimed à get_user_active_challenges
-- ============================================
-- Date: 06 octobre 2025
-- Description: 
--   Ajoute le champ rewards_claimed dans la fonction get_user_active_challenges
--   pour permettre à l'interface de savoir si les récompenses ont déjà été réclamées
--   et éviter d'afficher le bouton "Réclamer" pour des challenges déjà réclamés.

-- ============================================
-- Supprimer l'ancienne fonction
-- ============================================
DROP FUNCTION IF EXISTS get_user_active_challenges(UUID);

-- ============================================
-- Recréer la fonction avec rewards_claimed
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
  rewards_claimed BOOLEAN,
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
    uc.rewards_claimed,
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
-- Commentaire de la migration
-- ============================================
COMMENT ON FUNCTION get_user_active_challenges IS 
'Retourne les défis actifs et complétés d''un utilisateur avec le champ rewards_claimed pour gérer l''affichage du bouton de réclamation.';
