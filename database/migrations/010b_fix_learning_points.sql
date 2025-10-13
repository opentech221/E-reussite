-- ============================================
-- MIGRATION 010B - Correction de la fonction de points
-- ============================================
-- Date: 6 octobre 2025
-- Description: Correction des références de table et colonnes

-- Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS award_lesson_completion_points(UUID, INT);
DROP FUNCTION IF EXISTS get_user_learning_stats(UUID);

-- ============================================
-- Fonction corrigée : Calculer et attribuer les points
-- ============================================
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
  course_completed BOOLEAN
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
BEGIN
  -- Récupérer le chapitre et la matière de la leçon
  SELECT l.chapitre_id, c.matiere_id
  INTO v_chapitre_id, v_matiere_id
  FROM lecons l
  JOIN chapitres c ON c.id = l.chapitre_id
  WHERE l.id = p_lecon_id;

  -- Vérifier si le chapitre est complété
  -- NOTE: user_progression utilise completed_at IS NOT NULL pour indiquer complétion
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

  -- Attribuer les points
  INSERT INTO user_points (user_id, points, source, source_id, created_at)
  VALUES 
    -- Points de base pour la leçon
    (p_user_id, v_base_points, 'lesson_completed', p_lecon_id::TEXT, NOW());

  -- Bonus chapitre
  IF v_chapter_completed THEN
    INSERT INTO user_points (user_id, points, source, source_id, created_at)
    VALUES (p_user_id, v_chapter_bonus, 'chapter_completed', v_chapitre_id::TEXT, NOW());
  END IF;

  -- Bonus cours
  IF v_course_completed THEN
    INSERT INTO user_points (user_id, points, source, source_id, created_at)
    VALUES (p_user_id, v_course_bonus, 'course_completed', v_matiere_id::TEXT, NOW());
  END IF;

  -- Retourner les résultats
  RETURN QUERY SELECT 
    v_base_points,
    v_chapter_bonus,
    v_course_bonus,
    v_base_points + v_chapter_bonus + v_course_bonus,
    v_chapter_completed,
    v_course_completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Fonction corrigée : Obtenir les statistiques
-- ============================================
CREATE OR REPLACE FUNCTION get_user_learning_stats(p_user_id UUID)
RETURNS TABLE (
  total_lessons_completed INT,
  total_chapters_completed INT,
  total_courses_completed INT,
  total_points_from_learning INT,
  lessons_completed_today INT,
  current_streak_days INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total de leçons complétées
    (SELECT COUNT(*) FROM user_progression WHERE user_id = p_user_id AND completed_at IS NOT NULL)::INT,
    
    -- Total de chapitres complétés
    (SELECT COUNT(DISTINCT c.id)
     FROM chapitres c
     WHERE NOT EXISTS (
       SELECT 1 FROM lecons l
       LEFT JOIN user_progression up ON up.lecon_id = l.id AND up.user_id = p_user_id
       WHERE l.chapitre_id = c.id AND up.completed_at IS NULL
     ))::INT,
    
    -- Total de cours complétés
    (SELECT COUNT(DISTINCT m.id)
     FROM matieres m
     WHERE NOT EXISTS (
       SELECT 1 FROM chapitres c
       JOIN lecons l ON l.chapitre_id = c.id
       LEFT JOIN user_progression up ON up.lecon_id = l.id AND up.user_id = p_user_id
       WHERE c.matiere_id = m.id AND up.completed_at IS NULL
     ))::INT,
    
    -- Total de points gagnés via l'apprentissage
    (SELECT COALESCE(SUM(points), 0)
     FROM user_points
     WHERE user_id = p_user_id 
     AND source IN ('lesson_completed', 'chapter_completed', 'course_completed'))::INT,
    
    -- Leçons complétées aujourd'hui
    (SELECT COUNT(*)
     FROM user_progression
     WHERE user_id = p_user_id 
     AND completed_at IS NOT NULL
     AND DATE(completed_at) = CURRENT_DATE)::INT,
    
    -- Streak actuel (jours consécutifs)
    (SELECT COUNT(DISTINCT DATE(completed_at))
     FROM user_progression
     WHERE user_id = p_user_id 
     AND completed_at IS NOT NULL
     AND completed_at >= CURRENT_DATE - INTERVAL '30 days')::INT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Permissions RLS
-- ============================================
GRANT EXECUTE ON FUNCTION get_user_learning_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION award_lesson_completion_points(UUID, INT) TO authenticated;

-- ============================================
-- Commentaires
-- ============================================
COMMENT ON FUNCTION award_lesson_completion_points IS 
'Attribue automatiquement les points lorsqu''un utilisateur complète une leçon. Calcule les bonus pour chapitre et cours complets.';

COMMENT ON FUNCTION get_user_learning_stats IS 
'Retourne les statistiques d''apprentissage complètes pour un utilisateur (leçons, chapitres, cours, points, streak).';

SELECT 'Migration 010B : Fonctions de points corrigées avec succès !' AS message;
