# ✅ TEST SCÉNARIO 4 : Vérifier les Permissions RLS

## 🎯 Objectif
Vérifier que les Row Level Security (RLS) policies permettent l'insertion et la mise à jour.

---

## 📋 Vérifier dans Supabase

### Étape 1 : Accéder aux Policies
1. Ouvrez votre projet Supabase
2. Menu gauche → **Authentication**
3. Cliquez sur **Policies**

### Étape 2 : Vérifier table `user_points`

Cherchez les policies pour `user_points` :

#### ✅ Policies requises :

1. **SELECT Policy** (lecture)
   - Nom : "Users can view own points" (ou similaire)
   - Policy : `auth.uid() = user_id`
   - Operation : SELECT

2. **INSERT Policy** (création)
   - Nom : "Users can insert own points"
   - Policy : `auth.uid() = user_id`
   - Operation : INSERT

3. **UPDATE Policy** (modification)
   - Nom : "Users can update own points"
   - Policy : `auth.uid() = user_id`
   - Operation : UPDATE

---

### ❌ Si les policies manquent

Exécutez dans **SQL Editor** :

```sql
-- Activer RLS sur user_points
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Policy SELECT
CREATE POLICY "Users can view own points"
ON user_points FOR SELECT
USING (auth.uid() = user_id);

-- Policy INSERT
CREATE POLICY "Users can insert own points"
ON user_points FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE
CREATE POLICY "Users can update own points"
ON user_points FOR UPDATE
USING (auth.uid() = user_id);
```

---

### Étape 3 : Vérifier table `user_badges`

Cherchez les policies pour `user_badges` :

#### ✅ Policies requises :

1. **SELECT Policy**
   - Policy : `auth.uid() = user_id`
   - Operation : SELECT

2. **INSERT Policy**
   - Policy : `auth.uid() = user_id`
   - Operation : INSERT

---

### ❌ Si les policies manquent

```sql
-- Activer RLS sur user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policy SELECT
CREATE POLICY "Users can view own badges"
ON user_badges FOR SELECT
USING (auth.uid() = user_id);

-- Policy INSERT
CREATE POLICY "Users can insert own badges"
ON user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 🧪 Tester les permissions manuellement

### Test INSERT sur user_points

Dans SQL Editor, exécutez :

```sql
-- Test en tant qu'utilisateur connecté
INSERT INTO user_points (
  user_id,
  total_points,
  level,
  points_to_next_level
) VALUES (
  auth.uid(),  -- Utilise l'utilisateur connecté
  999,
  10,
  1000
)
ON CONFLICT (user_id) DO UPDATE SET
  total_points = 999,
  level = 10;
```

#### ✅ Si succès :
```
Success. Rows affected: 1
```

**Signification** : Les permissions fonctionnent !

---

#### ❌ Si erreur :
```
ERROR: permission denied for table user_points
```

**Solution** : Les policies ne sont pas créées ou incorrectes

---

## 🔍 Vérifier l'état RLS

### Commande SQL :

```sql
-- Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('user_points', 'user_badges', 'user_progress');
```

#### ✅ Résultat attendu :
```
schemaname | tablename     | rowsecurity
-----------|---------------|------------
public     | user_points   | true
public     | user_badges   | true
public     | user_progress | true
```

#### ❌ Si `rowsecurity = false` :

RLS n'est pas activé sur ces tables.

**Solution** :
```sql
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
```

---

## 🔍 Lister toutes les policies existantes

### Commande SQL :

```sql
-- Lister les policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('user_points', 'user_badges', 'user_progress')
ORDER BY tablename, policyname;
```

Cela vous montrera toutes les policies définies.

---

## 🛠️ Script complet de réparation

Si vous voulez tout créer/réparer d'un coup :

```sql
-- ============================================
-- SCRIPT COMPLET : Policies RLS Gamification
-- ============================================

-- 1. Activer RLS sur toutes les tables
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer anciennes policies (si elles existent)
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
DROP POLICY IF EXISTS "Users can insert own points" ON user_points;
DROP POLICY IF EXISTS "Users can update own points" ON user_points;
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

-- 3. Créer policies pour user_points
CREATE POLICY "Users can view own points"
ON user_points FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points"
ON user_points FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
ON user_points FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Créer policies pour user_badges
CREATE POLICY "Users can view own badges"
ON user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
ON user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Créer policies pour user_progress
CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);

-- 6. Vérification
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('user_points', 'user_badges', 'user_progress')
ORDER BY tablename, cmd;
```

---

## 📊 Checklist

Cochez ce qui est correct :

**RLS activé :**
- [ ] `user_points` → rowsecurity = true
- [ ] `user_badges` → rowsecurity = true
- [ ] `user_progress` → rowsecurity = true

**Policies user_points :**
- [ ] SELECT policy existe
- [ ] INSERT policy existe
- [ ] UPDATE policy existe

**Policies user_badges :**
- [ ] SELECT policy existe
- [ ] INSERT policy existe

**Test manuel :**
- [ ] INSERT fonctionne sans erreur
- [ ] UPDATE fonctionne sans erreur

---

## 🎯 Prochaine étape

**Exécutez le script complet de réparation, puis retestez !**

Si les permissions sont OK mais ça ne fonctionne toujours pas :
→ Revenez au **TEST SCÉNARIO 1** pour vérifier les logs
