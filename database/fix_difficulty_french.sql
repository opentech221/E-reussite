-- 🔧 CORRECTION DIFFICULTÉ EN FRANÇAIS
-- Date : 7 octobre 2025
-- Objectif : Convertir les difficultés de l'anglais vers le français

-- ============================================================
-- METTRE À JOUR LES DIFFICULTÉS EN FRANÇAIS
-- ============================================================

-- Convertir 'easy' → 'Facile'
UPDATE quiz 
SET difficulty = 'Facile' 
WHERE difficulty = 'easy';

-- Convertir 'medium' → 'Moyen'
UPDATE quiz 
SET difficulty = 'Moyen' 
WHERE difficulty = 'medium';

-- Convertir 'hard' → 'Difficile'
UPDATE quiz 
SET difficulty = 'Difficile'
WHERE difficulty = 'hard';

-- ============================================================
-- VÉRIFICATION
-- ============================================================

-- Compter les quiz par niveau de difficulté
SELECT 
    difficulty,
    COUNT(*) as nombre_quiz
FROM quiz
GROUP BY difficulty
ORDER BY 
    CASE difficulty
        WHEN 'Facile' THEN 1
        WHEN 'Moyen' THEN 2
        WHEN 'Difficile' THEN 3
        ELSE 4
    END;

-- Liste complète des quiz avec leur difficulté
SELECT 
    id,
    title,
    difficulty
FROM quiz
ORDER BY difficulty, title;

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================

/*
Après exécution :

✅ Niveau "Facile" : 4 quiz
   - Quiz : La cellule
   - Quiz : La nutrition
   - Quiz : La lumière
   - Quiz : Present Tenses

✅ Niveau "Moyen" : 7 quiz
   - Quiz : Théorème de Thalès
   - Quiz : Fonctions linéaires et affines
   - Quiz : La reproduction
   - Quiz : La conjugaison
   - Quiz : Les figures de style
   - Quiz : Past Tenses
   - Quiz : Les grandes découvertes

✅ Niveau "Difficile" : 4 quiz
   - Quiz : Équations du second degré
   - Quiz : Les atomes
   - Quiz : La colonisation
   - Quiz : Les indépendances africaines

Les badges sur les cartes et dans les quiz afficheront maintenant :
- Badge VERT : "Facile"
- Badge JAUNE : "Moyen"
- Badge ROUGE : "Difficile"
*/
