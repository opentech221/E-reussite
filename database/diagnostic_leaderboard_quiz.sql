-- 🔍 DIAGNOSTIC - Leaderboard & Quiz
-- Date : 7 octobre 2025
-- Objectif : Vérifier pourquoi Leaderboard montre "1 participant" et Quiz "0 quiz"

-- ============================================================
-- 1. DIAGNOSTIC LEADERBOARD
-- ============================================================

-- Compter le nombre total de profils
SELECT COUNT(*) as total_profiles FROM profiles;

-- Voir tous les profils avec leurs points
SELECT 
  p.id, 
  p.full_name,
  p.avatar_url,
  COALESCE(up.total_points, 0) as total_points,
  COALESCE(up.level, 1) as level,
  COALESCE(up.current_streak, 0) as current_streak
FROM profiles p
LEFT JOIN user_points up ON up.user_id = p.id
ORDER BY total_points DESC;

-- Vérifier si tous les users ont un profil
SELECT 
  COUNT(DISTINCT auth.users.id) as users_count,
  COUNT(DISTINCT profiles.id) as profiles_count
FROM auth.users
LEFT JOIN profiles ON profiles.id = auth.users.id;

-- ============================================================
-- 2. DIAGNOSTIC QUIZ
-- ============================================================

-- Compter le nombre total de quiz
SELECT COUNT(*) as total_quizzes FROM quizzes;

-- Voir tous les quiz disponibles
SELECT 
  q.id,
  q.title,
  q.chapitre_id,
  q.difficulty,
  q.time_limit,
  q.created_at,
  c.nom as chapitre_nom,
  m.nom as matiere_nom,
  (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) as questions_count
FROM quizzes q
LEFT JOIN chapitres c ON c.id = q.chapitre_id
LEFT JOIN matieres m ON m.id = c.matiere_id
ORDER BY q.created_at DESC;

-- Vérifier si il y a des questions dans les quiz
SELECT 
  q.title,
  COUNT(qq.id) as questions_count
FROM quizzes q
LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
GROUP BY q.id, q.title
ORDER BY questions_count DESC;

-- ============================================================
-- 3. VÉRIFICATIONS SUPPLÉMENTAIRES
-- ============================================================

-- Vérifier les badges gagnés par user
SELECT 
  p.full_name,
  COUNT(ub.id) as badges_count
FROM profiles p
LEFT JOIN user_badges ub ON ub.user_id = p.id
GROUP BY p.id, p.full_name
ORDER BY badges_count DESC;

-- Vérifier les défis complétés
SELECT 
  p.full_name,
  COUNT(ulc.id) as challenges_count,
  SUM(CASE WHEN ulc.completed THEN 1 ELSE 0 END) as completed_count,
  SUM(CASE WHEN ulc.claimed THEN 1 ELSE 0 END) as claimed_count
FROM profiles p
LEFT JOIN user_learning_challenges ulc ON ulc.user_id = p.id
GROUP BY p.id, p.full_name
ORDER BY challenges_count DESC;

-- ============================================================
-- 4. DONNÉES UTILISATEUR ACTUEL (b8fe56ad...)
-- ============================================================

-- Vue complète de l'utilisateur actuel
SELECT 
  p.full_name,
  up.total_points,
  up.level,
  up.lessons_completed,
  up.chapters_completed,
  up.courses_completed,
  up.current_streak,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = p.id) as badges_count,
  (SELECT COUNT(*) FROM user_learning_challenges WHERE user_id = p.id AND completed = true) as challenges_completed
FROM profiles p
JOIN user_points up ON up.user_id = p.id
WHERE p.id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- ============================================================
-- RÉSULTATS ATTENDUS
-- ============================================================

-- ✅ Leaderboard devrait montrer :
--    - 3 profils (ou plus)
--    - opentech : 1,950 pts, Level 5
--    - Utilisateur 2 : 30 pts
--    - Utilisateur 3 : 0 pts

-- ⚠️ Quiz devrait montrer :
--    - Si 0 quiz : Créer des quiz de test
--    - Si > 0 quiz : Vérifier pourquoi QuizList ne les affiche pas

-- 📊 Badges devrait montrer :
--    - 4 badges pour opentech
--    - 0 badges pour les autres users
