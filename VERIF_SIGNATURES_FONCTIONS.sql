-- =============================================
-- TEST ULTRA-SIMPLE: Juste les fonctions individuelles
-- =============================================

-- Pas besoin de vos IDs, on teste juste si les fonctions EXISTENT et ACCEPTENT les bons types

-- ====================================
-- TEST 1: check_and_award_badges existe ?
-- ====================================

SELECT 
    specific_name,
    parameter_name,
    data_type,
    ordinal_position
FROM information_schema.parameters
WHERE specific_schema = 'public'
  AND specific_name LIKE '%check_and_award_badges%'
ORDER BY ordinal_position;

-- Résultat attendu:
-- p_user_id → uuid
-- p_competition_id → uuid

-- ====================================
-- TEST 2: check_personal_record existe ?
-- ====================================

SELECT 
    specific_name,
    parameter_name,
    data_type,
    ordinal_position
FROM information_schema.parameters
WHERE specific_schema = 'public'
  AND specific_name LIKE '%check_personal_record%'
ORDER BY ordinal_position;

-- Résultat attendu:
-- p_user_id → uuid
-- p_competition_id → uuid
-- p_new_score → integer

-- ====================================
-- TEST 3: create_notification existe ?
-- ====================================

SELECT 
    specific_name,
    parameter_name,
    data_type,
    ordinal_position
FROM information_schema.parameters
WHERE specific_schema = 'public'
  AND specific_name LIKE '%create_notification%'
ORDER BY ordinal_position;

-- Résultat attendu:
-- p_user_id → uuid
-- p_type → character varying
-- p_title → text
-- p_body → text
-- p_competition_id → uuid
-- p_data → jsonb
-- p_scheduled_for → timestamp with time zone

-- ====================================
-- TEST 4: complete_competition_participant existe ?
-- ====================================

SELECT 
    specific_name,
    parameter_name,
    data_type,
    ordinal_position
FROM information_schema.parameters
WHERE specific_schema = 'public'
  AND specific_name LIKE '%complete_competition_participant%'
ORDER BY ordinal_position;

-- Résultat attendu:
-- p_participant_id → uuid

-- ====================================
-- ANALYSE
-- ====================================

-- Si TOUTES les fonctions ont les bons types (uuid, varchar, etc.),
-- alors le problème vient d'AILLEURS:
-- - Peut-être une ANCIENNE VERSION de la fonction encore en cache
-- - Ou un problème dans l'APPEL depuis JavaScript

-- ⚠️ SOLUTION: Réexécuter ADD_COMPETITIONS_NOTIFICATIONS_FUNCTIONS.sql
--             puis ADD_COMPETITIONS_FUNCTIONS.sql pour forcer la mise à jour
