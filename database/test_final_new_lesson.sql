-- ============================================
-- Test final : Compléter une nouvelle leçon
-- ============================================

-- Étape 1 : Trouvez des leçons non complétées
SELECT 
  l.id as lecon_id,
  l.title as lecon_titre,
  c.title as chapitre,
  m.name as matiere
FROM lecons l
JOIN chapitres c ON c.id = l.chapitre_id
JOIN matieres m ON m.id = c.matiere_id
LEFT JOIN user_progression up ON up.lecon_id = l.id 
  AND up.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID
WHERE up.id IS NULL
ORDER BY m.name, c.id, l."order"
LIMIT 10;

-- Copiez un lecon_id de la liste ci-dessus


-- Étape 2 : Testez la fonction avec ce lecon_id
-- REMPLACEZ 999 par le vrai lecon_id de l'étape 1
SELECT * FROM award_lesson_completion_points(
  'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID,
  30  -- REMPLACEZ CE NOMBRE
);


-- Étape 3 : Vérifiez l'historique
SELECT 
  points_earned,
  action_type,
  action_details,
  created_at
FROM user_points_history
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID
ORDER BY created_at DESC
LIMIT 5;


-- Étape 4 : Vérifiez le total
SELECT 
  total_points,
  level,
  lessons_completed,
  current_streak
FROM user_points
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::UUID;
