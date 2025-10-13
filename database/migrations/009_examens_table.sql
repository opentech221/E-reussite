-- =====-- ============================================
-- Table examens
-- ============================================
CREATE TABLE IF NOT EXISTS examens (
  id SERIAL PRIMARY KEY,
  matiere_id INT REFERENCES matieres(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  year INT,
  type TEXT CHECK (type IN ('blanc', 'entrainement', 'officiel')),
  pdf_url TEXT,
  correction_video_url TEXT,
  duration_minutes INT DEFAULT 180,
  difficulty TEXT CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ======================
-- Migration 009: Table examens corrigés
-- ============================================
-- Date: 6 octobre 2025
-- Description: 
--   Ajoute une table pour les examens blancs corrigés
--   (similaire aux annales mais pour les examens d'entraînement)

-- ============================================
-- Table examens
-- ============================================
CREATE TABLE IF NOT EXISTS examens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matiere_id UUID REFERENCES matieres(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  year INT,
  type TEXT CHECK (type IN ('blanc', 'entrainement', 'officiel')),
  pdf_url TEXT,
  correction_video_url TEXT,
  duration_minutes INT DEFAULT 180,
  difficulty TEXT CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_examens_matiere_id ON examens(matiere_id);
CREATE INDEX IF NOT EXISTS idx_examens_type ON examens(type);
CREATE INDEX IF NOT EXISTS idx_examens_year ON examens(year);

-- RLS Policies
ALTER TABLE examens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examens visibles par tous"
  ON examens FOR SELECT
  USING (true);

CREATE POLICY "Seuls les admins peuvent insérer des examens"
  ON examens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Seuls les admins peuvent modifier des examens"
  ON examens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Seuls les admins peuvent supprimer des examens"
  ON examens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- Fonction pour mettre à jour updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_examens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_examens_updated_at
  BEFORE UPDATE ON examens
  FOR EACH ROW
  EXECUTE FUNCTION update_examens_updated_at();

-- ============================================
-- Seed des examens
-- ============================================
DO $$
DECLARE
  mat_math_bfem_id INT;
  mat_fr_bfem_id INT;
  mat_phys_bfem_id INT;
  mat_math_bac_id INT;
  mat_philo_bac_id INT;
  mat_phys_bac_id INT;
BEGIN
  -- Récupérer les IDs des matières
  SELECT id INTO mat_math_bfem_id FROM matieres WHERE name = 'Mathématiques' AND level = 'bfem';
  SELECT id INTO mat_fr_bfem_id FROM matieres WHERE name = 'Français' AND level = 'bfem';
  SELECT id INTO mat_phys_bfem_id FROM matieres WHERE name = 'Physique-Chimie' AND level = 'bfem';
  SELECT id INTO mat_math_bac_id FROM matieres WHERE name = 'Mathématiques' AND level = 'bac';
  SELECT id INTO mat_philo_bac_id FROM matieres WHERE name = 'Philosophie' AND level = 'bac';
  SELECT id INTO mat_phys_bac_id FROM matieres WHERE name = 'Physique' AND level = 'bac';

  -- Examens BFEM Mathématiques
  IF mat_math_bfem_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, duration_minutes, difficulty)
    VALUES 
      (mat_math_bfem_id, 'Examen Blanc BFEM 2024 - Session 1', 'Premier examen blanc complet pour la préparation au BFEM', 2024, 'blanc', 180, 'moyen'),
      (mat_math_bfem_id, 'Examen Blanc BFEM 2024 - Session 2', 'Deuxième examen blanc avec correction détaillée', 2024, 'blanc', 180, 'difficile'),
      (mat_math_bfem_id, 'Examen d''entraînement - Algèbre', 'Entraînement ciblé sur l''algèbre', 2024, 'entrainement', 120, 'facile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Examens BFEM Français
  IF mat_fr_bfem_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, duration_minutes, difficulty)
    VALUES 
      (mat_fr_bfem_id, 'Examen Blanc BFEM 2024 - Complet', 'Examen blanc avec compréhension et rédaction', 2024, 'blanc', 180, 'moyen'),
      (mat_fr_bfem_id, 'Entraînement Dissertation', 'Pratique de la dissertation', 2024, 'entrainement', 120, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Examens BFEM Physique-Chimie
  IF mat_phys_bfem_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, duration_minutes, difficulty)
    VALUES 
      (mat_phys_bfem_id, 'Examen Blanc BFEM 2024', 'Examen complet de physique-chimie', 2024, 'blanc', 120, 'moyen'),
      (mat_phys_bfem_id, 'Entraînement Optique', 'Focus sur la lumière et l''optique', 2024, 'entrainement', 60, 'facile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Examens BAC Mathématiques
  IF mat_math_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, duration_minutes, difficulty)
    VALUES 
      (mat_math_bac_id, 'Examen Blanc BAC 2024 - Série S', 'Examen blanc complet série scientifique', 2024, 'blanc', 240, 'difficile'),
      (mat_math_bac_id, 'Examen Blanc BAC 2024 - Série L', 'Examen blanc série littéraire', 2024, 'blanc', 180, 'moyen'),
      (mat_math_bac_id, 'Entraînement Analyse', 'Fonctions, dérivées, intégrales', 2024, 'entrainement', 120, 'moyen'),
      (mat_math_bac_id, 'Entraînement Probabilités', 'Focus sur les probabilités', 2024, 'entrainement', 90, 'difficile')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Examens BAC Philosophie
  IF mat_philo_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, duration_minutes, difficulty)
    VALUES 
      (mat_philo_bac_id, 'Examen Blanc BAC 2024', 'Dissertation et étude de texte', 2024, 'blanc', 240, 'difficile'),
      (mat_philo_bac_id, 'Entraînement Dissertation', 'Pratique intensive de la dissertation', 2024, 'entrainement', 180, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Examens BAC Physique
  IF mat_phys_bac_id IS NOT NULL THEN
    INSERT INTO examens (matiere_id, title, description, year, type, duration_minutes, difficulty)
    VALUES 
      (mat_phys_bac_id, 'Examen Blanc BAC 2024', 'Mécanique, électricité, ondes', 2024, 'blanc', 240, 'difficile'),
      (mat_phys_bac_id, 'Entraînement Mécanique', 'Exercices de mécanique du point', 2024, 'entrainement', 120, 'moyen')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

COMMENT ON TABLE examens IS 'Examens blancs et d''entraînement corrigés pour la préparation aux examens officiels';

SELECT 'Migration 009 : Table examens créée avec succès !' AS message;
