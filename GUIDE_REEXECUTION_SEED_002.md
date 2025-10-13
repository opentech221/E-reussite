# 📋 GUIDE RE-EXECUTION SEED 002

## Problème identifié
Le seed 002 n'a inséré que 18 chapitres sur ~39 attendus.

Chapitres manquants pour :
- ❌ Anglais BFEM (3 chapitres)
- ❌ SVT BFEM (3 chapitres)  
- ❌ Histoire-Géo BFEM (3 chapitres)
- ❌ Philosophie BAC (3 chapitres)
- ❌ Physique-Chimie BAC (3 chapitres)
- ❌ Anglais BAC (3 chapitres)
- ❌ Français BAC (3 chapitres)

## ✅ Solution

1. **Supprimez les données existantes** (optionnel - pour repartir propre) :
```sql
-- ATTENTION : Cela supprime TOUT le contenu des cours !
DELETE FROM lecons;
DELETE FROM chapitres;
```

2. **Ré-exécutez le seed 002 corrigé** :
   - Ouvrez `database/seed/002_complete_content.sql`
   - Copiez tout le contenu
   - Collez dans Supabase SQL Editor
   - Exécutez

3. **Vérifiez le résultat** :
```sql
SELECT 
  m.name,
  m.level,
  COUNT(c.id) as nb_chapitres
FROM matieres m
LEFT JOIN chapitres c ON c.matiere_id = m.id
GROUP BY m.id, m.name, m.level
ORDER BY m.level, m.name;
```

**Résultat attendu :**
| name                     | level | nb_chapitres |
|--------------------------|-------|--------------|
| Mathématiques BFEM       | bfem  | 3            |
| Français BFEM            | bfem  | 3            |
| Anglais BFEM             | bfem  | 3            |
| Physique-Chimie BFEM     | bfem  | 2            |
| SVT BFEM                 | bfem  | 3            |
| Histoire-Géographie BFEM | bfem  | 3            |
| Mathématiques BAC        | bac   | 3            |
| Philosophie BAC          | bac   | 3            |
| Physique-Chimie BAC      | bac   | 3            |
| Anglais BAC              | bac   | 3            |
| Français BAC             | bac   | 3            |

**Total attendu : ~32 chapitres**

4. **Vérifiez les leçons** :
```sql
SELECT COUNT(*) as total_lecons FROM lecons;
-- Attendu : ~52 leçons
```

## 🎯 Pourquoi ça n'a pas marché la première fois ?

Le seed 002 initial utilisait des noms de matières sans suffixe (ex: "Mathématiques" au lieu de "Mathématiques BFEM").

J'ai corrigé le fichier pour utiliser les bons noms avec suffixes.

## 📝 Alternative : Seed par morceaux

Si le seed complet ne passe pas, vous pouvez l'exécuter par sections :
1. Section BFEM uniquement
2. Section BAC uniquement

Dites-moi si vous voulez que je crée ces fichiers séparés.
