-- ========================================
-- CORRECTION : Niveau utilisateur
-- ========================================
-- Date : 8 octobre 2025
-- Problème : level = "Troisième " au lieu de "bfem"

-- 1️⃣ Vérifier le niveau actuel
SELECT 
    id,
    email,
    level,
    LENGTH(level) as level_length,
    full_name
FROM user_profiles
WHERE id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- 2️⃣ Corriger le niveau pour correspondre aux matières
UPDATE user_profiles
SET level = 'bfem'
WHERE id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- 3️⃣ Vérifier la correction
SELECT 
    id,
    email,
    level,
    LENGTH(level) as level_length,
    full_name
FROM user_profiles
WHERE id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- 4️⃣ Vérifier que ça correspond aux matières disponibles
SELECT DISTINCT level
FROM matieres
ORDER BY level;

-- ✅ Résultat attendu : level = 'bfem' (4 caractères)
