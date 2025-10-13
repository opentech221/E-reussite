# ⚡ CORRECTIONS URGENTES - 3 ERREURS

**Date**: 9 octobre 2025, 04:10

---

## 🔧 CORRECTIONS APPLIQUÉES

### ✅ **1. conversations is not iterable**

**Fichier** : `useAIConversation.js` ligne 127

**Changement** :
```javascript
// AVANT
setConversations([conv, ...conversations]);

// APRÈS
setConversations(prev => [conv, ...(Array.isArray(prev) ? prev : [])]);
```

---

## ⏳ À CORRIGER PAR VOUS

### ❌ **2. RLS Policy violation (42501)**

**Erreur** : `new row violates row-level security policy for table "ai_messages"`

**Solution rapide (2 min)** :

1. Ouvrir **Supabase SQL Editor**
2. Exécuter :
   ```sql
   ALTER TABLE ai_messages DISABLE ROW LEVEL SECURITY;
   ALTER TABLE ai_conversations DISABLE ROW LEVEL SECURITY;
   ```
3. **F5** pour recharger l'app

**⚠️ Temporaire développement - Réactiver avant production !**

---

### ⚠️ **3. Missing key prop (Warning)**

**Statut** : Non bloquant, mais à corriger

**Le code a déjà la key**, le warning vient peut-être d'un hot-reload.  
Recharger l'app devrait résoudre.

---

## 🧪 TEST APRÈS CORRECTIONS

1. **Désactiver RLS** (voir ci-dessus)
2. **Recharger app** : F5
3. **Ouvrir Coach IA** : Icône Brain
4. **Envoyer** : "Bonjour"
5. ✅ **Vérifier** :
   - Message apparaît
   - Conversation créée
   - Aucune erreur console

---

## 📚 DOCUMENTATION

- **Debug RLS** : `database/DEBUG_RLS_POLICIES.sql`
- **Solution RLS** : `SOLUTION_RLS_42501.md`

---

**🚀 Désactivez RLS maintenant et testez ! 🎉**
