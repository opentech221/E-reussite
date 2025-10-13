-- Vérifier la structure de la table user_points
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_points'
ORDER BY ordinal_position;
