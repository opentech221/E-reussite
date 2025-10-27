-- =============================================
-- FIX: Recréer user_badges avec la bonne structure
-- =============================================

-- ⚠️ ATTENTION: Ce script va SUPPRIMER toutes les données de user_badges !
-- Si vous avez des badges importants, faites une sauvegarde d'abord

-- ====================================
-- ÉTAPE 1: Sauvegarder les données existantes (optionnel)
-- ====================================

-- Créer une table de backup
CREATE TABLE IF NOT EXISTS user_badges_backup AS 
SELECT * FROM user_badges;

-- Vérifier le backup
SELECT COUNT(*) as total_badges_saved FROM user_badges_backup;

-- ====================================
-- ÉTAPE 2: Supprimer l'ancienne table
-- ====================================

DROP TABLE IF EXISTS user_badges CASCADE;

-- ====================================
-- ÉTAPE 3: Recréer avec la bonne structure
-- ====================================

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES competition_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    metadata JSONB, -- Contexte: score, rank, etc.
    UNIQUE(user_id, badge_id) -- Un badge ne peut être gagné qu'une fois
);

-- Index pour recherche rapide
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_competition_id ON user_badges(competition_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ====================================
-- ÉTAPE 4: Activer RLS
-- ====================================

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut voir les badges des autres
CREATE POLICY "Anyone can view user badges"
    ON user_badges FOR SELECT
    USING (true);

-- ====================================
-- ÉTAPE 5: Vérification finale
-- ====================================

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_badges'
ORDER BY ordinal_position;

-- ✅ RÉSULTAT ATTENDU:
-- id → uuid
-- user_id → uuid
-- badge_id → uuid
-- earned_at → timestamptz
-- competition_id → uuid
-- metadata → jsonb

-- ====================================
-- ÉTAPE 6 (OPTIONNEL): Restaurer les données
-- ====================================

/*
-- Si vous voulez restaurer les badges existants:
INSERT INTO user_badges (user_id, badge_id, earned_at, competition_id)
SELECT user_id, badge_id, earned_at, NULL
FROM user_badges_backup;

-- Puis supprimer le backup:
DROP TABLE user_badges_backup;
*/
