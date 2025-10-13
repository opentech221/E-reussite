-- ============================================
-- INITIALISATION USER: b8fe56ad-e6e8-44f8-940f-a9e1d1115097
-- ============================================

-- Vérifier si l'utilisateur existe déjà
SELECT * FROM user_points 
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- Si pas de résultat, exécuter ceci:
INSERT INTO user_points (
  user_id,
  total_points,
  level,
  points_to_next_level,
  quizzes_completed,
  lessons_completed,
  current_streak,
  longest_streak,
  last_activity_date
) VALUES (
  'b8fe56ad-e6e8-44f8-940f-a9e1d1115097',
  0,
  1,
  100,
  0,
  0,
  0,
  0,
  CURRENT_DATE
)
ON CONFLICT (user_id) DO NOTHING;

-- Vérifier que l'insertion a réussi
SELECT * FROM user_points 
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- ============================================
-- RÉSULTAT ATTENDU :
-- ============================================
-- user_id: b8fe56ad-e6e8-44f8-940f-a9e1d1115097
-- total_points: 0
-- level: 1
-- points_to_next_level: 100
-- quizzes_completed: 0
-- ============================================
