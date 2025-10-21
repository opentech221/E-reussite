# 🔧 Correction Urgente - Trigger Bloquant les Connexions

**Date**: 21 Octobre 2025 16h30  
**Problème**: Erreur 500 "Database error granting user" lors des connexions  
**Cause**: Trigger `on_auth_login` sur `auth.sessions` bloquait l'authentification  
**Status**: ✅ **RÉSOLU**

---

## 🚨 Incident

### Symptômes
- ❌ Impossible de se connecter (erreur 500)
- ❌ Message: "Database error granting user"
- ❌ Console: `unexpected_failure` error_id: `9923d88e738b2575-DKR`

### Cause Racine
Le trigger `on_auth_login` créé dans `add_notification_tracking_columns.sql` :
```sql
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION increment_login_count();
```

**Problème** : 
- Le trigger s'exécute **pendant** l'authentification Supabase
- Il essaie d'accéder à `NEW.user_id` qui peut ne pas exister ou avoir un nom différent
- Le profil peut ne pas encore être créé au moment de l'insertion session
- **Résultat** : L'authentification échoue systématiquement

---

## ✅ Solution Appliquée

### Étape 1 : Suppression du Trigger Défectueux ✅

**Fichier** : `supabase/migrations/URGENCE_FIX_TRIGGER.sql`

```sql
-- Supprimer le trigger qui bloque les connexions
DROP TRIGGER IF EXISTS on_auth_login ON auth.sessions;
DROP FUNCTION IF EXISTS increment_login_count();
```

**Résultat** : ✅ Connexions rétablies immédiatement

---

### Étape 2 : Création d'une Fonction RPC Sécurisée ✅

**Fichier** : `supabase/migrations/add_login_count_rpc_safe.sql`

**Nouvelle approche** : Au lieu d'un trigger automatique (dangereux), on utilise une **fonction RPC appelée par le frontend** après connexion réussie.

```sql
-- Fonction RPC sécurisée
CREATE OR REPLACE FUNCTION increment_user_login_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET login_count = COALESCE(login_count, 0) + 1,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions pour utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION increment_user_login_count(UUID) TO authenticated;
```

**Avantages** :
- ✅ N'interfère pas avec l'authentification Supabase
- ✅ Exécution contrôlée (après connexion réussie)
- ✅ Gestion d'erreur côté frontend (pas de blocage)
- ✅ Plus facile à debugger

---

### Étape 3 : Modification du Frontend ✅

**Fichier** : `src/contexts/SupabaseAuthContext.jsx`

**Changements dans la fonction `signIn`** :

```jsx
const signIn = useCallback(async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toast({
      variant: "destructive",
      title: "Connexion échouée",
      description: error.message || "Email ou mot de passe incorrect",
    });
  } else {
    // ✨ NOUVEAU : Incrémenter le compteur de connexions
    try {
      await supabase.rpc('increment_user_login_count', {
        user_id: data.user.id
      });
    } catch (loginCountError) {
      console.warn('Failed to increment login count:', loginCountError);
      // ⚠️ IMPORTANT : Ne pas bloquer la connexion si l'incrémentation échoue
    }

    toast({
      title: "Bon retour ! 👋",
      description: "Vous êtes maintenant connecté(e).",
    });
  }

  return { data, error };
}, [toast]);
```

**Sécurité** :
- ✅ Gestion d'erreur avec `try/catch`
- ✅ L'échec de l'incrémentation ne bloque **pas** la connexion
- ✅ Warning en console pour debugging

---

## 📋 Checklist de Déploiement

### Base de Données (Supabase) ✅

- [x] Exécuter `URGENCE_FIX_TRIGGER.sql` (supprimer trigger)
- [ ] **À FAIRE** : Exécuter `add_login_count_rpc_safe.sql` (créer fonction RPC)

### Frontend ✅

- [x] Modifier `SupabaseAuthContext.jsx` (ajouter appel RPC)
- [ ] **À FAIRE** : Committer les changements
- [ ] **À FAIRE** : Tester connexion + vérifier incrémentation

---

## 🧪 Tests de Validation

### Test 1 : Connexion Fonctionne ✅
```
1. Se connecter avec un compte existant
2. ✅ Connexion réussie (pas d'erreur 500)
3. ✅ Toast "Bon retour ! 👋" affiché
```

### Test 2 : Login Count Incrémenté (À TESTER)
```sql
-- Avant connexion
SELECT login_count FROM profiles WHERE id = 'user-id';  -- Exemple: 0

-- Se connecter sur l'app

-- Après connexion
SELECT login_count FROM profiles WHERE id = 'user-id';  -- Devrait être: 1
```

### Test 3 : Gestion d'Erreur (À TESTER)
```
1. Supprimer temporairement la fonction RPC
2. Se connecter
3. ✅ Connexion réussie malgré l'erreur
4. ⚠️ Warning en console : "Failed to increment login count"
```

---

## 📊 Impact

### Utilisateurs Affectés
- **Période** : ~10-15 minutes (entre création du trigger et correction)
- **Impact** : Impossible de se connecter pendant cette période
- **Résolution** : Immédiate après suppression du trigger

### Leçons Apprises

1. **❌ NE JAMAIS créer de triggers sur `auth.sessions`**
   - Risque de bloquer l'authentification
   - Difficile à debugger (erreur 500 générique)

2. **✅ Préférer les fonctions RPC côté frontend**
   - Plus de contrôle
   - Gestion d'erreur explicite
   - Pas de risque de blocage

3. **✅ Toujours tester les migrations en dev d'abord**
   - Créer un compte test
   - Vérifier que connexion/inscription fonctionnent
   - Valider avant production

4. **✅ Avoir un plan de rollback**
   - `DROP TRIGGER IF EXISTS` doit être documenté
   - Script de correction préparé à l'avance

---

## 🔄 Prochaines Étapes

### Immédiat (Maintenant)

1. **Exécuter `add_login_count_rpc_safe.sql` dans Supabase**
   ```sql
   CREATE OR REPLACE FUNCTION increment_user_login_count(user_id UUID)...
   GRANT EXECUTE ON FUNCTION increment_user_login_count(UUID) TO authenticated;
   ```

2. **Committer les changements**
   ```bash
   git add src/contexts/SupabaseAuthContext.jsx
   git add supabase/migrations/URGENCE_FIX_TRIGGER.sql
   git add supabase/migrations/add_login_count_rpc_safe.sql
   git commit -m "fix(auth): replace blocking trigger with safe RPC for login_count"
   git push
   ```

3. **Tester la connexion**
   - Logout
   - Login
   - Vérifier `login_count` incrémenté

### Court Terme (Aujourd'hui)

4. **Tester le modal de notifications**
   - Login 2x avec un compte
   - ✅ Modal doit apparaître après 2ème login
   - Vérifier `login_count = 2` dans profiles

5. **Documentation**
   - Mettre à jour `QUICK_WIN_2_NOTIFICATIONS_PUSH_WIP.md`
   - Ajouter note sur l'incident dans CHANGELOG

---

## 📝 Notes Techniques

### Pourquoi `SECURITY DEFINER` ?

```sql
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- La fonction s'exécute avec les **privilèges du créateur** (pas de l'appelant)
- Nécessaire car `authenticated` users n'ont pas forcément `UPDATE` sur `profiles`
- **Sécurisé** : La fonction ne fait qu'incrémenter (pas de requête arbitraire)

### Pourquoi `GRANT EXECUTE` ?

```sql
GRANT EXECUTE ON FUNCTION increment_user_login_count(UUID) TO authenticated;
```

- Par défaut, seul le créateur peut appeler la fonction
- `GRANT` permet aux utilisateurs authentifiés de l'appeler via RPC
- **Sécurisé** : Uniquement `authenticated` (pas `anon` ou `public`)

### Pourquoi `COALESCE(login_count, 0)` ?

```sql
SET login_count = COALESCE(login_count, 0) + 1
```

- Si `login_count` est `NULL` (première incrémentation), utiliser `0`
- Évite les erreurs `NULL + 1 = NULL`
- **Robuste** : Fonctionne même si valeur par défaut pas appliquée

---

**Dernière mise à jour** : 21 Octobre 2025 16h45  
**Status** : ✅ Incident résolu - Tests en cours  
**Next** : Exécuter RPC SQL → Committer → Tester modal notifications
