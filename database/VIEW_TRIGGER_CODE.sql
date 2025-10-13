-- ============================================================================
-- VOIR LE CODE COMPLET DE LA FONCTION handle_new_user
-- ============================================================================

SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user';
