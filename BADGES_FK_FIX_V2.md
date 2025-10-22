# 🔧 Solution à l'erreur FK Badges

**Erreur rencontrée** :
```
ERROR: 23503: insert or update on table "user_badges" violates foreign key constraint
DETAIL: Key (badge_id)=(Apprenant Assidu) is not present in table "badges"
```

---

## 🔍 Cause du problème

La table `user_badges` contient des valeurs **orphelines** qui ne correspondent à aucun badge dans la table `badges`.

### Exemple de données problématiques :

| Table | Colonne | Valeur |
|-------|---------|--------|
| `user_badges` | `badge_name` | "Apprenant Assidu" ❌ |
| `badges` | `name` | "Premier Quiz" ✅ |
| `badges` | `name` | "Maître des Quiz" ✅ |

**Problème** : "Apprenant Assidu" n'existe PAS dans `badges` → impossible de créer la Foreign Key.

---

## ✅ Solution V2 (avec nettoyage)

La migration **20251023_fix_badges_fk_v2.sql** résout le problème en **12 étapes** :

### Étape 1-2 : Ajouter badge_id
Ajoute la colonne `badge_id` à la table `badges` existante.

### Étape 3-4 : Générer les identifiants
Génère automatiquement les `badge_id` depuis les noms :
- "Premier Quiz" → `premier_quiz`
- "Maître des Quiz" → `maitre_des_quiz`
- "Score Parfait" → `score_parfait`

### Étape 5 : Identifier les orphelins
Liste tous les `user_badges` qui référencent des badges inexistants :
```sql
SELECT DISTINCT badge_name, COUNT(*) 
FROM user_badges
WHERE badge_name NOT IN (SELECT name FROM badges)
GROUP BY badge_name;
```

**Affichera par exemple** :
```
⚠️  "Apprenant Assidu" (3 occurrences)
⚠️  "Badge Inconnu" (1 occurrence)
Total orphelins: 4
```

### Étape 6 : 🗑️ Nettoyer les orphelins
**SUPPRIME** les `user_badges` invalides :
```sql
DELETE FROM user_badges
WHERE badge_name NOT IN (SELECT name FROM badges);
```

### Étape 7-8 : Mapper et renommer
- Remplace les noms complets par les `badge_id` :
  - "Premier Quiz" → `premier_quiz`
- Renomme `badge_name` → `badge_id`

### Étape 9-10 : Contraintes
- Ajoute `NOT NULL` et `UNIQUE` sur `badges.badge_id`
- Vérifie qu'il ne reste **aucun orphelin**

### Étape 11 : Créer la FK
```sql
ALTER TABLE user_badges 
ADD CONSTRAINT user_badges_badge_id_fkey 
FOREIGN KEY (badge_id) 
REFERENCES badges(badge_id) 
ON DELETE CASCADE;
```

### Étape 12 : Rapport final
Affiche les statistiques complètes avec le mapping.

---

## 🚀 Application

### Option 1 : Script PowerShell (RECOMMANDÉ)

```powershell
.\apply-badges-fix-v2.ps1
```

Choisissez **option 1** → SQL copié automatiquement.

### Option 2 : Manuel

1. Ouvrez `supabase/migrations/20251023_fix_badges_fk_v2.sql`
2. Copiez tout le contenu
3. Supabase Dashboard → SQL Editor → New Query
4. Collez et **Run**

---

## 📊 Messages attendus

Après exécution, vous verrez :

```
NOTICE: ========================================
NOTICE: 🔍 État initial:
NOTICE:    📦 Badges totaux: 13
NOTICE:    🎖️  User badges totaux: 47
NOTICE: ========================================

NOTICE: ✅ Colonne badges.badge_id ajoutée
NOTICE: ✅ 13 badges mis à jour avec badge_id

NOTICE: 📋 Mapping badges (nom → badge_id):
NOTICE:    1 | Premier Quiz → premier_quiz
NOTICE:    2 | Maître des Quiz → maitre_des_quiz
NOTICE:    ...

NOTICE: 🔍 Recherche des user_badges orphelins...
NOTICE:    ⚠️  "Apprenant Assidu" (3 occurrences)
NOTICE:    ⚠️  Total orphelins: 3

NOTICE: 🗑️  3 user_badges orphelins supprimés

NOTICE: 🔄 Mapping user_badges.badge_name → badge_id...
NOTICE:    ✅ "Premier Quiz" → "premier_quiz" (5 lignes)
NOTICE:    ✅ "Maître des Quiz" → "maitre_des_quiz" (2 lignes)
NOTICE:    ...
NOTICE: ✅ Total mappé: 44 user_badges

NOTICE: ✅ Colonne user_badges.badge_name renommée en badge_id
NOTICE: ✅ Contrainte NOT NULL ajoutée sur badges.badge_id
NOTICE: ✅ Contrainte UNIQUE ajoutée sur badges.badge_id

NOTICE: 🔍 Vérification pré-FK:
NOTICE:    Orphelins restants: 0
NOTICE:    ✅ Aucun orphelin - OK pour créer la FK

NOTICE: ✅ Foreign Key créée: user_badges.badge_id → badges.badge_id

NOTICE: ========================================
NOTICE: ✅ Migration badges FK terminée!
NOTICE: ========================================
NOTICE: 📊 Badges totaux: 13
NOTICE: 🎖️  User badges totaux: 44
NOTICE: 🔗 Foreign Key: ✅ Créée
NOTICE: ========================================
```

Puis un tableau final :

| info | id | name | badge_id | user_badges_count |
|------|----|----|----------|------------------|
| Mapping Final | 1 | Premier Quiz | premier_quiz | 5 |
| Mapping Final | 2 | Maître des Quiz | maitre_des_quiz | 2 |
| ... | ... | ... | ... | ... |

---

## ⚠️ Points importants

### Données supprimées

Cette migration **SUPPRIME** les `user_badges` orphelins. Ce sont des données **invalides** qui référencent des badges inexistants.

**Pourquoi les supprimer ?**
- Impossible de créer une FK avec des orphelins
- Ce sont des données corrompues (badges supprimés ou mal saisis)
- Mieux vaut des données propres que des données incohérentes

### Sécurité

✅ **Safe operations** :
- Ajoute des colonnes (pas de suppression de structure)
- Teste l'existence avant chaque opération
- Affiche tous les orphelins AVANT suppression
- Vérification finale avant création FK

⚠️ **Destructive operation** :
- Supprime les `user_badges` orphelins uniquement

### Impact sur l'application

**AUCUN impact** si votre code utilise déjà les badges existants dans la table `badges`.

Les seules données perdues sont les références à des badges qui n'existent plus.

---

## 🔍 Vérifications post-migration

### 1. Dans Supabase Dashboard

**Table Editor → badges** :
- ✅ Colonne `badge_id` visible
- ✅ Valeurs : `premier_quiz`, `maitre_des_quiz`, etc.

**Table Editor → user_badges** :
- ✅ Colonne `badge_id` (plus `badge_name`)
- ✅ Toutes les valeurs correspondent à `badges.badge_id`

**SQL Editor** :
```sql
-- Vérifier la FK
SELECT 
    constraint_name,
    table_name,
    column_name
FROM information_schema.key_column_usage
WHERE constraint_name = 'user_badges_badge_id_fkey';

-- Devrait retourner :
-- user_badges_badge_id_fkey | user_badges | badge_id

-- Vérifier qu'il n'y a plus d'orphelins
SELECT COUNT(*) FROM user_badges ub
WHERE NOT EXISTS (
    SELECT 1 FROM badges b WHERE b.badge_id = ub.badge_id
);
-- Devrait retourner : 0
```

### 2. Dans l'application

Rechargez et vérifiez :
- ✅ Page Social charge correctement
- ✅ Badges s'affichent
- ✅ Pas d'erreur FK dans la console

---

## 🐛 Si erreur persiste

### Erreur : "Il reste X user_badges orphelins"

**Cause** : La migration s'arrête volontairement si des orphelins sont détectés après nettoyage.

**Solution** :
1. Regardez les messages pour identifier les badges problématiques
2. Vérifiez manuellement :
```sql
SELECT DISTINCT badge_id FROM user_badges
WHERE badge_id NOT IN (SELECT badge_id FROM badges);
```
3. Corrigez ou supprimez manuellement :
```sql
DELETE FROM user_badges 
WHERE badge_id = 'badge_problematique';
```
4. Relancez la migration

### Erreur : "duplicate key value"

**Cause** : Deux badges ont généré le même `badge_id`.

**Solution** :
```sql
-- Identifier les doublons
SELECT badge_id, COUNT(*) 
FROM badges 
GROUP BY badge_id 
HAVING COUNT(*) > 1;

-- Corriger manuellement
UPDATE badges 
SET badge_id = 'identifiant_unique_2' 
WHERE id = X;
```

---

## 📝 Commit

Après succès :

```bash
git add supabase/migrations/20251023_fix_badges_fk_v2.sql
git add apply-badges-fix-v2.ps1
git commit -m "fix(database): clean orphan user_badges and create FK (V2)

- Add badge_id column to existing badges table
- Auto-generate badge_id from names (premier_quiz, etc.)
- Identify and DELETE orphan user_badges (invalid references)
- Map and rename badge_name to badge_id
- Add NOT NULL and UNIQUE constraints
- Create FK: user_badges.badge_id -> badges.badge_id
- Full verification with detailed reporting
- Safe migration with orphan cleanup"
```

---

## 🎯 Résumé

| Avant | Après |
|-------|-------|
| `badges.id` INTEGER | `badges.id` INTEGER |
| `badges.name` TEXT | `badges.name` TEXT |
| ❌ Pas de `badge_id` | ✅ `badges.badge_id` VARCHAR |
| `user_badges.badge_name` TEXT | ✅ `user_badges.badge_id` VARCHAR |
| ❌ Orphelins : "Apprenant Assidu" | ✅ Orphelins supprimés |
| ❌ Pas de FK | ✅ FK créée et fonctionnelle |

---

**Prêt ?** Collez le SQL dans Supabase Dashboard et lancez ! 🚀

Ctrl+V → Run → Attendez les messages de succès ✅
