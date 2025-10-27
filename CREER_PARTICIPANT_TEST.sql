-- =============================================
-- CRÉER UN PARTICIPANT DE TEST
-- =============================================

-- Ce script crée un nouveau participant pour pouvoir tester complete_competition_participant

-- ====================================
-- ÉTAPE 1: Trouver une compétition active
-- ====================================

SELECT 
    id,
    title,
    status,
    starts_at,
    ends_at
FROM competitions
WHERE status IN ('active', 'upcoming')
ORDER BY created_at DESC
LIMIT 3;

-- ====================================
-- ÉTAPE 2: S'inscrire à une compétition
-- ====================================

-- ⚠️ Remplacer 'COMPETITION_ID' par un ID de l'étape 1
SELECT join_competition(
    'COMPETITION_ID'::UUID,
    auth.uid()
);

-- Résultat attendu: { "success": true, "participant_id": "...", "message": "..." }

-- ====================================
-- ÉTAPE 3: Récupérer le participant_id créé
-- ====================================

SELECT 
    id as participant_id,
    competition_id,
    status,
    score
FROM competition_participants
WHERE user_id = auth.uid()
  AND status = 'registered'
ORDER BY created_at DESC
LIMIT 1;

-- ====================================
-- ÉTAPE 4: Simuler quelques réponses
-- ====================================

-- ⚠️ Remplacer 'PARTICIPANT_ID' par l'ID de l'étape 3
-- ⚠️ Remplacer 'QUESTION_ID' par un vrai ID de question

-- Récupérer les questions de la compétition
SELECT 
    cq.id as question_id,
    cq.question_id as base_question_id,
    cq.order_index,
    q.question_text
FROM competition_questions cq
JOIN questions q ON q.id = cq.question_id
WHERE cq.competition_id = 'COMPETITION_ID'::UUID
ORDER BY cq.order_index
LIMIT 5;

-- Soumettre une réponse (répéter 10 fois avec différentes questions)
SELECT submit_competition_answer(
    'PARTICIPANT_ID'::UUID,
    'QUESTION_ID'::UUID,
    0, -- selected_answer (0=A, 1=B, 2=C, 3=D)
    15 -- time_taken_seconds
);

-- ====================================
-- ÉTAPE 5: Tester complete_competition_participant
-- ====================================

-- ⚠️ Remplacer 'PARTICIPANT_ID' par l'ID réel
SELECT complete_competition_participant('PARTICIPANT_ID'::UUID);

-- Si cette ligne échoue avec "operator does not exist: character varying = uuid",
-- on aura identifié le problème !
