-- 🎯 CRÉER ET COMPLÉTER LE CHALLENGE "SPÉCIALISTE"
-- Date : 7 octobre 2025

-- ============================================================
-- 1. VÉRIFIER SI LE CHALLENGE EXISTE DANS LA TABLE PRINCIPALE
-- ============================================================

SELECT id, name, reward_points, target_value 
FROM learning_challenges 
WHERE name = 'Specialiste';

-- ============================================================
-- 2. CRÉER L'ENTRÉE DANS user_learning_challenges SI ELLE N'EXISTE PAS
-- ============================================================

INSERT INTO user_learning_challenges (user_id, challenge_id, current_progress, target_value, is_completed, reward_claimed)
SELECT 
    'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::uuid,
    lc.id,
    10,  -- 10 leçons complétées
    lc.target_value,  -- Copier target_value depuis learning_challenges
    true,  -- Challenge complété
    false  -- Récompense non réclamée
FROM learning_challenges lc
WHERE lc.name = 'Specialiste'
ON CONFLICT (user_id, challenge_id) 
DO UPDATE SET 
    current_progress = 10,
    is_completed = true,
    reward_claimed = false;

-- ============================================================
-- 3. VÉRIFIER LE RÉSULTAT
-- ============================================================

SELECT 
    lc.name as challenge,
    lc.icon,
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
WHERE ulc.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
AND lc.name = 'Specialiste';

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================

/*
Le challenge devrait maintenant afficher :
- challenge: "Specialiste"
- current_progress: 10
- target_value: 10
- is_completed: true
- reward_claimed: false
- status: "✅ PRÊT À RÉCLAMER"

Le bouton "Réclamer 150 points" devrait apparaître sur /progress
*/
