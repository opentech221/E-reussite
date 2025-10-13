-- ============================================
-- MIGRATION: Fusionner user_profiles dans profiles
-- Date: 2 octobre 2025
-- Description: Consolide les deux tables de profils en une seule
-- ============================================

-- ÉTAPE 1: Ajouter les colonnes manquantes à profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;

-- ÉTAPE 2: Migrer les données de user_profiles vers profiles
-- (Si la table user_profiles existe et contient des données)
UPDATE profiles p
SET 
  points = COALESCE(up.points, 0),
  level = COALESCE(up.level, 1),
  streak_days = COALESCE(up.streak_days, 0)
FROM user_profiles up
WHERE p.id = up.id;

-- ÉTAPE 3: Vérifier les données migrées
-- SELECT id, full_name, points, level, streak_days FROM profiles LIMIT 10;

-- ÉTAPE 4: Supprimer la table user_profiles (DÉCOMMENTER APRÈS VÉRIFICATION)
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- ÉTAPE 5: Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription);

-- ============================================
-- NOTES IMPORTANTES:
-- 1. Backup votre BDD avant d'exécuter cette migration
-- 2. Vérifiez les données avant de DROP user_profiles
-- 3. Testez les requêtes après migration
-- ============================================
