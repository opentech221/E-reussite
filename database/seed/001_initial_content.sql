-- ============================================
-- SEED DATA: Initial Content for E-Réussite
-- Date: 2 octobre 2025
-- Description: Populate database with sample content
-- ============================================

-- IMPORTANT: Execute this AFTER the profile migration

-- ============================================
-- 1. BADGES
-- ============================================

INSERT INTO badges (name, description, icon_name) VALUES
  ('Premier Pas', 'Terminer votre première leçon', 'Footprints'),
  ('Persévérant', '7 jours consécutifs d''étude', 'Flame'),
  ('Matheux', 'Obtenir 100% à 5 quiz de maths', 'Sigma'),
  ('Scientifique', 'Compléter 10 chapitres de sciences', 'Atom'),
  ('Littéraire', 'Excellent en français et philo', 'Feather'),
  ('Marathon', 'Étudier pendant 10 heures en une semaine', 'Timer'),
  ('Champion', 'Top 10 du leaderboard', 'Trophy'),
  ('Perfectionniste', 'Obtenir 100% à 10 quiz', 'Star'),
  ('Érudit', 'Compléter tous les cours d''une matière', 'Brain'),
  ('Early Bird', 'Étudier avant 7h du matin', 'Award');

-- ============================================
-- 2. MATIÈRES BFEM
-- ============================================

INSERT INTO matieres (name, level) VALUES
  ('Mathématiques BFEM', 'bfem'),
  ('Français BFEM', 'bfem'),
  ('Physique-Chimie BFEM', 'bfem'),
  ('SVT BFEM', 'bfem'),
  ('Histoire-Géographie BFEM', 'bfem'),
  ('Anglais BFEM', 'bfem');

-- ============================================
-- 3. MATIÈRES BAC
-- ============================================

INSERT INTO matieres (name, level) VALUES
  ('Mathématiques BAC', 'bac'),
  ('Physique-Chimie BAC', 'bac'),
  ('SVT BAC', 'bac'),
  ('Français BAC', 'bac'),
  ('Philosophie BAC', 'bac'),
  ('Histoire-Géographie BAC', 'bac'),
  ('Anglais BAC', 'bac');

-- ============================================
-- 4. CHAPITRES - MATHÉMATIQUES BFEM
-- ============================================

DO $$
DECLARE
  mat_math_bfem_id INT;
  mat_fr_bfem_id INT;
  mat_phys_bfem_id INT;
  mat_math_bac_id INT;
BEGIN
  -- Récupérer les IDs des matières
  SELECT id INTO mat_math_bfem_id FROM matieres WHERE name = 'Mathématiques BFEM' AND level = 'bfem';
  SELECT id INTO mat_fr_bfem_id FROM matieres WHERE name = 'Français BFEM' AND level = 'bfem';
  SELECT id INTO mat_phys_bfem_id FROM matieres WHERE name = 'Physique-Chimie BFEM' AND level = 'bfem';
  SELECT id INTO mat_math_bac_id FROM matieres WHERE name = 'Mathématiques BAC' AND level = 'bac';

  -- Insérer chapitres pour Mathématiques BFEM
  IF mat_math_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order") VALUES
      (mat_math_bfem_id, 'Théorème de Thalès', 'Configuration de Thalès et applications', 1),
      (mat_math_bfem_id, 'Équations du second degré', 'Résolution, factorisation et discriminant', 2),
      (mat_math_bfem_id, 'Fonctions linéaires et affines', 'Représentation graphique et applications', 3),
      (mat_math_bfem_id, 'Statistiques', 'Moyenne, médiane, étendue et diagrammes', 4),
      (mat_math_bfem_id, 'Pythagore et trigonométrie', 'Relations métriques dans le triangle rectangle', 5);
  END IF;

-- ============================================
-- 5. CHAPITRES - FRANÇAIS BFEM
-- ============================================

  -- Insérer chapitres pour Français BFEM
  IF mat_fr_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order") VALUES
      (mat_fr_bfem_id, 'Les figures de style', 'Métaphore, comparaison, personnification', 1),
      (mat_fr_bfem_id, 'La phrase complexe', 'Propositions principales et subordonnées', 2),
      (mat_fr_bfem_id, 'Le roman africain', 'Auteurs et œuvres majeures', 3),
      (mat_fr_bfem_id, 'L''argumentation', 'Thèse, arguments et exemples', 4);
  END IF;

-- ============================================
-- 6. CHAPITRES - PHYSIQUE-CHIMIE BFEM
-- ============================================

  -- Insérer chapitres pour Physique-Chimie BFEM
  IF mat_phys_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order") VALUES
      (mat_phys_bfem_id, 'Électricité', 'Circuit électrique, loi d''Ohm', 1),
      (mat_phys_bfem_id, 'Optique', 'Lentilles convergentes et divergentes', 2),
      (mat_phys_bfem_id, 'Les réactions chimiques', 'Combustion, oxydation, pH', 3),
      (mat_phys_bfem_id, 'Mécanique', 'Force, poids, masse', 4);
  END IF;

-- ============================================
-- 7. CHAPITRES - MATHÉMATIQUES BAC
-- ============================================

  -- Insérer chapitres pour Mathématiques BAC
  IF mat_math_bac_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order") VALUES
      (mat_math_bac_id, 'Nombres complexes', 'Forme algébrique, trigonométrique et exponentielle', 1),
      (mat_math_bac_id, 'Suites numériques', 'Arithmétiques, géométriques, récurrentes', 2),
      (mat_math_bac_id, 'Fonctions exponentielles', 'Propriétés et applications', 3),
      (mat_math_bac_id, 'Probabilités', 'Loi binomiale, loi normale', 4),
      (mat_math_bac_id, 'Intégration', 'Primitives et calcul d''aires', 5);
  END IF;

END $$;

-- ============================================
-- 8-12. LEÇONS, QUIZ ET QUESTIONS
-- ============================================

DO $$
DECLARE
  chap_thales_id INT;
  chap_equations_id INT;
  chap_fonctions_id INT;
  chap_complexes_id INT;
  quiz1_id INT;
  quiz2_id INT;
  mat_math_bfem_id INT;
  mat_fr_bfem_id INT;
BEGIN
  -- Récupérer IDs des chapitres
  SELECT id INTO chap_thales_id FROM chapitres WHERE title = 'Théorème de Thalès' LIMIT 1;
  SELECT id INTO chap_equations_id FROM chapitres WHERE title = 'Équations du second degré' LIMIT 1;
  SELECT id INTO chap_fonctions_id FROM chapitres WHERE title = 'Fonctions linéaires et affines' LIMIT 1;
  SELECT id INTO chap_complexes_id FROM chapitres WHERE title = 'Nombres complexes' LIMIT 1;
  
  -- Récupérer IDs des matières pour annales
  SELECT id INTO mat_math_bfem_id FROM matieres WHERE name = 'Mathématiques BFEM' LIMIT 1;
  SELECT id INTO mat_fr_bfem_id FROM matieres WHERE name = 'Français BFEM' LIMIT 1;

  -- LEÇONS - Théorème de Thalès
  IF chap_thales_id IS NOT NULL THEN
    INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview) VALUES
      (chap_thales_id, 'Introduction au théorème de Thalès', 
       'Le théorème de Thalès est un résultat fondamental de géométrie...', 1, true),
      (chap_thales_id, 'Configuration de Thalès', 
       'Reconnaître une configuration de Thalès dans une figure...', 2, true),
      (chap_thales_id, 'Applications et exercices', 
       'Résoudre des problèmes utilisant le théorème de Thalès...', 3, false);
  END IF;

  -- LEÇONS - Équations du second degré
  IF chap_equations_id IS NOT NULL THEN
    INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview) VALUES
      (chap_equations_id, 'Forme canonique', 
       'Transformer une équation en forme canonique...', 1, false),
      (chap_equations_id, 'Résolution par factorisation', 
       'Méthode de factorisation pour résoudre ax² + bx + c = 0...', 2, false),
      (chap_equations_id, 'Le discriminant', 
       'Utilisation du discriminant Δ = b² - 4ac...', 3, false);
  END IF;

  -- LEÇONS - Nombres complexes
  IF chap_complexes_id IS NOT NULL THEN
    INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview) VALUES
      (chap_complexes_id, 'Forme algébrique', 
       'Représentation z = a + ib...', 1, true),
      (chap_complexes_id, 'Opérations sur les complexes', 
       'Addition, multiplication, conjugué...', 2, false),
      (chap_complexes_id, 'Forme trigonométrique', 
       'Module et argument...', 3, false);
  END IF;

  -- QUIZ - Théorème de Thalès
  IF chap_thales_id IS NOT NULL THEN
    INSERT INTO quiz (chapitre_id, title, difficulty, time_limit, description) VALUES
      (chap_thales_id, 'Quiz: Théorème de Thalès - Niveau 1', 'Facile', 10, 
       'Testez vos connaissances sur le théorème de Thalès et ses applications')
    RETURNING id INTO quiz1_id;

    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
      (quiz1_id, 
       'Quelle est la condition principale pour appliquer le théorème de Thalès ?',
       '["Deux droites parallèles coupées par deux sécantes", "Un angle droit", "Un cercle circonscrit", "Deux triangles isocèles"]',
       'A'),
      (quiz1_id,
       'Si AB/AM = AC/AN, que peut-on conclure sur (BC) et (MN) ?',
       '["(BC) // (MN)", "(BC) ⊥ (MN)", "(BC) = (MN)", "Aucune relation"]',
       'A'),
      (quiz1_id,
       'Dans un triangle ABC, si AM = 4, MB = 6, AN = 6 et NC = 9, alors :',
       '["(MN) // (BC)", "(MN) ⊥ (BC)", "(MN) = (BC)", "Information insuffisante"]',
       'A');
  END IF;

  -- QUIZ - Équations du second degré
  IF chap_equations_id IS NOT NULL THEN
    INSERT INTO quiz (chapitre_id, title, difficulty, time_limit, description) VALUES
      (chap_equations_id, 'Quiz: Équations du second degré', 'Facile', 10,
       'Évaluez votre maîtrise des équations du second degré et du discriminant')
    RETURNING id INTO quiz2_id;

    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
      (quiz2_id,
       'Quelle est la forme canonique de x² - 4x + 3 ?',
       '["(x - 2)² - 1", "(x - 2)² + 1", "(x + 2)² - 1", "(x - 1)² - 2"]',
       'A'),
      (quiz2_id,
       'Si Δ < 0, combien de solutions réelles possède l''équation ?',
       '["Aucune", "Une", "Deux", "Infini"]',
       'A'),
      (quiz2_id,
       'Les solutions de x² - 5x + 6 = 0 sont :',
       '["2 et 3", "1 et 6", "-2 et -3", "Pas de solution"]',
       'A');
  END IF;

  -- ANNALES - Mathématiques BFEM
  IF mat_math_bfem_id IS NOT NULL THEN
    INSERT INTO annales (matiere_id, year, title) VALUES
      (mat_math_bfem_id, 2023, 'Annales Mathématiques BFEM 2023'),
      (mat_math_bfem_id, 2022, 'Annales Mathématiques BFEM 2022'),
      (mat_math_bfem_id, 2021, 'Annales Mathématiques BFEM 2021'),
      (mat_math_bfem_id, 2020, 'Annales Mathématiques BFEM 2020');
  END IF;

  -- ANNALES - Français BFEM
  IF mat_fr_bfem_id IS NOT NULL THEN
    INSERT INTO annales (matiere_id, year, title) VALUES
      (mat_fr_bfem_id, 2023, 'Annales Français BFEM 2023'),
      (mat_fr_bfem_id, 2022, 'Annales Français BFEM 2022'),
      (mat_fr_bfem_id, 2021, 'Annales Français BFEM 2021');
  END IF;

  -- FICHES DE RÉVISION
  IF chap_thales_id IS NOT NULL AND chap_equations_id IS NOT NULL AND chap_fonctions_id IS NOT NULL THEN
    INSERT INTO fiches_revision (chapitre_id, title, content) VALUES
      (chap_thales_id, 'Fiche: Théorème de Thalès - L''essentiel', 
       'Configuration, formules, erreurs à éviter...'),
      (chap_equations_id, 'Fiche: Équations du 2nd degré - Formulaire', 
       'Δ = b² - 4ac, formules des solutions...'),
      (chap_fonctions_id, 'Fiche: Fonctions - Méthodes', 
       'Tableaux de variations, représentation graphique...');
  END IF;

END $$;

-- ============================================
-- 16. EXAM SIMULATIONS
-- ============================================

INSERT INTO exam_simulations (title, parcours, duration_minutes) VALUES
  ('Simulation Examen Blanc - BFEM Maths', 'bfem', 180),
  ('Simulation Examen Blanc - BFEM Français', 'bfem', 180),
  ('Simulation Examen Blanc - BAC S Maths', 'bac_s', 240),
  ('Simulation Examen Blanc - BAC L Philosophie', 'bac_l', 240);

-- ============================================
-- 17. PRODUITS BOUTIQUE
-- ============================================

-- Type: 'numerique' (digital) ou 'physique' (physical)
INSERT INTO products (name, description, price, type, stock_quantity) VALUES
  ('Pack Annales BFEM Toutes Matières', 
   'Annales corrigées de 2015 à 2024 pour toutes les matières du BFEM', 
   15000, 'numerique', NULL),
  ('Pack Annales BAC S Complet', 
   'Annales corrigées de 2015 à 2024 - Maths, PC, SVT', 
   20000, 'numerique', NULL),
  ('Kit de Papeterie E-Réussite', 
   'Stylos, cahiers, fiches Bristol aux couleurs E-Réussite', 
   8000, 'physique', 50),
  ('E-book: Méthodologie de la dissertation', 
   'Guide complet pour maîtriser la dissertation littéraire', 
   5000, 'numerique', NULL),
  ('Fiches de révision - Maths Terminale S', 
   'Toutes les formules essentielles en fiches plastifiées', 
   7000, 'physique', 100),
  ('T-shirt "Génie en Herbe"', 
   'T-shirt 100% coton, plusieurs tailles disponibles', 
   12000, 'physique', 30),
  ('Abonnement Premium - 1 mois', 
   'Accès illimité à tous les cours et quiz', 
   5000, 'numerique', NULL),
  ('Abonnement Premium - 3 mois', 
   'Accès illimité + séances coaching', 
   12000, 'numerique', NULL),
  ('Abonnement Premium - 1 an', 
   'Accès illimité + coaching + certificats', 
   40000, 'numerique', NULL);

-- ============================================
-- 18. MONTHLY CHALLENGES
-- ============================================

INSERT INTO monthly_challenges (name, description, start_date, end_date, parcours_target) VALUES
  ('Défi Octobre 2025', 
   'Complète 50 quiz avec un score moyen de 80% ou plus', 
   '2025-10-01', '2025-10-31', NULL),
  ('Marathon Maths BFEM', 
   'Termine tous les chapitres de maths BFEM ce mois', 
   '2025-10-01', '2025-10-31', 'bfem');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Compter les éléments insérés
-- SELECT 'Badges' as table_name, COUNT(*) as count FROM badges
-- UNION ALL
-- SELECT 'Matières', COUNT(*) FROM matieres
-- UNION ALL
-- SELECT 'Chapitres', COUNT(*) FROM chapitres
-- UNION ALL
-- SELECT 'Leçons', COUNT(*) FROM lecons
-- UNION ALL
-- SELECT 'Quiz', COUNT(*) FROM quiz
-- UNION ALL
-- SELECT 'Questions', COUNT(*) FROM quiz_questions
-- UNION ALL
-- SELECT 'Annales', COUNT(*) FROM annales
-- UNION ALL
-- SELECT 'Fiches', COUNT(*) FROM fiches_revision
-- UNION ALL
-- SELECT 'Examens', COUNT(*) FROM exam_simulations
-- UNION ALL
-- SELECT 'Produits', COUNT(*) FROM products
-- UNION ALL
-- SELECT 'Challenges', COUNT(*) FROM monthly_challenges;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT '✅ Seed data inserted successfully!' as message,
       'Total items: ' || (
         SELECT SUM(count) FROM (
           SELECT COUNT(*) as count FROM badges
           UNION ALL SELECT COUNT(*) FROM matieres
           UNION ALL SELECT COUNT(*) FROM chapitres
           UNION ALL SELECT COUNT(*) FROM lecons
           UNION ALL SELECT COUNT(*) FROM quiz
           UNION ALL SELECT COUNT(*) FROM quiz_questions
           UNION ALL SELECT COUNT(*) FROM annales
           UNION ALL SELECT COUNT(*) FROM fiches_revision
           UNION ALL SELECT COUNT(*) FROM exam_simulations
           UNION ALL SELECT COUNT(*) FROM products
           UNION ALL SELECT COUNT(*) FROM monthly_challenges
         ) as totals
       ) as total;
