# 🔍 Guide d'exécution - Diagnostic SQL

**Fichier** : `database/diagnostic_leaderboard_quiz.sql`  
**Date** : 7 octobre 2025, 02:40 AM  
**Objectif** : Diagnostiquer Leaderboard et Quiz

---

## ⚡ EXÉCUTION RAPIDE

### 1. Ouvrir Supabase SQL Editor
```
https://supabase.com/dashboard/project/YOUR_PROJECT/sql
```

### 2. Copier/coller les requêtes une par une

⚠️ **IMPORTANT** : Ne pas tout exécuter d'un coup !

---

## 📊 REQUÊTES À EXÉCUTER

### Requête 1 : Compter les profils
```sql
SELECT COUNT(*) as total_profiles FROM profiles;
```

**Résultat attendu** : 
- Si ≥ 3 : ✅ Leaderboard devrait fonctionner
- Si = 1 : ⚠️ Besoin de créer des profils tests

---

### Requête 2 : Voir tous les profils avec points
```sql
SELECT 
  p.id, 
  p.full_name,
  p.avatar_url,
  COALESCE(up.total_points, 0) as total_points,
  COALESCE(up.level, 1) as level,
  COALESCE(up.current_streak, 0) as current_streak
FROM profiles p
LEFT JOIN user_points up ON up.user_id = p.id
ORDER BY total_points DESC;
```

**Résultat attendu** :
| full_name | total_points | level |
|-----------|--------------|-------|
| opentech ou votre nom | 1,950 | 5 |
| Utilisateur 2 | 30 | 1 |
| Utilisateur 3 | 0 | 1 |

---

### Requête 3 : Compter les quiz
```sql
SELECT COUNT(*) as total_quizzes FROM quizzes;
```

**Résultat attendu** :
- Si > 0 : ✅ Quiz existent, vérifier pourquoi QuizList ne les affiche pas
- Si = 0 : ⚠️ Besoin de créer des quiz de test

---

### Requête 4 : Voir tous les quiz
```sql
SELECT 
  q.id,
  q.title,
  q.chapitre_id,
  q.difficulty,
  q.time_limit,
  q.created_at,
  c.nom as chapitre_nom,
  m.nom as matiere_nom,
  (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) as questions_count
FROM quizzes q
LEFT JOIN chapitres c ON c.id = q.chapitre_id
LEFT JOIN matieres m ON m.id = c.matiere_id
ORDER BY q.created_at DESC;
```

**Si aucun résultat** : Quiz à créer

---

### Requête 5 : Badges par utilisateur
```sql
SELECT 
  p.full_name,
  COUNT(ub.id) as badges_count
FROM profiles p
LEFT JOIN user_badges ub ON ub.user_id = p.id
GROUP BY p.id, p.full_name
ORDER BY badges_count DESC;
```

**Résultat attendu** :
| full_name | badges_count |
|-----------|--------------|
| opentech | 4 |
| Autres | 0 |

---

### Requête 6 : Votre profil complet
```sql
SELECT 
  p.full_name,
  up.total_points,
  up.level,
  up.lessons_completed,
  up.chapters_completed,
  up.courses_completed,
  up.current_streak,
  (SELECT COUNT(*) FROM user_badges WHERE user_id = p.id) as badges_count,
  (SELECT COUNT(*) FROM user_learning_challenges WHERE user_id = p.id AND completed = true) as challenges_completed
FROM profiles p
JOIN user_points up ON up.user_id = p.id
WHERE p.id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';
```

**Résultat attendu** :
```
full_name: opentech (ou votre nom)
total_points: 1950
level: 5
lessons_completed: 14
chapters_completed: 2
courses_completed: 0
current_streak: 1
badges_count: 4
challenges_completed: 3
```

---

## 🎯 INTERPRÉTATION DES RÉSULTATS

### Scénario A : 1 seul profil
```
Requête 1 → total_profiles: 1
```

**Problème** : Leaderboard ne peut pas afficher 3 participants

**Solution** : Créer 2 profils tests
```sql
-- À créer plus tard si nécessaire
-- Guide dans SOLUTION_LEADERBOARD.md
```

---

### Scénario B : 0 quiz
```
Requête 3 → total_quizzes: 0
```

**Problème** : QuizList ne peut pas afficher de quiz

**Solution** : Créer des quiz de test
```sql
-- À créer plus tard si nécessaire
-- Guide dans SOLUTION_QUIZ.md
```

---

### Scénario C : 3+ profils et des quiz existent
```
Requête 1 → total_profiles: 3
Requête 3 → total_quizzes: 5
```

**Problème** : Leaderboard et QuizList ne chargent pas correctement

**Solution** : Vérifier le code frontend
- Leaderboard.jsx → Ligne ~339
- QuizList.jsx → Ligne ~16

---

## ✅ CHECKLIST

Après avoir exécuté toutes les requêtes, notez :

- [ ] Nombre de profils : _______
- [ ] Nombre de quiz : _______
- [ ] Vos points : _______ (devrait être 1,950)
- [ ] Vos badges : _______ (devrait être 4)
- [ ] Défis complétés : _______ (devrait être 3)

---

## 📝 PARTAGER LES RÉSULTATS

Copiez et partagez ces informations :

```
RÉSULTATS DIAGNOSTIC :
- Profils trouvés : ?
- Quiz trouvés : ?
- Points actuels : ?
- Badges actuels : ?
- Défis complétés : ?
```

Ensuite je pourrai vous dire exactement quoi corriger !

---

**Temps d'exécution** : 5 minutes  
**Prochaine étape** : Selon les résultats, créer profils/quiz ou corriger le code
