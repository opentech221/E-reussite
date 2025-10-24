-- ============================================
-- MIGRATION : AJOUT CHAMPS SOCIO-ÉCONOMIQUES DANS PROFILES
-- Date : 24 octobre 2025
-- Objectif : Activer le pré-remplissage Q13-Q17 du test d'orientation
-- ============================================

-- PARTIE 1 : AJOUT DES COLONNES SOCIO-ÉCONOMIQUES
-- ================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_situation VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS network_support VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religious_values VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_level VARCHAR(20);

-- Commentaires
COMMENT ON COLUMN profiles.financial_situation IS 'Situation financière: low (contraintes élevées), medium (modérée), high (à l''aise)';
COMMENT ON COLUMN profiles.network_support IS 'Accès au réseau professionnel: strong (fort), moderate (limité), weak (faible)';
COMMENT ON COLUMN profiles.religious_values IS 'Importance des valeurs religieuses: very_important, important, neutral, not_important';
COMMENT ON COLUMN profiles.academic_level IS 'Niveau académique actuel: bfem, bac, bac+2, bac+3, bac+5, doctorat';

-- PARTIE 2 : VALEURS PAR DÉFAUT POUR UTILISATEURS EXISTANTS
-- ==========================================================

-- Définir des valeurs par défaut raisonnables pour les profils existants
UPDATE profiles 
SET 
  financial_situation = 'medium',
  network_support = 'moderate',
  religious_values = 'neutral',
  academic_level = CASE 
    WHEN level ILIKE '%bac%' AND level NOT ILIKE '%bfem%' THEN 'bac'
    WHEN level ILIKE '%bfem%' THEN 'bfem'
    WHEN level ILIKE '%licence%' OR level ILIKE '%l3%' THEN 'bac+3'
    WHEN level ILIKE '%master%' OR level ILIKE '%m2%' THEN 'bac+5'
    ELSE 'bac'
  END
WHERE financial_situation IS NULL;

-- PARTIE 3 : INDEX POUR PERFORMANCES (OPTIONNEL)
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_profiles_financial_situation ON profiles(financial_situation);
CREATE INDEX IF NOT EXISTS idx_profiles_academic_level ON profiles(academic_level);

-- PARTIE 4 : VÉRIFICATION POST-MIGRATION
-- =======================================

-- Vérifier les nouvelles colonnes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('financial_situation', 'network_support', 'religious_values', 'academic_level')
ORDER BY ordinal_position;

-- Vérifier la distribution des valeurs
SELECT 
  financial_situation,
  COUNT(*) as count
FROM profiles
GROUP BY financial_situation
ORDER BY count DESC;

SELECT 
  academic_level,
  COUNT(*) as count
FROM profiles
GROUP BY academic_level
ORDER BY count DESC;

-- ============================================
-- NOTES D'UTILISATION
-- ============================================

/*
APRÈS CETTE MIGRATION:

1. Les utilisateurs pourront renseigner ces champs dans leur profil
2. Le pré-remplissage Q13-Q17 sera automatiquement activé
3. Questions pré-remplies:
   - Q13: Moyenne générale → Estimée depuis academic_level
   - Q14: Situation financière → financial_situation
   - Q15: Localisation → location (déjà existant)
   - Q16: Réseau professionnel → network_support
   - Q17: Valeurs religieuses → religious_values

4. Valeurs acceptées:

   financial_situation:
   - 'low': Contraintes financières élevées
   - 'medium': Situation modérée
   - 'high': À l'aise financièrement

   network_support:
   - 'strong': Réseau professionnel fort
   - 'moderate': Réseau limité
   - 'weak': Peu/pas de réseau

   religious_values:
   - 'very_important': Très important
   - 'important': Important
   - 'neutral': Neutre
   - 'not_important': Pas important

   academic_level:
   - 'bfem': Niveau BFEM
   - 'bac': Niveau BAC
   - 'bac+2': Licence 2
   - 'bac+3': Licence 3
   - 'bac+5': Master
   - 'doctorat': Doctorat

5. PROCHAINES ÉTAPES:
   a) Exécuter cette migration dans Supabase SQL Editor
   b) Décommenter le code dans profileOrientationService.js
   c) Ajouter ces champs dans le formulaire Profile.jsx
   d) Tester le pré-remplissage dans /orientation
*/

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
