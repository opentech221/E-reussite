-- ============================================
-- Migration 015 FIX v3: Correction clé étrangère exam_results
-- ============================================
-- Date: 8 octobre 2025
-- Description: 
--   Corrige la référence de exam_id pour pointer vers 'examens' au lieu de 'exam_simulations'

-- ============================================
-- Étape 1: Vérifier quelle table existe
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'examens') THEN
    RAISE NOTICE '✓ Table "examens" existe';
  ELSE
    RAISE NOTICE '⚠️ Table "examens" n''existe pas';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_simulations') THEN
    RAISE NOTICE '✓ Table "exam_simulations" existe';
  ELSE
    RAISE NOTICE '⚠️ Table "exam_simulations" n''existe pas';
  END IF;
END $$;

-- ============================================
-- Étape 2: Supprimer l'ancienne contrainte
-- ============================================
DO $$ 
BEGIN
  -- Chercher et supprimer toutes les contraintes FK sur exam_id
  EXECUTE (
    SELECT string_agg('ALTER TABLE exam_results DROP CONSTRAINT IF EXISTS ' || constraint_name || ';', ' ')
    FROM information_schema.table_constraints
    WHERE table_name = 'exam_results' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%exam_id%'
  );
  
  RAISE NOTICE '✅ Anciennes contraintes supprimées';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erreur lors de la suppression des contraintes: %', SQLERRM;
END $$;

-- ============================================
-- Étape 3: Créer la nouvelle contrainte vers 'examens'
-- ============================================
DO $$ 
BEGIN
  -- Vérifier si la table examens existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'examens') THEN
    -- Ajouter la contrainte FK vers examens
    ALTER TABLE exam_results 
      ADD CONSTRAINT exam_results_exam_id_fkey 
      FOREIGN KEY (exam_id) 
      REFERENCES examens(id) 
      ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Contrainte FK créée vers examens(id)';
  ELSE
    RAISE EXCEPTION 'La table examens n''existe pas ! Veuillez exécuter la migration 009 d''abord.';
  END IF;
END $$;

-- ============================================
-- Étape 4: Vérifier les données
-- ============================================

-- Compter les examens disponibles
SELECT COUNT(*) as nb_examens FROM examens;

-- Afficher quelques examens
SELECT id, title, type, difficulty 
FROM examens 
LIMIT 5;

-- Vérifier les contraintes finales
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'exam_results' 
  AND tc.constraint_type = 'FOREIGN KEY';

SELECT '✅ Migration 015 FIX v3 : Clé étrangère corrigée avec succès !' AS message;
