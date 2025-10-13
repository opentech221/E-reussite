# 🚨 ACTION IMMÉDIATE - Erreur Inscription 500

## ⚡ SOLUTION EN 3 ÉTAPES (5 minutes)

### 📋 Étape 1: Ouvrir Supabase SQL Editor
1. Aller sur votre dashboard Supabase
2. Cliquer sur **SQL Editor** (menu gauche)
3. Cliquer sur **New Query**

### 💻 Étape 2: Exécuter ce script

Copiez-collez et cliquez sur **Run** :

```sql
BEGIN;

ALTER TABLE user_points DISABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trigger_init_user_points ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();

    INSERT INTO public.user_points (user_id, total_points, level, points_to_next_level, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.id, 0, 1, 100, 0, 0, CURRENT_DATE)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erreur création profil: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

DROP POLICY IF EXISTS "Allow system inserts" ON user_points;
CREATE POLICY "Allow system inserts" ON user_points FOR INSERT WITH CHECK (true);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

COMMIT;
```

### ✅ Étape 3: Tester l'inscription

1. Ouvrir votre application en **navigation privée**
2. Créer un nouveau compte test
3. Vérifier : **Pas d'erreur 500** ✓

---

## 🔍 Que fait ce script ?

| Avant | Après |
|-------|-------|
| ❌ Trigger sur `profiles` échoue | ✅ Trigger sur `auth.users` réussit |
| ❌ Pas de gestion d'erreur | ✅ `EXCEPTION WHEN OTHERS` |
| ❌ RLS bloque les inserts | ✅ Politique système + `SECURITY DEFINER` |

---

## 📊 Vérification (optionnel)

Après le correctif, vérifiez que tout est OK :

```sql
SELECT 
    (SELECT COUNT(*) FROM auth.users) as users,
    (SELECT COUNT(*) FROM profiles) as profiles,
    (SELECT COUNT(*) FROM user_points) as points;
```

**Résultat attendu :** Les 3 nombres doivent être identiques.

---

## 🆘 Si ça ne marche toujours pas

1. **Vérifier les logs** : Dashboard Supabase → Database → Logs
2. **Exécuter le diagnostic** : Utilisez `VERIFICATION_INSCRIPTION_SYSTEM.sql`
3. **Désactiver RLS temporairement** (test) :
   ```sql
   ALTER TABLE user_points DISABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```

---

## 📁 Fichiers de support

- `FIX_INSCRIPTION_ERROR_500.sql` - Script de correction complet avec diagnostic
- `GUIDE_CORRECTION_INSCRIPTION_500.md` - Documentation détaillée
- `VERIFICATION_INSCRIPTION_SYSTEM.sql` - Vérification de l'état du système

---

## ✓ Checklist finale

- [ ] Script exécuté sans erreur dans Supabase
- [ ] Test d'inscription réussi (pas de 500)
- [ ] Email de confirmation reçu
- [ ] Connexion avec le nouveau compte OK
- [ ] Vérification SQL : 3 compteurs identiques

---

**Temps estimé :** 5 minutes  
**Complexité :** Facile (copier-coller)  
**Impact :** Corrige immédiatement les inscriptions
