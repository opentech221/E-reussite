-- ============================================================================
-- SCRIPT DE VÉRIFICATION RAPIDE - État du système d'inscription
-- Date: 10 octobre 2025
-- ============================================================================

-- 🔍 VÉRIFICATION 1: Triggers actifs
-- ============================================================================
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    CASE t.tgenabled 
        WHEN 'O' THEN '✅ Enabled'
        WHEN 'D' THEN '❌ Disabled'
        ELSE 'Unknown'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname IN ('trigger_init_user_points', 'on_auth_user_created')
ORDER BY c.relname, t.tgname;

-- 🔍 VÉRIFICATION 2: État RLS des tables critiques
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    CASE rowsecurity 
        WHEN true THEN '🔒 Enabled'
        ELSE '🔓 Disabled'
    END as rls_status
FROM pg_tables
WHERE tablename IN ('profiles', 'user_points')
ORDER BY tablename;

-- 🔍 VÉRIFICATION 3: Politiques RLS actives
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd as command,
    CASE 
        WHEN qual IS NULL THEN 'No restriction'
        ELSE 'Has restriction'
    END as has_condition
FROM pg_policies
WHERE tablename IN ('profiles', 'user_points')
ORDER BY tablename, policyname;

-- 🔍 VÉRIFICATION 4: Cohérence des données utilisateurs
-- ============================================================================
SELECT 
    (SELECT COUNT(*) FROM auth.users) as "👥 Total Auth Users",
    (SELECT COUNT(*) FROM public.profiles) as "📝 Total Profiles",
    (SELECT COUNT(*) FROM public.user_points) as "⭐ Total User Points",
    (SELECT COUNT(*) FROM auth.users au 
     WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
    ) as "❌ Missing Profiles",
    (SELECT COUNT(*) FROM auth.users au 
     WHERE NOT EXISTS (SELECT 1 FROM public.user_points up WHERE up.user_id = au.id)
    ) as "❌ Missing User Points";

-- 🔍 VÉRIFICATION 5: Utilisateurs incomplets (détail)
-- ============================================================================
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE WHEN p.id IS NULL THEN '❌ Missing' ELSE '✅ OK' END as profile_status,
    CASE WHEN up.user_id IS NULL THEN '❌ Missing' ELSE '✅ OK' END as points_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.user_points up ON au.id = up.user_id
WHERE p.id IS NULL OR up.user_id IS NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- 🔍 VÉRIFICATION 6: Dernières inscriptions (5 plus récentes)
-- ============================================================================
SELECT 
    au.id,
    au.email,
    au.created_at as "Date inscription",
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as "Profile",
    CASE WHEN up.user_id IS NOT NULL THEN '✅' ELSE '❌' END as "Points",
    up.level as "Niveau",
    up.total_points as "Points totaux"
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.user_points up ON au.id = up.user_id
ORDER BY au.created_at DESC
LIMIT 5;

-- 🔍 VÉRIFICATION 7: Test de la fonction handle_new_user
-- ============================================================================
SELECT 
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE p.proname = 'handle_new_user';

-- 🔍 VÉRIFICATION 8: Contraintes sur user_points
-- ============================================================================
SELECT 
    con.conname as constraint_name,
    CASE con.contype
        WHEN 'p' THEN 'Primary Key'
        WHEN 'u' THEN 'Unique'
        WHEN 'f' THEN 'Foreign Key'
        WHEN 'c' THEN 'Check'
        ELSE 'Other'
    END as constraint_type,
    pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON con.conrelid = rel.oid
WHERE rel.relname = 'user_points'
ORDER BY con.contype, con.conname;

-- ============================================================================
-- RÉSUMÉ DES PROBLÈMES POTENTIELS
-- ============================================================================

-- Ce script vous indiquera:
-- ✅ Si le trigger on_auth_user_created est actif
-- ✅ Si RLS est correctement configuré
-- ✅ Si tous les utilisateurs ont un profil et des points
-- ✅ Si la fonction handle_new_user existe et utilise SECURITY DEFINER
-- ❌ Les utilisateurs incomplets qui nécessitent une correction

-- Pour corriger les utilisateurs incomplets, utilisez le script:
-- FIX_INSCRIPTION_ERROR_500.sql (section "Corriger les utilisateurs incomplets")
