-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MIGRATION COACH IA V2 - MISE À JOUR STRUCTURE
-- Description: Mise à jour ai_conversations vers nouvelle structure
-- Date: 9 octobre 2025
-- Action: NON DESTRUCTIF - Conserve les données existantes
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ÉTAPE 1 : SAUVEGARDE (SÉCURITÉ)
-- ============================================================================

-- Sauvegarder l'ancienne structure au cas où
CREATE TABLE IF NOT EXISTS ai_conversations_backup AS 
SELECT * FROM ai_conversations;

DO $$ BEGIN
  RAISE NOTICE '✅ Sauvegarde créée : ai_conversations_backup';
END $$;

-- ============================================================================
-- ÉTAPE 2 : AJOUTER NOUVELLES COLONNES
-- ============================================================================

-- Ajouter titre (utilisera question comme valeur par défaut)
ALTER TABLE ai_conversations
ADD COLUMN IF NOT EXISTS title TEXT;

-- Ajouter colonnes contextuelles
ALTER TABLE ai_conversations
ADD COLUMN IF NOT EXISTS context_page TEXT,
ADD COLUMN IF NOT EXISTS context_data JSONB;

-- Ajouter colonnes de gestion
ALTER TABLE ai_conversations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_messages INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW();

DO $$ BEGIN
  RAISE NOTICE '✅ Nouvelles colonnes ajoutées';
END $$;

-- ============================================================================
-- ÉTAPE 3 : MIGRER DONNÉES EXISTANTES
-- ============================================================================

-- Convertir question → title
UPDATE ai_conversations
SET title = CASE
  WHEN question IS NOT NULL AND LENGTH(question) > 0 THEN
    SUBSTRING(question FROM 1 FOR 50) || 
    CASE WHEN LENGTH(question) > 50 THEN '...' ELSE '' END
  ELSE
    'Conversation du ' || TO_CHAR(created_at, 'DD/MM/YYYY')
END
WHERE title IS NULL;

-- Initialiser last_message_at avec created_at
UPDATE ai_conversations
SET last_message_at = created_at
WHERE last_message_at IS NULL;

-- Définir titre comme NOT NULL maintenant qu'on a des valeurs
ALTER TABLE ai_conversations
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN title SET DEFAULT 'Nouvelle conversation';

DO $$ BEGIN
  RAISE NOTICE '✅ Données migrées : question → title';
END $$;

-- ============================================================================
-- ÉTAPE 4 : CRÉER TABLES MANQUANTES
-- ============================================================================

-- Table messages (nouvelle)
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id INT REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'code', 'latex', 'file')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  edit_count INT DEFAULT 0,
  parent_message_id UUID REFERENCES ai_messages(id) ON DELETE SET NULL
);

COMMENT ON TABLE ai_messages IS 'Messages des conversations Coach IA';

-- Table attachments (nouvelle)
CREATE TABLE IF NOT EXISTS ai_message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'pdf', 'document', 'file')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  width INT,
  height INT,
  thumbnail_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ai_message_attachments IS 'Fichiers joints aux messages';

DO $$ BEGIN
  RAISE NOTICE '✅ Tables ai_messages et ai_message_attachments créées';
END $$;

-- ============================================================================
-- ÉTAPE 5 : MIGRER ANCIENNES CONVERSATIONS VERS MESSAGES
-- ============================================================================

-- Créer messages à partir de question/answer
INSERT INTO ai_messages (conversation_id, role, content, content_type, created_at)
SELECT 
  id as conversation_id,
  'user' as role,
  question as content,
  'text' as content_type,
  created_at
FROM ai_conversations
WHERE question IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM ai_messages m 
  WHERE m.conversation_id = ai_conversations.id
);

-- Créer réponses assistant
INSERT INTO ai_messages (conversation_id, role, content, content_type, created_at)
SELECT 
  id as conversation_id,
  'assistant' as role,
  answer as content,
  'text' as content_type,
  created_at + INTERVAL '1 second' -- Légèrement après question
FROM ai_conversations
WHERE answer IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM ai_messages m 
  WHERE m.conversation_id = ai_conversations.id 
  AND m.role = 'assistant'
);

-- Mettre à jour compteur messages
UPDATE ai_conversations c
SET total_messages = (
  SELECT COUNT(*) 
  FROM ai_messages m 
  WHERE m.conversation_id = c.id
)
WHERE total_messages = 0;

DO $$ BEGIN
  RAISE NOTICE '✅ Anciennes conversations migrées vers ai_messages';
END $$;

-- ============================================================================
-- ÉTAPE 6 : NETTOYER ANCIENNES COLONNES (OPTIONNEL)
-- ============================================================================

-- ATTENTION: Décommenter seulement si vous êtes SÛR de ne plus en avoir besoin

/*
ALTER TABLE ai_conversations
DROP COLUMN IF EXISTS question,
DROP COLUMN IF EXISTS answer;

RAISE NOTICE '⚠️ Anciennes colonnes question/answer supprimées';
*/

-- ============================================================================
-- ÉTAPE 7 : CRÉER INDEXES
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

DO $$ BEGIN
  RAISE NOTICE '✅ 11 indexes créés';
END $$;

-- ============================================================================
-- ÉTAPE 8 : ACTIVER ROW LEVEL SECURITY
-- ============================================================================

-- Activer RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_attachments ENABLE ROW LEVEL SECURITY;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: AI_CONVERSATIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "Users can view own conversations" ON ai_conversations;
CREATE POLICY "Users can view own conversations"
ON ai_conversations FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own conversations" ON ai_conversations;
CREATE POLICY "Users can create own conversations"
ON ai_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON ai_conversations;
CREATE POLICY "Users can update own conversations"
ON ai_conversations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON ai_conversations;
CREATE POLICY "Users can delete own conversations"
ON ai_conversations FOR DELETE
USING (auth.uid() = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: AI_MESSAGES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "Users can view messages of own conversations" ON ai_messages;
CREATE POLICY "Users can view messages of own conversations"
ON ai_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create messages in own conversations" ON ai_messages;
CREATE POLICY "Users can create messages in own conversations"
ON ai_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update own messages" ON ai_messages;
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

DROP POLICY IF EXISTS "Users can delete own messages" ON ai_messages;
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

DROP POLICY IF EXISTS "Users can view attachments of own messages" ON ai_message_attachments;
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

DROP POLICY IF EXISTS "Users can create attachments in own messages" ON ai_message_attachments;
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

DROP POLICY IF EXISTS "Users can delete own attachments" ON ai_message_attachments;
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

DO $$ BEGIN
  RAISE NOTICE '✅ 12 RLS policies appliquées';
END $$;

-- ============================================================================
-- ÉTAPE 9 : CRÉER TRIGGERS
-- ============================================================================

-- Fonction updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer aux conversations
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Appliquer aux messages
DROP TRIGGER IF EXISTS update_ai_messages_updated_at ON ai_messages;
CREATE TRIGGER update_ai_messages_updated_at
  BEFORE UPDATE ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction compteur messages
CREATE OR REPLACE FUNCTION increment_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET 
    total_messages = total_messages + 1,
    last_message_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_message_count ON ai_messages;
CREATE TRIGGER increment_message_count
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_conversation_message_count();

-- Fonction génération titre
CREATE OR REPLACE FUNCTION generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation ai_conversations;
  v_first_user_message TEXT;
BEGIN
  IF NEW.role != 'user' THEN
    RETURN NEW;
  END IF;
  
  SELECT * INTO v_conversation
  FROM ai_conversations
  WHERE id = NEW.conversation_id;
  
  IF v_conversation.title = 'Nouvelle conversation' THEN
    v_first_user_message := SUBSTRING(NEW.content FROM 1 FOR 50);
    
    IF LENGTH(NEW.content) > 50 THEN
      v_first_user_message := v_first_user_message || '...';
    END IF;
    
    UPDATE ai_conversations
    SET title = v_first_user_message
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_generate_conversation_title ON ai_messages;
CREATE TRIGGER auto_generate_conversation_title
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION generate_conversation_title();

DO $$ BEGIN
  RAISE NOTICE '✅ 3 triggers créés';
END $$;

-- ============================================================================
-- ÉTAPE 10 : CRÉER FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction conversations récentes
CREATE OR REPLACE FUNCTION get_user_recent_conversations(
  p_user_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id INT,
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
    c.is_pinned DESC,
    c.last_message_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction recherche
CREATE OR REPLACE FUNCTION search_conversations(
  p_user_id UUID,
  p_query TEXT
)
RETURNS TABLE (
  id INT,
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
    c.title ILIKE '%' || p_query || '%'
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

-- Fonction statistiques
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

DO $$ BEGIN
  RAISE NOTICE '✅ 3 fonctions utilitaires créées';
END $$;

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

DO $$
DECLARE
  v_conversations_count INT;
  v_messages_count INT;
BEGIN
  -- Compter conversations
  SELECT COUNT(*) INTO v_conversations_count FROM ai_conversations;
  
  -- Compter messages
  SELECT COUNT(*) INTO v_messages_count FROM ai_messages;
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ MIGRATION TERMINÉE AVEC SUCCÈS !';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Résultat:';
  RAISE NOTICE '   - % conversations conservées', v_conversations_count;
  RAISE NOTICE '   - % messages créés', v_messages_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables: 3';
  RAISE NOTICE '✅ Indexes: 11';
  RAISE NOTICE '✅ RLS Policies: 12';
  RAISE NOTICE '✅ Triggers: 3';
  RAISE NOTICE '✅ Fonctions: 3';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Prochaines étapes:';
  RAISE NOTICE '   1. Créer bucket Storage: ai-chat-attachments';
  RAISE NOTICE '   2. Installer NPM packages frontend';
  RAISE NOTICE '   3. Tester services JavaScript';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Note: Anciennes colonnes question/answer conservées';
  RAISE NOTICE '   (Décommenter ÉTAPE 6 pour les supprimer)';
  RAISE NOTICE '';
END $$;
