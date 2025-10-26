-- =============================================
-- SCHEMA MVP COMPETITIONS PHASE 1
-- Compétitions asynchrones + Leaderboards
-- =============================================

-- Table des questions génériques pour compétitions
-- (Peut être alimentée depuis quiz_questions ou interactive_quiz_questions)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    
    -- Type de question
    question_type VARCHAR(20) DEFAULT 'qcm' CHECK (question_type IN ('qcm', 'vrai_faux', 'texte_libre')),
    
    -- Options (pour QCM)
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1) CHECK (correct_option IN ('A', 'B', 'C', 'D')), -- 'A', 'B', 'C', 'D'
    
    -- Métadonnées
    subject VARCHAR(100), -- 'mathematiques', 'sciences', etc.
    difficulty VARCHAR(20) DEFAULT 'moyen' CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
    
    -- Traçabilité
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

COMMENT ON TABLE questions IS 'Questions génériques utilisées pour les compétitions';
COMMENT ON COLUMN questions.correct_option IS 'Réponse correcte : A, B, C ou D';

-- Table principale des compétitions
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Type de compétition
    type VARCHAR(50) NOT NULL DEFAULT 'asynchronous' CHECK (type IN ('asynchronous', 'live_duel', 'tournament')),
    
    -- Configuration
    subject VARCHAR(100), -- 'mathematiques', 'sciences', 'francais', etc.
    grade_level VARCHAR(50), -- 'troisieme', 'terminale', etc.
    difficulty VARCHAR(20) DEFAULT 'moyen' CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
    
    -- Durée et questions
    duration_minutes INTEGER NOT NULL DEFAULT 15, -- Durée totale
    questions_count INTEGER NOT NULL DEFAULT 10,
    
    -- Statut et dates
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Récompenses
    reward_points INTEGER DEFAULT 0,
    reward_xp INTEGER DEFAULT 0,
    reward_badges JSONB DEFAULT '[]'::jsonb,
    
    -- Métadonnées
    max_participants INTEGER, -- NULL = illimité
    current_participants INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_starts_at ON competitions(starts_at);
CREATE INDEX IF NOT EXISTS idx_competitions_subject ON competitions(subject);
CREATE INDEX IF NOT EXISTS idx_competitions_grade_level ON competitions(grade_level);
CREATE INDEX IF NOT EXISTS idx_competitions_type ON competitions(type);

-- Table des participants
CREATE TABLE IF NOT EXISTS competition_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Scores et performance
    score INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    time_taken_seconds INTEGER DEFAULT 0, -- Temps total pris
    
    -- Classement
    rank INTEGER,
    percentile DECIMAL(5,2), -- Pourcentage par rapport aux autres (ex: top 10%)
    
    -- Statut
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées
    answers_data JSONB DEFAULT '{}'::jsonb, -- Stockage des réponses détaillées
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(competition_id, user_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_competition_participants_competition_id ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user_id ON competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_score ON competition_participants(score DESC);
CREATE INDEX IF NOT EXISTS idx_competition_participants_rank ON competition_participants(rank);
CREATE INDEX IF NOT EXISTS idx_competition_participants_status ON competition_participants(status);

-- Table des questions liées aux compétitions
CREATE TABLE IF NOT EXISTS competition_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    
    -- Référence à la question existante
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    
    -- Position dans la compétition
    order_index INTEGER NOT NULL,
    
    -- Points
    points INTEGER DEFAULT 10,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(competition_id, question_id),
    UNIQUE(competition_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_competition_questions_competition_id ON competition_questions(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_questions_order ON competition_questions(competition_id, order_index);

-- Table des réponses aux questions de compétition
CREATE TABLE IF NOT EXISTS competition_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES competition_participants(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES competition_questions(id) ON DELETE CASCADE,
    
    -- Réponse
    selected_answer INTEGER NOT NULL, -- Index de la réponse choisie (0-3)
    is_correct BOOLEAN NOT NULL,
    
    -- Temps
    time_taken_seconds INTEGER NOT NULL, -- Temps pour cette question
    
    -- Points
    points_earned INTEGER DEFAULT 0,
    
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(participant_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_answers_participant_id ON competition_answers(participant_id);
CREATE INDEX IF NOT EXISTS idx_competition_answers_question_id ON competition_answers(question_id);

-- Table des classements francophones (regional/national)
CREATE TABLE IF NOT EXISTS competition_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Position
    global_rank INTEGER,
    regional_rank INTEGER,
    national_rank INTEGER,
    
    -- Localisation (reprise de profiles.location)
    region VARCHAR(100),
    country VARCHAR(100),
    
    -- Scores
    score INTEGER NOT NULL,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(competition_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_leaderboards_competition_id ON competition_leaderboards(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_leaderboards_global_rank ON competition_leaderboards(global_rank);
CREATE INDEX IF NOT EXISTS idx_competition_leaderboards_region ON competition_leaderboards(region);
CREATE INDEX IF NOT EXISTS idx_competition_leaderboards_country ON competition_leaderboards(country);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_participants_updated_at
    BEFORE UPDATE ON competition_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour documentation
COMMENT ON TABLE competitions IS 'Compétitions éducatives (asynchrones, duels live, tournois)';
COMMENT ON TABLE competition_participants IS 'Participants inscrits aux compétitions avec leurs scores';
COMMENT ON TABLE competition_questions IS 'Questions sélectionnées pour chaque compétition';
COMMENT ON TABLE competition_answers IS 'Réponses des participants aux questions';
COMMENT ON TABLE competition_leaderboards IS 'Classements globaux, régionaux et nationaux';

COMMENT ON COLUMN competitions.type IS 'Type: asynchronous (MVP Phase 1), live_duel (Phase 2), tournament (Phase 3)';
COMMENT ON COLUMN competitions.status IS 'Statut: upcoming, active, completed, cancelled';
COMMENT ON COLUMN competition_participants.percentile IS 'Position percentile (ex: 95 = top 5%)';
COMMENT ON COLUMN competition_participants.answers_data IS 'JSONB avec détails des réponses pour analytics';
