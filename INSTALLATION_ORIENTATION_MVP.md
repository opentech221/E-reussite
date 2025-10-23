# 🎯 GUIDE D'INSTALLATION MVP ORIENTATION

## ✅ FICHIERS CRÉÉS (8 fichiers)

### 📁 Services
- ✅ `src/services/orientationService.js` (15 questions + algorithmes)

### 📁 Pages
- ✅ `src/pages/Orientation.jsx` (page principale avec 3 états)

### 📁 Composants
- ✅ `src/components/orientation/OrientationTest.jsx` (questionnaire)
- ✅ `src/components/orientation/ResultsRadarChart.jsx` (graphique radar)
- ✅ `src/components/orientation/CareerCard.jsx` (carte métier)
- ✅ `src/components/orientation/CareerDetailModal.jsx` (modal détails)

### 📁 Configuration
- ✅ `src/App.jsx` (route ajoutée)
- ✅ `src/components/Sidebar.jsx` (lien menu ajouté)
- ✅ `src/components/layouts/PrivateLayout.jsx` (breadcrumb ajouté)

---

## 🗄️ ÉTAPE SUIVANTE : INSTALLER LA BASE DE DONNÉES

### 📍 Ouvre Supabase Dashboard
1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet **E-réussite**
3. Clique sur **"SQL Editor"** dans le menu de gauche

### 📝 Copie le SQL suivant

Ouvre le fichier **`ORIENTATION_MVP_SETUP.md`** qui se trouve à la racine du projet.

Exécute les 3 blocs SQL dans cet ordre :

#### 1️⃣ CRÉATION DES TABLES (lignes 10-100)
```sql
-- Copie tout le bloc "CREATE TABLE careers" jusqu'à "CREATE TABLE orientation_answers"
```

#### 2️⃣ INSERTION DES 20 MÉTIERS (lignes 105-350)
```sql
-- Copie tous les INSERT INTO careers VALUES (...)
```

#### 3️⃣ CRÉATION DES INDEX (lignes 355-370)
```sql
-- Copie tous les CREATE INDEX
```

#### 4️⃣ ACTIVATION RLS (lignes 375-395)
```sql
-- Copie les ALTER TABLE... ENABLE ROW LEVEL SECURITY
-- Copie les CREATE POLICY
```

### ✅ Vérification
Exécute cette requête pour vérifier :
```sql
SELECT COUNT(*) as total FROM careers;
-- Devrait retourner : 20
```

---

## 🚀 DÉMARRAGE

### 1️⃣ Installe les dépendances (si nécessaire)
```powershell
# Lucide React icons (déjà installé normalement)
npm install lucide-react

# Framer Motion (déjà installé normalement)
npm install framer-motion
```

### 2️⃣ Lance le serveur
```powershell
npm run dev
```

### 3️⃣ Teste la feature
1. Connecte-toi à l'app
2. Clique sur **"Orientation"** dans le menu (badge NOUVEAU rose)
3. Choisis **"Je suis au Lycée (BAC)"** ou **"Je suis au Collège (BFEM)"**
4. Réponds aux 15 questions
5. Découvre tes 5 métiers recommandés avec radar chart

---

## 🎨 FONCTIONNALITÉS INCLUSES

### ✅ Page Intro
- Hero section avec 3 stats cards
- 2 boutons CTA (BFEM / BAC)
- Explication "Comment ça marche" (3 étapes)

### ✅ Questionnaire (15 questions)
- **Q1**: Matières préférées (multiple choice, max 3)
- **Q2**: Matières détestées (multiple choice, max 2)
- **Q3-Q6**: Centres d'intérêt (rating 1-5 avec étoiles)
- **Q7**: Environnement de travail (single choice)
- **Q8**: Mode collaboration (single choice)
- **Q9**: Motivation principale (single choice)
- **Q10-Q12**: Compétences (rating 1-5)
- **Q13**: Durée études (single choice)
- **Q14**: Objectifs professionnels (multiple choice, max 3)
- **Q15**: Métier idéal (texte libre)

Barre de progression dynamique, navigation Précédent/Suivant, validation des réponses.

### ✅ Résultats
- **Radar Chart SVG** avec 6 dimensions animées
- **Top 5 métiers** en cartes avec :
  * Badge rang (#1, #2, #3...)
  * Score compatibilité (%)
  * Salaire moyen FCFA
  * Marché de l'emploi (Excellent/Bon/Moyen)
  * Formation requise
  * Tags BFEM/BAC
- **Résumé profil** :
  * Matières préférées
  * Environnement préféré
  * Citation métier idéal

### ✅ Modal Détails Métier
- Header gradient avec icône
- 3 stats cards (salaire, marché, environnement)
- Description complète
- Formation requise (liste avec checkmarks)
- Compétences requises (tags jaunes)
- Matières importantes (tags roses)
- Profil d'intérêt (6 barres de progression)
- Bouton "Enregistrer ce métier" (à implémenter Phase 2)

---

## 📊 ALGORITHME DE SCORING

### Calcul des scores (6 dimensions)
1. **Matières préférées** (Q1) → +25 points par matière forte
2. **Centres d'intérêt** (Q3-Q6) → Rating × 8 points
3. **Environnement travail** (Q7) → +15-25 points selon choix
4. **Mode collaboration** (Q8) → +20 points social ou +10-15 solo
5. **Motivation** (Q9) → +20-25 points selon domaine
6. **Compétences** (Q10-Q12) → Rating × 7 points
7. **Objectifs** (Q14) → +15-25 points par objectif

### Matching métiers
1. Filtre par niveau (BFEM ou BAC)
2. Calcul compatibilité :
   - 60% basé sur similarité des 6 scores
   - 20% bonus environnement de travail
   - 20% bonus matières importantes communes
3. Tri décroissant par score
4. Retour top 10 (affichage top 5)

---

## 🗂️ STRUCTURE BASE DE DONNÉES

### Table `careers` (20 lignes)
- Catégories : sciences (4), commerce (4), arts (4), droit (3), technique (3), agriculture (2)
- Champs clés :
  * `suitable_for_bfem`, `suitable_for_bac` (booléens)
  * `interest_scientific`, `interest_literary`, ... (0-100)
  * `average_salary_min`, `average_salary_max` (FCFA)
  * `job_market_outlook` (Excellent/Bon/Moyen)
  * `required_studies[]`, `required_skills[]`, `important_subjects[]`
  * `work_environment` (Bureau/Terrain/Atelier/Mixte)
  * `icon` (nom Lucide React)

### Table `orientation_tests`
- Stocke résultats utilisateur
- 6 scores calculés + préférences + top 5 métiers

### Table `orientation_answers`
- Stocke réponses détaillées question par question
- JSONB pour flexibilité

---

## 🔥 PROCHAINES ÉTAPES (Phase 2 - Non MVP)

### Feature 1 : Enregistrement Favoris
- Sauvegarder métiers favoris dans profil
- Tableau de bord "Mes Métiers Sauvegardés"

### Feature 2 : Comparaison Métiers
- Comparer 2-3 métiers côte à côte
- Tableaux de comparaison salaire/formation/débouchés

### Feature 3 : Vidéos Témoignages
- Intégrer videos YouTube de professionnels
- 1-2 vidéos par métier

### Feature 4 : Coaching Personnalisé
- Assistant IA qui analyse le profil
- Conseils personnalisés par métier

### Feature 5 : Événements/Portes Ouvertes
- Calendrier écoles/universités
- Inscription événements orientation

### Feature 6 : ML Avancé
- Prédictions basées sur historique quiz/examens
- Recommandations proactives

---

## 🐛 DEBUG

### Si erreur "Table careers does not exist"
→ Exécute le SQL dans Supabase (voir section Installation BDD)

### Si erreur "Module orientation not found"
→ Vérifie que tous les fichiers sont créés dans `src/`

### Si graphique radar ne s'affiche pas
→ Vérifie console browser, devrait y avoir logs "[Orientation]"

### Si aucun métier recommandé
→ Vérifie que `suitable_for_bfem` ou `suitable_for_bac` = true dans BDD

---

## 📸 CAPTURES D'ÉCRAN ATTENDUES

1. **Page Intro** : Hero + 3 cards stats + 2 boutons CTA
2. **Question 1** : Matières préférées avec icônes emoji
3. **Question 3** : Rating étoiles 1-5
4. **Barre progression** : 7/15 questions (47%)
5. **Résultats** : Radar chart 6 dimensions + Top 5 cartes
6. **Modal métier** : Header gradient + détails complets

---

## ✅ CHECKLIST FINALE

- [ ] SQL exécuté dans Supabase (20 métiers insérés)
- [ ] `npm run dev` lance sans erreur
- [ ] Menu "Orientation" visible avec badge NOUVEAU
- [ ] Clic sur "Je suis au Lycée" → questionnaire démarre
- [ ] 15 questions affichées avec navigation
- [ ] Barre progression fonctionne (0% → 100%)
- [ ] Clic "Voir mes résultats" → radar chart s'affiche
- [ ] Top 5 métiers affichés avec scores
- [ ] Clic sur un métier → modal détails s'ouvre
- [ ] Bouton "Refaire le test" → retour à l'intro
- [ ] Test sauvegardé (rechargement page → résultats toujours là)

---

## 🎉 FÉLICITATIONS !

Tu as maintenant un **système d'orientation professionnelle intelligent** avec :
- ✅ 15 questions multi-formats
- ✅ Algorithme de scoring sur 6 dimensions
- ✅ 20 métiers sénégalais avec salaires FCFA
- ✅ Radar chart animé
- ✅ Recommandations personnalisées
- ✅ Sauvegarde résultats

**Temps de développement** : 2-3 semaines MVP ✅
**Prochaine étape** : Tester avec 10-20 utilisateurs réels et ajuster l'algorithme selon feedback !

---

📝 **Créé le** : 23 octobre 2025
🚀 **Version** : MVP Phase 1
👨‍💻 **Développeur** : GitHub Copilot + Équipe E-réussite
