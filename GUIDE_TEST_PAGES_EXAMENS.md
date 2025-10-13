# 🚀 Guide d'exécution - Test Pages Dashboard & Progression

**Date :** 8 octobre 2025  
**Objectif :** Vérifier que les modifications pour intégrer les examens fonctionnent correctement

---

## ✅ Prérequis

- ✅ Migration `015_exam_system_fix_v3.sql` exécutée avec succès
- ✅ Table `exam_results` avec colonnes : `answers`, `time_taken`, `completed_at`
- ✅ Table `examens` avec au moins quelques examens
- ✅ Au moins 1 examen complété dans `exam_results` (pour voir les stats)

---

## 🧪 Tests à effectuer

### Test 1️⃣ : Dashboard - Chargement initial

**Étapes :**
1. Démarrer l'application : `npm run dev`
2. Se connecter avec un compte utilisateur
3. Accéder à `/dashboard`
4. Observer la console (F12 → Console)

**Résultat attendu :**
```
✅ [getUserExamStats] Récupération stats examens pour: {user_id}
✅ [getUserExamStats] Résultats récupérés: X
✅ [getUserExamStats] Stats: { totalExams: X, averageScore: Y, bestScore: Z, totalTime: T }
📊 [Dashboard] Stats examens: {...}
```

**Interface attendue :**
- ✅ Section "Statistiques des Examens" visible (si examens > 0)
- ✅ 4 cartes avec : Examens passés, Score moyen, Meilleur score, Minutes totales
- ✅ Bouton "Passer un nouvel examen"

---

### Test 2️⃣ : Dashboard - Activité récente avec examens

**Étapes :**
1. Sur `/dashboard`
2. Scroller vers "Activité récente" (colonne droite)
3. Vérifier le contenu

**Résultat attendu :**
- ✅ Examens mélangés avec chapitres et badges
- ✅ Emoji de difficulté (🟢🟡🔴) affiché
- ✅ Score affiché (ex: "Score: 85%")
- ✅ Type affiché ("Examen blanc" ou "Examen de matière")
- ✅ Timestamp relatif ("Il y a 2h30", "Il y a 3 jours")
- ✅ Tri par date (plus récents en premier)

**Console attendue :**
```
📊 [Activités récentes] TOTAL après tri: 5 activités
📊 [Activités récentes] Types: ['exam_completed', 'chapter_completed', ...]
```

---

### Test 3️⃣ : Dashboard - Navigation vers examens

**Étapes :**
1. Sur `/dashboard`
2. Cliquer sur "Passer un nouvel examen"

**Résultat attendu :**
- ✅ Redirection vers `/exam`
- ✅ Page ExamList affichée avec liste d'examens

---

### Test 4️⃣ : Progress - Section examens

**Étapes :**
1. Accéder à `/progress`
2. Scroller vers le bas
3. Observer la section "Performance aux Examens"

**Résultat attendu :**
- ✅ Section visible (si examens > 0)
- ✅ 4 cartes statistiques avec dégradés de couleur :
  - Bleu : Examens passés
  - Vert : Score moyen
  - Jaune : Meilleur score
  - Violet : Minutes totales
- ✅ Liste "Examens récents" avec 10 derniers examens max
- ✅ Bouton "Passer un nouvel examen"

---

### Test 5️⃣ : Progress - Liste examens détaillée

**Étapes :**
1. Sur `/progress`
2. Observer chaque ligne de la liste "Examens récents"

**Résultat attendu pour chaque examen :**
- ✅ Titre de l'examen
- ✅ Badge difficulté avec couleur :
  - 🟢 Vert : facile
  - 🟡 Jaune : moyen
  - 🔴 Rouge : difficile
- ✅ Type : "🎯 Examen blanc" ou "📚 Examen de matière"
- ✅ Temps passé : "XX min"
- ✅ Score avec couleur :
  - Vert si ≥ 75%
  - Jaune si ≥ 50%
  - Rouge si < 50%
- ✅ Date formatée : "8 oct.", "15 sept.", etc.

---

### Test 6️⃣ : Workflow complet (de bout en bout)

**Étapes :**
1. Aller sur `/exam`
2. Choisir un examen (ex: "Mathématiques BFEM - Facile")
3. Répondre aux questions
4. Soumettre l'examen
5. Noter le score obtenu (ex: 85%)
6. Retourner sur `/dashboard`
7. Vérifier que l'examen apparaît dans "Activité récente"
8. Vérifier que les stats de la carte sont à jour
9. Aller sur `/progress`
10. Vérifier que l'examen est dans la liste "Examens récents"
11. Vérifier que les 4 cartes stats sont à jour

**Résultat attendu :**
- ✅ Examen visible dans Dashboard → Activité récente
- ✅ Stats Dashboard à jour (nombre +1, moyenne recalculée)
- ✅ Examen visible dans Progress → Liste
- ✅ Stats Progress à jour (4 cartes)
- ✅ Aucune erreur de console

---

## 🐛 Debugging

### Problème : "Statistiques des Examens" n'apparaît pas

**Vérifications :**
1. Vérifier que `examStats` n'est pas null :
   ```javascript
   console.log('examStats:', examStats);
   ```
2. Vérifier qu'au moins 1 examen est complété :
   ```sql
   SELECT COUNT(*) FROM exam_results WHERE user_id = 'xxx';
   ```
3. Vérifier la condition d'affichage :
   ```javascript
   {examStats && examStats.totalExams > 0 && (
     // Carte visible
   )}
   ```

### Problème : Examens n'apparaissent pas dans "Activité récente"

**Vérifications :**
1. Vérifier que `examStats.recentExams` existe :
   ```javascript
   console.log('recentExams:', examStats?.recentExams);
   ```
2. Vérifier le tri :
   ```javascript
   console.log('recentActivity après tri:', recentActivity);
   ```
3. Vérifier que `timestampDate` existe :
   ```javascript
   console.log('timestamp:', activity.timestampDate);
   ```

### Problème : Section Progress invisible

**Vérifications :**
1. Vérifier que `examStats` est chargé :
   ```javascript
   console.log('Progress examStats:', examStats);
   ```
2. Vérifier la requête Supabase :
   ```javascript
   const { data, error } = await supabase
     .from('exam_results')
     .select('*, examens(*)');
   console.log('data:', data, 'error:', error);
   ```
3. Vérifier la condition :
   ```javascript
   {examStats && examStats.totalExams > 0 && (
     // Section visible
   )}
   ```

---

## ✅ Checklist de validation

- [ ] Dashboard charge sans erreur
- [ ] Console affiche les logs `getUserExamStats`
- [ ] Carte "Statistiques des Examens" visible (si examens > 0)
- [ ] 4 métriques affichées correctement
- [ ] Bouton "Passer un nouvel examen" fonctionne
- [ ] Examens dans "Activité récente"
- [ ] Examens triés par date (plus récents en premier)
- [ ] Emoji difficulté affiché
- [ ] Progress charge sans erreur
- [ ] Section "Performance aux Examens" visible (si examens > 0)
- [ ] 4 cartes statistiques avec dégradés
- [ ] Liste "Examens récents" avec 10 max
- [ ] Badges difficulté colorés
- [ ] Scores colorés selon performance
- [ ] Dates formatées correctement
- [ ] Bouton "Passer un nouvel examen" fonctionne
- [ ] Workflow complet (passer examen → voir dans Dashboard/Progress)

---

## 📊 Exemple de données attendues

### Console Dashboard
```javascript
📊 [getUserExamStats] Récupération stats examens pour: b8fe56ad-1234-5678-9abc-def012345678
✅ [getUserExamStats] Résultats récupérés: 5
✅ [getUserExamStats] Stats: {
  totalExams: 5,
  averageScore: 78,
  bestScore: 95,
  totalTime: 450
}
📊 [Dashboard] Stats examens: { ... }
```

### Interface Dashboard - Carte Examens
```
┌──────────────────────────────────────────┐
│ 📝 Statistiques des Examens             │
├──────────────────────────────────────────┤
│  [5]      [78%]     [95%]      [450]    │
│  Examens  Score     Meilleur   Minutes  │
│  passés   moyen     score      totales   │
│                                           │
│   [Passer un nouvel examen] →            │
└──────────────────────────────────────────┘
```

### Interface Progress - Section Examens
```
┌──────────────────────────────────────────────┐
│ 📝 Performance aux Examens                  │
├──────────────────────────────────────────────┤
│  [5]          [78%]        [95%]     [450]  │
│  Examens      Score        Meilleur Minutes │
│  passés       moyen        score    totales  │
│                                               │
│ Examens récents                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔴 Mathématiques BFEM - Difficile   85% │ │
│ │ 🎯 Examen blanc • 45 min  • 8 oct.      │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🟡 Français BFEM - Moyen            72% │ │
│ │ 📚 Examen de matière • 30 min • 5 oct. │ │
│ └─────────────────────────────────────────┘ │
│                                               │
│   [Passer un nouvel examen] →                │
└──────────────────────────────────────────────┘
```

---

## 🎉 Résultat final attendu

Si tous les tests passent :

- ✅ Dashboard affiche les stats d'examens
- ✅ Examens mélangés dans l'activité récente
- ✅ Progress affiche une section complète examens
- ✅ Navigation fluide vers /exam
- ✅ Design cohérent et responsive
- ✅ Aucune erreur de console
- ✅ Données temps réel depuis Supabase

**Statut attendu : 🟢 TOUT FONCTIONNE !**
