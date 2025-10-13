# 🔍 Guide de débogage - Points et Badges non attribués

## 📊 Situation observée

### Dashboard actuel :
- ✅ 3 quiz complétés à 100%
- ❌ **1 seul point** affiché (devrait être ~300 points)
- ❌ **0 badges obtenus** (devrait avoir "Quiz Parfait" au minimum)
- ❌ **0 jours de streak** (devrait être au moins 1)

### Page badges actuelle :
- ✅ Tous les badges disponibles affichés
- ❌ Aucun badge marqué comme "obtenu"
- ✅ Interface fonctionnelle

---

## 🧪 Tests à effectuer MAINTENANT

### Test 1 : Vérifier les logs console

1. **Ouvrir les DevTools** (`F12`)
2. **Aller dans Console**
3. **Compléter un nouveau quiz**
4. **Chercher ces logs** :

```
[completeQuiz] Starting - User: xxx Score: xxx Quiz: xxx
[completeQuiz] Quiz result saved
[completeQuiz] Points to award: 100
[completeQuiz] Points awarded: {...}
[completeQuiz] Streak updated
[completeQuiz] Awarding perfect score badge
[completeQuiz] Badge result: {...}
[completeQuiz] User points data: {...}
```

### ✅ Si tous les logs apparaissent :
→ **Le code s'exécute** mais il y a un problème avec les fonctions helper

### ❌ Si aucun log n'apparaît :
→ **Le code ne s'exécute pas** - problème d'import ou de cache

### ⚠️ Si les logs s'arrêtent à un endroit spécifique :
→ **Une fonction échoue** - noter laquelle

---

## 🔍 Test 2 : Vérifier la base de données

### Dans Supabase Dashboard :

**1. Vérifier table `user_points` :**
```sql
SELECT * FROM user_points WHERE user_id = '10ab8c35-a67b-4c6d-a931-e7a80dca2058';
```

**Attendu :**
- `total_points`: devrait être > 100
- `quizzes_completed`: devrait être >= 3
- `level`: devrait être calculé automatiquement
- `last_activity_date`: date du jour

**Si la ligne n'existe pas :**
→ La fonction `awardPoints()` ne crée pas l'enregistrement

---

**2. Vérifier table `user_badges` :**
```sql
SELECT * FROM user_badges WHERE user_id = '10ab8c35-a67b-4c6d-a931-e7a80dca2058';
```

**Attendu :**
- Au moins 1 ligne avec `badge_name = 'Quiz Parfait'`

**Si aucune ligne :**
→ La fonction `awardBadge()` échoue silencieusement

---

**3. Vérifier trigger `trigger_init_user_points` :**
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_init_user_points';
```

**Si vide :**
→ Le trigger n'existe pas, il faut le créer

---

## 🛠️ Solutions possibles

### Solution 1 : Initialiser manuellement user_points

Si la table `user_points` est vide, exécutez dans Supabase :

```sql
INSERT INTO user_points (
  user_id, 
  total_points, 
  level, 
  points_to_next_level,
  quizzes_completed,
  lessons_completed,
  current_streak,
  longest_streak,
  last_activity_date
) VALUES (
  '10ab8c35-a67b-4c6d-a931-e7a80dca2058',  -- Votre user_id
  0,     -- total_points (sera mis à jour)
  1,     -- level initial
  100,   -- points_to_next_level
  0,     -- quizzes_completed
  0,     -- lessons_completed
  0,     -- current_streak
  0,     -- longest_streak
  CURRENT_DATE
)
ON CONFLICT (user_id) DO NOTHING;
```

Puis refaites un quiz.

---

### Solution 2 : Vérifier les permissions RLS

Les politiques Row Level Security peuvent bloquer les insertions.

**Dans Supabase → Authentication → Policies :**

1. Table `user_points` doit avoir :
   - ✅ Policy SELECT : `auth.uid() = user_id`
   - ✅ Policy INSERT : `auth.uid() = user_id`
   - ✅ Policy UPDATE : `auth.uid() = user_id`

2. Table `user_badges` doit avoir :
   - ✅ Policy SELECT : `auth.uid() = user_id`
   - ✅ Policy INSERT : `auth.uid() = user_id`

**Si les policies n'existent pas**, exécutez :

```sql
-- Policies pour user_points
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
ON user_points FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points"
ON user_points FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
ON user_points FOR UPDATE
USING (auth.uid() = user_id);

-- Policies pour user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
ON user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
ON user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

### Solution 3 : Vérifier les fonctions helper

**Test manuel dans la console navigateur :**

```javascript
// Importer dbHelpers
import { dbHelpers } from './src/lib/supabaseHelpers.js';

// Tester getUserPoints
const userId = '10ab8c35-a67b-4c6d-a931-e7a80dca2058';
const points = await dbHelpers.getUserPoints(userId);
console.log('Points:', points);

// Tester awardPoints
const result = await dbHelpers.awardPoints(userId, 100, 'test');
console.log('Award result:', result);

// Tester getUserBadges
const badges = await dbHelpers.getUserBadges(userId);
console.log('Badges:', badges);
```

---

## 📝 Checklist de diagnostic

Cochez ce qui s'affiche correctement :

### Console navigateur :
- [ ] Logs `[completeQuiz]` apparaissent
- [ ] Pas d'erreurs rouges
- [ ] Toast notification "+100 points" apparaît

### Base de données Supabase :
- [ ] Table `user_points` existe
- [ ] Ligne pour votre user_id existe dans `user_points`
- [ ] Table `user_badges` existe
- [ ] Au moins 1 badge dans `user_badges`
- [ ] Trigger `trigger_init_user_points` existe
- [ ] Trigger `trigger_update_user_level` existe
- [ ] Function `calculate_level()` existe

### Permissions RLS :
- [ ] RLS activé sur `user_points`
- [ ] RLS activé sur `user_badges`
- [ ] Policy SELECT sur `user_points`
- [ ] Policy INSERT sur `user_points`
- [ ] Policy SELECT sur `user_badges`
- [ ] Policy INSERT sur `user_badges`

---

## 🎯 Prochaine étape

**1. Faites les tests ci-dessus**
**2. Notez ce qui ne fonctionne pas**
**3. Partagez les résultats des logs console**

Ensuite nous pourrons corriger précisément le problème ! 🚀
