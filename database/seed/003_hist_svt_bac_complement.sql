-- ============================================
-- SEED COMPLÉMENTAIRE - Histoire-Géo BAC et SVT BAC
-- ============================================
-- Date: 6 octobre 2025
-- Description: Ajout des chapitres et leçons pour Histoire-Géographie BAC et SVT BAC

DO $$
DECLARE
  mat_hist_bac_id INT;
  mat_svt_bac_id INT;
  chap_id INT;
  
BEGIN
  -- ============================================
  -- RÉCUPÉRATION DES IDs DES MATIÈRES
  -- ============================================
  SELECT id INTO mat_hist_bac_id FROM matieres WHERE name = 'Histoire-Géographie BAC' AND level = 'bac';
  SELECT id INTO mat_svt_bac_id FROM matieres WHERE name = 'SVT BAC' AND level = 'bac';

  -- ============================================
  -- HISTOIRE-GÉOGRAPHIE BAC
  -- ============================================
  IF mat_hist_bac_id IS NOT NULL THEN
    -- Chapitre 1 : Histoire
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_hist_bac_id, 'La Première Guerre mondiale', 'Causes, déroulement et conséquences', 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Les origines du conflit', '<h2>Causes de la Première Guerre mondiale</h2><p>Les tensions nationalistes, les alliances, l''attentat de Sarajevo...</p>', 1, true),
        (chap_id, 'La guerre des tranchées', '<h2>1914-1918 : Une guerre totale</h2><p>La vie dans les tranchées, les grandes batailles (Verdun, la Somme)...</p>', 2, false),
        (chap_id, 'Le traité de Versailles', '<h2>Les conséquences du conflit</h2><p>Redéfinition des frontières européennes, création de la SDN...</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 2 : Histoire
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_hist_bac_id, 'La Seconde Guerre mondiale', 'Totalitarismes et conflit mondial', 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Montée des totalitarismes', '<h2>Fascisme, nazisme, stalinisme</h2><p>Les régimes totalitaires en Europe dans l''entre-deux-guerres.</p>', 1, true),
        (chap_id, 'Le déroulement de la guerre', '<h2>1939-1945</h2><p>Les grandes phases : Blitzkrieg, guerre du Pacifique, débarquement...</p>', 2, false),
        (chap_id, 'Le génocide juif', '<h2>La Shoah</h2><p>L''extermination systématique des Juifs d''Europe par le régime nazi.</p>', 3, false),
        (chap_id, 'L''après-guerre', '<h2>Un monde bipolaire</h2><p>ONU, guerre froide, décolonisation.</p>', 4, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 3 : Géographie
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_hist_bac_id, 'La mondialisation', 'Flux, acteurs et territoires', 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Les flux de la mondialisation', '<h2>Flux économiques et humains</h2><p>Échanges commerciaux, migrations, flux financiers...</p>', 1, true),
        (chap_id, 'Les acteurs de la mondialisation', '<h2>FMN, États, organisations internationales</h2><p>Qui sont les principaux acteurs de la mondialisation ?</p>', 2, false),
        (chap_id, 'Territoires et inégalités', '<h2>Centre et périphéries</h2><p>Les métropoles mondiales, les espaces marginalisés.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- ============================================
  -- SVT BAC
  -- ============================================
  IF mat_svt_bac_id IS NOT NULL THEN
    -- Chapitre 1 : Génétique
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_svt_bac_id, 'Génétique et évolution', 'ADN, mutations et sélection naturelle', 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'La structure de l''ADN', '<h2>Le support de l''information génétique</h2><p>Double hélice, nucléotides, paires de bases complémentaires...</p>', 1, true),
        (chap_id, 'Réplication et mutations', '<h2>Transmission et variation de l''information</h2><p>Comment l''ADN se réplique et comment apparaissent les mutations.</p>', 2, false),
        (chap_id, 'L''expression des gènes', '<h2>Du gène à la protéine</h2><p>Transcription, traduction, code génétique.</p>', 3, false),
        (chap_id, 'Évolution et sélection naturelle', '<h2>Théorie de Darwin</h2><p>Variation, sélection, adaptation des populations.</p>', 4, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 2 : Immunologie
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_svt_bac_id, 'Le système immunitaire', 'Défenses de l''organisme', 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'L''immunité innée', '<h2>Première ligne de défense</h2><p>Barrières physiques, phagocytes, réaction inflammatoire...</p>', 1, true),
        (chap_id, 'L''immunité adaptative', '<h2>Réponse spécifique</h2><p>Lymphocytes B et T, anticorps, mémoire immunitaire.</p>', 2, false),
        (chap_id, 'Vaccination et immunothérapie', '<h2>Applications médicales</h2><p>Comment fonctionne un vaccin ? Les traitements immunologiques.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 3 : Géologie
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_svt_bac_id, 'Tectonique des plaques', 'Structure et dynamique de la Terre', 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Structure interne de la Terre', '<h2>Croûte, manteau, noyau</h2><p>Les différentes enveloppes terrestres et leurs propriétés.</p>', 1, true),
        (chap_id, 'La théorie de la tectonique des plaques', '<h2>Wegener et la dérive des continents</h2><p>Preuves de la mobilité des plaques lithosphériques.</p>', 2, false),
        (chap_id, 'Volcans et séismes', '<h2>Manifestations de la tectonique</h2><p>Les zones de subduction, dorsales océaniques, failles transformantes.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

END $$;

SELECT 'Seed complémentaire Histoire-Géo BAC et SVT BAC exécuté avec succès !' AS message;
