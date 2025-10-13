# 🔧 CORRECTION v3 - Clé étrangère exam_results

## ❌ PROBLÈME

```
insert or update on table "exam_results" violates foreign key constraint "exam_results_exam_id_fkey"
Key is not present in table "exam_simulations"
```

**Cause** : La table `exam_results` a une contrainte FK vers `exam_simulations`, mais le code utilise la table `examens`.

---

## 🔍 ANALYSE

Il y a deux tables possibles :
1. `exam_simulations` (ancienne table)
2. `examens` (nouvelle table créée par migration 009)

Le code frontend utilise `examens`, donc il faut que `exam_results.exam_id` pointe vers `examens.id`.

---

## ✅ SOLUTION v3

### Script de correction : `015_exam_system_fix_v3.sql`

**Ce script va** :
1. ✅ Vérifier quelle(s) table(s) existe(nt)
2. ✅ Supprimer l'ancienne contrainte FK vers `exam_simulations`
3. ✅ Créer la nouvelle contrainte FK vers `examens`
4. ✅ Vérifier les données (nombre d'examens disponibles)
5. ✅ Afficher les contraintes finales

---

## 🚀 EXÉCUTION

**Dans Supabase SQL Editor** :

```sql
-- Copier et exécuter :
database/migrations/015_exam_system_fix_v3.sql
```

**Tu verras** :
```
✓ Table "examens" existe
✅ Anciennes contraintes supprimées
✅ Contrainte FK créée vers examens(id)
[Nombre d'examens disponibles]
[Liste de 5 examens]
[Contraintes FK finales]
✅ Migration 015 FIX v3 : Clé étrangère corrigée avec succès !
```

---

## 📋 APRÈS CORRECTION

1. **Recharge l'application** (Ctrl+R ou Cmd+R)
2. **Va sur** : http://localhost:3000/exam
3. **Sélectionne un examen** et clique "Commencer"
4. **Réponds aux questions** et termine l'examen
5. **Vérifie** : Les résultats sont enregistrés sans erreur !

---

## ✅ RÉSULTAT ATTENDU

Après cette correction, tu pourras :
- ✅ Passer des examens sans erreur
- ✅ Voir tes résultats enregistrés
- ✅ Gagner des points automatiquement
- ✅ Consulter tes statistiques d'examens

**C'est la dernière correction nécessaire !** 🎉

---

**Action** : Exécute le script v3 maintenant ! ⚡
