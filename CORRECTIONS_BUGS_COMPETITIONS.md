# 🔧 Corrections Bugs Compétitions - 26 octobre 2025

## 📋 Résumé

Correction de 2 bugs critiques empêchant le fonctionnement des compétitions :

1. **Crash de CompetitionQuizPage** (frontend)
2. **Erreur SQL dans get_competition_leaderboard** (backend)

---

## 🐛 Bug 1 : Crash CompetitionQuizPage

### ❌ **Erreur**

```
CompetitionQuizPage.jsx:292 Uncaught TypeError: 
Cannot read properties of undefined (reading 'map')
```

### 🔍 **Cause**

Ligne 302 dans `CompetitionQuizPage.jsx` :

```jsx
{currentQuestion.question.question}  // ❌ MAUVAIS
```

La structure des données de la table `questions` utilise `question_text`, pas `question`.

### ✅ **Solution**

**Fichier :** `src/pages/CompetitionQuizPage.jsx`  
**Ligne :** 302

```jsx
{currentQuestion.question.question_text}  // ✅ CORRECT
```

### 📝 **Changement**

```diff
- {currentQuestion.question.question}
+ {currentQuestion.question.question_text}
```

---

## 🐛 Bug 2 : Erreur SQL Leaderboard

### ❌ **Erreur**

```
Fetch error: {"code":"42703","details":null,"hint":null,
"message":"column p.username does not exist"}
```

### 🔍 **Cause**

La fonction `get_competition_leaderboard` dans `ADD_COMPETITIONS_FUNCTIONS.sql` utilisait `p.username`, mais la table `profiles` n'a **pas de colonne `username`**.

**Colonnes réelles de `profiles` :**
- ✅ `id`
- ✅ `full_name` ← **La bonne colonne**
- ✅ `avatar_url`
- ✅ `location`
- ❌ `username` ← **N'existe pas**

### ✅ **Solution**

**Fichier :** `ADD_COMPETITIONS_FUNCTIONS.sql`  
**Lignes :** 356, 373, 391, 413

```sql
-- ❌ AVANT
username VARCHAR,  -- Ligne 356
p.username,        -- Lignes 373, 391, 413

-- ✅ APRÈS
full_name VARCHAR,
p.full_name,
```

### 📝 **Changements**

**Ligne 356** (type de retour) :
```diff
- username VARCHAR,
+ full_name VARCHAR,
```

**Lignes 373, 391, 413** (SELECT) :
```diff
- p.username,
+ p.full_name,
```

---

## 🚀 Actions Requises

### ✅ **1. Code Frontend (FAIT)**

- [x] `src/pages/CompetitionQuizPage.jsx` corrigé
- [x] Commit créé : `c2d149eb`
- [x] Push vers GitHub

### ⚠️ **2. Fonction SQL (ACTION REQUISE)**

**Il faut RE-EXÉCUTER le fichier SQL dans Supabase :**

```bash
# 1. Ouvrez Supabase Dashboard
# 2. Allez dans SQL Editor
# 3. Copier/coller : ADD_COMPETITIONS_FUNCTIONS.sql
# 4. Cliquez sur RUN
# 5. Vérifiez : "Success. No rows returned"
```

**Pourquoi ?**  
Les fonctions PostgreSQL doivent être **recréées** (avec `CREATE OR REPLACE FUNCTION`) pour que les changements soient pris en compte.

---

## 🧪 Test de Validation

Après avoir re-exécuté la fonction SQL, testez :

```bash
npm run dev
```

### ✅ **Résultat Attendu**

1. **Page /competitions** : Liste des compétitions s'affiche
2. **Clic sur une compétition** : Page du quiz se charge sans crash
3. **Questions affichées** : Le texte de la question est visible
4. **Leaderboard** : Pas d'erreur SQL `column p.username does not exist`

### ❌ **Si Erreur Persiste**

Vérifiez dans la console :
- Pas d'erreur `Cannot read properties of undefined`
- Pas d'erreur SQL `42703`

---

## 📊 Récapitulatif des Fichiers Modifiés

| Fichier | Type | Lignes Modifiées | Status |
|---------|------|------------------|--------|
| `src/pages/CompetitionQuizPage.jsx` | Frontend | 302 | ✅ Corrigé + Push |
| `ADD_COMPETITIONS_FUNCTIONS.sql` | Backend | 356, 373, 391, 413 | ✅ Corrigé + Push |

---

## 🎯 Structure Correcte des Données

### Table `questions`

```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY,
    question_text TEXT,          -- ✅ UTILISER CECI
    question_type VARCHAR(20),
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1),
    subject VARCHAR(100),
    difficulty VARCHAR(20)
);
```

### Table `profiles`

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,              -- ✅ UTILISER CECI
    avatar_url TEXT,
    location VARCHAR(100),
    created_at TIMESTAMP
    -- ❌ PAS de colonne "username"
);
```

---

## 📦 Commits Associés

- **Commit 1** : `7c8ab74a` - Fix politique RLS
- **Commit 2** : `c2d149eb` - Fix structure données compétitions (ce commit)

---

## 🎉 Conclusion

Les deux bugs sont **corrigés dans le code** :
- ✅ Frontend : `question` → `question_text`
- ✅ SQL : `username` → `full_name`

**Action Finale :** Re-exécuter `ADD_COMPETITIONS_FUNCTIONS.sql` dans Supabase pour déployer les corrections.

---

**Auteur :** GitHub Copilot  
**Date :** 26 octobre 2025  
**Statut :** ✅ Code corrigé, ⚠️ SQL à re-exécuter
