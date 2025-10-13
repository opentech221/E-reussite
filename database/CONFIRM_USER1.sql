-- ============================================================================
-- CONFIRMATION EMAIL MANUELLE - user1@outlook.com
-- Date: 10 octobre 2025
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: TROUVER L'UTILISATEUR
-- ============================================================================

-- Voir l'utilisateur et son statut actuel
SELECT 
    id,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Email non confirmé'
        ELSE '✅ Email confirmé'
    END as statut_confirmation,
    created_at,
    confirmed_at
FROM auth.users
WHERE email = 'user1@outlook.com';

-- ============================================================================
-- ÉTAPE 2: CONFIRMER L'EMAIL
-- ============================================================================

-- Mettre à jour l'utilisateur pour confirmer son email
-- Note: confirmed_at est une colonne générée, on ne la modifie pas
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'user1@outlook.com'
AND email_confirmed_at IS NULL;  -- Ne confirmer que si pas déjà confirmé

-- ============================================================================
-- ÉTAPE 3: VÉRIFICATION
-- ============================================================================

-- Voir le résultat
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmé avec succès!'
        ELSE '❌ Échec de la confirmation'
    END as statut,
    created_at
FROM auth.users
WHERE email = 'user1@outlook.com';

-- ============================================================================
-- ÉTAPE 4: VÉRIFIER QUE LE PROFIL ET LES POINTS EXISTENT
-- ============================================================================

-- Vérification complète de l'utilisateur
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as has_profile,
    p.full_name,
    p.level as parcours_level,
    CASE WHEN up.user_id IS NOT NULL THEN '✅' ELSE '❌' END as has_points,
    up.total_points,
    up.level as points_level
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_points up ON up.user_id = au.id
WHERE au.email = 'user1@outlook.com';

-- ============================================================================
-- ÉTAPE 5 (OBLIGATOIRE): CRÉER LE PROFIL SI MANQUANT
-- ============================================================================

-- IMPORTANT: user_points a une FK vers profiles.id, pas vers auth.users.id
-- Il faut donc créer le profil AVANT les points

-- Créer le profil si manquant
-- Note: profiles n'a PAS de colonne email (l'email est dans auth.users)
INSERT INTO profiles (id, full_name, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', 'user1'),
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'user1@outlook.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- ============================================================================
-- ÉTAPE 6: CRÉER LES POINTS (maintenant que le profil existe)
-- ============================================================================

-- Créer les points (nécessite que le profil existe à cause de la FK)
INSERT INTO user_points (
    user_id, 
    total_points, 
    level, 
    points_to_next_level, 
    current_streak, 
    longest_streak, 
    last_activity_date,
    quizzes_completed,
    lessons_completed,
    chapters_completed,
    courses_completed,
    total_time_spent
)
SELECT 
    id,           -- user_id
    0,            -- total_points
    1,            -- level
    100,          -- points_to_next_level
    0,            -- current_streak
    0,            -- longest_streak
    CURRENT_DATE, -- last_activity_date
    0,            -- quizzes_completed
    0,            -- lessons_completed
    0,            -- chapters_completed
    0,            -- courses_completed
    0             -- total_time_spent
FROM auth.users
WHERE email = 'user1@outlook.com'
AND NOT EXISTS (
    SELECT 1 FROM user_points WHERE user_id = auth.users.id
);

-- Vérification finale
SELECT '✅ user1@outlook.com est maintenant confirmé et prêt à utiliser!' as message;

-- ============================================================================
-- RÉSUMÉ DES ACTIONS
-- ============================================================================

-- Ce script a fait:
-- 1. ✅ Confirmé l'email de user1@outlook.com
-- 2. ✅ Vérifié que le profil existe
-- 3. ✅ Créé les points si manquants
-- 4. ✅ Utilisateur peut maintenant se connecter sans confirmation email

-- Vous pouvez maintenant:
-- - ✅ Vous connecter avec user1@outlook.com
-- - ✅ Accéder au Dashboard
-- - ✅ Utiliser toutes les fonctionnalités
