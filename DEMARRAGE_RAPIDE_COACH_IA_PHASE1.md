# 🚀 Démarrage rapide - Phase 1 : Images + Historique

**Durée estimée** : 3-4 jours  
**Objectif** : Upload images + Sauvegarde conversations  
**Valeur** : Fonctionnalités les plus demandées

---

## 📋 Étape 1 : Créer les tables Supabase (30 min)

### A. Ouvrir Supabase SQL Editor

1. Aller sur https://supabase.com
2. Sélectionner votre projet
3. Cliquer sur "SQL Editor"
4. Créer nouvelle query

### B. Exécuter ce script SQL

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLES POUR COACH IA AVANCÉ
-- Date: 9 octobre 2025
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Table: Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  context_page TEXT, -- Page d'origine (dashboard, quiz, chapitre, etc.)
  context_data JSONB, -- Données contextuelles (quiz_id, chapter_id, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE,
  total_messages INT DEFAULT 0
);

-- Table: Messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'code', 'latex', 'file')),
  metadata JSONB, -- { language: 'javascript', hasImage: true, etc. }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  edit_count INT DEFAULT 0
);

-- Table: Pièces jointes (images, fichiers)
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
  thumbnail_path TEXT, -- Miniature pour images
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES POUR PERFORMANCE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON ai_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON ai_conversations(is_pinned) WHERE is_pinned = TRUE;

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted ON ai_messages(is_deleted) WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_attachments_message ON ai_message_attachments(message_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW LEVEL SECURITY (RLS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Activer RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_attachments ENABLE ROW LEVEL SECURITY;

-- Policies: Conversations
CREATE POLICY "Users can view own conversations"
ON ai_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
ON ai_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
ON ai_conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
ON ai_conversations FOR DELETE
USING (auth.uid() = user_id);

-- Policies: Messages
CREATE POLICY "Users can view messages of own conversations"
ON ai_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in own conversations"
ON ai_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own messages"
ON ai_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own messages"
ON ai_messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = ai_messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- Policies: Attachments
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

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS POUR AUTO-UPDATE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Fonction: Mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Conversations updated_at
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Messages updated_at
CREATE TRIGGER update_ai_messages_updated_at
  BEFORE UPDATE ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction: Incrémenter compteur messages
CREATE OR REPLACE FUNCTION increment_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET 
    total_messages = total_messages + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Compteur messages
CREATE TRIGGER increment_message_count
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_conversation_message_count();

-- Fonction: Générer titre conversation auto
CREATE OR REPLACE FUNCTION generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
  first_message TEXT;
BEGIN
  -- Si c'est le premier message utilisateur
  IF NEW.role = 'user' THEN
    SELECT content INTO first_message
    FROM ai_messages
    WHERE conversation_id = NEW.conversation_id
    AND role = 'user'
    ORDER BY created_at
    LIMIT 1;
    
    -- Mettre à jour titre si c'est "Nouvelle conversation"
    UPDATE ai_conversations
    SET title = SUBSTRING(first_message FROM 1 FOR 50) || 
                CASE WHEN LENGTH(first_message) > 50 THEN '...' ELSE '' END
    WHERE id = NEW.conversation_id
    AND title = 'Nouvelle conversation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Titre auto
CREATE TRIGGER auto_generate_conversation_title
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION generate_conversation_title();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FONCTIONS UTILITAIRES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Récupérer conversations récentes d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_recent_conversations(
  p_user_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  context_page TEXT,
  total_messages INT,
  is_pinned BOOLEAN,
  last_message TEXT,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.context_page,
    c.total_messages,
    c.is_pinned,
    (
      SELECT content 
      FROM ai_messages m
      WHERE m.conversation_id = c.id
      AND m.is_deleted = FALSE
      ORDER BY m.created_at DESC
      LIMIT 1
    ) as last_message,
    c.updated_at
  FROM ai_conversations c
  WHERE c.user_id = p_user_id
  ORDER BY c.is_pinned DESC, c.updated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rechercher dans les conversations
CREATE OR REPLACE FUNCTION search_conversations(
  p_user_id UUID,
  p_query TEXT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  context_page TEXT,
  total_messages INT,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.context_page,
    c.total_messages,
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
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DONNÉES DE TEST (OPTIONNEL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Créer conversation test (décommenter si besoin)
/*
INSERT INTO ai_conversations (user_id, title, context_page)
VALUES (auth.uid(), 'Test - Équations du second degré', 'chapitre');

INSERT INTO ai_messages (conversation_id, role, content)
VALUES (
  (SELECT id FROM ai_conversations WHERE title = 'Test - Équations du second degré' LIMIT 1),
  'user',
  'Comment résoudre x² + 5x + 6 = 0 ?'
);

INSERT INTO ai_messages (conversation_id, role, content)
VALUES (
  (SELECT id FROM ai_conversations WHERE title = 'Test - Équations du second degré' LIMIT 1),
  'assistant',
  'Pour résoudre cette équation du second degré, utilisons le discriminant Δ = b² - 4ac...'
);
*/

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VÉRIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Vérifier tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ai_%';

-- Vérifier RLS activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'ai_%';

-- ✅ Si tout est OK, vous devriez voir:
-- - ai_conversations
-- - ai_messages
-- - ai_message_attachments
-- Tous avec rowsecurity = true
```

### C. Créer Storage Bucket

```sql
-- Dans Supabase Storage, créer bucket:
-- Nom: ai-chat-attachments
-- Public: false
-- File size limit: 5 MB
-- Allowed MIME types: image/*, application/pdf

-- Ou via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-chat-attachments', 'ai-chat-attachments', false);

-- Policy: Upload
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: View
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Delete
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ai-chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 📦 Étape 2 : Installer dépendances NPM (5 min)

```bash
npm install browser-image-compression uuid react-markdown react-syntax-highlighter
```

---

## 📝 Étape 3 : Créer les services (1h)

### A. Service conversations

Créer `src/lib/aiConversationService.js` :

```javascript
import { supabase } from './supabase';

class AIConversationService {
  /**
   * Créer nouvelle conversation
   */
  async createConversation(userId, contextPage = null, contextData = null) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        title: 'Nouvelle conversation',
        context_page: contextPage,
        context_data: contextData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Récupérer conversations de l'utilisateur
   */
  async getUserConversations(userId, limit = 20) {
    const { data, error } = await supabase
      .rpc('get_user_recent_conversations', {
        p_user_id: userId,
        p_limit: limit
      });
    
    if (error) throw error;
    return data;
  }

  /**
   * Charger messages d'une conversation
   */
  async loadMessages(conversationId) {
    const { data, error } = await supabase
      .from('ai_messages')
      .select(`
        *,
        attachments:ai_message_attachments(*)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  /**
   * Sauvegarder message
   */
  async saveMessage(conversationId, role, content, contentType = 'text', metadata = null) {
    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        content_type: contentType,
        metadata
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Modifier message
   */
  async editMessage(messageId, newContent) {
    const { data, error } = await supabase
      .from('ai_messages')
      .update({
        content: newContent,
        is_edited: true,
        edit_count: supabase.sql`edit_count + 1`
      })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Supprimer message (soft delete)
   */
  async deleteMessage(messageId) {
    const { error } = await supabase
      .from('ai_messages')
      .update({ is_deleted: true })
      .eq('id', messageId);
    
    if (error) throw error;
  }

  /**
   * Épingler/désépingler conversation
   */
  async togglePin(conversationId, isPinned) {
    const { error } = await supabase
      .from('ai_conversations')
      .update({ is_pinned: isPinned })
      .eq('id', conversationId);
    
    if (error) throw error;
  }

  /**
   * Supprimer conversation
   */
  async deleteConversation(conversationId) {
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) throw error;
  }

  /**
   * Rechercher conversations
   */
  async searchConversations(userId, query) {
    const { data, error } = await supabase
      .rpc('search_conversations', {
        p_user_id: userId,
        p_query: query
      });
    
    if (error) throw error;
    return data;
  }
}

export const aiConversationService = new AIConversationService();
export default aiConversationService;
```

### B. Service upload images

Créer `src/lib/aiStorageService.js` :

```javascript
import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';

class AIStorageService {
  /**
   * Upload image avec compression
   */
  async uploadImage(file, conversationId, messageId) {
    try {
      // Compresser image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Générer nom unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${messageId}_${uuidv4()}.${fileExt}`;
      const filePath = `${conversationId}/${fileName}`;
      
      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('ai-chat-attachments')
        .upload(filePath, compressedFile, {
          contentType: compressedFile.type,
          upsert: false
        });
      
      if (error) throw error;
      
      // Obtenir URL publique signée (1 heure)
      const { data: urlData } = await supabase.storage
        .from('ai-chat-attachments')
        .createSignedUrl(data.path, 3600);
      
      return {
        path: data.path,
        url: urlData.signedUrl,
        size: compressedFile.size,
        type: compressedFile.type
      };
    } catch (error) {
      console.error('Erreur upload image:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder attachment en BDD
   */
  async saveAttachment(messageId, type, filePath, fileName, fileSize, mimeType) {
    const { data, error } = await supabase
      .from('ai_message_attachments')
      .insert({
        message_id: messageId,
        type,
        file_path: filePath,
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Obtenir URL signée pour un fichier
   */
  async getSignedUrl(filePath, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from('ai-chat-attachments')
      .createSignedUrl(filePath, expiresIn);
    
    if (error) throw error;
    return data.signedUrl;
  }

  /**
   * Supprimer fichier
   */
  async deleteFile(filePath) {
    const { error } = await supabase.storage
      .from('ai-chat-attachments')
      .remove([filePath]);
    
    if (error) throw error;
  }
}

export const aiStorageService = new AIStorageService();
export default aiStorageService;
```

---

## 🎨 Étape 4 : Créer composants UI (2h)

### A. Hook personnalisé

Créer `src/hooks/useAIConversation.js` :

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import aiConversationService from '../lib/aiConversationService';

export function useAIConversation(conversationId = null) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Charger messages d'une conversation
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await aiConversationService.getUserConversations(user.id);
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      setLoading(true);
      const data = await aiConversationService.loadMessages(convId);
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (contextPage, contextData) => {
    try {
      const conv = await aiConversationService.createConversation(
        user.id,
        contextPage,
        contextData
      );
      setCurrentConversation(conv);
      setConversations([conv, ...conversations]);
      return conv;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const sendMessage = async (content, contentType = 'text') => {
    try {
      const msg = await aiConversationService.saveMessage(
        currentConversation.id,
        'user',
        content,
        contentType
      );
      setMessages([...messages, msg]);
      return msg;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    loadConversations,
    loadMessages,
    createConversation,
    sendMessage,
    setCurrentConversation
  };
}
```

---

Voulez-vous que je continue avec la création des composants UI (ConversationList, ImageUploader, etc.) ? 🚀

Ou préférez-vous que je crée d'abord un **fichier SQL complet à exécuter** pour mettre en place toute la base de données ?
