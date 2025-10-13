# 📋 Guide de Migration 002 - Ajout de la colonne `difficulty`

**Date:** 5 octobre 2025  
**Objectif:** Ajouter la colonne `difficulty` à la table `quiz` pour stocker dynamiquement la difficulté des quiz

---

## 🎯 Pourquoi cette migration ?

Actuellement, la difficulté des quiz est calculée côté client (frontend) selon le nombre de questions. Cela pose plusieurs problèmes :
- ❌ Données non persistantes en base
- ❌ Logique métier dans le frontend au lieu du backend
- ❌ Impossible de définir manuellement la difficulté réelle d'un quiz
- ❌ Non professionnel pour une plateforme éducative

**Solution:** Stocker la difficulté directement dans la base de données ✅

---

## 📁 Fichiers concernés

### 1. Migration SQL
**Fichier:** `database/migrations/002_add_difficulty_to_quiz.sql`

```sql
-- Ajoute la colonne difficulty
ALTER TABLE quiz 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20);

-- Définit des valeurs par défaut
UPDATE quiz q
SET difficulty = CASE
  WHEN (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) <= 5 THEN 'Facile'
  WHEN (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) <= 10 THEN 'Moyen'
  ELSE 'Difficile'
END
WHERE difficulty IS NULL;
```

### 2. Seed mis à jour
**Fichier:** `database/seed/001_initial_content.sql`

Les INSERT de quiz incluent maintenant:
```sql
INSERT INTO quiz (chapitre_id, title, difficulty, time_limit, description) VALUES
  (chap_thales_id, 'Quiz: Théorème de Thalès - Niveau 1', 'Facile', 10, 
   'Testez vos connaissances sur le théorème de Thalès et ses applications')
```

### 3. Frontend nettoyé
**Fichier:** `src/pages/QuizList.jsx`

Suppression du calcul automatique - la difficulté vient maintenant de `quiz.difficulty` en BDD.

---

## 🚀 Comment exécuter la migration ?

### Méthode 1: Via Supabase Dashboard (RECOMMANDÉ)

1. **Accédez à votre projet:**
   - URL: https://supabase.com/dashboard
   - Connectez-vous avec vos credentials
   - Sélectionnez le projet **E-Réussite**

2. **Ouvrez SQL Editor:**
   - Menu de gauche → **SQL Editor**
   - Cliquez sur **New query**

3. **Copiez le contenu:**
   - Ouvrez: `database/migrations/002_add_difficulty_to_quiz.sql`
   - Copiez tout le contenu
   - Collez dans l'éditeur SQL

4. **Exécutez:**
   - Cliquez sur **Run** ou appuyez sur `Ctrl+Enter`
   - Attendez la confirmation ✅

5. **Vérifiez:**
   ```sql
   -- Vérifier que la colonne existe
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'quiz' AND column_name = 'difficulty';
   
   -- Voir les difficulté assignées
   SELECT id, title, difficulty FROM quiz;
   ```

### Méthode 2: Via psql (ligne de commande)

Si vous avez accès direct à PostgreSQL:

```bash
# Récupérer la connection string depuis Supabase
# Settings → Database → Connection string (URI)

psql "<YOUR_CONNECTION_STRING>" -f database/migrations/002_add_difficulty_to_quiz.sql
```

### Méthode 3: Script Node.js

```bash
node scripts/run-migration-002.js
```
⚠️ Ce script affiche les instructions - l'exécution réelle doit se faire via Supabase Dashboard.

---

## ✅ Vérification post-migration

### 1. Dans Supabase Dashboard

**Table Editor:**
- Menu → **Table Editor**
- Sélectionnez la table `quiz`
- Vérifiez que la colonne `difficulty` existe
- Vérifiez que les quiz ont des valeurs: `Facile`, `Moyen`, ou `Difficile`

**Exemple de résultat attendu:**

| id | title | difficulty | time_limit |
|----|-------|-----------|------------|
| 3  | Quiz: Théorème de Thalès - Niveau 1 | Facile | 10 |
| 4  | Quiz: Équations du second degré | Facile | 10 |

### 2. Dans l'application

1. **Démarrez le serveur:**
   ```bash
   npm run dev
   ```

2. **Naviguez vers `/quiz`:**
   - http://localhost:3000/quiz

3. **Vérifiez les badges:**
   - Les cartes de quiz affichent les badges de difficulté
   - Badge vert = Facile
   - Badge jaune = Moyen
   - Badge rouge = Difficile

### 3. Console de développement

Ouvrez la console (F12) et vérifiez:
```javascript
// Pas d'erreur du type:
// "Cannot read property 'difficulty' of undefined"
```

---

## 🔄 Si vous voulez reset et re-seed

Si vous voulez repartir de zéro avec la nouvelle structure:

```sql
-- 1. Supprimer les données existantes
DELETE FROM quiz_results;
DELETE FROM quiz_questions;
DELETE FROM quiz;

-- 2. Exécuter la migration 002
-- (via SQL Editor comme décrit ci-dessus)

-- 3. Re-seed avec les nouvelles données
-- Copiez-collez database/seed/001_initial_content.sql dans SQL Editor
```

---

## 🎨 Valeurs possibles pour `difficulty`

Standardisons les valeurs acceptées:

| Valeur | Badge | Usage |
|--------|-------|-------|
| `Facile` | 🟢 Vert | Quiz d'introduction, 1-5 questions simples |
| `Moyen` | 🟡 Jaune | Quiz intermédiaire, 6-10 questions |
| `Difficile` | 🔴 Rouge | Quiz avancé, 11+ questions complexes |

**Note:** Ces valeurs sont en français car l'app est francophone.

---

## 📊 Impact sur les autres pages

### Pages affectées:
- ✅ `/quiz` (QuizList) - Affiche le badge
- ✅ `/quiz/:id` (Quiz) - Peut afficher la difficulté dans l'en-tête
- ✅ `/my-courses` (CoursesPrivate) - Boutons "Faire le quiz" fonctionnels

### Pages NON affectées:
- Dashboard - utilise `quiz_results`, pas la table `quiz` directement
- Profile - pas de relation
- Leaderboard - pas de relation

---

## ❓ FAQ

**Q: Que se passe-t-il si je n'exécute pas la migration ?**  
R: L'application continuera de fonctionner, mais les badges de difficulté ne s'afficheront pas (condition `{quiz.difficulty && ...}`).

**Q: Puis-je changer manuellement la difficulté d'un quiz ?**  
R: Oui ! Via Table Editor dans Supabase, ou en SQL:
```sql
UPDATE quiz SET difficulty = 'Difficile' WHERE id = 3;
```

**Q: Dois-je aussi migrer la production ?**  
R: Oui, exécutez la même migration sur votre base de production quand vous déployez.

**Q: Et si j'ajoute de nouveaux quiz ?**  
R: Assurez-vous d'inclure `difficulty` dans vos INSERT:
```sql
INSERT INTO quiz (chapitre_id, title, difficulty, time_limit, description) 
VALUES (1, 'Mon Quiz', 'Moyen', 15, 'Description...');
```

---

## 📞 Support

En cas de problème:
1. Vérifiez les logs Supabase: Dashboard → Logs
2. Vérifiez la console navigateur (F12)
3. Vérifiez que la migration s'est bien exécutée (requête SELECT ci-dessus)

---

**Auteur:** Assistant AI  
**Date:** 5 octobre 2025  
**Version:** 1.0
