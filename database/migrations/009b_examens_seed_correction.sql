-- ============================================
-- MIGRATION 009b - CORRECTION SEED EXAMENS
-- ============================================
-- Date: 6 octobre 2025
-- Description: Correction du seed examens avec les bons noms de matières

DO $$
DECLARE
  -- BFEM IDs
  mat_math_bfem_id INT;
  mat_fr_bfem_id INT;
  mat_ang_bfem_id INT;
  mat_phys_bfem_id INT;
  mat_svt_bfem_id INT;
  mat_hist_bfem_id INT;
  
  -- BAC IDs
  mat_math_bac_id INT;
  mat_phys_bac_id INT;
  mat_chim_bac_id INT;
  mat_philo_bac_id INT;
  mat_eco_bac_id INT;
  mat_ang_bac_id INT;
  mat_fr_bac_id INT;
  
BEGIN
  -- ============================================
  -- RÉCUPÉRATION DES IDs (avec suffixes BFEM/BAC dans les noms)
  -- ============================================
  SELECT id INTO mat_math_bfem_id FROM matieres WHERE name = 'Mathématiques BFEM' AND level = 'bfem';
  SELECT id INTO mat_fr_bfem_id FROM matieres WHERE name = 'Français BFEM' AND level = 'bfem';
  SELECT id INTO mat_ang_bfem_id FROM matieres WHERE name = 'Anglais BFEM' AND level = 'bfem';
  SELECT id INTO mat_phys_bfem_id FROM matieres WHERE name = 'Physique-Chimie BFEM' AND level = 'bfem';
  SELECT id INTO mat_svt_bfem_id FROM matieres WHERE name = 'SVT BFEM' AND level = 'bfem';
  SELECT id INTO mat_hist_bfem_id FROM matieres WHERE name = 'Histoire-Géographie BFEM' AND level = 'bfem';
  
  SELECT id INTO mat_math_bac_id FROM matieres WHERE name = 'Mathématiques BAC' AND level = 'bac';
  SELECT id INTO mat_phys_bac_id FROM matieres WHERE name = 'Physique-Chimie BAC' AND level = 'bac';
  SELECT id INTO mat_chim_bac_id FROM matieres WHERE name = 'Physique-Chimie BAC' AND level = 'bac'; -- Même matière pour chimie
  SELECT id INTO mat_philo_bac_id FROM matieres WHERE name = 'Philosophie BAC' AND level = 'bac';
  SELECT id INTO mat_eco_bac_id FROM matieres WHERE name = 'Sciences Économiques BAC' AND level = 'bac'; -- À vérifier si existe
  SELECT id INTO mat_ang_bac_id FROM matieres WHERE name = 'Anglais BAC' AND level = 'bac';
  SELECT id INTO mat_fr_bac_id FROM matieres WHERE name = 'Français BAC' AND level = 'bac';

  -- ============================================
  -- EXAMENS BFEM
  -- ============================================
  
  -- Mathématiques BFEM
  IF mat_math_bfem_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_math_bfem_id, 'Examen Blanc BFEM 2024 - Session 1', 'Premier examen blanc complet pour la préparation au BFEM', 2024, 'blanc', NULL, NULL, 180, 'moyen'),
      (mat_math_bfem_id, 'Examen Blanc BFEM 2024 - Session 2', 'Deuxième examen blanc avec correction détaillée', 2024, 'blanc', NULL, NULL, 180, 'difficile'),
      (mat_math_bfem_id, 'Examen d''entraînement - Algèbre', 'Entraînement ciblé sur l''algèbre et les équations', 2024, 'entrainement', NULL, NULL, 120, 'facile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Français BFEM
  IF mat_fr_bfem_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_fr_bfem_id, 'Examen Blanc BFEM 2024 - Complet', 'Examen blanc avec compréhension et rédaction', 2024, 'blanc', NULL, NULL, 180, 'moyen'),
      (mat_fr_bfem_id, 'Entraînement Dissertation', 'Pratique de la dissertation avec méthodologie', 2024, 'entrainement', NULL, NULL, 120, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Anglais BFEM
  IF mat_ang_bfem_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_ang_bfem_id, 'Examen Blanc BFEM 2024', 'Compréhension écrite et expression', 2024, 'blanc', NULL, NULL, 120, 'moyen'),
      (mat_ang_bfem_id, 'Entraînement Grammar & Vocabulary', 'Focus sur la grammaire et le vocabulaire', 2024, 'entrainement', NULL, NULL, 60, 'facile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Physique-Chimie BFEM
  IF mat_phys_bfem_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_phys_bfem_id, 'Examen Blanc BFEM 2024', 'Examen complet de physique-chimie', 2024, 'blanc', NULL, NULL, 120, 'moyen'),
      (mat_phys_bfem_id, 'Entraînement Optique et Lumière', 'Focus sur la lumière et l''optique', 2024, 'entrainement', NULL, NULL, 60, 'facile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- SVT BFEM
  IF mat_svt_bfem_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_svt_bfem_id, 'Examen Blanc BFEM 2024', 'Biologie et géologie complètes', 2024, 'blanc', NULL, NULL, 120, 'moyen'),
      (mat_svt_bfem_id, 'Entraînement Cellule et Génétique', 'Focus sur la biologie cellulaire', 2024, 'entrainement', NULL, NULL, 90, 'facile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Histoire-Géographie BFEM
  IF mat_hist_bfem_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_hist_bfem_id, 'Examen Blanc BFEM 2024', 'Histoire et géographie du Sénégal et du monde', 2024, 'blanc', NULL, NULL, 180, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- EXAMENS BAC
  -- ============================================
  
  -- Mathématiques BAC
  IF mat_math_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_math_bac_id, 'Examen Blanc BAC 2024 - Série S', 'Examen blanc complet série scientifique', 2024, 'blanc', NULL, NULL, 240, 'difficile'),
      (mat_math_bac_id, 'Examen Blanc BAC 2024 - Série L', 'Examen blanc série littéraire', 2024, 'blanc', NULL, NULL, 180, 'moyen'),
      (mat_math_bac_id, 'Entraînement Analyse', 'Fonctions, dérivées, intégrales', 2024, 'entrainement', NULL, NULL, 120, 'moyen'),
      (mat_math_bac_id, 'Entraînement Probabilités', 'Focus sur les probabilités et statistiques', 2024, 'entrainement', NULL, NULL, 90, 'difficile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Philosophie BAC
  IF mat_philo_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_philo_bac_id, 'Examen Blanc BAC 2024', 'Dissertation et étude de texte', 2024, 'blanc', NULL, NULL, 240, 'difficile'),
      (mat_philo_bac_id, 'Entraînement Dissertation', 'Pratique intensive de la dissertation philosophique', 2024, 'entrainement', NULL, NULL, 180, 'moyen'),
      (mat_philo_bac_id, 'Entraînement Étude de Texte', 'Analyse de textes philosophiques', 2024, 'entrainement', NULL, NULL, 120, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Physique BAC
  IF mat_phys_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_phys_bac_id, 'Examen Blanc BAC 2024', 'Mécanique, électricité, ondes', 2024, 'blanc', NULL, NULL, 240, 'difficile'),
      (mat_phys_bac_id, 'Entraînement Mécanique', 'Exercices de mécanique du point', 2024, 'entrainement', NULL, NULL, 120, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Chimie BAC (utilise Physique-Chimie BAC)
  IF mat_chim_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_chim_bac_id, 'Examen Blanc Chimie BAC 2024', 'Chimie organique et minérale', 2024, 'blanc', NULL, NULL, 180, 'difficile'),
      (mat_chim_bac_id, 'Entraînement Chimie Organique', 'Focus sur les hydrocarbures et fonctions', 2024, 'entrainement', NULL, NULL, 90, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Sciences Économiques BAC (peut ne pas exister dans votre base)
  IF mat_eco_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_eco_bac_id, 'Examen Blanc BAC 2024', 'Micro et macroéconomie', 2024, 'blanc', NULL, NULL, 240, 'moyen'),
      (mat_eco_bac_id, 'Entraînement Microéconomie', 'Marché, offre, demande', 2024, 'entrainement', NULL, NULL, 120, 'facile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Anglais BAC
  IF mat_ang_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_ang_bac_id, 'Examen Blanc BAC 2024', 'Compréhension, expression, essai', 2024, 'blanc', NULL, NULL, 180, 'difficile'),
      (mat_ang_bac_id, 'Entraînement Essay Writing', 'Pratique de l''argumentation en anglais', 2024, 'entrainement', NULL, NULL, 90, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Français BAC
  IF mat_fr_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_fr_bac_id, 'Examen Blanc BAC 2024', 'Dissertation et commentaire composé', 2024, 'blanc', NULL, NULL, 240, 'difficile'),
      (mat_fr_bac_id, 'Entraînement Commentaire Composé', 'Analyse littéraire approfondie', 2024, 'entrainement', NULL, NULL, 180, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

SELECT 'Migration 009b : Examens insérés avec succès !' AS message;
