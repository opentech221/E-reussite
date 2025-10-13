-- ⚡ CORRECTION RAPIDE : Niveau utilisateur
-- Copiez et exécutez dans SQL Editor de Supabase

-- 🔍 D'abord, voir la valeur actuelle (avec email depuis auth.users)
SELECT 
    up.id, 
    u.email,
    up.level, 
    up.full_name
FROM user_profiles up
LEFT JOIN auth.users u ON up.id = u.id
WHERE up.id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- 🔍 Voir tous les niveaux possibles dans user_profiles
SELECT DISTINCT level, COUNT(*) as count
FROM user_profiles
GROUP BY level
ORDER BY level;

-- 🔍 Vérifier la structure de la colonne level
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
  AND column_name = 'level';

-- 🔍 Voir les niveaux dans matieres (pour correspondance)
SELECT DISTINCT level
FROM matieres
ORDER BY level;

-- ⚠️ Attendez les résultats avant toute correction !
