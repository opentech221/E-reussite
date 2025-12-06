-- =====================================================
-- FIX: orientation_tests - Erreur 406 Not Acceptable
-- =====================================================
-- Problème: La requête .order('completed_at', {ascending: false}).limit(1)
-- retourne 406 car la colonne completed_at n'existe peut-être pas
-- ou les RLS policies bloquent l'accès

-- 1. Vérifier si la colonne completed_at existe
-- Si elle n'existe pas, la créer:

ALTER TABLE public.orientation_tests 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 2. Ajouter un index pour performance
CREATE INDEX IF NOT EXISTS idx_orientation_tests_completed_at 
ON public.orientation_tests(completed_at DESC);

-- 3. Vérifier les RLS policies existantes
-- Liste des policies actuelles:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'orientation_tests';

-- 4. Si besoin, créer une policy de base pour SELECT
-- (À ajuster selon vos besoins de sécurité)

DO $$ 
BEGIN
  -- Supprimer l'ancienne policy si elle existe
  DROP POLICY IF EXISTS "Users can view own orientation tests" ON public.orientation_tests;
  
  -- Créer la nouvelle policy
  CREATE POLICY "Users can view own orientation tests"
    ON public.orientation_tests
    FOR SELECT
    USING (auth.uid() = user_id);
    
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- 5. Policy pour les admins
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can view all orientation tests" ON public.orientation_tests;
  
  CREATE POLICY "Admins can view all orientation tests"
    ON public.orientation_tests
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
    
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- 6. Mettre à jour completed_at pour les tests existants si NULL
UPDATE public.orientation_tests
SET completed_at = created_at
WHERE completed_at IS NULL AND created_at IS NOT NULL;

-- 7. Vérification finale
SELECT 
  COUNT(*) as total_tests,
  COUNT(completed_at) as tests_with_completed_at,
  COUNT(*) - COUNT(completed_at) as tests_without_completed_at
FROM public.orientation_tests;
