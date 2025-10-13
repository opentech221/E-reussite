-- ⚡ MISE À JOUR FONCTION complete_payment
-- Date: 13 octobre 2025
-- Description: Ajouter ON CONFLICT pour gérer les doublons de transaction
-- Action: Exécuter ce script dans Supabase SQL Editor

-- ========================================
-- Fonction améliorée pour compléter un paiement
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
    
    -- Créer la transaction (avec gestion des doublons)
    INSERT INTO payment_transactions (
        user_id,
        subscription_id,
        amount,
        payment_method,
        status,
        provider_transaction_id,
        provider_name,
        phone_number
    )
    VALUES (
        p_user_id,
        v_subscription_id,
        1000.00,
        p_payment_method,
        'completed',
        p_transaction_id,
        p_payment_method,
        p_phone_number
    )
    ON CONFLICT (provider_transaction_id, provider_name) 
    DO UPDATE SET
        completed_at = NOW(),
        status = 'completed'
    RETURNING id INTO v_transaction_id;
    
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
-- ✅ VÉRIFICATION
-- ========================================
-- Après exécution, la fonction complete_payment gérera automatiquement
-- les doublons en mettant à jour la transaction existante au lieu
-- de générer une erreur de contrainte unique.
-- ========================================
