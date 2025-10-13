# 🔧 SOLUTION RAPIDE RLS POLICY 42501

**Date**: 9 octobre 2025, 04:10  
**Erreur**: `new row violates row-level security policy for table "ai_messages"`

---

## 🐛 PROBLÈME

L'insertion de messages dans `ai_messages` est bloquée par la policy RLS.

### **Cause possible** :

1. `auth.uid()` retourne `NULL` (utilisateur non authentifié côté Supabase)
2. La conversation n'est pas encore commit quand on essaie d'insérer le message
3. Le token JWT n'est pas passé correctement dans les requêtes

---

## ✅ SOLUTION TEMPORAIRE (DÉVELOPPEMENT)

### **Option 1 : Désactiver RLS temporairement**

**⚠️ À utiliser UNIQUEMENT en développement !**

```sql
-- Dans Supabase SQL Editor
ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_attachments DISABLE ROW LEVEL SECURITY;
```

**Résultat** :
- ✅ Les inserts fonctionneront
- ⚠️ Aucune sécurité (tous les utilisateurs peuvent tout voir)
- 🔄 À réactiver avant production

---

### **Option 2 : Policy permissive (DEV)**

```sql
-- Supprimer ancienne policy
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON ai_messages;

-- Policy temporaire permissive
CREATE POLICY "Allow all inserts in development"
ON ai_messages FOR INSERT
WITH CHECK (true);
```

---

### **Option 3 : Vérifier auth.uid()**

Exécutez le script `database/DEBUG_RLS_POLICIES.sql` dans Supabase SQL Editor :

```sql
-- Test rapide
SELECT auth.uid();
```

**Si retourne NULL** :
- Problème d'authentification Supabase
- Token JWT non passé dans les requêtes

**Si retourne UUID** :
- auth.uid() fonctionne
- Le problème vient d'ailleurs

---

## 🔍 DIAGNOSTIC COMPLET

### **Étape 1 : Exécuter script debug**

1. Ouvrir Supabase SQL Editor
2. Copier/coller `database/DEBUG_RLS_POLICIES.sql`
3. Exécuter (RUN)
4. Lire les messages de diagnostic

### **Étape 2 : Interpréter résultats**

**Message** : `auth.uid() retourne NULL`
→ **Solution** : Vérifier token JWT passé dans requêtes

**Message** : `auth.uid() fonctionne`
→ **Solution** : Problème dans la policy, utiliser Option 1 ou 2

---

## ✅ SOLUTION PRODUCTION (FUTURE)

Une fois le développement terminé, réactiver RLS :

```sql
-- Réactiver RLS
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_attachments ENABLE ROW LEVEL SECURITY;

-- Recréer policies correctes
-- (voir CORRECTION_SCHEMA_UUID.sql)
```

---

## 🚀 ACTION IMMÉDIATE

**Pour débloquer le développement maintenant** :

1. Ouvrir Supabase SQL Editor
2. Exécuter :
   ```sql
   ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;
   ALTER TABLE ai_conversations DISABLE ROW LEVEL SECURITY;
   ```
3. Recharger l'application (F5)
4. Tester création conversation + message
5. ✅ Devrait fonctionner

**Durée** : 2 minutes

---

## 📝 TODO APRÈS DÉVELOPPEMENT

- [ ] Réactiver RLS sur les 3 tables
- [ ] Vérifier que auth.uid() fonctionne
- [ ] Tester policies avec utilisateurs différents
- [ ] Valider isolation des données

---

**⚡ Exécutez Option 1 maintenant pour débloquer ! ⚡**
