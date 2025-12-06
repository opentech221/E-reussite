/**
 * GEMINI AI SERVICE
 * Service utilisant l'API REST v1 pour gemini-1.5-flash
 */

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.model = 'gemini-1.5-flash-latest';
    this.apiUrl = `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent`;
    
    if (!this.apiKey) {
      console.warn('⚠️ [Gemini] Clé API Gemini manquante');
      return;
    }
    
    console.log('✅ [Gemini] Service initialisé (gemini-1.5-flash-latest via API v1)');
  }

  /**
   * Générer une réponse textuelle
   * @param {string} prompt - Le prompt utilisateur
   * @param {Array} conversationHistory - Historique de la conversation
   * @param {string} systemPrompt - Prompt système (optionnel)
   * @returns {Promise<Object>} { success, content, usage, provider }
   */
  async generateResponse(prompt, conversationHistory = [], systemPrompt = null) {
    if (!this.apiKey) {
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

      // Construction des messages
      const contents = [];
      
      // Ajouter le system prompt si présent
      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: systemPrompt }]
        });
        contents.push({
          role: 'model',
          parts: [{ text: 'Compris, je vais suivre ces instructions.' }]
        });
      }

      // Ajouter l'historique
      conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });

      // Ajouter le prompt actuel
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      // Appel API REST v1
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Usage tokens
      const usage = {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
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
    if (!this.apiKey) {
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
          data: imageBase64.split(',')[1] || imageBase64,
          mimeType: 'image/jpeg'
        }
      };

      // Appel API REST v1 avec vision
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              imagePart
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 32,
            topP: 0.9,
            maxOutputTokens: 4096,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const usage = {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
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
    return !!this.apiKey;
  }

  /**
   * Obtenir les infos du modèle
   * @returns {Object}
   */
  getModelInfo() {
    return {
      provider: 'gemini',
      model: 'gemini-1.5-flash-latest',
      capabilities: ['text', 'vision', 'streaming'],
      available: this.isAvailable()
    };
  }
}

// Export singleton
const geminiService = new GeminiService();
export default geminiService;
