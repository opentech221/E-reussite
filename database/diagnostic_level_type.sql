-- ========================================
-- DIAGNOSTIC : Comprendre le champ "level"
-- ========================================
-- Date : 8 octobre 2025
-- Problème : level est INTEGER, pas TEXT

-- 1️⃣ Type de données de la colonne level
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
  AND column_name = 'level';

-- 2️⃣ Valeur actuelle de votre level
SELECT 
    id,
    email,
    level,
    full_name,
    created_at
FROM user_profiles
WHERE id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- 3️⃣ Tous les niveaux existants dans user_profiles
SELECT DISTINCT level, COUNT(*) as nb_users
FROM user_profiles
GROUP BY level
ORDER BY level;

-- 4️⃣ Structure complète de user_profiles
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5️⃣ Vérifier les niveaux dans matieres (pour correspondance)
SELECT DISTINCT level, COUNT(*) as nb_matieres
FROM matieres
GROUP BY level
ORDER BY level;

-- ============================================
-- ANALYSE ATTENDUE :
-- ============================================
-- Si level est INTEGER dans user_profiles mais TEXT dans matieres,
-- il faut soit :
--   A) Changer user_profiles.level en TEXT
--   B) Créer une table de correspondance (level_id <-> level_name)
--   C) Modifier le code Dashboard pour gérer les 2 types
-- ============================================
