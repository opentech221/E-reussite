-- ============================================================================
-- FIX RAPIDE - Créer user_points pour le nouvel utilisateur
-- Date: 10 octobre 2025
-- Utilisateur: 4ceefe97-b5bd-440a-98a6-f5e0bee5cbf5
-- ============================================================================

-- Créer les points pour ce nouvel utilisateur
INSERT INTO user_points (user_id, total_points, level, current_streak, longest_streak)
VALUES ('4ceefe97-b5bd-440a-98a6-f5e0bee5cbf5', 0, 1, 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Vérifier
SELECT 
    user_id,
    total_points,
    level,
    current_streak,
    '✅ Points créés' as status
FROM user_points
WHERE user_id = '4ceefe97-b5bd-440a-98a6-f5e0bee5cbf5';

-- Voir tous les utilisateurs récents et leur statut
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as has_profile,
    CASE WHEN up.user_id IS NOT NULL THEN '✅' ELSE '❌' END as has_points
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_points up ON up.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 5;
