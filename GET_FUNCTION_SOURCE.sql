-- =============================================
-- RÉCUPÉRER LE CODE SOURCE DES FONCTIONS
-- =============================================

-- 1️⃣ Vérifier le code source de complete_competition_participant
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'complete_competition_participant';

-- 2️⃣ Vérifier le code source de check_and_award_badges
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'check_and_award_badges';

-- 3️⃣ Vérifier le code source de create_notification
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_notification';

-- 4️⃣ Vérifier le code source de check_personal_record
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'check_personal_record';

-- ====================================
-- CHERCHER LA LIGNE PROBLÉMATIQUE
-- ====================================

-- 5️⃣ Cette requête va chercher toutes les fonctions qui contiennent
--    une comparaison potentiellement problématique
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_definition LIKE '%badge_id%=%'
    OR routine_definition LIKE '%competition_id%=%'
  )
ORDER BY routine_name;
