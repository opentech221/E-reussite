-- =============================================
-- MIGRATION: Ajouter condition_type/condition_value
-- =============================================
-- ⚠️ IMPORTANT: criteria (JSONB) reste obligatoire (NOT NULL)
-- On ajoute juste les colonnes pour faciliter les requêtes SQL

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

-- Étape 3 : Rendre les colonnes NOT NULL après migration (OPTIONNEL)
-- ⚠️ Décommentez seulement si vous voulez forcer ces colonnes à être obligatoires
-- ALTER TABLE competition_badges
-- ALTER COLUMN condition_type SET NOT NULL,
-- ALTER COLUMN condition_value SET NOT NULL;

-- ⚠️ NE PAS modifier criteria - elle reste NOT NULL (obligatoire)
-- Les nouvelles colonnes sont juste un complément pour faciliter les requêtes SQL

-- Vérification de la migration
SELECT 
    id,
    name,
    condition_type,
    condition_value,
    criteria -- Les deux systèmes coexistent
FROM competition_badges
ORDER BY created_at DESC
LIMIT 10;

-- ✅ Après cette migration, vous pourrez exécuter ADD_MORE_BADGES.sql !
