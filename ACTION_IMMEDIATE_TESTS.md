# ⚡ ACTION IMMÉDIATE - À faire maintenant

**Date** : 7 octobre 2025, 02:35 AM

---

## 🎯 ÉTAPE 1 : Tester Page Progress

### Ouvrir dans le navigateur
```
http://localhost:3000/progress
```

### Vérifier que vous voyez :
- ✅ 4 cartes : Points (1,950), Niveau (5), Série (1 jour), Leçons (14)
- ✅ 5 badges dont 4 en couleur
- ✅ 4 défis dont 3 marqués "COMPLÉTÉ"
- ✅ 3 graphiques (ligne, camembert, barres)
- ✅ Badge vert "400 POINTS À RÉCLAMER"

### Si ça marche :
→ Passez à l'étape 2

### Si erreur :
1. Ouvrir la console (F12)
2. Copier le message d'erreur
3. Me le partager

---

## 🎯 ÉTAPE 2 : Tester Page Badges

### Ouvrir dans le navigateur
```
http://localhost:3000/badges
```

### Vérifier que vous voyez :
- ✅ "4 Badges obtenus" (au lieu de 0)
- ✅ "330 Points de badges"
- ✅ "11 À débloquer"
- ✅ 4 badges en couleur avec checkmark ✓
- ✅ 11 badges grisés avec cadenas 🔒

### Vérifier dans la console (F12) :
```
📛 Badges from DB: [...]
✅ Mapped badge IDs: [...]
```

### Si ça marche :
→ Passez à l'étape 3

### Si toujours "0 badges" :
1. Copier ce qu'il y a dans la console
2. Me le partager

---

## 🎯 ÉTAPE 3 : Réclamer les Points

### Sur la page /progress
1. Cliquer sur "Réclamer 100 points" (Semaine studieuse)
2. Cliquer sur "Réclamer 200 points" (Marathon)
3. Cliquer sur "Réclamer 100 points" (Rapide)

### Résultat attendu :
- ✅ Toast de confirmation
- ✅ Total points passe à 2,350 (1,950 + 400)
- ✅ Les 3 boutons deviennent gris "RÉCLAMÉ"

---

## 🎯 ÉTAPE 4 (Optionnel) : Diagnostic SQL

### Si Leaderboard ou Quiz ne marchent pas

1. Aller sur Supabase → SQL Editor
2. Ouvrir le fichier `database/diagnostic_leaderboard_quiz.sql`
3. Copier/coller ces requêtes :

#### Pour Leaderboard
```sql
SELECT COUNT(*) as total_profiles FROM profiles;

SELECT 
  p.full_name,
  COALESCE(up.total_points, 0) as points
FROM profiles p
LEFT JOIN user_points up ON up.user_id = p.id
ORDER BY points DESC;
```

#### Pour Quiz
```sql
SELECT COUNT(*) as total_quizzes FROM quizzes;

SELECT title, chapitre_id, difficulty 
FROM quizzes 
ORDER BY created_at DESC;
```

### Partager les résultats
- Nombre de profils trouvés : ?
- Nombre de quiz trouvés : ?

---

## 📸 BONUS : Screenshots

Si tout fonctionne, prenez 2 screenshots :
1. Page /progress avec les 400 points réclamés
2. Page /badges avec les 4 badges affichés

---

## 🆘 EN CAS DE PROBLÈME

### Import Errors (console)
```
Failed to resolve import...
```
→ Relancer `npm run dev`

### Page blanche
```
Nothing renders
```
→ F12, onglet Console, copier l'erreur

### Données à 0
```
0 badges, 0 points, etc.
```
→ Exécuter le diagnostic SQL

---

**Temps estimé** : 5-10 minutes  
**Objectif** : Confirmer que tout fonctionne  
**Ensuite** : On pourra passer à Leaderboard & Quiz
