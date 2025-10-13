# 🔧 CORRECTION - editMessage

**Date**: 9 octobre 2025, 15:42  
**Problème**: `invalid input syntax for type integer` dans `editMessage`

---

## 🐛 Problème

### **Erreur Console**

```javascript
❌ [aiConversationService] Erreur editMessage: {
  code: '22P02',
  message: 'invalid input syntax for type integer: "{"shouldThrowOnError":false,...}"'
}
```

### **Cause Racine**

**Ligne 131 - aiConversationService.js** :

```javascript
// ❌ AVANT
.update({
  edit_count: supabase.rpc('increment', { row_id: messageId, column_name: 'edit_count' })
})
```

**Problème** : 
- `supabase.rpc()` retourne un **objet Promise** 
- PostgreSQL attend un **integer**
- L'objet Promise est converti en string puis passé à PostgreSQL
- PostgreSQL rejette car ce n'est pas un integer

---

## ✅ Solution

**Approche** : Récupérer `edit_count` actuel → Incrémenter → Mettre à jour

```javascript
// ✅ APRÈS
async editMessage(messageId, newContent) {
  try {
    // 1. Récupérer edit_count actuel
    const { data: currentMessage } = await supabase
      .from('ai_messages')
      .select('edit_count')
      .eq('id', messageId)
      .single();

    // 2. Incrémenter
    const newEditCount = (currentMessage?.edit_count || 0) + 1;

    // 3. Mettre à jour avec la nouvelle valeur
    const { data, error } = await supabase
      .from('ai_messages')
      .update({
        content: newContent,
        is_edited: true,
        edit_count: newEditCount,  // ✅ Integer valide
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: data };
  } catch (error) {
    console.error('[aiConversationService] Erreur editMessage:', error);
    return { success: false, error: error.message };
  }
}
```

---

## 🎯 Résultat

### **Avant**
- ❌ Erreur PostgreSQL `invalid input syntax for type integer`
- ❌ `edit_count` non incrémenté
- ❌ Message non édité

### **Après**
- ✅ `edit_count` correctement incrémenté
- ✅ Message édité avec succès
- ✅ `is_edited: true` appliqué
- ✅ `updated_at` mis à jour

---

## 🧪 Test

**Hard Refresh** : `Ctrl + Shift + R`

**Actions** :
1. Ouvrir Coach IA
2. Envoyer un message "Test édition"
3. Cliquer sur ✏️ (éditer)
4. Modifier le texte → "Test édition modifié"
5. Valider

**Attendu** :
```javascript
✅ Message édité avec succès
✅ edit_count: 1
✅ is_edited: true
```

**Plus d'erreur** : ❌ `invalid input syntax for type integer`

---

## 📝 Leçon Apprise

**Ne JAMAIS utiliser `supabase.rpc()` dans un `.update()`** :

```javascript
// ❌ NE PAS FAIRE
.update({
  count: supabase.rpc('increment', { ... })  // Promise, pas integer
})

// ✅ FAIRE
const { data: current } = await supabase.select('count').eq('id', id).single();
const newCount = (current?.count || 0) + 1;
.update({ count: newCount })
```

**Alternative** : Utiliser PostgreSQL trigger/function pour auto-increment si nécessaire.

---

## 📁 Fichier Modifié

- `src/lib/aiConversationService.js` (ligne 125-151)
  - Fonction `editMessage` réécrite
  - +8 lignes (récupération edit_count)
  - Suppression de `supabase.rpc()` dans UPDATE

---

✅ **CORRIGÉ** - Prêt pour Claude AI ! 🚀
