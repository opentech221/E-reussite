-- ========================================
-- MISE À JOUR: Fonction complete_payment IDEMPOTENTE
-- ========================================
-- Date: 13 octobre 2025
-- Description: Rendre la fonction complete_payment idempotente (peut être appelée plusieurs fois sans erreur)
-- URL: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/editor

-- ========================================
-- FONCTION AMÉLIORÉE avec vérification d'existence
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
    v_already_exists BOOLEAN := FALSE;
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
    
    -- Si la transaction existe déjà, marquer comme existante
    IF v_transaction_id IS NOT NULL THEN
        v_already_exists := TRUE;
    ELSE
        -- Créer la nouvelle transaction
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
    
    -- Mettre à jour l'abonnement (même si la transaction existait déjà)
    UPDATE user_subscriptions
    SET 
        status = 'active',
        subscription_start_date = COALESCE(subscription_start_date, NOW()),
        subscription_end_date = NULL, -- Accès à vie
        payment_status = 'completed',
        payment_method = p_payment_method,
        payment_amount = 1000.00,
        payment_date = COALESCE(payment_date, NOW()),
        transaction_id = p_transaction_id,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Retourner le résultat
    v_result := jsonb_build_object(
        'success', true,
        'status', 'active',
        'transaction_id', v_transaction_id,
        'already_exists', v_already_exists,
        'message', CASE 
            WHEN v_already_exists THEN 'Paiement déjà enregistré. Accès illimité activé !'
            ELSE 'Paiement complété avec succès. Accès illimité activé !'
        END
    );
    
    RETURN v_result;
END;
$$;

-- ========================================
-- TEST DE LA FONCTION
-- ========================================

-- Test 1: Premier paiement (devrait créer)
SELECT complete_payment(
    'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID,
    'TEST_IDEMPOTENT_001',
    'orange_money',
    '783096936'
);

-- Test 2: Deuxième appel avec le MÊME ID (devrait réussir sans erreur)
SELECT complete_payment(
    'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID,
    'TEST_IDEMPOTENT_001',
    'orange_money',
    '783096936'
);

-- ========================================
-- ✅ RÉSULTAT ATTENDU
-- ========================================
-- Test 1: {"success": true, "already_exists": false, "message": "Paiement complété..."}
-- Test 2: {"success": true, "already_exists": true, "message": "Paiement déjà enregistré..."}
-- AUCUNE ERREUR 409 !
-- ========================================

-- ========================================
-- 📊 VÉRIFICATION POST-EXÉCUTION
-- ========================================

-- Voir les transactions de test
SELECT * FROM payment_transactions 
WHERE provider_transaction_id LIKE 'TEST_IDEMPOTENT_%'
ORDER BY created_at DESC;

-- Nettoyer les tests (optionnel)
-- DELETE FROM payment_transactions WHERE provider_transaction_id LIKE 'TEST_IDEMPOTENT_%';
