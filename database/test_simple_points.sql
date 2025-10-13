-- ============================================
-- TEST SIMPLE - Points d'apprentissage
-- ============================================
-- Copiez-collez ces requêtes une par une dans l'éditeur SQL de Supabase

-- ÉTAPE 1 : Vérifier votre user_id
-- Exécutez cette requête pour obtenir votre UUID
SELECT auth.uid() as mon_user_id;
-- Résultat : UUID de votre compte
-- Copiez cet UUID pour les étapes suivantes


-- ÉTAPE 2 : Vérifier qu'il y a des leçons dans la base
SELECT 
  l.id as lecon_id,
  l.title as lecon_titre,
  c.title as chapitre,
  m.name as matiere
FROM lecons l
JOIN chapitres c ON c.id = l.chapitre_id
JOIN matieres m ON m.id = c.matiere_id
ORDER BY m.name, c.id, l."order"
LIMIT 5;
-- Résultat : Liste de 5 leçons avec leurs IDs
-- Notez un lecon_id pour l'étape suivante


-- ÉTAPE 3 : Tester la fonction d'attribution de points
-- Remplacez 'VOTRE_UUID_ICI' par l'UUID obtenu à l'étape 1
-- Remplacez 1 par un lecon_id obtenu à l'étape 2
SELECT * FROM award_lesson_completion_points(
  'VOTRE_UUID_ICI'::UUID,
  1
);
-- Résultat attendu :
-- points_earned  | chapter_bonus | course_bonus | total_points | chapter_completed | course_completed
-- 10             | 0 ou 50       | 0 ou 200     | 10+          | false ou true     | false ou true


-- ÉTAPE 4A : Vérifier l'historique détaillé
-- Remplacez 'VOTRE_UUID_ICI' par votre UUID
SELECT 
  points_earned,
  action_type,
  action_details,
  created_at
FROM user_points_history
WHERE user_id = 'VOTRE_UUID_ICI'::UUID
ORDER BY created_at DESC
LIMIT 10;
-- Résultat : Devrait montrer +10 points dans action_type 'lesson_completed'
-- Si bonus : +50 'chapter_completed' ou +200 'course_completed'


-- ÉTAPE 4B : Vérifier le total des points
-- Remplacez 'VOTRE_UUID_ICI' par votre UUID
SELECT 
  total_points,
  level,
  lessons_completed,
  current_streak
FROM user_points
WHERE user_id = 'VOTRE_UUID_ICI'::UUID;
-- Résultat : total_points devrait augmenter, lessons_completed +1


-- ÉTAPE 5 : Vérifier vos statistiques d'apprentissage
-- Remplacez 'VOTRE_UUID_ICI' par votre UUID
SELECT * FROM get_user_learning_stats('VOTRE_UUID_ICI'::UUID);
-- Résultat : Statistiques complètes de votre progression


-- ============================================
-- EXEMPLE COMPLET AVEC UN VRAI UUID
-- ============================================
-- Si votre UUID est par exemple : 'b8fe56ad-1234-5678-90ab-cdef12345678'
-- Et que vous voulez tester avec la leçon ID 5 :

/*
-- Test de la fonction
SELECT * FROM award_lesson_completion_points(
  'b8fe56ad-1234-5678-90ab-cdef12345678'::UUID,
  5
);

-- Vérifier l'historique
SELECT points_earned, action_type, action_details, created_at
FROM user_points_history
WHERE user_id = 'b8fe56ad-1234-5678-90ab-cdef12345678'::UUID
ORDER BY created_at DESC
LIMIT 5;

-- Vérifier le total
SELECT total_points, level, lessons_completed, current_streak
FROM user_points
WHERE user_id = 'b8fe56ad-1234-5678-90ab-cdef12345678'::UUID;
*/
