-- ========================================
-- SCHEMA: Quiz Interactif dans le Chat Coach IA
-- ========================================
-- Date: 14 octobre 2025
-- Description: Permettre au Coach IA de poser des questions directement dans le chat
-- URL: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/editor

-- ========================================
-- TABLE: interactive_quiz_sessions
-- ========================================
-- Sauvegarde les sessions de quiz interactifs lancés depuis le chat

CREATE TABLE IF NOT EXISTS interactive_quiz_sessions (
    -- Identifiants
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
    
    -- Informations du quiz
    subject_id INTEGER REFERENCES matieres(id) ON DELETE SET NULL,
    chapter_id INTEGER REFERENCES chapitres(id) ON DELETE SET NULL,
    quiz_type VARCHAR(50) DEFAULT 'interactive', -- 'interactive', 'ai_generated', 'custom'
    difficulty_level VARCHAR(20) DEFAULT 'intermediaire', -- 'facile', 'intermediaire', 'difficile'
    
    -- Configuration
    total_questions INTEGER NOT NULL DEFAULT 10,
    time_limit_seconds INTEGER DEFAULT 600, -- 10 minutes par défaut
    
    -- État de la session
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    current_question_index INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Résultats
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    skipped_answers INTEGER DEFAULT 0,
    score_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_elapsed_seconds INTEGER DEFAULT 0,
    
    -- Récompenses
    points_earned INTEGER DEFAULT 0,
    badge_unlocked VARCHAR(100),
    badge_unlocked_at TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: interactive_quiz_questions
-- ========================================
-- Sauvegarde chaque question posée dans une session

CREATE TABLE IF NOT EXISTS interactive_quiz_questions (
    -- Identifiants
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interactive_quiz_sessions(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL, -- 1, 2, 3...
    
    -- Contenu de la question
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'qcm', -- 'qcm', 'vrai_faux', 'texte_libre'
    
    -- Options (pour QCM et Vrai/Faux)
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1), -- 'A', 'B', 'C', 'D'
    
    -- Réponse utilisateur
    user_answer TEXT,
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE,
    time_to_answer_seconds INTEGER,
    
    -- Explications
    explanation TEXT, -- Explication de la bonne réponse
    hint_shown BOOLEAN DEFAULT FALSE,
    hint_text TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEX pour performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id 
ON interactive_quiz_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status 
ON interactive_quiz_sessions(status);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_at 
ON interactive_quiz_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_session_id 
ON interactive_quiz_questions(session_id);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_number 
ON interactive_quiz_questions(session_id, question_number);

-- ========================================
-- RLS (Row Level Security) Policies
-- ========================================

ALTER TABLE interactive_quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactive_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Utilisateurs voient seulement LEURS sessions
CREATE POLICY "Users can view own quiz sessions"
ON interactive_quiz_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Utilisateurs peuvent créer LEURS sessions
CREATE POLICY "Users can create own quiz sessions"
ON interactive_quiz_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Utilisateurs peuvent mettre à jour LEURS sessions
CREATE POLICY "Users can update own quiz sessions"
ON interactive_quiz_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Utilisateurs voient seulement LEURS questions
CREATE POLICY "Users can view own quiz questions"
ON interactive_quiz_questions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM interactive_quiz_sessions
        WHERE id = interactive_quiz_questions.session_id
        AND user_id = auth.uid()
    )
);

-- Policy: Utilisateurs peuvent créer questions dans LEURS sessions
CREATE POLICY "Users can create questions in own sessions"
ON interactive_quiz_questions
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM interactive_quiz_sessions
        WHERE id = interactive_quiz_questions.session_id
        AND user_id = auth.uid()
    )
);

-- Policy: Utilisateurs peuvent mettre à jour LEURS questions
CREATE POLICY "Users can update own quiz questions"
ON interactive_quiz_questions
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM interactive_quiz_sessions
        WHERE id = interactive_quiz_questions.session_id
        AND user_id = auth.uid()
    )
);

-- ========================================
-- FONCTION: Démarrer une nouvelle session quiz
-- ========================================

CREATE OR REPLACE FUNCTION start_interactive_quiz(
    p_user_id UUID,
    p_subject_id INTEGER DEFAULT NULL,
    p_chapter_id INTEGER DEFAULT NULL,
    p_conversation_id UUID DEFAULT NULL,
    p_total_questions INTEGER DEFAULT 10,
    p_difficulty_level VARCHAR DEFAULT 'intermediaire'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_id UUID;
    v_result JSONB;
BEGIN
    -- Créer la nouvelle session
    INSERT INTO interactive_quiz_sessions (
        user_id,
        subject_id,
        chapter_id,
        conversation_id,
        total_questions,
        difficulty_level,
        status
    )
    VALUES (
        p_user_id,
        p_subject_id,
        p_chapter_id,
        p_conversation_id,
        p_total_questions,
        p_difficulty_level,
        'in_progress'
    )
    RETURNING id INTO v_session_id;
    
    -- Retourner le résultat
    v_result := jsonb_build_object(
        'success', true,
        'session_id', v_session_id,
        'total_questions', p_total_questions,
        'difficulty_level', p_difficulty_level,
        'message', 'Session de quiz interactif démarrée !'
    );
    
    RETURN v_result;
END;
$$;

-- ========================================
-- FONCTION: Enregistrer une réponse utilisateur
-- ========================================

CREATE OR REPLACE FUNCTION submit_quiz_answer(
    p_session_id UUID,
    p_question_number INTEGER,
    p_question_text TEXT,
    p_user_answer TEXT,
    p_correct_option CHAR DEFAULT NULL,
    p_explanation TEXT DEFAULT NULL,
    p_time_to_answer_seconds INTEGER DEFAULT 0,
    p_option_a TEXT DEFAULT NULL,
    p_option_b TEXT DEFAULT NULL,
    p_option_c TEXT DEFAULT NULL,
    p_option_d TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_question_id UUID;
    v_is_correct BOOLEAN;
    v_result JSONB;
BEGIN
    -- Déterminer si la réponse est correcte
    v_is_correct := (UPPER(p_user_answer) = UPPER(p_correct_option));
    
    -- Insérer la question et la réponse
    INSERT INTO interactive_quiz_questions (
        session_id,
        question_number,
        question_text,
        question_type,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        user_answer,
        is_correct,
        answered_at,
        time_to_answer_seconds,
        explanation
    )
    VALUES (
        p_session_id,
        p_question_number,
        p_question_text,
        CASE 
            WHEN p_option_a IS NOT NULL THEN 'qcm'
            ELSE 'texte_libre'
        END,
        p_option_a,
        p_option_b,
        p_option_c,
        p_option_d,
        p_correct_option,
        p_user_answer,
        v_is_correct,
        NOW(),
        p_time_to_answer_seconds,
        p_explanation
    )
    RETURNING id INTO v_question_id;
    
    -- Mettre à jour les statistiques de la session
    UPDATE interactive_quiz_sessions
    SET 
        current_question_index = p_question_number,
        correct_answers = correct_answers + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
        wrong_answers = wrong_answers + CASE WHEN NOT v_is_correct THEN 1 ELSE 0 END,
        time_elapsed_seconds = time_elapsed_seconds + p_time_to_answer_seconds,
        updated_at = NOW()
    WHERE id = p_session_id;
    
    -- Retourner le résultat
    v_result := jsonb_build_object(
        'success', true,
        'question_id', v_question_id,
        'is_correct', v_is_correct,
        'explanation', p_explanation,
        'correct_option', p_correct_option
    );
    
    RETURN v_result;
END;
$$;

-- ========================================
-- FONCTION: Terminer une session quiz
-- ========================================

CREATE OR REPLACE FUNCTION complete_interactive_quiz(
    p_session_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_correct_answers INTEGER;
    v_total_questions INTEGER;
    v_score_percentage DECIMAL(5,2);
    v_points_earned INTEGER;
    v_badge_unlocked VARCHAR(100);
    v_user_id UUID;
    v_result JSONB;
BEGIN
    -- Récupérer les statistiques de la session
    SELECT 
        correct_answers,
        total_questions,
        user_id
    INTO 
        v_correct_answers,
        v_total_questions,
        v_user_id
    FROM interactive_quiz_sessions
    WHERE id = p_session_id;
    
    -- Calculer le score en pourcentage
    v_score_percentage := (v_correct_answers::DECIMAL / v_total_questions::DECIMAL) * 100;
    
    -- Calculer les points gagnés (10 points par bonne réponse)
    v_points_earned := v_correct_answers * 10;
    
    -- Déterminer le badge débloqué
    v_badge_unlocked := CASE
        WHEN v_score_percentage = 100 THEN 'Quiz Parfait 🏆'
        WHEN v_score_percentage >= 90 THEN 'Excellent 🥇'
        WHEN v_score_percentage >= 80 THEN 'Très Bien 🥈'
        WHEN v_score_percentage >= 70 THEN 'Bien 🥉'
        WHEN v_score_percentage >= 60 THEN 'Passable ✅'
        ELSE NULL
    END;
    
    -- Mettre à jour la session
    UPDATE interactive_quiz_sessions
    SET 
        status = 'completed',
        completed_at = NOW(),
        score_percentage = v_score_percentage,
        points_earned = v_points_earned,
        badge_unlocked = v_badge_unlocked,
        badge_unlocked_at = CASE WHEN v_badge_unlocked IS NOT NULL THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = p_session_id;
    
    -- Ajouter les points au profil utilisateur (si table user_points existe)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points') THEN
        UPDATE user_points
        SET 
            points = points + v_points_earned,
            updated_at = NOW()
        WHERE user_id = v_user_id;
    END IF;
    
    -- Retourner le résultat
    v_result := jsonb_build_object(
        'success', true,
        'session_id', p_session_id,
        'score_percentage', v_score_percentage,
        'correct_answers', v_correct_answers,
        'total_questions', v_total_questions,
        'points_earned', v_points_earned,
        'badge_unlocked', v_badge_unlocked,
        'message', CASE
            WHEN v_score_percentage >= 80 THEN 'Félicitations ! 🎉'
            WHEN v_score_percentage >= 60 THEN 'Bon travail ! 👍'
            ELSE 'Continue tes efforts ! 💪'
        END
    );
    
    RETURN v_result;
END;
$$;

-- ========================================
-- TRIGGER: Mettre à jour updated_at automatiquement
-- ========================================

CREATE OR REPLACE FUNCTION update_interactive_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quiz_sessions_updated_at
BEFORE UPDATE ON interactive_quiz_sessions
FOR EACH ROW
EXECUTE FUNCTION update_interactive_quiz_updated_at();

-- ========================================
-- TESTS DE VÉRIFICATION
-- ========================================

-- Test 1: Démarrer une session
SELECT start_interactive_quiz(
    'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID,
    NULL, -- subject_id
    NULL, -- chapter_id
    NULL, -- conversation_id
    5,    -- 5 questions
    'intermediaire'
);

-- Test 2: Voir les sessions (remplacer UUID par le vrai)
-- SELECT * FROM interactive_quiz_sessions 
-- WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID
-- ORDER BY created_at DESC;

-- ========================================
-- ✅ RÉSULTAT ATTENDU
-- ========================================
-- Tables créées: interactive_quiz_sessions, interactive_quiz_questions
-- Fonctions créées: start_interactive_quiz, submit_quiz_answer, complete_interactive_quiz
-- RLS activé pour protection données
-- Index créés pour performance
-- ========================================

-- ========================================
-- 📊 NETTOYAGE (optionnel)
-- ========================================

-- Supprimer les tables (attention: supprime toutes les données)
-- DROP TABLE IF EXISTS interactive_quiz_questions CASCADE;
-- DROP TABLE IF EXISTS interactive_quiz_sessions CASCADE;
-- DROP FUNCTION IF EXISTS start_interactive_quiz CASCADE;
-- DROP FUNCTION IF EXISTS submit_quiz_answer CASCADE;
-- DROP FUNCTION IF EXISTS complete_interactive_quiz CASCADE;
