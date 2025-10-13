-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DEBUG RLS POLICIES - Coach IA
-- Description: Script pour débugger les policies RLS
-- Date: 9 octobre 2025
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- TEST 1 : Vérifier auth.uid()
-- ============================================================================

SELECT auth.uid() AS current_user_id;
-- Si NULL : Problème d'authentification
-- Si UUID : Tout va bien

-- ============================================================================
-- TEST 2 : Lister les policies actives
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('ai_conversations', 'ai_messages', 'ai_message_attachments')
ORDER BY tablename, cmd;

-- ============================================================================
-- TEST 3 : Vérifier RLS activé
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('ai_conversations', 'ai_messages', 'ai_message_attachments');

-- Résultat attendu : rowsecurity = true pour les 3 tables

-- ============================================================================
-- TEST 4 : Créer conversation de test
-- ============================================================================

DO $$
DECLARE
  v_user_id UUID := auth.uid();
  v_conv_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'auth.uid() retourne NULL - utilisateur non authentifié';
  END IF;

  -- Créer conversation
  INSERT INTO ai_conversations (user_id, title)
  VALUES (v_user_id, 'Test RLS Debug')
  RETURNING id INTO v_conv_id;

  RAISE NOTICE 'Conversation créée: %', v_conv_id;

  -- Essayer d'insérer message
  INSERT INTO ai_messages (conversation_id, role, content)
  VALUES (v_conv_id, 'user', 'Test message');

  RAISE NOTICE '✅ Message inséré avec succès !';

  -- Nettoyer
  DELETE FROM ai_messages WHERE conversation_id = v_conv_id;
  DELETE FROM ai_conversations WHERE id = v_conv_id;

  RAISE NOTICE '✅ Test RLS réussi !';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur RLS: %', SQLERRM;
END $$;

-- ============================================================================
-- TEST 5 : Vérifier si policies bloquent
-- ============================================================================

-- Désactiver temporairement RLS pour voir si c'est bien le problème
-- ⚠️ ATTENTION : Ne pas utiliser en production !

-- ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;

-- Tester insertion
-- INSERT INTO ai_messages (conversation_id, role, content)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'user', 'Test sans RLS');

-- Réactiver RLS
-- ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SOLUTION SI auth.uid() NE FONCTIONNE PAS
-- ============================================================================

-- Option 1: Utiliser current_setting
/*
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    auth.uid(),
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modifier policy pour utiliser cette fonction
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON ai_messages;

CREATE POLICY "Users can create messages in own conversations"
ON ai_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = get_current_user_id()
  )
);
*/

-- Option 2: Désactiver temporairement RLS (DÉVELOPPEMENT SEULEMENT)
/*
ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;
*/

-- Option 3: Policy plus permissive (DÉVELOPPEMENT SEULEMENT)
/*
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON ai_messages;

CREATE POLICY "Allow all inserts in development"
ON ai_messages FOR INSERT
WITH CHECK (true); -- ⚠️ TRÈS DANGEREUX EN PRODUCTION
*/

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

DO $$
DECLARE
  v_policies_count INT;
  v_rls_enabled BOOLEAN;
BEGIN
  -- Compter policies
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'ai_messages';

  -- Vérifier RLS
  SELECT rowsecurity INTO v_rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename = 'ai_messages';

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 ÉTAT RLS - ai_messages';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS activé: %', v_rls_enabled;
  RAISE NOTICE 'Nombre policies: %', v_policies_count;
  RAISE NOTICE 'auth.uid(): %', auth.uid();
  RAISE NOTICE '';
  
  IF auth.uid() IS NULL THEN
    RAISE NOTICE '⚠️  PROBLÈME: auth.uid() retourne NULL';
    RAISE NOTICE '   → Utilisateur non authentifié via Supabase Auth';
    RAISE NOTICE '   → Vérifier token JWT dans requêtes HTTP';
  ELSE
    RAISE NOTICE '✅ auth.uid() fonctionne: %', auth.uid();
  END IF;
  
  IF v_policies_count = 0 THEN
    RAISE NOTICE '⚠️  PROBLÈME: Aucune policy trouvée';
  ELSIF v_policies_count < 4 THEN
    RAISE NOTICE '⚠️  ATTENTION: Seulement % policies (attendu: 4)', v_policies_count;
  ELSE
    RAISE NOTICE '✅ Toutes les policies présentes';
  END IF;
  
  RAISE NOTICE '';
END $$;
