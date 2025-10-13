# 🧪 Guide de Test - Conseils IA avec Liens Cliquables

**Date**: 8 octobre 2025  
**Version**: 2.0  
**Durée estimée**: 15 minutes

---

## 🎯 Objectifs des tests

1. ✅ Vérifier que "Reprendre le cours" redirige vers `/my-courses` (cours privés)
2. ✅ Vérifier que les suggestions contiennent des liens cliquables vers les chapitres
3. ✅ Vérifier la navigation fonctionnelle des liens
4. ✅ Tester le fallback (suggestions sans liens)

---

## 📋 Prérequis

- ✅ Application lancée (`npm run dev`)
- ✅ Utilisateur connecté
- ✅ Au moins un quiz complété dans l'historique
- ✅ Base de données avec relations chapitre_id correctes

---

## 🔍 Test 1: Navigation vers cours privés

### Étapes
1. Accéder à `/historique`
2. Cliquer sur **"Conseils"** pour un quiz
3. Attendre le chargement des conseils IA
4. Cliquer sur **"Reprendre le cours"** (footer, bouton outline)

### ✅ Résultat attendu
- URL devient `/my-courses` ou `/chapitre/{id}`
- **JAMAIS** `/courses` (cours publics)

### ❌ Si échec
```javascript
// Vérifier dans ActivityHistory.jsx ligne 365-395
const handleResumeCourse = () => {
  // Doit contenir "my-courses" et non "courses"
  navigate('/my-courses');
};
```

---

## 🔍 Test 2: Liens cliquables dans les suggestions

### Étapes
1. Compléter un **nouveau quiz** avec **40-60% de score** (pour avoir des erreurs)
2. Aller dans `/historique`
3. Cliquer sur **"Conseils"** pour ce quiz
4. Attendre l'analyse de l'IA
5. Observer la section **"Conseils pour Réussir"**

### ✅ Résultat attendu

#### Affichage visuel
```
┌─────────────────────────────────────────────────────────┐
│  💡 Conseils pour Réussir                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ① Révise les équations du second degré                 │
│     [📖 Équations et Inéquations →]  ⬅️ BOUTON PRÉSENT  │
│                                                          │
│  ② Pratique plus d'exercices variés                     │
│     (pas de bouton si pas de lien disponible)           │
│                                                          │
│  ③ Fais attention aux signes dans les calculs           │
│     [📖 Calcul Algébrique →]  ⬅️ BOUTON PRÉSENT         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Caractéristiques des boutons
- **Couleur** : Bleu (`bg-blue-600`)
- **Icônes** : 📖 (BookOpen) + ➡️ (ChevronRight)
- **Texte** : Nom du chapitre
- **Hover** : Fond devient plus foncé (`hover:bg-blue-700`)
- **Position** : Sous le texte de la suggestion

### ❌ Si aucun bouton n'apparaît
```javascript
// Vérifier dans console navigateur
console.log('Advice data:', adviceData.suggestions);
// Attendu: [{ text: "...", chapterId: 15, chapterTitle: "..." }, ...]

// Si chapterId est null partout, vérifier:
// 1. Quiz a bien un chapitre_id en BDD
// 2. Requête Supabase récupère bien les chapitres
```

---

## 🔍 Test 3: Fonctionnalité des liens

### Étapes
1. Dans la modal de conseils
2. Identifier une suggestion avec bouton bleu
3. Cliquer sur le bouton (ex: **"📖 Équations et Inéquations →"**)

### ✅ Résultat attendu
1. Modal se ferme automatiquement
2. Navigation vers `/chapitre/{id}` (ex: `/chapitre/15`)
3. Page du chapitre s'affiche correctement
4. Contenu du chapitre est visible

### ❌ Si échec
- Vérifier l'URL dans la barre d'adresse
- Vérifier console navigateur pour erreurs
- S'assurer que le chapitre existe en BDD

---

## 🔍 Test 4: Suggestions sans liens (fallback)

### Étapes
1. Compléter un **examen blanc** (type générique sans matière spécifique)
2. Ou compléter un quiz orphelin (sans chapitre_id)
3. Cliquer sur **"Conseils"**

### ✅ Résultat attendu
- Suggestions affichées **sans boutons** (juste le texte)
- Aucune erreur dans la console
- Message encourageant toujours présent

### Exemple attendu
```
┌─────────────────────────────────────────────────────────┐
│  💡 Conseils pour Réussir                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ① Reprends les bases du chapitre                       │
│                                                          │
│  ② Pratique avec des exercices simples d'abord          │
│                                                          │
│  ③ N'hésite pas à demander de l'aide                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Test 5: Comparaison des deux boutons du footer

### Étapes
1. Ouvrir la modal de conseils
2. Observer le footer avec les deux boutons côte à côte

### ✅ Résultat attendu

#### Desktop (>640px)
```
┌─────────────────────────────────────────────────────────┐
│  [📖 Reprendre le cours]   [🔄 Recommencer l'activité]  │
└─────────────────────────────────────────────────────────┘
```

#### Mobile (<640px)
```
┌─────────────────────────────────────┐
│  [📖 Reprendre le cours]            │
│                                     │
│  [🔄 Recommencer l'activité]        │
└─────────────────────────────────────┘
```

#### Styles
- **Reprendre le cours** : Outline bleu, fond blanc
- **Recommencer** : Gradient bleu→violet, fond coloré
- **Espacement** : `gap-3` entre les boutons

---

## 🔍 Test 6: Console et logs (développeur)

### Étapes
1. Ouvrir DevTools (F12)
2. Onglet **Console**
3. Cliquer sur "Conseils" pour un quiz
4. Observer les logs

### ✅ Résultat attendu
```
🔍 Récupération des chapitres disponibles...
✅ Chapitres trouvés: [{ id: 15, title: "Équations", ... }]
🤖 Génération conseils avec IA (Gemini 2.0)...
✅ [Contextual AI] Conseils générés: { suggestions: [...] }
```

### ❌ Si erreur
```
❌ Erreur lors de la récupération des chapitres
❌ [Contextual AI] Erreur génération conseils
```
→ Vérifier la connexion Supabase et les permissions

---

## 🔍 Test 7: Vérification base de données

### Requête SQL à exécuter dans Supabase SQL Editor
```sql
-- Vérifier qu'un quiz a bien un chapitre_id
SELECT 
  q.id,
  q.title,
  q.chapitre_id,
  c.title as chapitre_title
FROM quiz q
LEFT JOIN chapitres c ON q.chapitre_id = c.id
WHERE q.id = 1; -- Remplacer par l'ID du quiz testé

-- Résultat attendu:
-- | id | title          | chapitre_id | chapitre_title           |
-- | 1  | Quiz Math      | 15          | Équations du 2nd degré   |

-- Si chapitre_id est NULL, corriger:
UPDATE quiz SET chapitre_id = 15 WHERE id = 1;
```

---

## 📊 Checklist finale

Cocher les tests réussis :

- [ ] **Test 1** : Navigation vers `/my-courses` ✅
- [ ] **Test 2** : Boutons bleus visibles dans suggestions ✅
- [ ] **Test 3** : Clics sur liens fonctionnels → Navigation OK ✅
- [ ] **Test 4** : Fallback sans liens fonctionne (pas d'erreur) ✅
- [ ] **Test 5** : Deux boutons footer côte à côte (responsive) ✅
- [ ] **Test 6** : Logs console propres (pas d'erreurs) ✅
- [ ] **Test 7** : Base de données cohérente (chapitre_id valides) ✅

---

## 🐛 Problèmes courants et solutions

### Problème 1: Aucun lien dans les suggestions

**Symptôme** : Suggestions affichées mais sans boutons bleus

**Causes possibles** :
1. Quiz sans `chapitre_id` en BDD
2. Requête Supabase échoue silencieusement
3. L'IA ne trouve pas de correspondance

**Solution** :
```javascript
// Dans console navigateur, vérifier:
console.log('Related chapters:', relatedChapters);
// Si tableau vide, vérifier la requête Supabase
```

### Problème 2: Clic sur lien ne fait rien

**Symptôme** : Modal reste ouverte, pas de navigation

**Cause** : Erreur JavaScript dans le handler

**Solution** :
```javascript
// Vérifier dans ActivityHistory.jsx ligne 768
<button onClick={() => {
  setShowAdviceModal(false);  // ⬅️ Doit fermer modal
  navigate(`/chapitre/${chapterId}`);  // ⬅️ Puis naviguer
}}>
```

### Problème 3: Redirection vers `/courses` au lieu de `/my-courses`

**Symptôme** : Bouton "Reprendre le cours" va sur page publique

**Solution** :
```javascript
// Chercher dans ActivityHistory.jsx toutes les occurrences de:
navigate('/courses')
// Remplacer par:
navigate('/my-courses')
```

### Problème 4: Erreur "Cannot read property 'text' of undefined"

**Symptôme** : Erreur au chargement des suggestions

**Cause** : Format de suggestion incohérent

**Solution** :
```javascript
// Vérifier le type de suggestion (string ou objet)
const suggestionText = typeof suggestion === 'string' 
  ? suggestion 
  : suggestion.text;
```

---

## 📸 Captures d'écran attendues

### Vue complète de la modal avec liens
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🧠 Conseils Personnalisés                         [X]  ┃
┃  Quiz Mathématiques • Mathématiques                     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                          ┃
┃  ✅ Points Forts                                         ┃
┃  ✓ Bonne compréhension des concepts de base             ┃
┃                                                          ┃
┃  ⚠️ Points à Améliorer                                  ┃
┃  ! Difficultés sur les équations complexes              ┃
┃                                                          ┃
┃  💡 Conseils pour Réussir                               ┃
┃  ① Révise les équations du second degré                 ┃
┃     [📖 Équations et Inéquations →]                     ┃
┃                                                          ┃
┃  ② Pratique plus d'exercices variés                     ┃
┃                                                          ┃
┃  ③ Fais attention aux signes                            ┃
┃     [📖 Calcul Algébrique →]                            ┃
┃                                                          ┃
┃  💬 Continue tes efforts, tu progresses bien !          ┃
┃                                                          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  [📖 Reprendre le cours]   [🔄 Recommencer]            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## ✅ Validation finale

Si **tous les tests passent**, l'implémentation est réussie ! 🎉

**Prochaines étapes** :
1. Collecter les feedbacks utilisateurs
2. Analyser les clics sur les liens (analytics)
3. Optimiser les suggestions de l'IA selon les données
4. Ajouter des liens vers quiz recommandés (évolution future)

---

**Auteur** : Système de conseils IA v2.0  
**Dernière mise à jour** : 8 octobre 2025
