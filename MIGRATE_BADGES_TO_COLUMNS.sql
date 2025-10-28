-- =============================================
-- MIGRATION: criteria JSONB → colonnes séparées
-- =============================================

-- Étape 1 : Ajouter les nouvelles colonnes
ALTER TABLE competition_badges 
ADD COLUMN IF NOT EXISTS condition_type TEXT,
ADD COLUMN IF NOT EXISTS condition_value INTEGER;

-- Étape 2 : Migrer les données existantes de criteria vers les colonnes
UPDATE competition_badges
SET 
    condition_type = criteria->>'type',
    condition_value = (criteria->>'value')::INTEGER
WHERE criteria IS NOT NULL;

-- Étape 3 : Rendre les colonnes NOT NULL après migration
ALTER TABLE competition_badges
ALTER COLUMN condition_type SET NOT NULL,
ALTER COLUMN condition_value SET NOT NULL;

-- Étape 4 : Supprimer l'ancienne colonne criteria (OPTIONNEL - décommentez si vous voulez)
-- ALTER TABLE competition_badges DROP COLUMN criteria;

-- Vérification de la migration
SELECT 
    id,
    name,
    condition_type,
    condition_value,
    criteria -- Gardez cette ligne pour comparer avant/après
FROM competition_badges
ORDER BY id;

-- ✅ Après cette migration, vous pourrez exécuter ADD_MORE_BADGES.sql sans modification !
