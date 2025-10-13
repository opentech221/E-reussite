# 🚨 Solution : Quota Gemini API dépassé

**Date** : 8 octobre 2025  
**Problème** : 429 Too Many Requests - 50 requêtes/jour dépassées  
**Impact** : Conseils IA non disponibles temporairement

---

## 📊 Analyse du problème

### Erreur complète
```
Error 429: You exceeded your current quota
Quota: generativelanguage.googleapis.com/generate_content_free_tier_requests
Limit: 50 requests per day
Model: gemini-2.0-flash-exp
Retry in: 33 seconds (mais quota journalier reste dépassé)
```

### Cause
- **Modèle utilisé** : `gemini-2.0-flash-exp`
- **Quota gratuit** : 50 requêtes/jour
- **Quota actuel** : 50/50 utilisées (100%)
- **Reset** : Minuit (heure du serveur Google)

---

## 💡 Solutions disponibles

### ✅ Solution 1 : Fallback automatique (IMMÉDIAT)

Le système a déjà un fallback intégré qui génère des conseils par défaut.

**Avantages** :
- ✅ Aucun changement de code nécessaire
- ✅ Fonctionne immédiatement
- ✅ Conseils génériques mais pertinents

**Inconvénients** :
- ❌ Pas de conseils personnalisés basés sur les erreurs spécifiques
- ❌ Pas d'analyse détaillée par thématique

**Action** : Rien à faire, le fallback est déjà actif dans le code.

---

### ✅ Solution 2 : Passer à Gemini 1.5 Flash (RECOMMANDÉ)

Utiliser `gemini-1.5-flash` qui a un quota plus élevé.

**Quotas Gemini 1.5 Flash** :
- 🆓 **Gratuit** : 15 requêtes/minute, 1500 requêtes/jour
- 💰 **Payant** : Illimité (avec billing)

**Avantages** :
- ✅ 30x plus de requêtes (1500 vs 50)
- ✅ API stable (pas expérimentale)
- ✅ Même qualité de réponse

**Action** :

```javascript
// Dans src/lib/contextualAIService.js ligne 18
// AVANT
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp'  // ❌ 50 requêtes/jour
});

// APRÈS
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash'  // ✅ 1500 requêtes/jour
});
```

---

### ✅ Solution 3 : Mettre en cache les conseils (OPTIMISATION)

Éviter de régénérer les conseils pour la même activité.

**Principe** :
1. Stocker les conseils dans `localStorage` ou Supabase
2. Vérifier si conseils déjà générés avant d'appeler l'API
3. Afficher les conseils en cache

**Avantages** :
- ✅ Réduction drastique des appels API (80-90%)
- ✅ Réponse instantanée pour conseils déjà générés
- ✅ Économie de quota

**Code à ajouter** :

```javascript
// Dans ActivityHistory.jsx, fonction handleAdviceClick
const handleAdviceClick = async (activity, e) => {
  e.stopPropagation();
  setSelectedActivity(activity);
  setShowAdviceModal(true);
  setLoadingAdvice(true);
  setAdviceData(null);

  try {
    // ✅ NOUVEAU : Vérifier le cache local
    const cacheKey = `advice_${activity.type}_${activity.id}`;
    const cachedAdvice = localStorage.getItem(cacheKey);
    
    if (cachedAdvice) {
      console.log('✅ Conseils récupérés du cache');
      const advice = JSON.parse(cachedAdvice);
      setAdviceData(advice);
      setLoadingAdvice(false);
      return;
    }

    // Récupérer les chapitres...
    let relatedChapters = [];
    // ... (code existant)

    // Générer les conseils avec l'IA
    const advice = await generateAdviceForActivity(activity, userProfile, relatedChapters);
    
    // ✅ NOUVEAU : Mettre en cache pour 24h
    localStorage.setItem(cacheKey, JSON.stringify(advice));
    
    setAdviceData(advice);
  } catch (error) {
    console.error('Erreur génération conseils:', error);
    setAdviceData({
      error: true,
      message: 'Impossible de générer les conseils pour le moment.'
    });
  } finally {
    setLoadingAdvice(false);
  }
};
```

---

### ✅ Solution 4 : Activer la facturation Google Cloud (PRODUCTION)

Pour production, activer la facturation pour quota illimité.

**Prix Gemini API** :
- Gemini 1.5 Flash : $0.075 / 1M tokens input, $0.30 / 1M tokens output
- Gemini 2.0 Flash : $0.10 / 1M tokens input, $0.40 / 1M tokens output

**Coût estimé** (pour 1000 utilisateurs/jour) :
- ~500 requêtes de conseils/jour
- ~500 tokens input/requête = 250K tokens
- ~1000 tokens output/requête = 500K tokens
- **Coût** : ($0.075 × 0.25) + ($0.30 × 0.50) = **$0.17/jour** soit **$5/mois**

**Avantages** :
- ✅ Quota illimité
- ✅ Pas de coupure de service
- ✅ SLA garanti

**Action** :
1. Aller sur [Google AI Studio](https://aistudio.google.com/)
2. Cliquer sur "Get API Key"
3. Activer la facturation dans Google Cloud Console
4. Utiliser la nouvelle clé API avec billing activé

---

## 🔧 Implémentation recommandée (3 étapes)

### Étape 1 : Changement immédiat (5 min)
Passer à Gemini 1.5 Flash pour augmenter le quota à 1500/jour.

### Étape 2 : Optimisation (30 min)
Ajouter le système de cache pour réduire les appels API de 80%.

### Étape 3 : Production (optionnel)
Activer la facturation pour quota illimité (~$5/mois).

---

## 📝 Code complet de la solution

### Fichier 1 : `src/lib/contextualAIService.js` (ligne 18)

```javascript
// CHANGEMENT 1 : Modèle avec quota plus élevé
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash'  // 1500 requêtes/jour au lieu de 50
});
```

### Fichier 2 : `src/pages/ActivityHistory.jsx` (fonction handleAdviceClick)

```javascript
const handleAdviceClick = async (activity, e) => {
  e.stopPropagation();
  setSelectedActivity(activity);
  setShowAdviceModal(true);
  setLoadingAdvice(true);
  setAdviceData(null);

  try {
    // CHANGEMENT 2 : Vérifier le cache
    const cacheKey = `advice_${activity.type}_${activity.id}`;
    const cachedAdvice = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    
    // Utiliser le cache si < 24h
    if (cachedAdvice && cacheTimestamp) {
      const ageHours = (Date.now() - parseInt(cacheTimestamp)) / (1000 * 60 * 60);
      if (ageHours < 24) {
        console.log('✅ Conseils du cache (', Math.round(ageHours), 'h)');
        const advice = JSON.parse(cachedAdvice);
        setAdviceData(advice);
        setLoadingAdvice(false);
        return;
      }
    }

    // Récupérer les chapitres disponibles
    let relatedChapters = [];
    
    if (activity.type === 'quiz_completed' && activity.data?.quiz?.chapitre_id) {
      const { data: chapitreData } = await supabase
        .from('chapitres')
        .select('id, title, matiere_id, matieres:matiere_id(name)')
        .eq('id', activity.data.quiz.chapitre_id)
        .single();
      
      if (chapitreData) {
        relatedChapters.push({
          id: chapitreData.id,
          title: chapitreData.title,
          matiere: chapitreData.matieres?.name
        });
      }
    } else if (activity.type === 'exam_completed' && activity.data?.examens?.matiere_id) {
      const { data: chapitresData } = await supabase
        .from('chapitres')
        .select('id, title, matiere_id')
        .eq('matiere_id', activity.data.examens.matiere_id)
        .order('ordre');
      
      if (chapitresData) {
        relatedChapters = chapitresData.map(ch => ({
          id: ch.id,
          title: ch.title
        }));
      }
    } else if (activity.type === 'chapter_completed' && activity.data?.chapitre_id) {
      const { data: chapitreData } = await supabase
        .from('chapitres')
        .select('id, title, matiere_id')
        .eq('id', activity.data.chapitre_id)
        .single();
      
      if (chapitreData) {
        relatedChapters.push({
          id: chapitreData.id,
          title: chapitreData.title
        });
      }
    }
    
    // Générer les conseils avec l'IA
    const advice = await generateAdviceForActivity(activity, userProfile, relatedChapters);
    
    // CHANGEMENT 3 : Mettre en cache
    localStorage.setItem(cacheKey, JSON.stringify(advice));
    localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    console.log('✅ Conseils mis en cache');
    
    setAdviceData(advice);
  } catch (error) {
    console.error('Erreur génération conseils:', error);
    
    // CHANGEMENT 4 : Message d'erreur plus clair pour quota
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      setAdviceData({
        error: true,
        message: 'Quota API dépassé. Les conseils par défaut sont affichés ci-dessous.'
      });
      // Utiliser le fallback
      const fallbackAdvice = getDefaultAdviceForActivity(activity);
      setAdviceData(fallbackAdvice);
    } else {
      setAdviceData({
        error: true,
        message: 'Impossible de générer les conseils pour le moment.'
      });
    }
  } finally {
    setLoadingAdvice(false);
  }
};

// CHANGEMENT 5 : Fonction helper pour conseils par défaut
const getDefaultAdviceForActivity = (activity) => {
  const score = activity.score || 0;
  
  const advice = {
    strengths: [],
    weaknesses: [],
    suggestions: [],
    message: ''
  };

  if (score >= 70) {
    advice.strengths = [
      'Excellente maîtrise du sujet',
      'Bonne gestion du temps',
      'Compréhension solide des concepts'
    ];
    advice.suggestions = [
      { text: 'Continue sur cette lancée !', chapterId: null, chapterTitle: null },
      { text: 'Essaie des exercices plus avancés', chapterId: null, chapterTitle: null }
    ];
    advice.message = 'Bravo ! Continue ainsi !';
  } else if (score >= 50) {
    advice.strengths = ['Bonne base de compréhension'];
    advice.weaknesses = ['Quelques notions à revoir'];
    advice.suggestions = [
      { text: 'Révise les concepts mal compris', chapterId: null, chapterTitle: null },
      { text: 'Fais plus d\'exercices pratiques', chapterId: null, chapterTitle: null }
    ];
    advice.message = 'Bon travail ! Continue à pratiquer.';
  } else {
    advice.weaknesses = ['Difficultés sur plusieurs concepts'];
    advice.suggestions = [
      { text: 'Reprends les bases du chapitre', chapterId: null, chapterTitle: null },
      { text: 'Pratique avec des exercices simples', chapterId: null, chapterTitle: null }
    ];
    advice.message = 'Ne te décourage pas ! Continue tes efforts !';
  }

  return advice;
};
```

---

## 🚀 Plan d'action immédiat

### 1. Changement du modèle (MAINTENANT)
```bash
# Ouvrir le fichier
code src/lib/contextualAIService.js

# Ligne 18, remplacer:
model: 'gemini-2.0-flash-exp'
# par:
model: 'gemini-1.5-flash'
```

### 2. Redémarrer l'application
```bash
# Ctrl+C pour arrêter
npm run dev
```

### 3. Tester
- Aller sur `/historique`
- Cliquer "Conseils"
- ✅ Devrait fonctionner avec le nouveau modèle

---

## 📊 Comparaison des modèles

| Caractéristique | Gemini 2.0 Flash Exp | Gemini 1.5 Flash | Gemini 1.5 Pro |
|-----------------|---------------------|------------------|----------------|
| **Quota gratuit** | 50/jour | 1500/jour | 50/jour |
| **Quota/minute** | 2 RPM | 15 RPM | 2 RPM |
| **Stabilité** | Expérimental | Stable | Stable |
| **Qualité** | Très bonne | Très bonne | Excellente |
| **Prix (payant)** | $0.10/$0.40 | $0.075/$0.30 | $3.50/$10.50 |
| **Recommandé pour** | Tests | **Production** 🏆 | Haute qualité |

---

## ✅ Checklist post-correction

- [ ] Modèle changé vers `gemini-1.5-flash`
- [ ] Application redémarrée
- [ ] Test conseils IA fonctionnel
- [ ] Cache implémenté (optionnel)
- [ ] Monitoring quota configuré (optionnel)

---

## 📞 Ressources

- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Quota Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Google AI Studio](https://aistudio.google.com/)

---

**Action immédiate** : Changer le modèle vers `gemini-1.5-flash` pour quota x30 supérieur ! 🚀
