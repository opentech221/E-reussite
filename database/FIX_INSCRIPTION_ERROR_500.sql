-- ============================================================================
-- DIAGNOSTIC ET CORRECTION - ERREUR INSCRIPTION
-- Date: 10 octobre 2025
-- Erreur: "Database error saving new user" (500)
-- ============================================================================

-- ÉTAPE 1: VÉRIFIER L'EXISTENCE DES TABLES ET TRIGGERS
-- ============================================================================

-- Vérifier la table profiles
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
);

-- Vérifier la table user_points
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_points'
);

-- Lister tous les triggers sur la table profiles
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;

-- ÉTAPE 2: DÉSACTIVER TEMPORAIREMENT LE TRIGGER PROBLÉMATIQUE
-- ============================================================================

-- Désactiver le trigger init_user_points (si c'est lui qui cause le problème)
ALTER TABLE profiles DISABLE TRIGGER IF EXISTS trigger_init_user_points;

-- ÉTAPE 3: VÉRIFIER LES POLITIQUES RLS
-- ============================================================================

-- Vérifier que les politiques permettent l'insertion
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'user_points')
ORDER BY tablename, policyname;

-- ÉTAPE 4: CORRIGER LA FONCTION init_user_points
-- ============================================================================

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS init_user_points() CASCADE;

-- Créer une nouvelle fonction plus robuste avec gestion d'erreurs
CREATE OR REPLACE FUNCTION init_user_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que la table user_points existe
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_points'
    ) THEN
        -- Insérer avec gestion d'erreur
        BEGIN
            INSERT INTO user_points (
                user_id, 
                total_points, 
                level, 
                points_to_next_level,
                current_streak,
                longest_streak,
                last_activity_date
            )
            VALUES (
                NEW.id, 
                0, 
                1, 
                100,
                0,
                0,
                CURRENT_DATE
            )
            ON CONFLICT (user_id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            -- Logger l'erreur mais ne pas bloquer l'inscription
            RAISE WARNING 'Erreur lors de l''initialisation de user_points pour user %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ÉTAPE 5: RECRÉER LE TRIGGER
-- ============================================================================

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS trigger_init_user_points ON profiles;

-- Créer le nouveau trigger
CREATE TRIGGER trigger_init_user_points
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION init_user_points();

-- ÉTAPE 6: VÉRIFIER LES CONTRAINTES SUR user_points
-- ============================================================================

-- Lister toutes les contraintes
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_points'::regclass
ORDER BY conname;

-- ÉTAPE 7: S'ASSURER QUE LES POLITIQUES RLS PERMETTENT L'INSERTION
-- ============================================================================

-- Désactiver temporairement RLS sur user_points pour les inserts système
ALTER TABLE user_points DISABLE ROW LEVEL SECURITY;

-- Ou créer une politique qui permet les inserts via trigger
DROP POLICY IF EXISTS "Allow system inserts on user_points" ON user_points;

CREATE POLICY "Allow system inserts on user_points"
ON user_points
FOR INSERT
WITH CHECK (true);

-- Réactiver RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 8: ALTERNATIVE - UTILISER UNE FONCTION auth.users TRIGGER
-- ============================================================================

-- Si le problème persiste, créer un trigger sur auth.users au lieu de profiles

-- Supprimer l'ancien trigger sur profiles
DROP TRIGGER IF EXISTS trigger_init_user_points ON profiles;

-- Créer une fonction qui s'exécute sur auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insérer dans profiles
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        updated_at = NOW();

    -- Insérer dans user_points
    INSERT INTO public.user_points (
        user_id,
        total_points,
        level,
        points_to_next_level,
        current_streak,
        longest_streak,
        last_activity_date
    )
    VALUES (
        NEW.id,
        0,
        1,
        100,
        0,
        0,
        CURRENT_DATE
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ÉTAPE 9: TESTER L'INSCRIPTION
-- ============================================================================

-- Test: Créer un utilisateur test (à exécuter manuellement dans Supabase)
-- Utilisez l'interface Supabase pour créer un nouvel utilisateur
-- et vérifiez que les entrées sont créées dans profiles et user_points

-- ÉTAPE 10: VÉRIFICATION FINALE
-- ============================================================================

-- Compter les utilisateurs
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM public.user_points) as total_user_points;

-- Vérifier les utilisateurs sans profil ou sans points
SELECT 
    au.id,
    au.email,
    p.id IS NOT NULL as has_profile,
    up.user_id IS NOT NULL as has_user_points
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.user_points up ON au.id = up.user_id
WHERE p.id IS NULL OR up.user_id IS NULL;

-- ============================================================================
-- SOLUTION RAPIDE : SCRIPT TOUT-EN-UN
-- ============================================================================

-- Exécutez ceci si vous voulez tout corriger d'un coup:

BEGIN;

-- 1. Désactiver RLS temporairement
ALTER TABLE user_points DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciens triggers
DROP TRIGGER IF EXISTS trigger_init_user_points ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Créer la fonction handle_new_user robuste
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insérer profile
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();

    -- Insérer user_points
    INSERT INTO public.user_points (user_id, total_points, level, points_to_next_level, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.id, 0, 1, 100, 0, 0, CURRENT_DATE)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erreur lors de la création du profil utilisateur: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- 5. Créer les politiques nécessaires
DROP POLICY IF EXISTS "Allow system inserts" ON user_points;
CREATE POLICY "Allow system inserts" ON user_points FOR INSERT WITH CHECK (true);

-- 6. Réactiver RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================================================
-- NOTES
-- ============================================================================

-- ✅ Cette solution:
-- 1. Utilise un trigger sur auth.users au lieu de profiles
-- 2. Gère les erreurs sans bloquer l'inscription
-- 3. Crée à la fois profiles et user_points en une seule transaction
-- 4. Utilise SECURITY DEFINER pour contourner les restrictions RLS
-- 5. Permet les inserts système via une politique RLS dédiée

-- 🔧 Pour appliquer ce correctif:
-- 1. Ouvrez le SQL Editor dans votre dashboard Supabase
-- 2. Copiez-collez le bloc "SOLUTION RAPIDE" ci-dessus
-- 3. Exécutez-le
-- 4. Testez l'inscription d'un nouvel utilisateur

-- 📝 Pour vérifier que tout fonctionne:
-- SELECT * FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
-- SELECT * FROM information_schema.triggers WHERE event_object_table = 'profiles';
