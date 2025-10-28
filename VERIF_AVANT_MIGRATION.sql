-- =============================================
-- VÉRIFICATION AVANT MIGRATION
-- =============================================

-- 1️⃣ Voir la structure actuelle de competition_badges
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'competition_badges'
ORDER BY ordinal_position;

-- 2️⃣ Voir un exemple de données criteria JSONB
SELECT 
    name,
    criteria,
    criteria->>'type' as type_extrait,
    criteria->>'value' as value_extrait
FROM competition_badges
LIMIT 5;

-- 3️⃣ Compter les badges existants
SELECT COUNT(*) as total_badges_actuels FROM competition_badges;

-- ✅ Exécutez ce script AVANT la migration pour sauvegarder l'état actuel
