# 🚀 Guide d'exécution - Migrations et Seeds

## À exécuter dans Supabase SQL Editor

### Ordre d'exécution :

---

## 1️⃣ Migration 009 - Table Examens

**Fichier :** `database/migrations/009_examens_table.sql`

**Ce que ça fait :**
- Crée la table `examens`
- Configure les RLS policies
- Insère 15 examens de test (BFEM + BAC)

**Commande :**
```sql
-- Copier-coller tout le contenu de 009_examens_table.sql
-- dans le SQL Editor de Supabase et exécuter
```

**Vérification :**
```sql
-- Doit afficher : "Migration 009 : Table examens créée avec succès !"
SELECT * FROM examens LIMIT 5;
-- Doit afficher 5 examens
```

---

## 2️⃣ Seed Complet - Toutes les matières

**Fichier :** `database/seed/002_complete_content.sql`

**Ce que ça fait :**
- Ajoute des chapitres pour TOUTES les matières
- Insère des leçons avec contenu HTML
- Couvre BFEM et BAC au complet

**Commande :**
```sql
-- Copier-coller tout le contenu de 002_complete_content.sql
-- dans le SQL Editor de Supabase et exécuter
```

**Vérification :**
```sql
-- Compter les chapitres par matière
SELECT m.name, m.level, COUNT(c.id) as nb_chapitres
FROM matieres m
LEFT JOIN chapitres c ON c.matiere_id = m.id
GROUP BY m.name, m.level
ORDER BY m.level, m.name;

-- Compter les leçons par matière
SELECT m.name, m.level, COUNT(l.id) as nb_lecons
FROM matieres m
LEFT JOIN chapitres c ON c.matiere_id = m.id
LEFT JOIN lecons l ON l.chapitre_id = c.id
GROUP BY m.name, m.level
ORDER BY m.level, m.name;
```

---

## 3️⃣ Vérification complète

```sql
-- Vérifier toutes les tables
SELECT 
  'matieres' as table_name, 
  COUNT(*) as total 
FROM matieres
UNION ALL
SELECT 'chapitres', COUNT(*) FROM chapitres
UNION ALL
SELECT 'lecons', COUNT(*) FROM lecons
UNION ALL
SELECT 'annales', COUNT(*) FROM annales
UNION ALL
SELECT 'examens', COUNT(*) FROM examens;
```

**Résultats attendus :**
- matieres : 13
- chapitres : ~39
- lecons : ~52
- annales : (nombre existant)
- examens : 15

---

## ✅ Checklist

- [ ] Migration 009 exécutée sans erreur
- [ ] Seed 002 exécuté sans erreur
- [ ] Table examens contient 15 lignes
- [ ] Toutes les matières ont des chapitres
- [ ] Les leçons ont du contenu HTML
- [ ] Vérification SQL passée

---

## 🐛 En cas d'erreur

### Erreur : "relation examens already exists"
```sql
-- Supprimer la table et recommencer
DROP TABLE IF EXISTS examens CASCADE;
-- Puis réexécuter 009_examens_table.sql
```

### Erreur : "duplicate key value"
```sql
-- Les données existent déjà, c'est OK !
-- Le seed utilise ON CONFLICT DO NOTHING
```

### Erreur : "matiere_id does not exist"
```sql
-- Vérifier que les matières existent
SELECT * FROM matieres;
-- Si vide, exécuter d'abord 001_initial_content_safe.sql
```

---

## 📊 Après exécution

### Tester l'interface :
1. Aller sur `/my-courses`
2. Cliquer sur n'importe quelle matière
3. Vérifier les 3 sections :
   - Annales Corrigées
   - Examens Corrigés ⬅️ NOUVEAU
   - Chapitres
4. Cliquer sur "Commencer le cours"
5. Naviguer dans les leçons

---

**Tout est prêt ! 🎉**
