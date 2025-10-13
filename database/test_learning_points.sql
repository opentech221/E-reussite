-- ============================================
-- TESTS MANUELS - Fonction award_lesson_completion_points
-- ============================================

-- Test 1 : Vérifier que la fonction existe
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name IN ('award_lesson_completion_points', 'get_user_learning_stats');

-- Test 1B : Récupérer votre user_id actuel (si connecté dans Supabase)
SELECT auth.uid() as my_user_id;

-- Test 1C : Vérifier les tables nécessaires
SELECT 
  'lecons' as table_name, COUNT(*) as count FROM lecons
UNION ALL
SELECT 'chapitres', COUNT(*) FROM chapitres
UNION ALL
SELECT 'matieres', COUNT(*) FROM matieres
UNION ALL
SELECT 'user_progression', COUNT(*) FROM user_progression
UNION ALL
SELECT 'user_points', COUNT(*) FROM user_points;

-- Test 2 : Trouver un user_id et lecon_id valides pour tester
-- Option A : Utiliser votre user_id actuel (depuis auth.users)
SELECT 
  au.id as user_id,
  au.email,
  l.id as lecon_id,
  l.title as lecon_title,
  c.title as chapitre_title,
  m.name as matiere_name
FROM auth.users au
CROSS JOIN lecons l
JOIN chapitres c ON c.id = l.chapitre_id
JOIN matieres m ON m.id = c.matiere_id
WHERE au.email = 'cheikhtidianesamba99@gmail.com' -- Remplacez par votre email
LIMIT 5;

-- Option B : Si vous connaissez déjà votre user_id
-- Listez juste les leçons disponibles
SELECT 
  l.id as lecon_id,
  l.title as lecon_title,
  c.title as chapitre_title,
  m.name as matiere_name
FROM lecons l
JOIN chapitres c ON c.id = l.chapitre_id
JOIN matieres m ON m.id = c.matiere_id
ORDER BY m.name, c.id, l."order"
LIMIT 10;

-- Test 3 : Tester l'attribution de points pour une leçon
-- Remplacez les valeurs par celles obtenues au Test 2
SELECT * FROM award_lesson_completion_points(
  'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID,  -- Remplacez
  1  -- ID d'une leçon existante
);

-- Résultat attendu :
-- points_earned: 10
-- chapter_bonus: 0 (sauf si c'est la dernière leçon du chapitre)
-- course_bonus: 0 (sauf si c'est la dernière leçon du cours)
-- total_points: 10+ (selon les bonus)

-- Test 4A : Vérifier l'historique détaillé dans user_points_history
SELECT 
  points_earned,
  action_type,
  action_details,
  created_at
FROM user_points_history
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID  -- Remplacez
ORDER BY created_at DESC
LIMIT 10;

-- Test 4B : Vérifier le total dans user_points
SELECT 
  total_points,
  level,
  lessons_completed,
  current_streak,
  updated_at
FROM user_points
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID  -- Remplacez
LIMIT 1;

-- Test 5 : Tester les statistiques
SELECT * FROM get_user_learning_stats('b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID);

-- Résultat attendu :
-- total_lessons_completed: nombre de leçons complétées
-- total_chapters_completed: nombre de chapitres 100% complétés
-- total_courses_completed: nombre de cours 100% complétés
-- total_points_from_learning: somme des points d'apprentissage
-- lessons_completed_today: leçons complétées aujourd'hui
-- current_streak_days: jours consécutifs d'activité
