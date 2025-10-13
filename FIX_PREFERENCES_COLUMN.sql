-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIX: Ajout de la colonne preferences à la table profiles
-- Date: 12 octobre 2025
-- Instructions: Exécutez ce script dans Supabase SQL Editor
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Étape 1: Ajouter la colonne preferences si elle n'existe pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Étape 2: Créer un index GIN pour optimiser les requêtes JSON
CREATE INDEX IF NOT EXISTS idx_profiles_preferences 
ON profiles USING GIN (preferences);

-- Étape 3: Ajouter un commentaire descriptif
COMMENT ON COLUMN profiles.preferences IS 'Préférences utilisateur (notifications, thème, langue, etc.) au format JSON';

-- Étape 4: Initialiser les préférences par défaut pour tous les profils existants
UPDATE profiles 
SET preferences = jsonb_build_object(
  'notifications', jsonb_build_object(
    'email', true,
    'push', true,
    'inApp', true,
    'marketing', false
  ),
  'theme', 'system',
  'language', 'fr'
)
WHERE preferences IS NULL OR preferences = '{}'::jsonb;

-- Étape 5: Vérification - Afficher quelques exemples
SELECT id, full_name, preferences 
FROM profiles 
LIMIT 5;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RÉSULTAT ATTENDU:
-- ✅ Column "preferences" added successfully
-- ✅ Index created
-- ✅ All profiles have default preferences
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Après exécution, rafraîchissez le cache du schéma:
-- 1. Allez dans Supabase Studio > Table Editor
-- 2. Cliquez sur "Refresh" ou rechargez la page
-- 3. Testez la sauvegarde des notifications dans votre app
