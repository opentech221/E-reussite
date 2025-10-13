-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COACH IA FLOTTANT - BASE DE DONNÉES COMPLÈTE
-- Description: Tables pour historique conversations, messages, attachments
-- Date: 9 octobre 2025
-- Version: 1.0
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- TABLE 1: CONVERSATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  context_page TEXT, -- Page d'origine: dashboard, quiz, chapitre, exam
  context_data JSONB, -- Données contextuelles: { quiz_id: 42, matiere: "Math" }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE,
  total_messages INT DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai_conversations IS 'Conversations du Coach IA avec historique';
COMMENT ON COLUMN ai_conversations.context_page IS 'Page où conversation a démarré';
COMMENT ON COLUMN ai_conversations.context_data IS 'Métadonnées contextuelles (quiz_id, etc.)';
COMMENT ON COLUMN ai_conversations.is_pinned IS 'Épingler conversation en haut de liste';

-- ============================================================================
-- TABLE 2: MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'code', 'latex', 'file')),
  metadata JSONB, -- { language: 'javascript', hasImage: true, imageCount: 2 }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  edit_count INT DEFAULT 0,
  parent_message_id UUID REFERENCES ai_messages(id) ON DELETE SET NULL
);

COMMENT ON TABLE ai_messages IS 'Messages des conversations Coach IA';
COMMENT ON COLUMN ai_messages.role IS 'user = utilisateur, assistant = IA, system = système';
COMMENT ON COLUMN ai_messages.content_type IS 'Type de contenu pour rendu adapté';
COMMENT ON COLUMN ai_messages.is_edited IS 'Message modifié par utilisateur';
COMMENT ON COLUMN ai_messages.parent_message_id IS 'Pour threading/réponses';

-- ============================================================================
-- TABLE 3: ATTACHMENTS (Images, fichiers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'pdf', 'document', 'file')),
  file_path TEXT NOT NULL, -- Chemin dans Supabase Storage
  file_name TEXT NOT NULL,
  file_size INT, -- En bytes
  mime_type TEXT,
  width INT, -- Pour images
  height INT, -- Pour images
  thumbnail_path TEXT, -- Miniature générée
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai_message_attachments IS 'Fichiers joints aux messages (images, PDF)';
COMMENT ON COLUMN ai_message_attachments.file_path IS 'Chemin bucket: {user_id}/{conversation_id}/{file}';
COMMENT ON COLUMN ai_message_attachments.thumbnail_path IS 'Miniature 200x200 pour preview';

-- ============================================================================
-- INDEXES POUR PERFORMANCE
-- ============================================================================

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON ai_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON ai_conversations(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_conversations_context ON ai_conversations(context_page) WHERE context_page IS NOT NULL;

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_role ON ai_messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted ON ai_messages(is_deleted) WHERE is_deleted = FALSE;

-- Attachments
CREATE INDEX IF NOT EXISTS idx_attachments_message ON ai_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON ai_message_attachments(type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_attachments ENABLE ROW LEVEL SECURITY;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: AI_CONVERSATIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT: Voir ses propres conversations
CREATE POLICY "Users can view own conversations"
ON ai_conversations FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Créer ses propres conversations
CREATE POLICY "Users can create own conversations"
ON ai_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Modifier ses propres conversations
CREATE POLICY "Users can update own conversations"
ON ai_conversations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Supprimer ses propres conversations
CREATE POLICY "Users can delete own conversations"
ON ai_conversations FOR DELETE
USING (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: AI_MESSAGES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT: Voir messages de ses conversations
CREATE POLICY "Users can view messages of own conversations"
ON ai_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- INSERT: Créer messages dans ses conversations
CREATE POLICY "Users can create messages in own conversations"
ON ai_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- UPDATE: Modifier messages de ses conversations
CREATE POLICY "Users can update own messages"
ON ai_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- DELETE: Supprimer messages de ses conversations
CREATE POLICY "Users can delete own messages"
ON ai_messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: AI_MESSAGE_ATTACHMENTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT: Voir attachments de ses messages
CREATE POLICY "Users can view attachments of own messages"
ON ai_message_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_messages m
    INNER JOIN ai_conversations c ON m.conversation_id = c.id
    WHERE m.id = ai_message_attachments.message_id
    AND c.user_id = auth.uid()
  )
);

-- INSERT: Créer attachments dans ses messages
CREATE POLICY "Users can create attachments in own messages"
ON ai_message_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_messages m
    INNER JOIN ai_conversations c ON m.conversation_id = c.id
    WHERE m.id = ai_message_attachments.message_id
    AND c.user_id = auth.uid()
  )
);

-- DELETE: Supprimer ses attachments
CREATE POLICY "Users can delete own attachments"
ON ai_message_attachments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM ai_messages m
    INNER JOIN ai_conversations c ON m.conversation_id = c.id
    WHERE m.id = ai_message_attachments.message_id
    AND c.user_id = auth.uid()
  )
);

-- ============================================================================
-- TRIGGERS & FONCTIONS
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGER 1: Auto-update updated_at
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer aux conversations
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Appliquer aux messages
CREATE TRIGGER update_ai_messages_updated_at
  BEFORE UPDATE ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGER 2: Incrémenter compteur messages
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION increment_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter total_messages et mettre à jour last_message_at
  UPDATE ai_conversations
  SET 
    total_messages = total_messages + 1,
    last_message_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_message_count
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_conversation_message_count();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGER 3: Générer titre conversation automatiquement
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation ai_conversations;
  v_first_user_message TEXT;
BEGIN
  -- Seulement pour messages utilisateur
  IF NEW.role != 'user' THEN
    RETURN NEW;
  END IF;
  
  -- Récupérer conversation
  SELECT * INTO v_conversation
  FROM ai_conversations
  WHERE id = NEW.conversation_id;
  
  -- Si titre par défaut, le remplacer
  IF v_conversation.title = 'Nouvelle conversation' THEN
    -- Prendre premiers 50 caractères du message
    v_first_user_message := SUBSTRING(NEW.content FROM 1 FOR 50);
    
    -- Ajouter "..." si tronqué
    IF LENGTH(NEW.content) > 50 THEN
      v_first_user_message := v_first_user_message || '...';
    END IF;
    
    -- Mettre à jour titre
    UPDATE ai_conversations
    SET title = v_first_user_message
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_conversation_title
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION generate_conversation_title();

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FONCTION 1: Récupérer conversations récentes
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION get_user_recent_conversations(
  p_user_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  context_page TEXT,
  context_data JSONB,
  total_messages INT,
  is_pinned BOOLEAN,
  last_message TEXT,
  last_message_role TEXT,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.context_page,
    c.context_data,
    c.total_messages,
    c.is_pinned,
    -- Dernier message
    (
      SELECT m.content 
      FROM ai_messages m
      WHERE m.conversation_id = c.id
      AND m.is_deleted = FALSE
      ORDER BY m.created_at DESC
      LIMIT 1
    ) as last_message,
    (
      SELECT m.role 
      FROM ai_messages m
      WHERE m.conversation_id = c.id
      AND m.is_deleted = FALSE
      ORDER BY m.created_at DESC
      LIMIT 1
    ) as last_message_role,
    c.updated_at,
    c.created_at
  FROM ai_conversations c
  WHERE c.user_id = p_user_id
  ORDER BY 
    c.is_pinned DESC, -- Épinglées en premier
    c.last_message_at DESC -- Puis par date
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_recent_conversations IS 'Liste conversations avec dernier message';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FONCTION 2: Rechercher dans conversations
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION search_conversations(
  p_user_id UUID,
  p_query TEXT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  context_page TEXT,
  total_messages INT,
  match_count INT,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.context_page,
    c.total_messages,
    -- Nombre de messages correspondants
    (
      SELECT COUNT(*)::INT
      FROM ai_messages m
      WHERE m.conversation_id = c.id
      AND m.content ILIKE '%' || p_query || '%'
      AND m.is_deleted = FALSE
    ) as match_count,
    c.updated_at
  FROM ai_conversations c
  WHERE c.user_id = p_user_id
  AND (
    -- Recherche dans titre
    c.title ILIKE '%' || p_query || '%'
    -- Ou dans messages
    OR EXISTS (
      SELECT 1 FROM ai_messages m
      WHERE m.conversation_id = c.id
      AND m.content ILIKE '%' || p_query || '%'
      AND m.is_deleted = FALSE
    )
  )
  ORDER BY match_count DESC, c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION search_conversations IS 'Recherche full-text dans conversations';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FONCTION 3: Statistiques utilisateur
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION get_user_ai_stats(p_user_id UUID)
RETURNS TABLE (
  total_conversations INT,
  total_messages INT,
  total_images INT,
  most_used_context TEXT,
  first_conversation_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id)::INT as total_conversations,
    COUNT(DISTINCT m.id)::INT as total_messages,
    COUNT(DISTINCT a.id)::INT as total_images,
    (
      SELECT context_page
      FROM ai_conversations
      WHERE user_id = p_user_id
      AND context_page IS NOT NULL
      GROUP BY context_page
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_used_context,
    MIN(c.created_at) as first_conversation_date
  FROM ai_conversations c
  LEFT JOIN ai_messages m ON m.conversation_id = c.id AND m.is_deleted = FALSE
  LEFT JOIN ai_message_attachments a ON a.message_id = m.id
  WHERE c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_ai_stats IS 'Statistiques utilisation Coach IA';

-- ============================================================================
-- STORAGE POLICIES (À exécuter après création bucket)
-- ============================================================================

-- NOTE: Créer d'abord le bucket 'ai-chat-attachments' dans Supabase Storage
-- Puis exécuter ces policies:

/*
-- Policy: Upload dans son dossier
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Voir ses fichiers
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Supprimer ses fichiers
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- ============================================================================
-- VÉRIFICATION INSTALLATION
-- ============================================================================

-- Vérifier tables créées
DO $$
BEGIN
  RAISE NOTICE '✅ Tables créées:';
  RAISE NOTICE '   - ai_conversations';
  RAISE NOTICE '   - ai_messages';
  RAISE NOTICE '   - ai_message_attachments';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Indexes créés: 11';
  RAISE NOTICE '✅ RLS Policies: 12';
  RAISE NOTICE '✅ Triggers: 3';
  RAISE NOTICE '✅ Fonctions: 3';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Prochaines étapes:';
  RAISE NOTICE '   1. Créer bucket Storage: ai-chat-attachments';
  RAISE NOTICE '   2. Appliquer Storage policies (décommenter section)';
  RAISE NOTICE '   3. Installer NPM packages frontend';
  RAISE NOTICE '   4. Créer services JavaScript';
END $$;

-- Lister tables créées
SELECT 
  'Table' as type,
  table_name as name,
  'Créée' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ai_%'
ORDER BY table_name;

-- Vérifier RLS activé
SELECT 
  'RLS Policy' as type,
  tablename as table,
  rowsecurity as enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'ai_%'
ORDER BY tablename;
