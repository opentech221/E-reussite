-- 🔍 VÉRIFIER LES CHALLENGES EXISTANTS
-- Date : 7 octobre 2025

-- Voir tous les challenges disponibles
SELECT 
    id,
    name,
    description,
    reward_points,
    target_value,
    icon
FROM learning_challenges
ORDER BY reward_points DESC;
