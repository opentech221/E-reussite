# 🧪 PLAN DE TESTS COMPLETS - PHASE 1

**Date:** 4 octobre 2025  
**Objectif:** Valider toutes les pages connectées avant Exam.jsx  
**Durée estimée:** 2 heures  
**Statut:** 🟡 En cours - Test 3/10

---

## 📋 CHECKLIST DES TESTSDE TESTS COMPLETS - PHASE 1

**Date:** 4 octobre 2025  
**Objectif:** Valider toutes les pages connectées avant Exam.jsx  
**Durée estimée:** 2 heures  
**Statut:** � En cours - Test 2/10

---

## 📋 CHECKLIST DES TESTS

### 🔐 **Test 1: Authentification** (15 min) ✅ TERMINÉ

#### 1.1 Création de compte
- [x] Aller sur `/signup`
- [x] Créer un compte test avec email valide
- [x] Vérifier email de confirmation reçu
- [x] Confirmer le compte
- [x] Vérifier redirection vers `/dashboard`

**Données de test:**
```
Email: test-phase1@example.com
Password: TestPhase1!2025
Nom: Test User Phase1
```

#### 1.2 Connexion
- [x] Se déconnecter
- [x] Aller sur `/login`
- [x] Se connecter avec les credentials test
- [x] Vérifier redirection vers `/dashboard`
- [x] Vérifier navbar affiche profil utilisateur

#### 1.3 Reset password
- [ ] Cliquer "Mot de passe oublié" (NON TESTÉ - optionnel)
- [ ] Entrer email test
- [ ] Vérifier email reçu
- [ ] Cliquer lien reset
- [ ] Changer mot de passe
- [ ] Se reconnecter avec nouveau mot de passe

**Résultats:**
```
✅ Création compte: test-phase1-1004-1609@mailinator.com
✅ Connexion: OK - redirection dashboard
✅ Reset password: NON TESTÉ (optionnel)
❌ Erreurs trouvées et corrigées: 
   1. Email domain invalid (@example.com rejeté)
   2. RLS policy blocking profile creation
   3. Email confirmation required
   4. getChapitresByMatiere missing
   5. getLeconsByChapitre missing
```

---

### 🏠 **Test 2: Dashboard** (20 min) ✅ TERMINÉ

#### 2.1 Chargement initial
- [x] Temps de chargement < 3s
- [x] Aucune erreur console (après corrections)
- [x] Stats affichées (streak, score moyen, quiz complétés)
- [x] Message de bienvenue personnalisé avec nom utilisateur
- [x] Badge niveau affiché correctement
- [x] Sidebar créée et fonctionnelle (280px, 8 menu items)

#### 2.2 Section statistiques
- [x] Current Streak affiché (nombre de jours)
- [x] Average Score affiché (pourcentage) - Dynamic from DB
- [x] Quiz Completed affiché (nombre) - Fixed variable name
- [x] Study Time affiché (heures) - From progress table
- [x] Graphique visible (même si vide pour nouveau compte)

#### 2.3 Activité récente
- [x] Section "Activité récente" visible
- [x] Timestamps affichent heure relative ("Il y a 2h30")
- [x] Affiche derniers quiz avec scores
- [x] Format: getRelativeTime() function

#### 2.4 Progression par matière
- [x] Section "Progression" visible
- [x] Liste TOUTES les matières depuis BDD (removed .slice(0,5))
- [x] Barres de progression (0-100% avec Progress component)
- [x] Score affiché ou "Aucun quiz réalisé" si 0%
- [x] Empty state si aucune matière en BDD
- [x] Gestion robuste des erreurs avec logs détaillés

#### 2.5 Navigation depuis Dashboard
- [x] Bouton "Mes cours" → `/my-courses` (was /courses)
- [x] Bouton "Quiz" → `/quiz`
- [x] Bouton "Classement" → `/leaderboard` (moved to private)
- [x] Bouton "Profil" → `/profile`
- [x] Sidebar responsive (desktop visible, mobile burger)

**Résultats:**
```
✅ 11 CORRECTIFS APPLIQUÉS:
   1. Sidebar responsive inversé (lg:hidden → lg:translate-x-0)
   2. Routes /courses et /leaderboard déplacées en privé
   3. CoursesPublic.jsx créée (290 lignes, showcase + CTA)
   4. CoursesPrivate.jsx (rename de Courses.jsx, 374 lignes)
   5. Main.jsx prefetch corrigé (Courses → CoursesPublic/Private)
   6. Pricing.jsx: class → className (4 instances)
   7. Leaderboard console.error → console.log (mock data)
   8. Stats dynamiques depuis Supabase (quiz_results, progress)
   9. Quiz duplication fixée (completeQuiz appelle saveQuizResult)
   10. Progression affiche TOUTES matières (removed slice)
   11. Timestamps relatifs ("Il y a 2h30" vs "04/10/2025")
```

---

### 📚 **Test 3: Courses** (15 min) ✅ TERMINÉ

#### 3.1 Chargement page
- [x] Temps de chargement < 3s
- [x] Aucune erreur console
- [x] Au moins 1 matière affichée
- [x] Images/icônes matières visibles
- [x] Filtres niveau (BFEM/BAC) fonctionnels

#### 3.2 Navigation matières
- [x] Cliquer sur "Mathématiques BFEM"
- [x] Vérifier chapitres affichés (Thalès, Équations, etc.)
- [x] Cliquer sur un chapitre
- [x] Bouton "Faire le quiz" visible et fonctionnel

#### 3.3 Données depuis BDD
- [x] Matières: viennent de la table `matieres`
- [x] Chapitres: viennent de la table `chapitres`
- [x] Quiz: récupérés via getQuizzesByChapitre()
- [x] Compteurs corrects (X chapitres, Y leçons)

#### 3.4 Liens vers quiz
- [x] Cliquer "Faire le quiz" depuis un chapitre
- [x] Vérifier redirection vers `/quiz/3` ou `/quiz/4`
- [x] Quiz se charge correctement

**Résultats:**
```
✅ PARTIE A - /courses (public):
   • Page showcase avec CTA
   • Onglets BFEM/BAC fonctionnels
   • Redirection vers signup/login

✅ PARTIE B - /my-courses (privée):
   • Sidebar visible
   • Matières depuis Supabase
   • Navigation chapitres OK
   • Bouton quiz ajouté et fonctionnel

🔧 Correctif appliqué:
   • Ajout state quizByChapter
   • Fetch quiz via getQuizzesByChapitre()
   • Bouton "🎯 Faire le quiz" dynamique
   • Condition: affiche si quiz existe
```

---

### 🎯 **Test 4: Quiz (QuizList)** (15 min) ✅ TERMINÉ

#### 4.1 Page liste quiz (/quiz)
- [x] Temps de chargement < 3s
- [x] Aucune erreur console
- [x] 2 quiz affichés (Thalès + Équations)
- [x] Statistiques en haut:
  - [x] "2 Quiz disponibles"
  - [x] "6 Questions au total"
  - [x] "~30 Minutes de contenu"

#### 4.2 Cartes quiz
- [x] Titre quiz visible
- [x] Description visible
- [x] Badge difficulté affiché (Facile - vert)
- [x] Nombre de questions affiché (3 questions)
- [x] Durée affichée (10-15 min)
- [x] Bouton "Commencer le quiz" visible
- [x] Effet hover sur carte (élévation)

#### 4.3 Navigation quiz
- [x] Cliquer "Commencer le quiz" sur Thalès
- [x] Vérifier redirection vers `/quiz/3`
- [x] Vérifier quiz se charge
- [x] Retour arrière → revenir à `/quiz`
- [x] Liste toujours affichée correctement

**Résultats:**
```
✅ PARTIE A - Affichage:
   • 2 quiz chargés depuis Supabase
   • Statistiques globales correctes
   • Badges difficulté depuis BDD (migration 002)

✅ PARTIE B - Cartes complètes:
   • Titre, description, durée ✅
   • Badge difficulté dynamique ✅
   • Nombre de questions ✅
   • Bouton "Commencer" fonctionnel ✅

✅ PARTIE C - Navigation:
   • Redirection vers /quiz/{id} ✅
   • Performance < 2s ✅
   • Effet hover visible ✅

🔧 Correctif appliqué:
   • Migration 002: colonne difficulty ajoutée
   • Seed mis à jour avec difficulty, time_limit, description
   • Frontend utilise quiz.difficulty depuis BDD
   • Documentation: GUIDE_MIGRATION_002.md
```

---

### 📝 **Test 5: Quiz (Page individuelle)** (30 min) 🔄 EN COURS

#### 5.1 Chargement quiz
- [ ] URL: `/quiz/3` (Théorème de Thalès)
- [ ] Temps de chargement < 2s
- [ ] Aucune erreur console
- [ ] Titre quiz affiché
- [ ] 3 questions chargées
- [ ] Timer affiché (15:00)
- [ ] Compteur questions (1/3, 2/3, 3/3)

#### 5.2 Questions et options
- [ ] Question 1 affichée clairement
- [ ] 4 options (A, B, C, D) visibles
- [ ] Une seule option sélectionnable
- [ ] Bouton "Question suivante" actif après sélection
- [ ] Option sélectionnée visuellement différente

#### 5.3 Navigation questions
- [ ] Passer à question 2
- [ ] Passer à question 3
- [ ] Bouton change en "Terminer le quiz" sur dernière question
- [ ] Réponses précédentes conservées

#### 5.4 Timer
- [ ] Timer décompte chaque seconde
- [ ] Format MM:SS correct
- [ ] Changement couleur quand < 2 min (rouge)
- [ ] Auto-submit quand timer = 0

#### 5.5 Soumission quiz
- [ ] Cliquer "Terminer le quiz"
- [ ] Calcul score affiché
- [ ] Toast notification affichée
- [ ] Score = (bonnes réponses / total) * 100
- [ ] Redirection ou affichage résultats

#### 5.6 Sauvegarde BDD
**Vérifier dans Supabase Dashboard:**
```sql
SELECT * FROM quiz_results 
WHERE user_id = 'USER_ID' 
ORDER BY completed_at DESC 
LIMIT 1;
```
- [ ] Ligne créée dans `quiz_results`
- [ ] `score` = integer (33, 67, ou 100)
- [ ] `quiz_id` = 3
- [ ] `user_id` = ID utilisateur test
- [ ] `completed_at` = timestamp correct

#### 5.7 Mise à jour stats Dashboard
- [ ] Retour sur `/dashboard`
- [ ] "Quiz Completed" incrémenté de +1
- [ ] "Average Score" mis à jour
- [ ] Quiz apparaît dans "Activité récente"
- [ ] Streak mis à jour (si applicable)

**Résultats Quiz 1 (Thalès):**
```
⏱️ Temps chargement: ___s
📊 Score obtenu: ___/100
✅ Timer fonctionne: 
✅ Sauvegarde BDD: 
✅ Stats Dashboard mises à jour: 
❌ Erreurs trouvées: 
```

#### 5.8 Test quiz 2 (Équations)
- [ ] Répéter tests 5.1 à 5.7 avec `/quiz/4`
- [ ] Vérifier 3 nouvelles questions
- [ ] Vérifier options différentes
- [ ] Vérifier sauvegarde séparée dans BDD

**Résultats Quiz 2 (Équations):**
```
⏱️ Temps chargement: ___s
📊 Score obtenu: ___/100
✅ Tout fonctionne: 
❌ Erreurs trouvées: 
```

---

### 🏆 **Test 6: Leaderboard** (10 min)

#### 6.1 Chargement page
- [ ] URL: `/leaderboard`
- [ ] Temps de chargement < 3s
- [ ] Aucune erreur console
- [ ] Liste utilisateurs affichée

#### 6.2 Données affichées
- [ ] Classement (rang 1, 2, 3, etc.)
- [ ] Noms utilisateurs
- [ ] Points totaux
- [ ] Avatars (ou initiales si pas d'avatar)
- [ ] Utilisateur actuel surligné

#### 6.3 Filtres
- [ ] Filtre "Cette semaine" fonctionne
- [ ] Filtre "Ce mois" fonctionne
- [ ] Filtre "Tout le temps" fonctionne
- [ ] Résultats changent selon filtre

**Résultats:**
```
⏱️ Temps chargement: ___s
👥 Nombre utilisateurs: ___
✅ Classement correct: 
❌ Erreurs trouvées: 
```

---

### 👤 **Test 7: Profil** (10 min)

#### 7.1 Chargement page
- [ ] URL: `/profile`
- [ ] Temps de chargement < 2s
- [ ] Aucune erreur console
- [ ] Informations utilisateur affichées

#### 7.2 Données profil
- [ ] Nom complet
- [ ] Email
- [ ] Avatar (ou initiales)
- [ ] Niveau actuel
- [ ] Points totaux
- [ ] Badges gagnés (si applicable)

#### 7.3 Modification profil
- [ ] Changer nom
- [ ] Cliquer "Sauvegarder"
- [ ] Vérifier toast de confirmation
- [ ] Recharger page → nom mis à jour
- [ ] Vérifier dans BDD (table `profiles`)

**Résultats:**
```
⏱️ Temps chargement: ___s
✅ Affichage correct: 
✅ Modification fonctionne: 
❌ Erreurs trouvées: 
```

---

### 🔗 **Test 8: Navigation globale** (10 min)

#### 8.1 Navbar
- [ ] Logo cliquable → `/dashboard`
- [ ] Lien "Mes cours" → `/courses`
- [ ] Lien "Quiz" → `/quiz`
- [ ] Lien "Leaderboard" → `/leaderboard`
- [ ] Icône profil cliquable
- [ ] Dropdown profil avec:
  - [ ] "Mon profil" → `/profile`
  - [ ] "Paramètres"
  - [ ] "Déconnexion"

#### 8.2 Footer
- [ ] Liens réseaux sociaux
- [ ] Liens légaux (CGU, Confidentialité)
- [ ] Copyright affiché

#### 8.3 Responsive
- [ ] Tester sur mobile (DevTools)
- [ ] Navbar burger menu fonctionne
- [ ] Pages s'adaptent à l'écran
- [ ] Pas de débordement horizontal

**Résultats:**
```
✅ Navbar fonctionne: 
✅ Footer fonctionne: 
✅ Responsive OK: 
❌ Erreurs trouvées: 
```

---

### ⚡ **Test 9: Performance** (10 min)

#### 9.1 Temps de chargement
**Mesurer avec DevTools Network:**
- [ ] Dashboard: ___s (cible < 3s)
- [ ] Courses: ___s (cible < 3s)
- [ ] Quiz list: ___s (cible < 3s)
- [ ] Quiz page: ___s (cible < 2s)
- [ ] Leaderboard: ___s (cible < 3s)

#### 9.2 Console
- [ ] Aucune erreur rouge
- [ ] Warnings mineurs acceptables
- [ ] Pas de requêtes BDD en boucle
- [ ] Service Worker actif

#### 9.3 Network
- [ ] Nombre requêtes raisonnable (< 50 par page)
- [ ] Images optimisées
- [ ] Pas de requêtes échouées (404, 500)

**Résultats:**
```
⏱️ Temps moyen: ___s
📊 Nombre requêtes moyen: ___
✅ Performance OK: 
❌ Optimisations nécessaires: 
```

---

### 🐛 **Test 10: Edge Cases** (15 min)

#### 10.1 Quiz sans finir
- [ ] Commencer un quiz
- [ ] Fermer onglet
- [ ] Rouvrir → vérifier pas de sauvegarde partielle
- [ ] Recommencer quiz → fonctionne

#### 10.2 Connexion perdue
- [ ] Couper internet (DevTools offline)
- [ ] Essayer de faire un quiz
- [ ] Vérifier message d'erreur clair
- [ ] Réactiver internet → fonctionnel

#### 10.3 Utilisateur sans données
- [ ] Créer nouveau compte
- [ ] Aller sur Dashboard
- [ ] Vérifier messages "Aucune activité"
- [ ] Vérifier pas de crash si stats = 0

#### 10.4 Quiz avec timer expiré
- [ ] Ouvrir quiz
- [ ] Attendre que timer atteigne 0
- [ ] Vérifier auto-submit
- [ ] Vérifier score calculé même sans réponses

**Résultats:**
```
✅ Gestion erreurs: 
✅ Edge cases OK: 
❌ Bugs trouvés: 
```

---

## 📊 RÉSUMÉ DES TESTS

### Statistiques globales
```
Total tests effectués: __/75
Tests réussis: __
Tests échoués: __
Taux de réussite: __%
```

### Bugs critiques trouvés
```
1. [Description bug]
   Localisation: [Fichier:ligne]
   Impact: Critique/Moyen/Faible
   
2. [Description bug]
   Localisation: [Fichier:ligne]
   Impact: Critique/Moyen/Faible
```

### Optimisations suggérées
```
1. [Suggestion]
   Priorité: Haute/Moyenne/Basse
   
2. [Suggestion]
   Priorité: Haute/Moyenne/Basse
```

---

## ✅ VALIDATION PHASE 1

**Critères de réussite:**
- [ ] Tous les tests critiques passent (Auth, Dashboard, Courses, Quiz)
- [ ] Aucun bug bloquant
- [ ] Performance < 3s par page
- [ ] Aucune erreur console critique
- [ ] Navigation fluide
- [ ] Données BDD correctes

**Décision:**
- [ ] ✅ Phase 1 validée → Passer à Exam.jsx
- [ ] ⚠️ Corrections mineures nécessaires
- [ ] ❌ Corrections majeures requises

---

## 📝 NOTES ADDITIONNELLES

```
[Ajoutez vos observations ici]

Problèmes rencontrés:
- 

Points positifs:
- 

Améliorations futures:
- 
```

---

**Date de validation:** ____/____/2025  
**Validé par:** ____________  
**Prêt pour Exam.jsx:** ✅ / ❌
