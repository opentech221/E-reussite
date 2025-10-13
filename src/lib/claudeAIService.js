/**
 * CLAUDE AI SERVICE
 * Service d'interaction avec l'API Claude d'Anthropic
 * Documentation: https://docs.claude.com
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialisation client Anthropic
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true // ⚠️ Pour développement uniquement
});

const claudeAIService = {
  /**
   * Générer une réponse texte avec Claude
   * @param {string} prompt - Prompt utilisateur
   * @param {Array} conversationHistory - Historique conversation [{role, content}]
   * @param {string} systemPrompt - Prompt système (contexte)
   * @returns {Promise<Object>} {success, content, usage}
   */
  async generateResponse(prompt, conversationHistory = [], systemPrompt = null) {
    try {
      console.log('🟣 [claudeAI] Génération réponse...', {
        promptLength: prompt.length,
        historyLength: conversationHistory.length
      });

      // Construire les messages pour Claude
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        {
          role: 'user',
          content: prompt
        }
      ];

      // Prompt système par défaut si non fourni
      const defaultSystemPrompt = `Tu es un assistant IA pédagogique intelligent et bienveillant.

Tu aides les étudiants à :
- Comprendre des concepts complexes
- Réviser leurs cours
- Résoudre des problèmes
- Améliorer leurs compétences

Règles :
- Réponds de manière claire et structurée
- Utilise des exemples concrets
- Encourage l'apprentissage actif
- Adapte ton niveau au contexte
- Sois patient et pédagogue`;

      // Appel API Claude
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt || defaultSystemPrompt,
        messages
      });

      console.log('✅ [claudeAI] Réponse générée:', {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      });

      return {
        success: true,
        content: response.content[0].text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        },
        provider: 'claude',
        model: response.model
      };
    } catch (error) {
      console.error('❌ [claudeAI] Erreur génération:', error);
      
      // Gestion erreurs spécifiques
      if (error.status === 401) {
        return {
          success: false,
          error: 'Clé API Claude invalide. Vérifiez VITE_CLAUDE_API_KEY dans .env'
        };
      }
      
      if (error.status === 429) {
        return {
          success: false,
          error: 'Limite de requêtes atteinte. Réessayez dans quelques instants.'
        };
      }

      return {
        success: false,
        error: error.message || 'Erreur inconnue lors de l\'appel à Claude AI'
      };
    }
  },

  /**
   * Analyser une image
   * ⚠️ Claude 3.5 ne supporte pas encore Vision API via SDK
   * Cette méthode retourne une erreur et suggère d'utiliser Gemini
   * 
   * @param {string} imageBase64 - Image en base64
   * @param {string} prompt - Question sur l'image
   * @returns {Promise<Object>} {success: false, error, suggestion}
   */
  async analyzeImage(imageBase64, prompt) {
    console.warn('⚠️ [claudeAI] Vision API non supportée');
    
    return {
      success: false,
      error: 'Claude 3.5 ne supporte pas encore l\'analyse d\'images via l\'API.',
      suggestion: 'Utilisez Gemini pour l\'analyse d\'images. Le système basculera automatiquement.',
      fallbackProvider: 'gemini'
    };
  },

  /**
   * Générer un stream de réponse (future feature)
   * @param {string} prompt - Prompt utilisateur
   * @param {Function} onChunk - Callback pour chaque chunk
   * @returns {Promise<Object>}
   */
  async generateStreamingResponse(prompt, onChunk) {
    try {
      const stream = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      });

      let fullContent = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const text = chunk.delta.text;
          fullContent += text;
          if (onChunk) onChunk(text);
        }
      }

      return {
        success: true,
        content: fullContent,
        provider: 'claude'
      };
    } catch (error) {
      console.error('❌ [claudeAI] Erreur streaming:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Vérifier la validité de la clé API
   * @returns {Promise<boolean>}
   */
  async verifyApiKey() {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }]
      });
      
      console.log('✅ [claudeAI] Clé API valide');
      return true;
    } catch (error) {
      console.error('❌ [claudeAI] Clé API invalide:', error.message);
      return false;
    }
  }
};

export default claudeAIService;
