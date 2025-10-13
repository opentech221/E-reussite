-- ============================================
-- SEED AVEC GESTION DES DOUBLONS
-- ============================================
-- Version "INSERT ... ON CONFLICT DO NOTHING"
-- N'insère que si la donnée n'existe pas déjà
-- ============================================

-- 1. BADGES (avec gestion de conflit sur name)
-- Colonnes réelles : id, name, description, icon_name
INSERT INTO badges (name, description, icon_name)
VALUES
  ('Première Connexion', 'Se connecter pour la première fois', 'user-check'),
  ('Quiz Master', 'Réussir 10 quiz avec 80%+', 'trophy'),
  ('Perfectionniste', 'Obtenir 100% à un quiz', 'star'),
  ('Assidu', 'Se connecter 7 jours consécutifs', 'calendar-check'),
  ('Champion', 'Terminer un examen blanc avec 90%+', 'award'),
  ('Explorateur', 'Consulter 20 leçons', 'compass'),
  ('Rapide', 'Finir un quiz en moins de 5 minutes', 'zap'),
  ('Studieux', 'Passer 10h sur la plateforme', 'book-open'),
  ('Social', 'Inviter 5 amis', 'users'),
  ('Marathonien', 'Streak de 30 jours', 'flame')
ON CONFLICT (name) DO NOTHING;

-- 2. MATIÈRES (avec gestion de conflit sur name + level)
-- Colonnes réelles : id, name, level
INSERT INTO matieres (name, level)
VALUES
  ('Mathématiques', 'bfem'),
  ('Français', 'bfem'),
  ('Anglais', 'bfem'),
  ('Physique-Chimie', 'bfem'),
  ('SVT', 'bfem'),
  ('Histoire-Géographie', 'bfem'),
  ('Mathématiques', 'bac'),
  ('Physique', 'bac'),
  ('Chimie', 'bac'),
  ('Philosophie', 'bac'),
  ('Sciences Économiques', 'bac'),
  ('Anglais', 'bac'),
  ('Français', 'bac')
ON CONFLICT (name, level) DO NOTHING;

-- 3. CHAPITRES (insertion conditionnelle)
-- On récupère les IDs des matières existantes
DO $$
DECLARE
  mat_math_bfem_id INT;
  mat_fr_bfem_id INT;
  mat_phys_bfem_id INT;
  mat_hist_bfem_id INT;
  mat_math_bac_id INT;
  mat_philo_bac_id INT;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO mat_math_bfem_id FROM matieres WHERE name = 'Mathématiques' AND level = 'bfem';
  SELECT id INTO mat_fr_bfem_id FROM matieres WHERE name = 'Français' AND level = 'bfem';
  SELECT id INTO mat_phys_bfem_id FROM matieres WHERE name = 'Physique-Chimie' AND level = 'bfem';
  SELECT id INTO mat_hist_bfem_id FROM matieres WHERE name = 'Histoire-Géographie' AND level = 'bfem';
  SELECT id INTO mat_math_bac_id FROM matieres WHERE name = 'Mathématiques' AND level = 'bac';
  SELECT id INTO mat_philo_bac_id FROM matieres WHERE name = 'Philosophie' AND level = 'bac';

  -- Insérer chapitres si les matières existent
  IF mat_math_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES
      (mat_math_bfem_id, 'Théorème de Thalès', 'Proportionnalité et rapports de longueurs', 1),
      (mat_math_bfem_id, 'Équations du second degré', 'Résolution et factorisation', 2),
      (mat_math_bfem_id, 'Fonctions linéaires', 'Représentation graphique et applications', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  IF mat_fr_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES
      (mat_fr_bfem_id, 'La conjugaison', 'Temps simples et composés', 1),
      (mat_fr_bfem_id, 'La dissertation', 'Méthodologie et plan', 2),
      (mat_fr_bfem_id, 'Les figures de style', 'Métaphore, comparaison, etc.', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  IF mat_phys_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES
      (mat_phys_bfem_id, 'La lumière', 'Propagation et réflexion', 1),
      (mat_phys_bfem_id, 'Les atomes', 'Structure atomique et tableau périodique', 2)
    ON CONFLICT DO NOTHING;
  END IF;

  IF mat_hist_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES
      (mat_hist_bfem_id, 'La colonisation', 'Causes et conséquences', 1),
      (mat_hist_bfem_id, 'Les grandes découvertes', 'XV-XVIe siècles', 2)
    ON CONFLICT DO NOTHING;
  END IF;

  IF mat_math_bac_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES
      (mat_math_bac_id, 'Suites numériques', 'Suites arithmétiques et géométriques', 1),
      (mat_math_bac_id, 'Fonctions logarithmes', 'Propriétés et applications', 2),
      (mat_math_bac_id, 'Intégrales', 'Calcul d''aires et primitives', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  IF mat_philo_bac_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES
      (mat_philo_bac_id, 'La conscience', 'Descartes, Freud, Sartre', 1),
      (mat_philo_bac_id, 'Le travail', 'Marx, Arendt', 2),
      (mat_philo_bac_id, 'La vérité', 'Épistémologie et méthodologie', 3)
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- Message de confirmation
SELECT 'Seed exécuté avec gestion des doublons. Nouvelles données insérées uniquement.' AS message;
