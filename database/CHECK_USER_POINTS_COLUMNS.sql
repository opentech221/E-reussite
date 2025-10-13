-- ============================================================================
-- VÉRIFIER LA STRUCTURE DE LA TABLE user_points
-- Date: 10 octobre 2025
-- ============================================================================

-- Voir toutes les colonnes de user_points
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('user_id', 'total_points', 'level', 'current_streak', 'longest_streak') THEN '✅ Requis'
        WHEN column_name IN ('points_to_next_level', 'last_activity_date') THEN '⚠️ Utilisé par trigger'
        WHEN column_name IN ('lessons_completed', 'chapters_completed', 'courses_completed') THEN '📊 Stats progression'
        ELSE '❓ Autre'
    END as usage
FROM information_schema.columns
WHERE table_name = 'user_points'
ORDER BY ordinal_position;

-- Comparer avec ce que le trigger essaie d'insérer
SELECT '🔍 Le trigger insert ces colonnes:' as info;
SELECT 'user_id, total_points, level, points_to_next_level, current_streak, longest_streak, last_activity_date' as colonnes_trigger;

SELECT '📋 Colonnes actuelles dans user_points:' as info;
SELECT STRING_AGG(column_name, ', ' ORDER BY ordinal_position) as colonnes_existantes
FROM information_schema.columns
WHERE table_name = 'user_points';
