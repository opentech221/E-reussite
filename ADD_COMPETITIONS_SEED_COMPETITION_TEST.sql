-- =============================================
-- SEED COMPÉTITION DE TEST
-- Création d'une première compétition d'exemple
-- =============================================

-- NOTE : Ce script crée une compétition de test active
-- pour valider le système de compétitions MVP Phase 1

DO $$
DECLARE
    competition_id UUID;
    question_ids UUID[];
    question_record RECORD;
    order_idx INTEGER := 1;
BEGIN
    -- ============================================================
    -- ÉTAPE 1 : Créer une compétition de test
    -- ============================================================
    
    INSERT INTO competitions (
        title,
        description,
        type,
        subject,
        grade_level,
        difficulty,
        duration_minutes,
        questions_count,
        status,
        starts_at,
        ends_at,
        reward_points,
        reward_xp,
        reward_badges,
        max_participants
    ) VALUES (
        '🏆 Challenge Mathématiques - Octobre 2025',
        'Compétition de mathématiques niveau collège/lycée. Testez vos connaissances sur le théorème de Thalès, les équations du second degré et les fonctions ! Top 3 gagnent des badges exclusifs.',
        'asynchronous',
        'mathematiques',
        'troisieme',
        'moyen',
        15, -- 15 minutes
        10, -- 10 questions
        'active', -- Actif maintenant
        NOW(), -- Commence maintenant
        NOW() + INTERVAL '7 days', -- Se termine dans 7 jours
        500, -- 500 points de récompense
        100, -- 100 XP
        '["champion_maths", "top_competitor"]'::jsonb,
        NULL -- Participants illimités
    )
    RETURNING id INTO competition_id;
    
    RAISE NOTICE '✅ Compétition créée avec ID: %', competition_id;
    
    -- ============================================================
    -- ÉTAPE 2 : Sélectionner 10 questions de mathématiques
    -- ============================================================
    
    -- Sélectionner 10 questions de mathématiques (mix de difficultés)
    FOR question_record IN (
        SELECT id 
        FROM questions 
        WHERE subject = 'mathematiques'
        ORDER BY RANDOM()
        LIMIT 10
    )
    LOOP
        INSERT INTO competition_questions (
            competition_id,
            question_id,
            order_index,
            points
        ) VALUES (
            competition_id,
            question_record.id,
            order_idx,
            10 -- 10 points par question
        );
        
        order_idx := order_idx + 1;
    END LOOP;
    
    RAISE NOTICE '✅ % questions ajoutées à la compétition', order_idx - 1;
    
    -- ============================================================
    -- ÉTAPE 3 : Créer une deuxième compétition (upcoming)
    -- ============================================================
    
    INSERT INTO competitions (
        title,
        description,
        type,
        subject,
        grade_level,
        difficulty,
        duration_minutes,
        questions_count,
        status,
        starts_at,
        ends_at,
        reward_points,
        reward_xp,
        reward_badges,
        max_participants
    ) VALUES (
        '🌍 Quiz Sciences & Vie - Novembre 2025',
        'Compétition multi-matières : SVT, Physique-Chimie et Géographie. Parfait pour les passionnés de sciences ! Récompenses exclusives pour le top 10.',
        'asynchronous',
        'sciences',
        'seconde',
        'moyen',
        20, -- 20 minutes
        15, -- 15 questions
        'upcoming', -- À venir
        NOW() + INTERVAL '3 days', -- Commence dans 3 jours
        NOW() + INTERVAL '10 days', -- Se termine dans 10 jours
        750, -- 750 points
        150, -- 150 XP
        '["science_master", "top_10"]'::jsonb,
        100 -- Max 100 participants
    )
    RETURNING id INTO competition_id;
    
    RAISE NOTICE '✅ Deuxième compétition créée avec ID: %', competition_id;
    
    -- Sélectionner 15 questions de sciences (mélange SVT + Physique + Géo)
    order_idx := 1;
    
    FOR question_record IN (
        SELECT id 
        FROM questions 
        WHERE subject IN ('sciences', 'physique_chimie', 'geographie')
        ORDER BY RANDOM()
        LIMIT 15
    )
    LOOP
        INSERT INTO competition_questions (
            competition_id,
            question_id,
            order_index,
            points
        ) VALUES (
            competition_id,
            question_record.id,
            order_idx,
            10
        );
        
        order_idx := order_idx + 1;
    END LOOP;
    
    RAISE NOTICE '✅ % questions ajoutées à la deuxième compétition', order_idx - 1;
    
    -- ============================================================
    -- ÉTAPE 4 : Créer une troisième compétition (difficile)
    -- ============================================================
    
    INSERT INTO competitions (
        title,
        description,
        type,
        subject,
        grade_level,
        difficulty,
        duration_minutes,
        questions_count,
        status,
        starts_at,
        ends_at,
        reward_points,
        reward_xp,
        reward_badges,
        max_participants
    ) VALUES (
        '🔥 Défi Expert - Toutes Matières',
        'La compétition ultime ! Questions difficiles de toutes les matières. Réservé aux plus courageux. Badge légendaire "Expert Champion" pour le premier !',
        'asynchronous',
        'multidisciplinaire',
        'terminale',
        'difficile',
        30, -- 30 minutes
        20, -- 20 questions
        'active', -- Actif maintenant
        NOW(),
        NOW() + INTERVAL '14 days', -- 2 semaines
        1000, -- 1000 points !
        250, -- 250 XP
        '["expert_champion", "legendary_competitor", "master_mind"]'::jsonb,
        50 -- Max 50 participants
    )
    RETURNING id INTO competition_id;
    
    RAISE NOTICE '✅ Troisième compétition (Expert) créée avec ID: %', competition_id;
    
    -- Sélectionner 20 questions de toutes matières (priorité difficile)
    order_idx := 1;
    
    FOR question_record IN (
        SELECT id 
        FROM questions 
        WHERE difficulty IN ('difficile', 'moyen')
        ORDER BY 
            CASE WHEN difficulty = 'difficile' THEN 1 ELSE 2 END,
            RANDOM()
        LIMIT 20
    )
    LOOP
        INSERT INTO competition_questions (
            competition_id,
            question_id,
            order_index,
            points
        ) VALUES (
            competition_id,
            question_record.id,
            order_idx,
            15 -- 15 points par question (plus difficile)
        );
        
        order_idx := order_idx + 1;
    END LOOP;
    
    RAISE NOTICE '✅ % questions ajoutées à la compétition Expert', order_idx - 1;
    
    -- ============================================================
    -- AFFICHAGE FINAL
    -- ============================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ =============================================';
    RAISE NOTICE '✅ SEED COMPÉTITIONS TERMINÉ AVEC SUCCÈS';
    RAISE NOTICE '✅ =============================================';
    RAISE NOTICE '';
    RAISE NOTICE '🏆 COMPÉTITIONS CRÉÉES :';
    RAISE NOTICE '   1. Challenge Mathématiques (ACTIF - 7 jours)';
    RAISE NOTICE '   2. Quiz Sciences & Vie (À VENIR - dans 3 jours)';
    RAISE NOTICE '   3. Défi Expert (ACTIF - 14 jours)';
    RAISE NOTICE '';
    RAISE NOTICE '📊 STATISTIQUES :';
    RAISE NOTICE '   • Total compétitions : %', (SELECT COUNT(*) FROM competitions);
    RAISE NOTICE '   • Compétitions actives : %', (SELECT COUNT(*) FROM competitions WHERE status = 'active');
    RAISE NOTICE '   • Total questions attribuées : %', (SELECT COUNT(*) FROM competition_questions);
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PROCHAINE ÉTAPE :';
    RAISE NOTICE '   → Allez sur /competitions pour voir les compétitions';
    RAISE NOTICE '   → Inscrivez-vous et testez le système !';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Bon courage et que le meilleur gagne ! 🏆';
    RAISE NOTICE '=============================================';
    
END $$;
