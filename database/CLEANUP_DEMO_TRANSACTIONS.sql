-- ========================================
-- NETTOYAGE DES TRANSACTIONS DE DEMO
-- ========================================
-- Date: 13 octobre 2025
-- Description: Supprime toutes les transactions de test DEMO_TXN_*
-- Utilisation: Exécutez ce script dans Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/editor

-- ========================================
-- ÉTAPE 1: Voir combien de transactions de démo existent
-- ========================================

SELECT 
    COUNT(*) as total_demo_transactions,
    MIN(created_at) as premiere_transaction,
    MAX(created_at) as derniere_transaction
FROM payment_transactions
WHERE provider_transaction_id LIKE 'DEMO_TXN_%';

-- ========================================
-- ÉTAPE 2: Voir les détails des transactions de démo
-- ========================================

SELECT 
    id,
    provider_transaction_id,
    provider_name,
    amount,
    status,
    phone_number,
    created_at
FROM payment_transactions
WHERE provider_transaction_id LIKE 'DEMO_TXN_%'
ORDER BY created_at DESC
LIMIT 20;

-- ========================================
-- ÉTAPE 3: Supprimer toutes les transactions de démo
-- ========================================

-- ⚠️ ATTENTION: Cette opération supprime TOUTES les transactions de test
-- Décommentez la ligne suivante pour exécuter:

DELETE FROM payment_transactions
WHERE provider_transaction_id LIKE 'DEMO_TXN_%';

-- ========================================
-- ÉTAPE 4: Vérifier que les transactions sont supprimées
-- ========================================

SELECT COUNT(*) as transactions_restantes
FROM payment_transactions
WHERE provider_transaction_id LIKE 'DEMO_TXN_%';

-- ========================================
-- ✅ RÉSULTAT ATTENDU
-- ========================================
-- Après exécution:
-- - Toutes les transactions DEMO_TXN_* sont supprimées
-- - Vous pouvez retester le paiement sans conflit
-- - Le nouveau générateur d'ID ultra-unique fonctionnera
-- ========================================
