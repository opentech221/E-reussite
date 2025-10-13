-- 🔍 DÉCOUVRIR LA STRUCTURE DE LA TABLE QUIZ
-- Date : 7 octobre 2025

-- Voir toutes les colonnes de la table quiz
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'quiz'
ORDER BY ordinal_position;
