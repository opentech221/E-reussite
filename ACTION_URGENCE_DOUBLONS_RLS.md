# 🚨 URGENCE - Nettoyage des doublons RLS

## ❌ Problème actuel

Le script précédent a créé des **doublons** :
- **profiles** : 8 politiques (2 par opération) au lieu de 4
- **user_points** : Probablement 8 aussi

## ⚡ Solution immédiate

**Exécutez ce nouveau script** : `database/FIX_RLS_CLEANUP_COMPLET.sql`

### Ce qu'il fait

1. **Supprime TOUTES les politiques** sur `profiles` et `user_points` (méthode radicale)
2. **Recrée exactement 4 politiques** par table
3. **Vérifie** qu'il n'y a plus de doublons

### Avantage de cette méthode

✅ **Boucle dynamique** : Supprime toutes les politiques existantes, peu importe leur nom  
✅ **Noms affichés** : Vous verrez quelles politiques sont supprimées  
✅ **Pas d'erreur 42710** : Si une politique n'existe pas, pas de problème  
✅ **Résultat garanti** : 4 politiques exactement

## 🎯 Actions

### 1. Exécuter le nettoyage complet

```bash
# Dans Supabase SQL Editor
1. Copier tout le contenu de: database/FIX_RLS_CLEANUP_COMPLET.sql
2. Coller dans SQL Editor
3. Cliquer sur "Run"
```

### 2. Vérifier les résultats

Vous devriez voir :
```
✅ profiles: 4 politiques
✅ user_points: 4 politiques
✅ Aucun doublon
```

### 3. Tester l'inscription

- Navigation privée (Ctrl+Shift+N)
- Créer un nouveau compte
- Vérifier console (F12) : aucune erreur 401

## 📊 Sortie attendue du script

```
NOTICE: Supprimé: Anyone can view profiles
NOTICE: Supprimé: Anyone can view profiles (doublon)
NOTICE: Supprimé: System can create profiles
NOTICE: Supprimé: System can create profiles (doublon)
...

✅ profiles: 4 politiques - PARFAIT
✅ user_points: 4 politiques - PARFAIT
✅ Aucun doublon détecté

🎉 NETTOYAGE TERMINÉ!
```

## 🔧 Pourquoi des doublons se sont créés ?

Le script `FIX_RLS_TARGETED.sql` utilisait `DROP POLICY IF EXISTS` **dans une transaction** :

```sql
BEGIN;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
...
COMMIT;
```

**Problème** : Si la politique existait déjà avec le **même nom mais en français** ou avec un nom légèrement différent, le `DROP` n'a rien supprimé et le `CREATE` a ajouté un doublon.

## ✅ Solution appliquée

Nouveau script utilise une **boucle dynamique** qui :
1. Liste **toutes** les politiques existantes
2. Les supprime **toutes** une par une
3. Recrée exactement 4 politiques

```sql
DO $$
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
END $$;
```

## 🎯 Après le nettoyage

Une fois exécuté, vous aurez :

| Table | Politiques | Status |
|-------|-----------|--------|
| profiles | 4 | ✅ OK |
| user_points | 4 | ✅ OK |

### Les 4 politiques sur `profiles`
1. `Anyone can view profiles` (SELECT)
2. `System can create profiles` (INSERT)
3. `Users can update own profile` (UPDATE)
4. `No one can delete profiles` (DELETE)

### Les 4 politiques sur `user_points`
1. `Anyone can view points` (SELECT)
2. `System can create points` (INSERT)
3. `System can update points` (UPDATE)
4. `No one can delete points` (DELETE)

## 🚀 C'est parti !

**Exécutez maintenant** : `database/FIX_RLS_CLEANUP_COMPLET.sql`

---

**Temps estimé** : 30 secondes  
**Niveau** : ⭐ Facile (copier-coller)  
**Risque** : ⚠️ Moyen (supprime toutes les politiques temporairement)  
**Impact** : ✅ Correction définitive des doublons
