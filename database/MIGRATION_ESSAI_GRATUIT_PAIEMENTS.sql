-- ⚡ MIGRATION 014 - SYSTÈME D'ESSAI GRATUIT ET PAIEMENTS
-- Date: 13 octobre 2025
-- Description: Implémentation de l'essai gratuit 7 jours + paiements mobile money
-- URL: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/editor

-- ========================================
-- ÉTAPE 1: Créer la table des abonnements
-- ========================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Statut de l'abonnement
    status VARCHAR(20) NOT NULL CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
    
    -- Dates importantes
    trial_start_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ, -- NULL = à vie
    
    -- Informations de paiement
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50), -- 'orange_money', 'wave', 'free_money', 'mtn_money'
    payment_amount DECIMAL(10, 2) DEFAULT 1000.00,
    payment_date TIMESTAMPTZ,
    transaction_id VARCHAR(255),
    
    -- Notifications
    notification_j3_sent BOOLEAN DEFAULT FALSE,
    notification_j1_sent BOOLEAN DEFAULT FALSE,
    notification_j0_sent BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(user_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_trial_end ON user_subscriptions(trial_end_date);

-- ========================================
-- ÉTAPE 2: Créer la table des transactions
-- ========================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    
    -- Détails du paiement
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF', -- Franc CFA
    payment_method VARCHAR(50) NOT NULL,
    
    -- Statut de la transaction
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Informations du fournisseur
    provider_transaction_id VARCHAR(255),
    provider_name VARCHAR(50), -- 'orange_money', 'wave', etc.
    provider_reference VARCHAR(255),
    
    -- Informations client
    phone_number VARCHAR(20),
    
    -- Métadonnées
    metadata JSONB, -- Données supplémentaires du provider
    error_message TEXT,
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Index
    CONSTRAINT unique_provider_transaction UNIQUE(provider_transaction_id, provider_name)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- ========================================
-- ÉTAPE 3: Fonction pour démarrer l'essai gratuit
-- ========================================

CREATE OR REPLACE FUNCTION start_free_trial(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trial_end_date TIMESTAMPTZ;
    v_result JSONB;
BEGIN
    -- Calculer la date de fin de l'essai (7 jours)
    v_trial_end_date := NOW() + INTERVAL '7 days';
    
    -- Insérer ou mettre à jour l'abonnement
    INSERT INTO user_subscriptions (
        user_id,
        status,
        trial_start_date,
        trial_end_date
    )
    VALUES (
        p_user_id,
        'trial',
        NOW(),
        v_trial_end_date
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        status = 'trial',
        trial_start_date = NOW(),
        trial_end_date = v_trial_end_date,
        updated_at = NOW();
    
    -- Retourner les informations
    v_result := jsonb_build_object(
        'success', true,
        'status', 'trial',
        'trial_start_date', NOW(),
        'trial_end_date', v_trial_end_date,
        'days_remaining', 7
    );
    
    RETURN v_result;
END;
$$;

-- ========================================
-- ÉTAPE 4: Fonction pour obtenir le statut d'abonnement
-- ========================================

CREATE OR REPLACE FUNCTION get_subscription_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription RECORD;
    v_days_remaining INTEGER;
    v_result JSONB;
BEGIN
    -- Récupérer l'abonnement
    SELECT * INTO v_subscription
    FROM user_subscriptions
    WHERE user_id = p_user_id;
    
    -- Si pas d'abonnement, retourner null
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'has_subscription', false,
            'status', 'none',
            'message', 'Aucun abonnement trouvé'
        );
    END IF;
    
    -- Calculer les jours restants pour l'essai
    IF v_subscription.status = 'trial' AND v_subscription.trial_end_date IS NOT NULL THEN
        v_days_remaining := EXTRACT(DAY FROM (v_subscription.trial_end_date - NOW()));
        
        -- Si l'essai est expiré, mettre à jour le statut
        IF v_days_remaining < 0 THEN
            UPDATE user_subscriptions
            SET status = 'expired', updated_at = NOW()
            WHERE user_id = p_user_id;
            
            v_subscription.status := 'expired';
            v_days_remaining := 0;
        END IF;
    ELSE
        v_days_remaining := NULL;
    END IF;
    
    -- Construire le résultat
    v_result := jsonb_build_object(
        'has_subscription', true,
        'status', v_subscription.status,
        'trial_start_date', v_subscription.trial_start_date,
        'trial_end_date', v_subscription.trial_end_date,
        'days_remaining', v_days_remaining,
        'subscription_start_date', v_subscription.subscription_start_date,
        'payment_status', v_subscription.payment_status,
        'payment_method', v_subscription.payment_method,
        'is_active', v_subscription.status IN ('trial', 'active')
    );
    
    RETURN v_result;
END;
$$;

-- ========================================
-- ÉTAPE 5: Fonction pour compléter un paiement
-- ========================================

CREATE OR REPLACE FUNCTION complete_payment(
    p_user_id UUID,
    p_transaction_id VARCHAR,
    p_payment_method VARCHAR,
    p_phone_number VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription_id UUID;
    v_transaction_id UUID;
    v_result JSONB;
BEGIN
    -- Créer ou récupérer l'ID de l'abonnement
    INSERT INTO user_subscriptions (user_id, status)
    VALUES (p_user_id, 'trial')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_subscription_id;
    
    IF v_subscription_id IS NULL THEN
        SELECT id INTO v_subscription_id
        FROM user_subscriptions
        WHERE user_id = p_user_id;
    END IF;
    
    -- Vérifier si la transaction existe déjà
    SELECT id INTO v_transaction_id
    FROM payment_transactions
    WHERE provider_transaction_id = p_transaction_id 
    AND provider_name = p_payment_method;
    
    -- Si la transaction n'existe pas, la créer
    IF v_transaction_id IS NULL THEN
        INSERT INTO payment_transactions (
            user_id,
            subscription_id,
            amount,
            payment_method,
            status,
            provider_transaction_id,
            provider_name,
            phone_number,
            completed_at
        )
        VALUES (
            p_user_id,
            v_subscription_id,
            1000.00,
            p_payment_method,
            'completed',
            p_transaction_id,
            p_payment_method,
            p_phone_number,
            NOW()
        )
        RETURNING id INTO v_transaction_id;
    END IF;
    
    -- Mettre à jour l'abonnement
    UPDATE user_subscriptions
    SET 
        status = 'active',
        subscription_start_date = NOW(),
        subscription_end_date = NULL, -- Accès à vie
        payment_status = 'completed',
        payment_method = p_payment_method,
        payment_amount = 1000.00,
        payment_date = NOW(),
        transaction_id = p_transaction_id,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Retourner le résultat
    v_result := jsonb_build_object(
        'success', true,
        'status', 'active',
        'transaction_id', v_transaction_id,
        'message', 'Paiement complété avec succès. Accès illimité activé !'
    );
    
    RETURN v_result;
END;
$$;

-- ========================================
-- ÉTAPE 6: Fonction pour vérifier l'accès
-- ========================================

CREATE OR REPLACE FUNCTION check_user_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status VARCHAR;
    v_trial_end_date TIMESTAMPTZ;
BEGIN
    -- Récupérer le statut
    SELECT status, trial_end_date INTO v_status, v_trial_end_date
    FROM user_subscriptions
    WHERE user_id = p_user_id;
    
    -- Si pas d'abonnement, retourner false
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Vérifier le statut
    IF v_status = 'active' THEN
        RETURN true;
    ELSIF v_status = 'trial' AND v_trial_end_date > NOW() THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;

-- ========================================
-- ÉTAPE 7: Fonction pour obtenir les utilisateurs à notifier
-- ========================================

CREATE OR REPLACE FUNCTION get_users_to_notify(p_days_before INTEGER)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    days_remaining INTEGER,
    trial_end_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.user_id,
        u.email::TEXT,
        EXTRACT(DAY FROM (us.trial_end_date - NOW()))::INTEGER as days_remaining,
        us.trial_end_date
    FROM user_subscriptions us
    INNER JOIN auth.users u ON u.id = us.user_id
    WHERE 
        us.status = 'trial'
        AND us.trial_end_date IS NOT NULL
        AND us.trial_end_date BETWEEN NOW() AND (NOW() + (p_days_before || ' days')::INTERVAL)
        AND (
            (p_days_before = 3 AND us.notification_j3_sent = FALSE) OR
            (p_days_before = 1 AND us.notification_j1_sent = FALSE) OR
            (p_days_before = 0 AND us.notification_j0_sent = FALSE)
        );
END;
$$;

-- ========================================
-- ÉTAPE 8: Fonction pour marquer une notification comme envoyée
-- ========================================

CREATE OR REPLACE FUNCTION mark_notification_sent(
    p_user_id UUID,
    p_days_before INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_days_before = 3 THEN
        UPDATE user_subscriptions
        SET notification_j3_sent = TRUE, updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSIF p_days_before = 1 THEN
        UPDATE user_subscriptions
        SET notification_j1_sent = TRUE, updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSIF p_days_before = 0 THEN
        UPDATE user_subscriptions
        SET notification_j0_sent = TRUE, updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;
END;
$$;

-- ========================================
-- ÉTAPE 9: Trigger pour mettre à jour updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ÉTAPE 10: Politiques RLS (Row Level Security)
-- ========================================

-- Activer RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leur propre abonnement
CREATE POLICY "Users can view own subscription"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent insérer leur propre abonnement
CREATE POLICY "Users can insert own subscription"
    ON user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leur propre abonnement
CREATE POLICY "Users can update own subscription"
    ON user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent voir leurs propres transactions
CREATE POLICY "Users can view own transactions"
    ON payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent insérer leurs propres transactions
CREATE POLICY "Users can insert own transactions"
    ON payment_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 11: Vérification et tests
-- ========================================

-- Test 1: Démarrer un essai gratuit
SELECT start_free_trial('b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID);

-- Test 2: Obtenir le statut d'abonnement
SELECT get_subscription_status('b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID);

-- Test 3: Vérifier l'accès
SELECT check_user_access('b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID);

-- Test 4: Simuler un paiement
-- SELECT complete_payment(
--     'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID,
--     'TXN_TEST_123456',
--     'orange_money',
--     '+221771234567'
-- );

-- ========================================
-- ✅ RÉSULTAT ATTENDU
-- ========================================
-- Après exécution:
-- 1. Tables créées: user_subscriptions, payment_transactions
-- 2. Fonctions disponibles: start_free_trial, get_subscription_status, etc.
-- 3. RLS activé et politiques configurées
-- 4. Tests de base passés
-- ========================================

-- ========================================
-- 📊 REQUÊTES UTILES POUR LE MONITORING
-- ========================================

-- Voir tous les abonnements actifs
-- SELECT * FROM user_subscriptions WHERE status IN ('trial', 'active') ORDER BY created_at DESC;

-- Voir toutes les transactions
-- SELECT * FROM payment_transactions ORDER BY created_at DESC;

-- Statistiques des abonnements
-- SELECT 
--     status,
--     COUNT(*) as count,
--     AVG(CASE WHEN trial_end_date IS NOT NULL 
--         THEN EXTRACT(DAY FROM (trial_end_date - NOW())) 
--         ELSE NULL END) as avg_days_remaining
-- FROM user_subscriptions
-- GROUP BY status;

-- Utilisateurs à notifier aujourd'hui (J-3)
-- SELECT * FROM get_users_to_notify(3);
