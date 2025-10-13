-- ⚡ MIGRATION 013 - À exécuter dans l'éditeur SQL Supabase
-- Date: 7 octobre 2025
-- URL: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/editor

-- ========================================
-- ÉTAPE 1: Ajouter les colonnes manquantes
-- ========================================

ALTER TABLE user_points 
ADD COLUMN IF NOT EXISTS chapters_completed INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS courses_completed INTEGER DEFAULT 0 NOT NULL;

-- ========================================
-- ÉTAPE 2: Calculer les valeurs (estimation)
-- ========================================
-- Note: user_progress est vide, donc on estime depuis lessons_completed
-- Formule: 1 chapitre ≈ 5 leçons, 1 cours ≈ 15 leçons

UPDATE user_points
SET 
    chapters_completed = FLOOR(lessons_completed / 5.0),
    courses_completed = FLOOR(lessons_completed / 15.0);

-- ========================================
-- ÉTAPE 3: Vérification
-- ========================================

SELECT 
    user_id,
    total_points,
    lessons_completed,
    chapters_completed,
    courses_completed
FROM user_points
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- ✅ RÉSULTAT ATTENDU
-- ========================================
-- Vous devriez voir:
-- - user_id: b8fe56ad-e6e8-44f8-940f-a9e1d1115097
-- - total_points: 1950
-- - lessons_completed: 14
-- - chapters_completed: 2 (14/5 = 2.8 → 2)
-- - courses_completed: 0 (14/15 = 0.93 → 0)
-- 
-- Note: Valeurs estimées car user_progress est vide
-- ========================================
