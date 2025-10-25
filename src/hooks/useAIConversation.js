/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * USE AI CONVERSATION HOOK
 * Description: Hook React pour gestion conversations Coach IA
 * Date: 9 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import aiConversationService from '../lib/aiConversationService';
import aiStorageService from '../lib/aiStorageService';
import { useMultiProviderAI } from './useMultiProviderAI';
import { buildSystemPrompt, buildImageAnalysisPrompt } from '../lib/aiPromptBuilder';
import { buildContextualPrompt } from '../lib/contextualAIService';

/**
 * Hook de gestion des conversations IA
 * @param {string} conversationId - ID conversation à charger (optionnel)
 * @param {string} contextPage - Page actuelle pour auto-création
 * @param {object} contextData - Données contextuelles
 * @returns {object} État et méthodes
 */
export function useAIConversation(conversationId = null, contextPage = null, contextData = null) {
  const { user } = useAuth();
  
  // 🎯 MULTI-PROVIDER IA
  const { generateResponse, analyzeImage, currentProvider } = useMultiProviderAI();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ÉTAT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Conversations
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  // Messages
  const [messages, setMessages] = useState([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHARGER CONVERSATIONS AU MONTAGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHARGER MESSAGES SI CONVERSATION SPÉCIFIÉE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  useEffect(() => {
    if (conversationId && user) {
      loadConversation(conversationId);
    }
  }, [conversationId, user]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MÉTHODES: CONVERSATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Charger liste conversations
   */
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [loadConversations] Chargement pour user:', user.id);
      const result = await aiConversationService.getUserConversations(user.id);
      
      // ✅ Extraire conversations de l'objet result
      const conversations = result.success && result.conversations ? result.conversations : [];
      console.log('✅ [loadConversations] Conversations chargées:', conversations.length, conversations);
      setConversations(conversations);
    } catch (err) {
      console.error('❌ [loadConversations] Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Charger conversation spécifique
   */
  const loadConversation = useCallback(async (convId) => {
    if (!user) return;

    try {
      setLoadingMessages(true);
      setError(null);

      // Charger infos conversation
      const convResult = await aiConversationService.getConversation(convId);
      if (convResult.success && convResult.conversation) {
        setCurrentConversation(convResult.conversation);
      }

      // Charger messages
      const msgsResult = await aiConversationService.loadMessages(convId);
      if (msgsResult.success && msgsResult.messages) {
        setMessages(msgsResult.messages);
      }
    } catch (err) {
      console.error('Erreur chargement conversation:', err);
      setError(err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  /**
   * Créer nouvelle conversation
   */
  const createConversation = useCallback(async (page = null, data = null) => {
    console.log('🔍 [createConversation] Début:', { user: !!user, page, data });
    
    if (!user) {
      console.warn('⚠️ [createConversation] Pas d\'utilisateur connecté');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await aiConversationService.createConversation(
        user.id,
        page || contextPage,
        data || contextData
      );
      
      // ✅ Extraire conversation de l'objet result
      if (!result.success || !result.conversation) {
        throw new Error('Échec de création de la conversation');
      }

      const conv = result.conversation;
      console.log('✅ [createConversation] Conversation créée:', conv?.id);

      setCurrentConversation(conv);
      setMessages([]);
      setConversations(prev => [conv, ...(Array.isArray(prev) ? prev : [])]);

      return conv;
    } catch (err) {
      console.error('❌ [createConversation] Erreur création conversation:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, contextPage, contextData]);

  /**
   * Sélectionner conversation
   */
  const selectConversation = useCallback(async (convId) => {
    if (!convId) {
      console.warn('⚠️ [selectConversation] ID conversation undefined, annulation');
      return;
    }
    await loadConversation(convId);
  }, [loadConversation]);

  /**
   * Épingler/désépingler conversation
   */
  const togglePinConversation = useCallback(async (convId, isPinned) => {
    try {
      await aiConversationService.togglePin(convId, isPinned);
      
      // Mettre à jour liste locale
      setConversations(prev =>
        prev.map(c =>
          c.id === convId ? { ...c, is_pinned: isPinned } : c
        )
      );
    } catch (err) {
      console.error('Erreur toggle pin:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Supprimer conversation
   */
  const deleteConversation = useCallback(async (convId) => {
    try {
      console.log('🗑️ [useAIConversation] Suppression conversation:', convId);
      
      await aiConversationService.deleteConversation(convId);
      
      // Retirer de la liste - forcer nouveau tableau
      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== convId);
        console.log('📝 [useAIConversation] Conversations après suppression:', {
          avant: prev.length,
          après: filtered.length,
          supprimé: convId
        });
        return [...filtered]; // 🎯 Forcer nouvelle référence
      });
      
      // Si c'était la conversation active, réinitialiser
      if (currentConversation?.id === convId) {
        console.log('🔄 [useAIConversation] Réinitialisation conversation active');
        setCurrentConversation(null);
        setMessages([]);
      }
      
      console.log('✅ [useAIConversation] Suppression terminée avec succès');
    } catch (err) {
      console.error('❌ [useAIConversation] Erreur suppression conversation:', err);
      setError(err.message);
      throw err;
    }
  }, [currentConversation]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AUTO-SÉLECTION PREMIÈRE CONVERSATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Auto-sélectionner la première conversation si aucune n'est active
   * Utile quand l'utilisateur ouvre Coach IA avec des conversations existantes
   */
  useEffect(() => {
    console.log('🔍 [useAIConversation] Vérification auto-sélection:', {
      user: !!user,
      conversationsLength: conversations.length,
      currentConvId: currentConversation?.id,
      loading: loading,
      firstConvId: conversations[0]?.id  // ✅ Log l'ID de la première conversation
    });
    
    // Vérifier que conversations[0] existe ET a un ID valide
    const firstConvId = conversations[0]?.id;
    
    if (user && conversations.length > 0 && !currentConversation?.id && !loading && firstConvId) {
      console.log('📌 [useAIConversation] Auto-sélection première conversation:', firstConvId);
      selectConversation(firstConvId);
    } else if (conversations.length > 0 && !firstConvId) {
      console.error('❌ [useAIConversation] Conversation sans ID:', conversations[0]);
    }
  }, [user, conversations, currentConversation, loading, selectConversation]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MÉTHODES: MESSAGES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Envoyer message texte
   * @param {string} content - Contenu du message
   * @param {string} contentType - Type de contenu (défaut: 'text')
   * @param {object} metadata - Métadonnées optionnelles
   * @param {string} conversationId - ID conversation (optionnel, utilise currentConversation par défaut)
   * @param {object} userContext - Contexte utilisateur pour prompt enrichi
   * @param {object} pageContext - Contexte de la page actuelle
   */
  const sendMessage = useCallback(async (content, contentType = 'text', metadata = null, conversationId = null, userContext = {}, pageContext = {}) => {
    const targetConvId = conversationId || currentConversation?.id;
    
    if (!targetConvId) {
      throw new Error('Aucune conversation active');
    }

    try {
      setSending(true);
      setError(null);

      const messageResult = await aiConversationService.saveMessage(
        targetConvId,
        'user',
        content,
        contentType,
        metadata
      );

      if (!messageResult.success || !messageResult.message) {
        throw new Error('Échec de sauvegarde du message');
      }

      const message = messageResult.message;

      // Ajouter à la liste
      setMessages(prev => [...prev, message]);

      // 🤖 GÉNÉRATION RÉPONSE IA AVEC CONTEXTE ENRICHI
      console.log(`🤖 [useAIConversation] Génération réponse avec ${currentProvider}...`);
      
      // Construire prompt système enrichi avec contextualAIService
      const conversationMetadata = currentConversation?.context_data || {};
      const currentPageContext = {
        page: pageContext?.page || conversationMetadata.page || 'Dashboard',
        section: pageContext?.section || conversationMetadata.section || 'general'
      };
      
      // 🎯 UTILISER contextualAIService AVEC TOUTES LES FONCTIONNALITÉS
      const systemPrompt = buildContextualPrompt(
        currentPageContext.page,
        userContext,
        conversationMetadata
      );
      
      console.log('📝 [useAIConversation] Prompt système enrichi avec contextualAIService:', {
        userName: userContext.userName,
        level: userContext.level,
        totalPoints: userContext.totalPoints,
        page: currentPageContext.page,
        promptLength: systemPrompt.length
      });
      
      // Construire historique pour contexte
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Ajouter le nouveau message utilisateur
      history.push({ role: 'user', content });

      // Générer réponse avec prompt enrichi
      const aiResponse = await generateResponse(
        content,
        history,
        systemPrompt
      );

      if (aiResponse.success) {
        console.log('✅ [useAIConversation] Réponse IA générée:', aiResponse.content.substring(0, 100));
        
        // Sauvegarder réponse IA
        const aiMessageResult = await aiConversationService.saveMessage(
          targetConvId,
          'assistant',
          aiResponse.content,
          'text',
          { 
            provider: currentProvider,
            usage: aiResponse.usage 
          }
        );

        if (aiMessageResult.success && aiMessageResult.message) {
          setMessages(prev => [...prev, aiMessageResult.message]);
        }
      } else {
        console.error('❌ [useAIConversation] Erreur génération IA:', aiResponse.error);
      }

      return message;
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError(err.message);
      throw err;
    } finally {
      setSending(false);
    }
  }, [currentConversation, messages, generateResponse, currentProvider]);

  /**
   * Envoyer message avec image(s)
   * @param {string} content - Contenu du message
   * @param {Array} images - Tableau d'images à uploader
   * @param {string} conversationId - ID conversation (optionnel, utilise currentConversation par défaut)
   * @param {object} userContext - Contexte utilisateur pour prompt enrichi
   */
  const sendMessageWithImages = useCallback(async (content, images, conversationId = null, userContext = {}) => {
    const targetConvId = conversationId || currentConversation?.id;
    
    if (!targetConvId) {
      throw new Error('Aucune conversation active');
    }

    try {
      setSending(true);
      setError(null);

      // Créer message
      const messageResult = await aiConversationService.saveMessage(
        targetConvId,
        'user',
        content,
        'image',
        { imageCount: images.length }
      );

      if (!messageResult.success || !messageResult.message) {
        throw new Error('Échec de sauvegarde du message');
      }

      const message = messageResult.message;

      // Upload images et créer attachments
      const uploadPromises = images.map(async (imageFile) => {
        // Upload image
        const uploadResult = await aiStorageService.uploadImage(
          imageFile,
          user.id,
          targetConvId,
          message.id
        );

        // Sauvegarder attachment
        await aiStorageService.saveAttachment(
          message.id,
          'image',
          uploadResult.path,
          uploadResult.originalName,
          uploadResult.size,
          uploadResult.type,
          uploadResult.width,
          uploadResult.height
        );

        return uploadResult;
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // Ajouter message avec attachments à la liste
      const messageWithAttachments = {
        ...message,
        attachments: uploadedImages.map((img, i) => ({
          type: 'image',
          file_path: img.path,
          file_name: img.originalName,
          file_size: img.size,
          width: img.width,
          height: img.height
        }))
      };

      setMessages(prev => [...prev, messageWithAttachments]);

      // 🤖 GÉNÉRATION RÉPONSE IA AVEC ANALYSE IMAGE CONTEXTUELLE
      console.log(`🤖 [useAIConversation] Analyse image avec ${currentProvider}...`);
      
      try {
        // Récupérer la première image en base64
        const firstImage = uploadedImages[0];
        if (firstImage && firstImage.base64) {
          // Construire prompt d'analyse enrichi
          const imagePrompt = buildImageAnalysisPrompt(userContext);
          console.log('📸 [useAIConversation] Prompt analyse image enrichi pour:', userContext.userName);
          
          // Analyser l'image avec prompt contextuel
          const imageAnalysis = await analyzeImage(
            firstImage.base64,
            content || imagePrompt
          );

          if (imageAnalysis.success) {
            console.log('✅ [useAIConversation] Analyse image générée');
            
            // Sauvegarder réponse IA
            const aiMessageResult = await aiConversationService.saveMessage(
              targetConvId,
              'assistant',
              imageAnalysis.content,
              'text',
              { 
                provider: currentProvider,
                usage: imageAnalysis.usage,
                visionUsed: imageAnalysis.visionUsed || false,
                fallbackUsed: imageAnalysis.fallbackUsed || false
              }
            );

            if (aiMessageResult.success && aiMessageResult.message) {
              setMessages(prev => [...prev, aiMessageResult.message]);
            }
          } else {
            console.error('❌ [useAIConversation] Erreur analyse image:', imageAnalysis.error);
          }
        }
      } catch (imageError) {
        console.error('❌ [useAIConversation] Erreur lors de l\'analyse d\'image:', imageError);
      }

      return messageWithAttachments;
    } catch (err) {
      console.error('Erreur envoi message avec images:', err);
      setError(err.message);
      throw err;
    } finally {
      setSending(false);
    }
  }, [currentConversation, user, analyzeImage, currentProvider]);

  /**
   * Sauvegarder réponse IA
   */
  const saveAIResponse = useCallback(async (content, contentType = 'text', metadata = null) => {
    if (!currentConversation) return;

    try {
      const message = await aiConversationService.saveMessage(
        currentConversation.id,
        'assistant',
        content,
        contentType,
        metadata
      );

      setMessages(prev => [...prev, message]);
      return message;
    } catch (err) {
      console.error('Erreur sauvegarde réponse IA:', err);
      setError(err.message);
      throw err;
    }
  }, [currentConversation]);

  /**
   * Modifier message
   */
  const editMessage = useCallback(async (messageId, newContent) => {
    try {
      const updatedMessage = await aiConversationService.editMessage(messageId, newContent);
      
      // Mettre à jour liste locale
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId ? { ...m, ...updatedMessage } : m
        )
      );

      return updatedMessage;
    } catch (err) {
      console.error('Erreur modification message:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Supprimer message
   */
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await aiConversationService.deleteMessage(messageId);
      
      // Retirer de la liste (ou marquer comme supprimé)
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Erreur suppression message:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MÉTHODES: RECHERCHE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Rechercher conversations
   */
  const searchConversations = useCallback(async (query) => {
    if (!user || !query) return [];

    try {
      const results = await aiConversationService.searchConversations(user.id, query);
      return results;
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError(err.message);
      return [];
    }
  }, [user]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RETOUR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return {
    // État conversations
    conversations,
    currentConversation,
    
    // État messages
    messages,
    
    // États UI
    loading,
    loadingMessages,
    sending,
    error,
    
    // Méthodes conversations
    loadConversations,
    loadConversation,
    createConversation,
    selectConversation,
    togglePinConversation,
    deleteConversation,
    
    // Méthodes messages
    sendMessage,
    sendMessageWithImages,
    saveAIResponse,
    editMessage,
    deleteMessage,
    
    // Méthodes recherche
    searchConversations,
    
    // Setters directs (si besoin)
    setCurrentConversation,
    setMessages,
    setError
  };
}

export default useAIConversation;
