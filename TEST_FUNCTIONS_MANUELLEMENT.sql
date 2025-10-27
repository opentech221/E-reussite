-- =============================================
-- TEST DIRECT: Appeler les fonctions manuellement
-- =============================================

-- ⚠️ Remplacer les UUIDs par vos vraies données avant d'exécuter

-- ====================================
-- PRÉPARATION: Récupérer vos IDs réels
-- ====================================

-- 1️⃣ Récupérer votre user_id
SELECT id as user_id, email
FROM auth.users
LIMIT 1;

-- 2️⃣ Récupérer un participant_id récent
SELECT 
    id as participant_id,
    user_id,
    competition_id,
    status,
    score,
    rank
FROM competition_participants
WHERE status = 'in_progress'
ORDER BY created_at DESC
LIMIT 1;

-- 3️⃣ Récupérer une competition_id active
SELECT 
    id as competition_id,
    title,
    status
FROM competitions
WHERE status IN ('active', 'upcoming')
LIMIT 1;

-- ====================================
-- TEST 1: check_and_award_badges
-- ====================================

-- ⚠️ Remplacer les UUIDs ci-dessous par vos vraies valeurs
DO $$
DECLARE
    v_result JSONB;
    v_user_id UUID := 'VOTRE_USER_ID_ICI'; -- ⭐ À remplacer
    v_competition_id UUID := 'VOTRE_COMPETITION_ID_ICI'; -- ⭐ À remplacer
BEGIN
    -- Tester check_and_award_badges
    RAISE NOTICE '🧪 Test check_and_award_badges...';
    
    v_result := check_and_award_badges(v_user_id, v_competition_id);
    
    RAISE NOTICE '✅ Résultat: %', v_result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERREUR: % - %', SQLERRM, SQLSTATE;
    RAISE NOTICE '💡 Message: %', SQLERRM;
END $$;

-- ====================================
-- TEST 2: check_personal_record
-- ====================================

DO $$
DECLARE
    v_result BOOLEAN;
    v_user_id UUID := 'VOTRE_USER_ID_ICI'; -- ⭐ À remplacer
    v_competition_id UUID := 'VOTRE_COMPETITION_ID_ICI'; -- ⭐ À remplacer
    v_score INTEGER := 180; -- Score de test
BEGIN
    RAISE NOTICE '🧪 Test check_personal_record...';
    
    v_result := check_personal_record(v_user_id, v_competition_id, v_score);
    
    RAISE NOTICE '✅ Résultat: %', v_result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERREUR: % - %', SQLERRM, SQLSTATE;
    RAISE NOTICE '💡 Message: %', SQLERRM;
END $$;

-- ====================================
-- TEST 3: create_notification
-- ====================================

DO $$
DECLARE
    v_notification_id UUID;
    v_user_id UUID := 'VOTRE_USER_ID_ICI'; -- ⭐ À remplacer
    v_competition_id UUID := 'VOTRE_COMPETITION_ID_ICI'; -- ⭐ À remplacer
BEGIN
    RAISE NOTICE '🧪 Test create_notification...';
    
    v_notification_id := create_notification(
        v_user_id,
        'test',
        'Test Notification',
        'Ceci est un test',
        v_competition_id,
        jsonb_build_object('test', true)
    );
    
    RAISE NOTICE '✅ Notification créée: %', v_notification_id;
    
    -- Nettoyer
    DELETE FROM competition_notifications WHERE id = v_notification_id;
    RAISE NOTICE '🧹 Notification de test supprimée';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERREUR: % - %', SQLERRM, SQLSTATE;
    RAISE NOTICE '💡 Message: %', SQLERRM;
END $$;

-- ====================================
-- TEST 4: complete_competition_participant
-- ====================================

-- ⚠️ ATTENTION: Ce test va vraiment marquer un participant comme "completed"
-- ⚠️ Ne l'exécuter QUE si vous êtes prêt à perdre un test en cours

/*
DO $$
DECLARE
    v_result JSONB;
    v_participant_id UUID := 'VOTRE_PARTICIPANT_ID_ICI'; -- ⭐ À remplacer
BEGIN
    RAISE NOTICE '🧪 Test complete_competition_participant...';
    
    v_result := complete_competition_participant(v_participant_id);
    
    RAISE NOTICE '✅ Résultat: %', v_result;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERREUR: % - %', SQLERRM, SQLSTATE;
    RAISE NOTICE '💡 Message: %', SQLERRM;
    RAISE NOTICE '🔍 SQLSTATE: %', SQLSTATE;
END $$;
*/
