-- ============================================
-- Migration: Correction de la Foreign Key badges (V2)
-- Date: 23 octobre 2025
-- Fix: Nettoyer les orphelins AVANT de créer la FK
-- ============================================

-- ÉTAPE 1: Diagnostic complet
DO $$ 
DECLARE
    v_badges_count INTEGER;
    v_user_badges_count INTEGER;
    v_orphans_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_badges_count FROM badges;
    SELECT COUNT(*) INTO v_user_badges_count FROM user_badges;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '🔍 État initial:';
    RAISE NOTICE '   📦 Badges totaux: %', v_badges_count;
    RAISE NOTICE '   🎖️  User badges totaux: %', v_user_badges_count;
    RAISE NOTICE '========================================';
END $$;

-- ÉTAPE 2: Ajouter badge_id à la table badges existante
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'badges' AND column_name = 'badge_id'
    ) THEN
        ALTER TABLE badges 
        ADD COLUMN badge_id VARCHAR(100);
        
        RAISE NOTICE '✅ Colonne badges.badge_id ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne badges.badge_id existe déjà';
    END IF;
END $$;

-- ÉTAPE 3: Générer badge_id depuis les noms (normalisation)
DO $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE badges
    SET badge_id = LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(
                                REGEXP_REPLACE(name, '[ÉÈÊË]', 'E', 'g'),
                                '[éèêë]', 'e', 'g'
                            ),
                            '[ÀÂÄÁ]', 'A', 'g'
                        ),
                        '[àâäá]', 'a', 'g'
                    ),
                    '[ÎÍÏ]', 'I', 'g'
                ),
                '[îíï]', 'i', 'g'
            ),
            '[^a-zA-Z0-9]+', '_', 'g'
        )
    )
    WHERE badge_id IS NULL;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✅ % badges mis à jour avec badge_id', v_updated;
END $$;

-- ÉTAPE 4: Afficher le mapping pour référence
DO $$
DECLARE
    v_badge RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 Mapping badges (nom → badge_id):';
    FOR v_badge IN 
        SELECT id, name, badge_id FROM badges ORDER BY id
    LOOP
        RAISE NOTICE '   % | % → %', v_badge.id, v_badge.name, v_badge.badge_id;
    END LOOP;
    RAISE NOTICE '';
END $$;

-- ÉTAPE 5: Identifier les orphelins dans user_badges
DO $$
DECLARE
    v_orphan RECORD;
    v_orphans_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 Recherche des user_badges orphelins...';
    
    FOR v_orphan IN 
        SELECT DISTINCT badge_name, COUNT(*) as count
        FROM user_badges
        WHERE badge_name NOT IN (SELECT name FROM badges)
        GROUP BY badge_name
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '   ⚠️  "%" (% occurrences)', v_orphan.badge_name, v_orphan.count;
        v_orphans_count := v_orphans_count + v_orphan.count;
    END LOOP;
    
    IF v_orphans_count = 0 THEN
        RAISE NOTICE '   ✅ Aucun orphelin trouvé';
    ELSE
        RAISE NOTICE '   ⚠️  Total orphelins: %', v_orphans_count;
    END IF;
    RAISE NOTICE '';
END $$;

-- ÉTAPE 6: Nettoyer les orphelins (SUPPRESSION)
DO $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM user_badges
    WHERE badge_name NOT IN (SELECT name FROM badges);
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted > 0 THEN
        RAISE NOTICE '🗑️  % user_badges orphelins supprimés', v_deleted;
    ELSE
        RAISE NOTICE '✅ Aucun orphelin à supprimer';
    END IF;
END $$;

-- ÉTAPE 7: Mapper les noms vers badge_id
DO $$
DECLARE
    v_badge RECORD;
    v_total_mapped INTEGER := 0;
    v_mapped INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Mapping user_badges.badge_name → badge_id...';
    
    FOR v_badge IN 
        SELECT id, name, badge_id FROM badges ORDER BY id
    LOOP
        UPDATE user_badges
        SET badge_name = v_badge.badge_id
        WHERE badge_name = v_badge.name;
        
        GET DIAGNOSTICS v_mapped = ROW_COUNT;
        
        IF v_mapped > 0 THEN
            RAISE NOTICE '   ✅ "%" → "%" (% lignes)', v_badge.name, v_badge.badge_id, v_mapped;
            v_total_mapped := v_total_mapped + v_mapped;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Total mappé: % user_badges', v_total_mapped;
    RAISE NOTICE '';
END $$;

-- ÉTAPE 8: Renommer la colonne
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_badges' AND column_name = 'badge_name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_badges' AND column_name = 'badge_id'
    ) THEN
        ALTER TABLE user_badges 
        RENAME COLUMN badge_name TO badge_id;
        
        RAISE NOTICE '✅ Colonne user_badges.badge_name renommée en badge_id';
    ELSE
        RAISE NOTICE '⏭️  Colonne déjà nommée badge_id';
    END IF;
END $$;

-- ÉTAPE 9: Ajouter contrainte UNIQUE et NOT NULL sur badges.badge_id
DO $$
BEGIN
    -- NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'badges' 
        AND column_name = 'badge_id'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE badges 
        ALTER COLUMN badge_id SET NOT NULL;
        
        RAISE NOTICE '✅ Contrainte NOT NULL ajoutée sur badges.badge_id';
    END IF;
    
    -- UNIQUE (via index si pas déjà présent)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'badges' 
        AND indexname = 'badges_badge_id_key'
    ) THEN
        ALTER TABLE badges 
        ADD CONSTRAINT badges_badge_id_key UNIQUE (badge_id);
        
        RAISE NOTICE '✅ Contrainte UNIQUE ajoutée sur badges.badge_id';
    END IF;
END $$;

-- ÉTAPE 10: Vérification finale AVANT création FK
DO $$
DECLARE
    v_remaining_orphans INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_remaining_orphans
    FROM user_badges ub
    WHERE NOT EXISTS (
        SELECT 1 FROM badges b WHERE b.badge_id = ub.badge_id
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Vérification pré-FK:';
    RAISE NOTICE '   Orphelins restants: %', v_remaining_orphans;
    
    IF v_remaining_orphans > 0 THEN
        RAISE EXCEPTION 'ARRÊT: Il reste % user_badges orphelins! Vérifiez les données.', v_remaining_orphans;
    ELSE
        RAISE NOTICE '   ✅ Aucun orphelin - OK pour créer la FK';
    END IF;
    RAISE NOTICE '';
END $$;

-- ÉTAPE 11: Créer la Foreign Key
DO $$
BEGIN
    -- Supprimer l'ancienne FK si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_badges_badge_id_fkey'
        AND table_name = 'user_badges'
    ) THEN
        ALTER TABLE user_badges 
        DROP CONSTRAINT user_badges_badge_id_fkey;
        
        RAISE NOTICE '🗑️  Ancienne FK supprimée';
    END IF;
    
    -- Créer la nouvelle FK
    ALTER TABLE user_badges 
    ADD CONSTRAINT user_badges_badge_id_fkey 
    FOREIGN KEY (badge_id) 
    REFERENCES badges(badge_id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign Key créée: user_badges.badge_id → badges.badge_id';
END $$;

-- ÉTAPE 12: Rapport final
DO $$
DECLARE
    v_badges_count INTEGER;
    v_user_badges_count INTEGER;
    v_fk_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO v_badges_count FROM badges;
    SELECT COUNT(*) INTO v_user_badges_count FROM user_badges;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_badges_badge_id_fkey'
    ) INTO v_fk_exists;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Migration badges FK terminée!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Badges totaux: %', v_badges_count;
    RAISE NOTICE '🎖️  User badges totaux: %', v_user_badges_count;
    RAISE NOTICE '🔗 Foreign Key: %', CASE WHEN v_fk_exists THEN '✅ Créée' ELSE '❌ Absente' END;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- Afficher le résultat final
SELECT 
    'Mapping Final' as info,
    b.id,
    b.name,
    b.badge_id,
    COUNT(ub.id) as user_badges_count
FROM badges b
LEFT JOIN user_badges ub ON ub.badge_id = b.badge_id
GROUP BY b.id, b.name, b.badge_id
ORDER BY b.id;
