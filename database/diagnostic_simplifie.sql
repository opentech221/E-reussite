-- 🔍 DIAGNOSTIC SIMPLIFIÉ - Tables connues uniquement
-- Date : 7 octobre 2025
-- Objectif : Diagnostiquer avec les tables confirmées

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

-- ============================================================
-- 2. DONNÉES UTILISATEUR ACTUEL
-- ============================================================

-- Vue complète de l'utilisateur actuel
SELECT 
  up.total_points,
  up.level,
  up.lessons_completed,
  up.chapters_completed,
  up.courses_completed,
  up.current_streak,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = up.user_id) as badges_count,
  (SELECT COUNT(*) FROM user_learning_challenges WHERE user_id = up.user_id AND is_completed = true) as challenges_completed
FROM user_points up
WHERE up.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- ============================================================
-- 3. VÉRIFIER LES BADGES
-- ============================================================

-- Badges gagnés par l'utilisateur actuel
SELECT 
  badge_name,
  earned_at
FROM user_badges
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
ORDER BY earned_at DESC;

-- ============================================================
-- 4. VÉRIFIER LES DÉFIS
-- ============================================================

-- Défis de l'utilisateur actuel
SELECT 
  lc.name,
  lc.description,
  lc.reward_points,
  ulc.current_progress,
  ulc.target_value,
  ulc.is_completed,
  ulc.reward_claimed
FROM user_learning_challenges ulc
JOIN learning_challenges lc ON lc.id = ulc.challenge_id
WHERE ulc.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
ORDER BY ulc.is_completed DESC, lc.reward_points DESC;

-- ============================================================
-- 5. VÉRIFIER LES QUIZ
-- ============================================================

-- Compter le nombre total de quiz
SELECT COUNT(*) as total_quiz FROM quiz;

-- Voir tous les quiz disponibles
SELECT 
  q.id,
  q.title,
  q.chapitre_id,
  q.difficulty,
  c.title as chapitre_title,
  m.name as matiere_name,
  (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) as questions_count
FROM quiz q
LEFT JOIN chapitres c ON c.id = q.chapitre_id
LEFT JOIN matieres m ON m.id = c.matiere_id
ORDER BY m.name, c.title, q.title;

-- Résultats de quiz de l'utilisateur actuel
SELECT 
  q.title,
  qr.score,
  qr.completed_at
FROM quiz_results qr
JOIN quiz q ON q.id = qr.quiz_id
WHERE qr.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
ORDER BY qr.completed_at DESC
LIMIT 10;

-- ============================================================
-- 6. VÉRIFIER LES MATIÈRES ET CHAPITRES
-- ============================================================

-- Voir toutes les matières
SELECT id, name FROM matieres ORDER BY name;

-- Voir tous les chapitres
SELECT 
  c.id,
  c.title as chapitre,
  m.name as matiere
FROM chapitres c
JOIN matieres m ON m.id = c.matiere_id
ORDER BY m.name, c.title;

-- ============================================================
-- RÉSULTATS ATTENDUS
-- ============================================================

/*
REQUÊTE 1 (Profils) : 
  - Devrait retourner 1 ou plusieurs profils
  - Si 1 seul → Besoin de créer des profils tests pour leaderboard

REQUÊTE 2 (Utilisateur actuel) :
  - full_name: opentech (ou votre nom)
  - total_points: 1950
  - level: 5
  - lessons_completed: 14
  - chapters_completed: 2
  - courses_completed: 0
  - badges_count: 4
  - challenges_completed: 3

REQUÊTE 3 (Badges) :
  - Devrait retourner 4 badges :
    1. Apprenant Assidu
    2. Finisseur
    3. Maître de cours
    4. Série d'apprentissage

REQUÊTE 4 (Défis) :
  - Devrait retourner 4 défis
  - 3 complétés (is_completed = true) mais non réclamés (reward_claimed = false)
  - 400 points disponibles (200 + 100 + 100)

REQUÊTE 5 (Quiz) :
  - Nombre de quiz disponibles
  - Si 0 → Besoin de créer des quiz de test
  - Si > 0 → Vérifier pourquoi QuizList ne les affiche pas

REQUÊTE 6 (Matières et Chapitres) :
  - Matieres : Histoire, SVT
  - Chapitres : Plusieurs chapitres par matière
*/
