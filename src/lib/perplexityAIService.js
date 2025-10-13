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
    this.baseURL = '/api/perplexity-search'; // Edge Function proxy
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

      // Appel à l'API via Edge Function
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 2048,
          temperature: 0.7,
          // ⚠️ PAS de return_citations pour mode conversation
          // ⚠️ PAS de return_images
          // ⚠️ PAS de search_recency_filter
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Perplexity] Erreur API:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Extraire le contenu de la réponse
      const content = data.choices?.[0]?.message?.content || '';

      console.log('✅ [Perplexity] Réponse générée', {
        contentLength: content.length
      });

      return {
        success: true,
        text: content,
        model: this.model,
        provider: 'perplexity',
        usage: data.usage || {}
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
