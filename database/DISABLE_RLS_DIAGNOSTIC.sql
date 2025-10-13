-- ═══════════════════════════════════════════════════════════════
-- DIAGNOSTIC RAPIDE - Vérifier et Désactiver RLS
-- Date: 9 octobre 2025
-- ═══════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 1 : Vérifier l'état actuel de RLS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
  tablename AS "Table",
  CASE 
    WHEN rowsecurity THEN '🔴 ACTIVÉ'
    ELSE '🟢 DÉSACTIVÉ'
  END AS "État RLS"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('ai_conversations', 'ai_messages', 'ai_message_attachments')
ORDER BY tablename;

-- Résultat attendu :
-- Si "🔴 ACTIVÉ" → RLS bloque les inserts → Passer à ÉTAPE 2
-- Si "🟢 DÉSACTIVÉ" → RLS n'est pas le problème → Chercher ailleurs

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 2 : DÉSACTIVER RLS (si activé)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ⚠️ EXÉCUTER UNIQUEMENT SI ÉTAPE 1 MONTRE "🔴 ACTIVÉ"

ALTER TABLE ai_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_attachments DISABLE ROW LEVEL SECURITY;

-- Message attendu : "Success. No rows returned"

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 3 : Vérifier que RLS est bien désactivé
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
  tablename AS "Table",
  CASE 
    WHEN rowsecurity THEN '🔴 ACTIVÉ'
    ELSE '✅ DÉSACTIVÉ'
  END AS "État RLS"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('ai_conversations', 'ai_messages', 'ai_message_attachments')
ORDER BY tablename;

-- Résultat attendu : Toutes les tables doivent montrer "✅ DÉSACTIVÉ"

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 4 : Test d'insertion manuelle (optionnel)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Récupérer un user_id valide
SELECT id AS "User ID", email 
FROM auth.users 
LIMIT 1;

-- Copier le User ID et remplacer 'VOTRE-USER-ID-ICI' ci-dessous
-- Puis exécuter :

INSERT INTO ai_conversations (user_id, title, context_page)
VALUES (
  'b8fe56ad-e6e8-44f8-940f-a9e1d1115097',  -- Remplacer par l'UUID du user
  'Test manuel RLS désactivé',
  'dashboard'
)
RETURNING id, title, created_at;

-- Si ça fonctionne → RLS était bien le problème ✅
-- Si erreur 42501 → RLS n'est pas encore désactivé
-- Si autre erreur → Problème différent

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 5 : Nettoyer le test (optionnel)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Supprimer la conversation de test
DELETE FROM ai_conversations 
WHERE title = 'Test manuel RLS désactivé';

-- ═══════════════════════════════════════════════════════════════
-- RÉSUMÉ DES ACTIONS
-- ═══════════════════════════════════════════════════════════════

-- 1. ✅ Exécuter ÉTAPE 1 → Noter l'état RLS
-- 2. ⚠️ Si RLS activé → Exécuter ÉTAPE 2
-- 3. ✅ Exécuter ÉTAPE 3 → Vérifier que c'est désactivé
-- 4. 🧪 Optionnel : Exécuter ÉTAPE 4 → Tester l'insertion
-- 5. 🧹 Optionnel : Exécuter ÉTAPE 5 → Nettoyer

-- ═══════════════════════════════════════════════════════════════
-- APRÈS DÉSACTIVATION RLS
-- ═══════════════════════════════════════════════════════════════

-- Retourner dans l'application :
-- 1. Hard Refresh : Ctrl + Shift + R
-- 2. Ouvrir Coach IA
-- 3. Envoyer un message "Test après RLS"
-- 4. Vérifier : Pas d'erreur "Impossible de créer la conversation" ✅

-- ═══════════════════════════════════════════════════════════════
-- ⚠️ IMPORTANT - AVANT PRODUCTION
-- ═══════════════════════════════════════════════════════════════

-- Réactiver RLS avant le déploiement en production :
-- ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_message_attachments ENABLE ROW LEVEL SECURITY;

-- Puis configurer correctement auth.uid() dans le client Supabase
