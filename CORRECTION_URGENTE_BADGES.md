# 🚨 CORRECTION URGENTE : Badges Schema Mismatch

**Date** : 23 octobre 2025  
**Priorité** : CRITIQUE  
**Cause** : Code utilise `badge_name` mais table `user_badges` contient `badge_id` (FK)

---

## 🔍 Problème

Après migration V3, la structure BDD est :
- ✅ **`user_badges`** : `id`, `user_id`, `badge_id` (FK vers badges.badge_id)
- ✅ **`badges`** : `id`, `badge_id`, `name`, `icon_name`, `description`

Mais le code fait encore :
```sql
-- ❌ INCORRECT
SELECT badge_name, badge_icon, badge_type, badge_description 
FROM user_badges

-- ✅ CORRECT
SELECT ub.*, b.name, b.icon_name, b.description
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.badge_id
```

---

## 📋 Fichiers à corriger (7)

### 1. **src/components/BadgeSystem.jsx**
- Ligne 383 : `select('badge_name, earned_at')`
- Ligne 387 : Mapping des résultats
- Ligne 408 : Autre requête badges

### 2. **src/pages/Social.jsx**
- Ligne 70 : `select('badge_name, earned_at')`
- Lignes 128-131 : Usage `achievement.badge_name`
- Lignes 338, 344 : Affichage badges

### 3. **src/pages/CoachIA.jsx**
- Ligne 342 : `select('badge_name, badge_icon, badge_type, badge_description, earned_at')`
- Ligne 376 : Map `b.badge_name`

### 4. **src/pages/ActivityHistory.jsx**
- Lignes 266-269 : Select avec colonnes inexistantes
- Lignes 279-281 : Mapping résultats

### 5. **src/pages/Dashboard.jsx**
- Lignes 1560-1561 : Affichage `badge.badge_name`, `badge.badge_description`

### 6. **src/lib/supabaseHelpers.js**
- Lignes 588-591 : Insert `badge_name`, `badge_type`, etc.

### 7. **src/lib/analytics.js**
- Ligne 214 : `badge_name: badgeName`

---

## ✅ Solution : Nouvelle structure de requête

```javascript
// Pattern à utiliser partout
const { data, error } = await supabase
  .from('user_badges')
  .select(`
    id,
    earned_at,
    badge_id,
    badges!inner (
      badge_id,
      name,
      icon_name,
      description
    )
  `)
  .eq('user_id', userId)
  .order('earned_at', { ascending: false });

// Résultat attendu :
// {
//   id: 1,
//   earned_at: '2025-10-23',
//   badge_id: 'premier_pas',
//   badges: {
//     badge_id: 'premier_pas',
//     name: 'Premier Pas',
//     icon_name: '🎯',
//     description: 'Complété le premier quiz'
//   }
// }
```

---

## 🎯 Plan d'action

1. ✅ Corriger `BadgeSystem.jsx` (composant principal)
2. ✅ Corriger `Social.jsx` (page /social)
3. ✅ Corriger `CoachIA.jsx` (page /coach-ia)
4. ✅ Corriger `ActivityHistory.jsx` (page /historique)
5. ✅ Corriger `Dashboard.jsx` (section badges)
6. ✅ Vérifier `supabaseHelpers.js` (fonction awardBadge)
7. ✅ Tester toutes les pages

---

## 🧪 Tests à faire après correction

- [ ] Page `/badges` : Liste des badges s'affiche
- [ ] Page `/social` : Section achievements OK
- [ ] Page `/coach-ia` : Recent badges s'affichent
- [ ] Page `/historique` : Activités badges OK
- [ ] Dashboard : Section "Badges récents" fonctionne
- [ ] Console : Plus d'erreur 400 "badge_name does not exist"

---

**Début correction** : Maintenant  
**Estimation** : 20 minutes  
**Difficulté** : Moyenne (requêtes JOIN)
