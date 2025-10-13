-- ============================================================================
-- DIAGNOSTIC TRIGGER - Pourquoi user_points n'est pas créé ?
-- Date: 10 octobre 2025
-- Problème: PGRST116 - Aucune ligne dans user_points après inscription
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: VÉRIFIER QUE LE TRIGGER EXISTE
-- ============================================================================

SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    tgtype,
    CASE tgenabled
        WHEN 'O' THEN '✅ Activé'
        WHEN 'D' THEN '❌ Désactivé'
        ELSE '⚠️ Autre statut'
    END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Si vide, le trigger n'existe pas !

-- ============================================================================
-- ÉTAPE 2: VÉRIFIER QUE LA FONCTION handle_new_user EXISTE
-- ============================================================================

SELECT 
    proname as function_name,
    prosecdef as security_definer,
    CASE prosecdef
        WHEN true THEN '✅ SECURITY DEFINER (peut contourner RLS)'
        ELSE '❌ Pas SECURITY DEFINER (va échouer avec RLS)'
    END as security_status
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Si vide, la fonction n'existe pas !

-- ============================================================================
-- ÉTAPE 3: VOIR LE CODE DE LA FONCTION (si elle existe)
-- ============================================================================

SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- ============================================================================
-- ÉTAPE 4: VÉRIFIER LES UTILISATEURS RÉCENTS ET LEURS POINTS
-- ============================================================================

-- Voir les 5 derniers utilisateurs inscrits
SELECT 
    au.id,
    au.email,
    au.created_at as inscrit_le,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as has_profile,
    p.full_name,
    CASE WHEN up.user_id IS NOT NULL THEN '✅' ELSE '❌' END as has_points,
    up.total_points,
    up.level
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_points up ON up.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 5;

-- ============================================================================
-- ÉTAPE 5: VÉRIFIER L'UTILISATEUR SPÉCIFIQUE QUI A L'ERREUR
-- ============================================================================

-- Remplacez l'ID par celui qui apparaît dans l'erreur: 45c7f96f-34ca-4b9d-b199-6eef98b0182f
SELECT 
    au.id,
    au.email,
    au.created_at,
    'Profil' as type,
    CASE WHEN p.id IS NOT NULL THEN '✅ Existe' ELSE '❌ Manquant' END as status,
    p.full_name,
    p.level as parcours_level
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.id = '45c7f96f-34ca-4b9d-b199-6eef98b0182f'

UNION ALL

SELECT 
    au.id,
    au.email,
    au.created_at,
    'Points' as type,
    CASE WHEN up.user_id IS NOT NULL THEN '✅ Existe' ELSE '❌ Manquant' END as status,
    up.total_points::text as detail1,
    up.level::text as detail2
FROM auth.users au
LEFT JOIN user_points up ON up.user_id = au.id
WHERE au.id = '45c7f96f-34ca-4b9d-b199-6eef98b0182f';

-- ============================================================================
-- ÉTAPE 6: VOIR LES LOGS D'ERREURS (si disponibles)
-- ============================================================================

-- Cette requête peut ne pas fonctionner selon vos permissions
-- SELECT * FROM pg_stat_statements 
-- WHERE query LIKE '%handle_new_user%' 
-- ORDER BY calls DESC 
-- LIMIT 5;

-- ============================================================================
-- RÉSUMÉ DU DIAGNOSTIC
-- ============================================================================

-- Si le trigger n'existe pas → Exécuter FIX_INSCRIPTION_ERROR_500.sql
-- Si le trigger existe mais user_points manque → Problème dans la fonction
-- Si la fonction n'a pas SECURITY DEFINER → Elle ne peut pas créer user_points (RLS bloque)
-- Si tout existe mais user_points manque → Exception silencieuse dans la fonction

-- ============================================================================
-- FIX RAPIDE POUR L'UTILISATEUR ACTUEL (45c7f96f-34ca-4b9d-b199-6eef98b0182f)
-- ============================================================================

-- Créer manuellement les points pour cet utilisateur
INSERT INTO user_points (user_id, total_points, level, current_streak, longest_streak)
VALUES ('45c7f96f-34ca-4b9d-b199-6eef98b0182f', 0, 1, 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Vérifier que c'est créé
SELECT 
    user_id,
    total_points,
    level,
    '✅ Points créés manuellement' as status
FROM user_points
WHERE user_id = '45c7f96f-34ca-4b9d-b199-6eef98b0182f';
