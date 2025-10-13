-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- CORRECTION CRITIQUE : SCHEMA UUID AU LIEU DE INT
-- Description: Recréation complète des tables avec UUID comme clé primaire
-- Date: 9 octobre 2025
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ÉTAPE 1 : SUPPRIMER ANCIENNES TABLES (SI EXISTENT)
-- ============================================================================

DROP TABLE IF EXISTS ai_message_attachments CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS ai_conversations_backup CASCADE;

DO $$ BEGIN
  RAISE NOTICE '✅ Anciennes tables supprimées';
END $$;

-- ============================================================================
-- ÉTAPE 2 : CRÉER TABLE AI_CONVERSATIONS (UUID)
-- ============================================================================

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations conversation
  title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  
  -- Contexte
  context_page TEXT, -- Page où conversation créée (ex: 'chapter', 'quiz', 'exam')
  context_data JSONB, -- Données contextuelles (ex: {chapter_id: 1, quiz_id: 5})
  
  -- Métadonnées
  total_messages INT DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai_conversations IS 'Conversations Coach IA avec structure UUID';
COMMENT ON COLUMN ai_conversations.id IS 'UUID de la conversation (PK)';
COMMENT ON COLUMN ai_conversations.context_page IS 'Page origine (chapter/quiz/exam/dashboard)';
COMMENT ON COLUMN ai_conversations.context_data IS 'Données JSON du contexte';

DO $$ BEGIN
  RAISE NOTICE '✅ Table ai_conversations créée (UUID)';
END $$;

-- ============================================================================
-- ÉTAPE 3 : CRÉER TABLE AI_MESSAGES (UUID)
-- ============================================================================

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  
  -- Contenu message
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'code', 'latex', 'file')),
  
  -- Métadonnées
  metadata JSONB, -- Token count, model used, etc.
  
  -- Historique édition
  is_edited BOOLEAN DEFAULT FALSE,
  edit_count INT DEFAULT 0,
  parent_message_id UUID REFERENCES ai_messages(id) ON DELETE SET NULL,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai_messages IS 'Messages des conversations (UUID)';
COMMENT ON COLUMN ai_messages.conversation_id IS 'UUID de la conversation parente';
COMMENT ON COLUMN ai_messages.role IS 'Rôle : user, assistant, system';
COMMENT ON COLUMN ai_messages.content_type IS 'Type : text, image, code, latex, file';

DO $$ BEGIN
  RAISE NOTICE '✅ Table ai_messages créée (UUID)';
END $$;

-- ============================================================================
-- ÉTAPE 4 : CRÉER TABLE AI_MESSAGE_ATTACHMENTS (UUID)
-- ============================================================================

CREATE TABLE ai_message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
  
  -- Type et localisation
  type TEXT NOT NULL CHECK (type IN ('image', 'pdf', 'document', 'file')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  
  -- Métadonnées fichier
  file_size BIGINT,
  mime_type TEXT,
  
  -- Pour images
  width INT,
  height INT,
  thumbnail_path TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai_message_attachments IS 'Pièces jointes des messages (UUID)';
COMMENT ON COLUMN ai_message_attachments.message_id IS 'UUID du message parent';
COMMENT ON COLUMN ai_message_attachments.file_path IS 'Chemin dans Storage Supabase';

DO $$ BEGIN
  RAISE NOTICE '✅ Table ai_message_attachments créée (UUID)';
END $$;

-- ============================================================================
-- ÉTAPE 5 : CRÉER INDEX DE PERFORMANCE
-- ============================================================================

-- Index conversations
CREATE INDEX idx_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON ai_conversations(updated_at DESC);
CREATE INDEX idx_conversations_pinned ON ai_conversations(is_pinned, updated_at DESC);

-- Index messages
CREATE INDEX idx_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_messages_created_at ON ai_messages(created_at ASC);
CREATE INDEX idx_messages_deleted ON ai_messages(is_deleted);
CREATE INDEX idx_messages_role ON ai_messages(role);

-- Index attachments
CREATE INDEX idx_attachments_message_id ON ai_message_attachments(message_id);
CREATE INDEX idx_attachments_type ON ai_message_attachments(type);

DO $$ BEGIN
  RAISE NOTICE '✅ 9 index de performance créés';
END $$;

-- ============================================================================
-- ÉTAPE 6 : ACTIVER RLS (ROW LEVEL SECURITY)
-- ============================================================================

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  RAISE NOTICE '✅ RLS activé sur les 3 tables';
END $$;

-- ============================================================================
-- ÉTAPE 7 : POLICIES RLS - AI_CONVERSATIONS
-- ============================================================================

-- SELECT : Utilisateurs voient leurs conversations
CREATE POLICY "Users can view own conversations"
ON ai_conversations FOR SELECT
USING (auth.uid() = user_id);

-- INSERT : Utilisateurs créent leurs conversations
CREATE POLICY "Users can create own conversations"
ON ai_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE : Utilisateurs modifient leurs conversations
CREATE POLICY "Users can update own conversations"
ON ai_conversations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE : Utilisateurs suppriment leurs conversations
CREATE POLICY "Users can delete own conversations"
ON ai_conversations FOR DELETE
USING (auth.uid() = user_id);

DO $$ BEGIN
  RAISE NOTICE '✅ 4 policies RLS pour ai_conversations';
END $$;

-- ============================================================================
-- ÉTAPE 8 : POLICIES RLS - AI_MESSAGES
-- ============================================================================

-- SELECT : Utilisateurs voient messages de leurs conversations
CREATE POLICY "Users can view messages from own conversations"
ON ai_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = auth.uid()
  )
);

-- INSERT : Utilisateurs créent messages dans leurs conversations
CREATE POLICY "Users can create messages in own conversations"
ON ai_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = auth.uid()
  )
);

-- UPDATE : Utilisateurs modifient messages de leurs conversations
CREATE POLICY "Users can update messages in own conversations"
ON ai_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = auth.uid()
  )
);

-- DELETE : Utilisateurs suppriment messages de leurs conversations
CREATE POLICY "Users can delete messages in own conversations"
ON ai_messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = auth.uid()
  )
);

DO $$ BEGIN
  RAISE NOTICE '✅ 4 policies RLS pour ai_messages';
END $$;

-- ============================================================================
-- ÉTAPE 9 : POLICIES RLS - AI_MESSAGE_ATTACHMENTS
-- ============================================================================

-- SELECT : Utilisateurs voient attachments de leurs messages
CREATE POLICY "Users can view attachments from own messages"
ON ai_message_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_messages
    JOIN ai_conversations ON ai_conversations.id = ai_messages.conversation_id
    WHERE ai_messages.id = ai_message_attachments.message_id
    AND ai_conversations.user_id = auth.uid()
  )
);

-- INSERT : Utilisateurs créent attachments dans leurs messages
CREATE POLICY "Users can create attachments in own messages"
ON ai_message_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_messages
    JOIN ai_conversations ON ai_conversations.id = ai_messages.conversation_id
    WHERE ai_messages.id = ai_message_attachments.message_id
    AND ai_conversations.user_id = auth.uid()
  )
);

-- UPDATE : Utilisateurs modifient attachments de leurs messages
CREATE POLICY "Users can update attachments in own messages"
ON ai_message_attachments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM ai_messages
    JOIN ai_conversations ON ai_conversations.id = ai_messages.conversation_id
    WHERE ai_messages.id = ai_message_attachments.message_id
    AND ai_conversations.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_messages
    JOIN ai_conversations ON ai_conversations.id = ai_messages.conversation_id
    WHERE ai_messages.id = ai_message_attachments.message_id
    AND ai_conversations.user_id = auth.uid()
  )
);

-- DELETE : Utilisateurs suppriment attachments de leurs messages
CREATE POLICY "Users can delete attachments in own messages"
ON ai_message_attachments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM ai_messages
    JOIN ai_conversations ON ai_conversations.id = ai_messages.conversation_id
    WHERE ai_messages.id = ai_message_attachments.message_id
    AND ai_conversations.user_id = auth.uid()
  )
);

DO $$ BEGIN
  RAISE NOTICE '✅ 4 policies RLS pour ai_message_attachments';
END $$;

-- ============================================================================
-- ÉTAPE 10 : TRIGGERS AUTO-UPDATE
-- ============================================================================

-- Fonction trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ai_conversations
CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON ai_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger ai_messages
CREATE TRIGGER update_ai_messages_updated_at
BEFORE UPDATE ON ai_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  RAISE NOTICE '✅ 2 triggers auto-update créés';
END $$;

-- ============================================================================
-- ÉTAPE 11 : TRIGGER COMPTEUR MESSAGES
-- ============================================================================

-- Fonction pour mettre à jour total_messages
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Lors d'un INSERT
  IF TG_OP = 'INSERT' THEN
    UPDATE ai_conversations
    SET 
      total_messages = total_messages + 1,
      last_message_at = NEW.created_at,
      updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;
  
  -- Lors d'un DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE ai_conversations
    SET 
      total_messages = GREATEST(total_messages - 1, 0),
      updated_at = NOW()
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Créer trigger
CREATE TRIGGER update_message_count_on_insert
AFTER INSERT ON ai_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_message_count();

CREATE TRIGGER update_message_count_on_delete
AFTER DELETE ON ai_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_message_count();

DO $$ BEGIN
  RAISE NOTICE '✅ Trigger compteur messages créé';
END $$;

-- ============================================================================
-- ÉTAPE 12 : FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour récupérer conversations avec dernier message
CREATE OR REPLACE FUNCTION get_conversations_with_preview(
  p_user_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  context_page TEXT,
  is_pinned BOOLEAN,
  total_messages INT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  last_message_preview TEXT,
  last_message_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.context_page,
    c.is_pinned,
    c.total_messages,
    c.last_message_at,
    c.created_at,
    m.content AS last_message_preview,
    m.role AS last_message_role
  FROM ai_conversations c
  LEFT JOIN LATERAL (
    SELECT content, role
    FROM ai_messages
    WHERE conversation_id = c.id
    AND is_deleted = FALSE
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON TRUE
  WHERE c.user_id = p_user_id
  ORDER BY c.is_pinned DESC, c.last_message_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  RAISE NOTICE '✅ Fonction get_conversations_with_preview créée';
END $$;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

DO $$
DECLARE
  v_conversations_count INT;
  v_messages_count INT;
  v_attachments_count INT;
  v_policies_count INT;
  v_indexes_count INT;
BEGIN
  -- Compter tables
  SELECT COUNT(*) INTO v_conversations_count FROM ai_conversations;
  SELECT COUNT(*) INTO v_messages_count FROM ai_messages;
  SELECT COUNT(*) INTO v_attachments_count FROM ai_message_attachments;
  
  -- Compter policies
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('ai_conversations', 'ai_messages', 'ai_message_attachments');
  
  -- Compter indexes
  SELECT COUNT(*) INTO v_indexes_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename IN ('ai_conversations', 'ai_messages', 'ai_message_attachments');
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ SCHEMA UUID CRÉÉ AVEC SUCCÈS !';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables créées :';
  RAISE NOTICE '   - ai_conversations: % lignes', v_conversations_count;
  RAISE NOTICE '   - ai_messages: % lignes', v_messages_count;
  RAISE NOTICE '   - ai_message_attachments: % lignes', v_attachments_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Sécurité :';
  RAISE NOTICE '   - % policies RLS actives', v_policies_count;
  RAISE NOTICE '   - RLS activé sur 3 tables';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Performance :';
  RAISE NOTICE '   - % index créés', v_indexes_count;
  RAISE NOTICE '   - 3 triggers auto-update';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Clés primaires : UUID (gen_random_uuid)';
  RAISE NOTICE '🔗 Clés étrangères : UUID REFERENCES';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Prêt pour le Coach IA !';
  RAISE NOTICE '';
END $$;
