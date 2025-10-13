# 🚀 PLAN - Intégration Claude AI

**Date**: 9 octobre 2025, 15:43  
**Objectif**: Ajouter Claude AI en parallèle de Gemini (multi-provider)

---

## 🎯 Objectifs

1. ✅ **Conserver Gemini** - Ne pas supprimer le système existant
2. ✅ **Ajouter Claude** - Nouvelle option disponible
3. ✅ **Sélecteur UI** - Permettre de choisir entre Gemini et Claude
4. ✅ **Architecture flexible** - Facile d'ajouter d'autres IA à l'avenir

---

## 📋 Architecture Multi-Provider

### **Structure des Fichiers**

```
src/
├── lib/
│   ├── geminiService.js          # ✅ Existe déjà
│   ├── claudeAIService.js         # 🆕 À créer
│   └── aiProviderConfig.js        # 🆕 Configuration providers
├── hooks/
│   ├── useAIConversation.js       # ✅ Existe (à modifier)
│   └── useMultiProviderAI.js      # 🆕 Logique multi-provider
└── components/
    ├── AIAssistantSidebar.jsx     # ✅ Existe (à modifier)
    └── AIProviderSelector.jsx     # 🆕 Sélecteur UI
```

---

## 🔧 Étape 1: Configuration Providers (5 min)

**Fichier** : `src/lib/aiProviderConfig.js`

```javascript
export const AI_PROVIDERS = {
  GEMINI: {
    id: 'gemini',
    name: 'Google Gemini 2.0',
    model: 'gemini-2.0-flash-exp',
    icon: '🔵',
    color: '#4285F4',
    capabilities: ['text', 'vision', 'streaming'],
    strengths: [
      'Analyse d\'images et OCR',
      'Réponses rapides',
      'Vision multimodale'
    ],
    apiKey: import.meta.env.VITE_GEMINI_API_KEY
  },
  CLAUDE: {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    model: 'claude-3-5-sonnet-20241022',
    icon: '🟣',
    color: '#6B46C1',
    capabilities: ['text', 'reasoning', 'analysis'],
    strengths: [
      'Raisonnement complexe',
      'Analyses approfondies',
      'Code review et explication'
    ],
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY
  }
};

export const DEFAULT_PROVIDER = 'gemini';
```

---

## 🤖 Étape 2: Service Claude AI (10 min)

**Fichier** : `src/lib/claudeAIService.js`

```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

const claudeAIService = {
  /**
   * Générer réponse texte
   */
  async generateResponse(prompt, conversationHistory = [], systemPrompt = null) {
    try {
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

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt || 'Tu es un assistant IA pédagogique...',
        messages
      });

      return {
        success: true,
        content: response.content[0].text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('[claudeAI] Erreur génération:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Analyser image (Claude ne supporte pas encore Vision API)
   */
  async analyzeImage(imageBase64, prompt) {
    return {
      success: false,
      error: 'Claude 3.5 ne supporte pas encore l\'analyse d\'images via API. Utilisez Gemini.'
    };
  }
};

export default claudeAIService;
```

---

## 🎛️ Étape 3: Hook Multi-Provider (10 min)

**Fichier** : `src/hooks/useMultiProviderAI.js`

```javascript
import { useState, useCallback } from 'react';
import geminiService from '../lib/geminiService';
import claudeAIService from '../lib/claudeAIService';
import { AI_PROVIDERS, DEFAULT_PROVIDER } from '../lib/aiProviderConfig';

export const useMultiProviderAI = () => {
  const [currentProvider, setCurrentProvider] = useState(DEFAULT_PROVIDER);

  /**
   * Obtenir le service actif
   */
  const getActiveService = useCallback(() => {
    return currentProvider === 'gemini' ? geminiService : claudeAIService;
  }, [currentProvider]);

  /**
   * Générer réponse avec le provider actif
   */
  const generateResponse = useCallback(async (prompt, history, systemPrompt) => {
    const service = getActiveService();
    return await service.generateResponse(prompt, history, systemPrompt);
  }, [getActiveService]);

  /**
   * Analyser image (force Gemini si Claude sélectionné)
   */
  const analyzeImage = useCallback(async (imageBase64, prompt) => {
    if (currentProvider === 'claude') {
      console.warn('⚠️ Claude ne supporte pas Vision API, utilisation de Gemini');
      return await geminiService.analyzeImage(imageBase64, prompt);
    }
    return await geminiService.analyzeImage(imageBase64, prompt);
  }, [currentProvider]);

  /**
   * Changer de provider
   */
  const switchProvider = useCallback((providerId) => {
    if (AI_PROVIDERS[providerId.toUpperCase()]) {
      setCurrentProvider(providerId);
      console.log('🔄 Provider changé:', providerId);
    }
  }, []);

  return {
    currentProvider,
    providers: AI_PROVIDERS,
    generateResponse,
    analyzeImage,
    switchProvider
  };
};
```

---

## 🎨 Étape 4: Sélecteur UI (5 min)

**Fichier** : `src/components/AIProviderSelector.jsx`

```javascript
import React from 'react';
import { AI_PROVIDERS } from '../lib/aiProviderConfig';

const AIProviderSelector = ({ currentProvider, onProviderChange }) => {
  const providers = Object.values(AI_PROVIDERS);

  return (
    <div className="ai-provider-selector">
      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        Modèle IA
      </label>
      <select
        value={currentProvider}
        onChange={(e) => onProviderChange(e.target.value)}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
      >
        {providers.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.icon} {provider.name}
          </option>
        ))}
      </select>
      
      {/* Info sur le provider actif */}
      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
        <p className="font-semibold mb-1">Points forts :</p>
        <ul className="space-y-1">
          {AI_PROVIDERS[currentProvider.toUpperCase()].strengths.map((strength, i) => (
            <li key={i} className="flex items-start gap-1">
              <span>•</span>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AIProviderSelector;
```

---

## 🔄 Étape 5: Modifier AIAssistantSidebar (5 min)

**Modifications** :

1. Importer `useMultiProviderAI` et `AIProviderSelector`
2. Remplacer appels directs à `geminiService` par `generateResponse` du hook
3. Ajouter le sélecteur dans l'UI

```javascript
// Imports
import { useMultiProviderAI } from '../hooks/useMultiProviderAI';
import AIProviderSelector from './AIProviderSelector';

// Dans le composant
const {
  currentProvider,
  generateResponse,
  analyzeImage,
  switchProvider
} = useMultiProviderAI();

// Dans le JSX (après le titre)
<AIProviderSelector
  currentProvider={currentProvider}
  onProviderChange={switchProvider}
/>

// Remplacer geminiService.generateResponse par generateResponse
```

---

## 📦 Étape 6: Installer Package Claude (1 min)

```bash
npm install @anthropic-ai/sdk
```

---

## 🔑 Étape 7: Variables d'Environnement (1 min)

**Fichier** : `.env`

```env
# Gemini (existe déjà)
VITE_GEMINI_API_KEY=votre_clé_gemini

# Claude (nouveau)
VITE_CLAUDE_API_KEY=votre_clé_claude
```

---

## 🧪 Étape 8: Tests (5 min)

### **Test 1: Sélection Provider**
- Ouvrir Coach IA
- Vérifier que "🔵 Gemini 2.0" est sélectionné par défaut
- Changer pour "🟣 Claude 3.5"
- Vérifier que les "Points forts" changent

### **Test 2: Message avec Gemini**
- Sélectionner Gemini
- Envoyer "Explique la photosynthèse"
- Vérifier réponse

### **Test 3: Message avec Claude**
- Sélectionner Claude
- Envoyer "Analyse ce code: const x = [1,2,3].map(n => n*2)"
- Vérifier réponse

### **Test 4: Image avec Claude**
- Sélectionner Claude
- Ajouter image + "Analyse cette image"
- Vérifier warning: "Claude ne supporte pas Vision, utilisation Gemini"
- Vérifier que l'analyse fonctionne quand même

---

## 📊 Récapitulatif

| Étape | Tâche | Temps | Fichier |
|-------|-------|-------|---------|
| 1 | Configuration | 5 min | `aiProviderConfig.js` |
| 2 | Service Claude | 10 min | `claudeAIService.js` |
| 3 | Hook multi-provider | 10 min | `useMultiProviderAI.js` |
| 4 | Sélecteur UI | 5 min | `AIProviderSelector.jsx` |
| 5 | Modifier Sidebar | 5 min | `AIAssistantSidebar.jsx` |
| 6 | Install package | 1 min | Terminal |
| 7 | Variables env | 1 min | `.env` |
| 8 | Tests | 5 min | Application |
| **TOTAL** | **~42 min** | | **7 fichiers** |

---

## 🎯 Résultat Final

```
┌─────────────────────────────────────────┐
│ Coach IA                            [X] │
├─────────────────────────────────────────┤
│ Modèle IA                               │
│ [🔵 Gemini 2.0        ▼]               │
│                                         │
│ Points forts :                          │
│ • Analyse d'images et OCR               │
│ • Réponses rapides                      │
│ • Vision multimodale                    │
├─────────────────────────────────────────┤
│ Messages...                             │
└─────────────────────────────────────────┘
```

---

## 🚀 Prêt à Commencer ?

**Donnez-moi votre clé API Claude** et je commence l'implémentation ! 🎯

**Format attendu** :
```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Une fois que je l'ai, je crée les 7 fichiers en ~5 minutes ! ⚡
