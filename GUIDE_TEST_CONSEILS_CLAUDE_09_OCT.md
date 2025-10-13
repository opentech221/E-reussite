# 🧪 Guide de Test - Conseils Intelligents Claude AI
**Date**: 9 octobre 2025  
**Durée estimée**: 5 minutes

---

## ✅ Pré-requis

### 1. Vérifier les Variables d'Environnement

Ouvrez `.env` et vérifiez :

```env
VITE_CLAUDE_API_KEY=sk-ant-api03-xxxxx...
VITE_GEMINI_API_KEY=AIzaSy...
```

**Si manquant** : Le système utilisera uniquement Gemini (fallback).

---

## 🎯 Scénario de Test 1 : Conseils avec Claude AI

### Étapes

1. **Ouvrir la page Historique**
   ```
   http://localhost:3000/historique
   ```

2. **Identifier une activité complétée**
   - Cherchez un quiz ou examen avec un score
   - Exemple : "Quiz Mathématiques - Algèbre (Score: 75%)"

3. **Cliquer sur le bouton "💡 Conseils"**
   - Situé à droite de chaque activité

4. **Observer les logs dans la console** (F12)
   ```
   🟣 [Contextual AI] Claude AI initialisé (provider principal)
   🟣 [Contextual AI] Utilisation de Claude AI pour les conseils...
   ✅ [Claude AI] Conseils générés avec succès
   💾 [Cache] Conseils sauvegardés: quiz_completed_15_75
   ```

5. **Vérifier l'affichage du modal**
   - ✅ Points Forts listés
   - ⚠️ Points à Améliorer listés
   - 💡 Suggestions avec **liens cliquables** vers chapitres
   - 💬 Message d'encouragement personnalisé

### Résultat Attendu

```
┌─────────────────────────────────────────┐
│ 🎯 CONSEILS INTELLIGENTS                │
│                                         │
│ ✅ Points Forts                         │
│ • Excellente maîtrise des équations     │
│ • Rapidité de résolution                │
│                                         │
│ ⚠️ À Améliorer                          │
│ • Fractions algébriques                 │
│ • Factorisation                         │
│                                         │
│ 💡 Suggestions                          │
│ 1. Révise: Les Fractions Algébriques   │
│    [📖 Accéder au chapitre 15]  ← LIEN │
│                                         │
│ 2. Pratique 5 exercices factorisation   │
│    [📖 Accéder au chapitre 18]          │
│                                         │
│ 3. Refais les exercices ratés           │
│                                         │
│ 💬 "Bravo ! Tu as montré..."            │
└─────────────────────────────────────────┘
```

---

## 🔄 Scénario de Test 2 : Fallback Gemini

### Simulation d'Échec Claude

1. **Temporairement désactiver Claude**
   - Dans `.env`, commentez :
   ```env
   # VITE_CLAUDE_API_KEY=sk-ant-api03-xxxxx...
   VITE_GEMINI_API_KEY=AIzaSy...
   ```

2. **Redémarrer le serveur**
   ```bash
   npm run dev
   ```

3. **Tester à nouveau les Conseils**

### Logs Attendus (Fallback)

```
⚠️ [Contextual AI] Clé API Claude manquante
🔵 [Contextual AI] Gemini initialisé (provider fallback)
🔵 [Contextual AI] Utilisation de Gemini pour les conseils...
✅ [Gemini] Conseils générés avec succès
💾 [Cache] Conseils sauvegardés: quiz_completed_15_75
```

✅ **Résultat** : Les conseils fonctionnent toujours (Gemini en fallback)

---

## 💾 Scénario de Test 3 : Cache

### Test du Cache (1 heure)

1. **Générer des conseils**
   - Cliquez sur "💡 Conseils" pour une activité

2. **Fermer le modal**

3. **Rouvrir immédiatement les conseils**

### Logs Attendus (Cache Hit)

```
📦 [Cache] Conseils récupérés du cache: quiz_completed_15_75
✅ [Contextual AI] Conseils générés: {...}
```

✅ **Résultat** : Réponse instantanée (< 10ms)

---

## 🔗 Scénario de Test 4 : Liens vers Chapitres

### Vérifier la Navigation

1. **Générer des conseils avec liens**
   - Vérifiez qu'au moins une suggestion a un lien

2. **Cliquer sur "📖 Accéder au chapitre X"**

3. **Vérifier la redirection**
   - Doit naviguer vers `/course/[matiereId]?chapter=[chapterId]`
   - Exemple : `/course/1?chapter=15`

### Résultat Attendu

```
Navigation vers :
http://localhost:3000/course/1?chapter=15

Page affichée :
- Sidebar avec liste des chapitres
- Chapitre 15 "Les Fractions Algébriques" ouvert
- Contenu du chapitre visible
```

---

## 📊 Scénario de Test 5 : Analyse Détaillée

### Activités avec Réponses Détaillées

Pour tester l'analyse par thématique, il faut une activité avec des réponses enregistrées.

#### Configuration

1. **Compléter un quiz** avec plusieurs questions
2. **Vérifier dans Supabase** que `quiz_results` contient :
   ```json
   {
     "answers": [
       {
         "question_id": 1,
         "question_text": "Résous 2x + 5 = 15",
         "user_answer": "x = 5",
         "correct_answer": "x = 5",
         "is_correct": true,
         "topic": "Équations du 1er degré",
         "difficulty": "facile"
       },
       {
         "question_id": 2,
         "question_text": "Simplifie (x²-4)/(x-2)",
         "user_answer": "x - 2",
         "correct_answer": "x + 2",
         "is_correct": false,
         "topic": "Fractions algébriques",
         "difficulty": "moyen"
       }
     ]
   }
   ```

3. **Cliquer sur "💡 Conseils"**

### Résultat Attendu (Analyse Enrichie)

```
✅ **Thématiques maîtrisées** (≥80% de réussite) :
- Équations du 1er degré : 4/5 correctes (80%)

⚠️ **Thématiques à renforcer** (<60% de réussite) :
- Fractions algébriques : 2/5 erreurs (40%)
  Questions ratées :
  1. "Simplifie (x²-4)/(x-2)" (répondu x-2 au lieu de x+2)

**Répartition des erreurs par niveau** :
- Facile : 1 erreur(s)
- Moyen : 3 erreur(s)
```

---

## 🚨 Scénarios d'Erreur

### Erreur 1 : Aucune Clé API

**Simulation** : Commentez toutes les clés dans `.env`

```env
# VITE_CLAUDE_API_KEY=...
# VITE_GEMINI_API_KEY=...
```

**Résultat Attendu** :
```
⚠️ [Contextual AI] Clé API Claude manquante
⚠️ [Contextual AI] Clé API Gemini manquante
❌ Service IA non disponible
```

**Modal** : Affiche des conseils par défaut (statiques)

---

### Erreur 2 : Quota Dépassé

**Simulation** : Dépassez le quota Claude (1000 req/jour)

**Logs Attendus** :
```
🟣 [Contextual AI] Utilisation de Claude AI...
⚠️ [Claude AI] Échec, basculement vers Gemini: rate_limit_error
🔵 [Gemini] Génération avec fallback...
✅ [Gemini] Conseils générés (fallback)
```

✅ **Résultat** : Basculement automatique vers Gemini

---

### Erreur 3 : JSON Invalide

**Rare** : L'IA retourne un JSON mal formaté

**Logs Attendus** :
```
❌ [Contextual AI] Erreur génération conseils: Unexpected token
⬇️ Retour aux conseils par défaut
```

**Modal** : Affiche des conseils génériques (fallback)

---

## ✅ Checklist de Validation

### Fonctionnalités à Vérifier

- [ ] **Claude AI prioritaire**
  - Logs montrent "🟣 Utilisation de Claude AI"
  - Conseils générés avec succès

- [ ] **Fallback Gemini**
  - Si Claude échoue → basculement automatique
  - Conseils toujours générés

- [ ] **Cache fonctionnel**
  - 2ème clic = réponse instantanée
  - Logs montrent "📦 Cache hit"

- [ ] **Liens vers chapitres**
  - Suggestions avec liens cliquables
  - Navigation vers `/course/X?chapter=Y`
  - Chapitre correct affiché

- [ ] **Analyse détaillée**
  - Points forts pertinents
  - Points faibles basés sur erreurs réelles
  - Suggestions actionnables

- [ ] **Message encouragement**
  - Ton adapté au score
  - Contexte sénégalais (BFEM/BAC)
  - 2-3 phrases motivantes

---

## 📊 Résultats Attendus

### Temps de Réponse

| Scénario | Temps |
|----------|-------|
| Cache hit | < 10ms |
| Claude API | 2-5s |
| Gemini fallback | 1-3s |

### Qualité des Conseils

| Critère | Claude | Gemini |
|---------|--------|--------|
| Pertinence | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Liens précis | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Ton pédagogique | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Structure JSON | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🐛 Problèmes Connus

### 1. "dangerouslyAllowBrowser: true"

**Warning** : Cette option expose la clé API côté client.

**Solution Production** :
- Créer un endpoint backend `/api/advice`
- Appeler Claude/Gemini depuis le serveur
- Retourner uniquement les conseils au client

### 2. Quota Limité

**Claude** : 1000 req/jour (tier gratuit)  
**Gemini** : 50 req/jour

**Mitigation** :
- Cache de 1 heure ✅
- Limiter à 5 conseils/user/jour
- Upgrade vers plan payant si besoin

---

## 📝 Notes de Test

### Observations

```
Date: ___________
Testeur: ___________

✅ Claude fonctionne ?      OUI / NON
✅ Fallback Gemini ?        OUI / NON
✅ Cache actif ?            OUI / NON
✅ Liens chapitres ?        OUI / NON
✅ Analyse détaillée ?      OUI / NON

Notes:
_________________________________
_________________________________
```

---

## 🎯 Test Rapide (1 minute)

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Ouvrir http://localhost:3000/historique

# 3. Cliquer sur "💡 Conseils" sur une activité

# 4. Vérifier :
✅ Modal s'ouvre
✅ Points forts affichés
✅ Points faibles affichés
✅ Suggestions avec liens
✅ Message encourageant

# 5. Logs console :
🟣 Claude AI utilisé
✅ Conseils générés
💾 Cache sauvegardé
```

**Si tout fonctionne → ✅ VALIDÉ** 🎉

---

## 📞 Support

En cas de problème :

1. Vérifiez les logs console (F12)
2. Vérifiez `.env` (clés API présentes ?)
3. Vérifiez Supabase (données activités présentes ?)
4. Consultez `AMELIORATION_CONSEILS_IA_CLAUDE_09_OCT.md`

---

**✅ Guide de Test Complet**

Tous les scénarios couverts pour valider les Conseils Intelligents avec Claude AI ! 🧪
