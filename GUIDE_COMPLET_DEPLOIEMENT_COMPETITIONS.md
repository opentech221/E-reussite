# 🚀 Guide de Déploiement Complet - MVP Compétitions

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer le système de compétitions complet dans votre base de données Supabase.

---

## 🎯 Ordre d'exécution des scripts SQL

### ✅ ÉTAPE 1 : Créer le schéma (tables)

**Fichier :** `ADD_COMPETITIONS_SCHEMA.sql`

**Durée estimée :** ~2 secondes

**Ce que ça fait :**
- ✅ Crée la table `questions` (questions génériques pour compétitions)
- ✅ Crée la table `competitions` (compétitions principales)
- ✅ Crée la table `competition_participants` (inscriptions + scores)
- ✅ Crée la table `competition_questions` (questions par compétition)
- ✅ Crée la table `competition_answers` (réponses des participants)
- ✅ Crée la table `competition_leaderboards` (classements)
- ✅ Crée les index pour performances
- ✅ Crée les triggers pour `updated_at`

**Comment exécuter :**

1. Ouvrez Supabase Dashboard → SQL Editor
2. Collez le contenu de `ADD_COMPETITIONS_SCHEMA.sql`
3. Cliquez sur **RUN** (ou F5)
4. ✅ Vérifiez qu'il n'y a pas d'erreur

---

### ✅ ÉTAPE 2 : Créer les fonctions PostgreSQL

**Fichier :** `ADD_COMPETITIONS_FUNCTIONS.sql`

**Durée estimée :** ~1 seconde

**Ce que ça fait :**
- ✅ `join_competition()` - Inscription à une compétition
- ✅ `submit_competition_answer()` - Soumettre une réponse
- ✅ `complete_competition_participant()` - Terminer une compétition
- ✅ `update_competition_ranks()` - Calculer les rangs
- ✅ `update_francophone_leaderboard()` - Classements régionaux
- ✅ `get_competition_leaderboard()` - Obtenir le classement

**Comment exécuter :**

1. Ouvrez SQL Editor dans Supabase
2. Collez le contenu de `ADD_COMPETITIONS_FUNCTIONS.sql`
3. Cliquez sur **RUN**
4. ✅ Vérifiez que 6 fonctions sont créées

---

### ✅ ÉTAPE 3 : Configurer la sécurité (RLS)

**Fichier :** `ADD_COMPETITIONS_RLS.sql`

**Durée estimée :** ~1 seconde

**Ce que ça fait :**
- ✅ Active Row Level Security (RLS) sur toutes les tables
- ✅ Crée les policies d'accès (lecture publique, écriture authentifiée)
- ✅ Configure Supabase Realtime pour les mises à jour live
- ✅ Accorde les permissions aux utilisateurs authentifiés

**Comment exécuter :**

1. Ouvrez SQL Editor
2. Collez le contenu de `ADD_COMPETITIONS_RLS.sql`
3. Cliquez sur **RUN**
4. ✅ Vérifiez que RLS est activé sur les 6 tables

---

### ✅ ÉTAPE 4 : Alimenter les questions

**Fichier :** `ADD_COMPETITIONS_SEED_QUESTIONS.sql`

**Durée estimée :** ~3 secondes

**Ce que ça fait :**
- ✅ Insère **60+ questions** réparties sur 7 matières :
  - 📐 Mathématiques (11 questions)
  - 🧬 Sciences / SVT (5 questions)
  - ⚛️ Physique-Chimie (5 questions)
  - 📝 Français (5 questions)
  - 🇬🇧 Anglais (5 questions)
  - 📚 Histoire (5 questions)
  - 🌍 Géographie (5 questions)
- ✅ 3 niveaux de difficulté (facile, moyen, difficile)
- ✅ Affiche des statistiques détaillées

**Comment exécuter :**

1. Ouvrez SQL Editor
2. Collez le contenu de `ADD_COMPETITIONS_SEED_QUESTIONS.sql`
3. Cliquez sur **RUN**
4. ✅ Vérifiez dans les NOTICES :
   ```
   ✅ SEED QUESTIONS TERMINÉ AVEC SUCCÈS
   📊 Total questions : 60 questions
   ```

---

### ✅ ÉTAPE 5 : Créer les compétitions de test

**Fichier :** `ADD_COMPETITIONS_SEED_COMPETITION_TEST.sql`

**Durée estimée :** ~2 secondes

**Ce que ça fait :**
- ✅ Crée **3 compétitions d'exemple** :
  1. **🏆 Challenge Mathématiques** (ACTIF - 10 questions - 7 jours)
  2. **🌍 Quiz Sciences & Vie** (À VENIR - 15 questions - dans 3 jours)
  3. **🔥 Défi Expert** (ACTIF - 20 questions - 14 jours)
- ✅ Assigne automatiquement les questions
- ✅ Configure les récompenses (points, XP, badges)

**Comment exécuter :**

1. Ouvrez SQL Editor
2. Collez le contenu de `ADD_COMPETITIONS_SEED_COMPETITION_TEST.sql`
3. Cliquez sur **RUN**
4. ✅ Vérifiez dans les NOTICES :
   ```
   ✅ SEED COMPÉTITIONS TERMINÉ AVEC SUCCÈS
   🏆 COMPÉTITIONS CRÉÉES : 3
   ```

---

## 🧪 Vérification après déploiement

### 1️⃣ Vérifier les tables

Dans SQL Editor, exécutez :

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'competition%' OR table_name = 'questions'
ORDER BY table_name;
```

✅ Vous devriez voir **6 tables** :
- `questions`
- `competitions`
- `competition_participants`
- `competition_questions`
- `competition_answers`
- `competition_leaderboards`

---

### 2️⃣ Vérifier les données

```sql
-- Compter les questions
SELECT COUNT(*) as total_questions FROM questions;
-- Résultat attendu : 60+

-- Compter les compétitions
SELECT COUNT(*) as total_competitions FROM competitions;
-- Résultat attendu : 3

-- Voir les compétitions actives
SELECT 
    title,
    status,
    questions_count,
    duration_minutes,
    TO_CHAR(starts_at, 'DD/MM/YYYY HH24:MI') as debut,
    TO_CHAR(ends_at, 'DD/MM/YYYY HH24:MI') as fin
FROM competitions
ORDER BY starts_at;
```

---

### 3️⃣ Vérifier RLS (Row Level Security)

```sql
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND (tablename LIKE 'competition%' OR tablename = 'questions');
```

✅ Toutes les tables doivent avoir `rls_enabled = true`

---

### 4️⃣ Vérifier Realtime

Dans Supabase Dashboard :

1. Allez dans **Database** → **Replication**
2. ✅ Vérifiez que ces tables sont publiées :
   - `competitions`
   - `competition_participants`
   - `competition_leaderboards`

---

## 🎮 Tester l'application

### 1️⃣ Lancer l'application

```bash
npm run dev
```

### 2️⃣ Accéder aux compétitions

Ouvrez : `http://localhost:5173/competitions`

### 3️⃣ Scénario de test

1. **Voir la liste des compétitions** ✅
   - Vous devriez voir 2 compétitions actives + 1 à venir
   
2. **S'inscrire à une compétition** ✅
   - Cliquez sur "Participer" sur le Challenge Mathématiques
   
3. **Faire le quiz** ✅
   - Répondez aux 10 questions
   - Le timer doit tourner
   - Les points s'accumulent en temps réel
   
4. **Voir le classement en live** ✅
   - Le leaderboard s'affiche après avoir terminé
   - Votre rang est calculé automatiquement
   
5. **Vérifier les badges/récompenses** ✅
   - Si vous êtes dans le top 3, vous voyez les badges

---

## 🐛 Dépannage

### ❌ Erreur : "relation 'questions' n'existe pas"

**Solution :** Vous avez oublié d'exécuter `ADD_COMPETITIONS_SCHEMA.sql` en premier.

→ Exécutez l'ÉTAPE 1 d'abord

---

### ❌ Erreur : "function join_competition does not exist"

**Solution :** Les fonctions PostgreSQL ne sont pas créées.

→ Exécutez `ADD_COMPETITIONS_FUNCTIONS.sql` (ÉTAPE 2)

---

### ❌ Erreur : "permission denied for table competitions"

**Solution :** RLS n'est pas configuré correctement.

→ Exécutez `ADD_COMPETITIONS_RLS.sql` (ÉTAPE 3)

---

### ❌ Aucune compétition n'apparaît sur la page

**Solution :** Les données de test ne sont pas insérées.

→ Exécutez `ADD_COMPETITIONS_SEED_COMPETITION_TEST.sql` (ÉTAPE 5)

---

### ❌ Le leaderboard ne se met pas à jour en temps réel

**Solution :** Realtime n'est pas activé.

1. Allez dans Supabase Dashboard → Database → Replication
2. Activez Realtime pour :
   - `competitions`
   - `competition_participants`
   - `competition_leaderboards`

---

## 📊 Statistiques du système

Après déploiement complet :

| Élément | Quantité |
|---------|----------|
| **Tables créées** | 6 |
| **Fonctions PostgreSQL** | 6 |
| **Policies RLS** | ~15 |
| **Questions seed** | 60+ |
| **Compétitions test** | 3 |
| **Matières couvertes** | 7 |

---

## 🎯 Prochaines étapes (optionnel)

### 🔧 Ajouter vos propres questions

```sql
INSERT INTO questions (
    question_text,
    question_type,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
    subject,
    difficulty
) VALUES (
    'Votre question ici ?',
    'qcm',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'A', -- Réponse correcte
    'mathematiques',
    'moyen'
);
```

---

### 🏆 Créer une nouvelle compétition

```sql
INSERT INTO competitions (
    title,
    description,
    type,
    subject,
    difficulty,
    duration_minutes,
    questions_count,
    status,
    starts_at,
    ends_at,
    reward_points,
    reward_xp
) VALUES (
    'Ma Super Compétition',
    'Description...',
    'asynchronous',
    'mathematiques',
    'moyen',
    20,
    10,
    'active',
    NOW(),
    NOW() + INTERVAL '7 days',
    500,
    100
);
```

---

## ✅ Checklist finale

- [ ] ÉTAPE 1 : Schema exécuté (6 tables créées)
- [ ] ÉTAPE 2 : Fonctions créées (6 fonctions)
- [ ] ÉTAPE 3 : RLS configuré (sécurité active)
- [ ] ÉTAPE 4 : Questions insérées (60+ questions)
- [ ] ÉTAPE 5 : Compétitions créées (3 compétitions test)
- [ ] Realtime activé sur 3 tables
- [ ] Application lancée (`npm run dev`)
- [ ] Page /competitions accessible
- [ ] Test d'inscription réussi
- [ ] Quiz fonctionnel
- [ ] Leaderboard en temps réel opérationnel

---

## 🎉 Félicitations !

Votre système de compétitions MVP Phase 1 est maintenant **100% opérationnel** ! 🏆

**Coût :** 0€/mois sur Supabase Free Tier

**Capacité :** Jusqu'à 1000 utilisateurs actifs

**Support :** Issues GitHub ou documentation Supabase

---

## 📚 Documentation complémentaire

- [MVP_COMPETITIONS_SYNTHESE_TECHNIQUE.md](MVP_COMPETITIONS_SYNTHESE_TECHNIQUE.md) - Architecture technique
- [MVP_COMPETITIONS_GUIDE_DEPLOIEMENT.md](MVP_COMPETITIONS_GUIDE_DEPLOIEMENT.md) - Guide initial
- [LIVRAISON_MVP_COMPETITIONS.md](LIVRAISON_MVP_COMPETITIONS.md) - Résumé de livraison

---

**Auteur :** E-Réussite Team  
**Date :** 26 octobre 2025  
**Version :** MVP Phase 1 - v1.0
