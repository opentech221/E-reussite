-- =============================================
-- Migration: Ajout des colonnes manquantes à profiles
-- Date: 30 novembre 2025
-- Description: Ajout des colonnes email, level, region, phone, etc.
-- =============================================

BEGIN;

-- ============================================
-- 1. Ajout des colonnes de base
-- ============================================

-- Email (copié depuis auth.users pour faciliter les requêtes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
        RAISE NOTICE '✅ Colonne email ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne email existe déjà';
    END IF;
END $$;

-- Niveau scolaire
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'level'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN level TEXT;
        RAISE NOTICE '✅ Colonne level ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne level existe déjà';
    END IF;
END $$;

-- Région
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'region'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN region TEXT;
        RAISE NOTICE '✅ Colonne region ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne region existe déjà';
    END IF;
END $$;

-- Téléphone
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
        RAISE NOTICE '✅ Colonne phone ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne phone existe déjà';
    END IF;
END $$;

-- Date de naissance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
        RAISE NOTICE '✅ Colonne date_of_birth ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne date_of_birth existe déjà';
    END IF;
END $$;

-- Genre
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'gender'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other', NULL));
        RAISE NOTICE '✅ Colonne gender ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne gender existe déjà';
    END IF;
END $$;

-- Adresse
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'address'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN address TEXT;
        RAISE NOTICE '✅ Colonne address ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne address existe déjà';
    END IF;
END $$;

-- Ville
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'city'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN city TEXT;
        RAISE NOTICE '✅ Colonne city ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne city existe déjà';
    END IF;
END $$;

-- Pays
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'country'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN country TEXT DEFAULT 'Sénégal';
        RAISE NOTICE '✅ Colonne country ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne country existe déjà';
    END IF;
END $$;

-- Bio/Description
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
        RAISE NOTICE '✅ Colonne bio ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne bio existe déjà';
    END IF;
END $$;

-- École/Établissement
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'school'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN school TEXT;
        RAISE NOTICE '✅ Colonne school ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne school existe déjà';
    END IF;
END $$;

-- Statut du compte (active, suspended, etc.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive', 'pending'));
        RAISE NOTICE '✅ Colonne status ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne status existe déjà';
    END IF;
END $$;

-- Dernière connexion
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_login'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMPTZ;
        RAISE NOTICE '✅ Colonne last_login ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne last_login existe déjà';
    END IF;
END $$;

-- Préférences utilisateur (JSON)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'preferences'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE '✅ Colonne preferences ajoutée';
    ELSE
        RAISE NOTICE '⏭️  Colonne preferences existe déjà';
    END IF;
END $$;

-- ============================================
-- 2. Remplir la colonne email depuis auth.users
-- ============================================

DO $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id
      AND p.email IS NULL;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✅ % emails synchronisés depuis auth.users', v_updated;
END $$;

-- ============================================
-- 3. Créer des index pour améliorer les performances
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_school ON public.profiles(school);

DO $$
BEGIN
    RAISE NOTICE '✅ Index créés';
END $$;

-- ============================================
-- 4. Créer une fonction trigger pour synchroniser l'email
-- ============================================

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Synchroniser l'email depuis auth.users lors de l'insertion ou mise à jour
    SELECT email INTO NEW.email
    FROM auth.users
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger si non existant
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'sync_profile_email_trigger'
    ) THEN
        CREATE TRIGGER sync_profile_email_trigger
        BEFORE INSERT OR UPDATE ON public.profiles
        FOR EACH ROW
        WHEN (NEW.email IS NULL)
        EXECUTE FUNCTION public.sync_profile_email();
        
        RAISE NOTICE '✅ Trigger sync_profile_email_trigger créé';
    ELSE
        RAISE NOTICE '⏭️  Trigger sync_profile_email_trigger existe déjà';
    END IF;
END $$;

-- ============================================
-- 5. Afficher le résultat final
-- ============================================

DO $$
DECLARE
    v_total INTEGER;
    v_with_email INTEGER;
    v_with_level INTEGER;
    v_with_region INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM public.profiles;
    SELECT COUNT(*) INTO v_with_email FROM public.profiles WHERE email IS NOT NULL;
    SELECT COUNT(*) INTO v_with_level FROM public.profiles WHERE level IS NOT NULL;
    SELECT COUNT(*) INTO v_with_region FROM public.profiles WHERE region IS NOT NULL;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Résultat final:';
    RAISE NOTICE '   Total profiles: %', v_total;
    RAISE NOTICE '   Avec email: % (%.1f%%)', v_with_email, (v_with_email::FLOAT / NULLIF(v_total, 0) * 100);
    RAISE NOTICE '   Avec niveau: % (%.1f%%)', v_with_level, (v_with_level::FLOAT / NULLIF(v_total, 0) * 100);
    RAISE NOTICE '   Avec région: % (%.1f%%)', v_with_region, (v_with_region::FLOAT / NULLIF(v_total, 0) * 100);
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Migration terminée avec succès!';
END $$;

COMMIT;
