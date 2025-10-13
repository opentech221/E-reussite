-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- OPTION A: MIGRATION AVEC PRÉSERVATION DES DONNÉES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Utiliser cette option si vous voulez GARDER les données existantes
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ÉTAPE 1: Renommer la table existante (backup)
-- ============================================================================

ALTER TABLE public.user_badges RENAME TO user_badges_old;

-- ============================================================================
-- ÉTAPE 2: Créer le type ENUM badge_type
-- ============================================================================

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

-- ============================================================================
-- ÉTAPE 3: Créer la nouvelle table user_badges
-- ============================================================================

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

-- ============================================================================
-- ÉTAPE 4: Migrer les données de l'ancienne vers la nouvelle table
-- ============================================================================

-- Migrer les données en joignant avec la table badges
INSERT INTO user_badges (user_id, badge_name, badge_type, badge_description, badge_icon, earned_at)
SELECT 
    ub.user_id,
    b.name as badge_name,
    -- Mapper les badges existants vers les types appropriés
    CASE 
        WHEN b.name ILIKE '%quiz%' OR b.name ILIKE '%leçon%' THEN 'progression'::badge_type
        WHEN b.name ILIKE '%score%' OR b.name ILIKE '%performance%' THEN 'performance'::badge_type
        WHEN b.name ILIKE '%jour%' OR b.name ILIKE '%consécutif%' THEN 'streak'::badge_type
        WHEN b.name ILIKE '%parfait%' OR b.name ILIKE '%100%' THEN 'perfection'::badge_type
        WHEN b.name ILIKE '%rapide%' OR b.name ILIKE '%vitesse%' THEN 'speed'::badge_type
        WHEN b.name ILIKE '%temps%' OR b.name ILIKE '%heures%' THEN 'dedication'::badge_type
        ELSE 'special'::badge_type
    END as badge_type,
    b.description as badge_description,
    b.icon as badge_icon,
    ub.earned_at
FROM user_badges_old ub
INNER JOIN badges b ON ub.badge_id = b.id
ON CONFLICT (user_id, badge_name) DO NOTHING;

-- ============================================================================
-- ÉTAPE 5: Créer les index
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_type ON user_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ============================================================================
-- ÉTAPE 6: Activer RLS et créer les politiques
-- ============================================================================

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Lecture: Badges publics (pour profils)
CREATE POLICY "user_badges_select_all"
    ON user_badges FOR SELECT
    TO authenticated
    USING (true);

-- Insertion: Uniquement ses propres badges
CREATE POLICY "user_badges_insert_own"
    ON user_badges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ÉTAPE 7: Créer les tables user_points et user_progress
-- ============================================================================

-- TABLE user_points
CREATE TABLE IF NOT EXISTS user_points (
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

CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_level ON user_points(level DESC);

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

-- TABLE user_progress
CREATE TABLE IF NOT EXISTS user_progress (
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

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_chapitre_id ON user_progress(chapitre_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(completed);

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

-- ============================================================================
-- ÉTAPE 8: Créer les fonctions et triggers
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
-- ÉTAPE 9: Vérification
-- ============================================================================

-- Vérifier que les données ont été migrées
SELECT 
    'user_badges_old' as table_name,
    COUNT(*) as row_count
FROM user_badges_old

UNION ALL

SELECT 
    'user_badges (nouvelle)' as table_name,
    COUNT(*) as row_count
FROM user_badges;

-- ============================================================================
-- ÉTAPE 10 (OPTIONNEL): Supprimer l'ancienne table après vérification
-- ============================================================================

-- ⚠️ NE PAS EXÉCUTER CETTE LIGNE AVANT D'AVOIR VÉRIFIÉ QUE TOUT FONCTIONNE
-- DROP TABLE user_badges_old CASCADE;

-- ============================================================================
-- FIN DE LA MIGRATION OPTION A
-- ============================================================================
