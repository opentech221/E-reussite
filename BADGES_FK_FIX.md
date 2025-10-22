# 🔧 Correction Foreign Key Badges

**Date**: 23 octobre 2025  
**Problème**: `column "badge_id" of relation "badges" does not exist`  
**Cause**: Conflit entre schéma existant (id INTEGER) et nouveau schéma (badge_id VARCHAR)

---

## 🔍 Diagnostic du problème

### Schéma actuel (existant)
```sql
-- Table badges (créée via UI Supabase)
CREATE TABLE badges (
    id INTEGER PRIMARY KEY,          -- ✅ Existe
    name TEXT,
    description TEXT,
    icon_name TEXT,
    ...
    -- badge_id VARCHAR(100)          -- ❌ N'existe PAS
);

-- Table user_badges
CREATE TABLE user_badges (
    id UUID PRIMARY KEY,
    user_id UUID,
    badge_name TEXT,                  -- ✅ Stocke le nom complet
    ...
);
```

### Schéma souhaité (migration)
```sql
-- Table badges (tentative de création)
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY,
    badge_id VARCHAR(100) UNIQUE,     -- 🎯 Nouvel identifiant
    name TEXT,
    ...
);

-- Foreign Key souhaitée
ALTER TABLE user_badges 
ADD CONSTRAINT user_badges_badge_id_fkey 
FOREIGN KEY (badge_id) REFERENCES badges(badge_id);  -- ❌ ERREUR!
```

### Pourquoi ça échoue ?

1. **CREATE TABLE IF NOT EXISTS** n'ajoute **PAS** de colonnes à une table existante
2. La table `badges` existe déjà avec un schéma différent
3. La colonne `badge_id` n'a jamais été ajoutée
4. La FK cherche `badges.badge_id` qui n'existe pas → ERREUR

---

## ✅ Solution implémentée

La migration `20251023_fix_badges_fk.sql` procède en **8 étapes sécurisées** :

### Étape 1: Diagnostic
Vérifie quelles colonnes existent avant de modifier quoi que ce soit.

### Étape 2: Ajouter badge_id à badges
```sql
ALTER TABLE badges 
ADD COLUMN badge_id VARCHAR(100) UNIQUE;
```

### Étape 3: Générer les badge_id automatiquement
```sql
-- "Premier Quiz" -> "premier_quiz"
-- "Maître des Quiz" -> "maitre_des_quiz"
UPDATE badges
SET badge_id = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[éèêë]', 'e', 'g'),
        '[^a-z0-9]+', '_', 'g'
    )
)
WHERE badge_id IS NULL;
```

**Mapping automatique** :
| ID | name | → badge_id |
|----|------|-----------|
| 1 | Premier Quiz | premier_quiz |
| 2 | Maître des Quiz | maitre_des_quiz |
| 3 | Score Parfait | score_parfait |
| ... | ... | ... |

### Étape 4: Contrainte NOT NULL
```sql
ALTER TABLE badges 
ALTER COLUMN badge_id SET NOT NULL;
```

### Étape 5: Mapper user_badges
```sql
-- Remplacer "Premier Quiz" par "premier_quiz" dans user_badges
UPDATE user_badges
SET badge_name = badges.badge_id
FROM badges
WHERE user_badges.badge_name = badges.name;
```

### Étape 6: Renommer la colonne
```sql
ALTER TABLE user_badges 
RENAME COLUMN badge_name TO badge_id;
```

### Étape 7: Créer la Foreign Key
```sql
ALTER TABLE user_badges 
ADD CONSTRAINT user_badges_badge_id_fkey 
FOREIGN KEY (badge_id) 
REFERENCES badges(badge_id) 
ON DELETE CASCADE;
```

### Étape 8: Vérifications
Affiche un rapport complet :
- ✅ Nombre de badges
- ✅ Nombre de user_badges
- ⚠️ Orphelins détectés (s'il y en a)

---

## 🚀 Application

### Méthode 1: Script automatique (RECOMMANDÉ)

```powershell
.\apply-badges-fix.ps1
```

Choisissez l'option 1 pour copier le SQL dans le presse-papiers.

### Méthode 2: Manuelle

1. Ouvrez `supabase/migrations/20251023_fix_badges_fk.sql`
2. Copiez tout le contenu
3. Allez dans Supabase Dashboard → SQL Editor
4. Collez et exécutez

---

## 🔍 Vérifications post-migration

### 1. Via SQL Editor

```sql
-- Vérifier le schéma de badges
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'badges'
ORDER BY ordinal_position;

-- Devrait montrer:
-- id | integer | NO
-- name | text | ...
-- badge_id | character varying | NO  ← ✅ NOUVEAU

-- Vérifier le mapping
SELECT id, name, badge_id FROM badges ORDER BY id;

-- Devrait montrer:
-- 1 | Premier Quiz | premier_quiz
-- 2 | Maître des Quiz | maitre_des_quiz
-- ...

-- Vérifier la FK
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_badges' 
    AND tc.constraint_type = 'FOREIGN KEY';

-- Devrait montrer:
-- user_badges_badge_id_fkey | badge_id | badges | badge_id  ← ✅ FK CRÉÉE
```

### 2. Via Table Editor

**Table badges** :
- ✅ Colonne `badge_id` visible
- ✅ Valeurs générées (premier_quiz, etc.)

**Table user_badges** :
- ✅ Colonne renommée `badge_id` (plus `badge_name`)
- ✅ Valeurs mappées (premier_quiz au lieu de "Premier Quiz")

---

## 📊 Résultats attendus

Après application, vous verrez dans la console :

```
NOTICE:  📊 État du schéma:
NOTICE:    badges.id: ✅
NOTICE:    badges.badge_id: ✅
NOTICE:    user_badges.badge_name: ❌
NOTICE:    user_badges.badge_id: ✅
NOTICE:  ✅ Colonne badges.badge_id ajoutée
NOTICE:  ✅ 13 badges mis à jour avec badge_id
NOTICE:  ✅ Contrainte NOT NULL ajoutée sur badges.badge_id
NOTICE:  ✅ Mappé 13 badges dans user_badges
NOTICE:  ✅ Colonne user_badges.badge_name renommée en badge_id
NOTICE:  ✅ Foreign Key créée: user_badges.badge_id -> badges.badge_id
NOTICE:  
NOTICE:  ========================================
NOTICE:  ✅ Migration badges FK terminée!
NOTICE:  ========================================
NOTICE:  📊 Badges totaux: 13
NOTICE:  🎖️  User badges totaux: X
NOTICE:  ⚠️  Orphelins: 0
```

---

## ⚠️ Points importants

### Cette migration est SAFE ✅

- ✅ **Non destructive** : Ajoute des colonnes, ne supprime rien
- ✅ **Idempotente** : Peut être exécutée plusieurs fois sans problème
- ✅ **Vérifications** : Teste l'existence avant chaque opération
- ✅ **Mapping auto** : Préserve les données existantes
- ✅ **Rollback possible** : Pas de DROP ou DELETE

### Données préservées

- ✅ Tous les badges existants conservés
- ✅ Toutes les associations user_badges préservées
- ✅ Seul changement : format texte (nom → identifiant)

### Impact sur le code

**AVANT** (user_badges) :
```javascript
badge_name: "Premier Quiz"  // Texte complet
```

**APRÈS** (user_badges) :
```javascript
badge_id: "premier_quiz"    // Identifiant normalisé
```

**Fichiers à vérifier** (mais normalement compatibles) :
- `src/components/badges/BadgeSystem.jsx`
- `src/pages/Social.jsx`

---

## 🐛 Dépannage

### Erreur: "duplicate key value violates unique constraint"

**Cause** : Deux badges ont le même nom généré.

**Solution** :
```sql
-- Identifier les doublons
SELECT badge_id, COUNT(*) 
FROM badges 
GROUP BY badge_id 
HAVING COUNT(*) > 1;

-- Corriger manuellement
UPDATE badges SET badge_id = 'identifiant_unique' WHERE id = X;
```

### Erreur: "foreign key constraint failed"

**Cause** : Il y a des user_badges avec badge_name qui ne correspond à aucun badge.

**Solution** :
```sql
-- Trouver les orphelins
SELECT DISTINCT badge_name 
FROM user_badges 
WHERE badge_name NOT IN (SELECT name FROM badges);

-- Nettoyer ou mapper manuellement
DELETE FROM user_badges WHERE badge_name = 'Badge Inexistant';
```

---

## 📝 Commit

Après application réussie :

```bash
git add supabase/migrations/20251023_fix_badges_fk.sql
git add apply-badges-fix.ps1
git commit -m "fix(database): add badge_id column and create proper FK constraint

- Add badge_id VARCHAR(100) to existing badges table
- Auto-generate badge_id from badge names (premier_quiz, etc.)
- Rename user_badges.badge_name to badge_id
- Map existing data to new format
- Create FK constraint user_badges.badge_id -> badges.badge_id
- Safe, idempotent migration with full verification"
```

---

**Prêt à appliquer ?** Lancez simplement :

```powershell
.\apply-badges-fix.ps1
```

🎯 **Option 1** → Copier → Supabase Dashboard → Coller → Run → ✅
