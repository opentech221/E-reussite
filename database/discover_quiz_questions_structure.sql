-- 🔍 DÉCOUVRIR LA STRUCTURE DE LA TABLE QUIZ_QUESTIONS
-- Date : 7 octobre 2025

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'quiz_questions'
ORDER BY ordinal_position;
