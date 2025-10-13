-- Migration: Ajout de la colonne preferences à la table profiles
-- Date: 12 octobre 2025
-- Description: Ajout du support des préférences utilisateur (notifications, thème, etc.)

-- Ajouter la colonne preferences si elle n'existe pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Créer un index sur preferences pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_preferences ON profiles USING GIN (preferences);

-- Commentaire sur la colonne
COMMENT ON COLUMN profiles.preferences IS 'Préférences utilisateur (notifications, thème, langue, etc.) au format JSON';

-- Mettre à jour les profils existants avec des préférences par défaut
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
