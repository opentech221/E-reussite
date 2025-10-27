-- =============================================
-- DIAGNOSTIC: Erreur "operator does not exist: character varying = uuid"
-- =============================================

-- 1️⃣ Vérifier les types de colonnes dans user_badges
SELECT 
    column_name,
    data_type,
    udt_name,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_badges'
ORDER BY ordinal_position;

-- 2️⃣ Vérifier les types de colonnes dans competition_badges
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'competition_badges'
ORDER BY ordinal_position;

-- 3️⃣ Vérifier les types de colonnes dans competition_notifications
SELECT 
    column_name,
    data_type,
    udt_name,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'competition_notifications'
ORDER BY ordinal_position;

-- 4️⃣ Vérifier la signature de check_and_award_badges
SELECT 
    specific_name,
    parameter_name,
    data_type,
    ordinal_position
FROM information_schema.parameters
WHERE specific_schema = 'public'
  AND specific_name = 'check_and_award_badges'
ORDER BY ordinal_position;

-- 5️⃣ Vérifier la signature de create_notification
SELECT 
    specific_name,
    parameter_name,
    data_type,
    ordinal_position
FROM information_schema.parameters
WHERE specific_schema = 'public'
  AND specific_name = 'create_notification'
ORDER BY ordinal_position;

-- ====================================
-- RÉSULTATS ATTENDUS
-- ====================================

/*
user_badges.badge_id doit être: uuid
competition_badges.id doit être: uuid  
competition_notifications.competition_id doit être: uuid

Si user_badges.badge_id est VARCHAR → C'EST LE BUG !
*/
