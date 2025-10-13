-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INSPECTION SIMPLE DES DONNÉES EXISTANTES
-- Version sécurisée - Ne cause pas d'erreurs
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- 1. VÉRIFIER L'EXISTENCE DES TABLES
-- ============================================================================

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'user_badges' THEN '⚠️ CONFLIT DÉTECTÉ'
        WHEN table_name = 'user_points' THEN '⚠️ Table existe déjà'
        WHEN table_name = 'user_progress' THEN '⚠️ Table existe déjà'
        ELSE '✅ OK'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN ('user_badges', 'user_points', 'user_progress', 'badges')
ORDER BY table_name;

-- ============================================================================
-- 2. COMPTER LES BADGES EXISTANTS (question clé!)
-- ============================================================================

-- Cette requête est CRITIQUE pour choisir Option A ou B
SELECT COUNT(*) as total_badges_attribues 
FROM public.user_badges;

-- ============================================================================
-- 3. VOIR LA STRUCTURE DE user_badges
-- ============================================================================

SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_badges'
ORDER BY ordinal_position;

-- ============================================================================
-- 4. VOIR QUELQUES EXEMPLES DE BADGES
-- ============================================================================

SELECT * FROM public.user_badges LIMIT 5;

-- ============================================================================
-- 5. VÉRIFIER SI LA TABLE badges EXISTE
-- ============================================================================

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'badges'
) as table_badges_existe;

-- Si TRUE, voir les badges disponibles:
-- SELECT * FROM public.badges LIMIT 10;

-- ============================================================================
-- INTERPRÉTATION DES RÉSULTATS
-- ============================================================================

-- Regardez le résultat de la requête 2 (total_badges_attribues):
--
-- Si le résultat est 0, 1, 2... 9:
--   → Utilisez OPTION B (003_gamification_OPTION_B_DROP_AND_CREATE.sql)
--   → C'est plus simple et vous n'avez presque rien à perdre
--
-- Si le résultat est 10, 20, 50, 100+:
--   → Utilisez OPTION A (003_gamification_OPTION_A_MIGRATION.sql)
--   → Vos utilisateurs ont déjà gagné des badges, il faut les préserver
--
-- Pas sûr? Partagez-moi le nombre et je vous conseillerai.

-- ============================================================================
-- FIN DE L'INSPECTION
-- ============================================================================
