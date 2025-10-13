/**
 * AI CONVERSATION SERVICE
 * Service de gestion des conversations IA
 */

import { supabase } from './customSupabaseClient';

const aiConversationService = {
  /**
   * Créer une nouvelle conversation
   */
  async createConversation(userId, contextPage = null, contextData = null) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          title: 'Nouvelle conversation',
          context_page: contextPage,
          context_data: contextData,
          is_pinned: false
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, conversation: data };
    } catch (error) {
      console.error('[aiConversationService] Erreur createConversation:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Récupérer les conversations d'un utilisateur
   */
  async getUserConversations(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, conversations: data || [] };
    } catch (error) {
      console.error('[aiConversationService] Erreur getUserConversations:', error);
      return { success: false, error: error.message, conversations: [] };
    }
  },

  /**
   * Charger une conversation
   */
  async getConversation(conversationId) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      return { success: true, conversation: data };
    } catch (error) {
      console.error('[aiConversationService] Erreur getConversation:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Charger les messages d'une conversation
   */
  async loadMessages(conversationId) {
    try {
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
      return { success: true, messages: data || [] };
    } catch (error) {
      console.error('[aiConversationService] Erreur loadMessages:', error);
      return { success: false, error: error.message, messages: [] };
    }
  },

  /**
   * Sauvegarder un message
   */
  async saveMessage(conversationId, role, content, contentType = 'text', metadata = null) {
    try {
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
      return { success: true, message: data };
    } catch (error) {
      console.error('[aiConversationService] Erreur saveMessage:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Éditer un message
   */
  async editMessage(messageId, newContent) {
    try {
      // Récupérer le message actuel pour incrémenter edit_count
      const { data: currentMessage } = await supabase
        .from('ai_messages')
        .select('edit_count')
        .eq('id', messageId)
        .single();

      const newEditCount = (currentMessage?.edit_count || 0) + 1;

      // Mettre à jour le message
      const { data, error } = await supabase
        .from('ai_messages')
        .update({
          content: newContent,
          is_edited: true,
          edit_count: newEditCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, message: data };
    } catch (error) {
      console.error('[aiConversationService] Erreur editMessage:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Supprimer un message (soft delete)
   */
  async deleteMessage(messageId) {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, message: data };
    } catch (error) {
      console.error('[aiConversationService] Erreur deleteMessage:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Épingler/Désépingler une conversation
   */
  async togglePin(conversationId, isPinned) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .update({ is_pinned: isPinned })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, conversation: data };
    } catch (error) {
      console.error('[aiConversationService] Erreur togglePin:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Renommer une conversation
   */
  async renameConversation(conversationId, newTitle) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .update({ title: newTitle })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, conversation: data };
    } catch (error) {
      console.error('[aiConversationService] Erreur renameConversation:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Supprimer une conversation
   */
  async deleteConversation(conversationId) {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[aiConversationService] Erreur deleteConversation:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Rechercher dans les conversations
   */
  async searchConversations(userId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .ilike('title', `%${searchTerm}%`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(20);

      if (error) throw error;
      return { success: true, conversations: data || [] };
    } catch (error) {
      console.error('[aiConversationService] Erreur searchConversations:', error);
      return { success: false, error: error.message, conversations: [] };
    }
  }
};

export default aiConversationService;
