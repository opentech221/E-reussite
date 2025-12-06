/**
 * GEMINI AI SERVICE
 * Service dédié pour Google Gemini 2.0 Flash
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ [Gemini] Clé API Gemini manquante');
      this.genAI = null;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });
      
      console.log('✅ [Gemini] Service initialisé (gemini-2.0-flash-exp)');
    } catch (error) {
      console.error('❌ [Gemini] Erreur initialisation:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  /**
   * Générer une réponse textuelle
   * @param {string} prompt - Le prompt utilisateur
   * @param {Array} conversationHistory - Historique de la conversation
   * @param {string} systemPrompt - Prompt système (optionnel)
   * @returns {Promise<Object>} { success, content, usage, provider }
   */
  async generateResponse(prompt, conversationHistory = [], systemPrompt = null) {
    if (!this.model) {
      return {
        success: false,
        error: 'Service Gemini non initialisé',
        provider: 'gemini'
      };
    }

    try {
      console.log('🔵 [Gemini] Génération réponse...', {
        promptLength: prompt.length,
        historyLength: conversationHistory.length
      });

      // Construction du prompt complet
      let fullPrompt = '';
      
      if (systemPrompt) {
        fullPrompt += `${systemPrompt}\n\n`;
      }

      // Ajouter l'historique
      if (conversationHistory.length > 0) {
        fullPrompt += 'Historique de conversation:\n';
        conversationHistory.forEach(msg => {
          const role = msg.role === 'user' ? 'Utilisateur' : 'Assistant';
          fullPrompt += `${role}: ${msg.content}\n`;
        });
        fullPrompt += '\n';
      }

      fullPrompt += `Utilisateur: ${prompt}\nAssistant:`;

      // Génération
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      // Usage tokens (estimation pour Gemini)
      const usage = {
        inputTokens: Math.ceil(fullPrompt.length / 4),
        outputTokens: Math.ceil(text.length / 4),
        totalTokens: Math.ceil((fullPrompt.length + text.length) / 4)
      };

      console.log('✅ [Gemini] Réponse générée', {
        responseLength: text.length,
        usage
      });

      return {
        success: true,
        content: text,
        usage,
        provider: 'gemini'
      };

    } catch (error) {
      console.error('❌ [Gemini] Erreur génération:', error);
      return {
        success: false,
        error: error.message,
        provider: 'gemini'
      };
    }
  }

  /**
   * Analyser une image avec Gemini Vision
   * @param {string} imageBase64 - Image en base64
   * @param {string} prompt - Question sur l'image
   * @returns {Promise<Object>} { success, content, usage, provider }
   */
  async analyzeImage(imageBase64, prompt = "Décris cette image en détail") {
    if (!this.model) {
      return {
        success: false,
        error: 'Service Gemini non initialisé',
        provider: 'gemini'
      };
    }

    try {
      console.log('📸 [Gemini Vision] Analyse image...', {
        promptLength: prompt.length,
        imageSize: imageBase64.length
      });

      // Préparer l'image pour Gemini
      const imagePart = {
        inlineData: {
          data: imageBase64.split(',')[1] || imageBase64, // Supprimer le préfixe data:image/...
          mimeType: 'image/jpeg'
        }
      };

      // Génération avec vision
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();

      const usage = {
        inputTokens: Math.ceil((prompt.length + imageBase64.length / 10) / 4),
        outputTokens: Math.ceil(text.length / 4),
        totalTokens: Math.ceil((prompt.length + imageBase64.length / 10 + text.length) / 4)
      };

      console.log('✅ [Gemini Vision] Analyse terminée', {
        responseLength: text.length,
        usage
      });

      return {
        success: true,
        content: text,
        usage,
        provider: 'gemini',
        visionUsed: true
      };

    } catch (error) {
      console.error('❌ [Gemini Vision] Erreur analyse:', error);
      return {
        success: false,
        error: error.message,
        provider: 'gemini'
      };
    }
  }

  /**
   * Vérifier la disponibilité du service
   * @returns {boolean}
   */
  isAvailable() {
    return this.model !== null;
  }

  /**
   * Obtenir les infos du modèle
   * @returns {Object}
   */
  getModelInfo() {
    return {
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      capabilities: ['text', 'vision', 'streaming'],
      available: this.isAvailable()
    };
  }
}

// Export singleton
const geminiService = new GeminiService();
export default geminiService;
