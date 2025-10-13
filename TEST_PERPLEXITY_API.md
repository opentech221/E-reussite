# 🧪 TEST PERPLEXITY API - VÉRIFICATION RAPIDE
Date: 10 octobre 2025

---

## ✅ Objectif
Vérifier que votre clé Perplexity fonctionne et tester les différents modèles.

---

## 🚀 Test 1 : Question simple avec recherche web

Ouvrez la console navigateur (F12) et testez:

\`\`\`javascript
// Import (si pas déjà fait)
import OpenAI from 'openai';

// Configuration
const perplexity = new OpenAI({
  apiKey: 'pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  baseURL: 'https://api.perplexity.ai',
  dangerouslyAllowBrowser: true
});

// Test 1 : Question avec recherche web
const response = await perplexity.chat.completions.create({
  model: 'sonar-medium-online',
  messages: [{
    role: 'user',
    content: 'Quelles sont les dernières réformes du BAC au Sénégal en 2025 ?'
  }],
  max_tokens: 500,
  search_domain_filter: ['education.gouv.sn']
});

console.log('✅ Réponse:', response.choices[0].message.content);
console.log('📚 Sources:', response.citations);
\`\`\`

**Résultat attendu**:
- Réponse structurée avec informations récentes
- Liste de citations (URLs des sources)

---

## 🧪 Test 2 : Génération de contenu éducatif

\`\`\`javascript
const lessonResponse = await perplexity.chat.completions.create({
  model: 'sonar-medium-online',
  messages: [{
    role: 'user',
    content: `Explique le théorème de Pythagore avec 3 exemples concrets 
              utilisés au Sénégal (construction, agriculture, pêche).
              Niveau BFEM.`
  }],
  max_tokens: 1000,
  temperature: 0.3,
  search_recency_filter: 'year'
});

console.log('📚 Leçon générée:', lessonResponse.choices[0].message.content);
console.log('🔗 Sources:', lessonResponse.citations);
\`\`\`

**Résultat attendu**:
- Explication claire et adaptée niveau BFEM
- Exemples contextualisés Sénégal
- Sources éducatives citées

---

## 🔍 Test 3 : Recherche avancée avec filtres

\`\`\`javascript
const searchResponse = await perplexity.chat.completions.create({
  model: 'sonar-small-online',
  messages: [{
    role: 'user',
    content: 'Programme officiel mathématiques BFEM 2025 Sénégal'
  }],
  search_domain_filter: [
    'education.gouv.sn',
    '*.edu',
    'universites.sn'
  ],
  search_recency_filter: 'month'
});

console.log('🔍 Résultats:', searchResponse.choices[0].message.content);
console.log('📄 Documents trouvés:', searchResponse.citations);
\`\`\`

**Résultat attendu**:
- Informations officielles récentes
- Liens vers documents PDF/pages officielles
- Contenu vérifié et à jour

---

## 📊 Comparaison des modèles Perplexity

| Modèle | Usage | Recherche Web | Vitesse | Coût tokens |
|--------|-------|---------------|---------|-------------|
| **sonar-small-online** | Rapide, questions simples | ✅ | ⚡⚡⚡ | $ |
| **sonar-medium-online** | Équilibré, recommandé | ✅ | ⚡⚡ | $$ |
| **sonar-reasoning** | Analyse profonde (Pro) | ✅ | ⚡ | $$$ |

**Recommandation E-reussite**:
- 🎓 **Assistant IA élèves**: `sonar-medium-online` (meilleur rapport qualité/coût)
- 🔍 **Recherche rapide**: `sonar-small-online`
- 📚 **Génération leçons**: `sonar-reasoning` (Pro uniquement)

---

## 💰 Consommation estimée

Avec votre plan **Perplexity Pro**:

### **Crédits inclus**:
- ~$20-50/mois selon le plan
- Équivalent: **10,000 - 50,000 requêtes** (sonar-medium)

### **Consommation E-reussite estimée**:
- 100 élèves actifs/jour
- 5 questions IA/élève/jour
- = **500 requêtes/jour** = **15,000/mois**

**Conclusion**: ✅ Largement suffisant pour démarrer !

---

## 🚨 Monitoring usage

Pour suivre votre consommation:

1. **Dashboard Perplexity**:
   - https://www.perplexity.ai/api-platform/dashboard
   - Section "Usage"

2. **Alertes recommandées**:
   - ⚠️ Alerte à 50% consommation
   - 🔴 Alerte à 80% consommation

3. **Rate limiting dans le code**:
\`\`\`javascript
// À implémenter dans perplexityService.js
const requestsPerMinute = 10; // Limite par utilisateur
const requestsPerDay = 100;   // Limite par utilisateur
\`\`\`

---

## ✅ Checklist avant intégration complète

- [ ] Test 1 réussi (question simple)
- [ ] Test 2 réussi (génération contenu)
- [ ] Test 3 réussi (recherche filtrée)
- [ ] Citations présentes dans les réponses
- [ ] Temps de réponse < 3 secondes
- [ ] Qualité réponses adaptée niveau BFEM/BAC
- [ ] Dashboard Perplexity accessible
- [ ] Usage monitoring configuré

---

## 🎯 Prochaine étape

Une fois les tests validés:
1. ✅ Intégrer dans `AIAssistantSidebar.jsx`
2. ✅ Ajouter bouton "Mode Recherche avancée"
3. ✅ Afficher les sources sous les réponses
4. ✅ Logger les requêtes pour analytics

**Voulez-vous que je commence l'intégration dans l'Assistant IA existant ?** 🚀
