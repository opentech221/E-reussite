# 🟢 INTÉGRATION PERPLEXITY SONAR PRO - Multi-Provider

**Date**: 10 octobre 2025  
**Objectif**: Ajouter Perplexity Sonar Pro aux côtés de Gemini et Claude

---

## 🎯 Vue d'ensemble

Perplexity Sonar Pro a été intégré comme **3ème provider IA** dans E-Réussite :

### Emplacements d'utilisation

1. **✅ Assistant IA flottant** (`AIAssistantSidebar.jsx`)
   - Format: **Conversation** (pas de recherche web)
   - Accessible via sélecteur de modèle
   - Utilise Edge Function proxy

2. **✅ Page Historique** (`ActivityHistory.jsx`)
   - Bouton "Conseils" sur chaque activité
   - Supporte les **citations** (liens externes optionnels)
   - Préférence utilisateur possible

---

## 📦 Fichiers modifiés/créés

### 1. **Configuration Provider** ✅

**Fichier**: `src/lib/aiProviderConfig.js`

```javascript
export const AI_PROVIDERS = {
  GEMINI: { ... },
  CLAUDE: { ... },
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
```

**Nouveauté**: Cas d'usage ajouté dans `getBestProviderForTask()`
```javascript
case 'web-search':
case 'citations':
case 'factual-research':
  return 'perplexity';
```

---

### 2. **Service Perplexity** ✅ (NOUVEAU)

**Fichier**: `src/lib/perplexityAIService.js` (169 lignes)

```javascript
class PerplexityAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    this.baseURL = '/api/perplexity-search'; // Edge Function
    this.model = 'sonar-pro';
  }

  async generateResponse(prompt, conversationHistory, systemPrompt) {
    // Format conversation (PAS de recherche web)
    // return_citations: FALSE (pour conversation)
    // return_images: FALSE
  }

  async analyzeImage() {
    // Retourne erreur + requiresFallback: true
  }
}
```

**Caractéristiques**:
- ✅ Mode conversation (pas de citations dans ce mode)
- ✅ Gestion historique (10 derniers messages)
- ✅ Fallback automatique pour images (→ Gemini)
- ✅ Utilise Edge Function proxy (`/api/perplexity-search`)

---

### 3. **Hook Multi-Provider** ✅

**Fichier**: `src/hooks/useMultiProviderAI.js`

**Changements**:

1. Import ajouté:
```javascript
import perplexityAIService from '../lib/perplexityAIService';
```

2. État étendu:
```javascript
const [providerStatus, setProviderStatus] = useState({
  gemini: 'unknown',
  claude: 'unknown',
  perplexity: 'unknown' // ← NOUVEAU
});
```

3. Vérification ajoutée:
```javascript
useEffect(() => {
  // ... Gemini, Claude ...
  
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
}, []);
```

4. Switch provider:
```javascript
const getActiveService = useCallback(() => {
  switch (currentProvider) {
    case 'claude':
      return claudeAIService;
    case 'perplexity':
      return perplexityAIService; // ← NOUVEAU
    case 'gemini':
    default:
      return geminiService;
  }
}, [currentProvider]);
```

5. Fallback Vision étendu:
```javascript
const analyzeImage = useCallback(async (imageBase64, prompt) => {
  // Si Claude OU Perplexity sélectionné, utiliser Gemini
  if (currentProvider === 'claude' || currentProvider === 'perplexity') {
    console.warn(`⚠️ ${currentProvider} ne supporte pas Vision`);
    return await geminiService.analyzeImage(imageBase64, prompt);
  }
  // ...
}, [currentProvider]);
```

---

### 4. **Service Contextuel** ✅

**Fichier**: `src/lib/contextualAIService.js`

**Changements**:

1. Initialisation Perplexity:
```javascript
constructor(apiKey) {
  // ... Claude, Gemini ...
  
  // Initialiser Perplexity (optionnel)
  const perplexityKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  if (perplexityKey) {
    this.perplexityKey = perplexityKey;
    this.perplexityBaseURL = '/api/perplexity-search';
    console.log('✅ [Contextual AI] Perplexity initialisé');
  }
}
```

2. Provider avec préférence:
```javascript
getAvailableProvider(preferredProvider = null) {
  // Si provider préféré spécifié
  if (preferredProvider === 'perplexity' && this.perplexityKey) 
    return 'perplexity';
  if (preferredProvider === 'claude' && this.claude) 
    return 'claude';
  if (preferredProvider === 'gemini' && this.genAI) 
    return 'gemini';
  
  // Sinon, priorité par défaut: Claude > Perplexity > Gemini
  if (this.claude) return 'claude';
  if (this.perplexityKey) return 'perplexity';
  if (this.genAI) return 'gemini';
  return null;
}
```

3. Fonction `generateAdviceForActivity` étendue:
```javascript
async generateAdviceForActivity(
  activity, 
  userProfile, 
  relatedChapters = [], 
  preferredProvider = null  // ← NOUVEAU paramètre optionnel
) {
  // ...
  const provider = this.getAvailableProvider(preferredProvider);

  // 🟢 Support Perplexity (avec citations)
  if (provider === 'perplexity') {
    console.log('🟢 Utilisation de Perplexity Sonar Pro...');
    
    const response = await fetch(this.perplexityBaseURL, {
      method: 'POST',
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [/*...*/],
        return_citations: true, // ✅ Citations activées
        stream: false
      })
    });
    
    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || '';
    adviceData = JSON.parse(text);

    // ✅ Ajouter citations externes
    if (data.citations && data.citations.length > 0) {
      adviceData.externalResources = data.citations.slice(0, 5);
      console.log(`🔗 ${data.citations.length} citations ajoutées`);
    }
  }
  // 🟣 Claude AI
  else if (provider === 'claude') {
    // ...
  }
  // 🔵 Gemini
  else if (provider === 'gemini') {
    // ...
  }
}
```

---

## 🎨 Interface Utilisateur

### Assistant IA Flottant

Le sélecteur affiche automatiquement Perplexity :

```
┌─────────────────────────────────────┐
│ 🤖 Modèle IA                        │
│                                     │
│ [🔵 Google Gemini 2.0        ▼]   │
│ [🟣 Claude 3.5 Sonnet        ▼]   │
│ [🟢 Perplexity Sonar Pro     ▼]   │ ← NOUVEAU
│                                     │
│ Points forts :                      │
│ • Recherche web en temps réel       │
│ • Citations et sources vérifiées    │
│ • Informations actualisées          │
│ • Réponses avec liens externes      │
└─────────────────────────────────────┘
```

**Composants concernés**:
- `AIProviderSelectorCompact.jsx` (déjà générique)
- `AIProviderSelector.jsx` (déjà générique)

**Pas de modification UI nécessaire** ✅

---

## 🔧 Utilisation dans le code

### 1. Assistant flottant (conversation)

**Automatique** via `useMultiProviderAI`:

```javascript
const {
  currentProvider, // 'gemini' | 'claude' | 'perplexity'
  generateResponse,
  switchProvider
} = useMultiProviderAI();

// L'utilisateur change de provider via sélecteur UI
// → Perplexity utilisé en mode conversation
```

---

### 2. Page Historique (conseils)

**Option A: Provider par défaut** (actuel)
```javascript
// ActivityHistory.jsx
const advice = await generateAdviceForActivity(
  activity, 
  userProfile, 
  relatedChapters
);
// Utilise: Claude > Perplexity > Gemini
```

**Option B: Forcer Perplexity** (futur)
```javascript
const advice = await generateAdviceForActivity(
  activity, 
  userProfile, 
  relatedChapters,
  'perplexity' // ← Forcer Perplexity pour citations
);

// Résultat avec citations externes:
// {
//   strengths: [...],
//   weaknesses: [...],
//   suggestions: [...],
//   message: "...",
//   externalResources: [ // ← Citations Perplexity
//     "https://example.com/article1",
//     "https://example.com/article2"
//   ]
// }
```

---

## 🎯 Cas d'usage

### Quand utiliser Perplexity ?

**✅ Bon pour**:
- Conseils nécessitant ressources externes récentes
- Recherche factuelle (dates, événements, définitions)
- Citations d'articles éducatifs
- Informations actualisées

**❌ Pas adapté pour**:
- Analyse d'images (pas de Vision API)
- Conversations longues avec contexte complexe
- Code review ou débogage

### Quand utiliser Claude ?

**✅ Bon pour**:
- Raisonnement pédagogique profond
- Analyses détaillées de performances
- Explications complexes
- Conseils personnalisés

### Quand utiliser Gemini ?

**✅ Bon pour**:
- Analyse d'images (captures d'écran, diagrammes)
- Réponses rapides
- Vision multimodale
- Fallback universel

---

## 📊 Architecture Finale

```
┌─────────────────────────────────────────────────┐
│         ASSISTANT IA FLOTTANT                    │
│                                                  │
│  ┌────────────────────────────────────────────┐│
│  │   AIProviderSelectorCompact                ││
│  │   [🔵 Gemini] [🟣 Claude] [🟢 Perplexity] ││
│  └───────────┬────────────────────────────────┘│
│              │                                  │
│              ▼                                  │
│  ┌────────────────────────────────────────────┐│
│  │      useMultiProviderAI (Hook)             ││
│  │      - currentProvider                     ││
│  │      - generateResponse()                  ││
│  │      - analyzeImage()                      ││
│  │      - switchProvider()                    ││
│  └───────────┬────────────────────────────────┘│
│              │                                  │
│          ┌───┴───┬──────────┬──────────┐      │
│          ▼       ▼          ▼          ▼      │
│      geminiService                             │
│      claudeAIService                           │
│      perplexityAIService ← NOUVEAU             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         PAGE HISTORIQUE (CONSEILS)               │
│                                                  │
│  ┌────────────────────────────────────────────┐│
│  │   ActivityHistory.jsx                      ││
│  │   [Conseils] button                        ││
│  └───────────┬────────────────────────────────┘│
│              │                                  │
│              ▼                                  │
│  ┌────────────────────────────────────────────┐│
│  │   contextualAIService                      ││
│  │   generateAdviceForActivity(               ││
│  │     activity,                              ││
│  │     userProfile,                           ││
│  │     relatedChapters,                       ││
│  │     preferredProvider ← NOUVEAU optionnel  ││
│  │   )                                        ││
│  └───────────┬────────────────────────────────┘│
│              │                                  │
│          ┌───┴───┬──────────┬──────────┐      │
│          ▼       ▼          ▼          ▼      │
│      Claude     Perplexity  Gemini            │
│      (priorité) (avec       (fallback)         │
│                  citations)                     │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Tests recommandés

### Test 1: Assistant flottant avec Perplexity

1. Ouvrir assistant IA flottant
2. Sélectionner **🟢 Perplexity Sonar Pro**
3. Poser question: "Quelles sont les dernières découvertes en SVT ?"
4. **Vérifier**:
   - ✅ Réponse générée
   - ✅ Pas de citations (mode conversation)
   - ✅ Réponse factuelle

### Test 2: Conseils avec Perplexity (page Historique)

1. Aller sur `/historique`
2. Cliquer "Conseils" sur un quiz de Mathématiques
3. **Vérifier dans la console**:
   ```
   🟣 [Contextual AI] Utilisation de Claude AI... (défaut)
   // OU si modification code:
   🟢 [Contextual AI] Utilisation de Perplexity...
   🔗 [Perplexity] 3 citations ajoutées
   ```
4. **Vérifier le JSON** retourné:
   ```json
   {
     "strengths": [...],
     "weaknesses": [...],
     "suggestions": [...],
     "message": "...",
     "externalResources": [ // ← Seulement si Perplexity
       "https://...",
       "https://..."
     ]
   }
   ```

### Test 3: Fallback Vision

1. Sélectionner **🟢 Perplexity**
2. Ajouter image dans chat
3. Envoyer message
4. **Vérifier logs**:
   ```
   ⚠️ [useMultiProviderAI] perplexity ne supporte pas Vision
   📸 [Gemini Vision] Analyse image...
   ✅ Fallback: originalProvider=perplexity, usedProvider=gemini
   ```

---

## ⚙️ Variables d'environnement

**Fichier**: `.env`

```bash
# Existantes
VITE_GEMINI_API_KEY=your_gemini_key
VITE_CLAUDE_API_KEY=your_claude_key

# NOUVELLE (déjà configurée)
VITE_PERPLEXITY_API_KEY=pplx-... # ✅ Déjà présente
```

**Statut**: ✅ Clé déjà configurée (utilisée pour PerplexitySearchMode)

---

## 🚀 Déploiement

### Edge Function déjà déployée

**Fichier**: `supabase/functions/perplexity-search/index.ts`

**Statut**: ✅ Déjà déployé

**Endpoint**: `https://your-project.supabase.co/functions/v1/perplexity-search`

**Alias local**: `/api/perplexity-search` (via vite.config.js)

---

## 📝 Points clés

### 1. Perplexity dans Assistant = Conversation

```javascript
// ⚠️ Mode conversation (PAS de recherche web)
{
  return_citations: false,
  return_images: false,
  search_recency_filter: null
}
```

### 2. Perplexity dans Conseils = Citations optionnelles

```javascript
// ✅ Mode conseils (AVEC citations)
{
  return_citations: true,  // ← Liens externes
  return_images: false,
  stream: false
}
```

### 3. Fallback automatique pour images

Perplexity **ne supporte PAS Vision API** → Gemini utilisé automatiquement

---

## 🎉 Résultat Final

✅ **3 providers IA disponibles**
- 🔵 Gemini 2.0 (Vision, rapidité)
- 🟣 Claude 3.5 Sonnet (raisonnement, analyses)
- 🟢 Perplexity Sonar Pro (recherche, citations)

✅ **2 emplacements intégrés**
- Assistant IA flottant (conversation)
- Page Historique (conseils)

✅ **Architecture flexible**
- Provider préféré optionnel
- Fallback automatique
- Sélection UI intuitive

✅ **Prêt pour production** 🚀

---

**Note importante**: Pour activer Perplexity sur la page Historique, il faut passer `preferredProvider: 'perplexity'` à `generateAdviceForActivity()`. Sinon, Claude est utilisé en priorité (comportement actuel conservé).
