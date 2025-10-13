-- Vérifier les données dans user_progress pour l'utilisateur
SELECT 
    up.user_id,
    up.chapitre_id,
    up.completed,
    c.nom as chapitre_nom,
    c.matiere_id,
    m.nom as matiere_nom
FROM user_progress up
LEFT JOIN chapitres c ON c.id = up.chapitre_id
LEFT JOIN matieres m ON m.id = c.matiere_id
WHERE up.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
AND up.completed = true
ORDER BY up.completed_at DESC
LIMIT 20;

-- Vérifier le nombre total
SELECT 
    COUNT(*) as total_completed,
    COUNT(DISTINCT chapitre_id) as unique_chapters,
    COUNT(DISTINCT c.matiere_id) as unique_matieres
FROM user_progress up
LEFT JOIN chapitres c ON c.id = up.chapitre_id
WHERE up.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
AND up.completed = true;
