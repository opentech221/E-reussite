-- =============================================
-- SCHEMA NOTIFICATIONS PUSH & BADGES (Phase 2)
-- Coût: 0€ (utilise la BDD existante)
-- =============================================

-- ====================================
-- TABLE 1: ABONNEMENTS PUSH
-- ====================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- Index pour recherche rapide par utilisateur
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;

-- ====================================
-- TABLE 2: NOTIFICATIONS COMPÉTITIONS
-- ====================================
CREATE TABLE IF NOT EXISTS competition_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'reminder', 'leaderboard_update', 'new_competition', 'personal_record', 'badge_earned'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB, -- Données supplémentaires (badge, score, rank, etc.)
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ, -- Pour les rappels planifiés
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour notifications non lues
CREATE INDEX IF NOT EXISTS idx_competition_notifications_user_unread ON competition_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_competition_notifications_scheduled ON competition_notifications(scheduled_for) WHERE is_sent = false AND scheduled_for IS NOT NULL;

-- ====================================
-- TABLE 3: BADGES DISPONIBLES
-- ====================================
CREATE TABLE IF NOT EXISTS competition_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT, -- Emoji ou URL d'icône
    category VARCHAR(50) NOT NULL, -- 'performance', 'participation', 'ranking', 'streak'
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    criteria JSONB NOT NULL, -- Conditions d'obtention
    points_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- TABLE 4: BADGES UTILISATEURS
-- ====================================
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES competition_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL, -- Compétition où le badge a été gagné
    metadata JSONB, -- Contexte: score, rank, etc.
    UNIQUE(user_id, badge_id) -- Un badge ne peut être gagné qu'une fois
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ====================================
-- RLS POLICIES
-- ====================================

-- Push Subscriptions: Un utilisateur ne peut gérer que ses propres abonnements
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push subscriptions"
    ON push_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
    ON push_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
    ON push_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
    ON push_subscriptions FOR DELETE
    USING (auth.uid() = user_id);

-- Competition Notifications: Un utilisateur ne peut voir que ses propres notifications
ALTER TABLE competition_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON competition_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON competition_notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Badges: Lecture publique, écriture réservée
ALTER TABLE competition_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
    ON competition_badges FOR SELECT
    TO authenticated
    USING (true);

-- User Badges: Lecture publique (pour voir les badges des autres), mais seul le système peut attribuer
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user badges"
    ON user_badges FOR SELECT
    TO authenticated
    USING (true);

-- ====================================
-- TRIGGERS AUTOMATIQUES
-- ====================================

-- Trigger 1: Créer notification quand un utilisateur s'inscrit à une compétition
CREATE OR REPLACE FUNCTION notify_competition_registration()
RETURNS TRIGGER AS $$
DECLARE
    v_competition RECORD;
BEGIN
    -- Récupérer les infos de la compétition
    SELECT * INTO v_competition
    FROM competitions
    WHERE id = NEW.competition_id;
    
    -- Créer notification de rappel (1h avant le début)
    INSERT INTO competition_notifications (
        user_id,
        competition_id,
        type,
        title,
        body,
        scheduled_for,
        data
    ) VALUES (
        NEW.user_id,
        NEW.competition_id,
        'reminder',
        '🔔 Rappel: Compétition dans 1h',
        'La compétition "' || v_competition.title || '" commence dans 1 heure. Préparez-vous!',
        v_competition.start_date - INTERVAL '1 hour',
        jsonb_build_object(
            'competition_id', v_competition.id,
            'competition_title', v_competition.title
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_competition_registration
    AFTER INSERT ON competition_participants
    FOR EACH ROW
    WHEN (NEW.status = 'registered')
    EXECUTE FUNCTION notify_competition_registration();

-- Trigger 2: Notification quand le leaderboard est mis à jour
CREATE OR REPLACE FUNCTION notify_leaderboard_update()
RETURNS TRIGGER AS $$
DECLARE
    v_competition RECORD;
    v_user_rank INTEGER;
BEGIN
    -- Si c'est le top 3, notifier
    IF NEW.global_rank <= 3 THEN
        SELECT * INTO v_competition
        FROM competitions
        WHERE id = NEW.competition_id;
        
        INSERT INTO competition_notifications (
            user_id,
            competition_id,
            type,
            title,
            body,
            data
        ) VALUES (
            NEW.user_id,
            NEW.competition_id,
            'leaderboard_update',
            '🏆 Vous êtes dans le Top ' || NEW.global_rank || '!',
            'Félicitations! Vous êtes classé #' || NEW.global_rank || ' dans "' || v_competition.title || '"',
            jsonb_build_object(
                'rank', NEW.global_rank,
                'score', NEW.score,
                'competition_id', NEW.competition_id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leaderboard_update
    AFTER INSERT OR UPDATE ON competition_leaderboards
    FOR EACH ROW
    EXECUTE FUNCTION notify_leaderboard_update();

-- Trigger 3: Notification quand un badge est attribué
CREATE OR REPLACE FUNCTION notify_badge_earned()
RETURNS TRIGGER AS $$
DECLARE
    v_badge RECORD;
BEGIN
    SELECT * INTO v_badge
    FROM competition_badges
    WHERE id = NEW.badge_id;
    
    INSERT INTO competition_notifications (
        user_id,
        competition_id,
        type,
        title,
        body,
        data
    ) VALUES (
        NEW.user_id,
        NEW.competition_id,
        'badge_earned',
        '🏅 Nouveau badge débloqué!',
        'Vous avez obtenu le badge "' || v_badge.name || '": ' || v_badge.description,
        jsonb_build_object(
            'badge_id', v_badge.id,
            'badge_name', v_badge.name,
            'badge_icon', v_badge.icon,
            'badge_rarity', v_badge.rarity,
            'points_reward', v_badge.points_reward
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_badge_earned
    AFTER INSERT ON user_badges
    FOR EACH ROW
    EXECUTE FUNCTION notify_badge_earned();

-- ====================================
-- SEED: BADGES PAR DÉFAUT
-- ====================================

INSERT INTO competition_badges (name, description, icon, category, rarity, criteria, points_reward) VALUES
-- Badges de Performance
('Score Parfait 100%', 'Obtenir 100% de bonnes réponses dans une compétition', '🎯', 'performance', 'epic', '{"min_score_percent": 100}', 1000),
('Vitesse Éclair', 'Terminer une compétition en moins de 5 minutes', '⚡', 'performance', 'rare', '{"max_time_seconds": 300}', 500),
('Maître Stratège', 'Obtenir un score dans le top 1% avec un temps moyen par question supérieur à 20s', '🧠', 'performance', 'legendary', '{"top_percentile": 1, "min_avg_time_per_question": 20}', 2000),

-- Badges de Classement
('Champion d''Or', 'Terminer 1er d''une compétition', '🥇', 'ranking', 'epic', '{"rank": 1}', 1000),
('Médaille d''Argent', 'Terminer 2ème d''une compétition', '🥈', 'ranking', 'rare', '{"rank": 2}', 500),
('Médaille de Bronze', 'Terminer 3ème d''une compétition', '🥉', 'ranking', 'rare', '{"rank": 3}', 300),
('Top 10', 'Finir dans le top 10 d''une compétition', '🔝', 'ranking', 'common', '{"max_rank": 10}', 100),

-- Badges de Participation
('Nouveau Challenger', 'Participer à votre première compétition', '🆕', 'participation', 'common', '{"competitions_count": 1}', 50),
('Habitué', 'Participer à 10 compétitions', '🎓', 'participation', 'rare', '{"competitions_count": 10}', 500),
('Vétéran', 'Participer à 50 compétitions', '👑', 'participation', 'epic', '{"competitions_count": 50}', 2000),

-- Badges de Série
('Série de Victoires x3', 'Gagner 3 compétitions consécutives', '🔥', 'streak', 'epic', '{"consecutive_wins": 3}', 1500),
('Série de Victoires x5', 'Gagner 5 compétitions consécutives', '💥', 'streak', 'legendary', '{"consecutive_wins": 5}', 5000),
('Invincible', 'Gagner 10 compétitions consécutives', '⭐', 'streak', 'legendary', '{"consecutive_wins": 10}', 10000),

-- Badges Spéciaux
('Mathématicien Expert', 'Obtenir 100% dans une compétition de mathématiques', '📐', 'performance', 'rare', '{"subject": "mathématiques", "score_percent": 100}', 750),
('Linguiste Parfait', 'Obtenir 100% dans une compétition de français', '📖', 'performance', 'rare', '{"subject": "français", "score_percent": 100}', 750),
('Record Personnel', 'Battre votre meilleur score', '📈', 'performance', 'common', '{"personal_best": true}', 200)

ON CONFLICT (name) DO NOTHING;

-- ====================================
-- COMMENTAIRES
-- ====================================

COMMENT ON TABLE push_subscriptions IS 'Abonnements push Web API des utilisateurs';
COMMENT ON TABLE competition_notifications IS 'Notifications liées aux compétitions';
COMMENT ON TABLE competition_badges IS 'Définition des badges disponibles';
COMMENT ON TABLE user_badges IS 'Badges obtenus par les utilisateurs';

COMMENT ON COLUMN competition_notifications.type IS 'Types: reminder, leaderboard_update, new_competition, personal_record, badge_earned';
COMMENT ON COLUMN competition_badges.rarity IS 'Rareté: common, rare, epic, legendary';
COMMENT ON COLUMN competition_badges.criteria IS 'Conditions JSON pour obtenir le badge';
