-- ============================================
-- AJOUT EXAMENS MANQUANTS (Histoire-Géo BAC et SVT BAC)
-- ============================================

DO $$
DECLARE
  mat_hist_bac_id INT;
  mat_svt_bac_id INT;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO mat_hist_bac_id FROM matieres WHERE name = 'Histoire-Géographie BAC' AND level = 'bac';
  SELECT id INTO mat_svt_bac_id FROM matieres WHERE name = 'SVT BAC' AND level = 'bac';

  -- Histoire-Géographie BAC
  IF mat_hist_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_hist_bac_id, 'Examen Blanc BAC 2024 - Histoire', 'Première et Seconde Guerre mondiale', 2024, 'blanc', NULL, NULL, 240, 'moyen'),
      (mat_hist_bac_id, 'Examen Blanc BAC 2024 - Géographie', 'Mondialisation et territoires', 2024, 'blanc', NULL, NULL, 180, 'moyen'),
      (mat_hist_bac_id, 'Entraînement Composition', 'Méthode de la composition en Histoire-Géo', 2024, 'entrainement', NULL, NULL, 120, 'facile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- SVT BAC
  IF mat_svt_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, pdf_url, correction_video_url, duration_minutes, difficulty)
    VALUES 
      (mat_svt_bac_id, 'Examen Blanc BAC 2024', 'Génétique et évolution', 2024, 'blanc', NULL, NULL, 210, 'difficile'),
      (mat_svt_bac_id, 'Entraînement Génétique', 'Exercices sur l''ADN et l''hérédité', 2024, 'entrainement', NULL, NULL, 90, 'moyen'),
      (mat_svt_bac_id, 'Entraînement Géologie', 'Tectonique des plaques', 2024, 'entrainement', NULL, NULL, 90, 'facile')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

SELECT 'Examens Histoire-Géo BAC et SVT BAC ajoutés !' AS message;
