-- ⚡ SOLUTION RAPIDE - Estimer chapters et courses depuis lessons
-- Date: 7 octobre 2025
-- Objectif: Débloquer le dashboard /progress immédiatement

-- Solution de contournement : Calculer depuis lessons_completed
UPDATE user_points
SET 
    -- Estimer : 1 chapitre ≈ 5 leçons
    chapters_completed = FLOOR(lessons_completed / 5.0),
    -- Estimer : 1 cours ≈ 15 leçons
    courses_completed = FLOOR(lessons_completed / 15.0);

-- Vérification
SELECT 
    user_id,
    total_points,
    lessons_completed,
    chapters_completed,
    courses_completed
FROM user_points
ORDER BY created_at DESC
LIMIT 5;

-- Résultat attendu pour b8fe56ad...:
-- lessons: 14
-- chapters: 2 (14/5 = 2.8 → 2)
-- courses: 0 (14/15 = 0.93 → 0)
