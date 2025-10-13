-- ============================================
-- MIGRATION 011 - Badges d'apprentissage
-- ============================================
-- Date: 6 octobre 2025
-- Description: Création des badges automatiques pour récompenser la progression

-- ============================================
-- Vérifier que la table badges existe déjà
-- ============================================
-- Note: La table badges existe déjà depuis la migration 003_gamification_tables.sql
-- On va juste ajouter les badges d'apprentissage

-- ============================================
-- Insertion des badges d'apprentissage
-- ============================================
INSERT INTO badges (name, description, icon, category, points_required, created_at)
VALUES 
  -- Badge 1 : Apprenant Assidu (10 leçons)
  (
    'Apprenant Assidu',
    'Complétez 10 leçons pour débloquer ce badge',
    '🎓',
    'learning',
    NULL, -- Pas de points requis, c'est basé sur les leçons
    NOW()
  ),
  
  -- Badge 2 : Finisseur (5 chapitres)
  (
    'Finisseur',
    'Complétez 5 chapitres entiers pour débloquer ce badge',
    '📚',
    'learning',
    NULL,
    NOW()
  ),
  
  -- Badge 3 : Maître de cours (1 cours complet)
  (
    'Maître de cours',
    'Complétez un cours entier pour débloquer ce badge',
    '🌟',
    'learning',
    NULL,
    NOW()
  ),
  
  -- Badge 4 : Expert (3 cours complets)
  (
    'Expert',
    'Complétez 3 cours complets pour débloquer ce badge',
    '🚀',
    'learning',
    NULL,
    NOW()
  ),
  
  -- Badge 5 : Série d'apprentissage (7 jours consécutifs)
  (
    'Série d''apprentissage',
    'Complétez des leçons pendant 7 jours consécutifs',
    '🔥',
    'learning',
    NULL,
    NOW()
  )
ON CONFLICT (name) DO NOTHING; -- Éviter les doublons si on réexécute

-- ============================================
-- Fonction : Vérifier et attribuer les badges d'apprentissage
-- ============================================
CREATE OR REPLACE FUNCTION check_and_award_learning_badges(p_user_id UUID)
RETURNS TABLE (
  badge_name TEXT,
  badge_icon TEXT,
  newly_awarded BOOLEAN
) AS $$
DECLARE
  v_lessons_completed INT;
  v_chapters_completed INT;
  v_courses_completed INT;
  v_current_streak INT;
  v_badge_id INT;
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
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Apprenant Assidu';
    SELECT EXISTS(SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, NOW());
      
      RETURN QUERY SELECT 'Apprenant Assidu'::TEXT, '🎓'::TEXT, TRUE;
    END IF;
  END IF;

  -- Badge 2 : Finisseur (5 chapitres)
  IF v_chapters_completed >= 5 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Finisseur';
    SELECT EXISTS(SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, NOW());
      
      RETURN QUERY SELECT 'Finisseur'::TEXT, '📚'::TEXT, TRUE;
    END IF;
  END IF;

  -- Badge 3 : Maître de cours (1 cours complet)
  IF v_courses_completed >= 1 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Maître de cours';
    SELECT EXISTS(SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, NOW());
      
      RETURN QUERY SELECT 'Maître de cours'::TEXT, '🌟'::TEXT, TRUE;
    END IF;
  END IF;

  -- Badge 4 : Expert (3 cours complets)
  IF v_courses_completed >= 3 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Expert';
    SELECT EXISTS(SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, NOW());
      
      RETURN QUERY SELECT 'Expert'::TEXT, '🚀'::TEXT, TRUE;
    END IF;
  END IF;

  -- Badge 5 : Série d'apprentissage (7 jours consécutifs)
  IF v_current_streak >= 7 THEN
    SELECT id INTO v_badge_id FROM badges WHERE name = 'Série d''apprentissage';
    SELECT EXISTS(SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge_id) INTO v_already_has_badge;
    
    IF NOT v_already_has_badge THEN
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (p_user_id, v_badge_id, NOW());
      
      RETURN QUERY SELECT 'Série d''apprentissage'::TEXT, '🔥'::TEXT, TRUE;
    END IF;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Mettre à jour la fonction award_lesson_completion_points
-- pour vérifier les badges après attribution de points
-- ============================================
-- Note: On va modifier cette fonction dans la prochaine étape pour intégrer
-- la vérification automatique des badges

-- ============================================
-- Permissions
-- ============================================
GRANT EXECUTE ON FUNCTION check_and_award_learning_badges(UUID) TO authenticated;

-- ============================================
-- Commentaires
-- ============================================
COMMENT ON FUNCTION check_and_award_learning_badges IS 
'Vérifie les critères des badges d''apprentissage et attribue automatiquement les badges débloqués.';

SELECT 'Migration 011 : Badges d''apprentissage créés avec succès !' AS message;
