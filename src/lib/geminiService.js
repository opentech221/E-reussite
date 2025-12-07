/**
 * GEMINI AI SERVICE - DÉSACTIVÉ
 * Google a déprécié gemini-pro et les autres modèles stables
 * Utiliser Claude AI ou Perplexity à la place
 */

class GeminiService {
  constructor() {
    this.apiKey = null;
    this.model = 'gemini-pro';
    this.apiUrl = null;
    
    console.warn('⚠️ [Gemini] Service désactivé - modèles Gemini dépréciés, utiliser Claude AI');
  }

  /**
   * Générer une réponse textuelle
   * @returns {Promise<Object>}
   */
  async generateResponse(prompt, conversationHistory = [], systemPrompt = null) {
    return {
      success: false,
      error: 'Service Gemini désactivé - utiliser Claude AI ou Perplexity',
      provider: 'gemini'
    };
  }

  /**
   * Analyser une image
   * @returns {Promise<Object>}
   */
  async analyzeImage(imageBase64, prompt = "Décris cette image en détail") {
    return {
      success: false,
      error: 'Service Gemini désactivé - utiliser Claude AI',
      provider: 'gemini'
    };
  }

  /**
   * Vérifier la disponibilité du service
   * @returns {boolean}
   */
  isAvailable() {
    return false;
  }

  /**
   * Obtenir les infos du modèle
   * @returns {Object}
   */
  getModelInfo() {
    return {
      provider: 'gemini',
      model: 'disabled',
      capabilities: [],
      available: false
    };
  }
}

// Export singleton
const geminiService = new GeminiService();
export default geminiService;
