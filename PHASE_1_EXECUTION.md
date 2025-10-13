# 🎯 PHASE 1 - Système de points pour l'apprentissage

**Date** : 6 octobre 2025  
**Statut** : ✅ Code créé, prêt pour exécution

---

## 📋 Fichiers créés/modifiés

### 1. Migration SQL ✅
**Fichier** : `database/migrations/010_learning_points_system.sql`

**Contenu** :
- ✅ Fonction `award_lesson_completion_points()` - Attribue automatiquement les points
- ✅ Fonction `get_user_learning_stats()` - Statistiques d'apprentissage
- ✅ Permissions RLS configurées

### 2. Helper JavaScript ✅
**Fichier** : `src/lib/supabaseDB.js`

**Modifications** :
- ✅ `completeLecon()` mise à jour pour appeler la fonction RPC
- ✅ Retourne maintenant les informations de points
- ✅ Gestion d'erreur si l'attribution de points échoue

### 3. Interface utilisateur ✅
**Fichier** : `src/pages/CourseDetail.jsx`

**Modifications** :
- ✅ `handleCompleteLecon()` affiche les points gagnés
- ✅ Toast avec détail des bonus (chapitre/cours)
- ✅ Durée de toast adaptée selon les bonus

---

## 🚀 Instructions d'exécution

### Étape 1 : Vérifier la structure de user_progression
```sql
-- Exécutez dans Supabase SQL Editor
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_progression'
ORDER BY ordinal_position;
```

**Important** : Vérifiez que la table contient :
- `user_id` (UUID)
- `lecon_id` (INT)
- `completed_at` (TIMESTAMP)
- `completed` (BOOLEAN) - si cette colonne existe

### Étape 2 : Ajuster la migration si nécessaire

Si la colonne s'appelle `completed` au lieu de vérifier `completed_at`, il faudra ajuster la fonction SQL.

### Étape 3 : Exécuter la migration 010
```sql
-- Copiez tout le contenu de :
database/migrations/010_learning_points_system.sql

-- Collez dans Supabase SQL Editor et exécutez
```

### Étape 4 : Tester l'attribution de points

1. **Test manuel de la fonction** :
```sql
-- Remplacez par votre user_id et un lecon_id valide
SELECT * FROM award_lesson_completion_points(
  'votre-user-id-uuid'::UUID,
  1
);
```

**Résultat attendu** :
| points_earned | chapter_bonus | course_bonus | total_points | chapter_completed | course_completed |
|---------------|---------------|--------------|--------------|-------------------|------------------|
| 10            | 0             | 0            | 10           | false             | false            |

2. **Test des statistiques** :
```sql
SELECT * FROM get_user_learning_stats('votre-user-id-uuid'::UUID);
```

### Étape 5 : Tester dans l'interface

1. Allez sur `/course/:matiereId`
2. Complétez une leçon
3. **Vérifiez le toast** : Doit afficher "+10 points !"
4. Complétez toutes les leçons d'un chapitre
5. **Vérifiez le toast** : Doit afficher "+10 points | 🎯 +50 pts (chapitre complet !)"

---

## 📊 Système de points

| Action                    | Points |
|---------------------------|--------|
| Leçon complétée           | +10    |
| Chapitre complet (bonus)  | +50    |
| Cours complet (bonus)     | +200   |

**Total possible par cours** : 10 × nb_leçons + 50 × nb_chapitres + 200

**Exemple** : Mathématiques BFEM (3 chapitres, 9 leçons)
- Points leçons : 10 × 9 = 90
- Bonus chapitres : 50 × 3 = 150
- Bonus cours : 200
- **Total** : 440 points

---

## 🐛 Débogage

### Problème : Points non attribués

**Vérifiez** :
```sql
-- La fonction existe-t-elle ?
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'award_lesson_completion_points';

-- Les points sont-ils dans la table ?
SELECT * FROM user_points 
WHERE user_id = 'votre-user-id' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Problème : Toast n'affiche pas les points

**Console browser** :
```javascript
// Ouvrez la console et complétez une leçon
// Vérifiez la structure de data.points
```

---

## ✅ Checklist de validation

- [ ] Migration 010 exécutée sans erreur
- [ ] Fonction `award_lesson_completion_points` existe
- [ ] Fonction `get_user_learning_stats` existe
- [ ] Test manuel de la fonction RPC réussi
- [ ] Leçon complétée → toast "+10 points"
- [ ] Chapitre complet → toast avec bonus
- [ ] Points visibles dans user_points table
- [ ] Points visibles dans le Dashboard

---

## 🎯 Prochaine étape

Une fois la Phase 1 validée → **Phase 2 : Badges d'apprentissage**
- Création des badges
- Déblocage automatique
- Affichage dans le profil

---

**Status** : 🚀 PRÊT POUR TESTS
