-- ============================================
-- MIGRATION : AJOUT COLONNE LOCATION DANS PROFILES
-- Date : 24 octobre 2025
-- Objectif : Permettre le pré-remplissage de Q15 (localisation)
-- ============================================

-- AJOUT DE LA COLONNE LOCATION
-- =============================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);

-- Commentaire
COMMENT ON COLUMN profiles.location IS 'Localisation géographique de l''utilisateur (ville, région, pays)';

-- INDEX POUR PERFORMANCES (OPTIONNEL)
-- ====================================

CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);

-- VÉRIFICATION POST-MIGRATION
-- ============================

-- Vérifier la nouvelle colonne
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'location';

-- Compter les profils avec/sans localisation
SELECT 
  CASE 
    WHEN location IS NULL OR location = '' THEN 'Non renseigné'
    ELSE 'Renseigné'
  END as status,
  COUNT(*) as count
FROM profiles
GROUP BY status;

-- ============================================
-- NOTES D'UTILISATION
-- ============================================

/*
APRÈS CETTE MIGRATION:

1. La colonne 'location' sera disponible dans profiles
2. Le pré-remplissage de Q15 pourra être activé
3. Valeurs acceptées: Texte libre (ville, région, pays)
   Exemples: 'Dakar', 'Dakar, Sénégal', 'Thiès', 'Paris, France'

4. PROCHAINES ÉTAPES:
   a) Exécuter cette migration dans Supabase SQL Editor
   b) Réactiver Q15 dans profileOrientationService.js
   c) Ajouter le champ 'location' dans Profile.jsx (optionnel)
   d) Tester le pré-remplissage complet Q13-Q17

5. MAPPING Q15:
   - Question Q15: "Dans quelle zone géographique souhaitez-vous travailler ?"
   - Réponses: 'dakar', 'other_senegal', 'abroad', 'flexible'
   - Mapping simple:
     * Si location contient 'Dakar' → 'dakar'
     * Si location contient pays africain → 'other_senegal'
     * Si location contient pays étranger → 'abroad'
     * Sinon → 'flexible'
*/

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
