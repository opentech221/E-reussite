-- =============================================
-- TEST ISOLÉ: Identifier quelle fonction échoue
-- =============================================

-- ⚠️ REMPLACER les valeurs UUID par les vôtres !
-- Récupérer un participant_id existant depuis votre base

-- 1️⃣ TEST: Appeler check_and_award_badges directement
DO $$
DECLARE
    v_result JSONB;
    v_test_user_id UUID := '10ab8c35-a67b-4c6d-a931-e7a80dca2058'; -- ⚠️ REMPLACER par votre user_id
    v_test_competition_id UUID := '909a032b-c40c-4b7b-a6d7-5f2872caf36f'; -- ⚠️ REMPLACER
BEGIN
    RAISE NOTICE '🧪 Test check_and_award_badges...';
    
    v_result := check_and_award_badges(v_test_user_id, v_test_competition_id);
    
    RAISE NOTICE '✅ Résultat: %', v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERREUR: % - %', SQLERRM, SQLSTATE;
END $$;

-- 2️⃣ TEST: Appeler check_personal_record directement
DO $$
DECLARE
    v_result BOOLEAN;
    v_test_user_id UUID := '10ab8c35-a67b-4c6d-a931-e7a80dca2058'; -- ⚠️ REMPLACER
    v_test_competition_id UUID := '909a032b-c40c-4b7b-a6d7-5f2872caf36f'; -- ⚠️ REMPLACER
    v_test_score INTEGER := 180;
BEGIN
    RAISE NOTICE '🧪 Test check_personal_record...';
    
    v_result := check_personal_record(v_test_user_id, v_test_competition_id, v_test_score);
    
    RAISE NOTICE '✅ Résultat: %', v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERREUR: % - %', SQLERRM, SQLSTATE;
END $$;

-- 3️⃣ TEST: Appeler create_notification directement
DO $$
DECLARE
    v_result UUID;
    v_test_user_id UUID := '10ab8c35-a67b-4c6d-a931-e7a80dca2058'; -- ⚠️ REMPLACER
    v_test_competition_id UUID := '909a032b-c40c-4b7b-a6d7-5f2872caf36f'; -- ⚠️ REMPLACER
BEGIN
    RAISE NOTICE '🧪 Test create_notification...';
    
    v_result := create_notification(
        v_test_user_id,
        'competition_completed',
        'Test notification',
        'Ceci est un test',
        v_test_competition_id,
        jsonb_build_object('test', true)
    );
    
    RAISE NOTICE '✅ Notification ID: %', v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERREUR: % - %', SQLERRM, SQLSTATE;
END $$;
