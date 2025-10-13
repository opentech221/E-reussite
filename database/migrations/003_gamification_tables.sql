-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MIGRATION 003: Tables Gamification (Phase 2)
-- Description: Système de points, niveaux, badges et progression
-- Date: 5 octobre 2025
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- TABLE 1: user_points (Points, Niveaux, Streaks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Points & Niveau
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,
    
    -- Streaks (jours consécutifs)
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Statistiques
    quizzes_completed INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- en secondes
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_level ON user_points(level DESC);

-- ============================================================================
-- TABLE 2: user_progress (Progression dans les leçons)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Référence à la leçon (chapitre)
    chapitre_id INTEGER NOT NULL REFERENCES chapitres(id) ON DELETE CASCADE,
    
    -- Statut de progression
    completed BOOLEAN DEFAULT false,
    progress_percentage INTEGER DEFAULT 0, -- 0-100
    time_spent INTEGER DEFAULT 0, -- secondes passées sur cette leçon
    
    -- Métadonnées
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, chapitre_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_chapitre_id ON user_progress(chapitre_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(completed);

-- ============================================================================
-- TABLE 3: user_badges (Badges & Achievements)
-- ============================================================================

-- Enum pour les types de badges (avec gestion si existe déjà)
DROP TYPE IF EXISTS badge_type CASCADE;
CREATE TYPE badge_type AS ENUM (
    'progression',    -- Badges de progression (5, 10, 20 quiz)
    'performance',    -- Badges de performance (scores élevés)
    'streak',         -- Badges de streaks (7, 30, 100 jours)
    'perfection',     -- Badges de perfection (100% sans erreur)
    'speed',          -- Badges de rapidité
    'dedication',     -- Badges de dévouement (temps passé)
    'special'         -- Badges spéciaux/événements
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Informations du badge
    badge_name VARCHAR(100) NOT NULL,
    badge_type badge_type NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(50), -- emoji ou nom d'icône
    
    -- Condition d'obtention
    condition_value INTEGER, -- ex: 10 pour "10 quiz complétés"
    
    -- Métadonnées
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, badge_name)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_type ON user_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ============================================================================
-- POLITIQUES RLS (Row Level Security)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────
-- RLS: user_points
-- ─────────────────────────────────────────────────────────────────────────

-- Lecture: Utilisateurs authentifiés peuvent voir leur propre profil ET tous les profils (pour leaderboard)
CREATE POLICY "user_points_select_own_and_public"
    ON user_points FOR SELECT
    TO authenticated
    USING (true); -- Tous les profils visibles pour le classement

-- Insertion: Uniquement son propre profil
CREATE POLICY "user_points_insert_own"
    ON user_points FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Mise à jour: Uniquement son propre profil
CREATE POLICY "user_points_update_own"
    ON user_points FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- RLS: user_progress
-- ─────────────────────────────────────────────────────────────────────────

-- Lecture: Uniquement sa propre progression
CREATE POLICY "user_progress_select_own"
    ON user_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Insertion: Uniquement sa propre progression
CREATE POLICY "user_progress_insert_own"
    ON user_progress FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Mise à jour: Uniquement sa propre progression
CREATE POLICY "user_progress_update_own"
    ON user_progress FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- RLS: user_badges
-- ─────────────────────────────────────────────────────────────────────────

-- Lecture: Utilisateurs authentifiés peuvent voir leurs badges ET ceux des autres (pour profils publics)
CREATE POLICY "user_badges_select_all"
    ON user_badges FOR SELECT
    TO authenticated
    USING (true);

-- Insertion: Uniquement ses propres badges (via système automatique)
CREATE POLICY "user_badges_insert_own"
    ON user_badges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- Fonction: Calculer le niveau en fonction des points
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Formule: niveau = floor(sqrt(points / 100)) + 1
    -- 0-99 points = niveau 1
    -- 100-399 points = niveau 2
    -- 400-899 points = niveau 3
    -- 900-1599 points = niveau 4
    -- etc.
    RETURN FLOOR(SQRT(points::FLOAT / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─────────────────────────────────────────────────────────────────────────
-- Fonction: Calculer les points nécessaires pour le prochain niveau
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_points_to_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Formule inverse: points_requis = ((niveau)^2 * 100)
    RETURN (current_level * current_level * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger: Mettre à jour automatiquement le niveau quand les points changent
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer le niveau basé sur les points
    NEW.level := calculate_level(NEW.total_points);
    
    -- Recalculer les points nécessaires pour le prochain niveau
    NEW.points_to_next_level := calculate_points_to_next_level(NEW.level) - NEW.total_points;
    
    -- Mettre à jour le timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
BEFORE UPDATE ON user_points
FOR EACH ROW
WHEN (OLD.total_points IS DISTINCT FROM NEW.total_points)
EXECUTE FUNCTION update_user_level();

-- ─────────────────────────────────────────────────────────────────────────
-- Fonction: Initialiser user_points pour un nouvel utilisateur
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION init_user_points()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_points (user_id, total_points, level, points_to_next_level)
    VALUES (NEW.id, 0, 1, 100)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement user_points lors de la création d'un profil
CREATE TRIGGER trigger_init_user_points
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION init_user_points();

-- ============================================================================
-- DONNÉES DE TEST (Optionnel - décommenter si besoin)
-- ============================================================================

/*
-- Exemple: Créer des points pour l'utilisateur test
INSERT INTO user_points (user_id, total_points, level, current_streak)
SELECT id, 500, 3, 5
FROM profiles
WHERE email = 'cheikhtidianesamba.ba@ucad.edu.sn'
ON CONFLICT (user_id) DO UPDATE
SET total_points = EXCLUDED.total_points,
    level = EXCLUDED.level,
    current_streak = EXCLUDED.current_streak;
*/

-- ============================================================================
-- FIN DE LA MIGRATION 003
-- ============================================================================

-- Pour exécuter cette migration:
-- 1. Copiez tout le contenu de ce fichier
-- 2. Allez dans Supabase Dashboard → SQL Editor
-- 3. Collez et exécutez
-- 4. Vérifiez que les 3 tables sont créées avec: SELECT * FROM user_points LIMIT 1;
