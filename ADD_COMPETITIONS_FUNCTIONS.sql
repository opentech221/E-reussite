-- =============================================
-- POSTGRESQL FUNCTIONS POUR COMPETITIONS MVP
-- Logique métier côté serveur (0€)
-- =============================================

-- ====================================
-- 1. INSCRIPTION À UNE COMPÉTITION
-- ====================================
CREATE OR REPLACE FUNCTION join_competition(
    p_competition_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_competition RECORD;
    v_participant_id UUID;
    v_result JSONB;
BEGIN
    -- Vérifier que la compétition existe et est ouverte
    SELECT * INTO v_competition
    FROM competitions
    WHERE id = p_competition_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Competition not found'
        );
    END IF;
    
    -- Vérifier le statut
    IF v_competition.status NOT IN ('upcoming', 'active') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Competition is not open for registration'
        );
    END IF;
    
    -- Vérifier le nombre max de participants
    IF v_competition.max_participants IS NOT NULL 
       AND v_competition.current_participants >= v_competition.max_participants THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Competition is full'
        );
    END IF;
    
    -- Insérer le participant (ou ignorer si déjà inscrit)
    INSERT INTO competition_participants (competition_id, user_id, status)
    VALUES (p_competition_id, p_user_id, 'registered')
    ON CONFLICT (competition_id, user_id) DO NOTHING
    RETURNING id INTO v_participant_id;
    
    -- Si nouvelle inscription, incrémenter le compteur
    IF v_participant_id IS NOT NULL THEN
        UPDATE competitions
        SET current_participants = current_participants + 1
        WHERE id = p_competition_id;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'participant_id', v_participant_id,
        'message', 'Successfully joined competition'
    );
END;
$$;

-- ====================================
-- 2. SOUMETTRE UNE RÉPONSE
-- ====================================
CREATE OR REPLACE FUNCTION submit_competition_answer(
    p_participant_id UUID,
    p_question_id UUID,
    p_selected_answer INTEGER,
    p_time_taken_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_question RECORD;
    v_is_correct BOOLEAN;
    v_points INTEGER;
    v_participant RECORD;
BEGIN
    -- Récupérer la question avec la bonne réponse
    SELECT cq.*, q.correct_answer, q.points as base_points
    INTO v_question
    FROM competition_questions cq
    JOIN questions q ON q.id = cq.question_id
    WHERE cq.id = p_question_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Question not found');
    END IF;
    
    -- Vérifier si la réponse est correcte
    v_is_correct := (p_selected_answer = v_question.correct_answer);
    
    -- Calculer les points (bonus si rapide)
    IF v_is_correct THEN
        v_points := v_question.points;
        
        -- Bonus de rapidité: +50% si réponse en moins de 10 secondes
        IF p_time_taken_seconds < 10 THEN
            v_points := v_points + (v_points / 2);
        END IF;
    ELSE
        v_points := 0;
    END IF;
    
    -- Insérer la réponse
    INSERT INTO competition_answers (
        participant_id,
        question_id,
        selected_answer,
        is_correct,
        time_taken_seconds,
        points_earned
    )
    VALUES (
        p_participant_id,
        p_question_id,
        p_selected_answer,
        v_is_correct,
        p_time_taken_seconds,
        v_points
    )
    ON CONFLICT (participant_id, question_id) DO UPDATE
    SET 
        selected_answer = EXCLUDED.selected_answer,
        is_correct = EXCLUDED.is_correct,
        time_taken_seconds = EXCLUDED.time_taken_seconds,
        points_earned = EXCLUDED.points_earned,
        answered_at = NOW();
    
    -- Mettre à jour les statistiques du participant
    UPDATE competition_participants
    SET 
        score = score + v_points,
        correct_answers = correct_answers + (CASE WHEN v_is_correct THEN 1 ELSE 0 END),
        wrong_answers = wrong_answers + (CASE WHEN NOT v_is_correct THEN 1 ELSE 0 END),
        time_taken_seconds = time_taken_seconds + p_time_taken_seconds,
        status = 'in_progress',
        started_at = COALESCE(started_at, NOW())
    WHERE id = p_participant_id;
    
    -- Récupérer les stats mises à jour
    SELECT * INTO v_participant
    FROM competition_participants
    WHERE id = p_participant_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'is_correct', v_is_correct,
        'points_earned', v_points,
        'total_score', v_participant.score,
        'correct_answers', v_participant.correct_answers,
        'wrong_answers', v_participant.wrong_answers
    );
END;
$$;

-- ====================================
-- 3. TERMINER UNE COMPÉTITION
-- ====================================
CREATE OR REPLACE FUNCTION complete_competition_participant(
    p_participant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_participant RECORD;
    v_competition RECORD;
    v_rank INTEGER;
BEGIN
    -- Marquer comme terminé
    UPDATE competition_participants
    SET 
        status = 'completed',
        completed_at = NOW()
    WHERE id = p_participant_id
    RETURNING * INTO v_participant;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Participant not found');
    END IF;
    
    -- Récupérer la compétition
    SELECT * INTO v_competition
    FROM competitions
    WHERE id = v_participant.competition_id;
    
    -- Calculer le rang (après avoir terminé)
    PERFORM update_competition_ranks(v_participant.competition_id);
    
    -- Récupérer le rang mis à jour
    SELECT rank INTO v_rank
    FROM competition_participants
    WHERE id = p_participant_id;
    
    -- Attribuer les récompenses
    UPDATE user_progress
    SET 
        total_points = total_points + v_competition.reward_points,
        total_xp = total_xp + v_competition.reward_xp
    WHERE user_id = v_participant.user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'rank', v_rank,
        'score', v_participant.score,
        'reward_points', v_competition.reward_points,
        'reward_xp', v_competition.reward_xp
    );
END;
$$;

-- ====================================
-- 4. CALCULER LES RANGS
-- ====================================
CREATE OR REPLACE FUNCTION update_competition_ranks(
    p_competition_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_participants INTEGER;
BEGIN
    -- Compter le nombre total de participants
    SELECT COUNT(*) INTO v_total_participants
    FROM competition_participants
    WHERE competition_id = p_competition_id
      AND status IN ('in_progress', 'completed');
    
    -- Mettre à jour les rangs basés sur le score puis le temps
    WITH ranked AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                ORDER BY score DESC, time_taken_seconds ASC
            ) as new_rank
        FROM competition_participants
        WHERE competition_id = p_competition_id
          AND status IN ('in_progress', 'completed')
    )
    UPDATE competition_participants cp
    SET 
        rank = ranked.new_rank,
        percentile = ROUND(((v_total_participants - ranked.new_rank + 1.0) / v_total_participants) * 100, 2)
    FROM ranked
    WHERE cp.id = ranked.id;
    
    -- Mettre à jour le leaderboard francophone
    PERFORM update_francophone_leaderboard(p_competition_id);
END;
$$;

-- ====================================
-- 5. LEADERBOARD FRANCOPHONE
-- ====================================
CREATE OR REPLACE FUNCTION update_francophone_leaderboard(
    p_competition_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Supprimer les anciennes entrées
    DELETE FROM competition_leaderboards
    WHERE competition_id = p_competition_id;
    
    -- Créer les nouveaux classements
    WITH participant_data AS (
        SELECT 
            cp.competition_id,
            cp.user_id,
            cp.score,
            COALESCE(p.location, 'Non renseigné') as location,
            -- Extraire pays et région (simplification)
            CASE 
                WHEN p.location ILIKE '%Sénégal%' OR p.location ILIKE '%Senegal%' THEN 'Sénégal'
                WHEN p.location ILIKE '%France%' THEN 'France'
                WHEN p.location ILIKE '%Côte d''Ivoire%' THEN 'Côte d''Ivoire'
                ELSE 'Autre'
            END as country,
            SPLIT_PART(p.location, ',', 1) as region
        FROM competition_participants cp
        LEFT JOIN profiles p ON p.id = cp.user_id
        WHERE cp.competition_id = p_competition_id
          AND cp.status = 'completed'
    ),
    global_ranks AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (ORDER BY score DESC) as global_rank
        FROM participant_data
    ),
    regional_ranks AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (PARTITION BY region ORDER BY score DESC) as regional_rank
        FROM participant_data
    ),
    national_ranks AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (PARTITION BY country ORDER BY score DESC) as national_rank
        FROM participant_data
    )
    INSERT INTO competition_leaderboards (
        competition_id,
        user_id,
        global_rank,
        regional_rank,
        national_rank,
        region,
        country,
        score
    )
    SELECT 
        gr.competition_id,
        gr.user_id,
        gr.global_rank,
        rr.regional_rank,
        nr.national_rank,
        gr.region,
        gr.country,
        gr.score
    FROM global_ranks gr
    LEFT JOIN regional_ranks rr ON rr.user_id = gr.user_id
    LEFT JOIN national_ranks nr ON nr.user_id = gr.user_id;
END;
$$;

-- ====================================
-- 6. RÉCUPÉRER LE LEADERBOARD
-- ====================================
CREATE OR REPLACE FUNCTION get_competition_leaderboard(
    p_competition_id UUID,
    p_scope VARCHAR DEFAULT 'global', -- 'global', 'regional', 'national'
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    rank INTEGER,
    score INTEGER,
    correct_answers INTEGER,
    time_taken_seconds INTEGER,
    location TEXT,
    is_current_user BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    IF p_scope = 'global' THEN
        RETURN QUERY
        SELECT 
            cp.user_id,
            p.full_name,
            p.avatar_url,
            cp.rank,
            cp.score,
            cp.correct_answers,
            cp.time_taken_seconds,
            p.location,
            cp.user_id = auth.uid() as is_current_user
        FROM competition_participants cp
        JOIN profiles p ON p.id = cp.user_id
        WHERE cp.competition_id = p_competition_id
          AND cp.status IN ('in_progress', 'completed')
        ORDER BY cp.rank ASC
        LIMIT p_limit;
    ELSIF p_scope = 'regional' THEN
        RETURN QUERY
        SELECT 
            cl.user_id,
            p.full_name,
            p.avatar_url,
            cl.regional_rank as rank,
            cl.score,
            cp.correct_answers,
            cp.time_taken_seconds,
            p.location,
            cl.user_id = auth.uid() as is_current_user
        FROM competition_leaderboards cl
        JOIN profiles p ON p.id = cl.user_id
        JOIN competition_participants cp ON cp.user_id = cl.user_id AND cp.competition_id = cl.competition_id
        WHERE cl.competition_id = p_competition_id
          AND cl.region = (
              SELECT region FROM competition_leaderboards
              WHERE competition_id = p_competition_id AND user_id = auth.uid()
          )
        ORDER BY cl.regional_rank ASC
        LIMIT p_limit;
    ELSIF p_scope = 'national' THEN
        RETURN QUERY
        SELECT 
            cl.user_id,
            p.full_name,
            p.avatar_url,
            cl.national_rank as rank,
            cl.score,
            cp.correct_answers,
            cp.time_taken_seconds,
            p.location,
            cl.user_id = auth.uid() as is_current_user
        FROM competition_leaderboards cl
        JOIN profiles p ON p.id = cl.user_id
        JOIN competition_participants cp ON cp.user_id = cl.user_id AND cp.competition_id = cl.competition_id
        WHERE cl.competition_id = p_competition_id
          AND cl.country = (
              SELECT country FROM competition_leaderboards
              WHERE competition_id = p_competition_id AND user_id = auth.uid()
          )
        ORDER BY cl.national_rank ASC
        LIMIT p_limit;
    END IF;
END;
$$;

-- Commentaires
COMMENT ON FUNCTION join_competition IS 'Inscription d''un utilisateur à une compétition';
COMMENT ON FUNCTION submit_competition_answer IS 'Soumettre une réponse avec calcul automatique du score';
COMMENT ON FUNCTION complete_competition_participant IS 'Terminer une compétition et attribuer les récompenses';
COMMENT ON FUNCTION update_competition_ranks IS 'Recalculer les rangs de tous les participants';
COMMENT ON FUNCTION update_francophone_leaderboard IS 'Mettre à jour les classements régionaux/nationaux';
COMMENT ON FUNCTION get_competition_leaderboard IS 'Récupérer le leaderboard avec filtres (global/regional/national)';
