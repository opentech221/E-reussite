-- ============================================
-- MIGRATION 012B - Integration defis dans systeme de points
-- ============================================
-- Date: 7 octobre 2025
-- Description: Modifie award_lesson_completion_points pour mettre a jour automatiquement les defis
-- Dependance: Requiert migration 012_learning_challenges.sql

-- ============================================
-- Modifier la fonction d'attribution de points
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
  badges_unlocked JSONB,
  challenges_updated JSONB
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
  v_challenges_updated JSONB := '[]'::JSONB;
  v_badge RECORD;
  v_challenge RECORD;
  v_week_number INT;
  v_year INT;
  v_lessons_today INT;
  v_lessons_this_week INT;
  v_chapters_this_week INT;
  v_lessons_in_subject_this_week INT;
BEGIN
  -- Recuperer le chapitre et la matiere de la lecon
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

  -- Verifier si le cours entier est maintenant complete
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

  -- Mettre a jour les points totaux et les statistiques
  INSERT INTO user_points (user_id, total_points, lessons_completed)
  VALUES (p_user_id, v_total_points_awarded, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + v_total_points_awarded,
    lessons_completed = user_points.lessons_completed + 1,
    updated_at = NOW();

  -- ============================================
  -- Verifier et attribuer les badges
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

  -- ============================================
  -- NOUVEAU : Mettre a jour les defis d'apprentissage
  -- ============================================
  
  -- Calculer les stats pour les defis
  v_week_number := EXTRACT(WEEK FROM NOW());
  v_year := EXTRACT(YEAR FROM NOW());
  
  -- Nombre de lecons completees aujourd'hui
  SELECT COUNT(*) INTO v_lessons_today
  FROM user_progression
  WHERE user_id = p_user_id
  AND DATE(completed_at) = CURRENT_DATE;
  
  -- Nombre de lecons completees cette semaine
  SELECT COUNT(*) INTO v_lessons_this_week
  FROM user_progression
  WHERE user_id = p_user_id
  AND completed_at >= DATE_TRUNC('week', NOW())
  AND completed_at < DATE_TRUNC('week', NOW()) + INTERVAL '7 days';
  
  -- Nombre de chapitres completes cette semaine
  SELECT COUNT(DISTINCT c.id) INTO v_chapters_this_week
  FROM chapitres c
  WHERE NOT EXISTS (
    SELECT 1 FROM lecons l
    LEFT JOIN user_progression up ON up.lecon_id = l.id AND up.user_id = p_user_id
    WHERE l.chapitre_id = c.id 
    AND (up.completed_at IS NULL OR up.completed_at < DATE_TRUNC('week', NOW()))
  )
  AND EXISTS (
    SELECT 1 FROM lecons l
    JOIN user_progression up ON up.lecon_id = l.id AND up.user_id = p_user_id
    WHERE l.chapitre_id = c.id
    AND up.completed_at >= DATE_TRUNC('week', NOW())
  );
  
  -- Nombre de lecons dans la matiere actuelle cette semaine
  SELECT COUNT(*) INTO v_lessons_in_subject_this_week
  FROM user_progression up
  JOIN lecons l ON l.id = up.lecon_id
  JOIN chapitres c ON c.id = l.chapitre_id
  WHERE up.user_id = p_user_id
  AND c.matiere_id = v_matiere_id
  AND up.completed_at >= DATE_TRUNC('week', NOW())
  AND up.completed_at < DATE_TRUNC('week', NOW()) + INTERVAL '7 days';
  
  -- Mettre a jour les defis actifs de cette semaine
  FOR v_challenge IN
    SELECT lc.id, lc.challenge_type, lc.name, lc.icon
    FROM learning_challenges lc
    WHERE lc.week_number = v_week_number 
    AND lc.year = v_year
  LOOP
    DECLARE
      v_progress_result RECORD;
    BEGIN
      -- Determiner la progression selon le type de defi
      IF v_challenge.challenge_type = 'weekly_lessons' THEN
        -- Mettre a jour avec le nombre total de lecons cette semaine
        UPDATE user_learning_challenges
        SET 
          current_progress = v_lessons_this_week,
          updated_at = NOW()
        WHERE user_id = p_user_id AND challenge_id = v_challenge.id;
        
        -- Si pas encore inscrit, creer l'entree
        INSERT INTO user_learning_challenges (user_id, challenge_id, current_progress, target_value)
        SELECT p_user_id, v_challenge.id, v_lessons_this_week, lc.target_value
        FROM learning_challenges lc
        WHERE lc.id = v_challenge.id
        ON CONFLICT (user_id, challenge_id) DO NOTHING;
        
      ELSIF v_challenge.challenge_type = 'weekly_chapters' THEN
        -- Mettre a jour avec le nombre de chapitres completes cette semaine
        UPDATE user_learning_challenges
        SET 
          current_progress = v_chapters_this_week,
          updated_at = NOW()
        WHERE user_id = p_user_id AND challenge_id = v_challenge.id;
        
        INSERT INTO user_learning_challenges (user_id, challenge_id, current_progress, target_value)
        SELECT p_user_id, v_challenge.id, v_chapters_this_week, lc.target_value
        FROM learning_challenges lc
        WHERE lc.id = v_challenge.id
        ON CONFLICT (user_id, challenge_id) DO NOTHING;
        
      ELSIF v_challenge.challenge_type = 'subject_lessons' THEN
        -- Mettre a jour avec le nombre de lecons dans cette matiere cette semaine
        UPDATE user_learning_challenges
        SET 
          current_progress = v_lessons_in_subject_this_week,
          updated_at = NOW()
        WHERE user_id = p_user_id AND challenge_id = v_challenge.id;
        
        INSERT INTO user_learning_challenges (user_id, challenge_id, current_progress, target_value)
        SELECT p_user_id, v_challenge.id, v_lessons_in_subject_this_week, lc.target_value
        FROM learning_challenges lc
        WHERE lc.id = v_challenge.id
        ON CONFLICT (user_id, challenge_id) DO NOTHING;
        
      ELSIF v_challenge.challenge_type = 'daily_lessons' THEN
        -- Mettre a jour avec le nombre de lecons aujourd'hui
        UPDATE user_learning_challenges
        SET 
          current_progress = v_lessons_today,
          updated_at = NOW()
        WHERE user_id = p_user_id AND challenge_id = v_challenge.id;
        
        INSERT INTO user_learning_challenges (user_id, challenge_id, current_progress, target_value)
        SELECT p_user_id, v_challenge.id, v_lessons_today, lc.target_value
        FROM learning_challenges lc
        WHERE lc.id = v_challenge.id
        ON CONFLICT (user_id, challenge_id) DO NOTHING;
      END IF;
      
      -- Verifier si le defi vient d'etre complete
      SELECT 
        ulc.current_progress,
        ulc.target_value,
        ulc.is_completed
      INTO v_progress_result
      FROM user_learning_challenges ulc
      WHERE ulc.user_id = p_user_id AND ulc.challenge_id = v_challenge.id;
      
      -- Si complete et pas encore marque, le marquer
      IF v_progress_result.current_progress >= v_progress_result.target_value 
         AND NOT v_progress_result.is_completed THEN
        UPDATE user_learning_challenges
        SET 
          is_completed = TRUE,
          completed_at = NOW()
        WHERE user_id = p_user_id AND challenge_id = v_challenge.id;
        
        -- Ajouter au retour JSON
        v_challenges_updated := v_challenges_updated || jsonb_build_object(
          'id', v_challenge.id,
          'name', v_challenge.name,
          'icon', v_challenge.icon,
          'completed', true,
          'progress', v_progress_result.current_progress,
          'target', v_progress_result.target_value
        );
      ELSE
        -- Ajouter la progression au retour JSON
        v_challenges_updated := v_challenges_updated || jsonb_build_object(
          'id', v_challenge.id,
          'name', v_challenge.name,
          'icon', v_challenge.icon,
          'completed', false,
          'progress', v_progress_result.current_progress,
          'target', v_progress_result.target_value
        );
      END IF;
    END;
  END LOOP;

  -- Retourner les resultats incluant badges et defis
  RETURN QUERY SELECT 
    v_base_points,
    v_chapter_bonus,
    v_course_bonus,
    v_total_points_awarded,
    v_chapter_completed,
    v_course_completed,
    v_badges_unlocked,
    v_challenges_updated;
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
Met a jour automatiquement la progression des defis hebdomadaires.
Retourne maintenant 8 colonnes incluant badges_unlocked et challenges_updated (JSONB).';

SELECT 'Migration 012B : Integration defis dans attribution de points reussie !' AS message;
