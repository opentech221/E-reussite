-- =============================================
-- VÉRIFIER STRUCTURE competition_badges
-- =============================================

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'competition_badges'
ORDER BY ordinal_position;

-- ✅ COLONNES ATTENDUES (selon ADD_COMPETITIONS_NOTIFICATIONS.sql):
-- id → uuid
-- name → varchar(100)
-- description → text
-- icon → varchar(10)
-- rarity → varchar(20) (common, uncommon, rare, epic, legendary)
-- points_reward → integer
-- created_at → timestamptz
