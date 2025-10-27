-- =============================================
-- TEST RAPIDE: Simuler l'appel exact qui échoue
-- =============================================

-- Ce script simule exactement ce qui se passe quand vous finissez un quiz

-- ====================================
-- ÉTAPE 1: Récupérer vos IDs actuels
-- ====================================

-- Copier le participant_id du dernier quiz en cours
SELECT 
    'Votre participant_id:' as info,
    id as participant_id,
    user_id,
    competition_id,
    status,
    score
FROM competition_participants
WHERE status = 'in_progress'
  AND user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;

-- ====================================
-- ÉTAPE 2: Tester complete_competition_participant
-- ====================================

-- ⚠️ Remplacer 'VOTRE_PARTICIPANT_ID' par la valeur ci-dessus
SELECT complete_competition_participant('VOTRE_PARTICIPANT_ID');

-- Si cette ligne donne l'erreur "operator does not exist: character varying = uuid",
-- alors le problème est dans complete_competition_participant ou une fonction appelée

-- ====================================
-- ÉTAPE 3: Test isolé de check_and_award_badges
-- ====================================

-- Si l'étape 2 échoue, tester check_and_award_badges seul
SELECT 
    'Test check_and_award_badges' as test,
    check_and_award_badges(
        (SELECT user_id FROM competition_participants WHERE status = 'in_progress' AND user_id = auth.uid() LIMIT 1),
        (SELECT competition_id FROM competition_participants WHERE status = 'in_progress' AND user_id = auth.uid() LIMIT 1)
    ) as resultat;

-- ====================================
-- ÉTAPE 4: Test isolé de check_personal_record
-- ====================================

SELECT 
    'Test check_personal_record' as test,
    check_personal_record(
        (SELECT user_id FROM competition_participants WHERE status = 'in_progress' AND user_id = auth.uid() LIMIT 1),
        (SELECT competition_id FROM competition_participants WHERE status = 'in_progress' AND user_id = auth.uid() LIMIT 1),
        180 -- Score de test
    ) as resultat;

-- ====================================
-- ÉTAPE 5: Test isolé de create_notification
-- ====================================

SELECT 
    'Test create_notification' as test,
    create_notification(
        auth.uid(),
        'test',
        'Test',
        'Test notification',
        (SELECT competition_id FROM competition_participants WHERE status = 'in_progress' AND user_id = auth.uid() LIMIT 1),
        jsonb_build_object('test', true)
    ) as notification_id;
