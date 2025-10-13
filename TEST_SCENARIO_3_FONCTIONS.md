# ✅ TEST SCÉNARIO 3 : Tester les fonctions manuellement

## 🎯 Objectif
Tester directement les fonctions `awardPoints()` et `awardBadge()` pour voir si elles fonctionnent.

---

## 📋 Test dans la Console Navigateur

### Étape 1 : Ouvrir la console
1. Dans votre application, appuyez sur **F12**
2. Allez dans l'onglet **Console**

### Étape 2 : Récupérer votre user_id
Tapez et appuyez sur Entrée :

```javascript
// Récupérer l'utilisateur connecté
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user.id);
```

Notez le `user.id` qui s'affiche.

---

## 🧪 Test 3.1 : Fonction getUserPoints()

### Commande :
```javascript
// Importer les helpers
const { dbHelpers } = await import('./src/lib/supabaseHelpers.js');

// Tester getUserPoints
const userId = '10ab8c35-a67b-4c6d-a931-e7a80dca2058'; // Remplacez par votre ID
const points = await dbHelpers.getUserPoints(userId);
console.log('Points actuels:', points);
```

### ✅ Résultat attendu :
```javascript
Points actuels: {
  total_points: 1,
  level: 1,
  quizzes_completed: 3,
  current_streak: 0,
  longest_streak: 0,
  points_to_next_level: 100
}
```

### ❌ Si vous voyez `null` ou `undefined` :
**Problème** : Votre utilisateur n'existe pas dans `user_points`

**Solution** : Exécutez dans Supabase SQL Editor :
```sql
INSERT INTO user_points (user_id, total_points, level, points_to_next_level)
VALUES ('VOTRE-USER-ID-ICI', 0, 1, 100)
ON CONFLICT (user_id) DO NOTHING;
```

---

## 🧪 Test 3.2 : Fonction awardPoints()

### Commande :
```javascript
// Tester l'attribution de points
const result = await dbHelpers.awardPoints(userId, 100, 'test_manuel');
console.log('Résultat:', result);
```

### ✅ Résultat attendu :
```javascript
Résultat: {
  success: true,
  new_points: 101,  // Ancien total (1) + nouveau (100)
  level: 2,
  message: "Points awarded successfully"
}
```

### ❌ Si `success: false` :
```javascript
Résultat: {
  success: false,
  error: "Some error message"
}
```

**Copiez le message d'erreur et partagez-le !**

---

### 🔍 Vérifier dans Supabase après le test

1. Allez dans **Table Editor** → `user_points`
2. Trouvez votre ligne
3. Vérifiez que `total_points` a augmenté de 100

**Si la valeur n'a pas changé** :
- Le UPDATE échoue silencieusement
- Problème de permissions RLS
- Ou trigger `trigger_update_user_level` manquant

---

## 🧪 Test 3.3 : Fonction awardBadge()

### Commande :
```javascript
// Tester l'attribution d'un badge
const badgeResult = await dbHelpers.awardBadge(userId, {
  name: 'Test Badge',
  type: 'test',
  description: 'Badge de test manuel',
  icon: '🧪',
  condition_value: 1
});
console.log('Badge result:', badgeResult);
```

### ✅ Résultat attendu :
```javascript
Badge result: {
  success: true,
  data: {
    id: 1,
    user_id: "10ab8c35-...",
    badge_name: "Test Badge",
    badge_type: "test",
    earned_at: "2025-10-05T19:30:00"
  }
}
```

### ❌ Si erreur 23505 (duplicate) :
```javascript
Badge result: {
  success: false,
  error: "duplicate key value violates unique constraint",
  code: "23505"
}
```

**Signification** : Le badge existe déjà (c'est normal si vous testez 2 fois)

---

### ❌ Si autre erreur :
```javascript
Badge result: {
  success: false,
  error: "permission denied for table user_badges"
}
```

**Problème** : Permissions RLS bloquent l'insertion

**Solution** : Passez au **TEST SCÉNARIO 4** (vérifier RLS)

---

## 🧪 Test 3.4 : Vérifier les badges créés

### Commande :
```javascript
// Récupérer tous les badges de l'utilisateur
const badges = await dbHelpers.getUserBadges(userId);
console.log('Badges obtenus:', badges);
```

### ✅ Résultat attendu :
```javascript
Badges obtenus: [
  {
    id: 1,
    badge_name: "Test Badge",
    badge_type: "test",
    badge_description: "Badge de test manuel",
    badge_icon: "🧪",
    earned_at: "2025-10-05T19:30:00"
  }
]
```

### ❌ Si tableau vide `[]` :
**Problème** : Aucun badge dans la base de données

**Vérification** : Allez dans Supabase → Table Editor → `user_badges`

---

## 📊 Test complet en une fois

Copiez-collez tout ce bloc dans la console :

```javascript
(async () => {
  console.log('=== TEST COMPLET DES FONCTIONS ===');
  
  // 1. Récupérer user_id
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user.id;
  console.log('1️⃣ User ID:', userId);
  
  // 2. Importer helpers
  const { dbHelpers } = await import('./src/lib/supabaseHelpers.js');
  console.log('2️⃣ Helpers importés ✅');
  
  // 3. Tester getUserPoints
  const points = await dbHelpers.getUserPoints(userId);
  console.log('3️⃣ Points actuels:', points);
  
  // 4. Tester awardPoints
  const pointsResult = await dbHelpers.awardPoints(userId, 50, 'test');
  console.log('4️⃣ Attribution de 50 points:', pointsResult);
  
  // 5. Vérifier nouveaux points
  const newPoints = await dbHelpers.getUserPoints(userId);
  console.log('5️⃣ Points après attribution:', newPoints);
  
  // 6. Tester awardBadge
  const badgeResult = await dbHelpers.awardBadge(userId, {
    name: 'Test Console',
    type: 'test',
    description: 'Badge test depuis console',
    icon: '🧪',
    condition_value: 1
  });
  console.log('6️⃣ Création badge:', badgeResult);
  
  // 7. Récupérer badges
  const badges = await dbHelpers.getUserBadges(userId);
  console.log('7️⃣ Tous les badges:', badges);
  
  console.log('=== FIN DES TESTS ===');
})();
```

---

## 📸 Ce qu'il faut observer

### ✅ Tous les tests passent :
- Étapes 1-7 affichent des résultats
- `success: true` pour awardPoints
- `success: true` pour awardBadge
- Les valeurs augmentent correctement

**➡️ Signification** : Les fonctions fonctionnent !

**➡️ Problème** : Alors pourquoi `completeQuiz()` ne les appelle pas ?
- Vérifiez TEST SCÉNARIO 1 (les logs console)

---

### ❌ Une étape échoue :
- Notez à quelle étape (3, 4, 5, 6 ou 7)
- Copiez le message d'erreur
- Partagez-le avec moi

---

## 🎯 Prochaine étape

**Exécutez le test complet et partagez le résultat !**

Si tout fonctionne ici mais pas dans l'app → Problème d'import ou de cache
Si ça échoue ici aussi → Problème de base de données ou permissions
