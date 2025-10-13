# 🔧 Initialisation user_points - Solution immédiate

## ✅ Erreur identifiée

```
PGRST116: The result contains 0 rows
Cannot coerce the result to a single JSON object
```

**Cause** : Votre utilisateur n'a pas de ligne dans la table `user_points`.

**User ID** : `10ab8c35-a67b-4c6d-a931-e7a80dca2058`

---

## 🎯 Solution rapide (2 minutes)

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur https://supabase.com
2. Ouvrez votre projet **E-Réussite**
3. Menu gauche → **SQL Editor**
4. Cliquez sur **New Query**

### Étape 2 : Copier-coller ce code SQL

```sql
-- Initialiser votre utilisateur dans user_points
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
  '10ab8c35-a67b-4c6d-a931-e7a80dca2058',
  0,    -- Points initiaux
  1,    -- Niveau initial
  100,  -- Points pour passer au niveau 2
  0,    -- Aucun quiz complété au départ
  0,    -- Aucune leçon complétée au départ
  0,    -- Pas de streak
  0,    -- Pas de meilleur streak
  CURRENT_DATE
)
ON CONFLICT (user_id) DO NOTHING;

-- Vérifier que ça a fonctionné
SELECT * FROM user_points WHERE user_id = '10ab8c35-a67b-4c6d-a931-e7a80dca2058';
```

### Étape 3 : Exécuter (Run)

1. Cliquez sur **Run** (ou appuyez sur **F5**)
2. Vous devriez voir : `Success. Rows affected: 1`
3. En bas, vous devriez voir votre ligne créée avec tous les champs

---

## ✅ Résultat attendu

Après exécution, vous devriez voir une ligne comme :

```
| id | user_id              | total_points | level | quizzes_completed | ... |
|----|----------------------|--------------|-------|-------------------|-----|
| 1  | 10ab8c35-a67b-...    | 0            | 1     | 0                 | ... |
```

---

## 🎯 Étape 4 : Retester l'application

1. Retournez sur **http://localhost:3000**
2. **Ctrl + Shift + R** (hard refresh)
3. **F12** → Console → `clear()`
4. **Complétez un nouveau quiz**
5. **Regardez la console**

### ✅ Cette fois vous devriez voir :

```
[completeQuiz] Starting - User: 10ab8c35-... Score: 100
[completeQuiz] Quiz result saved
[completeQuiz] Points to award: 100
[completeQuiz] Points awarded: {success: true, new_points: 100}
[completeQuiz] Streak updated
[completeQuiz] Awarding perfect score badge
[completeQuiz] Badge result: {success: true, data: {...}}
[completeQuiz] User points data: {total_points: 100, quizzes_completed: 1, ...}
```

**SANS AUCUNE ERREUR ROUGE !** 🎉

---

## 📊 Vérification finale

Après avoir complété un quiz, retournez dans Supabase :

```sql
-- Voir vos points mis à jour
SELECT * FROM user_points WHERE user_id = '10ab8c35-a67b-4c6d-a931-e7a80dca2058';

-- Voir vos badges obtenus
SELECT * FROM user_badges WHERE user_id = '10ab8c35-a67b-4c6d-a931-e7a80dca2058';
```

Vous devriez voir :
- `total_points` : 100 (ou plus)
- `quizzes_completed` : 1 (ou plus)
- Au moins 1 badge dans `user_badges` (ex: "Quiz Parfait")

---

## 🔍 Pourquoi ce problème est arrivé ?

Le trigger `trigger_init_user_points` devrait créer cette ligne automatiquement quand un utilisateur s'inscrit.

**2 possibilités** :
1. Le trigger n'existe pas
2. Le trigger existe mais ne s'est pas déclenché pour votre utilisateur

### Vérifier si le trigger existe :

```sql
SELECT 
  trigger_name, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_init_user_points';
```

**Si aucun résultat** → Le trigger n'existe pas, il faut le créer :

```sql
-- Créer la fonction trigger
CREATE OR REPLACE FUNCTION init_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_points (user_id, total_points, level, points_to_next_level)
  VALUES (NEW.id, 0, 1, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur la table profiles
CREATE TRIGGER trigger_init_user_points
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION init_user_points();
```

---

## 🎯 Action immédiate

**Exécutez le premier SQL (initialisation manuelle) et retestez !**

Dites-moi ensuite si vous voyez les logs `[completeQuiz]` sans erreur. 🚀
