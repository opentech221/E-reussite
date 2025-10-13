-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MIGRATION 016: Système Quiz Complet
-- Description: Création de la table quiz_results pour sauvegarder les résultats
-- Date: 8 octobre 2025
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- TABLE: quiz_results (Résultats des quiz des utilisateurs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
    
    -- Résultats
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100), -- Score en %
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER NOT NULL DEFAULT 0, -- Temps en secondes
    
    -- Réponses détaillées (JSON)
    answers JSONB, -- Structure: [{question_id, user_answer, is_correct}, ...]
    
    -- Points gagnés (gamification)
    points_earned INTEGER DEFAULT 0,
    
    -- Métadonnées
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    
    -- Contrainte: un utilisateur peut refaire un quiz plusieurs fois
    -- Donc PAS de UNIQUE(user_id, quiz_id)
);

-- ============================================================================
-- INDEX: Optimisation des requêtes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at DESC);

-- ============================================================================
-- FONCTION RPC: get_user_quiz_stats (Statistiques quiz d'un utilisateur)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id UUID)
RETURNS TABLE (
    total_quizzes_taken BIGINT,
    quizzes_completed BIGINT,
    average_score NUMERIC,
    best_score NUMERIC,
    total_points_earned BIGINT,
    total_time_spent BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_quizzes_taken,
        COUNT(*)::BIGINT as quizzes_completed,
        ROUND(AVG(qr.score), 2) as average_score,
        MAX(qr.score) as best_score,
        SUM(qr.points_earned)::BIGINT as total_points_earned,
        SUM(qr.time_taken)::BIGINT as total_time_spent
    FROM quiz_results qr
    WHERE qr.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FONCTION RPC: get_quiz_leaderboard (Classement d'un quiz spécifique)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_quiz_leaderboard(p_quiz_id INTEGER, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    score NUMERIC,
    time_taken INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qr.user_id,
        p.full_name,
        qr.score,
        qr.time_taken,
        qr.completed_at,
        ROW_NUMBER() OVER (ORDER BY qr.score DESC, qr.time_taken ASC) as rank
    FROM quiz_results qr
    INNER JOIN profiles p ON p.id = qr.user_id
    WHERE qr.quiz_id = p_quiz_id
    ORDER BY qr.score DESC, qr.time_taken ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FONCTION RPC: get_user_best_quiz_attempts (Meilleures tentatives par quiz)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_best_quiz_attempts(p_user_id UUID)
RETURNS TABLE (
    quiz_id INTEGER,
    quiz_title TEXT,
    best_score NUMERIC,
    best_time INTEGER,
    attempts_count BIGINT,
    last_attempt TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qr.quiz_id,
        q.title as quiz_title,
        MAX(qr.score) as best_score,
        MIN(qr.time_taken) as best_time,
        COUNT(*)::BIGINT as attempts_count,
        MAX(qr.completed_at) as last_attempt
    FROM quiz_results qr
    INNER JOIN quiz q ON q.id = qr.quiz_id
    WHERE qr.user_id = p_user_id
    GROUP BY qr.quiz_id, q.title
    ORDER BY MAX(qr.completed_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS (Row Level Security) - Sécurité des données
-- ============================================================================

-- Activer RLS sur la table
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres résultats
CREATE POLICY "Users can view their own quiz results"
    ON quiz_results FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent insérer leurs propres résultats
CREATE POLICY "Users can insert their own quiz results"
    ON quiz_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs ne peuvent PAS modifier leurs résultats (intégrité)
-- Pas de UPDATE policy → résultats immuables

-- Policy: Les utilisateurs ne peuvent PAS supprimer leurs résultats (historique)
-- Pas de DELETE policy → historique préservé

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Permissions pour les utilisateurs authentifiés
GRANT SELECT, INSERT ON quiz_results TO authenticated;

-- Permissions pour les fonctions RPC
GRANT EXECUTE ON FUNCTION get_user_quiz_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_quiz_leaderboard(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_best_quiz_attempts(UUID) TO authenticated;

-- ============================================================================
-- TRIGGER: Mise à jour automatique de user_points.quizzes_completed
-- ============================================================================

CREATE OR REPLACE FUNCTION update_quizzes_completed()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrémenter le compteur de quiz complétés
    UPDATE user_points
    SET quizzes_completed = quizzes_completed + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Si l'utilisateur n'a pas encore de ligne dans user_points, la créer
    IF NOT FOUND THEN
        INSERT INTO user_points (user_id, quizzes_completed)
        VALUES (NEW.user_id, 1)
        ON CONFLICT (user_id) DO UPDATE
        SET quizzes_completed = user_points.quizzes_completed + 1,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quizzes_completed
    AFTER INSERT ON quiz_results
    FOR EACH ROW
    EXECUTE FUNCTION update_quizzes_completed();

-- ============================================================================
-- VÉRIFICATIONS
-- ============================================================================

-- Vérifier que la table existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'quiz_results'
) as quiz_results_exists;

-- Vérifier les colonnes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quiz_results'
ORDER BY ordinal_position;

-- ============================================================================
-- MIGRATION TERMINÉE ✅
-- ============================================================================

-- Pour tester:
-- SELECT get_user_quiz_stats('your-user-id-here');
-- SELECT * FROM get_quiz_leaderboard(1, 10);
-- SELECT * FROM get_user_best_quiz_attempts('your-user-id-here');
