-- =============================================
-- VÉRIFIER LES COLONNES DE user_badges
-- =============================================

-- Voir toutes les colonnes actuellement présentes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_badges'
ORDER BY ordinal_position;

-- ✅ COLONNES ATTENDUES:
-- id → uuid
-- user_id → uuid
-- badge_id → uuid
-- earned_at → timestamptz
-- competition_id → uuid  ⭐ Cette colonne DOIT exister !
-- metadata → jsonb

-- ❌ Si competition_id est absente → C'EST LE BUG !
