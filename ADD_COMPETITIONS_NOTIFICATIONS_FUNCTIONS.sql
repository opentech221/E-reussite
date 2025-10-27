-- =============================================
-- FONCTIONS NOTIFICATIONS & BADGES (Phase 2)
-- Logique serveur pour notifications push
-- =============================================

-- ====================================
-- 1. RÉCUPÉRER LES NOTIFICATIONS
-- ====================================
CREATE OR REPLACE FUNCTION get_user_notifications(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_unread_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id UUID,
    type VARCHAR,
    title TEXT,
    body TEXT,
    data JSONB,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ,
    competition_title TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cn.id,
        cn.type,
        cn.title,
        cn.body,
        cn.data,
        cn.is_read,
        cn.created_at,
        c.title as competition_title
    FROM competition_notifications cn
    LEFT JOIN competitions c ON c.id = cn.competition_id
    WHERE cn.user_id = p_user_id
      AND (NOT p_unread_only OR cn.is_read = false)
    ORDER BY cn.created_at DESC
    LIMIT p_limit;
END;
$$;

-- ====================================
-- 2. MARQUER NOTIFICATIONS COMME LUES
-- ====================================
CREATE OR REPLACE FUNCTION mark_notifications_read(
    p_user_id UUID,
    p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    IF p_notification_ids IS NULL THEN
        -- Marquer toutes les notifications comme lues
        UPDATE competition_notifications
        SET is_read = true
        WHERE user_id = p_user_id AND is_read = false;
    ELSE
        -- Marquer uniquement les notifications spécifiées
        UPDATE competition_notifications
        SET is_read = true
        WHERE user_id = p_user_id 
          AND id = ANY(p_notification_ids)
          AND is_read = false;
    END IF;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$;

-- ====================================
-- 3. CRÉER NOTIFICATION MANUELLE
-- ====================================
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title TEXT,
    p_body TEXT,
    p_competition_id UUID DEFAULT NULL,
    p_data JSONB DEFAULT NULL,
    p_scheduled_for TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO competition_notifications (
        user_id,
        competition_id,
        type,
        title,
        body,
        data,
        scheduled_for
    ) VALUES (
        p_user_id,
        p_competition_id,
        p_type,
        p_title,
        p_body,
        p_data,
        p_scheduled_for
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- ====================================
-- 4. PLANIFIER RAPPELS COMPÉTITION
-- ====================================
CREATE OR REPLACE FUNCTION schedule_competition_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_competition RECORD;
    v_participant RECORD;
    v_notification_count INTEGER := 0;
BEGIN
    -- Pour chaque compétition qui commence dans 1h
    FOR v_competition IN
        SELECT *
        FROM competitions
        WHERE status IN ('upcoming', 'active')
          AND starts_at BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
    LOOP
        -- Pour chaque participant inscrit
        FOR v_participant IN
            SELECT user_id
            FROM competition_participants
            WHERE competition_id = v_competition.id
              AND status = 'registered'
              -- Éviter les doublons de notifications
              AND user_id NOT IN (
                  SELECT user_id
                  FROM competition_notifications
                  WHERE competition_id = v_competition.id
                    AND type = 'reminder'
                    AND created_at > NOW() - INTERVAL '2 hours'
              )
        LOOP
            INSERT INTO competition_notifications (
                user_id,
                competition_id,
                type,
                title,
                body,
                data
            ) VALUES (
                v_participant.user_id,
                v_competition.id,
                'reminder',
                '🔔 La compétition commence bientôt!',
                '"' || v_competition.title || '" démarre dans moins d''1 heure. Préparez-vous!',
                jsonb_build_object(
                    'competition_id', v_competition.id,
                    'starts_at', v_competition.starts_at
                )
            );
            
            v_notification_count := v_notification_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN v_notification_count;
END;
$$;

-- ====================================
-- 5. ATTRIBUER BADGE AUTOMATIQUEMENT
-- ====================================
CREATE OR REPLACE FUNCTION check_and_award_badges(
    p_user_id UUID,
    p_competition_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_participant RECORD;
    v_badge RECORD;
    v_user_stats RECORD;
    v_awarded_badges JSONB := '[]'::JSONB;
    v_badge_awarded BOOLEAN;
BEGIN
    -- Récupérer les stats du participant
    SELECT * INTO v_participant
    FROM competition_participants
    WHERE user_id = p_user_id AND competition_id = p_competition_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Participant not found');
    END IF;
    
    -- Récupérer les stats globales de l'utilisateur
    SELECT 
        COUNT(*) as total_competitions,
        SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) as total_wins,
        MAX(score) as best_score
    INTO v_user_stats
    FROM competition_participants
    WHERE user_id = p_user_id AND status = 'completed';
    
    -- Parcourir tous les badges disponibles
    FOR v_badge IN
        SELECT * FROM competition_badges
    LOOP
        v_badge_awarded := false;
        
        -- Vérifier si le badge n'a pas déjà été obtenu
        IF NOT EXISTS (
            SELECT 1 FROM user_badges 
            WHERE user_id = p_user_id AND badge_id = v_badge.id
        ) THEN
            -- BADGE: Score Parfait 100%
            IF v_badge.name = 'Score Parfait 100%' THEN
                IF v_participant.correct_answers * 100.0 / NULLIF(v_participant.correct_answers + v_participant.wrong_answers, 0) = 100 THEN
                    v_badge_awarded := true;
                END IF;
            
            -- BADGE: Champion d'Or
            ELSIF v_badge.name = 'Champion d''Or' THEN
                IF v_participant.rank = 1 THEN
                    v_badge_awarded := true;
                END IF;
            
            -- BADGE: Médaille d'Argent
            ELSIF v_badge.name = 'Médaille d''Argent' THEN
                IF v_participant.rank = 2 THEN
                    v_badge_awarded := true;
                END IF;
            
            -- BADGE: Médaille de Bronze
            ELSIF v_badge.name = 'Médaille de Bronze' THEN
                IF v_participant.rank = 3 THEN
                    v_badge_awarded := true;
                END IF;
            
            -- BADGE: Top 10
            ELSIF v_badge.name = 'Top 10' THEN
                IF v_participant.rank <= 10 THEN
                    v_badge_awarded := true;
                END IF;
            
            -- BADGE: Nouveau Challenger
            ELSIF v_badge.name = 'Nouveau Challenger' THEN
                IF v_user_stats.total_competitions = 1 THEN
                    v_badge_awarded := true;
                END IF;
            
            -- BADGE: Habitué
            ELSIF v_badge.name = 'Habitué' THEN
                IF v_user_stats.total_competitions >= 10 THEN
                    v_badge_awarded := true;
                END IF;
            
            -- BADGE: Vétéran
            ELSIF v_badge.name = 'Vétéran' THEN
                IF v_user_stats.total_competitions >= 50 THEN
                    v_badge_awarded := true;
                END IF;
            
            -- BADGE: Vitesse Éclair
            ELSIF v_badge.name = 'Vitesse Éclair' THEN
                IF v_participant.time_taken_seconds < 300 THEN
                    v_badge_awarded := true;
                END IF;
            END IF;
            
            -- Si le badge doit être attribué
            IF v_badge_awarded THEN
                INSERT INTO user_badges (
                    user_id,
                    badge_id,
                    competition_id,
                    metadata
                ) VALUES (
                    p_user_id,
                    v_badge.id,
                    p_competition_id,
                    jsonb_build_object(
                        'score', v_participant.score,
                        'rank', v_participant.rank,
                        'correct_answers', v_participant.correct_answers
                    )
                );
                
                -- Ajouter les points bonus
                IF v_badge.points_reward > 0 THEN
                    INSERT INTO user_points (user_id, total_points)
                    VALUES (p_user_id, v_badge.points_reward)
                    ON CONFLICT (user_id) DO UPDATE
                    SET total_points = user_points.total_points + v_badge.points_reward;
                END IF;
                
                -- Ajouter à la liste des badges attribués
                v_awarded_badges := v_awarded_badges || jsonb_build_object(
                    'badge_id', v_badge.id,
                    'name', v_badge.name,
                    'icon', v_badge.icon,
                    'rarity', v_badge.rarity,
                    'points_reward', v_badge.points_reward
                );
            END IF;
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'badges_awarded', v_awarded_badges,
        'count', jsonb_array_length(v_awarded_badges)
    );
END;
$$;

-- ====================================
-- 6. RÉCUPÉRER LES BADGES D'UN UTILISATEUR
-- ====================================
CREATE OR REPLACE FUNCTION get_user_badges(
    p_user_id UUID
)
RETURNS TABLE (
    badge_id UUID,
    badge_name VARCHAR,
    badge_description TEXT,
    badge_icon TEXT,
    badge_category VARCHAR,
    badge_rarity VARCHAR,
    earned_at TIMESTAMPTZ,
    competition_title TEXT,
    metadata JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ub.badge_id,
        cb.name as badge_name,
        cb.description as badge_description,
        cb.icon as badge_icon,
        cb.category as badge_category,
        cb.rarity as badge_rarity,
        ub.earned_at,
        c.title as competition_title,
        ub.metadata
    FROM user_badges ub
    JOIN competition_badges cb ON cb.id = ub.badge_id
    LEFT JOIN competitions c ON c.id = ub.competition_id
    WHERE ub.user_id = p_user_id
    ORDER BY ub.earned_at DESC;
END;
$$;

-- ====================================
-- 7. COMPTER NOTIFICATIONS NON LUES
-- ====================================
CREATE OR REPLACE FUNCTION get_unread_notifications_count(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM competition_notifications
    WHERE user_id = p_user_id AND is_read = false;
    
    RETURN v_count;
END;
$$;

-- ====================================
-- 8. NOTIFIER NOUVEAU RECORD PERSONNEL
-- ====================================
CREATE OR REPLACE FUNCTION check_personal_record(
    p_user_id UUID,
    p_competition_id UUID,
    p_new_score INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_previous_best INTEGER;
    v_competition RECORD;
BEGIN
    -- Récupérer le meilleur score précédent (excluant la compétition actuelle)
    SELECT MAX(score)
    INTO v_previous_best
    FROM competition_participants
    WHERE user_id = p_user_id 
      AND competition_id != p_competition_id
      AND status = 'completed';
    
    -- Si c'est un nouveau record
    IF v_previous_best IS NULL OR p_new_score > v_previous_best THEN
        SELECT * INTO v_competition
        FROM competitions
        WHERE id = p_competition_id;
        
        -- Créer notification
        PERFORM create_notification(
            p_user_id,
            'personal_record',
            '🎉 Nouveau record personnel!',
            'Félicitations! Vous avez établi un nouveau record avec ' || p_new_score || ' points dans "' || v_competition.title || '"',
            p_competition_id,
            jsonb_build_object(
                'new_score', p_new_score,
                'previous_best', COALESCE(v_previous_best, 0)
            )
        );
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

-- ====================================
-- COMMENTAIRES
-- ====================================

COMMENT ON FUNCTION get_user_notifications IS 'Récupérer les notifications d''un utilisateur';
COMMENT ON FUNCTION mark_notifications_read IS 'Marquer des notifications comme lues';
COMMENT ON FUNCTION create_notification IS 'Créer une notification manuelle';
COMMENT ON FUNCTION schedule_competition_reminders IS 'Planifier les rappels de compétitions (à exécuter via cron)';
COMMENT ON FUNCTION check_and_award_badges IS 'Vérifier et attribuer les badges après une compétition';
COMMENT ON FUNCTION get_user_badges IS 'Récupérer tous les badges d''un utilisateur';
COMMENT ON FUNCTION get_unread_notifications_count IS 'Compter les notifications non lues';
COMMENT ON FUNCTION check_personal_record IS 'Vérifier et notifier un nouveau record personnel';
