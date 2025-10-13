# 🚨 ERREUR PGRST116 - Utilisateur manquant dans user_points

## 📊 Diagnostic

**Erreur observée** :
```
GET .../user_points?select=*&user_id=eq.b8fe56ad-e6e8-44f8-940f-a9e1d1115097 406 (Not Acceptable)
PGRST116: The result contains 0 rows
Cannot coerce the result to a single JSON object
```

**Cause** :
L'utilisateur `b8fe56ad-e6e8-44f8-940f-a9e1d1115097` n'existe PAS dans la table `user_points`.

## ✅ Solution Rapide

### Étape 1 : Vérifier l'utilisateur actuel

1. Ouvrez **Supabase Dashboard** → SQL Editor
2. Exécutez cette requête :

```sql
-- Voir quel utilisateur est connecté
SELECT 
  auth.users.id,
  auth.users.email,
  profiles.full_name
FROM auth.users
LEFT JOIN profiles ON profiles.id = auth.users.id
WHERE auth.users.id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';
```

### Étape 2 : Initialiser l'utilisateur

Exécutez le contenu du fichier **`INIT_USER_b8fe56ad.sql`** :

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
  'b8fe56ad-e6e8-44f8-940f-a9e1d1115097',
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

### Étape 3 : Vérifier l'insertion

```sql
SELECT * FROM user_points 
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';
```

**Résultat attendu** :
| user_id | total_points | level | quizzes_completed |
|---------|-------------|-------|------------------|
| b8fe56ad... | 0 | 1 | 0 |

### Étape 4 : Rafraîchir le Dashboard

1. Retournez sur `http://localhost:3000/dashboard`
2. **Hard Refresh** : `Ctrl + Shift + R`
3. L'erreur devrait disparaître ✅

---

## 🔍 Pourquoi ce problème ?

### Explication du trigger

Normalement, le trigger `trigger_init_user_points` devrait automatiquement créer une ligne dans `user_points` quand un utilisateur s'inscrit.

**Vérifier le trigger** :

```sql
-- Voir si le trigger existe
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_init_user_points';

-- Voir la fonction associée
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'init_user_points';
```

### Cas où le trigger ne s'exécute pas :

1. ❌ **Utilisateur créé AVANT l'installation du trigger**
2. ❌ **Erreur lors de l'exécution du trigger**
3. ❌ **Permissions RLS qui bloquent l'insertion**

---

## 🛠️ Solution Permanente

### Option A : Corriger le trigger

Assurez-vous que le trigger est actif :

```sql
CREATE OR REPLACE FUNCTION init_user_points()
RETURNS TRIGGER AS $$
BEGIN
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
    NEW.id,
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer ou recréer le trigger
DROP TRIGGER IF EXISTS trigger_init_user_points ON auth.users;
CREATE TRIGGER trigger_init_user_points
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION init_user_points();
```

### Option B : Script d'initialisation manuelle

Pour tous les utilisateurs existants sans entry dans `user_points` :

```sql
-- Trouver tous les utilisateurs sans user_points
SELECT 
  u.id,
  u.email,
  p.full_name
FROM auth.users u
LEFT JOIN user_points up ON up.user_id = u.id
LEFT JOIN profiles p ON p.id = u.id
WHERE up.user_id IS NULL;

-- Initialiser tous les utilisateurs manquants
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
)
SELECT 
  u.id,
  0,
  1,
  100,
  0,
  0,
  0,
  0,
  CURRENT_DATE
FROM auth.users u
LEFT JOIN user_points up ON up.user_id = u.id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
```

---

## 🎯 Checklist de Correction

- [ ] Exécuter `INIT_USER_b8fe56ad.sql`
- [ ] Vérifier que la ligne existe dans `user_points`
- [ ] Hard refresh du Dashboard (`Ctrl+Shift+R`)
- [ ] Vérifier que l'erreur PGRST116 a disparu
- [ ] Optionnel : Vérifier/corriger le trigger
- [ ] Optionnel : Initialiser tous les autres utilisateurs

---

## 📝 Notes

**Utilisateurs initialisés** :
1. ✅ `10ab8c35-a67b-4c6d-a931-e7a80dca2058` (premier utilisateur)
2. 🔄 `b8fe56ad-e6e8-44f8-940f-a9e1d1115097` (utilisateur actuel)

**Prochains utilisateurs** :
- Seront automatiquement initialisés SI le trigger fonctionne
- Sinon, utiliser le script d'initialisation manuelle ci-dessus

---

*Diagnostic créé le 5 octobre 2025*
