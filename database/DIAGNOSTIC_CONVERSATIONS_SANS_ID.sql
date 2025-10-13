-- ═══════════════════════════════════════════════════════════════
-- DIAGNOSTIC - Vérifier Données Conversations
-- Date: 9 octobre 2025, 15:10
-- Problème: conversations[0].id est undefined
-- ═══════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 1 : Vérifier la structure des conversations
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
  id,
  user_id,
  title,
  context_page,
  created_at,
  updated_at,
  CASE 
    WHEN id IS NULL THEN '❌ ID NULL'
    WHEN id::text = '' THEN '❌ ID VIDE'
    ELSE '✅ ID OK'
  END AS "État ID"
FROM ai_conversations
ORDER BY created_at DESC
LIMIT 10;

-- Si "État ID" montre "❌ ID NULL" ou "❌ ID VIDE" → Problème trouvé !

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 2 : Compter les conversations sans ID
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
  COUNT(*) AS "Total conversations",
  COUNT(id) AS "Avec ID",
  COUNT(*) - COUNT(id) AS "Sans ID (❌ PROBLÈME)"
FROM ai_conversations;

-- Si "Sans ID" > 0 → Il y a des conversations corrompues

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 3 : Supprimer les conversations sans ID (SI NÉCESSAIRE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ⚠️ ATTENTION : Ceci supprimera les conversations corrompues
-- Exécuter UNIQUEMENT si ÉTAPE 2 montre des conversations sans ID

DELETE FROM ai_conversations
WHERE id IS NULL;

-- Message attendu : "DELETE X" (où X = nombre de lignes supprimées)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 4 : Vérifier que toutes les conversations ont maintenant un ID
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
  id,
  title,
  created_at,
  '✅ ID OK' AS "Statut"
FROM ai_conversations
ORDER BY created_at DESC
LIMIT 5;

-- Tous les enregistrements doivent avoir un UUID valide

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 5 : Créer une conversation de test valide
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Récupérer un user_id valide
SELECT id AS "User ID", email 
FROM auth.users 
LIMIT 1;

-- Copier le User ID et remplacer ci-dessous
INSERT INTO ai_conversations (user_id, title, context_page)
VALUES (
  'b8fe56ad-e6e8-44f8-940f-a9e1d1115097',  -- Remplacer
  'Test conversation valide',
  'dashboard'
)
RETURNING id, title, created_at;

-- Vérifier que l'ID retourné est un UUID valide (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

-- ═══════════════════════════════════════════════════════════════
-- RÉSUMÉ DES ACTIONS
-- ═══════════════════════════════════════════════════════════════

-- 1. ✅ Exécuter ÉTAPE 1 → Vérifier structure conversations
-- 2. ✅ Exécuter ÉTAPE 2 → Compter conversations sans ID
-- 3. ⚠️ Si conversations sans ID → Exécuter ÉTAPE 3 (supprimer)
-- 4. ✅ Exécuter ÉTAPE 4 → Vérifier que tout est OK
-- 5. 🧪 Optionnel : Exécuter ÉTAPE 5 → Créer conversation de test

-- ═══════════════════════════════════════════════════════════════
-- APRÈS NETTOYAGE
-- ═══════════════════════════════════════════════════════════════

-- Retourner dans l'application :
-- 1. Hard Refresh : Ctrl + Shift + R
-- 2. Ouvrir Console (F12)
-- 3. Ouvrir Coach IA
-- 4. Vérifier logs :
--    ✅ firstConvId: 'uuid-xxx' (au lieu de undefined)
--    ✅ 📌 Auto-sélection première conversation: uuid-xxx
--    ✅ Pas de boucle infinie
