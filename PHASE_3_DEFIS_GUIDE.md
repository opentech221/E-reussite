# 🎯 PHASE 3 : DÉFIS D'APPRENTISSAGE - GUIDE D'EXÉCUTION

**Date**: 7 octobre 2025  
**Status**: Code créé, prêt pour exécution

---

## 📋 RÉSUMÉ

Phase 3 ajoute un système de **défis hebdomadaires automatiques** pour encourager l'apprentissage régulier et récompenser les utilisateurs actifs.

### ✨ Fonctionnalités

- ✅ **4 types de défis hebdomadaires** générés automatiquement
- ✅ **Tracking automatique** de la progression lors de la complétion des leçons
- ✅ **Récompenses en points** à réclamer
- ✅ **Notifications** quand un défi est complété
- ✅ **Renouvellement automatique** chaque semaine

---

## 🗃️ FICHIERS CRÉÉS

### 1. Migration 012 : Défis d'apprentissage
**Fichier**: `database/migrations/012_learning_challenges.sql`

**Contenu**:
- ✅ Table `learning_challenges` (défis disponibles)
- ✅ Table `user_learning_challenges` (progression utilisateur)
- ✅ Fonction `generate_weekly_learning_challenges()` (génération auto)
- ✅ Fonction `update_learning_challenge_progress()` (mise à jour progression)
- ✅ Fonction `complete_learning_challenge()` (réclamer récompense)
- ✅ Politiques RLS pour sécurité
- ✅ Génération automatique des défis de la semaine actuelle

### 2. Migration 012B : Intégration avec points
**Fichier**: `database/migrations/012b_integrate_challenges_in_points.sql`

**Contenu**:
- ✅ Modification de `award_lesson_completion_points()`
- ✅ Ajout colonne `challenges_updated` (JSONB)
- ✅ Tracking automatique : leçons aujourd'hui, cette semaine, par matière
- ✅ Mise à jour automatique de tous les défis actifs
- ✅ Détection des défis complétés
- ✅ Retour JSON de la progression

### 3. Frontend : CourseDetail.jsx
**Fichier**: `src/pages/CourseDetail.jsx`

**Modifications**:
- ✅ Extraction de `challenges_updated` du retour API
- ✅ Détection des défis complétés
- ✅ Toast notifications pour défis complétés
- ✅ Échelonnement des toasts (après les badges)

---

## 🎮 LES 4 DÉFIS HEBDOMADAIRES

### 📖 Défi 1 : Semaine studieuse
- **Objectif**: Compléter 5 leçons cette semaine
- **Récompense**: 100 points
- **Type**: `weekly_lessons`
- **Icon**: 📖

### 🎯 Défi 2 : Marathon d'apprentissage
- **Objectif**: Compléter 3 chapitres entiers cette semaine
- **Récompense**: 200 points
- **Type**: `weekly_chapters`
- **Icon**: 🎯

### 🔬 Défi 3 : Spécialiste
- **Objectif**: Compléter 10 leçons dans une seule matière
- **Récompense**: 150 points
- **Type**: `subject_lessons`
- **Icon**: 🔬

### ⚡ Défi 4 : Rapide
- **Objectif**: Compléter 5 leçons en une seule journée
- **Récompense**: 100 points
- **Type**: `daily_lessons`
- **Icon**: ⚡

---

## 🚀 INSTRUCTIONS D'EXÉCUTION

### Étape 1 : Exécuter Migration 012

```bash
# Copier le contenu de database/migrations/012_learning_challenges.sql
# Coller dans Supabase SQL Editor
# Exécuter
```

**Message attendu**: ✅ `Migration 012 : Defis d'apprentissage hebdomadaires crees avec succes !`

**Vérifications**:
```sql
-- Voir les défis de cette semaine
SELECT * FROM learning_challenges 
WHERE week_number = EXTRACT(WEEK FROM NOW())
AND year = EXTRACT(YEAR FROM NOW());

-- Devrait retourner 4 défis
```

### Étape 2 : Exécuter Migration 012B

```bash
# Copier le contenu de database/migrations/012b_integrate_challenges_in_points.sql
# Coller dans Supabase SQL Editor
# Exécuter
```

**Message attendu**: ✅ `Migration 012B : Integration defis dans attribution de points reussie !`

**Vérifications**:
```sql
-- Tester la fonction complète
SELECT * FROM award_lesson_completion_points(
  'YOUR_USER_ID'::UUID,
  32  -- ID d'une leçon non complétée
);

-- Devrait retourner 8 colonnes incluant challenges_updated
```

### Étape 3 : Tester dans l'application

1. **Accéder à l'application web**
2. **Compléter une leçon**
3. **Vérifier les toasts**:
   - Toast points ✅
   - Toast badges (si applicable) 🏅
   - Toast défis complétés (si applicable) 🎯

4. **Vérifier la progression**:
```sql
-- Voir votre progression dans les défis
SELECT 
  lc.name,
  lc.icon,
  lc.description,
  ulc.current_progress,
  ulc.target_value,
  ulc.is_completed,
  lc.reward_points
FROM user_learning_challenges ulc
JOIN learning_challenges lc ON lc.id = ulc.challenge_id
WHERE ulc.user_id = 'YOUR_USER_ID';
```

---

## 🧪 SCÉNARIOS DE TEST

### Test 1 : Défi "Semaine studieuse"
1. Compléter 5 leçons dans la semaine
2. À la 5ème leçon, devrait voir: `🎯 Défi complété ! 📖 Semaine studieuse`
3. Vérifier que `is_completed = true` dans la base

### Test 2 : Défi "Rapide"
1. Compléter 5 leçons le même jour
2. À la 5ème leçon du jour, devrait voir: `🎯 Défi complété ! ⚡ Rapide`

### Test 3 : Défi "Marathon d'apprentissage"
1. Compléter toutes les leçons de 3 chapitres
2. Au 3ème chapitre complété, devrait voir le défi complété

### Test 4 : Défi "Spécialiste"
1. Compléter 10 leçons dans Histoire (ou SVT)
2. À la 10ème leçon de cette matière, défi complété

### Test 5 : Réclamer récompense
```sql
-- Appeler la fonction pour réclamer la récompense
SELECT * FROM complete_learning_challenge(
  'YOUR_USER_ID'::UUID,
  1  -- ID du défi complété
);

-- Vérifier les points ajoutés
SELECT total_points FROM user_points WHERE user_id = 'YOUR_USER_ID';
```

---

## 📊 TRACKING AUTOMATIQUE

La fonction `award_lesson_completion_points()` calcule automatiquement:

### Pour chaque leçon complétée :
- ✅ Nombre de leçons complétées **aujourd'hui**
- ✅ Nombre de leçons complétées **cette semaine**
- ✅ Nombre de chapitres complétés **cette semaine**
- ✅ Nombre de leçons dans la **matière actuelle** cette semaine

### Mise à jour automatique :
- ✅ Défis `weekly_lessons` → progression = leçons cette semaine
- ✅ Défis `weekly_chapters` → progression = chapitres cette semaine
- ✅ Défis `subject_lessons` → progression = leçons dans cette matière
- ✅ Défis `daily_lessons` → progression = leçons aujourd'hui

### Détection de complétion :
- ✅ Si `current_progress >= target_value` → marquer `is_completed = TRUE`
- ✅ Retourner dans `challenges_updated` JSON
- ✅ Toast notification sur le frontend

---

## 🔄 RENOUVELLEMENT HEBDOMADAIRE

### Automatique (recommandé)
Créer une fonction Supabase Edge Function qui s'exécute chaque lundi :

```sql
-- Fonction à appeler chaque lundi à minuit
SELECT * FROM generate_weekly_learning_challenges();
```

### Manuel (pour tester)
```sql
-- Générer les défis de la semaine actuelle
SELECT * FROM generate_weekly_learning_challenges();

-- Devrait retourner 4 lignes avec les défis créés
```

---

## 📈 PROCHAINES AMÉLIORATIONS (FUTURES)

### Phase 3B - Page Défis (optionnel)
- Page `/challenges` avec liste des défis actifs
- Barres de progression visuelles
- Bouton "Réclamer récompense" pour défis complétés
- Historique des défis complétés

### Phase 3C - Défis mensuels (optionnel)
- Défis plus difficiles avec récompenses plus élevées
- Badges spéciaux pour défis mensuels

### Phase 3D - Défis communautaires (optionnel)
- Défis collectifs pour tous les utilisateurs
- Classement communautaire

---

## ✅ CHECKLIST D'EXÉCUTION

- [ ] Exécuter migration 012 dans Supabase
- [ ] Vérifier création des 4 défis de la semaine
- [ ] Exécuter migration 012B dans Supabase
- [ ] Vérifier fonction retourne 8 colonnes
- [ ] Tester complétion de leçon dans l'app
- [ ] Vérifier toast défis complétés apparaît
- [ ] Tester réclamer récompense (SQL)
- [ ] Vérifier points ajoutés correctement
- [ ] (Optionnel) Améliorer page /challenges

---

## 🎯 RÉSULTAT ATTENDU

Après exécution complète :

1. ✅ **4 défis hebdomadaires** actifs dans la base
2. ✅ **Progression automatique** à chaque leçon complétée
3. ✅ **Notifications** quand défi complété
4. ✅ **Système de récompenses** fonctionnel
5. ✅ **Intégration transparente** avec système de points/badges

**Total**: +550 points disponibles par semaine via les défis ! 🚀

---

## 🐛 DÉPANNAGE

### Erreur : "Defis deja generes"
→ Normal si déjà exécuté cette semaine. Les défis ne sont pas recréés.

### Erreur : "column challenges_updated does not exist"
→ Migration 012B pas exécutée. Exécuter d'abord 012B.

### Progression ne se met pas à jour
→ Vérifier que les défis de cette semaine existent :
```sql
SELECT * FROM learning_challenges 
WHERE week_number = EXTRACT(WEEK FROM NOW());
```

### Toast défis ne s'affiche pas
→ Vérifier dans console navigateur si `challenges_updated` est reçu.
→ Recharger l'application (Ctrl+R).

---

**Phase 3 complète !** 🎉

Passe à la **Phase 4** pour créer le tableau de bord de progression avec visualisations et statistiques !
