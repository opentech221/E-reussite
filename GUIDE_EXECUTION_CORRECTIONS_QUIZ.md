# 🚀 GUIDE RAPIDE - Exécution des Corrections

## Étape 1 : Mettre à jour la base de données

1. **Ouvrir Supabase** : https://supabase.com
2. Aller dans **SQL Editor**
3. Copier le contenu de `database/fix_difficulty_french.sql`
4. **Exécuter** le script
5. **Vérifier** : Voir "Success. No rows returned" et les résultats de vérification

**Résultat attendu** :
```
Niveau "Facile": 4 quiz
Niveau "Moyen": 7 quiz
Niveau "Difficile": 4 quiz
```

---

## Étape 2 : Tester dans le navigateur

### Test 1 : Liste des quiz
1. Ouvrir http://localhost:3000/quiz
2. **Vérifier** : 15 quiz avec badges colorés
   - 🟢 Vert = "Facile" (4 quiz)
   - 🟡 Jaune = "Moyen" (7 quiz)
   - 🔴 Rouge = "Difficile" (4 quiz)

### Test 2 : Timer d'un quiz facile
1. Cliquer sur **"Quiz : La cellule"** (badge vert)
2. Observer le timer en haut à droite
3. **Attendu** : Commence à **3:45** (3 minutes 45 secondes)

### Test 3 : Timer d'un quiz moyen
1. Cliquer sur **"Quiz : La conjugaison"** (badge jaune)
2. Observer le timer
3. **Attendu** : Commence à **5:00** (5 minutes exactes)

### Test 4 : Timer d'un quiz difficile
1. Cliquer sur **"Quiz : Les atomes"** (badge rouge)
2. Observer le timer
3. **Attendu** : Commence à **7:30** (7 minutes 30 secondes)

### Test 5 : Badge visible pendant le quiz
1. Ouvrir n'importe quel quiz
2. Regarder à côté du titre en haut
3. **Attendu** : Badge coloré avec texte français ("Facile", "Moyen", ou "Difficile")

---

## ✅ Checklist de Validation

- [ ] Script SQL exécuté sans erreur
- [ ] 15 quiz affichés avec badges français
- [ ] Quiz faciles ont timer de 3:45
- [ ] Quiz moyens ont timer de 5:00
- [ ] Quiz difficiles ont timer de 7:30
- [ ] Badge visible DANS le quiz (pas seulement sur la carte)
- [ ] Couleurs correctes : Vert (Facile), Jaune (Moyen), Rouge (Difficile)

---

## 🔧 En cas de problème

### Problème 1 : Badges toujours en anglais
**Solution** : Re-exécuter `fix_difficulty_french.sql` dans Supabase

### Problème 2 : Timer toujours à 15 min
**Solution** : 
1. Vider le cache du navigateur (Ctrl + Shift + R)
2. Vérifier que le serveur Vite a redémarré

### Problème 3 : Badge invisible dans le quiz
**Solution** : 
1. Ouvrir la console (F12)
2. Vérifier qu'il n'y a pas d'erreur
3. Vérifier que `quiz.difficulty` existe dans les données

---

## 📝 Durées par Niveau

| Difficulté | Secondes/Question | Durée (5 questions) |
|-----------|-------------------|-------------------|
| Facile | 45s | **3 min 45s** |
| Moyen | 60s | **5 min** |
| Difficile | 90s | **7 min 30s** |

---

## 🎯 Prochaine Étape

Après validation de ces corrections, on passe à :

**Phase 5 - Option B : Réclamer les Points**
- Implémenter le bouton "Réclamer 150 points"
- Détecter quand challenge "Spécialiste" est complété
- Mettre à jour les points utilisateur
- Afficher badge "RÉCLAMÉ"

---

**Date** : 7 Octobre 2025
