-- ============================================
-- Migration: Correction de la Foreign Key badges
-- Date: 23 octobre 2025
-- Problème: La table badges existe avec id INTEGER, pas badge_id VARCHAR
-- ============================================

-- ÉTAPE 1: Vérifier le schéma actuel (diagnostic)
DO $$ 
DECLARE
    v_badges_has_id BOOLEAN;
    v_badges_has_badge_id BOOLEAN;
    v_user_badges_has_badge_name BOOLEAN;
    v_user_badges_has_badge_id BOOLEAN;
BEGIN
    -- Vérifier badges.id
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'badges' AND column_name = 'id'
    ) INTO v_badges_has_id;
    
    -- Vérifier badges.badge_id
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'badges' AND column_name = 'badge_id'
    ) INTO v_badges_has_badge_id;
    
    -- Vérifier user_badges.badge_name
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_badges' AND column_name = 'badge_name'
    ) INTO v_user_badges_has_badge_name;
    
    -- Vérifier user_badges.badge_id
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_badges' AND column_name = 'badge_id'
    ) INTO v_user_badges_has_badge_id;
    
    RAISE NOTICE '📊 État du schéma:';
    RAISE NOTICE '  badges.id: %', CASE WHEN v_badges_has_id THEN '✅' ELSE '❌' END;
    RAISE NOTICE '  badges.badge_id: %', CASE WHEN v_badges_has_badge_id THEN '✅' ELSE '❌' END;
    RAISE NOTICE '  user_badges.badge_name: %', CASE WHEN v_user_badges_has_badge_name THEN '✅' ELSE '❌' END;
    RAISE NOTICE '  user_badges.badge_id: %', CASE WHEN v_user_badges_has_badge_id THEN '✅' ELSE '❌' END;
END $$;

-- ÉTAPE 2: Ajouter badge_id à la table badges existante
DO $$
BEGIN
    -- Ajouter la colonne badge_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'badges' AND column_name = 'badge_id'
    ) THEN
        ALTER TABLE badges 
        ADD COLUMN badge_id VARCHAR(100) UNIQUE;
        
        RAISE NOTICE '✅ Colonne badges.badge_id ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne badges.badge_id existe déjà';
    END IF;
END $$;

-- ÉTAPE 3: Remplir badge_id depuis le nom existant
DO $$
DECLARE
    v_updated INTEGER;
BEGIN
    -- Générer badge_id à partir du nom (ex: "Premier Quiz" -> "premier_quiz")
    UPDATE badges
    SET badge_id = LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(name, '[éèêë]', 'e', 'g'),
            '[^a-z0-9]+', '_', 'g'
        )
    )
    WHERE badge_id IS NULL;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✅ % badges mis à jour avec badge_id', v_updated;
END $$;

-- ÉTAPE 4: Ajouter contrainte NOT NULL après remplissage
DO $$
BEGIN
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
END $$;

-- ÉTAPE 5: Mapper les données de user_badges
DO $$
DECLARE
    v_badge RECORD;
    v_updated INTEGER := 0;
BEGIN
    -- Pour chaque badge, mapper badge_name -> badge_id
    FOR v_badge IN 
        SELECT id, name, badge_id FROM badges
    LOOP
        -- Mettre à jour user_badges.badge_name avec le nouveau badge_id
        UPDATE user_badges
        SET badge_name = v_badge.badge_id
        WHERE badge_name = v_badge.name;
        
        v_updated := v_updated + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Mappé % badges dans user_badges', v_updated;
END $$;

-- ÉTAPE 6: Renommer la colonne dans user_badges
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

-- ÉTAPE 7: Créer la Foreign Key
DO $$
BEGIN
    -- Supprimer l'ancienne FK si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_badges_badge_id_fkey'
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
    
    RAISE NOTICE '✅ Foreign Key créée: user_badges.badge_id -> badges.badge_id';
END $$;

-- ÉTAPE 8: Vérifications finales
DO $$
DECLARE
    v_badges_count INTEGER;
    v_user_badges_count INTEGER;
    v_orphans_count INTEGER;
BEGIN
    -- Compter les badges
    SELECT COUNT(*) INTO v_badges_count FROM badges;
    
    -- Compter les user_badges
    SELECT COUNT(*) INTO v_user_badges_count FROM user_badges;
    
    -- Vérifier les orphelins (ne devrait pas y en avoir après FK)
    SELECT COUNT(*) INTO v_orphans_count 
    FROM user_badges ub
    WHERE NOT EXISTS (
        SELECT 1 FROM badges b WHERE b.badge_id = ub.badge_id
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Migration badges FK terminée!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Badges totaux: %', v_badges_count;
    RAISE NOTICE '🎖️  User badges totaux: %', v_user_badges_count;
    RAISE NOTICE '⚠️  Orphelins: %', v_orphans_count;
    
    IF v_orphans_count > 0 THEN
        RAISE WARNING 'Il y a % user_badges orphelins à nettoyer!', v_orphans_count;
    END IF;
END $$;

-- Afficher le mapping final
SELECT 
    'Badge Mapping' as info,
    id,
    name,
    badge_id,
    icon_name
FROM badges
ORDER BY id;
