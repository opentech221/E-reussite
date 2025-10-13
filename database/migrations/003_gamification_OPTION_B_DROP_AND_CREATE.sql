-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- OPTION B: SUPPRESSION ET RECRÉATION (DESTRUCTIF)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ⚠️ ATTENTION: Cette option SUPPRIME les données existantes
-- Utiliser seulement si les badges actuels ne sont pas importants
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ÉTAPE 1: Supprimer les tables existantes
-- ============================================================================

-- ⚠️ SUPPRESSION DES DONNÉES EXISTANTES
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.user_points CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;

-- Supprimer le type ENUM s'il existe
DROP TYPE IF EXISTS badge_type CASCADE;

-- ============================================================================
-- ÉTAPE 2: Créer le type ENUM badge_type
-- ============================================================================

CREATE TYPE badge_type AS ENUM (
    'progression',    -- Badges de progression (5, 10, 20 quiz)
    'performance',    -- Badges de performance (scores élevés)
    'streak',         -- Badges de streaks (7, 30, 100 jours)
    'perfection',     -- Badges de perfection (100% sans erreur)
    'speed',          -- Badges de rapidité
    'dedication',     -- Badges de dévouement (temps passé)
    'special'         -- Badges spéciaux/événements
);

-- ============================================================================
-- ÉTAPE 3: Créer les 3 tables
-- ============================================================================

-- TABLE 1: user_points
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,
    
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    quizzes_completed INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- TABLE 2: user_progress
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    chapitre_id INTEGER NOT NULL REFERENCES chapitres(id) ON DELETE CASCADE,
    
    completed BOOLEAN DEFAULT false,
    progress_percentage INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, chapitre_id)
);

-- TABLE 3: user_badges
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    badge_name VARCHAR(100) NOT NULL,
    badge_type badge_type NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(50),
    
    condition_value INTEGER,
    
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, badge_name)
);

-- ============================================================================
-- ÉTAPE 4: Créer les index
-- ============================================================================

-- Index user_points
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX idx_user_points_level ON user_points(level DESC);

-- Index user_progress
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_chapitre_id ON user_progress(chapitre_id);
CREATE INDEX idx_user_progress_completed ON user_progress(completed);

-- Index user_badges
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_type ON user_badges(badge_type);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ============================================================================
-- ÉTAPE 5: Activer RLS et créer les politiques
-- ============================================================================

-- RLS: user_points
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_points_select_own_and_public"
    ON user_points FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "user_points_insert_own"
    ON user_points FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_points_update_own"
    ON user_points FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_select_own"
    ON user_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "user_progress_insert_own"
    ON user_progress FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update_own"
    ON user_progress FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges_select_all"
    ON user_badges FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "user_badges_insert_own"
    ON user_badges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ÉTAPE 6: Créer les fonctions et triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(points::FLOAT / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_points_to_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (current_level * current_level * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level := calculate_level(NEW.total_points);
    NEW.points_to_next_level := calculate_points_to_next_level(NEW.level) - NEW.total_points;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
BEFORE UPDATE ON user_points
FOR EACH ROW
WHEN (OLD.total_points IS DISTINCT FROM NEW.total_points)
EXECUTE FUNCTION update_user_level();

CREATE OR REPLACE FUNCTION init_user_points()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_points (user_id, total_points, level, points_to_next_level)
    VALUES (NEW.id, 0, 1, 100)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_init_user_points
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION init_user_points();

-- ============================================================================
-- ÉTAPE 7: Vérification
-- ============================================================================

SELECT 
    'user_points' as table_name,
    COUNT(*) as row_count
FROM user_points

UNION ALL

SELECT 
    'user_progress' as table_name,
    COUNT(*) as row_count
FROM user_progress

UNION ALL

SELECT 
    'user_badges' as table_name,
    COUNT(*) as row_count
FROM user_badges;

-- ============================================================================
-- FIN DE LA MIGRATION OPTION B
-- ============================================================================
