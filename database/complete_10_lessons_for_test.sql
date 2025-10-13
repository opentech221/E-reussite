-- 🎯 COMPLÉTER 10 LEÇONS POUR DÉBLOQUER LE CHALLENGE "SPÉCIALISTE"
-- Date : 7 octobre 2025
-- But : Tester la fonctionnalité de réclamation de points (Option B)

-- ============================================================
-- 1. CRÉER ET MARQUER 10 CHAPITRES COMME COMPLÉTÉS
-- ============================================================

-- D'abord, insérer les lignes user_progress si elles n'existent pas
INSERT INTO user_progress (user_id, chapitre_id, completed, completed_at, progress_percentage, started_at, last_accessed_at)
SELECT 
    'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::uuid,
    c.id,
    true,
    NOW(),
    100,
    NOW(),
    NOW()
FROM chapitres c
ORDER BY c.id
LIMIT 10
ON CONFLICT (user_id, chapitre_id) 
DO UPDATE SET 
    completed = true,
    completed_at = NOW(),
    progress_percentage = 100,
    last_accessed_at = NOW();

-- ============================================================
-- 2. VÉRIFIER LES LEÇONS COMPLÉTÉES
-- ============================================================

SELECT COUNT(*) as lessons_completed 
FROM user_progress 
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097' 
AND completed = true;

-- Voir quelles leçons ont été complétées
SELECT 
    c.title as chapitre_title,
    up.completed,
    up.completed_at,
    up.progress_percentage
FROM user_progress up
JOIN chapitres c ON c.id = up.chapitre_id
WHERE up.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
AND up.completed = true
ORDER BY up.completed_at DESC;

-- ============================================================
-- 3. VÉRIFIER LE CHALLENGE "SPÉCIALISTE"
-- ============================================================

-- Le trigger devrait automatiquement mettre à jour current_progress
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
AND lc.name = 'Spécialiste';

-- ============================================================
-- 4. SI NÉCESSAIRE : FORCER LA COMPLÉTION DU CHALLENGE
-- ============================================================

-- Si le trigger n'a pas mis à jour automatiquement, forcer manuellement :
/*
UPDATE user_learning_challenges
SET 
    current_progress = 10,
    is_completed = true
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
AND challenge_id = (SELECT id FROM learning_challenges WHERE name = 'Spécialiste');
*/

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================

/*
Après exécution :
1. ✅ 10 leçons complétées
2. ✅ Challenge "Spécialiste" : current_progress = 10, is_completed = TRUE
3. ✅ Status = "✅ PRÊT À RÉCLAMER"
4. ✅ Bouton "Réclamer 150 points" visible sur /progress

Prochaine étape :
- Aller sur http://localhost:3000/progress
- Cliquer sur "Réclamer 150 points"
- Vérifier que les points passent de 1970 à 2120 (1970 + 150)
*/
