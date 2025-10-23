-- Migration pour corriger le schéma de base de données
-- Date: 2025-10-23
-- Description: Ajoute les colonnes manquantes et corrige les relations

-- ============================================
-- 1. Ajouter created_at et updated_at à user_progress
-- ============================================
DO $$ 
BEGIN
    -- Ajouter created_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE user_progress 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        
        COMMENT ON COLUMN user_progress.created_at IS 'Date de création de la progression';
    END IF;

    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_progress 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        COMMENT ON COLUMN user_progress.updated_at IS 'Date de dernière mise à jour';
    END IF;
END $$;

-- Créer un trigger pour mettre à jour automatically updated_at
CREATE OR REPLACE FUNCTION update_user_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_progress_updated_at ON user_progress;
CREATE TRIGGER user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_timestamp();

-- ============================================
-- 2. Ajouter colonne color à matieres
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matieres' 
        AND column_name = 'color'
    ) THEN
        ALTER TABLE matieres 
        ADD COLUMN color VARCHAR(7);
        
        COMMENT ON COLUMN matieres.color IS 'Couleur hexadécimale pour la matière (#RRGGBB)';
        
        -- Initialiser avec des couleurs par défaut
        UPDATE matieres SET color = '#3B82F6' WHERE name ILIKE '%mathématiques%';
        UPDATE matieres SET color = '#EF4444' WHERE name ILIKE '%français%';
        UPDATE matieres SET color = '#10B981' WHERE name ILIKE '%physique%';
        UPDATE matieres SET color = '#22C55E' WHERE name ILIKE '%svt%' OR name ILIKE '%biologie%';
        UPDATE matieres SET color = '#F59E0B' WHERE name ILIKE '%histoire%';
        UPDATE matieres SET color = '#8B5CF6' WHERE name ILIKE '%géographie%';
        UPDATE matieres SET color = '#EC4899' WHERE name ILIKE '%anglais%';
        UPDATE matieres SET color = '#06B6D4' WHERE name ILIKE '%philosophie%';
        
        -- Couleur par défaut pour les autres matières
        UPDATE matieres SET color = '#6B7280' WHERE color IS NULL;
    END IF;
END $$;

-- ============================================
-- 3. BADGES - Déjà gérés par migration V3
-- ============================================
-- Note: La table badges et la Foreign Key user_badges.badge_id → badges.badge_id
-- ont été créées et corrigées par 20251023_fix_badges_fk_v3.sql
-- Cette section est volontairement vide pour éviter les conflits.

DO $$
BEGIN
    RAISE NOTICE '⏭️  Section badges sautée - déjà gérée par migration V3';
END $$;

-- ============================================
-- 4. Améliorer les index pour performance
-- ============================================

-- Index sur user_progress pour les queries temporelles
CREATE INDEX IF NOT EXISTS idx_user_progress_user_created 
ON user_progress(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_completed 
ON user_progress(user_id, completed) 
WHERE completed = true;

-- Index sur quiz_results pour analytics
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_completed 
ON quiz_results(user_id, completed_at DESC);

-- Index sur user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_earned 
ON user_badges(user_id, earned_at DESC);

-- ============================================
-- 5. Ajouter des vues utiles pour Analytics
-- ============================================

-- Vue pour obtenir le sujet d'un quiz
CREATE OR REPLACE VIEW quiz_with_subject AS
SELECT 
    qr.id,
    qr.user_id,
    qr.quiz_id,
    qr.score,
    qr.completed_at,
    qr.time_taken,
    m.name as subject_name,
    m.color as subject_color,
    c.title as chapter_title
FROM quiz_results qr
JOIN quiz q ON qr.quiz_id = q.id
JOIN chapitres c ON q.chapitre_id = c.id
JOIN matieres m ON c.matiere_id = m.id;

COMMENT ON VIEW quiz_with_subject IS 'Vue enrichie des résultats de quiz avec le sujet et le chapitre';

-- Vue pour les statistiques de progression par matière
CREATE OR REPLACE VIEW user_subject_stats AS
SELECT 
    up.user_id,
    m.id as matiere_id,
    m.name as subject_name,
    m.color as subject_color,
    COUNT(DISTINCT up.chapitre_id) as chapters_completed,
    SUM(up.time_spent) as total_time_seconds,
    MAX(up.created_at) as last_activity
FROM user_progress up
JOIN chapitres c ON up.chapitre_id = c.id
JOIN matieres m ON c.matiere_id = m.id
WHERE up.completed = true
GROUP BY up.user_id, m.id, m.name, m.color;

COMMENT ON VIEW user_subject_stats IS 'Statistiques de progression par matière pour chaque utilisateur';

-- ============================================
-- Fin de la migration
-- ============================================

-- Afficher un résumé
DO $$
DECLARE
    user_progress_count INTEGER;
    matieres_count INTEGER;
    badges_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_progress_count FROM user_progress;
    SELECT COUNT(*) INTO matieres_count FROM matieres;
    SELECT COUNT(*) INTO badges_count FROM badges;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration terminée avec succès !';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'user_progress: % enregistrements', user_progress_count;
    RAISE NOTICE 'matieres: % enregistrements', matieres_count;
    RAISE NOTICE 'badges: % enregistrements', badges_count;
    RAISE NOTICE '========================================';
END $$;
