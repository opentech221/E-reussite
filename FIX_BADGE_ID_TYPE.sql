-- =============================================
-- FIX: Convertir badge_id de VARCHAR à UUID
-- =============================================

-- ⚠️ N'exécuter que si le diagnostic montre que badge_id est VARCHAR

-- Étape 1: Supprimer la contrainte UNIQUE
ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_badge_id_key;

-- Étape 2: Supprimer la contrainte de clé étrangère
ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS user_badges_badge_id_fkey;

-- Étape 3: Convertir la colonne badge_id en UUID
ALTER TABLE user_badges 
ALTER COLUMN badge_id TYPE UUID USING badge_id::UUID;

-- Étape 4: Recréer la clé étrangère
ALTER TABLE user_badges 
ADD CONSTRAINT user_badges_badge_id_fkey 
FOREIGN KEY (badge_id) REFERENCES competition_badges(id) ON DELETE CASCADE;

-- Étape 5: Recréer la contrainte UNIQUE
ALTER TABLE user_badges 
ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);

-- Vérification
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'user_badges' AND column_name = 'badge_id';

-- ✅ Devrait afficher: badge_id | uuid
