-- Migration: Ajouter la colonne difficulty à la table quiz
-- Date: 5 octobre 2025
-- Description: Permet de stocker la difficulté des quiz (Facile, Moyen, Difficile)

-- Ajouter la colonne difficulty
ALTER TABLE quiz 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20);

-- Définir des valeurs par défaut pour les quiz existants
-- Basé sur le nombre de questions (logique temporaire)
UPDATE quiz q
SET difficulty = CASE
  WHEN (
    SELECT COUNT(*) 
    FROM quiz_questions qq 
    WHERE qq.quiz_id = q.id
  ) <= 5 THEN 'Facile'
  WHEN (
    SELECT COUNT(*) 
    FROM quiz_questions qq 
    WHERE qq.quiz_id = q.id
  ) <= 10 THEN 'Moyen'
  ELSE 'Difficile'
END
WHERE difficulty IS NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN quiz.difficulty IS 'Niveau de difficulté du quiz: Facile, Moyen, ou Difficile';
