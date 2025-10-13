-- 🎯 PHASE 5 OPTION B - Vérification État Actuel des Challenges
-- Date : 7 octobre 2025

-- ============================================================
-- 1. VÉRIFIER LES CHALLENGES DE L'UTILISATEUR
-- ============================================================

-- Voir tous les challenges avec leur progression
SELECT 
    lc.name as challenge,
    lc.icon,
    lc.reward_points,
    ulc.current_progress,
    lc.target_value,
    ulc.is_completed,
    ulc.reward_claimed,
    CASE 
        WHEN ulc.reward_claimed THEN '🔒 RÉCLAMÉ'
        WHEN ulc.is_completed THEN '✅ PRÊT À RÉCLAMER'
        ELSE '⏳ EN COURS'
    END as status
FROM user_learning_challenges ulc
JOIN learning_challenges lc ON lc.id = ulc.challenge_id
WHERE ulc.user_id = 'b8fe56ad-8e1f-44e0-b603-4b1c3b7f85d2'
ORDER BY lc.reward_points DESC;

-- ============================================================
-- 2. TESTER LA FONCTION DE RÉCLAMATION (DRY RUN)
-- ============================================================

-- Test : Que se passe-t-il si on essaie de réclamer le challenge "Spécialiste" ?
SELECT * FROM complete_learning_challenge(
    'b8fe56ad-8e1f-44e0-b603-4b1c3b7f85d2'::uuid,
    (SELECT id FROM learning_challenges WHERE name = 'Spécialiste')
);

-- ============================================================
-- 3. VÉRIFIER LES POINTS ACTUELS
-- ============================================================

-- Points totaux avant réclamation
SELECT 
    total_points,
    level,
    updated_at
FROM user_points
WHERE user_id = 'b8fe56ad-8e1f-44e0-b603-4b1c3b7f85d2';

-- Historique des points
SELECT 
    action_type,
    points_earned,
    action_details->>'challenge_name' as challenge_name,
    created_at
FROM user_points_history
WHERE user_id = 'b8fe56ad-8e1f-44e0-b603-4b1c3b7f85d2'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- 4. SI BESOIN : COMPLÉTER LE CHALLENGE SPÉCIALISTE
-- ============================================================

-- Voir combien de leçons sont complétées
SELECT COUNT(*) as lessons_completed 
FROM user_progress 
WHERE user_id = 'b8fe56ad-8e1f-44e0-b603-4b1c3b7f85d2' 
AND completed = true;

-- Si besoin de marquer le challenge comme complété manuellement :
/*
UPDATE user_learning_challenges
SET 
    current_progress = 10,
    is_completed = true
WHERE user_id = 'b8fe56ad-8e1f-44e0-b603-4b1c3b7f85d2'
AND challenge_id = (SELECT id FROM learning_challenges WHERE name = 'Spécialiste');
*/

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================

/*
Challenge "Spécialiste" devrait avoir :
- current_progress = 10 (ou proche)
- target_value = 10
- is_completed = TRUE
- reward_claimed = FALSE
- Status = "✅ PRÊT À RÉCLAMER"

Le bouton "Réclamer 150 points" devrait être visible dans l'interface.
*/
