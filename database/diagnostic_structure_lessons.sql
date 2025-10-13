-- 🔍 DIAGNOSTIC - Structure leçons et chapitres
-- Date : 7 octobre 2025
-- But : Comprendre la relation entre chapitres et leçons

-- ============================================================
-- 1. VÉRIFIER SI LA TABLE lecons EXISTE ET SA STRUCTURE
-- ============================================================

SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('lecons', 'lessons', 'chapitres')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================================
-- 2. VÉRIFIER NOS DONNÉES user_progress
-- ============================================================

SELECT 
    up.id,
    up.user_id,
    up.chapitre_id,
    c.title as chapitre_title,
    up.completed,
    up.time_spent,
    up.completed_at
FROM user_progress up
JOIN chapitres c ON c.id = up.chapitre_id
WHERE up.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
AND up.completed = true
ORDER BY up.completed_at DESC
LIMIT 10;

-- ============================================================
-- 3. VÉRIFIER SI DES LEÇONS EXISTENT POUR CES CHAPITRES
-- ============================================================

-- Si la table lecons existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lecons') THEN
        RAISE NOTICE 'Table lecons existe';
        
        -- Compter les leçons par chapitre
        PERFORM * FROM (
            SELECT 
                c.id,
                c.title as chapitre,
                COUNT(l.id) as nombre_lecons
            FROM chapitres c
            LEFT JOIN lecons l ON l.chapitre_id = c.id
            WHERE c.id IN (
                SELECT DISTINCT chapitre_id 
                FROM user_progress 
                WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
                AND completed = true
            )
            GROUP BY c.id, c.title
        ) sub;
    ELSE
        RAISE NOTICE 'Table lecons n existe pas';
    END IF;
END $$;

-- ============================================================
-- 4. ALTERNATIVE : Vérifier chapitres et matières
-- ============================================================

SELECT 
    m.id as matiere_id,
    m.name as matiere,
    m.level,
    COUNT(DISTINCT c.id) as total_chapitres,
    COUNT(DISTINCT CASE WHEN up.completed THEN c.id END) as chapitres_completes,
    ROUND(
        COUNT(DISTINCT CASE WHEN up.completed THEN c.id END)::numeric / 
        NULLIF(COUNT(DISTINCT c.id), 0) * 100, 
        1
    ) as pourcentage_progression
FROM matieres m
LEFT JOIN chapitres c ON c.matiere_id = m.id
LEFT JOIN user_progress up ON up.chapitre_id = c.id 
    AND up.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
WHERE m.level = 'bfem' -- Ajuster selon le niveau de l'utilisateur
GROUP BY m.id, m.name, m.level
HAVING COUNT(DISTINCT c.id) > 0
ORDER BY pourcentage_progression DESC NULLS LAST;

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================

/*
SECTION 1 : Structure des tables
- Voir les colonnes de 'chapitres' et 'lecons' (si elle existe)
- Identifier la clé étrangère entre les deux

SECTION 2 : user_progress actuel
- 10 chapitres complétés
- Tous avec completed = true

SECTION 3 : Leçons par chapitre
- Si table lecons existe, voir combien par chapitre
- Si elle n'existe pas, expliquer le problème

SECTION 4 : Progression par matière (ALTERNATIVE)
- Calculer directement à partir de user_progress + chapitres
- Sans passer par la table lecons
*/
