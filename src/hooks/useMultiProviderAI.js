/**
 * HOOK MULTI-PROVIDER AI
 * Gestion de plusieurs providers IA (Gemini, Claude, Perplexity)
 */

import { useState, useCallback, useEffect } from 'react';
import geminiService from '../lib/geminiService';
import claudeAIService from '../lib/claudeAIService';
import perplexityAIService from '../lib/perplexityAIService';
import { AI_PROVIDERS, DEFAULT_PROVIDER, getBestProviderForTask } from '../lib/aiProviderConfig';

export const useMultiProviderAI = () => {
  const [currentProvider, setCurrentProvider] = useState(DEFAULT_PROVIDER);
  const [providerStatus, setProviderStatus] = useState({
    gemini: 'unknown',
    claude: 'unknown',
    perplexity: 'unknown'
  });

  /**
   * Vérifier la disponibilité des providers au chargement
   */
  useEffect(() => {
    const checkProviders = async () => {
      // Vérifier Gemini
      try {
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        setProviderStatus(prev => ({
          ...prev,
          gemini: geminiKey ? 'available' : 'no-key'
        }));
      } catch (error) {
        setProviderStatus(prev => ({ ...prev, gemini: 'error' }));
      }

      // Vérifier Claude
      try {
        const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;
        setProviderStatus(prev => ({
          ...prev,
          claude: claudeKey ? 'available' : 'no-key'
        }));
      } catch (error) {
        setProviderStatus(prev => ({ ...prev, claude: 'error' }));
      }

      // Vérifier Perplexity
      try {
        const perplexityKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
        setProviderStatus(prev => ({
          ...prev,
          perplexity: perplexityKey ? 'available' : 'no-key'
        }));
      } catch (error) {
        setProviderStatus(prev => ({ ...prev, perplexity: 'error' }));
      }
    };

    checkProviders();
  }, []);

  /**
   * Obtenir le service actif
   */
  const getActiveService = useCallback(() => {
    switch (currentProvider) {
      case 'claude':
        return claudeAIService;
      case 'perplexity':
        return perplexityAIService;
      case 'gemini':
      default:
        return geminiService;
    }
  }, [currentProvider]);

  /**
   * Obtenir la configuration du provider actif
   */
  const getActiveProviderConfig = useCallback(() => {
    return AI_PROVIDERS[currentProvider.toUpperCase()];
  }, [currentProvider]);

  /**
   * Générer réponse avec le provider actif
   * @param {string} prompt - Prompt utilisateur
   * @param {Array} conversationHistory - Historique conversation
   * @param {string} systemPrompt - Prompt système
   * @returns {Promise<Object>}
   */
  const generateResponse = useCallback(async (prompt, conversationHistory = [], systemPrompt = null) => {
    console.log(`🤖 [useMultiProviderAI] Génération avec ${currentProvider}`, {
      promptLength: prompt.length,
      historyLength: conversationHistory.length
    });

    try {
      const service = getActiveService();
      const result = await service.generateResponse(prompt, conversationHistory, systemPrompt);
      
      if (!result.success) {
        console.error(`❌ [${currentProvider}] Erreur:`, result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ [useMultiProviderAI] Erreur ${currentProvider}:`, error);
      return {
        success: false,
        error: `Erreur lors de l'appel à ${currentProvider}: ${error.message}`
      };
    }
  }, [currentProvider, getActiveService]);

  /**
   * Analyser image
   * ⚠️ Force Gemini si Claude/Perplexity sélectionné (seul Gemini supporte Vision)
   * 
   * @param {string} imageBase64 - Image en base64
   * @param {string} prompt - Question sur l'image
   * @returns {Promise<Object>}
   */
  const analyzeImage = useCallback(async (imageBase64, prompt) => {
    console.log('📸 [useMultiProviderAI] Analyse image demandée');

    // Si Claude ou Perplexity sélectionné, basculer automatiquement sur Gemini
    if (currentProvider === 'claude' || currentProvider === 'perplexity') {
      console.warn(`⚠️ [useMultiProviderAI] ${currentProvider} ne supporte pas Vision, utilisation de Gemini`);
      const result = await geminiService.analyzeImage(imageBase64, prompt);
      return {
        ...result,
        fallbackUsed: true,
        originalProvider: currentProvider,
        usedProvider: 'gemini'
      };
    }

    // Utiliser Gemini normalement
    return await geminiService.analyzeImage(imageBase64, prompt);
  }, [currentProvider]);

  /**
   * Changer de provider
   * @param {string} providerId - ID du provider ('gemini' | 'claude')
   */
  const switchProvider = useCallback((providerId) => {
    const providerIdLower = providerId.toLowerCase();
    
    if (AI_PROVIDERS[providerId.toUpperCase()]) {
      // Vérifier si le provider a une clé API
      const status = providerStatus[providerIdLower];
      
      if (status === 'no-key') {
        console.warn(`⚠️ [useMultiProviderAI] ${providerId} n'a pas de clé API configurée`);
        return false;
      }

      setCurrentProvider(providerIdLower);
      console.log(`🔄 [useMultiProviderAI] Provider changé: ${providerIdLower}`);
      return true;
    }
    
    console.error(`❌ [useMultiProviderAI] Provider inconnu: ${providerId}`);
    return false;
  }, [providerStatus]);

  /**
   * Obtenir le meilleur provider pour une tâche
   * @param {string} taskType - Type de tâche ('vision', 'reasoning', etc.)
   * @returns {string} Provider recommandé
   */
  const getRecommendedProvider = useCallback((taskType) => {
    return getBestProviderForTask(taskType);
  }, []);

  /**
   * Basculer automatiquement sur le meilleur provider pour une tâche
   * @param {string} taskType - Type de tâche
   * @returns {boolean} True si changement effectué
   */
  const autoSwitchForTask = useCallback((taskType) => {
    const recommended = getRecommendedProvider(taskType);
    if (recommended !== currentProvider) {
      console.log(`🔄 [useMultiProviderAI] Auto-switch: ${currentProvider} → ${recommended} (task: ${taskType})`);
      return switchProvider(recommended);
    }
    return false;
  }, [currentProvider, getRecommendedProvider, switchProvider]);

  /**
   * Obtenir les providers disponibles
   */
  const availableProviders = useCallback(() => {
    return Object.values(AI_PROVIDERS).filter(provider => {
      const status = providerStatus[provider.id];
      return status === 'available';
    });
  }, [providerStatus]);

  return {
    // État
    currentProvider,
    providerStatus,
    providers: AI_PROVIDERS,
    
    // Configuration
    getActiveProviderConfig,
    
    // Méthodes principales
    generateResponse,
    analyzeImage,
    
    // Gestion providers
    switchProvider,
    getRecommendedProvider,
    autoSwitchForTask,
    availableProviders
  };
};

export default useMultiProviderAI;
