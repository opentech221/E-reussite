-- 🔍 DIAGNOSTIC COMPLET - Dashboard Vide
-- Date : 7 octobre 2025
-- But : Identifier pourquoi les onglets affichent des données vides

-- ============================================================
-- 1. VÉRIFIER LES DONNÉES user_points
-- ============================================================

SELECT 
    user_id,
    total_points,
    level,
    current_streak,
    longest_streak,
    updated_at
FROM user_points
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- ============================================================
-- 2. VÉRIFIER LES CHAPITRES COMPLÉTÉS
-- ============================================================

SELECT 
    COUNT(*) as total_progress_entries,
    SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_chapters,
    SUM(CASE WHEN completed THEN time_spent ELSE 0 END) as total_time_spent_seconds,
    ROUND(SUM(CASE WHEN completed THEN time_spent ELSE 0 END) / 3600.0, 1) as total_hours
FROM user_progress
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- ============================================================
-- 3. DÉTAIL DES CHAPITRES COMPLÉTÉS
-- ============================================================

SELECT 
    c.title as chapitre,
    up.completed,
    up.time_spent as seconds,
    ROUND(up.time_spent / 60.0, 1) as minutes,
    up.progress_percentage,
    up.completed_at
FROM user_progress up
JOIN chapitres c ON c.id = up.chapitre_id
WHERE up.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
AND up.completed = true
ORDER BY up.completed_at DESC;

-- ============================================================
-- 4. VÉRIFIER LES BADGES
-- ============================================================

SELECT 
    COUNT(*) as total_badges
FROM user_badges
WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097';

-- Voir les badges récents (si la table existe)
SELECT 
    ub.id,
    ub.earned_at,
    ub.badge_icon,
    ub.badge_name
FROM user_badges ub
WHERE ub.user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
ORDER BY ub.earned_at DESC
LIMIT 5;

-- ============================================================
-- 5. CALCULER LE TEMPS ESTIMÉ (30 MIN PAR CHAPITRE)
-- ============================================================

WITH estimated_time AS (
    SELECT 
        user_id,
        COUNT(*) as completed_count,
        -- Si time_spent = 0, estimer 30 min (1800 secondes)
        SUM(CASE 
            WHEN time_spent = 0 AND completed THEN 1800 
            ELSE time_spent 
        END) as total_seconds,
        ROUND(SUM(CASE 
            WHEN time_spent = 0 AND completed THEN 1800 
            ELSE time_spent 
        END) / 3600.0, 1) as total_hours
    FROM user_progress
    WHERE user_id = 'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'
    AND completed = true
    GROUP BY user_id
)
SELECT 
    completed_count as chapitres_completes,
    total_seconds,
    total_hours,
    CASE 
        WHEN total_hours >= 8 THEN '✅ Objectif atteint!'
        ELSE '⏳ ' || (8 - total_hours) || 'h restantes'
    END as status_objectif
FROM estimated_time;

-- ============================================================
-- RÉSULTAT ATTENDU
-- ============================================================

/*
SECTION 1 : user_points
- total_points: 2120 (après avoir réclamé le challenge)
- level: 5
- current_streak: 0 ou plus
- longest_streak: 0 ou plus

SECTION 2 : Statistiques globales
- total_progress_entries: 10 ou plus
- completed_chapters: 10
- total_time_spent_seconds: 0 (tous à 0)
- total_hours: 0.0

SECTION 3 : Détail des chapitres
- 10 lignes affichées
- time_spent: 0 pour chacun
- completed: true pour chacun

SECTION 4 : Badges
- Peut être vide si aucun badge gagné

SECTION 5 : Temps estimé (avec correction)
- chapitres_completes: 10
- total_seconds: 18000 (10 × 1800)
- total_hours: 5.0
- status_objectif: "⏳ 3h restantes"

Si SECTION 5 affiche 5.0 heures mais Dashboard affiche 0h, 
alors le problème est dans le chargement des données frontend.
*/
