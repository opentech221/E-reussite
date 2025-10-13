-- ============================================
-- MIGRATION 011 - Badges d'apprentissage (CORRIGÉE)
-- ============================================
-- Date: 7 octobre 2025
-- Description: Création des badges automatiques pour récompenser la progression
-- Note: Adaptation à la structure user_badges existante (pas de table badges séparée)

-- ============================================
-- Fonction : Vérifier et attribuer les badges d'apprentissage
-- ============================================

-- Supprimer l'ancienne version si elle existe
DROP FUNCTION IF EXISTS check_and_award_learning_badges(UUID);

CREATE OR REPLACE FUNCTION check_and_award_learning_badges(p_user_id UUID)
RETURNS TABLE (
  out_badge_name TEXT,
  out_badge_icon TEXT,
  out_newly_awarded BOOLEAN
) AS $$
DECLARE
  v_lessons_completed INT;
  v_chapters_completed INT;
  v_courses_completed INT;
  v_current_streak INT;
  v_already_has_badge BOOLEAN;
BEGIN
  -- Récupérer les statistiques de l'utilisateur
  SELECT 
    (SELECT COUNT(*) FROM user_progression WHERE user_id = p_user_id AND completed_at IS NOT NULL),
    (SELECT COUNT(DISTINCT c.id)
     FROM chapitres c
     WHERE NOT EXISTS (
       SELECT 1 FROM lecons l
       LEFT JOIN user_progression up ON up.lecon_id = l.id AND up.user_id = p_user_id
       WHERE l.chapitre_id = c.id AND up.completed_at IS NULL
     )),
    (SELECT COUNT(DISTINCT m.id)
     FROM matieres m
     WHERE NOT EXISTS (
       SELECT 1 FROM chapitres c
       JOIN lecons l ON l.chapitre_id = c.id
       LEFT JOIN user_progression up ON up.lecon_id = l.id AND up.user_id = p_user_id
       WHERE c.matiere_id = m.id AND up.completed_at IS NULL
     )),
    (SELECT COALESCE(current_streak, 0) FROM user_points WHERE user_id = p_user_id)
  INTO v_lessons_completed, v_chapters_completed, v_courses_completed, v_current_streak;

  -- Badge 1 : Apprenant Assidu (10 leçons)
  IF v_lessons_completed >= 10 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id 
      AND ub.badge_name = 'Apprenant Assidu'
    ) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (
        user_id, 
        badge_name, 
        badge_type, 
        badge_description, 
        badge_icon, 
        condition_value,
        earned_at
      )
      VALUES (
        p_user_id, 
        'Apprenant Assidu', 
        'progression', 
        'Complétez 10 leçons pour débloquer ce badge', 
        '🎓', 
        10,
        NOW()
      )
      ON CONFLICT (user_id, badge_name) DO NOTHING;
      
      RETURN QUERY SELECT 'Apprenant Assidu'::TEXT, '🎓'::TEXT, TRUE;
    END IF;
  END IF;

  -- Badge 2 : Finisseur (5 chapitres)
  IF v_chapters_completed >= 5 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id 
      AND ub.badge_name = 'Finisseur'
    ) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (
        user_id, 
        badge_name, 
        badge_type, 
        badge_description, 
        badge_icon, 
        condition_value,
        earned_at
      )
      VALUES (
        p_user_id, 
        'Finisseur', 
        'progression', 
        'Complétez 5 chapitres entiers pour débloquer ce badge', 
        '📚', 
        5,
        NOW()
      )
      ON CONFLICT (user_id, badge_name) DO NOTHING;
      
      RETURN QUERY SELECT 'Finisseur'::TEXT, '📚'::TEXT, TRUE;
    END IF;
  END IF;

  -- Badge 3 : Maître de cours (1 cours complet)
  IF v_courses_completed >= 1 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id 
      AND ub.badge_name = 'Maître de cours'
    ) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (
        user_id, 
        badge_name, 
        badge_type, 
        badge_description, 
        badge_icon, 
        condition_value,
        earned_at
      )
      VALUES (
        p_user_id, 
        'Maître de cours', 
        'progression', 
        'Complétez un cours entier pour débloquer ce badge', 
        '🌟', 
        1,
        NOW()
      )
      ON CONFLICT (user_id, badge_name) DO NOTHING;
      
      RETURN QUERY SELECT 'Maître de cours'::TEXT, '🌟'::TEXT, TRUE;
    END IF;
  END IF;

  -- Badge 4 : Expert (3 cours complets)
  IF v_courses_completed >= 3 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id 
      AND ub.badge_name = 'Expert'
    ) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (
        user_id, 
        badge_name, 
        badge_type, 
        badge_description, 
        badge_icon, 
        condition_value,
        earned_at
      )
      VALUES (
        p_user_id, 
        'Expert', 
        'progression', 
        'Complétez 3 cours complets pour débloquer ce badge', 
        '🚀', 
        3,
        NOW()
      )
      ON CONFLICT (user_id, badge_name) DO NOTHING;
      
      RETURN QUERY SELECT 'Expert'::TEXT, '🚀'::TEXT, TRUE;
    END IF;
  END IF;

  -- Badge 5 : Série d'apprentissage (7 jours consécutifs)
  IF v_current_streak >= 7 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id 
      AND ub.badge_name = 'Série d''apprentissage'
    ) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (
        user_id, 
        badge_name, 
        badge_type, 
        badge_description, 
        badge_icon, 
        condition_value,
        earned_at
      )
      VALUES (
        p_user_id, 
        'Série d''apprentissage', 
        'streak', 
        'Complétez des leçons pendant 7 jours consécutifs', 
        '🔥', 
        7,
        NOW()
      )
      ON CONFLICT (user_id, badge_name) DO NOTHING;
      
      RETURN QUERY SELECT 'Série d''apprentissage'::TEXT, '🔥'::TEXT, TRUE;
    END IF;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Permissions
-- ============================================
GRANT EXECUTE ON FUNCTION check_and_award_learning_badges(UUID) TO authenticated;

-- ============================================
-- Commentaires
-- ============================================
COMMENT ON FUNCTION check_and_award_learning_badges IS 
'Vérifie les critères des badges d''apprentissage et attribue automatiquement les badges débloqués.
Les badges sont stockés directement dans user_badges avec badge_type = ''learning'' ou ''streak''.';

SELECT 'Migration 011 FIXED : Badges d''apprentissage créés avec succès !' AS message;
