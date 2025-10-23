-- ============================================
-- Script de nettoyage : Corriger les badge_id malformés
-- Problème: Les badge_id commencent par _ (underscore)
-- Exemple: _remier_as au lieu de premier_pas
-- ============================================

-- ÉTAPE 1: Supprimer la colonne badge_id malformée
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'badges' AND column_name = 'badge_id'
    ) THEN
        ALTER TABLE badges 
        DROP COLUMN badge_id;
        
        RAISE NOTICE '🗑️  Colonne badge_id malformée supprimée';
    ELSE
        RAISE NOTICE '⏭️  Aucune colonne badge_id à supprimer';
    END IF;
END $$;

-- ÉTAPE 2: Rétablir la colonne badge_name dans user_badges si renommée
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_badges' AND column_name = 'badge_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_badges' AND column_name = 'badge_name'
    ) THEN
        ALTER TABLE user_badges 
        RENAME COLUMN badge_id TO badge_name;
        
        RAISE NOTICE '🔄 Colonne badge_id renommée en badge_name';
    ELSE
        RAISE NOTICE '⏭️  Colonne déjà nommée badge_name';
    END IF;
END $$;

-- ÉTAPE 3: Supprimer la FK si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_badges_badge_id_fkey'
    ) THEN
        ALTER TABLE user_badges 
        DROP CONSTRAINT user_badges_badge_id_fkey;
        
        RAISE NOTICE '🗑️  Foreign Key supprimée';
    ELSE
        RAISE NOTICE '⏭️  Aucune FK à supprimer';
    END IF;
END $$;

-- Rapport final
DO $$
DECLARE
    v_has_badge_id BOOLEAN;
    v_has_badge_name BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'badges' AND column_name = 'badge_id'
    ) INTO v_has_badge_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_badges' AND column_name = 'badge_name'
    ) INTO v_has_badge_name;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Nettoyage terminé!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'badges.badge_id: %', CASE WHEN v_has_badge_id THEN '❌ Existe (problème!)' ELSE '✅ Supprimé' END;
    RAISE NOTICE 'user_badges.badge_name: %', CASE WHEN v_has_badge_name THEN '✅ Rétabli' ELSE '❌ Absent' END;
    RAISE NOTICE '';
    RAISE NOTICE '👉 Vous pouvez maintenant réexécuter la migration V2 corrigée';
    RAISE NOTICE '========================================';
END $$;
