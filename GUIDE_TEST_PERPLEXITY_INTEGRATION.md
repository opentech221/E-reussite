# ✅ GUIDE TEST RAPIDE - Perplexity Sonar Pro

**Date**: 10 octobre 2025  
**Durée estimée**: 5 minutes

---

## 🎯 Ce qui a été ajouté

**Perplexity Sonar Pro** (🟢) est maintenant disponible comme 3ème provider IA :
- ✅ Assistant IA flottant (conversation)
- ✅ Page Historique - Conseils (avec citations optionnelles)

---

## 🧪 Test 1 : Assistant IA Flottant (2 min)

### Étapes

1. **Ouvrir l'assistant IA** (bouton flottant en bas à droite)

2. **Vérifier le sélecteur de modèle**
   - [ ] 🔵 Google Gemini 2.0
   - [ ] 🟣 Claude 3.5 Sonnet
   - [ ] 🟢 Perplexity Sonar Pro ← **NOUVEAU**

3. **Sélectionner Perplexity Sonar Pro**

4. **Poser une question**
   ```
   "Quelles sont les caractéristiques du système éducatif sénégalais ?"
   ```

5. **Vérifier la réponse**
   - [ ] Réponse générée correctement
   - [ ] Ton factuel et informatif
   - [ ] Pas d'erreur dans la console

### Console attendue

```
🟢 [Perplexity] Génération réponse conversation...
✅ [Perplexity] Réponse générée
```

---

## 🧪 Test 2 : Fallback Vision (1 min)

### Étapes

1. **Toujours avec Perplexity sélectionné**

2. **Ajouter une image** (capture d'écran, photo de cours, etc.)

3. **Poser question**
   ```
   "Qu'est-ce qu'il y a sur cette image ?"
   ```

4. **Vérifier la console**
   - [ ] Warning affiché : `⚠️ perplexity ne supporte pas Vision`
   - [ ] Gemini utilisé automatiquement
   - [ ] Réponse correcte (image analysée)

### Console attendue

```
⚠️ [useMultiProviderAI] perplexity ne supporte pas Vision, utilisation de Gemini
📸 [Gemini Vision] Analyse image...
✅ { fallbackUsed: true, originalProvider: 'perplexity', usedProvider: 'gemini' }
```

---

## 🧪 Test 3 : Page Historique - Conseils (2 min)

### Étapes

1. **Aller sur** `/historique`

2. **Choisir une activité** (Quiz ou Examen avec score)

3. **Cliquer "Conseils"**

4. **Vérifier la console**
   
   **Par défaut** (sans modification code):
   ```
   🟣 [Contextual AI] Utilisation de Claude AI pour les conseils...
   ✅ [Claude AI] Conseils générés avec succès
   ```
   
   **Si modification pour forcer Perplexity** (optionnel):
   ```
   🟢 [Contextual AI] Utilisation de Perplexity Sonar Pro...
   🔗 [Perplexity] 3 citations ajoutées
   ✅ [Perplexity] Conseils générés avec succès
   ```

5. **Vérifier le modal**
   - [ ] Points forts affichés
   - [ ] Points à améliorer affichés
   - [ ] Suggestions affichées
   - [ ] Message d'encouragement affiché
   - [ ] (Optionnel) Liens externes si Perplexity utilisé

---

## 🎨 Vérifications UI

### Sélecteur de modèle (Assistant flottant)

```
┌─────────────────────────────────────┐
│ 🤖 Modèle IA                        │
│                                     │
│ [🔵 Google Gemini 2.0        ▼]   │
│ [🟣 Claude 3.5 Sonnet        ▼]   │
│ [🟢 Perplexity Sonar Pro     ▼]   │ ← Visible
│                                     │
│ 💡 Points forts :                   │
│ • Recherche web en temps réel       │
│ • Citations et sources vérifiées    │
│ • Informations actualisées          │
│ • Réponses avec liens externes      │
└─────────────────────────────────────┘
```

---

## ❌ Dépannage

### Perplexity ne s'affiche pas ?

**Vérifier** `.env`:
```bash
VITE_PERPLEXITY_API_KEY=pplx-...
```

**Recharger** : Ctrl + Shift + R

---

### Erreur "Perplexity API error: 401" ?

**Cause**: Clé API invalide ou expirée

**Solution**: Vérifier la clé dans `.env`

---

### Réponse vide ou JSON invalide ?

**Console**:
```
❌ [Perplexity] Erreur API: 400
⚠️ [Perplexity] Échec, basculement vers Claude
```

**Normal** : Fallback automatique vers Claude/Gemini

---

## ✅ Checklist finale

- [ ] Perplexity visible dans sélecteur
- [ ] Conversation fonctionne avec Perplexity
- [ ] Fallback Vision vers Gemini OK
- [ ] Conseils générés (Claude par défaut)
- [ ] Aucune erreur bloquante
- [ ] UI réactive et fluide

---

## 🚀 Prêt pour l'utilisation !

Si tous les tests passent ✅, l'intégration est réussie.

**Perplexity Sonar Pro est maintenant disponible** comme alternative à Gemini et Claude !

---

## 📝 Notes supplémentaires

### Pour activer Perplexity sur les conseils

**Actuellement** : Claude utilisé par défaut (priorité)

**Pour forcer Perplexity** (optionnel) :

Modifier dans `ActivityHistory.jsx` (ligne ~389):
```javascript
// AVANT
const advice = await generateAdviceForActivity(activity, userProfile, relatedChapters);

// APRÈS
const advice = await generateAdviceForActivity(
  activity, 
  userProfile, 
  relatedChapters,
  'perplexity' // ← Forcer Perplexity
);
```

**Avantage** : Citations externes ajoutées dans `advice.externalResources`

**Affichage** : À implémenter dans le modal de conseils (lignes ~760-795)

---

**Tout fonctionne ?** 🎉 Passez au prochain test ou commencez à utiliser Perplexity !
