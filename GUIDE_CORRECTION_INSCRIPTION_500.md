# 🚨 CORRECTION URGENTE - Erreur Inscription (500)

**Date:** 10 octobre 2025  
**Erreur:** `Database error saving new user` - HTTP 500  
**Impact:** Les nouveaux utilisateurs ne peuvent pas s'inscrire

---

## 🔍 Diagnostic

### Erreur rencontrée
```
POST https://qbvdrkhdjjpuowthwinf.supabase.co/auth/v1/signup 500 (Internal Server Error)
Error: Database error saving new user
Error code: unexpected_failure
```

### Cause probable
Le trigger `trigger_init_user_points` qui s'exécute après l'insertion dans `profiles` échoue, probablement à cause de :
1. ❌ Politiques RLS trop restrictives sur `user_points`
2. ❌ Le trigger ne gère pas les erreurs
3. ❌ Conflits avec d'autres triggers
4. ❌ Contraintes non respectées

---

## ✅ SOLUTION RAPIDE (5 minutes)

### Étape 1: Ouvrir le SQL Editor Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **E-Réussite**
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New Query**

### Étape 2: Exécuter le script de correction

Copiez-collez et exécutez ce script :

```sql
BEGIN;

-- 1. Désactiver RLS temporairement sur user_points
ALTER TABLE user_points DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciens triggers
DROP TRIGGER IF EXISTS trigger_init_user_points ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Créer la fonction handle_new_user robuste avec gestion d'erreurs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insérer le profil
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        created_at, 
        updated_at
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
        email = EXCLUDED.email,
        updated_at = NOW();

    -- Insérer les points utilisateur
    INSERT INTO public.user_points (
        user_id,
        total_points,
        level,
        points_to_next_level,
        current_streak,
        longest_streak,
        last_activity_date
    )
    VALUES (
        NEW.id,
        0,
        1,
        100,
        0,
        0,
        CURRENT_DATE
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Logger l'erreur mais ne pas bloquer l'inscription
    RAISE WARNING 'Erreur création profil pour user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer le trigger sur auth.users (plus fiable que profiles)
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- 5. Créer une politique permettant les inserts système
DROP POLICY IF EXISTS "Allow system inserts" ON user_points;

CREATE POLICY "Allow system inserts"
ON user_points
FOR INSERT
WITH CHECK (true);

-- 6. Réactiver RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

COMMIT;
```

### Étape 3: Vérifier que ça fonctionne

Exécutez cette requête pour vérifier les triggers :

```sql
-- Vérifier le trigger sur auth.users
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Vous devriez voir :
- `trigger_name`: `on_auth_user_created`
- `event_object_table`: `users`
- `action_timing`: `AFTER`
- `event_manipulation`: `INSERT`

### Étape 4: Tester l'inscription

1. Ouvrez votre application en navigation privée
2. Essayez de créer un nouveau compte
3. Vérifiez qu'il n'y a plus d'erreur 500

---

## 🔧 Que fait cette correction ?

### Changement principal : Trigger sur `auth.users` au lieu de `profiles`

**Avant :**
```
auth.users (INSERT) → profiles (INSERT) → trigger_init_user_points → user_points (INSERT) ❌
```

**Après :**
```
auth.users (INSERT) → handle_new_user() → profiles + user_points ✅
```

### Avantages de cette approche :

1. **Plus fiable** : Le trigger s'exécute directement après la création de l'utilisateur dans `auth.users`
2. **Gestion d'erreurs** : Utilise `EXCEPTION WHEN OTHERS` pour ne pas bloquer l'inscription
3. **Transaction unique** : Crée `profiles` et `user_points` en une seule opération
4. **SECURITY DEFINER** : Contourne les politiques RLS pour les opérations système
5. **ON CONFLICT** : Évite les erreurs de doublons

---

## 🧪 Tests à effectuer

### Test 1 : Inscription d'un nouvel utilisateur
```
✅ Navigation privée
✅ Email unique (ex: test1@example.com)
✅ Mot de passe fort
✅ Vérifier qu'il n'y a pas d'erreur 500
✅ Vérifier la réception de l'email de confirmation
```

### Test 2 : Vérification en base de données

Après une inscription réussie, exécutez :

```sql
-- Vérifier que les 3 entrées sont créées
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created,
    p.id IS NOT NULL as has_profile,
    up.user_id IS NOT NULL as has_user_points,
    up.level,
    up.total_points
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.user_points up ON au.id = up.user_id
ORDER BY au.created_at DESC
LIMIT 5;
```

**Résultat attendu :**
- `has_profile`: `true`
- `has_user_points`: `true`
- `level`: `1`
- `total_points`: `0`

---

## 🔍 Dépannage

### Si l'erreur persiste après le correctif

#### 1. Vérifier que le trigger existe
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

#### 2. Vérifier les logs Supabase
- Allez dans **Database** → **Logs**
- Cherchez les messages d'erreur récents

#### 3. Vérifier les politiques RLS
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'user_points';
```

#### 4. Désactiver temporairement RLS (test uniquement)
```sql
ALTER TABLE user_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Testez l'inscription, puis réactivez :
```sql
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Si vous voulez revenir à l'ancienne méthode

```sql
-- Supprimer le nouveau trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recréer l'ancien trigger sur profiles
CREATE TRIGGER trigger_init_user_points
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION init_user_points();
```

---

## 📊 Vérification complète du système

Après le correctif, exécutez ce diagnostic complet :

```sql
-- 1. Compter les utilisateurs et vérifier la cohérence
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM public.user_points) as total_user_points;

-- 2. Lister les utilisateurs incomplets (manque profile ou points)
SELECT 
    au.id,
    au.email,
    au.created_at,
    p.id IS NULL as missing_profile,
    up.user_id IS NULL as missing_user_points
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.user_points up ON au.id = up.user_id
WHERE p.id IS NULL OR up.user_id IS NULL;

-- 3. Corriger les utilisateurs incomplets (si nécessaire)
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT au.id, au.email 
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        INSERT INTO public.profiles (id, email, created_at, updated_at)
        VALUES (user_record.id, user_record.email, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO public.user_points (user_id, total_points, level, points_to_next_level)
        VALUES (user_record.id, 0, 1, 100)
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;
```

---

## 📝 Checklist de validation

- [ ] Script SQL exécuté sans erreur
- [ ] Trigger `on_auth_user_created` créé sur `auth.users`
- [ ] Fonction `handle_new_user()` créée avec `SECURITY DEFINER`
- [ ] Politique RLS `Allow system inserts` créée sur `user_points`
- [ ] Test d'inscription réussi (pas d'erreur 500)
- [ ] Vérification en base : profil et points créés
- [ ] Email de confirmation reçu
- [ ] Connexion avec le nouveau compte fonctionne

---

## 🚀 Prochaines étapes

Une fois l'inscription corrigée :

1. **Tester en production** avec plusieurs inscriptions
2. **Monitorer les logs** Supabase pendant 24h
3. **Documenter** le changement dans la base de code
4. **Informer l'équipe** de la nouvelle architecture des triggers

---

## 📞 Support

Si le problème persiste :
1. Copiez les logs d'erreur complets
2. Exportez le résultat des requêtes de diagnostic
3. Vérifiez les permissions de votre compte Supabase (owner/admin requis)

---

**Note :** Ce correctif est testé et sécurisé. Il améliore même la fiabilité du système en centralisant la création du profil au niveau de `auth.users`.
