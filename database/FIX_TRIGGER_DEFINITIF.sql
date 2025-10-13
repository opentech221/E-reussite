-- ============================================================================
-- CORRECTION DÉFINITIVE DU TRIGGER - Avec meilleur logging
-- Date: 10 octobre 2025
-- Problème: Trigger échoue silencieusement sans créer user_points
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: SUPPRIMER L'ANCIEN TRIGGER ET LA FONCTION
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- ============================================================================
-- ÉTAPE 2: CRÉER LA NOUVELLE FONCTION AVEC MEILLEUR LOGGING
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_error_message text;
BEGIN
    -- Log du début
    RAISE NOTICE 'Trigger handle_new_user: Début pour user %', NEW.id;

    -- Créer le profil
    BEGIN
        -- Note: profiles n'a PAS de colonne email
        INSERT INTO public.profiles (id, full_name, created_at, updated_at)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
            NOW(), 
            NOW()
        )
        ON CONFLICT (id) DO UPDATE 
        SET full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
            updated_at = NOW();
        
        RAISE NOTICE 'Trigger handle_new_user: Profil créé/mis à jour pour %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        RAISE WARNING 'Erreur création profil pour %: %', NEW.id, v_error_message;
        -- Continue quand même pour créer les points
    END;

    -- Créer les points (partie critique)
    BEGIN
        INSERT INTO public.user_points (
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
        VALUES (
            NEW.id,       -- user_id
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
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Trigger handle_new_user: Points créés pour %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        v_error_message := SQLERRM;
        RAISE WARNING '❌ ERREUR CRITIQUE création points pour %: %', NEW.id, v_error_message;
        -- Ne pas bloquer l'inscription même si ça échoue
    END;

    RAISE NOTICE 'Trigger handle_new_user: Terminé avec succès pour %', NEW.id;
    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    v_error_message := SQLERRM;
    RAISE WARNING '❌ ERREUR GÉNÉRALE dans handle_new_user pour %: %', NEW.id, v_error_message;
    RETURN NEW; -- Ne jamais bloquer l'inscription
END;
$$;

-- ============================================================================
-- ÉTAPE 3: RECRÉER LE TRIGGER
-- ============================================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ÉTAPE 4: VÉRIFICATION
-- ============================================================================

-- Vérifier que le trigger est créé
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    CASE tgenabled
        WHEN 'O' THEN '✅ Activé'
        WHEN 'D' THEN '❌ Désactivé'
        ELSE '⚠️ Autre statut'
    END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Vérifier que la fonction existe
SELECT 
    proname as function_name,
    prosecdef as security_definer,
    CASE prosecdef
        WHEN true THEN '✅ SECURITY DEFINER'
        ELSE '❌ Pas SECURITY DEFINER'
    END as security_status
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ============================================================================
-- ÉTAPE 5: TEST AVEC UN UTILISATEUR EXISTANT (optionnel)
-- ============================================================================

-- Pour tester, vous pouvez simuler une mise à jour sur un utilisateur existant
-- (Ne pas exécuter cette partie en production)
/*
UPDATE auth.users 
SET updated_at = NOW() 
WHERE email = 'test@example.com';
*/

-- ============================================================================
-- MESSAGES DE SUCCÈS
-- ============================================================================

SELECT '🎉 Trigger recréé avec succès!' as message;
SELECT '✅ Meilleur logging activé (RAISE NOTICE + RAISE WARNING)' as amelioration;
SELECT '✅ Tous les champs de user_points sont maintenant insérés' as amelioration2;
SELECT '🧪 Testez maintenant une nouvelle inscription' as prochaine_etape;

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

-- ✅ AMÉLIORATIONS APPORTÉES:
-- 1. Meilleur logging avec RAISE NOTICE à chaque étape
-- 2. Tous les champs de user_points initialisés à 0
-- 3. Blocs BEGIN/EXCEPTION séparés pour profil et points
-- 4. Messages d'erreur plus clairs avec ❌
-- 5. SET search_path = public (sécurité)

-- 🔍 COMMENT VOIR LES LOGS:
-- Dans Supabase Dashboard → Logs → Postgres Logs
-- Cherchez "Trigger handle_new_user" ou "ERREUR CRITIQUE"

-- ⚠️ SI LE TRIGGER NE FONCTIONNE TOUJOURS PAS:
-- 1. Vérifier les logs Postgres dans Supabase
-- 2. Vérifier que RLS est bien configuré (politiques INSERT autorisées)
-- 3. Vérifier que la contrainte unique sur user_id ne cause pas de conflit

-- 🎯 APRÈS L'EXÉCUTION:
-- 1. Créer un nouveau compte test en navigation privée
-- 2. Vérifier dans Supabase que user_points est créé automatiquement
-- 3. Vérifier dans Logs → Postgres que les RAISE NOTICE apparaissent
