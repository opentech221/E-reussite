-- ============================================================================
-- VÉRIFICATION DES NOUVELLES INSCRIPTIONS
-- Date: 10 octobre 2025
-- Usage: Exécuter après avoir créé un compte test
-- ============================================================================

-- ============================================================================
-- 1. VÉRIFIER LES UTILISATEURS RÉCENTS (dernières 10 minutes)
-- ============================================================================

SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN '✅' ELSE '❌' END as email_confirmé,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as profil_existe,
    CASE WHEN up.user_id IS NOT NULL THEN '✅' ELSE '❌' END as points_existent,
    p.full_name,
    up.total_points,
    up.level,
    EXTRACT(EPOCH FROM (NOW() - au.created_at)) as secondes_depuis_creation
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_points up ON up.user_id = au.id
WHERE au.created_at > NOW() - INTERVAL '10 minutes'
ORDER BY au.created_at DESC;

-- ============================================================================
-- 2. VOIR LES LOGS DU TRIGGER (si disponibles)
-- ============================================================================

-- Note: Cette requête nécessite pg_stat_statements ou pgaudit
-- Si vous ne voyez rien, allez dans Supabase Dashboard → Logs → Postgres Logs

/*
SELECT * FROM pg_stat_activity 
WHERE query LIKE '%handle_new_user%' 
ORDER BY query_start DESC 
LIMIT 5;
*/

-- ============================================================================
-- 3. COMPTER TOUS LES UTILISATEURS ET LEUR ÉTAT
-- ============================================================================

SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as users_confirmés,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as users_non_confirmés
FROM auth.users;

SELECT 
    'Profils' as table_name,
    COUNT(*) as total_records
FROM profiles
UNION ALL
SELECT 
    'User Points' as table_name,
    COUNT(*) as total_records
FROM user_points
UNION ALL
SELECT 
    'Auth Users' as table_name,
    COUNT(*) as total_records
FROM auth.users;

-- ============================================================================
-- 4. VÉRIFIER L'INTÉGRITÉ (user sans profil ou points)
-- ============================================================================

-- Utilisateurs SANS profil (❌ problème)
SELECT 
    au.id,
    au.email,
    au.created_at,
    '❌ Pas de profil' as probleme
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- Utilisateurs SANS points (❌ problème)
SELECT 
    au.id,
    au.email,
    au.created_at,
    '❌ Pas de points' as probleme
FROM auth.users au
LEFT JOIN user_points up ON up.user_id = au.id
WHERE up.user_id IS NULL
ORDER BY au.created_at DESC;

-- ============================================================================
-- 5. ÉTAT DU TRIGGER
-- ============================================================================

SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    CASE t.tgenabled
        WHEN 'O' THEN '✅ Activé'
        WHEN 'D' THEN '❌ Désactivé'
        ELSE '⚠️ Autre statut'
    END as status,
    p.proname as function_name,
    p.prosecdef as security_definer,
    CASE p.prosecdef
        WHEN true THEN '✅ SECURITY DEFINER'
        ELSE '❌ Pas SECURITY DEFINER'
    END as security_status
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgname = 'on_auth_user_created';

-- ============================================================================
-- MESSAGES D'AIDE
-- ============================================================================

SELECT '✅ Si le nouveau compte test a ✅✅ (profil + points), le trigger fonctionne !' as resultat_attendu;
SELECT '❌ Si le nouveau compte a ❌ (profil ou points manquant), vérifiez les logs Postgres' as si_probleme;
SELECT '🔍 Supabase Dashboard → Logs → Postgres Logs → Chercher "handle_new_user"' as ou_voir_logs;
