# 🚀 Migration: Ajout des colonnes à la table profiles

## 📋 Résumé

Cette migration ajoute **14 nouvelles colonnes** à la table `profiles` pour enrichir les profils utilisateurs :

### Colonnes ajoutées :
1. ✅ **email** - Synchronisé depuis auth.users
2. ✅ **level** - Niveau scolaire (3e, Seconde, Première, Terminale)
3. ✅ **region** - Région géographique
4. ✅ **phone** - Numéro de téléphone
5. ✅ **date_of_birth** - Date de naissance
6. ✅ **gender** - Genre (male/female/other)
7. ✅ **address** - Adresse complète
8. ✅ **city** - Ville
9. ✅ **country** - Pays (défaut: Sénégal)
10. ✅ **bio** - Biographie/Description
11. ✅ **school** - École/Établissement
12. ✅ **status** - Statut du compte (active/suspended/inactive/pending)
13. ✅ **last_login** - Dernière connexion
14. ✅ **preferences** - Préférences utilisateur (JSON)

## 🔧 Fonctionnalités supplémentaires

- **Synchronisation automatique de l'email** via trigger depuis auth.users
- **Index de performance** sur email, level, region, status, school
- **Contraintes de validation** sur gender et status
- **Valeurs par défaut** : country='Sénégal', status='active', preferences='{}'

## 📝 Instructions d'exécution

### Option 1: Via Supabase Dashboard (RECOMMANDÉ)

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** E-Réussite
3. **Allez dans SQL Editor** (menu latéral)
4. **Créez une nouvelle requête**
5. **Copiez-collez** le contenu du fichier :
   ```
   supabase/migrations/20251130_add_profiles_columns.sql
   ```
6. **Exécutez** la requête (bouton Run ou Ctrl+Enter)
7. **Vérifiez les logs** dans la sortie console

### Option 2: Via Supabase CLI

```bash
# 1. Appliquer la migration
supabase db push

# OU directement avec psql
psql $DATABASE_URL < supabase/migrations/20251130_add_profiles_columns.sql
```

## ✅ Vérification post-migration

### 1. Vérifier que toutes les colonnes ont été ajoutées :

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### 2. Vérifier la synchronisation des emails :

```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(email) as users_with_email,
    ROUND(COUNT(email)::NUMERIC / COUNT(*) * 100, 2) as email_sync_percentage
FROM public.profiles;
```

### 3. Vérifier les index créés :

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
AND schemaname = 'public';
```

## 🎯 Impact sur l'application

### AdminUsersPage (Gestion des utilisateurs)

Le formulaire d'édition peut maintenant modifier :
- ✅ Nom complet
- ✅ Email
- ✅ Téléphone
- ✅ Rôle
- ✅ Niveau scolaire
- ✅ Région
- ✅ École
- ✅ Statut du compte

### Requêtes admin enrichies

Les filtres suivants sont maintenant disponibles :
- Filtrer par niveau scolaire
- Filtrer par région
- Filtrer par statut de compte
- Rechercher par email ou nom

## 🔄 Rollback (en cas de problème)

Si vous devez annuler la migration :

```sql
BEGIN;

-- Supprimer les colonnes ajoutées
ALTER TABLE public.profiles 
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS level,
    DROP COLUMN IF EXISTS region,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS date_of_birth,
    DROP COLUMN IF EXISTS gender,
    DROP COLUMN IF EXISTS address,
    DROP COLUMN IF EXISTS city,
    DROP COLUMN IF EXISTS country,
    DROP COLUMN IF EXISTS bio,
    DROP COLUMN IF EXISTS school,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS last_login,
    DROP COLUMN IF EXISTS preferences;

-- Supprimer les index
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_level;
DROP INDEX IF EXISTS idx_profiles_region;
DROP INDEX IF EXISTS idx_profiles_status;
DROP INDEX IF EXISTS idx_profiles_school;

-- Supprimer le trigger
DROP TRIGGER IF EXISTS sync_profile_email_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_profile_email();

COMMIT;
```

## 📊 Résultat attendu

Après exécution, vous devriez voir dans les logs :

```
✅ Colonne email ajoutée
✅ Colonne level ajoutée
✅ Colonne region ajoutée
✅ Colonne phone ajoutée
✅ Colonne date_of_birth ajoutée
✅ Colonne gender ajoutée
✅ Colonne address ajoutée
✅ Colonne city ajoutée
✅ Colonne country ajoutée
✅ Colonne bio ajoutée
✅ Colonne school ajoutée
✅ Colonne status ajoutée
✅ Colonne last_login ajoutée
✅ Colonne preferences ajoutée
✅ 6 emails synchronisés depuis auth.users
✅ Index créés
✅ Trigger sync_profile_email_trigger créé
========================================
📊 Résultat final:
   Total profiles: 6
   Avec email: 6 (100.0%)
   Avec niveau: 0 (0.0%)
   Avec région: 0 (0.0%)
========================================
✅ Migration terminée avec succès!
```

## 🎉 Prochaines étapes

Après la migration :

1. **Rechargez l'application** (F5 dans le navigateur)
2. **Testez l'édition d'un utilisateur** dans `/admin/users`
3. **Vérifiez** que tous les champs sont modifiables sans erreur
4. **Remplissez** progressivement les données manquantes (niveau, région, etc.)

## 🆘 Support

En cas de problème :

1. Vérifiez les logs de la console Supabase
2. Consultez les erreurs PostgreSQL
3. Assurez-vous d'avoir les permissions nécessaires sur la base de données
4. En dernier recours, exécutez le script de rollback ci-dessus
