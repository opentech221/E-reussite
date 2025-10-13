-- ========================================
-- DIAGNOSTIC : Vérifier les tables QUIZ
-- ========================================
-- Date : 7 octobre 2025
-- Problème : 404 sur user_quiz_results et quizzes

-- 1️⃣ Lister TOUTES les tables qui existent
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2️⃣ Chercher les tables contenant "quiz" dans le nom
SELECT 
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name ILIKE '%quiz%'
ORDER BY table_name;

-- 3️⃣ Chercher les tables contenant "result" dans le nom
SELECT 
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name ILIKE '%result%'
ORDER BY table_name;

-- 4️⃣ Vérifier la structure de user_progress (qui existe)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_progress'
ORDER BY ordinal_position;

-- 5️⃣ Si une table quiz_results existe, voir sa structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'quiz_results'
ORDER BY ordinal_position;

-- 6️⃣ Vérifier si les données de quiz sont dans user_progress
SELECT 
    COUNT(*) as total_progress,
    COUNT(CASE WHEN completed = true THEN 1 END) as completed_count,
    COUNT(CASE WHEN quiz_score IS NOT NULL THEN 1 END) as with_quiz_score
FROM user_progress
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- 7️⃣ Voir un exemple de user_progress avec quiz_score
SELECT 
    id,
    chapitre_id,
    quiz_score,
    completed,
    completed_at,
    time_spent
FROM user_progress
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
  AND quiz_score IS NOT NULL
LIMIT 5;
