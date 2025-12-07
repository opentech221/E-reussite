/**
 * CONFIGURATION MULTI-PROVIDER AI
 * Configuration centralisée pour Gemini, Claude AI et Perplexity
 */

export const AI_PROVIDERS = {
  GEMINI: {
    id: 'gemini',
    name: 'Google Gemini (Désactivé)',
    model: 'disabled',
    icon: '🔵',
    color: '#4285F4',
    capabilities: [],
    strengths: [
      'Analyse d\'images et OCR',
      'Détection d\'objets visuels',
      'Réponses rapides',
      'Vision multimodale'
    ],
    limitations: [],
    maxTokens: 8192,
    apiKey: import.meta.env.VITE_GEMINI_API_KEY
  },
  CLAUDE: {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    model: 'claude-3-5-sonnet-20241022',
    icon: '🟣',
    color: '#6B46C1',
    capabilities: ['text', 'reasoning', 'analysis', 'coding'],
    strengths: [
      'Raisonnement complexe',
      'Analyses approfondies',
      'Code review et débogage',
      'Explications détaillées'
    ],
    limitations: [
      'Pas de support Vision API (utilise Gemini auto)'
    ],
    maxTokens: 8192,
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY
  },
  PERPLEXITY: {
    id: 'perplexity',
    name: 'Perplexity Sonar Pro',
    model: 'sonar-pro',
    icon: '🟢',
    color: '#20BBBC',
    capabilities: ['text', 'citations', 'web-search'],
    strengths: [
      'Recherche web en temps réel',
      'Citations et sources vérifiées',
      'Informations actualisées',
      'Réponses avec liens externes'
    ],
    limitations: [
      'Pas de support Vision API',
      'Optimisé pour recherche factuelle'
    ],
    maxTokens: 4096,
    apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY
  }
};

/**
 * Provider par défaut
 */
export const DEFAULT_PROVIDER = 'perplexity';

/**
 * Obtenir la configuration d'un provider
 */
export const getProviderConfig = (providerId) => {
  const upperProviderId = providerId?.toUpperCase();
  return AI_PROVIDERS[upperProviderId] || AI_PROVIDERS.PERPLEXITY;
};

/**
 * Vérifier si un provider supporte une capacité
 */
export const hasCapability = (providerId, capability) => {
  const config = getProviderConfig(providerId);
  return config.capabilities.includes(capability);
};

/**
 * Obtenir le meilleur provider pour une tâche
 */
export const getBestProviderForTask = (taskType) => {
  switch (taskType) {
    case 'vision':
    case 'image-analysis':
    case 'ocr':
      return 'gemini'; // Seul Gemini supporte Vision
    
    case 'reasoning':
    case 'code-review':
    case 'deep-analysis':
      return 'claude'; // Claude meilleur pour raisonnement
    
    case 'web-search':
    case 'citations':
    case 'factual-research':
      return 'perplexity'; // Perplexity pour recherche web
    
    case 'quick-response':
    default:
      return 'gemini'; // Gemini plus rapide par défaut
  }
};

/**
 * Liste des providers disponibles
 */
export const getAvailableProviders = () => {
  return Object.values(AI_PROVIDERS);
};
