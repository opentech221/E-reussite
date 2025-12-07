/**
 * PERPLEXITY AI SERVICE
 * Service pour Perplexity Sonar Pro (mode conversation)
 * 
 * ⚠️ Ce service est pour le CHAT/CONVERSATION uniquement
 * Pour la recherche web, voir PerplexitySearchMode.jsx
 */

class PerplexityAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.baseURL = `${this.supabaseUrl}/functions/v1/perplexity-search`; // Edge Function Supabase
    this.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    this.model = 'sonar-pro';
    
    console.log('🟢 [Perplexity Service] Initialisé pour conversation');
  }

  /**
   * Vérifier si le service est disponible
   */
  isAvailable() {
    const available = !!this.apiKey;
    if (!available) {
      console.warn('⚠️ [Perplexity] Clé API manquante');
    }
    return available;
  }

  /**
   * Générer une réponse en mode conversation
   * 
   * @param {string} prompt - Prompt utilisateur
   * @param {Array} conversationHistory - Historique (format: [{role, content}])
   * @param {string} systemPrompt - Prompt système (optionnel)
   * @returns {Promise<Object>}
   */
  async generateResponse(prompt, conversationHistory = [], systemPrompt = null) {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Clé API Perplexity manquante'
      };
    }

    try {
      console.log('🟢 [Perplexity] Génération réponse conversation...', {
        promptLength: prompt.length,
        historyLength: conversationHistory.length
      });

      // Construire les messages
      const messages = [];

      // Ajouter le system prompt si fourni
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      // Ajouter l'historique (limité aux 10 derniers messages)
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);

      // Ajouter le message actuel
      messages.push({
        role: 'user',
        content: prompt
      });

      // Appel à l'API via Edge Function Supabase
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.anonKey}`
        },
        body: JSON.stringify({
          query: prompt,
          context: conversationHistory.length > 0 
            ? conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n') 
            : undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Perplexity] Erreur API:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Extraire le contenu de la réponse de l'Edge Function
      const content = data.answer || '';
      const citations = data.citations || [];

      console.log('✅ [Perplexity] Réponse générée', {
        contentLength: content.length,
        citationsCount: citations.length
      });

      return {
        success: true,
        content: content, // Changé de 'text' à 'content' pour compatibilité
        citations: citations,
        model: data.model || this.model,
        provider: 'perplexity',
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0
        }
      };

    } catch (error) {
      console.error('❌ [Perplexity] Erreur:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'appel à Perplexity'
      };
    }
  }

  /**
   * Analyser une image
   * ⚠️ Perplexity ne supporte PAS Vision API
   * Force fallback vers Gemini
   */
  async analyzeImage(imageBase64, prompt) {
    console.warn('⚠️ [Perplexity] Vision non supporté, fallback requis');
    return {
      success: false,
      error: 'Perplexity ne supporte pas l\'analyse d\'images',
      requiresFallback: true
    };
  }

  /**
   * Obtenir les informations du modèle
   */
  getModelInfo() {
    return {
      id: 'perplexity',
      name: 'Perplexity Sonar Pro',
      model: this.model,
      icon: '🟢',
      capabilities: ['text', 'conversation', 'citations'],
      limitations: ['no-vision', 'no-streaming'],
      available: this.isAvailable()
    };
  }
}

// Instance singleton
const perplexityAIService = new PerplexityAIService();

export default perplexityAIService;
