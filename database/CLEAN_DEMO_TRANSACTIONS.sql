-- ========================================
-- 🧹 NETTOYAGE DES TRANSACTIONS DE DÉMO
-- ========================================
-- Date: 13 octobre 2025
-- Description: Supprimer toutes les transactions de test pour permettre de nouveaux tests
-- ⚠️ ATTENTION: Exécuter uniquement en développement !

-- ========================================
-- ÉTAPE 1: Vérifier les transactions DEMO existantes
-- ========================================

-- Voir combien de transactions DEMO existent
SELECT 
    COUNT(*) as nombre_transactions_demo,
    provider_name,
    status
FROM payment_transactions
WHERE provider_transaction_id LIKE 'DEMO_TXN_%'
GROUP BY provider_name, status;

-- Voir les détails des transactions DEMO
SELECT 
    id,
    user_id,
    amount,
    provider_name,
    provider_transaction_id,
    status,
    created_at
FROM payment_transactions
WHERE provider_transaction_id LIKE 'DEMO_TXN_%'
ORDER BY created_at DESC;

-- ========================================
-- ÉTAPE 2: Supprimer les transactions DEMO
-- ========================================

-- ⚠️ DÉCOMMENTER LA LIGNE SUIVANTE POUR EXÉCUTER LA SUPPRESSION
DELETE FROM payment_transactions 
WHERE provider_transaction_id LIKE 'DEMO_TXN_%';

-- ========================================
-- ÉTAPE 3: Vérification après suppression
-- ========================================

-- Vérifier qu'il ne reste plus de transactions DEMO
SELECT COUNT(*) as transactions_demo_restantes
FROM payment_transactions
WHERE provider_transaction_id LIKE 'DEMO_TXN_%';

-- Résultat attendu: 0

-- ========================================
-- ÉTAPE 4 (OPTIONNEL): Réinitialiser le statut d'abonnement
-- ========================================

-- Si vous voulez aussi réinitialiser votre abonnement pour retester l'essai gratuit
-- ⚠️ DÉCOMMENTER LES LIGNES SUIVANTES SI BESOIN

-- UPDATE user_subscriptions
-- SET 
--     status = 'trial',
--     payment_status = NULL,
--     payment_method = NULL,
--     payment_amount = NULL,
--     payment_date = NULL,
--     transaction_id = NULL,
--     trial_start_date = NOW(),
--     trial_end_date = NOW() + INTERVAL '7 days',
--     subscription_start_date = NULL,
--     notification_j3_sent = FALSE,
--     notification_j1_sent = FALSE,
--     notification_j0_sent = FALSE,
--     updated_at = NOW()
-- WHERE user_id = 'VOTRE_USER_ID';

-- ========================================
-- ✅ RÉSULTAT ATTENDU
-- ========================================
-- 1. Toutes les transactions DEMO supprimées
-- 2. Aucun conflit de clé unique possible
-- 3. Vous pouvez retester le paiement autant de fois que vous voulez !
-- ========================================
