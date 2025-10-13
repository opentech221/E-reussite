-- Vérifier la structure de la table user_progression
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_progression'
ORDER BY ordinal_position;
