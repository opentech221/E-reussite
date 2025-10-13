-- ============================================
-- MIGRATION 011B - Integration badges dans attribution de points (CORRIGEE)
-- ============================================
-- Date: 7 octobre 2025
-- Description: Modifie la fonction award_lesson_completion_points pour verifier automatiquement les badges
-- Dependance: Requiert migration 011_learning_badges_FIXED.sql

-- ============================================
-- Modifier la fonction d'attribution de points pour integrer les badges
-- ============================================

DROP FUNCTION IF EXISTS award_lesson_completion_points(UUID, INT);

CREATE OR REPLACE FUNCTION award_lesson_completion_points(p_user_id UUID, p_lecon_id INT)
RETURNS TABLE (
  points_earned INT,
  chapter_bonus INT,
  course_bonus INT,
  total_points INT,
  chapter_completed BOOLEAN,
  course_completed BOOLEAN,
  badges_unlocked JSONB
) AS $$
DECLARE
  v_chapitre_id INT;
  v_matiere_id INT;
  v_base_points INT := 10;
  v_chapter_bonus INT := 0;
  v_course_bonus INT := 0;
  v_total_points_awarded INT;
  v_chapter_completed BOOLEAN := FALSE;
  v_course_completed BOOLEAN := FALSE;
  v_lessons_in_chapter INT;
  v_completed_lessons_in_chapter INT;
  v_chapters_in_course INT;
  v_completed_chapters_in_course INT;
  v_badges_unlocked JSONB := '[]'::JSONB;
  v_badge RECORD;
BEGIN
  -- Récupérer le chapitre et la matière de la leçon
  SELECT l.chapitre_id, c.matiere_id 
  INTO v_chapitre_id, v_matiere_id
  FROM lecons l
  JOIN chapitres c ON c.id = l.chapitre_id
  WHERE l.id = p_lecon_id;

  IF v_chapitre_id IS NULL THEN
    RAISE EXCEPTION 'Lecon % non trouvee', p_lecon_id;
  END IF;

  -- Verifier si le chapitre est maintenant complete
  SELECT 
    COUNT(*) as total,
    COUNT(up.lecon_id) as completed
  INTO v_lessons_in_chapter, v_completed_lessons_in_chapter
  FROM lecons l
  LEFT JOIN user_progression up ON up.lecon_id = l.id 
    AND up.user_id = p_user_id 
    AND up.completed_at IS NOT NULL
  WHERE l.chapitre_id = v_chapitre_id;

  IF v_completed_lessons_in_chapter = v_lessons_in_chapter THEN
    v_chapter_completed := TRUE;
    v_chapter_bonus := 50;
  END IF;

  -- Vérifier si le cours entier est maintenant complété
  IF v_chapter_completed THEN
    SELECT 
      COUNT(DISTINCT c.id) as total_chapters,
      COUNT(DISTINCT CASE 
        WHEN NOT EXISTS (
          SELECT 1 FROM lecons l2
          LEFT JOIN user_progression up2 ON up2.lecon_id = l2.id 
            AND up2.user_id = p_user_id 
            AND up2.completed_at IS NOT NULL
          WHERE l2.chapitre_id = c.id AND up2.completed_at IS NULL
        ) THEN c.id 
      END) as completed_chapters
    INTO v_chapters_in_course, v_completed_chapters_in_course
    FROM chapitres c
    WHERE c.matiere_id = v_matiere_id;

    IF v_completed_chapters_in_course = v_chapters_in_course THEN
      v_course_completed := TRUE;
      v_course_bonus := 200;
    END IF;
  END IF;

  -- Calculer le total des points gagnes
  v_total_points_awarded := v_base_points + v_chapter_bonus + v_course_bonus;

  -- Enregistrer dans l'historique
  INSERT INTO user_points_history (user_id, action_type, points_earned, action_details)
  VALUES (
    p_user_id,
    'lesson_completed',
    v_base_points,
    jsonb_build_object(
      'lecon_id', p_lecon_id,
      'chapitre_id', v_chapitre_id,
      'matiere_id', v_matiere_id
    )
  );

  IF v_chapter_completed THEN
    INSERT INTO user_points_history (user_id, action_type, points_earned, action_details)
    VALUES (
      p_user_id,
      'chapter_completed',
      v_chapter_bonus,
      jsonb_build_object('chapitre_id', v_chapitre_id)
    );
  END IF;

  IF v_course_completed THEN
    INSERT INTO user_points_history (user_id, action_type, points_earned, action_details)
    VALUES (
      p_user_id,
      'course_completed',
      v_course_bonus,
      jsonb_build_object('matiere_id', v_matiere_id)
    );
  END IF;

  -- Mettre à jour les points totaux et les statistiques
  INSERT INTO user_points (user_id, total_points, lessons_completed)
  VALUES (p_user_id, v_total_points_awarded, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + v_total_points_awarded,
    lessons_completed = user_points.lessons_completed + 1,
    updated_at = NOW();

  -- ============================================
  -- NOUVEAU : Verifier et attribuer les badges
  -- ============================================
  FOR v_badge IN 
    SELECT * FROM check_and_award_learning_badges(p_user_id)
  LOOP
    v_badges_unlocked := v_badges_unlocked || jsonb_build_object(
      'name', v_badge.out_badge_name,
      'icon', v_badge.out_badge_icon,
      'newly_awarded', v_badge.out_newly_awarded
    );
  END LOOP;

  -- Retourner les resultats incluant les badges debloques
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

-- ============================================
-- Permissions
-- ============================================
GRANT EXECUTE ON FUNCTION award_lesson_completion_points(UUID, INT) TO authenticated;

-- ============================================
-- Commentaires
-- ============================================
COMMENT ON FUNCTION award_lesson_completion_points IS 
'Attribue les points pour la completion d une lecon, avec bonus de chapitre/cours.
Verifie automatiquement et attribue les badges d apprentissage debloques.
Retourne maintenant 7 colonnes incluant badges_unlocked (JSONB).';

SELECT 'Migration 011B FIXED : Integration badges dans attribution de points reussie !' AS message;
