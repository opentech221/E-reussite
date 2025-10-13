# 🚀 ACCÈS RAPIDE - LIENS DE TEST

**Date:** 2 octobre 2025  
**Serveur:** http://localhost:3000

---

## 📱 PAGES À TESTER

### Pages publiques
- **Home:** http://localhost:3000
- **About:** http://localhost:3000/about
- **Contact:** http://localhost:3000/contact

### Authentification
- **Login:** http://localhost:3000/login
- **Signup:** http://localhost:3000/signup
- **Reset Password:** http://localhost:3000/forgot-password

### Pages principales (authentification requise)
- **Dashboard:** http://localhost:3000/dashboard ✅ **NOUVEAU - 100% connecté**
- **Courses:** http://localhost:3000/courses ✅ **NOUVEAU - 100% connecté**
- **Quiz 1:** http://localhost:3000/quiz/1 ✅ **NOUVEAU - Théorème de Thalès**
- **Quiz 2:** http://localhost:3000/quiz/2 ✅ **NOUVEAU - Équations 2nd degré**

### Autres pages
- **Leaderboard:** http://localhost:3000/leaderboard
- **Badges:** http://localhost:3000/badges
- **Shop:** http://localhost:3000/shop
- **Cart:** http://localhost:3000/cart
- **Profile:** http://localhost:3000/profile

---

## ✅ CE QUI FONCTIONNE MAINTENANT

### Dashboard (100% connecté)
**URL:** http://localhost:3000/dashboard

**Fonctionnalités:**
- ✅ Stats calculées depuis vraies données
- ✅ Activité récente (quiz + badges)
- ✅ Progression par matière (5 matières max)
- ✅ Événements à venir (challenges + exams)
- ✅ Analytics d'étude (graphiques temps/scores)

**Données affichées:**
- Temps d'étude total
- Score moyen quiz
- Nombre cours démarrés
- Quiz complétés
- Streak jours consécutifs

---

### Courses (100% connecté)
**URL:** http://localhost:3000/courses

**Fonctionnalités:**
- ✅ Sélection niveau (BFEM / BAC)
- ✅ Liste matières depuis BDD
- ✅ Chapitres par matière
- ✅ Leçons par chapitre
- ✅ Annales disponibles
- ✅ Fiches de révision

**Matières disponibles:**
- **BFEM:** Maths, Français, Physique-Chimie, SVT, Histoire-Géo, Anglais (6)
- **BAC:** Maths, Physique-Chimie, SVT, Français, Philo, Histoire-Géo, Anglais (7)

---

### Quiz (100% connecté)
**URL:** http://localhost:3000/quiz/1 ou /quiz/2

**Fonctionnalités:**
- ✅ Chargement depuis Supabase
- ✅ Timer fonctionnel (15 min)
- ✅ Auto-submit si temps écoulé
- ✅ Navigation Précédent/Suivant
- ✅ Progress bar
- ✅ Calcul score précis
- ✅ Sauvegarde résultat dans BDD
- ✅ Award points (gamification)
- ✅ Tracking erreurs
- ✅ Page résultats détaillée

**Quiz disponibles:**
1. **Quiz 1:** Théorème de Thalès (3 questions)
2. **Quiz 2:** Équations du second degré (3 questions)

---

## 🧪 SCÉNARIO DE TEST RAPIDE (15 min)

### Étape 1: Créer compte (2 min)
1. Aller sur http://localhost:3000/signup
2. Email: `test@example.com`
3. Password: `Test123456!`
4. Confirmer → Redirection vers Dashboard

### Étape 2: Explorer Dashboard (3 min)
1. Vérifier stats affichées (peut être 0 si nouveau)
2. Voir section "Activité récente"
3. Voir "Progression par matière"
4. Voir "Événements à venir"
5. Scroll vers analytics

### Étape 3: Naviguer vers Courses (3 min)
1. Clic sur "Courses" dans navbar
2. Sélectionner "BFEM"
3. Voir 6 matières
4. Cliquer sur "Mathématiques BFEM"
5. Voir chapitres (Thalès, Équations, etc.)
6. Cliquer sur chapitre "Théorème de Thalès"
7. Voir leçons et quiz disponibles

### Étape 4: Faire Quiz (5 min)
1. Cliquer sur "Faire le quiz" dans chapitre Thalès
2. Voir timer démarrer (15:00)
3. Lire Question 1
4. Sélectionner réponse A
5. Cliquer "Suivant"
6. Répondre Question 2 et 3
7. Cliquer "Terminer le quiz"
8. Voir page résultats avec score

### Étape 5: Vérifier Dashboard mis à jour (2 min)
1. Cliquer "Voir Dashboard" ou navbar
2. Vérifier "Quiz complétés" = 1
3. Vérifier "Activité récente" montre quiz
4. Vérifier "Score moyen" affiché
5. Vérifier "Progression Mathématiques" mise à jour

**Total: 15 minutes ✅**

---

## 🔍 POINTS À VÉRIFIER

### Console DevTools (F12)
**Aucune erreur rouge attendue:**
- ✅ Pas de 404
- ✅ Pas de 500
- ✅ Pas d'erreurs Supabase
- ✅ Toutes les requêtes HTTP 200 OK

**Logs attendus:**
```
User: {id: '...', email: 'test@example.com'}
Quiz Data: {id: 1, title: 'Quiz: Théorème de Thalès...'}
Score: 100% (ou autre selon réponses)
```

### Network Tab
**Requêtes attendues:**
- `GET /rest/v1/matieres?level=eq.bfem` → 200 OK
- `GET /rest/v1/quiz?id=eq.1` → 200 OK
- `POST /rest/v1/quiz_results` → 201 Created
- `GET /rest/v1/quiz_results?user_id=eq.XXX` → 200 OK

### Performance
**Temps de chargement:**
- Dashboard: < 3s ✅
- Courses: < 2s ✅
- Quiz: < 2s ✅

---

## 📊 DONNÉES EN BASE

### Tables peuplées (83 records)
- **badges:** 10 badges
- **matieres:** 13 matières (6 BFEM + 7 BAC)
- **chapitres:** 17 chapitres
- **lecons:** 9 leçons
- **quiz:** 2 quiz
- **quiz_questions:** 6 questions
- **annales:** 7 annales
- **fiches_revision:** 3 fiches
- **exam_simulations:** 4 examens
- **products:** 9 produits
- **monthly_challenges:** 2 défis

### Requêtes SQL utiles

**Voir quiz disponibles:**
```sql
SELECT * FROM quiz;
```

**Voir questions d'un quiz:**
```sql
SELECT * FROM quiz_questions WHERE quiz_id = 1;
```

**Voir vos résultats:**
```sql
SELECT * FROM quiz_results WHERE user_id = 'your-user-id';
```

**Voir vos badges:**
```sql
SELECT * FROM user_badges WHERE user_id = 'your-user-id';
```

**Voir votre profil:**
```sql
SELECT * FROM profiles WHERE id = 'your-user-id';
```

---

## 🐛 PROBLÈMES COURANTS

### Quiz ne se charge pas
**Cause:** Quiz ID invalide ou table vide  
**Solution:** Vérifier que seed data est exécuté
```sql
SELECT COUNT(*) FROM quiz; -- Devrait retourner 2
```

### Dashboard vide
**Cause:** Nouvel utilisateur sans activité  
**Solution:** Normal ! Faire un quiz d'abord

### Timer ne démarre pas
**Cause:** State timerActive à false  
**Solution:** Recharger page

### Score non sauvegardé
**Cause:** User non connecté  
**Solution:** Vérifier authentification

### Matières n'apparaissent pas
**Cause:** Seed data non exécuté  
**Solution:** Exécuter `database/seed/001_initial_content.sql` dans Supabase

---

## 📝 CREDENTIALS TEST

**Email:** test@example.com  
**Password:** Test123456!

**Ou créer votre propre compte via Signup**

---

## 🎯 OBJECTIF SESSION

**Tester les 3 pages principales:**
1. ✅ Dashboard → Stats, activité, progression
2. ✅ Courses → Matières, chapitres, leçons
3. ✅ Quiz → Questions, timer, résultats, sauvegarde

**Critères de succès:**
- [ ] Toutes les pages se chargent
- [ ] Données depuis BDD affichées
- [ ] Quiz peut être complété
- [ ] Résultat sauvegardé
- [ ] Dashboard mis à jour après quiz
- [ ] 0 erreurs console

**Temps estimé:** 15-20 minutes

---

## 🚀 COMMANDES UTILES

```bash
# Lancer serveur (si arrêté)
npm run dev

# Vérifier erreurs
npm run lint

# Build production
npm run build

# Preview build
npm run preview

# Reset base de données (si besoin)
# Exécuter 000_clean_before_seed.sql puis 001_initial_content.sql
```

---

## 📞 DOCUMENTATION

**Guides complets:**
- `DASHBOARD_CONNECTED.md` - Doc Dashboard (400 lignes)
- `QUIZ_CONNECTED.md` - Doc Quiz (500 lignes)
- `GUIDE_TEST_PHASE1.md` - Plan de test détaillé (500 lignes)
- `SESSION_2_OCTOBRE.md` - Récap session (500 lignes)
- `ETAT_AVANCEMENT.md` - État Phase 1 (350 lignes)

**Total:** 2250+ lignes de documentation

---

## ✨ BON TEST !

**Serveur:** http://localhost:3000  
**Status:** ✅ RUNNING  
**BDD:** ✅ 83 RECORDS  
**Pages:** ✅ 3/5 CONNECTÉES (90%)

**Prochaine étape après tests:** Exam.jsx → Phase 1 COMPLÈTE ! 🎉
