-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MIGRATION 016b: Mise à jour de quiz_results (ajout colonnes)
-- Description: Ajouter les colonnes manquantes à la table quiz_results existante
-- Date: 8 octobre 2025
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ÉTAPE 1: Ajouter les colonnes manquantes
-- ============================================================================

-- Ajouter correct_answers (nombre de réponses correctes)
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0;

-- Ajouter total_questions (nombre total de questions)
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0;

-- Ajouter time_taken (temps pris en secondes)
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS time_taken INTEGER DEFAULT 0;

-- Ajouter answers (réponses détaillées en JSONB)
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS answers JSONB;

-- Ajouter points_earned (points gagnés)
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- Ajouter created_at (date de création)
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- ÉTAPE 2: Modifier le type de score (INTEGER → DECIMAL)
-- ============================================================================

-- Convertir score de INTEGER à DECIMAL(5,2)
-- Cela permettra de stocker des scores avec décimales (ex: 85.50%)
ALTER TABLE quiz_results 
ALTER COLUMN score TYPE DECIMAL(5,2);

-- Ajouter la contrainte CHECK sur score
ALTER TABLE quiz_results 
ADD CONSTRAINT check_score_range CHECK (score >= 0 AND score <= 100);

-- ============================================================================
-- ÉTAPE 3: Mettre à jour les données existantes
-- ============================================================================

-- Remplir created_at avec completed_at pour les lignes existantes
UPDATE quiz_results 
SET created_at = completed_at 
WHERE created_at IS NULL;

-- Calculer correct_answers et total_questions si possible
-- (si score = 100 et qu'on a pas plus d'info, on peut estimer)
-- Pour l'instant, on laisse à 0 car on ne peut pas deviner

-- ============================================================================
-- ÉTAPE 4: Créer les index pour optimisation
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at DESC);

-- ============================================================================
-- ÉTAPE 5: Fonctions RPC pour statistiques
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
        COALESCE(SUM(qr.points_earned), 0)::BIGINT as total_points_earned,
        COALESCE(SUM(qr.time_taken), 0)::BIGINT as total_time_spent
    FROM quiz_results qr
    WHERE qr.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
-- ÉTAPE 6: RLS (Row Level Security)
-- ============================================================================

-- S'assurer que RLS est activé
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view their own quiz results" ON quiz_results;
DROP POLICY IF EXISTS "Users can insert their own quiz results" ON quiz_results;

-- Recréer les policies
CREATE POLICY "Users can view their own quiz results"
    ON quiz_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results"
    ON quiz_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ÉTAPE 7: Permissions
-- ============================================================================

GRANT SELECT, INSERT ON quiz_results TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_quiz_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_quiz_leaderboard(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_best_quiz_attempts(UUID) TO authenticated;

-- ============================================================================
-- ÉTAPE 8: Trigger pour mise à jour automatique
-- ============================================================================

CREATE OR REPLACE FUNCTION update_quizzes_completed()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_points
    SET quizzes_completed = quizzes_completed + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
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

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS trigger_update_quizzes_completed ON quiz_results;

-- Recréer le trigger
CREATE TRIGGER trigger_update_quizzes_completed
    AFTER INSERT ON quiz_results
    FOR EACH ROW
    EXECUTE FUNCTION update_quizzes_completed();

-- ============================================================================
-- VÉRIFICATIONS
-- ============================================================================

-- Vérifier les colonnes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_results'
ORDER BY ordinal_position;

-- ============================================================================
-- MIGRATION TERMINÉE ✅
-- ============================================================================

-- La table quiz_results est maintenant complète avec:
-- ✅ 11 colonnes (au lieu de 5)
-- ✅ Type score amélioré (DECIMAL au lieu de INTEGER)
-- ✅ Colonnes détaillées (correct_answers, total_questions, time_taken, answers, points_earned)
-- ✅ Index optimisés
-- ✅ 3 fonctions RPC pour statistiques
-- ✅ RLS configuré
-- ✅ Trigger automatique
