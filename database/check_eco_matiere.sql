-- Vérifier si Sciences Économiques BAC existe
SELECT id, name, level 
FROM matieres 
WHERE level = 'bac' 
  AND (name LIKE '%Économique%' OR name LIKE '%Economique%' OR name LIKE '%Éco%');

-- Si aucun résultat, la matière n'existe pas et les examens d'éco ne seront pas insérés
