// ============================================================================
// SERVICE PERPLEXITY - Recherche & IA avancée
// Date: 10 octobre 2025
// Version: 2.0 - Utilise Supabase Edge Function (résout CORS)
// ============================================================================

import { supabase } from '@/lib/customSupabaseClient';

/**
 * Poser une question avec recherche web via Supabase Edge Function
 * @param {string} question - Question de l'élève
 * @param {object} context - Contexte utilisateur
 * @returns {Promise<object>} - Réponse avec sources
 */
export async function askWithWebSearch(question, context = {}) {
  try {
    console.log('🔍 [Perplexity] Envoi requête via Edge Function:', question);

    // Appel à la Edge Function Supabase
    const { data, error } = await supabase.functions.invoke('perplexity-search', {
      body: {
        query: question,
        context: {
          subject: context.subject || 'général',
          level: context.level || 'BFEM'
        }
      }
    });

    if (error) {
      console.error('❌ [Perplexity] Erreur Edge Function:', error);
      throw new Error(error.message || 'Erreur lors de la recherche');
    }

    console.log('✅ [Perplexity] Réponse reçue avec', data.citations?.length || 0, 'sources');

    return {
      answer: data.answer,
      citations: data.citations || [],
      model: data.model || 'sonar-medium-online',
      timestamp: data.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [Perplexity] Erreur:', error);
    throw error;
  }
}

/**
 * Veille automatique sur programmes scolaires
 * @returns {Promise<array>} - Mises à jour détectées
 */
export async function checkEducationUpdates() {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const response = await perplexity.chat.completions.create({
      model: 'sonar-small-online',
      messages: [
        {
          role: 'user',
          content: `Recherche les dernières actualités et réformes sur:
                    - Programmes BFEM et BAC Sénégal
                    - Nouvelles épreuves ou changements examens
                    - Annonces Ministère de l'Éducation
                    Liste uniquement les changements concrets depuis hier.`
        }
      ],
      search_domain_filter: ['education.gouv.sn', 'seneweb.com'],
      search_recency_filter: 'day'
    });

    const updates = response.choices[0].message.content;
    const citations = response.citations || [];

    console.log('🔍 [Perplexity] Veille éducative:', citations.length, 'sources trouvées');

    return {
      hasUpdates: citations.length > 0,
      content: updates,
      sources: citations,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ [Perplexity] Erreur veille:', error);
    throw error;
  }
}

/**
 * Générer une leçon enrichie avec sources
 * @param {string} topic - Sujet de la leçon
 * @param {string} level - Niveau (BFEM/BAC)
 * @returns {Promise<object>} - Contenu de la leçon
 */
export async function generateLesson(topic, level) {
  try {
    const response = await perplexity.chat.completions.create({
      model: 'sonar-medium-online',
      messages: [
        {
          role: 'user',
          content: `Crée un plan de cours détaillé sur: "${topic}"
                    Niveau: ${level}
                    
                    Structure requise:
                    1. Objectifs pédagogiques (3-5 points)
                    2. Introduction (contexte et importance)
                    3. Développement en 3 parties
                       - Partie 1: Concepts fondamentaux
                       - Partie 2: Applications pratiques
                       - Partie 3: Exemples sénégalais
                    4. Exercices d'application (5 questions)
                    5. Ressources complémentaires
                    
                    Utilise des exemples concrets du Sénégal.
                    Cite toutes les sources utilisées.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      search_domain_filter: ['*.edu', 'education.gouv.sn', 'wikipedia.org'],
      // Deep Research mode pour analyse approfondie
      reasoning_effort: 'high'
    });

    const content = response.choices[0].message.content;
    const sources = response.citations || [];

    console.log('📚 [Perplexity] Leçon générée avec', sources.length, 'sources');

    return {
      topic,
      level,
      content,
      sources,
      generatedAt: new Date().toISOString(),
      verified: false, // À valider par un enseignant
      model: 'sonar-medium-online'
    };
  } catch (error) {
    console.error('❌ [Perplexity] Erreur génération leçon:', error);
    throw error;
  }
}

/**
 * Recherche avancée pour élèves
 * @param {string} query - Requête de recherche
 * @param {object} filters - Filtres de recherche
 * @returns {Promise<object>} - Résultats de recherche
 */
export async function advancedSearch(query, filters = {}) {
  try {
    const response = await perplexity.chat.completions.create({
      model: 'sonar-small-online',
      messages: [
        {
          role: 'user',
          content: `Recherche: "${query}"
                    Fournis un résumé structuré avec les meilleurs résultats.
                    Inclus des liens vers les sources.`
        }
      ],
      max_tokens: 1500,
      search_domain_filter: filters.domains || [
        'education.gouv.sn',
        '*.edu',
        'wikipedia.org'
      ],
      search_recency_filter: filters.recency || 'year',
      ...(filters.dateFrom && { search_after_date_filter: filters.dateFrom }),
      ...(filters.dateTo && { search_before_date_filter: filters.dateTo })
    });

    const results = response.choices[0].message.content;
    const sources = response.citations || [];

    console.log('🔍 [Perplexity] Recherche:', sources.length, 'sources trouvées');

    return {
      query,
      results,
      sources,
      searchedAt: new Date().toISOString(),
      filters
    };
  } catch (error) {
    console.error('❌ [Perplexity] Erreur recherche:', error);
    throw error;
  }
}

/**
 * Générer un quiz à partir d'un contenu
 * @param {string} content - Contenu du cours
 * @param {number} numQuestions - Nombre de questions
 * @returns {Promise<array>} - Questions générées
 */
export async function generateQuiz(content, numQuestions = 10) {
  try {
    const response = await perplexity.chat.completions.create({
      model: 'sonar-small-online',
      messages: [
        {
          role: 'user',
          content: `À partir de ce contenu de cours:
                    """
                    ${content.substring(0, 2000)}
                    """
                    
                    Génère ${numQuestions} questions QCM.
                    Format JSON strict:
                    {
                      "questions": [
                        {
                          "question": "Texte de la question",
                          "options": ["Option A", "Option B", "Option C", "Option D"],
                          "correct": 0,
                          "explanation": "Explication de la réponse",
                          "difficulty": "facile|moyen|difficile"
                        }
                      ]
                    }
                    
                    Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.5
    });

    const jsonText = response.choices[0].message.content;
    const quizData = JSON.parse(jsonText);

    console.log('🎯 [Perplexity] Quiz généré:', quizData.questions.length, 'questions');

    return quizData.questions;
  } catch (error) {
    console.error('❌ [Perplexity] Erreur génération quiz:', error);
    throw error;
  }
}

export default {
  askWithWebSearch,
  checkEducationUpdates,
  generateLesson,
  advancedSearch,
  generateQuiz
};
