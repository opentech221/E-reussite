# ⚡ ACTION IMMÉDIATE - Correction UUID Coach IA

**URGENT** : 2 corrections à appliquer avant de tester l'application

---

## 🎯 PROBLÈME IDENTIFIÉ

```
Erreur: invalid input syntax for type integer: "b8fe56ad-e6e8-44f8-940f-a9e1d1115097"
```

**Cause** : Les tables utilisent `INT` au lieu de `UUID`

---

## ✅ SOLUTION EN 3 ÉTAPES (10 MINUTES)

### **ÉTAPE 1 : Ouvrir Supabase SQL Editor**

1. Aller sur https://supabase.com/dashboard
2. Sélectionner projet **E-reussite**
3. Menu gauche → **SQL Editor**

---

### **ÉTAPE 2 : Exécuter le script de correction**

1. Ouvrir le fichier dans VS Code:
   ```
   database/CORRECTION_SCHEMA_UUID.sql
   ```

2. **COPIER TOUT** le contenu (489 lignes)

3. **COLLER** dans Supabase SQL Editor

4. Cliquer **RUN** (ou F5)

5. **ATTENDRE** les messages de succès:
   ```
   ✅ Anciennes tables supprimées
   ✅ Table ai_conversations créée (UUID)
   ✅ Table ai_messages créée (UUID)
   ✅ Table ai_message_attachments créée (UUID)
   ✅ 9 index de performance créés
   ✅ RLS activé sur les 3 tables
   ✅ 12 policies RLS créées
   ✅ 3 triggers créés
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ SCHEMA UUID CRÉÉ AVEC SUCCÈS !
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

⚠️ **Si erreur** : Vérifier PostgreSQL ≥ 13

---

### **ÉTAPE 3 : Créer le bucket Storage**

1. Rester dans **SQL Editor**

2. Ouvrir le fichier dans VS Code:
   ```
   database/create_storage_bucket.sql
   ```

3. **COPIER TOUT** le contenu (171 lignes)

4. **COLLER** dans SQL Editor

5. Cliquer **RUN** (ou F5)

6. Vérifier messages:
   ```
   ✅ Bucket ai-chat-attachments créé
   ✅ 4 Storage policies créées
   ```

---

## 🔍 VÉRIFICATION (2 MINUTES)

### **Dans Table Editor**

1. Menu gauche → **Table Editor**
2. Vérifier ces 3 tables existent:
   - ✅ `ai_conversations`
   - ✅ `ai_messages`
   - ✅ `ai_message_attachments`

3. Cliquer sur `ai_conversations`
4. Vérifier colonnes:
   - ✅ `id` → type `uuid`
   - ✅ `user_id` → type `uuid`
   - ✅ `title` → type `text`
   - ✅ `context_page` → type `text`
   - ✅ `is_pinned` → type `boolean`

### **Dans Storage**

1. Menu gauche → **Storage**
2. Vérifier bucket:
   - ✅ `ai-chat-attachments` existe
   - ✅ Privacy: Private
   - ✅ Limite: 5 MB

---

## 🧪 TEST APPLICATION (2 MINUTES)

### **1. Recharger la page**

1. Aller sur http://localhost:3000/
2. Appuyer **F5** (refresh)
3. Se connecter

### **2. Ouvrir Coach IA**

1. Cliquer icône **Brain** 🧠
2. **Vérifier console** (F12):
   - ✅ Pas d'erreur 22P02
   - ✅ Pas d'erreur `messages.map`

### **3. Envoyer message**

1. Taper: "Bonjour"
2. Appuyer **Entrée**
3. **Vérifier**:
   - ✅ Message apparaît dans le chat
   - ✅ Pas d'erreur console

### **4. Vérifier base de données**

1. Retourner Supabase → **Table Editor**
2. Ouvrir `ai_conversations`
3. **Vérifier**:
   - ✅ 1 nouvelle ligne
   - ✅ Colonne `id` = UUID (ex: `a1b2c3d4-e5f6-...`)
   - ✅ Colonne `title` = "Bonjour" ou généré

4. Ouvrir `ai_messages`
5. **Vérifier**:
   - ✅ 1 ou 2 lignes (user + assistant)
   - ✅ Colonne `conversation_id` = UUID
   - ✅ Colonne `role` = 'user'

---

## ✅ SI TOUT FONCTIONNE

**Félicitations !** Le Coach IA Phase 1 est maintenant fonctionnel ! 🎉

**Vous pouvez maintenant**:
- ✅ Créer des conversations
- ✅ Envoyer des messages
- ✅ Uploader des images (prochain test)
- ✅ Voir l'historique (cliquer bouton History)

---

## ❌ SI ERREUR PERSISTE

### **Erreur : "uuid-ossp extension required"**

**Solution** :
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Erreur : "gen_random_uuid does not exist"**

**Solution** : Vérifier version PostgreSQL
```sql
SELECT version();
-- Doit être ≥ 13
```

Si version < 13, utiliser:
```sql
-- Dans CORRECTION_SCHEMA_UUID.sql, remplacer:
DEFAULT gen_random_uuid()
-- Par:
DEFAULT uuid_generate_v4()

-- Et ajouter en début de script:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Erreur : "permission denied"**

**Solution** : Vérifier vous êtes connecté comme admin Supabase

### **Erreur 22P02 toujours présente**

**Solution** : Vider cache navigateur
1. F12 → Console
2. Clic droit sur Reload → **Empty Cache and Hard Reload**

---

## 📞 DEBUG AVANCÉ

### **Vérifier types colonnes**

```sql
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('ai_conversations', 'ai_messages', 'ai_message_attachments')
AND column_name LIKE '%id%'
ORDER BY table_name, ordinal_position;
```

**Résultat attendu**:
```
ai_conversations       | id                | uuid
ai_conversations       | user_id           | uuid
ai_messages            | id                | uuid
ai_messages            | conversation_id   | uuid
ai_message_attachments | id                | uuid
ai_message_attachments | message_id        | uuid
```

### **Vérifier policies RLS**

```sql
SELECT 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('ai_conversations', 'ai_messages', 'ai_message_attachments')
ORDER BY tablename, cmd;
```

**Résultat attendu** : 12 policies (4 par table)

---

## 📊 RÉCAPITULATIF

| Étape | Fichier | Action | Durée |
|-------|---------|--------|-------|
| 1 | `CORRECTION_SCHEMA_UUID.sql` | Exécuter dans Supabase | 3 min |
| 2 | `create_storage_bucket.sql` | Exécuter dans Supabase | 2 min |
| 3 | Supabase Table Editor | Vérifier tables | 2 min |
| 4 | http://localhost:3000/ | Tester application | 3 min |

**TOTAL** : 10 minutes

---

## 🎯 APRÈS CORRECTION

**Tests à faire** :
1. ✅ Créer conversation
2. ✅ Envoyer message texte
3. ✅ Uploader image (avec texte)
4. ✅ Toggle sidebar historique
5. ✅ Éditer message
6. ✅ Supprimer message
7. ✅ Épingler conversation
8. ✅ Renommer conversation

**Documentation** :
- Voir `CORRECTION_ERREURS_CRITIQUES_UUID.md` pour détails complets

---

**PRÊT ? GO ! 🚀**

1. Ouvrir Supabase SQL Editor
2. Copier/Coller `CORRECTION_SCHEMA_UUID.sql`
3. RUN
4. Copier/Coller `create_storage_bucket.sql`
5. RUN
6. F5 sur http://localhost:3000/
7. Tester ! 🎉
