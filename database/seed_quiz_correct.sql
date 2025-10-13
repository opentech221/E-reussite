-- 🎯 SEED QUIZ - Structure correcte
-- Date : 7 octobre 2025
-- Objectif : Créer des quiz de test avec la bonne structure

-- La table quiz a seulement 4 colonnes :
-- - id (integer, auto-increment)
-- - chapitre_id (integer)
-- - title (text)
-- - difficulty (varchar)

-- ============================================================
-- CRÉER 10 QUIZ DE TEST
-- ============================================================

-- Quiz 1 : Mathématiques BFEM - Théorème de Thalès
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (43, 'Quiz : Théorème de Thalès', 'medium');

-- Quiz 2 : Mathématiques BFEM - Équations du second degré
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (44, 'Quiz : Équations du second degré', 'hard');

-- Quiz 3 : Mathématiques BFEM - Fonctions linéaires et affines
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (45, 'Quiz : Fonctions linéaires et affines', 'medium');

-- Quiz 4 : SVT BFEM - La cellule
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (54, 'Quiz : La cellule', 'easy');

-- Quiz 5 : SVT BFEM - La reproduction
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (55, 'Quiz : La reproduction', 'medium');

-- Quiz 6 : SVT BFEM - La nutrition
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (56, 'Quiz : La nutrition', 'easy');

-- Quiz 7 : Français BFEM - La conjugaison
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (46, 'Quiz : La conjugaison', 'medium');

-- Quiz 8 : Français BFEM - Les figures de style
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (48, 'Quiz : Les figures de style', 'medium');

-- Quiz 9 : Physique-Chimie BFEM - Les atomes
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (53, 'Quiz : Les atomes', 'hard');

-- Quiz 10 : Physique-Chimie BFEM - La lumière
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (52, 'Quiz : La lumière', 'easy');

-- Quiz 11 : Anglais BFEM - Present Tenses
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (49, 'Quiz : Present Tenses', 'easy');

-- Quiz 12 : Anglais BFEM - Past Tenses
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (50, 'Quiz : Past Tenses', 'medium');

-- Quiz 13 : Histoire-Géo BFEM - Les grandes découvertes
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (58, 'Quiz : Les grandes découvertes', 'medium');

-- Quiz 14 : Histoire-Géo BFEM - La colonisation
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (57, 'Quiz : La colonisation', 'hard');

-- Quiz 15 : Histoire-Géo BFEM - Les indépendances africaines
INSERT INTO quiz (chapitre_id, title, difficulty)
VALUES (59, 'Quiz : Les indépendances africaines', 'hard');

-- ============================================================
-- VÉRIFICATION
-- ============================================================

-- Compter le nombre total de quiz
SELECT COUNT(*) as total_quiz FROM quiz;

-- Voir tous les quiz créés avec leurs chapitres
SELECT 
  q.id,
  q.title,
  q.difficulty,
  c.title as chapitre_title,
  m.name as matiere_name
FROM quiz q
LEFT JOIN chapitres c ON c.id = q.chapitre_id
LEFT JOIN matieres m ON m.id = c.matiere_id
ORDER BY m.name, c.title;

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================

/*
Après exécution, vous devriez avoir :
- 15 quiz créés
- Répartis sur différentes matières BFEM :
  * Mathématiques (3 quiz)
  * SVT (3 quiz)
  * Français (2 quiz)
  * Physique-Chimie (2 quiz)
  * Anglais (2 quiz)
  * Histoire-Géographie (3 quiz)

La page http://localhost:3000/quiz devrait afficher :
- "15 Quiz disponibles"
- Liste des quiz par matière
- Bouton "Commencer" pour chaque quiz
*/
