-- =============================================
-- SEED QUESTIONS POUR COMPÉTITIONS
-- Alimentation de la table questions depuis les données existantes
-- =============================================

-- ============================================================
-- PARTIE 1 : Questions de Mathématiques
-- ============================================================

-- Mathématiques - Théorème de Thalès
INSERT INTO questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, subject, difficulty)
VALUES
('Quelle est la condition principale pour appliquer le théorème de Thalès ?',
 'qcm',
 'Deux triangles superposés',
 'Deux droites parallèles coupées par deux sécantes',
 'Deux cercles concentriques',
 'Deux angles égaux',
 'B',
 'mathematiques',
 'moyen'),

('Si (DE) // (BC) dans un triangle ABC, quelle égalité est vraie ?',
 'qcm',
 'AD/AB = AE/AC = DE/BC',
 'AD + AE = AB + AC',
 'AD × AB = AE × AC',
 'AD - AB = AE - AC',
 'A',
 'mathematiques',
 'difficile'),

('Dans un triangle ABC, si AD/AB = 2/5 et AE/AC = 2/5, que peut-on conclure ?',
 'qcm',
 '(DE) et (BC) sont perpendiculaires',
 '(DE) et (BC) sont parallèles',
 'Le triangle est rectangle',
 'Les points sont alignés',
 'B',
 'mathematiques',
 'moyen');

-- Mathématiques - Équations du second degré
INSERT INTO questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, subject, difficulty)
VALUES
('Quelle est la forme générale d''une équation du second degré ?',
 'qcm',
 'ax + b = 0',
 'ax² + bx + c = 0',
 'ax³ + bx² + c = 0',
 'ax² = b',
 'B',
 'mathematiques',
 'facile'),

('Le discriminant Δ d''une équation ax² + bx + c = 0 est :',
 'qcm',
 'b² - 4ac',
 'b² + 4ac',
 '4ac - b²',
 'b² - ac',
 'A',
 'mathematiques',
 'moyen'),

('Si Δ < 0, combien l''équation a-t-elle de solutions réelles ?',
 'qcm',
 '0 solution',
 '1 solution',
 '2 solutions',
 'Infinité de solutions',
 'A',
 'mathematiques',
 'moyen'),

('Pour résoudre x² - 5x + 6 = 0, on peut factoriser en :',
 'qcm',
 '(x - 2)(x - 3)',
 '(x + 2)(x + 3)',
 '(x - 1)(x - 6)',
 '(x + 1)(x + 6)',
 'A',
 'mathematiques',
 'difficile'),

('Si Δ = 0, l''équation a :',
 'qcm',
 'Deux solutions distinctes',
 'Une solution double',
 'Aucune solution',
 'Trois solutions',
 'B',
 'mathematiques',
 'moyen');

-- Mathématiques - Fonctions
INSERT INTO questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, subject, difficulty)
VALUES
('Une fonction linéaire a pour forme :',
 'qcm',
 'f(x) = ax + b',
 'f(x) = ax',
 'f(x) = ax² + b',
 'f(x) = a/x',
 'B',
 'mathematiques',
 'facile'),

('Dans une fonction affine f(x) = 2x + 3, quel est le coefficient directeur ?',
 'qcm',
 '3',
 '2',
 '5',
 '2x',
 'B',
 'mathematiques',
 'facile'),

('Une fonction linéaire passe toujours par :',
 'qcm',
 'Le point (1, 1)',
 'L''origine (0, 0)',
 'Le point (0, 1)',
 'Aucun point fixe',
 'B',
 'mathematiques',
 'moyen');

-- ============================================================
-- PARTIE 2 : Questions de Sciences (SVT)
-- ============================================================

INSERT INTO questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, subject, difficulty)
VALUES
('Quel est l''organite responsable de la production d''énergie dans la cellule ?',
 'qcm',
 'Le noyau',
 'La mitochondrie',
 'Le ribosome',
 'Le réticulum endoplasmique',
 'B',
 'sciences',
 'moyen'),

('Quelle est l''unité de base de tous les êtres vivants ?',
 'qcm',
 'L''atome',
 'La molécule',
 'La cellule',
 'L''organe',
 'C',
 'sciences',
 'facile'),

('Où se trouve l''ADN dans une cellule eucaryote ?',
 'qcm',
 'Dans le cytoplasme',
 'Dans le noyau',
 'Dans la membrane',
 'Dans les mitochondries',
 'B',
 'sciences',
 'moyen'),

('La photosynthèse se produit dans :',
 'qcm',
 'Les mitochondries',
 'Les chloroplastes',
 'Le noyau',
 'Les ribosomes',
 'B',
 'sciences',
 'moyen'),

('Quelle est la formule chimique de l''eau ?',
 'qcm',
 'H2O',
 'CO2',
 'O2',
 'H2O2',
 'A',
 'sciences',
 'facile');

-- ============================================================
-- PARTIE 3 : Questions de Physique-Chimie
-- ============================================================

INSERT INTO questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, subject, difficulty)
VALUES
('Un atome est constitué de :',
 'qcm',
 'Protons et neutrons uniquement',
 'Électrons uniquement',
 'Protons, neutrons et électrons',
 'Molécules',
 'C',
 'physique_chimie',
 'facile'),

('Le numéro atomique Z représente :',
 'qcm',
 'Le nombre de neutrons',
 'Le nombre de protons',
 'Le nombre d''électrons de valence',
 'La masse de l''atome',
 'B',
 'physique_chimie',
 'moyen'),

('À quelle vitesse se déplace la lumière dans le vide ?',
 'qcm',
 '300 000 km/s',
 '150 000 km/s',
 '500 000 km/s',
 '1 000 000 km/s',
 'A',
 'physique_chimie',
 'moyen'),

('Quelle est la formule de la force en physique ?',
 'qcm',
 'F = m × a',
 'F = m / a',
 'F = a / m',
 'F = m + a',
 'A',
 'physique_chimie',
 'moyen'),

('Un ion positif est appelé :',
 'qcm',
 'Anion',
 'Cation',
 'Neutron',
 'Isotope',
 'B',
 'physique_chimie',
 'facile');

-- ============================================================
-- PARTIE 4 : Questions de Français
-- ============================================================

INSERT INTO questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, subject, difficulty)
VALUES
('Quelle figure de style compare deux éléments avec "comme" ?',
 'qcm',
 'Une métaphore',
 'Une comparaison',
 'Une personnification',
 'Une hyperbole',
 'B',
 'francais',
 'facile'),

('L''oxymore est :',
 'qcm',
 'Une répétition de sons',
 'Une association de mots contradictoires',
 'Une exagération',
 'Une atténuation',
 'B',
 'francais',
 'moyen'),

('Quel est le passé simple de "je vais" ?',
 'qcm',
 'J''allais',
 'Je suis allé',
 'J''allai',
 'J''irai',
 'C',
 'francais',
 'moyen'),

('Une métaphore est :',
 'qcm',
 'Une comparaison avec "comme"',
 'Une comparaison sans outil de comparaison',
 'Une répétition',
 'Une négation',
 'B',
 'francais',
 'moyen'),

('Le COD répond à la question :',
 'qcm',
 'Où ?',
 'Quand ?',
 'Quoi/Qui ?',
 'Pourquoi ?',
 'C',
 'francais',
 'facile');

-- ============================================================
-- PARTIE 5 : Questions d'Anglais
-- ============================================================

INSERT INTO questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, subject, difficulty)
VALUES
('Quel est le présent continu de "eat" à la forme affirmative (I) ?',
 'qcm',
 'I eat',
 'I am eating',
 'I eating',
 'I eats',
 'B',
 'anglais',
 'facile'),

('Le prétérit de "go" est :',
 'qcm',
 'Goed',
 'Went',
 'Gone',
 'Going',
 'B',
 'anglais',
 'facile'),

('Quelle préposition utilise-t-on pour exprimer un lieu précis ?',
 'qcm',
 'In',
 'At',
 'On',
 'By',
 'B',
 'anglais',
 'moyen'),

('Le comparatif de "good" est :',
 'qcm',
 'Gooder',
 'More good',
 'Better',
 'Best',
 'C',
 'anglais',
 'moyen'),

('Present Perfect : forme correcte avec "I / finish" :',
 'qcm',
 'I have finished',
 'I has finished',
 'I finished',
 'I am finished',
 'A',
 'anglais',
 'moyen');

-- ============================================================
-- PARTIE 6 : Questions d'Histoire
-- ============================================================

INSERT INTO questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, subject, difficulty)
VALUES
('En quelle année Christophe Colomb découvre-t-il l''Amérique ?',
 'qcm',
 '1492',
 '1500',
 '1520',
 '1450',
 'A',
 'histoire',
 'facile'),

('La Première Guerre mondiale a commencé en :',
 'qcm',
 '1912',
 '1914',
 '1916',
 '1918',
 'B',
 'histoire',
 'facile'),

('Qui était le premier président de la France ?',
 'qcm',
 'Napoléon Bonaparte',
 'Louis-Napoléon Bonaparte',
 'Charles de Gaulle',
 'François Mitterrand',
 'B',
 'histoire',
 'difficile'),

('La Révolution française a débuté en :',
 'qcm',
 '1789',
 '1799',
 '1815',
 '1848',
 'A',
 'histoire',
 'moyen'),

('Le Mur de Berlin est tombé en :',
 'qcm',
 '1985',
 '1987',
 '1989',
 '1991',
 'C',
 'histoire',
 'moyen');

-- ============================================================
-- PARTIE 7 : Questions de Géographie
-- ============================================================

INSERT INTO questions (question_text, question_type, option_a, option_b, option_c, option_d, correct_option, subject, difficulty)
VALUES
('Quelle est la capitale de l''Allemagne ?',
 'qcm',
 'Munich',
 'Francfort',
 'Berlin',
 'Hambourg',
 'C',
 'geographie',
 'facile'),

('Le plus grand océan du monde est :',
 'qcm',
 'L''océan Atlantique',
 'L''océan Pacifique',
 'L''océan Indien',
 'L''océan Arctique',
 'B',
 'geographie',
 'facile'),

('Quel fleuve traverse Paris ?',
 'qcm',
 'La Loire',
 'La Seine',
 'Le Rhône',
 'La Garonne',
 'B',
 'geographie',
 'facile'),

('Combien y a-t-il de continents ?',
 'qcm',
 '5',
 '6',
 '7',
 '8',
 'C',
 'geographie',
 'facile'),

('Le plus haut sommet du monde est :',
 'qcm',
 'Le Mont Blanc',
 'Le Kilimandjaro',
 'L''Everest',
 'Le Mont McKinley',
 'C',
 'geographie',
 'moyen');

-- ============================================================
-- AFFICHAGE DU RÉSULTAT
-- ============================================================

DO $$
DECLARE
    questions_count INTEGER;
    math_count INTEGER;
    sciences_count INTEGER;
    physics_count INTEGER;
    francais_count INTEGER;
    anglais_count INTEGER;
    histoire_count INTEGER;
    geo_count INTEGER;
BEGIN
    -- Compter les questions
    SELECT COUNT(*) INTO questions_count FROM questions;
    SELECT COUNT(*) INTO math_count FROM questions WHERE subject = 'mathematiques';
    SELECT COUNT(*) INTO sciences_count FROM questions WHERE subject = 'sciences';
    SELECT COUNT(*) INTO physics_count FROM questions WHERE subject = 'physique_chimie';
    SELECT COUNT(*) INTO francais_count FROM questions WHERE subject = 'francais';
    SELECT COUNT(*) INTO anglais_count FROM questions WHERE subject = 'anglais';
    SELECT COUNT(*) INTO histoire_count FROM questions WHERE subject = 'histoire';
    SELECT COUNT(*) INTO geo_count FROM questions WHERE subject = 'geographie';
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ =============================================';
    RAISE NOTICE '✅ SEED QUESTIONS TERMINÉ AVEC SUCCÈS';
    RAISE NOTICE '✅ =============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 STATISTIQUES :';
    RAISE NOTICE '   • Total questions : % questions', questions_count;
    RAISE NOTICE '';
    RAISE NOTICE '📚 PAR MATIÈRE :';
    RAISE NOTICE '   • Mathématiques : % questions', math_count;
    RAISE NOTICE '   • Sciences (SVT) : % questions', sciences_count;
    RAISE NOTICE '   • Physique-Chimie : % questions', physics_count;
    RAISE NOTICE '   • Français : % questions', francais_count;
    RAISE NOTICE '   • Anglais : % questions', anglais_count;
    RAISE NOTICE '   • Histoire : % questions', histoire_count;
    RAISE NOTICE '   • Géographie : % questions', geo_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 NIVEAUX DE DIFFICULTÉ :';
    RAISE NOTICE '   • Facile : % questions', (SELECT COUNT(*) FROM questions WHERE difficulty = 'facile');
    RAISE NOTICE '   • Moyen : % questions', (SELECT COUNT(*) FROM questions WHERE difficulty = 'moyen');
    RAISE NOTICE '   • Difficile : % questions', (SELECT COUNT(*) FROM questions WHERE difficulty = 'difficile');
    RAISE NOTICE '';
    RAISE NOTICE '✨ Prêt pour les compétitions !';
    RAISE NOTICE '=============================================';
END $$;
