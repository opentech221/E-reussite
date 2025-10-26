# ⚡ DÉMARRAGE RAPIDE - Compétitions MVP

## 🎯 Ce qu'il vous reste à faire (5 minutes)

### 📍 Étape 1 : Ouvrir Supabase Dashboard

```
https://supabase.com/dashboard
→ Votre projet
→ SQL Editor (menu latéral gauche)
```

---

### 📍 Étape 2 : Exécuter les 5 scripts SQL **DANS L'ORDRE**

#### **Script 1/5** : Créer les tables
```sql
-- Copier/coller : ADD_COMPETITIONS_SCHEMA.sql
-- Cliquez sur RUN
-- ✅ Attendu : "Success. No rows returned"
```

#### **Script 2/5** : Créer les fonctions ⚡ **VERSION CORRIGÉE**
```sql
-- Copier/coller : ADD_COMPETITIONS_FUNCTIONS.sql
-- Cliquez sur RUN
-- ✅ Attendu : "Success. No rows returned"
```

#### **Script 3/5** : Activer la sécurité (RLS)
```sql
-- Copier/coller : ADD_COMPETITIONS_RLS.sql
-- Cliquez sur RUN
-- ✅ Attendu : "Success. No rows returned"
```

#### **Script 4/5** : Insérer 60+ questions
```sql
-- Copier/coller : ADD_COMPETITIONS_SEED_QUESTIONS.sql
-- Cliquez sur RUN
-- ✅ Attendu : Voir statistiques dans NOTICES
```

#### **Script 5/5** : Créer 3 compétitions test
```sql
-- Copier/coller : ADD_COMPETITIONS_SEED_COMPETITION_TEST.sql
-- Cliquez sur RUN
-- ✅ Attendu : "3 compétitions créées"
```

---

### 📍 Étape 3 : Activer Realtime (Important !)

**Dans Supabase Dashboard :**

1. Allez dans **Database** → **Replication**
2. Activez Realtime pour ces 3 tables :
   - ✅ `competitions`
   - ✅ `competition_participants`
   - ✅ `competition_leaderboards`

---

### 📍 Étape 4 : Tester l'application

```bash
npm run dev
```

**Puis ouvrez :**
```
http://localhost:5173/competitions
```

---

## ✅ Validation

### Ce que vous devez voir :

1. **Page /competitions** :
   - 3 compétitions affichées
   - Filtres fonctionnels
   - Dashboard statistiques

2. **Clic sur une compétition** :
   - Bouton "Participer" visible
   - Inscription réussie
   - Page quiz se charge

3. **Dans le quiz** :
   - Timer compte à rebours
   - Questions affichées (texte visible)
   - Options A, B, C, D
   - Score en temps réel

4. **Après le quiz** :
   - Classement affiché
   - Votre rang calculé
   - Récompenses visibles

---

## 🐛 Dépannage

### ❌ Erreur : "relation 'questions' n'existe pas"
➡️ **Solution :** Vous avez oublié le Script 1 (SCHEMA.sql)

### ❌ Erreur : "function join_competition does not exist"
➡️ **Solution :** Vous avez oublié le Script 2 (FUNCTIONS.sql)

### ❌ Erreur : "column p.username does not exist"
➡️ **Solution :** Vous avez exécuté l'ANCIENNE version du Script 2
- Re-téléchargez depuis GitHub : `git pull origin main`
- Re-exécutez ADD_COMPETITIONS_FUNCTIONS.sql (version corrigée)

### ❌ Erreur : "permission denied for table competitions"
➡️ **Solution :** Vous avez oublié le Script 3 (RLS.sql)

### ❌ Page vide (pas de compétitions)
➡️ **Solution :** Vous avez oublié le Script 5 (SEED_COMPETITION_TEST.sql)

### ❌ Leaderboard ne se met pas à jour
➡️ **Solution :** Realtime n'est pas activé
- Database → Replication → Activer 3 tables

---

## 📊 Résumé

| Script | Fichier | Durée | Résultat |
|--------|---------|-------|----------|
| 1️⃣ | ADD_COMPETITIONS_SCHEMA.sql | 2s | 6 tables |
| 2️⃣ | ADD_COMPETITIONS_FUNCTIONS.sql | 1s | 6 fonctions |
| 3️⃣ | ADD_COMPETITIONS_RLS.sql | 1s | RLS activé |
| 4️⃣ | ADD_COMPETITIONS_SEED_QUESTIONS.sql | 3s | 60+ questions |
| 5️⃣ | ADD_COMPETITIONS_SEED_COMPETITION_TEST.sql | 2s | 3 compétitions |

**Temps total : ~10 secondes d'exécution**

---

## 🎉 Après le déploiement

### Vous aurez :

✅ Un système de compétitions complet  
✅ 3 compétitions test prêtes  
✅ 60+ questions multi-matières  
✅ Classements en temps réel  
✅ Dashboard utilisateur  
✅ Système de récompenses  
✅ Sécurité RLS complète  

### Coût : 0€/mois

---

## 📚 Guides Détaillés

- **Guide complet** : `GUIDE_COMPLET_DEPLOIEMENT_COMPETITIONS.md`
- **Corrections bugs** : `CORRECTIONS_BUGS_COMPETITIONS.md`
- **Vue d'ensemble** : `RECAPITULATIF_RAPIDE_MVP.md`

---

**Temps estimé : 5 minutes** ⏱️  
**Difficulté : Facile** ✅  
**Support : GitHub Issues** 🆘
