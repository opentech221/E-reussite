# 🔧 Correction des types - Migration 009 et Seed 002

## Problème identifié

**Erreur :**
```
ERROR: 42804: foreign key constraint "examens_matiere_id_fkey" cannot be implemented
DETAIL: Key columns "matiere_id" and "id" are of incompatible types: uuid and integer.
```

**Cause :**
- Table `matieres` utilise `id INT` (SERIAL)
- Migration 009 utilisait `matiere_id UUID`
- → Incompatibilité de types pour la foreign key

---

## ✅ Corrections effectuées

### 1. Migration 009 - `database/migrations/009_examens_table.sql`

**Avant :**
```sql
CREATE TABLE IF NOT EXISTS examens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matiere_id UUID REFERENCES matieres(id) ON DELETE CASCADE,
  ...
);

DECLARE
  mat_math_bfem_id UUID;
  ...
```

**Après :**
```sql
CREATE TABLE IF NOT EXISTS examens (
  id SERIAL PRIMARY KEY,
  matiere_id INT REFERENCES matieres(id) ON DELETE CASCADE,
  ...
);

DECLARE
  mat_math_bfem_id INT;
  ...
```

**Changements :**
- ✅ `id UUID` → `id SERIAL`
- ✅ `matiere_id UUID` → `matiere_id INT`
- ✅ Toutes les variables DECLARE UUID → INT

---

### 2. Seed 002 - `database/seed/002_complete_content.sql`

**Avant :**
```sql
DECLARE
  mat_math_bfem_id UUID;
  mat_fr_bfem_id UUID;
  ...
  chap_id UUID;
```

**Après :**
```sql
DECLARE
  mat_math_bfem_id INT;
  mat_fr_bfem_id INT;
  ...
  chap_id INT;
```

**Changements :**
- ✅ Tous les IDs de matières : UUID → INT
- ✅ `chap_id UUID` → `chap_id INT`

---

## 🚀 Ré-exécution

Maintenant vous pouvez ré-exécuter les migrations dans l'ordre :

### 1. Migration 009 (corrigée)
```sql
-- Dans Supabase SQL Editor
-- Copier-coller database/migrations/009_examens_table.sql
```

**Si la table existe déjà :**
```sql
-- Supprimer d'abord la table si elle existe avec l'ancien type
DROP TABLE IF EXISTS examens CASCADE;

-- Puis exécuter 009_examens_table.sql
```

### 2. Seed 002 (corrigé)
```sql
-- Dans Supabase SQL Editor
-- Copier-coller database/seed/002_complete_content.sql
```

---

## ✅ Vérification

```sql
-- Vérifier le type de la colonne
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'examens' 
  AND column_name IN ('id', 'matiere_id');
```

**Résultat attendu :**
| column_name | data_type |
|------------|-----------|
| id         | integer   |
| matiere_id | integer   |

```sql
-- Vérifier que les examens sont insérés
SELECT COUNT(*) FROM examens;
-- Doit retourner : 15
```

---

## 📝 Note technique

**Types dans Supabase/PostgreSQL :**
- `SERIAL` = alias pour `INT` avec auto-increment
- `UUID` = identifiant universel unique (128 bits)
- ❌ Ces types ne sont **pas compatibles** pour les foreign keys

**Convention du projet :**
- Tables principales (matieres, chapitres, lecons) : `INT` (SERIAL)
- Tables utilisateur (users, profiles) : `UUID`
- → Examens doit suivre la convention des tables de contenu : `INT`

---

**Corrections terminées ! ✅**
**Les migrations sont maintenant prêtes à être exécutées.** 🚀
