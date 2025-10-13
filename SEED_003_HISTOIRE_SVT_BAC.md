# 📚 Seed Complémentaire - Histoire-Géo BAC et SVT BAC

## 📋 Contenu créé

### Histoire-Géographie BAC (3 chapitres, 11 leçons)

#### Chapitre 1 : La Première Guerre mondiale (3 leçons)
- Les origines du conflit
- La guerre des tranchées
- Le traité de Versailles

#### Chapitre 2 : La Seconde Guerre mondiale (4 leçons)
- Montée des totalitarismes
- Le déroulement de la guerre
- Le génocide juif (La Shoah)
- L'après-guerre

#### Chapitre 3 : La mondialisation (3 leçons)
- Les flux de la mondialisation
- Les acteurs de la mondialisation
- Territoires et inégalités

---

### SVT BAC (3 chapitres, 11 leçons)

#### Chapitre 1 : Génétique et évolution (4 leçons)
- La structure de l'ADN
- Réplication et mutations
- L'expression des gènes
- Évolution et sélection naturelle

#### Chapitre 2 : Le système immunitaire (3 leçons)
- L'immunité innée
- L'immunité adaptative
- Vaccination et immunothérapie

#### Chapitre 3 : Tectonique des plaques (3 leçons)
- Structure interne de la Terre
- La théorie de la tectonique des plaques
- Volcans et séismes

---

## 🚀 Exécution

**Fichier :** `database/seed/003_hist_svt_bac_complement.sql`

1. Copiez tout le contenu
2. Collez dans Supabase SQL Editor
3. Exécutez

---

## ✅ Vérification

Après exécution, vérifiez :

```sql
-- Compter les chapitres
SELECT 
  m.name,
  m.level,
  COUNT(c.id) as nb_chapitres
FROM matieres m
LEFT JOIN chapitres c ON c.matiere_id = m.id
WHERE m.name IN ('Histoire-Géographie BAC', 'SVT BAC')
GROUP BY m.id, m.name, m.level;
```

**Résultat attendu :**
| name                    | level | nb_chapitres |
|-------------------------|-------|--------------|
| Histoire-Géographie BAC | bac   | 3            |
| SVT BAC                 | bac   | 3            |

```sql
-- Compter les leçons
SELECT COUNT(*) FROM lecons;
-- Nouveau total : ~30 (existantes) + 22 (nouvelles) = ~52 leçons
```

---

## 📊 Bilan final attendu

**Total chapitres : 40** (34 existants + 6 nouveaux)
**Total leçons : ~52** (30 existantes + 22 nouvelles)

**Répartition complète :**

### BFEM (17 chapitres)
- ✅ Mathématiques : 3
- ✅ Français : 3
- ✅ Anglais : 3
- ✅ Physique-Chimie : 2
- ✅ SVT : 3
- ✅ Histoire-Géo : 3

### BAC (23 chapitres)
- ✅ Mathématiques : 3
- ✅ Philosophie : 3
- ✅ Physique-Chimie : 6
- ✅ Anglais : 3
- ✅ Français : 3
- ✅ **Histoire-Géo : 3** (NOUVEAU)
- ✅ **SVT : 3** (NOUVEAU)

---

## 🎯 Après validation

Une fois exécuté et vérifié, nous passerons à **Option 2 : Améliorer la progression** ! 🚀
