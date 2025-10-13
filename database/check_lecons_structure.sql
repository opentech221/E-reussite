-- Vérifier la structure de la table lecons
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'lecons'
ORDER BY ordinal_position;
