-- ============================================
-- Migration V3: Correction des badge_id malformés
-- Date: 23 octobre 2025
-- Situation: badge_id existe déjà mais valeurs malformées (_remier_as)
-- ============================================

-- ÉTAPE 1: Diagnostic initial
DO $$ 
DECLARE
    v_badges_count INTEGER;
    v_user_badges_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_badges_count FROM badges;
    SELECT COUNT(*) INTO v_user_badges_count FROM user_badges;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '🔍 État initial:';
    RAISE NOTICE '   📦 Badges: %', v_badges_count;
    RAISE NOTICE '   🎖️  User badges: %', v_user_badges_count;
    RAISE NOTICE '========================================';
END $$;

-- ÉTAPE 2: Afficher les badge_id actuels (malformés)
DO $$
DECLARE
    v_badge RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 Badge_id AVANT correction:';
    FOR v_badge IN 
        SELECT id, name, badge_id FROM badges ORDER BY id LIMIT 10
    LOOP
        RAISE NOTICE '   % | % → %', v_badge.id, v_badge.name, COALESCE(v_badge.badge_id, 'NULL');
    END LOOP;
    RAISE NOTICE '';
END $$;

-- ÉTAPE 3: Corriger les badge_id malformés dans badges
DO $$
DECLARE
    v_updated INTEGER;
BEGIN
    RAISE NOTICE '🔧 Correction des badge_id...';
    
    -- Générer badge_id corrects avec regex fixé
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
    );
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✅ % badges corrigés', v_updated;
END $$;

-- ÉTAPE 4: Afficher les badge_id APRÈS correction
DO $$
DECLARE
    v_badge RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 Badge_id APRÈS correction:';
    FOR v_badge IN 
        SELECT id, name, badge_id FROM badges ORDER BY id LIMIT 10
    LOOP
        RAISE NOTICE '   % | % → %', v_badge.id, v_badge.name, v_badge.badge_id;
    END LOOP;
    RAISE NOTICE '';
END $$;

-- ÉTAPE 5: Identifier les user_badges orphelins (badge_id invalides)
DO $$
DECLARE
    v_orphan RECORD;
    v_orphans_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 Recherche des user_badges orphelins...';
    
    FOR v_orphan IN 
        SELECT DISTINCT ub.badge_id, COUNT(*) as count
        FROM user_badges ub
        WHERE NOT EXISTS (
            SELECT 1 FROM badges b WHERE b.badge_id = ub.badge_id
        )
        GROUP BY ub.badge_id
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '   ⚠️  "%" (% occurrences)', v_orphan.badge_id, v_orphan.count;
        v_orphans_count := v_orphans_count + v_orphan.count;
    END LOOP;
    
    IF v_orphans_count = 0 THEN
        RAISE NOTICE '   ✅ Aucun orphelin trouvé';
    ELSE
        RAISE NOTICE '   ⚠️  Total orphelins: %', v_orphans_count;
    END IF;
    RAISE NOTICE '';
END $$;

-- ÉTAPE 6: Supprimer les user_badges orphelins
DO $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM user_badges ub
    WHERE NOT EXISTS (
        SELECT 1 FROM badges b WHERE b.badge_id = ub.badge_id
    );
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted > 0 THEN
        RAISE NOTICE '🗑️  % user_badges orphelins supprimés', v_deleted;
    ELSE
        RAISE NOTICE '✅ Aucun orphelin à supprimer';
    END IF;
END $$;

-- ÉTAPE 7: Vérifier la Foreign Key
DO $$
DECLARE
    v_fk_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_badges_badge_id_fkey'
        AND table_name = 'user_badges'
    ) INTO v_fk_exists;
    
    RAISE NOTICE '';
    IF v_fk_exists THEN
        RAISE NOTICE '✅ Foreign Key existe déjà: user_badges.badge_id → badges.badge_id';
    ELSE
        RAISE NOTICE '⚠️  Foreign Key absente, création...';
        
        -- Créer la FK
        ALTER TABLE user_badges 
        ADD CONSTRAINT user_badges_badge_id_fkey 
        FOREIGN KEY (badge_id) 
        REFERENCES badges(badge_id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Foreign Key créée';
    END IF;
    RAISE NOTICE '';
END $$;

-- ÉTAPE 8: Rapport final
DO $$
DECLARE
    v_badges_count INTEGER;
    v_user_badges_count INTEGER;
    v_fk_exists BOOLEAN;
    v_sample RECORD;
BEGIN
    SELECT COUNT(*) INTO v_badges_count FROM badges;
    SELECT COUNT(*) INTO v_user_badges_count FROM user_badges;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_badges_badge_id_fkey'
    ) INTO v_fk_exists;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Migration V3 terminée!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Badges: %', v_badges_count;
    RAISE NOTICE '🎖️  User badges: %', v_user_badges_count;
    RAISE NOTICE '🔗 Foreign Key: %', CASE WHEN v_fk_exists THEN '✅ Active' ELSE '❌ Absente' END;
    RAISE NOTICE '';
    
    -- Afficher un échantillon
    RAISE NOTICE '📋 Échantillon de badges corrigés:';
    FOR v_sample IN 
        SELECT name, badge_id FROM badges ORDER BY id LIMIT 5
    LOOP
        RAISE NOTICE '   • % → %', v_sample.name, v_sample.badge_id;
    END LOOP;
    
    RAISE NOTICE '========================================';
END $$;

-- Vue finale: Mapping avec count
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
