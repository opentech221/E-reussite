-- =============================================
-- DIAGNOSTIC SIMPLE: Types de colonnes UUID vs VARCHAR
-- =============================================

-- ✅ Ce script vérifie uniquement les types de colonnes
-- ✅ Exécuter les 3 requêtes séparément

-- ====================================
-- 1️⃣ VÉRIFIER user_badges
-- ====================================
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_badges'
ORDER BY ordinal_position;

-- ✅ RÉSULTAT ATTENDU:
-- badge_id → data_type: uuid (pas character varying !)


-- ====================================
-- 2️⃣ VÉRIFIER competition_badges
-- ====================================
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'competition_badges'
ORDER BY ordinal_position;

-- ✅ RÉSULTAT ATTENDU:
-- id → data_type: uuid


-- ====================================
-- 3️⃣ VÉRIFIER competition_notifications
-- ====================================
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'competition_notifications'
ORDER BY ordinal_position;

-- ✅ RÉSULTAT ATTENDU:
-- competition_id → data_type: uuid
-- type → data_type: character varying (c'est normal pour type)
