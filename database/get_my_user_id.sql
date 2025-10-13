-- 🔍 TROUVER MON USER ID
-- Date : 7 octobre 2025

-- Voir tous les utilisateurs dans profiles
SELECT 
    id as user_id,
    email,
    full_name,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- Voir les user_points (pour identifier l'utilisateur actif)
SELECT 
    user_id,
    total_points,
    level,
    created_at
FROM user_points
ORDER BY created_at DESC;

-- Voir les authentifications (auth.users)
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;
