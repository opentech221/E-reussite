-- Migration 013: Ajouter les colonnes manquantes dans user_points
-- Date: 7 octobre 2025
-- Objectif: Ajouter chapters_completed et courses_completed

BEGIN;

-- Vérifier la structure actuelle
DO $$ 
BEGIN
    RAISE NOTICE 'Migration 013: Ajout des colonnes manquantes dans user_points';
END $$;

-- Ajouter chapters_completed si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_points' 
        AND column_name = 'chapters_completed'
    ) THEN
        ALTER TABLE user_points 
        ADD COLUMN chapters_completed INTEGER DEFAULT 0 NOT NULL;
        
        RAISE NOTICE '✅ Colonne chapters_completed ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  Colonne chapters_completed existe déjà';
    END IF;
END $$;

-- Ajouter courses_completed si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_points' 
        AND column_name = 'courses_completed'
    ) THEN
        ALTER TABLE user_points 
        ADD COLUMN courses_completed INTEGER DEFAULT 0 NOT NULL;
        
        RAISE NOTICE '✅ Colonne courses_completed ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  Colonne courses_completed existe déjà';
    END IF;
END $$;

-- Calculer les valeurs par estimation (user_progress est vide)
-- Note: Votre système incrémente lessons_completed directement
-- Formule: 1 chapitre ≈ 5 leçons, 1 cours ≈ 15 leçons
UPDATE user_points
SET 
    chapters_completed = FLOOR(lessons_completed / 5.0),
    courses_completed = FLOOR(lessons_completed / 15.0);

-- Afficher le résultat
DO $$ 
DECLARE
    v_user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_user_count FROM user_points;
    RAISE NOTICE '📊 Valeurs mises à jour pour % utilisateur(s)', v_user_count;
END $$;

-- Vérification finale
SELECT 
    user_id,
    total_points,
    lessons_completed,
    chapters_completed,
    courses_completed
FROM user_points
ORDER BY created_at DESC
LIMIT 5;

COMMIT;

-- Résumé
DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRATION 013 TERMINÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Colonnes ajoutées:';
    RAISE NOTICE '  - chapters_completed (INTEGER, DEFAULT 0)';
    RAISE NOTICE '  - courses_completed (INTEGER, DEFAULT 0)';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Valeurs calculées par estimation (user_progress vide)';
    RAISE NOTICE '   Formule: chapters ≈ lessons/5, courses ≈ lessons/15';
    RAISE NOTICE '========================================';
END $$;
