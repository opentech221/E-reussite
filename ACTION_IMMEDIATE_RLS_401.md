# 🚨 ACTION IMMÉDIATE - Corriger les erreurs RLS 401

## ✅ CE QUI FONCTIONNE MAINTENANT
- L'inscription aboutit ✅
- L'utilisateur reçoit son email de confirmation ✅
- Le compte est créé dans Supabase ✅

## ❌ PROBLÈME ACTUEL
Console affiche ces erreurs:
```
POST /rest/v1/profiles 401 Unauthorized
new row violates row-level security policy for table "profiles"
```

## 🔧 SOLUTION EN 3 ÉTAPES

### ÉTAPE 1: Appliquer les politiques RLS (2 minutes)

1. **Ouvrir Supabase Dashboard**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet E-reussite

2. **Ouvrir SQL Editor**
   - Menu de gauche → SQL Editor
   - Cliquer sur "New query"

3. **Exécuter le script complet**
   - Copier tout le contenu de `database/FIX_RLS_COMPLETE.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" ou appuyer sur Ctrl+Enter

4. **Vérifier les résultats**
   Vous devriez voir dans les résultats:
   ```
   ✅ profiles - Anyone can view profiles
   ✅ profiles - System can create profiles
   ✅ profiles - Users can update own profile
   ❌ profiles - No one can delete profiles
   ✅ user_points - Anyone can view points
   ✅ user_points - System can create points
   ✅ user_points - System can update points
   ❌ user_points - No one can delete points
   ```

### ÉTAPE 2: Tester l'inscription (1 minute)

1. **Ouvrir une fenêtre navigation privée**
   - Chrome: Ctrl+Shift+N
   - Firefox: Ctrl+Shift+P
   - Edge: Ctrl+Shift+N

2. **Créer un compte test**
   - Aller sur votre page d'inscription
   - Utiliser un email de test: `test2@example.com`
   - Remplir le formulaire

3. **Vérifier la console** (F12)
   - ✅ Aucune erreur 401
   - ✅ Aucune erreur RLS
   - ✅ Message "Inscription réussie"

### ÉTAPE 3: Vérifier dans Supabase (30 secondes)

1. **Ouvrir Table Editor**
   - Menu de gauche → Table Editor
   - Sélectionner table "profiles"

2. **Chercher votre utilisateur test**
   - Filtrer par email: `test2@example.com`
   - Vérifier que:
     - ✅ full_name est rempli
     - ✅ level = "débutant"
     - ✅ parcours est défini

3. **Vérifier les points**
   - Sélectionner table "user_points"
   - Chercher le même user_id
   - Vérifier:
     - ✅ total_points = 0
     - ✅ level = 1

## 🎯 RÉSULTAT ATTENDU

Après ces 3 étapes, l'inscription devrait:
- ✅ Fonctionner sans erreur 500
- ✅ Créer le profil automatiquement
- ✅ Créer les points automatiquement
- ✅ Aucune erreur 401 dans la console
- ✅ Aucune erreur RLS dans la console

## 📊 CE QUI A ÉTÉ CORRIGÉ

### 1. Architecture Modifiée
**AVANT:**
```
Inscription → Application crée profil → Trigger init_user_points
              └─ INSERT profiles
                 └─ ❌ Échoue (RLS + conflit)
```

**MAINTENANT:**
```
Inscription → Trigger handle_new_user → Crée profil + points
              Application UPDATE profil → Complète les infos
              └─ ✅ Succès (pas de conflit)
```

### 2. Code Application Modifié
- **Fichier**: `src/contexts/SupabaseAuthContext.jsx`
- **Ligne 119-150**: Changé de INSERT à UPDATE
- **Avant**: `createProfile()` tentait INSERT
- **Maintenant**: `update()` complète le profil existant

### 3. Politiques RLS Créées
```sql
profiles:
  - SELECT: Lecture publique (leaderboard)
  - INSERT: Système uniquement (trigger)
  - UPDATE: Propriétaire uniquement
  - DELETE: Interdit

user_points:
  - SELECT: Lecture publique (leaderboard)
  - INSERT: Système uniquement (trigger)
  - UPDATE: Système uniquement (anti-triche)
  - DELETE: Interdit
```

## 🔍 DIAGNOSTIC SI ÇA NE FONCTIONNE PAS

### Si erreur 401 persiste:

1. **Vérifier que RLS est activé**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('profiles', 'user_points');
   ```
   Les deux doivent être `true`

2. **Vérifier les politiques**
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE tablename IN ('profiles', 'user_points')
   ORDER BY tablename, cmd;
   ```
   Devrait montrer 4 politiques par table

3. **Vérifier le trigger**
   ```sql
   SELECT tgname, tgtype 
   FROM pg_trigger 
   WHERE tgname = 'on_auth_user_created';
   ```
   Doit exister sur `auth.users`

### Si profil n'est pas créé:

1. **Tester le trigger manuellement**
   ```sql
   -- Voir les logs d'erreur
   SELECT * FROM pg_stat_statements 
   WHERE query LIKE '%handle_new_user%' 
   ORDER BY calls DESC 
   LIMIT 5;
   ```

2. **Vérifier la fonction**
   ```sql
   SELECT proname, prosecdef 
   FROM pg_proc 
   WHERE proname = 'handle_new_user';
   ```
   `prosecdef` doit être `true` (SECURITY DEFINER)

## 📞 BESOIN D'AIDE?

Si le problème persiste après ces étapes:
1. Copiez les erreurs de la console (F12)
2. Vérifiez les logs Supabase (Dashboard → Logs)
3. Exécutez les requêtes de diagnostic ci-dessus
4. Partagez les résultats

## ✨ BONUS - Vérification Santé Système

```sql
-- Voir tous les utilisateurs avec leur profil et points
SELECT 
    au.email,
    au.created_at as inscrit_le,
    p.full_name,
    p.level as parcours_level,
    up.total_points,
    up.level as points_level
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN user_points up ON up.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 10;
```

Tous les nouveaux utilisateurs devraient avoir:
- ✅ Un profil (full_name, level)
- ✅ Des points (total_points = 0, level = 1)

---

**Date de création**: 10 octobre 2025  
**Temps estimé**: 3-4 minutes  
**Niveau de difficulté**: ⭐ Facile (copier-coller)
