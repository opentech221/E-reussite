-- ============================================
-- MIGRATION 011B - Intégration badges dans points
-- ============================================
-- Date: 6 octobre 2025
-- Description: Modifier award_lesson_completion_points pour vérifier les badges automatiquement

DROP FUNCTION IF EXISTS award_lesson_completion_points(UUID, INT);

CREATE OR REPLACE FUNCTION award_lesson_completion_points(
  p_user_id UUID,
  p_lecon_id INT
)
RETURNS TABLE (
  points_earned INT,
  chapter_bonus INT,
  course_bonus INT,
  total_points INT,
  chapter_completed BOOLEAN,
  course_completed BOOLEAN,
  badges_unlocked JSONB  -- Nouveau : liste des badges débloqués
) AS $$
DECLARE
  v_chapitre_id INT;
  v_matiere_id INT;
  v_base_points INT := 10;
  v_chapter_bonus INT := 0;
  v_course_bonus INT := 0;
  v_chapter_completed BOOLEAN := FALSE;
  v_course_completed BOOLEAN := FALSE;
  v_total_lessons_in_chapter INT;
  v_completed_lessons_in_chapter INT;
  v_total_chapters_in_course INT;
  v_completed_chapters_in_course INT;
  v_total_points_awarded INT;
  v_badges_unlocked JSONB := '[]'::JSONB;
  v_badge RECORD;
BEGIN
  -- Récupérer le chapitre et la matière de la leçon
  SELECT l.chapitre_id, c.matiere_id
  INTO v_chapitre_id, v_matiere_id
  FROM lecons l
  JOIN chapitres c ON c.id = l.chapitre_id
  WHERE l.id = p_lecon_id;

  -- Vérifier si le chapitre est complété
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN up.completed_at IS NOT NULL THEN 1 END) as completed
  INTO v_total_lessons_in_chapter, v_completed_lessons_in_chapter
  FROM lecons l
  LEFT JOIN user_progression up ON up.lecon_id = l.id AND up.user_id = p_user_id
  WHERE l.chapitre_id = v_chapitre_id;

  -- Si toutes les leçons du chapitre sont complétées
  IF v_completed_lessons_in_chapter = v_total_lessons_in_chapter THEN
    v_chapter_completed := TRUE;
    v_chapter_bonus := 50;
    
    -- Vérifier si le cours entier est complété
    SELECT 
      COUNT(DISTINCT c.id) as total_chapters,
      COUNT(DISTINCT CASE 
        WHEN chapter_progress.all_completed = TRUE THEN c.id 
      END) as completed_chapters
    INTO v_total_chapters_in_course, v_completed_chapters_in_course
    FROM chapitres c
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN up.completed_at IS NOT NULL THEN 1 END) as completed,
        CASE 
          WHEN COUNT(*) = COUNT(CASE WHEN up.completed_at IS NOT NULL THEN 1 END) 
          THEN TRUE 
          ELSE FALSE 
        END as all_completed
      FROM lecons l
      LEFT JOIN user_progression up ON up.lecon_id = l.id AND up.user_id = p_user_id
      WHERE l.chapitre_id = c.id
    ) chapter_progress ON TRUE
    WHERE c.matiere_id = v_matiere_id;

    -- Si tous les chapitres du cours sont complétés
    IF v_completed_chapters_in_course = v_total_chapters_in_course THEN
      v_course_completed := TRUE;
      v_course_bonus := 200;
    END IF;
  END IF;

  -- Calculer le total
  v_total_points_awarded := v_base_points + v_chapter_bonus + v_course_bonus;

  -- 1. Ajouter l'événement dans l'historique
  INSERT INTO user_points_history (user_id, points_earned, action_type, action_details, created_at)
  VALUES (
    p_user_id, 
    v_base_points, 
    'lesson_completed', 
    jsonb_build_object('lecon_id', p_lecon_id, 'chapitre_id', v_chapitre_id),
    NOW()
  );

  -- Bonus chapitre dans l'historique
  IF v_chapter_completed THEN
    INSERT INTO user_points_history (user_id, points_earned, action_type, action_details, created_at)
    VALUES (
      p_user_id, 
      v_chapter_bonus, 
      'chapter_completed', 
      jsonb_build_object('chapitre_id', v_chapitre_id),
      NOW()
    );
  END IF;

  -- Bonus cours dans l'historique
  IF v_course_completed THEN
    INSERT INTO user_points_history (user_id, points_earned, action_type, action_details, created_at)
    VALUES (
      p_user_id, 
      v_course_bonus, 
      'course_completed', 
      jsonb_build_object('matiere_id', v_matiere_id),
      NOW()
    );
  END IF;

  -- 2. Mettre à jour le total dans user_points
  UPDATE user_points up
  SET 
    total_points = up.total_points + v_total_points_awarded,
    lessons_completed = up.lessons_completed + 1,
    updated_at = NOW()
  WHERE up.user_id = p_user_id;

  -- Si l'utilisateur n'a pas encore de record user_points, le créer
  IF NOT FOUND THEN
    INSERT INTO user_points (user_id, total_points, lessons_completed)
    VALUES (p_user_id, v_total_points_awarded, 1);
  END IF;

  -- 3. Vérifier et attribuer les badges automatiquement
  FOR v_badge IN 
    SELECT * FROM check_and_award_learning_badges(p_user_id)
  LOOP
    v_badges_unlocked := v_badges_unlocked || jsonb_build_object(
      'name', v_badge.badge_name,
      'icon', v_badge.badge_icon,
      'newly_awarded', v_badge.newly_awarded
    );
  END LOOP;

  -- Retourner les résultats
  RETURN QUERY SELECT 
    v_base_points,
    v_chapter_bonus,
    v_course_bonus,
    v_total_points_awarded,
    v_chapter_completed,
    v_course_completed,
    v_badges_unlocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION award_lesson_completion_points(UUID, INT) TO authenticated;

COMMENT ON FUNCTION award_lesson_completion_points IS 
'Attribue les points et vérifie automatiquement les badges d''apprentissage débloqués.';

SELECT 'Migration 011B : Intégration badges dans attribution de points réussie !' AS message;
