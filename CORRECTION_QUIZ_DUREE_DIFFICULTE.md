# ✅ Correction Quiz - Durée et Difficulté (07 Oct 2025)

## 🎯 Problèmes Identifiés par l'Utilisateur

### 1. Durée fixe de 15 minutes
**Problème** : Tous les quiz affichaient "15 min" sur les cartes, alors que les durées devraient différer.

**Cause** : 
- La table `quiz` n'a pas de colonne `duration_minutes`
- Le code utilisait un fallback de 15 minutes par défaut

### 2. Difficulté invisible dans le quiz
**Problème** : Le badge de difficulté était affiché sur les cartes de quiz, mais pas pendant l'exécution du quiz.

**Cause** : Le composant Quiz.jsx n'affichait pas la propriété `difficulty` dans l'en-tête.

---

## 🔧 Solutions Implémentées

### 1. Calcul Dynamique de la Durée ✅

**Fichier modifié** : `src/pages/QuizList.jsx` (lignes 28-37)

**Logique** : `time_limit = questionCount × 2 minutes`

**Exemple** :
- 5 questions → 10 minutes
- 10 questions → 20 minutes
- 7 questions → 14 minutes

**Code ajouté** :
```javascript
const quizzesWithQuestions = await Promise.all(
  data.map(async (quiz) => {
    const { data: questions } = await dbHelpers.quiz.getQuizQuestions(quiz.id);
    const questionCount = questions?.length || 0;
    return {
      ...quiz,
      questionCount,
      time_limit: questionCount * 2 // 2 minutes par question
    };
  })
);
```

**Résultat** :
- Quiz avec 5 questions affichent maintenant **10 min**
- La durée varie selon le nombre de questions
- Plus besoin de colonne `duration_minutes` dans la base de données

---

### 2. Affichage de la Difficulté dans le Quiz ✅

**Fichiers modifiés** :
1. `src/pages/Quiz.jsx` (ligne 7) : Import du composant Badge
2. `src/pages/Quiz.jsx` (lignes 364-377) : Ajout du badge dans l'en-tête

**Code ajouté** :
```jsx
// Import
import { Badge } from '@/components/ui/badge';

// Dans l'en-tête du quiz
<div className="flex items-center justify-between mb-2">
  <CardTitle className="text-2xl">{quiz.title}</CardTitle>
  {quiz.difficulty && (
    <Badge className={
      quiz.difficulty.toLowerCase() === 'facile' 
        ? 'bg-green-100 text-green-800'
        : quiz.difficulty.toLowerCase() === 'difficile'
        ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800'
    }>
      {quiz.difficulty}
    </Badge>
  )}
</div>
```

**Résultat** :
- Badge vert pour "Facile"
- Badge jaune pour "Moyen"
- Badge rouge pour "Difficile"
- Visible en permanence pendant l'exécution du quiz

---

## ✅ Tests à Effectuer

### Test 1 : Vérifier les durées variées
1. Ouvrir http://localhost:3000/quiz
2. Observer les cartes de quiz
3. **Attendu** : Chaque quiz affiche "10 min" (5 questions × 2 min)
4. Si un quiz a plus de questions, la durée doit augmenter

### Test 2 : Vérifier l'affichage de la difficulté
1. Cliquer sur un quiz pour l'ouvrir
2. Observer l'en-tête du quiz
3. **Attendu** : Badge de difficulté visible à côté du titre
4. Couleur du badge :
   - Vert = Facile
   - Jaune = Moyen
   - Rouge = Difficile

### Test 3 : Vérifier le timer pendant l'exécution
1. Lancer un quiz
2. Observer le compte à rebours en haut à droite
3. **Attendu** : Timer démarre à 10:00 (600 secondes pour 5 questions)

---

## 📊 État Actuel

**Base de données** :
- ✅ 15 quiz créés
- ✅ 75 questions (5 par quiz)
- ✅ Colonne `difficulty` présente dans la table quiz

**Frontend** :
- ✅ QuizList.jsx : Calcul dynamique de `time_limit`
- ✅ Quiz.jsx : Affichage du badge de difficulté
- ✅ Badge coloré selon le niveau

**À vérifier manuellement** :
- [ ] Les durées affichent bien "10 min" au lieu de "15 min"
- [ ] Le badge de difficulté est visible pendant l'exécution
- [ ] Le timer commence à 10:00 (600 secondes)

---

## 🎯 Prochaines Étapes

**Phase 5 - Option B : Réclamer les Points** (prochain)
- Détecter quand un challenge est complété (10/10 leçons)
- Afficher "Réclamer 150 points" au lieu de "Réclamer"
- Mettre à jour `user_points.total_points` (+150)
- Marquer `reward_claimed = true`
- Afficher badge "RÉCLAMÉ" (gris)

**Phase 5 - Option C : Plus de Profils** (optionnel)
- Ajouter 5-10 profils fictifs avec scores variés
- Rendre le leaderboard plus réaliste

**Phase 5 - Option D : Améliorer les Graphiques** (optionnel)
- Tooltips personnalisés
- Animations fluides
- Legends interactifs

---

## 📝 Notes Techniques

**Pourquoi 2 minutes par question ?**
- Standard pédagogique : 1-3 minutes par QCM
- 5 questions × 2 min = 10 minutes (durée raisonnable)
- Suffisamment de temps pour lire et réfléchir

**Alternative future** :
Si on veut des durées basées sur la difficulté :
```javascript
const baseTime = questionCount * 2;
const multiplier = 
  quiz.difficulty === 'facile' ? 0.8 :
  quiz.difficulty === 'difficile' ? 1.5 : 1;
time_limit = Math.round(baseTime * multiplier);
```

**Exemple avec multiplicateur** :
- Facile (5 questions) : 10 × 0.8 = 8 minutes
- Moyen (5 questions) : 10 × 1 = 10 minutes
- Difficile (5 questions) : 10 × 1.5 = 15 minutes

---

## 🔗 Fichiers Modifiés

1. **src/pages/QuizList.jsx** (ligne 33)
   - Ajout : `time_limit: questionCount * 2`

2. **src/pages/Quiz.jsx** (ligne 7)
   - Ajout : `import { Badge } from '@/components/ui/badge';`

3. **src/pages/Quiz.jsx** (lignes 365-377)
   - Ajout : Badge de difficulté dans l'en-tête

---

## ✅ Validation Finale

**Avant correction** :
- ❌ Tous les quiz : "15 min"
- ❌ Difficulté invisible pendant l'exécution

**Après correction** :
- ✅ Quiz avec 5 questions : "10 min"
- ✅ Badge de difficulté visible en permanence
- ✅ Couleur du badge adaptée au niveau

**État** : PRÊT POUR TESTS UTILISATEUR

---

**Date** : 07 Octobre 2025  
**Session** : Phase 5 - Option A (complétée) + Corrections UX  
**Prochaine étape** : Phase 5 - Option B (réclamer points)
