-- 🎯 SEED QUIZ QUESTIONS - 75 questions pour 15 quiz
-- Date : 7 octobre 2025
-- Structure : 5 questions par quiz

-- ============================================================
-- QUIZ 1 : Théorème de Thalès (ID à récupérer)
-- ============================================================

-- Récupérer l'ID du quiz "Théorème de Thalès"
DO $$
DECLARE
    quiz_thales_id INT;
    quiz_equations_id INT;
    quiz_fonctions_id INT;
    quiz_cellule_id INT;
    quiz_reproduction_id INT;
    quiz_nutrition_id INT;
    quiz_conjugaison_id INT;
    quiz_figures_id INT;
    quiz_atomes_id INT;
    quiz_lumiere_id INT;
    quiz_present_id INT;
    quiz_past_id INT;
    quiz_decouvertes_id INT;
    quiz_colonisation_id INT;
    quiz_independances_id INT;
BEGIN
    -- Récupérer les IDs des quiz
    SELECT id INTO quiz_thales_id FROM quiz WHERE title = 'Quiz : Théorème de Thalès';
    SELECT id INTO quiz_equations_id FROM quiz WHERE title = 'Quiz : Équations du second degré';
    SELECT id INTO quiz_fonctions_id FROM quiz WHERE title = 'Quiz : Fonctions linéaires et affines';
    SELECT id INTO quiz_cellule_id FROM quiz WHERE title = 'Quiz : La cellule';
    SELECT id INTO quiz_reproduction_id FROM quiz WHERE title = 'Quiz : La reproduction';
    SELECT id INTO quiz_nutrition_id FROM quiz WHERE title = 'Quiz : La nutrition';
    SELECT id INTO quiz_conjugaison_id FROM quiz WHERE title = 'Quiz : La conjugaison';
    SELECT id INTO quiz_figures_id FROM quiz WHERE title = 'Quiz : Les figures de style';
    SELECT id INTO quiz_atomes_id FROM quiz WHERE title = 'Quiz : Les atomes';
    SELECT id INTO quiz_lumiere_id FROM quiz WHERE title = 'Quiz : La lumière';
    SELECT id INTO quiz_present_id FROM quiz WHERE title = 'Quiz : Present Tenses';
    SELECT id INTO quiz_past_id FROM quiz WHERE title = 'Quiz : Past Tenses';
    SELECT id INTO quiz_decouvertes_id FROM quiz WHERE title = 'Quiz : Les grandes découvertes';
    SELECT id INTO quiz_colonisation_id FROM quiz WHERE title = 'Quiz : La colonisation';
    SELECT id INTO quiz_independances_id FROM quiz WHERE title = 'Quiz : Les indépendances africaines';

    -- ============================================================
    -- QUIZ 1 : Théorème de Thalès (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_thales_id, 'Quelle est la condition principale pour appliquer le théorème de Thalès ?',
     '{"A": "Deux triangles superposés", "B": "Deux droites parallèles coupées par deux sécantes", "C": "Deux cercles concentriques", "D": "Deux angles égaux"}',
     'B'),
    
    (quiz_thales_id, 'Si (DE) // (BC) dans un triangle ABC, quelle égalité est vraie ?',
     '{"A": "AD/AB = AE/AC = DE/BC", "B": "AD + AE = AB + AC", "C": "AD × AB = AE × AC", "D": "AD - AB = AE - AC"}',
     'A'),
    
    (quiz_thales_id, 'Dans un triangle ABC, si AD/AB = 2/5 et AE/AC = 2/5, que peut-on conclure ?',
     '{"A": "(DE) et (BC) sont perpendiculaires", "B": "(DE) et (BC) sont parallèles", "C": "Le triangle est rectangle", "D": "Les points sont alignés"}',
     'B'),
    
    (quiz_thales_id, 'Si AB = 6 cm, AD = 4 cm et BC = 9 cm, avec (DE) // (BC), combien mesure DE ?',
     '{"A": "4 cm", "B": "5 cm", "C": "6 cm", "D": "7 cm"}',
     'C'),
    
    (quiz_thales_id, 'Le théorème de Thalès permet de calculer :',
     '{"A": "Des aires de triangles", "B": "Des longueurs dans des configurations de parallèles", "C": "Des angles dans un cercle", "D": "Des volumes de pyramides"}',
     'B');

    -- ============================================================
    -- QUIZ 2 : Équations du second degré (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_equations_id, 'Quelle est la forme générale d''une équation du second degré ?',
     '{"A": "ax + b = 0", "B": "ax² + bx + c = 0", "C": "ax³ + bx² + c = 0", "D": "ax² = b"}',
     'B'),
    
    (quiz_equations_id, 'Le discriminant Δ d''une équation ax² + bx + c = 0 est :',
     '{"A": "b² - 4ac", "B": "b² + 4ac", "C": "4ac - b²", "D": "b² - ac"}',
     'A'),
    
    (quiz_equations_id, 'Si Δ < 0, combien l''équation a-t-elle de solutions réelles ?',
     '{"A": "0 solution", "B": "1 solution", "C": "2 solutions", "D": "Infinité de solutions"}',
     'A'),
    
    (quiz_equations_id, 'Pour résoudre x² - 5x + 6 = 0, on peut factoriser en :',
     '{"A": "(x - 2)(x - 3)", "B": "(x + 2)(x + 3)", "C": "(x - 1)(x - 6)", "D": "(x + 1)(x + 6)"}',
     'A'),
    
    (quiz_equations_id, 'Si Δ = 0, l''équation a :',
     '{"A": "Deux solutions distinctes", "B": "Une solution double", "C": "Aucune solution", "D": "Trois solutions"}',
     'B');

    -- ============================================================
    -- QUIZ 3 : Fonctions linéaires et affines (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_fonctions_id, 'Une fonction linéaire a pour forme :',
     '{"A": "f(x) = ax + b", "B": "f(x) = ax", "C": "f(x) = ax² + b", "D": "f(x) = a/x"}',
     'B'),
    
    (quiz_fonctions_id, 'Le graphe d''une fonction affine est :',
     '{"A": "Une parabole", "B": "Un cercle", "C": "Une droite", "D": "Une hyperbole"}',
     'C'),
    
    (quiz_fonctions_id, 'Dans f(x) = 3x - 2, quel est le coefficient directeur ?',
     '{"A": "-2", "B": "3", "C": "3x", "D": "1"}',
     'B'),
    
    (quiz_fonctions_id, 'Si f(x) = 2x + 5, quelle est la valeur de f(3) ?',
     '{"A": "8", "B": "9", "C": "11", "D": "13"}',
     'C'),
    
    (quiz_fonctions_id, 'Une fonction linéaire passe toujours par :',
     '{"A": "Le point (1, 1)", "B": "L''origine (0, 0)", "C": "Le point (0, 1)", "D": "Le point (1, 0)"}',
     'B');

    -- ============================================================
    -- QUIZ 4 : La cellule (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_cellule_id, 'Quelle est l''unité de base de tous les êtres vivants ?',
     '{"A": "L''atome", "B": "La molécule", "C": "La cellule", "D": "Le tissu"}',
     'C'),
    
    (quiz_cellule_id, 'Quelle structure contient le matériel génétique de la cellule ?',
     '{"A": "Le cytoplasme", "B": "La membrane", "C": "Le noyau", "D": "La mitochondrie"}',
     'C'),
    
    (quiz_cellule_id, 'Les mitochondries sont responsables de :',
     '{"A": "La photosynthèse", "B": "La production d''énergie", "C": "La division cellulaire", "D": "La digestion"}',
     'B'),
    
    (quiz_cellule_id, 'Quelle est la différence principale entre cellule animale et végétale ?',
     '{"A": "La présence d''un noyau", "B": "La présence d''une paroi cellulaire", "C": "La taille", "D": "La forme"}',
     'B'),
    
    (quiz_cellule_id, 'La membrane plasmique permet :',
     '{"A": "Les échanges avec l''extérieur", "B": "La respiration", "C": "La reproduction", "D": "La croissance"}',
     'A');

    -- ============================================================
    -- QUIZ 5 : La reproduction (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_reproduction_id, 'Combien de chromosomes possède une cellule sexuelle humaine ?',
     '{"A": "46", "B": "23", "C": "92", "D": "12"}',
     'B'),
    
    (quiz_reproduction_id, 'La fécondation est la fusion de :',
     '{"A": "Deux cellules somatiques", "B": "Un spermatozoïde et un ovule", "C": "Deux ovules", "D": "Deux spermatozoïdes"}',
     'B'),
    
    (quiz_reproduction_id, 'La méiose produit :',
     '{"A": "2 cellules filles identiques", "B": "4 cellules filles haploïdes", "C": "8 cellules filles", "D": "1 cellule fille"}',
     'B'),
    
    (quiz_reproduction_id, 'Chez l''homme, les gamètes sont produits dans :',
     '{"A": "Le cœur", "B": "Les testicules", "C": "Les poumons", "D": "L''estomac"}',
     'B'),
    
    (quiz_reproduction_id, 'La gestation humaine dure environ :',
     '{"A": "6 mois", "B": "9 mois", "C": "12 mois", "D": "3 mois"}',
     'B');

    -- ============================================================
    -- QUIZ 6 : La nutrition (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_nutrition_id, 'Les glucides sont principalement utilisés pour :',
     '{"A": "Construire les muscles", "B": "Fournir de l''énergie", "C": "Transporter l''oxygène", "D": "Réguler la température"}',
     'B'),
    
    (quiz_nutrition_id, 'Quel organe produit la bile pour digérer les graisses ?',
     '{"A": "L''estomac", "B": "Le foie", "C": "Le pancréas", "D": "L''intestin"}',
     'B'),
    
    (quiz_nutrition_id, 'Les protéines sont composées de :',
     '{"A": "Acides gras", "B": "Acides aminés", "C": "Glucides", "D": "Vitamines"}',
     'B'),
    
    (quiz_nutrition_id, 'L''absorption des nutriments se fait principalement dans :',
     '{"A": "L''estomac", "B": "Le gros intestin", "C": "L''intestin grêle", "D": "L''œsophage"}',
     'C'),
    
    (quiz_nutrition_id, 'Quelle vitamine est essentielle pour la vision ?',
     '{"A": "Vitamine A", "B": "Vitamine C", "C": "Vitamine D", "D": "Vitamine K"}',
     'A');

    -- ============================================================
    -- QUIZ 7 : La conjugaison (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_conjugaison_id, 'Quel est l''infinitif du verbe "ils vont" ?',
     '{"A": "Venir", "B": "Aller", "C": "Voir", "D": "Faire"}',
     'B'),
    
    (quiz_conjugaison_id, 'Au présent, "je (finir) mon travail" devient :',
     '{"A": "Je fini", "B": "Je finit", "C": "Je finis", "D": "Je finissais"}',
     'C'),
    
    (quiz_conjugaison_id, 'Le passé simple de "nous (avoir)" est :',
     '{"A": "Nous avions", "B": "Nous eûmes", "C": "Nous avons eu", "D": "Nous aurions"}',
     'B'),
    
    (quiz_conjugaison_id, 'Au futur, "tu (être) sage" devient :',
     '{"A": "Tu seras", "B": "Tu serais", "C": "Tu es", "D": "Tu étais"}',
     'A'),
    
    (quiz_conjugaison_id, 'Quel temps utilise l''auxiliaire "avoir" ou "être" + participe passé ?',
     '{"A": "Le présent", "B": "L''imparfait", "C": "Le passé composé", "D": "Le futur"}',
     'C');

    -- ============================================================
    -- QUIZ 8 : Les figures de style (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_figures_id, '"Je suis mort de fatigue" est un exemple de :',
     '{"A": "Métaphore", "B": "Hyperbole", "C": "Personnification", "D": "Comparaison"}',
     'B'),
    
    (quiz_figures_id, 'Une comparaison utilise toujours :',
     '{"A": "Un adjectif", "B": "Un verbe", "C": "Un outil de comparaison (comme, tel que...)", "D": "Une négation"}',
     'C'),
    
    (quiz_figures_id, '"La ville dort paisiblement" est une :',
     '{"A": "Métaphore", "B": "Allitération", "C": "Personnification", "D": "Anaphore"}',
     'C'),
    
    (quiz_figures_id, 'La répétition d''un même mot en début de phrase s''appelle :',
     '{"A": "Anaphore", "B": "Métonymie", "C": "Euphémisme", "D": "Litote"}',
     'A'),
    
    (quiz_figures_id, '"Il n''est pas très intelligent" est un exemple de :',
     '{"A": "Hyperbole", "B": "Litote", "C": "Métaphore", "D": "Oxymore"}',
     'B');

    -- ============================================================
    -- QUIZ 9 : Les atomes (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_atomes_id, 'Quelle particule porte une charge positive ?',
     '{"A": "L''électron", "B": "Le proton", "C": "Le neutron", "D": "Le photon"}',
     'B'),
    
    (quiz_atomes_id, 'Le numéro atomique représente le nombre de :',
     '{"A": "Neutrons", "B": "Protons", "C": "Électrons + Protons", "D": "Nucléons"}',
     'B'),
    
    (quiz_atomes_id, 'Les électrons se trouvent :',
     '{"A": "Dans le noyau", "B": "Autour du noyau", "C": "Entre protons et neutrons", "D": "À l''extérieur de l''atome"}',
     'B'),
    
    (quiz_atomes_id, 'Un atome est électriquement neutre car :',
     '{"A": "Il n''a pas de charge", "B": "Protons = Électrons", "C": "Neutrons = Protons", "D": "Il n''a pas d''électrons"}',
     'B'),
    
    (quiz_atomes_id, 'La masse d''un atome est concentrée dans :',
     '{"A": "Les électrons", "B": "Le noyau", "C": "Les orbitales", "D": "Le cortège électronique"}',
     'B');

    -- ============================================================
    -- QUIZ 10 : La lumière (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_lumiere_id, 'La lumière se propage :',
     '{"A": "En ligne droite", "B": "En zigzag", "C": "En cercle", "D": "En spirale"}',
     'A'),
    
    (quiz_lumiere_id, 'La vitesse de la lumière dans le vide est environ :',
     '{"A": "300 m/s", "B": "3 000 km/s", "C": "300 000 km/s", "D": "3 000 000 km/s"}',
     'C'),
    
    (quiz_lumiere_id, 'Un prisme décompose la lumière blanche en :',
     '{"A": "Lumière noire", "B": "Spectre de couleurs", "C": "Ondes radio", "D": "Rayons X"}',
     'B'),
    
    (quiz_lumiere_id, 'Quand la lumière passe d''un milieu à un autre, elle subit :',
     '{"A": "Une réflexion", "B": "Une réfraction", "C": "Une diffraction", "D": "Une absorption"}',
     'B'),
    
    (quiz_lumiere_id, 'Les couleurs primaires de la lumière sont :',
     '{"A": "Rouge, jaune, bleu", "B": "Rouge, vert, bleu", "C": "Cyan, magenta, jaune", "D": "Noir, blanc, gris"}',
     'B');

    -- ============================================================
    -- QUIZ 11 : Present Tenses (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_present_id, 'What is the correct form: "She ___ to school every day"?',
     '{"A": "go", "B": "goes", "C": "going", "D": "gone"}',
     'B'),
    
    (quiz_present_id, 'Which sentence is in present continuous?',
     '{"A": "I read books", "B": "I am reading a book", "C": "I have read a book", "D": "I will read a book"}',
     'B'),
    
    (quiz_present_id, '"They ___ playing football now" - Fill in the blank:',
     '{"A": "is", "B": "am", "C": "are", "D": "be"}',
     'C'),
    
    (quiz_present_id, 'Present simple is used for:',
     '{"A": "Habits and routines", "B": "Actions happening now", "C": "Future plans", "D": "Past events"}',
     'A'),
    
    (quiz_present_id, 'What is the negative form of "He likes pizza"?',
     '{"A": "He not likes pizza", "B": "He doesn''t like pizza", "C": "He don''t like pizza", "D": "He isn''t like pizza"}',
     'B');

    -- ============================================================
    -- QUIZ 12 : Past Tenses (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_past_id, 'What is the past simple of "go"?',
     '{"A": "goed", "B": "went", "C": "gone", "D": "going"}',
     'B'),
    
    (quiz_past_id, 'Which sentence is in past continuous?',
     '{"A": "I watched TV", "B": "I was watching TV", "C": "I have watched TV", "D": "I watch TV"}',
     'B'),
    
    (quiz_past_id, '"Yesterday, she ___ to the market" - Complete:',
     '{"A": "go", "B": "goes", "C": "went", "D": "gone"}',
     'C'),
    
    (quiz_past_id, 'Past perfect uses:',
     '{"A": "had + past participle", "B": "have + past participle", "C": "was + verb-ing", "D": "did + verb"}',
     'A'),
    
    (quiz_past_id, 'What is the negative form of "They played"?',
     '{"A": "They not played", "B": "They didn''t play", "C": "They don''t played", "D": "They wasn''t played"}',
     'B');

    -- ============================================================
    -- QUIZ 13 : Les grandes découvertes (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_decouvertes_id, 'Qui a découvert l''Amérique en 1492 ?',
     '{"A": "Vasco de Gama", "B": "Christophe Colomb", "C": "Magellan", "D": "Marco Polo"}',
     'B'),
    
    (quiz_decouvertes_id, 'Le premier navigateur à faire le tour du monde était :',
     '{"A": "Christophe Colomb", "B": "Vasco de Gama", "C": "Fernand de Magellan", "D": "Jacques Cartier"}',
     'C'),
    
    (quiz_decouvertes_id, 'Vasco de Gama a découvert la route maritime vers :',
     '{"A": "L''Amérique", "B": "Les Indes", "C": "La Chine", "D": "L''Australie"}',
     'B'),
    
    (quiz_decouvertes_id, 'Les grandes découvertes ont eu lieu principalement au :',
     '{"A": "XIIIe siècle", "B": "XVe-XVIe siècles", "C": "XVIIe siècle", "D": "XIXe siècle"}',
     'B'),
    
    (quiz_decouvertes_id, 'Quel pays a dominé les explorations au XVe siècle ?',
     '{"A": "La France", "B": "L''Angleterre", "C": "Le Portugal", "D": "L''Espagne"}',
     'C');

    -- ============================================================
    -- QUIZ 14 : La colonisation (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_colonisation_id, 'La conférence de Berlin (1884-1885) a organisé :',
     '{"A": "L''indépendance de l''Afrique", "B": "Le partage de l''Afrique", "C": "La traite des esclaves", "D": "La décolonisation"}',
     'B'),
    
    (quiz_colonisation_id, 'Quel était le principal motif de la colonisation ?',
     '{"A": "Humanitaire", "B": "Économique et politique", "C": "Touristique", "D": "Religieux uniquement"}',
     'B'),
    
    (quiz_colonisation_id, 'L''AOF (Afrique Occidentale Française) regroupait :',
     '{"A": "2 colonies", "B": "5 colonies", "C": "8 colonies", "D": "12 colonies"}',
     'C'),
    
    (quiz_colonisation_id, 'La colonisation française en Afrique a commencé principalement au :',
     '{"A": "XVIIe siècle", "B": "XVIIIe siècle", "C": "XIXe siècle", "D": "XXe siècle"}',
     'C'),
    
    (quiz_colonisation_id, 'Le système colonial reposait sur :',
     '{"A": "L''égalité des peuples", "B": "L''exploitation des ressources", "C": "Le partage des richesses", "D": "L''autonomie locale"}',
     'B');

    -- ============================================================
    -- QUIZ 15 : Les indépendances africaines (5 questions)
    -- ============================================================
    
    INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES
    (quiz_independances_id, 'En quelle année le Sénégal a-t-il obtenu son indépendance ?',
     '{"A": "1958", "B": "1960", "C": "1962", "D": "1965"}',
     'B'),
    
    (quiz_independances_id, 'Qui était le premier président du Sénégal indépendant ?',
     '{"A": "Léopold Sédar Senghor", "B": "Abdou Diouf", "C": "Abdoulaye Wade", "D": "Macky Sall"}',
     'A'),
    
    (quiz_independances_id, 'L''année 1960 est surnommée :',
     '{"A": "L''année des révolutions", "B": "L''année des indépendances", "C": "L''année de la liberté", "D": "L''année africaine"}',
     'B'),
    
    (quiz_independances_id, 'Combien de pays africains ont accédé à l''indépendance en 1960 ?',
     '{"A": "7", "B": "11", "C": "17", "D": "23"}',
     'C'),
    
    (quiz_independances_id, 'Le mouvement de la Négritude a été créé par :',
     '{"A": "Nelson Mandela", "B": "Kwame Nkrumah", "C": "Léopold Sédar Senghor et Aimé Césaire", "D": "Patrice Lumumba"}',
     'C');

END $$;

-- ============================================================
-- VÉRIFICATION
-- ============================================================

-- Compter le nombre total de questions
SELECT COUNT(*) as total_questions FROM quiz_questions;

-- Voir la répartition des questions par quiz
SELECT 
    q.title,
    COUNT(qq.id) as nb_questions
FROM quiz q
LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
GROUP BY q.id, q.title
ORDER BY q.title;

-- Voir toutes les questions avec leurs quiz
SELECT 
    q.title as quiz,
    qq.question,
    qq.correct_option
FROM quiz_questions qq
JOIN quiz q ON q.id = qq.quiz_id
ORDER BY q.title, qq.id;

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================

/*
Après exécution :
✅ 75 questions créées (5 par quiz × 15 quiz)
✅ Répartition :
   - Quiz : Théorème de Thalès (5 questions)
   - Quiz : Équations du second degré (5 questions)
   - Quiz : Fonctions linéaires et affines (5 questions)
   - Quiz : La cellule (5 questions)
   - Quiz : La reproduction (5 questions)
   - Quiz : La nutrition (5 questions)
   - Quiz : La conjugaison (5 questions)
   - Quiz : Les figures de style (5 questions)
   - Quiz : Les atomes (5 questions)
   - Quiz : La lumière (5 questions)
   - Quiz : Present Tenses (5 questions)
   - Quiz : Past Tenses (5 questions)
   - Quiz : Les grandes découvertes (5 questions)
   - Quiz : La colonisation (5 questions)
   - Quiz : Les indépendances africaines (5 questions)

La page /quiz affichera maintenant :
- "15 Quiz disponibles"
- "75 Questions au total" (au lieu de 0)
- Les quiz seront fonctionnels et pourront être complétés !
*/
