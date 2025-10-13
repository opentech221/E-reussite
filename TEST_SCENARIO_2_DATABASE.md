# ✅ TEST SCÉNARIO 2 : Base de Données Supabase

## 🎯 Objectif
Vérifier si les tables existent et contiennent vos données.

---

## 📋 Étape par étape

### Étape 1 : Accéder à Supabase
1. Allez sur https://supabase.com
2. Connectez-vous à votre compte
3. Cliquez sur votre projet **E-Réussite**

### Étape 2 : Ouvrir Table Editor
4. Dans le menu de gauche, cliquez sur **Table Editor**
5. Vous verrez la liste de toutes vos tables

---

## 🔍 Test 2.1 : Vérifier table `user_points`

### Action :
1. Cliquez sur la table **`user_points`** dans la liste
2. Cherchez une ligne avec votre `user_id` : `10ab8c35-a67b-4c6d-a931-e7a80dca2058`

### ✅ Résultat A : La ligne existe

Si vous voyez une ligne comme :
```
| id | user_id                              | total_points | level | quizzes_completed |
|----|--------------------------------------|--------------|-------|-------------------|
| 1  | 10ab8c35-a67b-4c6d-a931-e7a80dca2058 | 1            | 1     | 3                 |
```

**✅ Signification** : La table existe et votre utilisateur est enregistré !

**🤔 Observation** : 
- `total_points: 1` au lieu de ~300 → Les points ne s'accumulent pas
- `quizzes_completed: 3` → Le compteur fonctionne correctement

**➡️ Problème identifié** : La fonction `awardPoints()` ne fait pas l'UPDATE correctement

**➡️ Solution** : Passez au **TEST SCÉNARIO 3** (tester les fonctions manuellement)

---

### ❌ Résultat B : Aucune ligne pour votre user_id

Si la table existe mais est **vide** ou ne contient pas votre `user_id` :

```
(table vide ou lignes d'autres utilisateurs seulement)
```

**❌ Signification** : Votre utilisateur n'a jamais été initialisé dans `user_points` !

**➡️ Cause probable** : 
- Le trigger `trigger_init_user_points` ne s'est pas déclenché
- Ou il n'existe pas

**➡️ Solution immédiate** : Exécutez cette commande SQL

1. Cliquez sur **SQL Editor** (menu gauche)
2. Cliquez sur **New Query**
3. Collez ce code :

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
  0,
  1,
  100,
  0,
  0,
  0,
  0,
  CURRENT_DATE
)
ON CONFLICT (user_id) DO NOTHING;
```

4. Cliquez sur **Run** (ou F5)
5. Retournez dans **Table Editor** → `user_points`
6. Vérifiez que la ligne est créée

**➡️ Ensuite** : Refaites un quiz et vérifiez si `total_points` augmente

---

### 🚫 Résultat C : Table n'existe pas

Si vous ne voyez pas `user_points` dans la liste des tables :

**🚫 Signification** : La migration n'a pas été exécutée !

**➡️ Solution** : Exécutez la migration

1. Cliquez sur **SQL Editor**
2. Ouvrez le fichier `003_gamification_tables.sql`
3. Copiez tout son contenu
4. Collez dans une nouvelle query
5. Cliquez sur **Run**

---

## 🔍 Test 2.2 : Vérifier table `user_badges`

### Action :
1. Cliquez sur la table **`user_badges`**
2. Cherchez des lignes avec votre `user_id`

### ✅ Résultat A : Au moins un badge

Si vous voyez :
```
| id | user_id      | badge_name    | badge_type | earned_at           |
|----|--------------|---------------|------------|---------------------|
| 1  | 10ab8c35-... | Quiz Parfait  | perfection | 2025-10-05 19:00:00 |
```

**✅ Signification** : Les badges fonctionnent !

**➡️ Problème** : Les badges sont dans la DB mais pas affichés (problème d'interface)

---

### ❌ Résultat B : Aucun badge

Si la table est vide :

**❌ Signification** : La fonction `awardBadge()` échoue silencieusement

**➡️ Passez au TEST SCÉNARIO 3** pour tester manuellement

---

## 🔍 Test 2.3 : Vérifier les triggers

### Action :
1. Cliquez sur **SQL Editor**
2. Nouvelle query, collez :

```sql
-- Vérifier les triggers
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
  AND event_object_table IN ('user_points', 'user_badges', 'profiles');
```

3. Cliquez sur **Run**

### ✅ Résultat attendu :

Vous devriez voir au moins :
- `trigger_init_user_points` sur table `profiles`
- `trigger_update_user_level` sur table `user_points`

### ❌ Si aucun trigger :

**Solution** : Exécutez depuis le fichier migration :

```sql
-- Créer le trigger d'initialisation
CREATE OR REPLACE FUNCTION init_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_points (user_id, total_points, level, points_to_next_level)
  VALUES (NEW.id, 0, 1, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_init_user_points
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION init_user_points();
```

---

## 📊 Résumé visuel

Cochez ce que vous trouvez :

**Tables existantes :**
- [ ] `user_points` existe
- [ ] `user_badges` existe  
- [ ] `user_progress` existe

**Données de votre utilisateur :**
- [ ] Ligne dans `user_points` avec votre user_id
- [ ] `total_points` > 0
- [ ] `quizzes_completed` = 3 ou plus
- [ ] Au moins 1 badge dans `user_badges`

**Triggers :**
- [ ] `trigger_init_user_points` existe
- [ ] `trigger_update_user_level` existe

---

## 🎯 Prochaine étape

**Partagez-moi vos résultats** :
- Les tables existent ? ✅/❌
- Votre ligne dans user_points ? ✅/❌
- Valeur de `total_points` : ?
- Nombre de badges : ?
