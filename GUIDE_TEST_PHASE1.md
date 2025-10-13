# 🧪 GUIDE DE TEST - PHASE 1

**Date:** 2 octobre 2025  
**Objectif:** Tester toutes les pages connectées à Supabase

---

## 🚀 PRÉPARATION

### 1. Serveur démarré
```bash
npm run dev
# Serveur sur http://localhost:3000
```

### 2. Base de données peuplée
- ✅ 83 enregistrements insérés
- ✅ 2 quiz avec 6 questions au total
- ✅ 13 matières (6 BFEM + 7 BAC)
- ✅ 17 chapitres
- ✅ 9 leçons

### 3. Compte utilisateur nécessaire
- Créer un compte si pas encore fait
- Ou utiliser compte existant

---

## 📋 PLAN DE TEST

### Test 1: Page Home ✅ (Déjà fonctionnelle)
**URL:** http://localhost:3000

**Vérifications:**
- [ ] Page se charge rapidement
- [ ] Hero section affichée
- [ ] Boutons "Commencer" et "En savoir plus"
- [ ] Footer visible

**Résultat:** PASS / FAIL

---

### Test 2: Inscription / Connexion
**URL:** http://localhost:3000/login

**Étapes:**
1. Cliquer sur "S'inscrire" ou "Se connecter"
2. Remplir formulaire (email + password)
3. Soumettre

**Vérifications:**
- [ ] Formulaire fonctionne
- [ ] Supabase Auth crée le compte
- [ ] Redirection vers /dashboard après login
- [ ] Toast de confirmation affiché

**Résultat:** PASS / FAIL

---

### Test 3: Dashboard ✅ NOUVEAU
**URL:** http://localhost:3000/dashboard

**Vérifications:**
1. **Stats principales**
   - [ ] Temps d'étude affiché (peut être 0 si nouvel utilisateur)
   - [ ] Score moyen affiché
   - [ ] Cours démarrés affiché
   - [ ] Quiz complétés affiché

2. **Activité récente**
   - [ ] Section visible
   - [ ] Si nouvel utilisateur: "Commencez votre premier cours"
   - [ ] Si utilisateur actif: liste des quiz/badges récents

3. **Progression par matière**
   - [ ] Section visible avec matières du niveau utilisateur
   - [ ] Barres de progression (peut être 0%)
   - [ ] Icônes matières (Sigma, Feather, Atom, etc.)

4. **Événements à venir**
   - [ ] Section visible
   - [ ] Défis mensuels affichés
   - [ ] Examens blancs affichés

5. **Analytics d'étude**
   - [ ] Graphique temps d'étude (7 jours)
   - [ ] Graphique performance (scores)

**Console DevTools:**
- [ ] Aucune erreur rouge
- [ ] Requêtes Supabase réussies (status 200)

**Résultat:** PASS / FAIL

---

### Test 4: Page Courses ✅ NOUVEAU
**URL:** http://localhost:3000/courses

**Vérifications:**
1. **Sélection niveau**
   - [ ] Boutons BFEM / BAC visibles
   - [ ] Clic change les matières affichées

2. **Liste des matières**
   - [ ] 6 matières pour BFEM
   - [ ] 7 matières pour BAC
   - [ ] Noms corrects (Mathématiques, Français, etc.)
   - [ ] Icônes appropriées

3. **Clic sur une matière**
   - [ ] Ouvre modal/section avec chapitres
   - [ ] Liste des chapitres affichée
   - [ ] Titres et descriptions corrects

4. **Chapitres**
   - [ ] Au moins 4-5 chapitres par matière
   - [ ] Bouton "Commencer" visible
   - [ ] Ordre logique (1, 2, 3, etc.)

5. **Leçons (si visibles)**
   - [ ] Leçons par chapitre affichées
   - [ ] Certaines leçons gratuites (is_free_preview)
   - [ ] Autres leçons avec 🔒 (premium)

6. **Annales**
   - [ ] Section visible
   - [ ] Années 2020-2023 pour Maths/Français BFEM
   - [ ] Boutons "Télécharger" (même si PDF non disponible)

**Résultat:** PASS / FAIL

---

### Test 5: Quiz ✅ NOUVEAU
**URL:** http://localhost:3000/quiz/1

**Test avec Quiz ID 1 (Théorème de Thalès)**

**Vérifications initiales:**
1. **Chargement**
   - [ ] Loading spinner affiché brièvement
   - [ ] Titre "Quiz: Théorème de Thalès - Niveau 1"
   - [ ] Timer visible (15:00 ou personnalisé)
   - [ ] Progress bar visible

2. **Questions**
   - [ ] 3 questions au total
   - [ ] Question 1/3 affichée
   - [ ] Texte de la question visible
   - [ ] 4 options avec lettres A) B) C) D)

3. **Timer**
   - [ ] Décompte chaque seconde (14:59, 14:58...)
   - [ ] Format MM:SS correct
   - [ ] Si < 1min: texte rouge + animation pulse

4. **Sélection réponse**
   - [ ] Clic sur option la highlight en bleu
   - [ ] Changement de réponse possible
   - [ ] Indicateur "Réponse sélectionnée" affiché
   - [ ] Compteur "X / 3 répondues" se met à jour

5. **Navigation**
   - [ ] Bouton "Précédent" désactivé sur Q1
   - [ ] Bouton "Suivant" fonctionne
   - [ ] Progress bar avance
   - [ ] Dernier question: bouton "Terminer le quiz"

6. **Soumission**
   - [ ] Clic "Terminer" ouvre résultats
   - [ ] Score calculé et affiché
   - [ ] Toast notification avec score

**Page Résultats:**
1. **Score**
   - [ ] Grand nombre en % (0-100%)
   - [ ] Message adapté (Excellent/Très bien/Pas mal/Réviser)
   - [ ] Icône Award (jaune si ≥75%, orange si ≥50%, gris sinon)
   - [ ] Compte bonnes réponses (X / 3)

2. **Détails par question**
   - [ ] Liste des 3 questions
   - [ ] ✅ vert si correct, ❌ rouge si incorrect
   - [ ] Votre réponse affichée avec lettre (ex: "A) Deux droites parallèles")
   - [ ] Bonne réponse affichée si erreur
   - [ ] Explication affichée (💡)

3. **Boutons**
   - [ ] "Voir Dashboard" redirige vers /dashboard
   - [ ] "Retour aux cours" redirige vers /courses

**Console DevTools:**
- [ ] Aucune erreur rouge
- [ ] Requête `getQuiz(1)` réussie
- [ ] Requête `saveQuizResult()` réussie
- [ ] Log "Score: XX%"

**Vérifier dans Supabase:**
```sql
SELECT * FROM quiz_results 
WHERE user_id = 'your-user-id' 
ORDER BY completed_at DESC 
LIMIT 1;
```
- [ ] Résultat inséré dans table
- [ ] Score correct
- [ ] user_answers JSON correct

**Résultat:** PASS / FAIL

---

### Test 6: Quiz avec timer écoulé
**URL:** http://localhost:3000/quiz/1

**Étapes:**
1. Ouvrir quiz
2. Répondre à 1-2 questions
3. **ATTENDRE** que timer arrive à 0:00 (ou modifier code pour timer court)

**Vérifications:**
- [ ] Timer arrive à 0:00
- [ ] Auto-submit déclenché
- [ ] Toast "Temps écoulé !"
- [ ] Page résultats affichée
- [ ] Score calculé avec questions répondues
- [ ] Questions non répondues = 0 points

**Résultat:** PASS / FAIL

---

### Test 7: Quiz ID invalide
**URL:** http://localhost:3000/quiz/999

**Vérifications:**
- [ ] Toast d'erreur "Quiz introuvable"
- [ ] Redirection vers /courses
- [ ] Aucun crash

**Résultat:** PASS / FAIL

---

### Test 8: Gamification après Quiz
**Après avoir complété Quiz ID 1 avec score ≥75%**

**Vérifier Dashboard:**
- [ ] Stats "Quiz complétés" +1
- [ ] Score moyen mis à jour
- [ ] Activité récente: nouveau quiz affiché
- [ ] Points gagnés visibles (si leaderboard implémenté)

**Vérifier dans Supabase:**
```sql
SELECT * FROM profiles WHERE id = 'your-user-id';
```
- [ ] Colonne `points` augmentée

**Résultat:** PASS / FAIL

---

### Test 9: Deuxième quiz
**URL:** http://localhost:3000/quiz/2

**Vérifications:**
- [ ] Quiz "Équations du second degré" se charge
- [ ] 3 questions différentes
- [ ] Même flow fonctionne
- [ ] Résultat sauvegardé séparément

**Résultat:** PASS / FAIL

---

### Test 10: Performance globale

**Outils:** Chrome DevTools > Network + Performance

**Vérifications:**
1. **Temps de chargement**
   - [ ] Dashboard < 3 secondes
   - [ ] Courses < 2 secondes
   - [ ] Quiz < 2 secondes

2. **Requêtes BDD**
   - [ ] Pas de requêtes en boucle
   - [ ] Requêtes parallèles avec Promise.all
   - [ ] Aucun 404 ou 500

3. **Mémoire**
   - [ ] Pas de memory leak
   - [ ] Timer cleanup correct

**Résultat:** PASS / FAIL

---

## 📊 RAPPORT DE TEST

### Résumé

| Test | Statut | Notes |
|------|--------|-------|
| 1. Home | ⬜ PASS / FAIL |  |
| 2. Login | ⬜ PASS / FAIL |  |
| 3. Dashboard | ⬜ PASS / FAIL |  |
| 4. Courses | ⬜ PASS / FAIL |  |
| 5. Quiz normal | ⬜ PASS / FAIL |  |
| 6. Quiz timer | ⬜ PASS / FAIL |  |
| 7. Quiz invalide | ⬜ PASS / FAIL |  |
| 8. Gamification | ⬜ PASS / FAIL |  |
| 9. Deuxième quiz | ⬜ PASS / FAIL |  |
| 10. Performance | ⬜ PASS / FAIL |  |

**Score total:** X / 10

**Bugs trouvés:**
1. 
2. 
3. 

**Améliorations suggérées:**
1. 
2. 
3. 

---

## 🐛 BUGS CONNUS ET FIXES

### Bug potentiel 1: Quiz ne se charge pas
**Symptôme:** Loading infini ou erreur "Quiz introuvable"
**Cause possible:** ID quiz invalide ou table vide
**Fix:** Vérifier que seed data est exécuté

### Bug potentiel 2: Timer ne démarre pas
**Symptôme:** Timer reste à 15:00
**Cause possible:** State `timerActive` à false
**Fix:** Vérifier useEffect dependencies

### Bug potentiel 3: Score non sauvegardé
**Symptôme:** Résultats affichés mais pas dans BDD
**Cause possible:** User non connecté ou erreur Supabase
**Fix:** Vérifier auth et permissions RLS

---

## ✅ CHECKLIST FINALE PHASE 1

- [ ] Tous les tests PASS
- [ ] Aucune erreur console
- [ ] Performance < 3s par page
- [ ] Mobile responsive (tester sur petit écran)
- [ ] Documentation complète
- [ ] Code commenté

**Si tout PASS → Phase 1 terminée à 100% ! 🎉**

**Prochaine étape:** Phase 2 ou Exam.jsx si nécessaire

---

## 📞 COMMANDES UTILES POUR TESTS

```bash
# Relancer serveur si problème
npm run dev

# Vérifier erreurs
npm run lint

# Build production
npm run build

# Preview build
npm run preview
```

**SQL pour reset données de test:**
```sql
-- Supprimer vos résultats de quiz
DELETE FROM quiz_results WHERE user_id = 'your-user-id';

-- Reset vos points
UPDATE profiles SET points = 0 WHERE id = 'your-user-id';

-- Reset votre progression
DELETE FROM user_progression WHERE user_id = 'your-user-id';
```

---

**Bon courage pour les tests ! 🚀**
