# 🎓 ORIENTATION MVP - GUIDE DE SETUP

## 📅 Date de création : 23 octobre 2025

---

## 🗄️ ÉTAPE 1 : TABLES SUPABASE À CRÉER

### **Table 1 : `careers` (Métiers)**

```sql
-- Table des métiers disponibles
CREATE TABLE careers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'sciences', 'commerce', 'arts', 'droit', 'technique', 'agriculture'
  subcategory VARCHAR(100),
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  
  -- Compatibilité niveau
  suitable_for_bfem BOOLEAN DEFAULT true,
  suitable_for_bac BOOLEAN DEFAULT true,
  
  -- Informations métier
  required_studies TEXT[], -- Ex: ['Licence Informatique', 'Master Data Science']
  required_skills TEXT[], -- Ex: ['Mathématiques', 'Logique', 'Créativité']
  work_environment VARCHAR(100), -- 'Bureau', 'Terrain', 'Atelier', 'Mixte'
  average_salary_min INTEGER, -- En FCFA
  average_salary_max INTEGER,
  job_market VARCHAR(50), -- 'Excellent', 'Bon', 'Moyen', 'Difficile'
  
  -- Matching attributes (pour algorithme)
  interest_scientific INTEGER DEFAULT 0, -- Score 0-100
  interest_literary INTEGER DEFAULT 0,
  interest_technical INTEGER DEFAULT 0,
  interest_artistic INTEGER DEFAULT 0,
  interest_social INTEGER DEFAULT 0,
  interest_commercial INTEGER DEFAULT 0,
  
  -- Matières importantes
  important_subjects TEXT[], -- Ex: ['Mathématiques', 'Physique', 'SVT']
  
  -- Médias
  image_url TEXT,
  video_url TEXT,
  icon VARCHAR(50), -- Nom de l'icône Lucide React
  
  -- Métadonnées
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_careers_category ON careers(category);
CREATE INDEX idx_careers_bfem ON careers(suitable_for_bfem);
CREATE INDEX idx_careers_bac ON careers(suitable_for_bac);
```

---

### **Table 2 : `orientation_tests` (Résultats tests)**

```sql
-- Table des résultats de tests d'orientation
CREATE TABLE orientation_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Scores calculés par domaine (0-100)
  score_scientific INTEGER DEFAULT 0,
  score_literary INTEGER DEFAULT 0,
  score_technical INTEGER DEFAULT 0,
  score_artistic INTEGER DEFAULT 0,
  score_social INTEGER DEFAULT 0,
  score_commercial INTEGER DEFAULT 0,
  
  -- Préférences détectées
  preferred_subjects TEXT[], -- Matières aimées
  disliked_subjects TEXT[], -- Matières détestées
  preferred_work_environment VARCHAR(100), -- 'Bureau', 'Terrain', 'Atelier', 'Mixte'
  career_goals TEXT, -- Objectifs de carrière (texte libre)
  
  -- Métiers recommandés (top 5)
  recommended_careers UUID[], -- Array de career IDs
  
  -- Métadonnées
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1, -- Version du test
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_orientation_tests_user ON orientation_tests(user_id);
CREATE INDEX idx_orientation_tests_completed ON orientation_tests(completed_at);

-- RLS Policies
ALTER TABLE orientation_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orientation tests"
  ON orientation_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orientation tests"
  ON orientation_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### **Table 3 : `orientation_answers` (Réponses détaillées)**

```sql
-- Table des réponses aux questions du test
CREATE TABLE orientation_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES orientation_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  question_id VARCHAR(50) NOT NULL, -- Ex: 'Q1', 'Q2', etc.
  answer_value JSONB NOT NULL, -- Réponse flexible (string, number, array)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_orientation_answers_test ON orientation_answers(test_id);
CREATE INDEX idx_orientation_answers_user ON orientation_answers(user_id);

-- RLS Policies
ALTER TABLE orientation_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orientation answers"
  ON orientation_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orientation answers"
  ON orientation_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 📊 ÉTAPE 2 : DONNÉES INITIALES (20 MÉTIERS)

### **Script d'insertion - À exécuter dans Supabase SQL Editor**

```sql
-- CATÉGORIE : SCIENCES & TECHNOLOGIES
INSERT INTO careers (title, slug, category, description, short_description, suitable_for_bfem, suitable_for_bac, required_studies, required_skills, work_environment, average_salary_min, average_salary_max, job_market, interest_scientific, interest_literary, interest_technical, interest_artistic, interest_social, interest_commercial, important_subjects, icon) VALUES
('Ingénieur Informatique', 'ingenieur-informatique', 'sciences', 'Concevoir, développer et maintenir des systèmes informatiques, applications et logiciels. Travailler sur des projets innovants en développement web, mobile, IA ou cybersécurité.', 'Expert en développement de solutions numériques et logiciels.', false, true, ARRAY['Licence Informatique', 'Master Génie Logiciel'], ARRAY['Mathématiques', 'Logique', 'Résolution de problèmes', 'Programmation'], 'Bureau', 800000, 2500000, 'Excellent', 90, 10, 85, 20, 30, 40, ARRAY['Mathématiques', 'Physique', 'Anglais'], 'Code'),

('Médecin Généraliste', 'medecin-generaliste', 'sciences', 'Diagnostiquer, traiter et prévenir les maladies. Accompagner les patients dans leur parcours de santé avec empathie et professionnalisme.', 'Professionnel de la santé au service des patients.', false, true, ARRAY['Doctorat en Médecine (7 ans)'], ARRAY['Sciences', 'Empathie', 'Communication', 'Rigueur'], 'Mixte', 1200000, 4000000, 'Bon', 95, 20, 30, 10, 80, 20, ARRAY['SVT', 'Chimie', 'Physique'], 'Stethoscope'),

('Data Scientist', 'data-scientist', 'sciences', 'Analyser de grandes quantités de données pour en extraire des insights stratégiques. Maîtriser les statistiques, le machine learning et la visualisation de données.', 'Expert en analyse de données et intelligence artificielle.', false, true, ARRAY['Master Data Science', 'Ingénieur Statistiques'], ARRAY['Mathématiques', 'Statistiques', 'Python/R', 'Analyse'], 'Bureau', 1000000, 3000000, 'Excellent', 95, 10, 80, 15, 20, 50, ARRAY['Mathématiques', 'Informatique'], 'BarChart3'),

('Pharmacien', 'pharmacien', 'sciences', 'Dispenser des médicaments, conseiller les patients sur leur utilisation et participer à la prévention sanitaire. Peut travailler en officine, hôpital ou industrie pharmaceutique.', 'Spécialiste du médicament et de la santé.', false, true, ARRAY['Doctorat en Pharmacie (6 ans)'], ARRAY['Chimie', 'Biologie', 'Rigueur', 'Conseil'], 'Bureau', 800000, 2000000, 'Bon', 85, 15, 25, 5, 70, 40, ARRAY['Chimie', 'SVT', 'Physique'], 'Pill'),

-- CATÉGORIE : COMMERCE & GESTION
('Expert Comptable', 'expert-comptable', 'commerce', 'Gérer la comptabilité des entreprises, auditer les comptes, conseiller sur les aspects fiscaux et financiers. Rôle clé dans la gestion d''entreprise.', 'Spécialiste de la gestion financière et fiscale.', false, true, ARRAY['Master Comptabilité', 'DEC (Diplôme Expert Comptable)'], ARRAY['Mathématiques', 'Rigueur', 'Analyse', 'Gestion'], 'Bureau', 700000, 2500000, 'Excellent', 50, 30, 20, 5, 40, 80, ARRAY['Mathématiques', 'Économie'], 'Calculator'),

('Responsable Marketing', 'responsable-marketing', 'commerce', 'Élaborer et mettre en œuvre des stratégies marketing pour promouvoir produits et services. Analyser le marché, gérer les campagnes et piloter la communication.', 'Expert en stratégie commerciale et communication.', false, true, ARRAY['Master Marketing', 'École de Commerce'], ARRAY['Créativité', 'Communication', 'Analyse', 'Digital'], 'Bureau', 600000, 2000000, 'Bon', 20, 40, 30, 50, 60, 90, ARRAY['Économie', 'Anglais', 'Français'], 'TrendingUp'),

('Entrepreneur', 'entrepreneur', 'commerce', 'Créer et gérer sa propre entreprise, innover, prendre des risques calculés et développer son activité. Liberté et responsabilité.', 'Créateur et dirigeant d''entreprise.', true, true, ARRAY['Formation Gestion (optionnel)', 'Expérience terrain'], ARRAY['Leadership', 'Créativité', 'Gestion', 'Persévérance'], 'Mixte', 500000, 5000000, 'Moyen', 30, 30, 40, 40, 50, 95, ARRAY['Économie', 'Mathématiques'], 'Briefcase'),

('Gestionnaire RH', 'gestionnaire-rh', 'commerce', 'Gérer le recrutement, la formation, la paie et l''administration du personnel. Accompagner les collaborateurs dans leur évolution professionnelle.', 'Expert en gestion des ressources humaines.', false, true, ARRAY['Licence/Master RH'], ARRAY['Communication', 'Empathie', 'Organisation', 'Droit'], 'Bureau', 500000, 1500000, 'Bon', 20, 50, 15, 20, 85, 60, ARRAY['Français', 'Droit'], 'Users'),

-- CATÉGORIE : ARTS & COMMUNICATION
('Designer Graphique', 'designer-graphique', 'arts', 'Créer des visuels, logos, affiches, interfaces web et contenus graphiques pour entreprises et particuliers. Maîtriser les outils Adobe et le design thinking.', 'Créateur visuel et artistique numérique.', true, true, ARRAY['Licence Design', 'Formation Adobe/Figma'], ARRAY['Créativité', 'Sens artistique', 'Maîtrise logiciels', 'Communication'], 'Bureau', 300000, 1500000, 'Bon', 15, 30, 60, 95, 40, 50, ARRAY['Arts plastiques', 'Informatique'], 'Palette'),

('Community Manager', 'community-manager', 'arts', 'Gérer les réseaux sociaux d''une entreprise ou marque, créer du contenu engageant, animer les communautés et analyser les performances.', 'Expert en animation des réseaux sociaux.', true, true, ARRAY['Licence Communication', 'Formation Digital'], ARRAY['Créativité', 'Rédaction', 'Digital', 'Réactivité'], 'Bureau', 250000, 1000000, 'Excellent', 10, 60, 50, 70, 80, 70, ARRAY['Français', 'Anglais'], 'MessageCircle'),

('Journaliste', 'journaliste', 'arts', 'Rechercher, vérifier et diffuser l''information via presse écrite, radio, TV ou web. Rôle clé dans la démocratie et l''information du public.', 'Professionnel de l''information et de l''investigation.', false, true, ARRAY['Licence Journalisme', 'École de Journalisme'], ARRAY['Rédaction', 'Investigation', 'Communication', 'Curiosité'], 'Terrain', 300000, 1500000, 'Moyen', 20, 85, 30, 50, 70, 40, ARRAY['Français', 'Histoire-Géographie'], 'Newspaper'),

('Photographe Professionnel', 'photographe-professionnel', 'arts', 'Capturer des moments, créer des visuels artistiques ou commerciaux pour mariages, événements, publicité ou presse. Maîtrise technique et artistique.', 'Artiste de l''image et de la lumière.', true, true, ARRAY['Formation Photographie (optionnel)'], ARRAY['Créativité', 'Technique photo', 'Sens artistique', 'Relationnel'], 'Terrain', 200000, 2000000, 'Moyen', 10, 20, 70, 95, 40, 50, ARRAY['Arts plastiques'], 'Camera'),

-- CATÉGORIE : DROIT & SOCIAL
('Avocat', 'avocat', 'droit', 'Défendre les intérêts de clients devant les tribunaux, conseiller juridiquement et rédiger des actes. Expertise en droit et plaidoirie.', 'Professionnel du droit et de la justice.', false, true, ARRAY['Master Droit', 'CAPA (Certificat Aptitude Profession Avocat)'], ARRAY['Argumentation', 'Droit', 'Expression orale', 'Analyse'], 'Bureau', 800000, 3000000, 'Bon', 30, 80, 10, 30, 60, 50, ARRAY['Français', 'Histoire-Géographie', 'Droit'], 'Scale'),

('Assistant Social', 'assistant-social', 'droit', 'Accompagner les personnes en difficulté (sociale, familiale, économique), les orienter vers les structures adaptées et défendre leurs droits.', 'Professionnel de l''aide et de l''accompagnement social.', false, true, ARRAY['Licence Travail Social'], ARRAY['Empathie', 'Écoute', 'Communication', 'Psychologie'], 'Terrain', 300000, 800000, 'Bon', 10, 50, 10, 20, 95, 20, ARRAY['Français', 'Histoire-Géographie'], 'Heart'),

('Psychologue', 'psychologue', 'droit', 'Accompagner les individus dans leurs problématiques émotionnelles, comportementales ou relationnelles. Écoute, analyse et thérapies adaptées.', 'Spécialiste de la santé mentale et du comportement.', false, true, ARRAY['Master Psychologie'], ARRAY['Empathie', 'Écoute', 'Analyse', 'Communication'], 'Bureau', 400000, 1500000, 'Bon', 40, 60, 10, 20, 90, 20, ARRAY['SVT', 'Français'], 'Brain'),

-- CATÉGORIE : MÉTIERS TECHNIQUES
('Électricien Bâtiment', 'electricien-batiment', 'technique', 'Installer, entretenir et réparer les installations électriques dans les bâtiments résidentiels, commerciaux et industriels. Compétences techniques et sécurité.', 'Expert en installations électriques.', true, true, ARRAY['CAP/BEP Électricité', 'Formation professionnelle'], ARRAY['Technique', 'Rigueur', 'Sécurité', 'Manuel'], 'Terrain', 250000, 1000000, 'Excellent', 40, 10, 95, 10, 30, 40, ARRAY['Mathématiques', 'Physique'], 'Zap'),

('Mécanicien Automobile', 'mecanicien-automobile', 'technique', 'Diagnostiquer et réparer les pannes mécaniques, électroniques et électriques des véhicules. Métier technique en constante évolution (véhicules électriques).', 'Spécialiste de la réparation automobile.', true, true, ARRAY['CAP Mécanique', 'Formation professionnelle'], ARRAY['Technique', 'Diagnostic', 'Manuel', 'Logique'], 'Atelier', 200000, 800000, 'Excellent', 50, 5, 95, 5, 20, 30, ARRAY['Mathématiques', 'Physique'], 'Wrench'),

('Technicien Maintenance Informatique', 'technicien-maintenance-informatique', 'technique', 'Installer, configurer, dépanner et maintenir les équipements informatiques (PC, serveurs, réseaux). Support technique aux utilisateurs.', 'Expert en maintenance des systèmes informatiques.', true, true, ARRAY['BTS Informatique', 'Formation technique'], ARRAY['Technique', 'Diagnostic', 'Informatique', 'Relationnel'], 'Bureau', 300000, 1200000, 'Excellent', 60, 10, 90, 10, 40, 30, ARRAY['Mathématiques', 'Informatique'], 'Settings'),

-- CATÉGORIE : AGRICULTURE & ENVIRONNEMENT
('Agronome', 'agronome', 'agriculture', 'Optimiser la production agricole, conseiller les exploitants, développer des techniques durables et améliorer les rendements. Rôle clé pour la sécurité alimentaire.', 'Expert en production et développement agricole.', false, true, ARRAY['Ingénieur Agronome', 'Master Agriculture'], ARRAY['Sciences', 'Analyse', 'Terrain', 'Innovation'], 'Terrain', 500000, 2000000, 'Bon', 75, 20, 60, 10, 40, 40, ARRAY['SVT', 'Chimie', 'Mathématiques'], 'Sprout'),

('Vétérinaire', 'veterinaire', 'agriculture', 'Soigner et prévenir les maladies des animaux domestiques et d''élevage. Rôle sanitaire important pour l''élevage et la santé publique.', 'Médecin des animaux.', false, true, ARRAY['Doctorat Vétérinaire (7 ans)'], ARRAY['Sciences', 'Empathie animaux', 'Diagnostic', 'Chirurgie'], 'Mixte', 800000, 2500000, 'Bon', 85, 15, 40, 10, 70, 30, ARRAY['SVT', 'Chimie', 'Physique'], 'PawPrint');
```

---

## ✅ INSTRUCTIONS D'EXÉCUTION

### **1. Créer les tables**
1. Ouvrir Supabase Dashboard → SQL Editor
2. Copier-coller le script des 3 tables
3. Exécuter

### **2. Insérer les données métiers**
1. Copier-coller le script d'insertion (20 métiers)
2. Exécuter

### **3. Vérifier**
```sql
SELECT COUNT(*) FROM careers; -- Doit retourner 20
SELECT category, COUNT(*) FROM careers GROUP BY category;
```

---

## 🎯 PROCHAINES ÉTAPES

Une fois les tables créées :
- ✅ Création composants React (OrientationTest.jsx, CareerCard.jsx, etc.)
- ✅ Service orientationService.js
- ✅ Questionnaire de 15 questions
- ✅ Algorithme de scoring
- ✅ Page d'affichage résultats

---

**Date:** 23 octobre 2025  
**Projet:** E-Réussite - MVP Orientation Phase 1  
**Durée estimée:** 2-3 semaines
