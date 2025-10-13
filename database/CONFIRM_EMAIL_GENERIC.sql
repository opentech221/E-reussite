-- ============================================================================
-- CONFIRMATION EMAIL MANUELLE - SCRIPT GÉNÉRIQUE
-- Date: 10 octobre 2025
-- Usage: Remplacer 'EMAIL_ICI' par l'email de l'utilisateur
-- ============================================================================

-- ⚠️ REMPLACEZ 'EMAIL_ICI' PAR L'EMAIL RÉEL AVANT D'EXÉCUTER

-- ============================================================================
-- MÉTHODE 1: Confirmation simple
-- ============================================================================

-- Note: confirmed_at est une colonne générée automatiquement
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'EMAIL_ICI'
AND email_confirmed_at IS NULL;

-- Vérification
SELECT 
    email,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmé'
        ELSE '❌ Non confirmé'
    END as statut
FROM auth.users
WHERE email = 'EMAIL_ICI';

-- ============================================================================
-- MÉTHODE 2: Confirmation + création points si manquants
-- ============================================================================

-- Étape 1: Confirmer l'email
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'EMAIL_ICI';

-- Étape 2: Créer le profil si manquant (REQUIS avant user_points)
INSERT INTO profiles (id, full_name, created_at, updated_at)
SELECT 
    u.id, 
    COALESCE(u.raw_user_meta_data->>'full_name', 'Utilisateur'), 
    NOW(), 
    NOW()
FROM auth.users u
WHERE u.email = 'EMAIL_ICI'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id);

-- Étape 3: Créer les points si manquants
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
    id, 0, 1, 100, 0, 0, CURRENT_DATE, 0, 0, 0, 0, 0
FROM auth.users
WHERE email = 'EMAIL_ICI'
AND NOT EXISTS (SELECT 1 FROM user_points WHERE user_id = auth.users.id);

-- Vérification complète
SELECT 
    au.email,
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN '✅' ELSE '❌' END as email_confirmé,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as profil,
    CASE WHEN up.user_id IS NOT NULL THEN '✅' ELSE '❌' END as points
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_points up ON up.user_id = au.id
WHERE au.email = 'EMAIL_ICI';

-- ============================================================================
-- MÉTHODE 3: Confirmer tous les utilisateurs non confirmés (⚠️ DANGEREUX)
-- ============================================================================

-- ⚠️ NE PAS UTILISER EN PRODUCTION SANS RÉFLÉCHIR
-- Ceci va confirmer TOUS les emails non confirmés

/*
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

SELECT COUNT(*) as utilisateurs_confirmés FROM auth.users WHERE email_confirmed_at IS NOT NULL;
*/

-- ============================================================================
-- MÉTHODE 4: Via l'interface Supabase (recommandé pour les débutants)
-- ============================================================================

-- 1. Aller dans Supabase Dashboard
-- 2. Authentication → Users
-- 3. Trouver l'utilisateur (user1@outlook.com)
-- 4. Cliquer sur les trois points (...)
-- 5. Cliquer sur "Confirm email"
-- 6. ✅ C'est fait !

-- ============================================================================
-- DIAGNOSTIC: Voir tous les utilisateurs non confirmés
-- ============================================================================

SELECT 
    email,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ À confirmer'
        ELSE '✅ Confirmé'
    END as statut,
    EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as heures_depuis_creation
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
