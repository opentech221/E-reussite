-- ============================================
-- SEED CORRIGÉ - Avec les bons noms de colonnes
-- ============================================
-- Date: 6 octobre 2025
-- Description: Contenu pédagogique complet pour BFEM et BAC
-- CORRECTION: content → content_text, suppression de duration_minutes

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
  
  -- Chapitre IDs (pour insertion de leçons)
  chap_id INT;
  
BEGIN
  -- ============================================
  -- RÉCUPÉRATION DES IDs DES MATIÈRES
  -- ============================================
  SELECT id INTO mat_math_bfem_id FROM matieres WHERE name = 'Mathématiques BFEM' AND level = 'bfem';
  SELECT id INTO mat_fr_bfem_id FROM matieres WHERE name = 'Français BFEM' AND level = 'bfem';
  SELECT id INTO mat_ang_bfem_id FROM matieres WHERE name = 'Anglais BFEM' AND level = 'bfem';
  SELECT id INTO mat_phys_bfem_id FROM matieres WHERE name = 'Physique-Chimie BFEM' AND level = 'bfem';
  SELECT id INTO mat_svt_bfem_id FROM matieres WHERE name = 'SVT BFEM' AND level = 'bfem';
  SELECT id INTO mat_hist_bfem_id FROM matieres WHERE name = 'Histoire-Géographie BFEM' AND level = 'bfem';
  
  SELECT id INTO mat_math_bac_id FROM matieres WHERE name = 'Mathématiques BAC' AND level = 'bac';
  SELECT id INTO mat_phys_bac_id FROM matieres WHERE name = 'Physique-Chimie BAC' AND level = 'bac';
  SELECT id INTO mat_chim_bac_id FROM matieres WHERE name = 'Physique-Chimie BAC' AND level = 'bac'; -- Même ID
  SELECT id INTO mat_philo_bac_id FROM matieres WHERE name = 'Philosophie BAC' AND level = 'bac';
  SELECT id INTO mat_eco_bac_id FROM matieres WHERE name = 'Sciences Économiques BAC' AND level = 'bac';
  SELECT id INTO mat_ang_bac_id FROM matieres WHERE name = 'Anglais BAC' AND level = 'bac';
  SELECT id INTO mat_fr_bac_id FROM matieres WHERE name = 'Français BAC' AND level = 'bac';

  -- ============================================
  -- MATHÉMATIQUES BFEM
  -- ============================================
  IF mat_math_bfem_id IS NOT NULL THEN
    -- Chapitre 1
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_math_bfem_id, 'Théorème de Thalès', 'Proportionnalité et rapports de longueurs', 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Introduction au théorème de Thalès', '<h2>Le théorème de Thalès</h2><p>Le théorème de Thalès est un théorème fondamental en géométrie qui établit une relation entre les longueurs de segments dans des triangles semblables.</p>', 1, true),
        (chap_id, 'Configuration de Thalès', '<h2>Les configurations</h2><p>Il existe deux configurations principales : la configuration en papillon et la configuration en triangle.</p>', 2, false),
        (chap_id, 'Applications et exercices', '<h2>Exercices pratiques</h2><p>Résolution de problèmes concrets utilisant le théorème de Thalès.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 2
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_math_bfem_id, 'Équations du second degré', 'Résolution et factorisation', 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Forme canonique', '<h2>Forme canonique d''une équation du second degré</h2><p>ax² + bx + c = a(x - α)² + β</p>', 1, true),
        (chap_id, 'Discriminant et résolution', '<h2>Le discriminant Δ</h2><p>Δ = b² - 4ac permet de déterminer le nombre de solutions.</p>', 2, false),
        (chap_id, 'Factorisation', '<h2>Factoriser une expression</h2><p>Utilisation des racines pour factoriser.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 3
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_math_bfem_id, 'Fonctions linéaires et affines', 'Représentation graphique et applications', 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Définition et propriétés', '<h2>Fonctions linéaires</h2><p>f(x) = ax où a est le coefficient directeur.</p>', 1, false),
        (chap_id, 'Représentation graphique', '<h2>Tracer une droite</h2><p>Une fonction linéaire est représentée par une droite passant par l''origine.</p>', 2, false),
        (chap_id, 'Fonctions affines', '<h2>f(x) = ax + b</h2><p>La fonction affine et son ordonnée à l''origine.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- ============================================
  -- FRANÇAIS BFEM
  -- ============================================
  IF mat_fr_bfem_id IS NOT NULL THEN
    -- Chapitre 1
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_fr_bfem_id, 'La conjugaison', 'Temps simples et composés', 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Les temps de l''indicatif', '<h2>L''indicatif</h2><p>Le mode de la réalité : présent, imparfait, passé simple, futur...</p>', 1, true),
        (chap_id, 'Le subjonctif', '<h2>Mode du doute et du souhait</h2><p>Formation et emplois du subjonctif présent et passé.</p>', 2, false),
        (chap_id, 'L''impératif et le conditionnel', '<h2>Modes particuliers</h2><p>L''impératif pour l''ordre, le conditionnel pour l''hypothèse.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 2
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_fr_bfem_id, 'La dissertation', 'Méthodologie et plan', 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Analyser le sujet', '<h2>Comprendre la problématique</h2><p>Identifier les mots-clés et reformuler la question.</p>', 1, true),
        (chap_id, 'Construire un plan', '<h2>Plan dialectique</h2><p>Thèse, antithèse, synthèse.</p>', 2, false),
        (chap_id, 'Rédiger l''introduction et la conclusion', '<h2>Les parties cruciales</h2><p>Accroche, problématique, annonce du plan.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 3
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_fr_bfem_id, 'Les figures de style', 'Métaphore, comparaison, etc.', 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Figures de ressemblance', '<h2>Métaphore et comparaison</h2><p>Créer des images poétiques.</p>', 1, false),
        (chap_id, 'Figures d''insistance', '<h2>Anaphore, gradation</h2><p>Renforcer une idée par la répétition.</p>', 2, false),
        (chap_id, 'Figures d''opposition', '<h2>Antithèse, oxymore</h2><p>Créer du contraste.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- ============================================
  -- ANGLAIS BFEM
  -- ============================================
  IF mat_ang_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES 
      (mat_ang_bfem_id, 'Present Tenses', 'Simple and continuous forms', 1),
      (mat_ang_bfem_id, 'Past Tenses', 'Simple past and past continuous', 2),
      (mat_ang_bfem_id, 'Modal Verbs', 'Can, must, should, would', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- PHYSIQUE-CHIMIE BFEM
  -- ============================================
  IF mat_phys_bfem_id IS NOT NULL THEN
    -- Chapitre 1
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_phys_bfem_id, 'La lumière', 'Propagation et réflexion', 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Sources de lumière', '<h2>Sources primaires et secondaires</h2><p>Le Soleil, les lampes, la Lune...</p>', 1, true),
        (chap_id, 'Propagation rectiligne', '<h2>La lumière se propage en ligne droite</h2><p>Expériences et applications.</p>', 2, false),
        (chap_id, 'Réflexion sur un miroir', '<h2>Lois de la réflexion</h2><p>Angle d''incidence = angle de réflexion.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 2
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_phys_bfem_id, 'Les atomes', 'Structure atomique et tableau périodique', 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Structure de l''atome', '<h2>Protons, neutrons, électrons</h2><p>Le noyau et le cortège électronique.</p>', 1, true),
        (chap_id, 'Le tableau périodique', '<h2>Classification des éléments</h2><p>Mendeleïev et l''organisation moderne.</p>', 2, false)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- ============================================
  -- SVT BFEM
  -- ============================================
  IF mat_svt_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES 
      (mat_svt_bfem_id, 'La cellule', 'Unité du vivant', 1),
      (mat_svt_bfem_id, 'La reproduction', 'Reproduction sexuée et asexuée', 2),
      (mat_svt_bfem_id, 'La nutrition', 'Digestion et métabolisme', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- HISTOIRE-GÉOGRAPHIE BFEM
  -- ============================================
  IF mat_hist_bfem_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES 
      (mat_hist_bfem_id, 'La colonisation', 'Causes et conséquences', 1),
      (mat_hist_bfem_id, 'Les grandes découvertes', 'XV-XVIe siècles', 2),
      (mat_hist_bfem_id, 'Les indépendances africaines', '1960 et après', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- MATHÉMATIQUES BAC
  -- ============================================
  IF mat_math_bac_id IS NOT NULL THEN
    -- Chapitre 1
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_math_bac_id, 'Suites numériques', 'Suites arithmétiques et géométriques', 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Définition et notation', '<h2>Qu''est-ce qu''une suite ?</h2><p>Une suite est une fonction définie sur ℕ.</p>', 1, true),
        (chap_id, 'Suites arithmétiques', '<h2>u(n+1) = u(n) + r</h2><p>Raison, terme général, somme.</p>', 2, false),
        (chap_id, 'Suites géométriques', '<h2>u(n+1) = u(n) × q</h2><p>Raison, terme général, somme.</p>', 3, false),
        (chap_id, 'Limite d''une suite', '<h2>Convergence et divergence</h2><p>Étude du comportement à l''infini.</p>', 4, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 2
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_math_bac_id, 'Fonctions logarithmes', 'Propriétés et applications', 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Fonction logarithme népérien', '<h2>ln(x)</h2><p>Définition comme réciproque de exp.</p>', 1, true),
        (chap_id, 'Propriétés algébriques', '<h2>ln(ab) = ln(a) + ln(b)</h2><p>Formules essentielles.</p>', 2, false),
        (chap_id, 'Dérivée et étude de fonctions', '<h2>(ln u)'' = u''/u</h2><p>Applications aux études de fonctions.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 3
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_math_bac_id, 'Intégrales', 'Calcul d''aires et primitives', 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Primitives', '<h2>Fonction dont la dérivée est f</h2><p>Tableau des primitives usuelles.</p>', 1, false),
        (chap_id, 'Intégrale définie', '<h2>∫[a,b] f(x)dx</h2><p>Calcul d''aires sous la courbe.</p>', 2, false),
        (chap_id, 'Intégration par parties', '<h2>Techniques avancées</h2><p>∫uv'' = [uv] - ∫u''v</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- ============================================
  -- PHILOSOPHIE BAC
  -- ============================================
  IF mat_philo_bac_id IS NOT NULL THEN
    -- Chapitre 1
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_philo_bac_id, 'La conscience', 'Descartes, Freud, Sartre', 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Le cogito cartésien', '<h2>Je pense donc je suis</h2><p>Descartes et le doute méthodique.</p>', 1, true),
        (chap_id, 'L''inconscient freudien', '<h2>Le ça, le moi, le surmoi</h2><p>La conscience n''est pas maître en sa demeure.</p>', 2, false),
        (chap_id, 'La conscience sartrienne', '<h2>L''existence précède l''essence</h2><p>Liberté et responsabilité.</p>', 3, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 2
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_philo_bac_id, 'Le travail', 'Marx, Arendt', 2)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Travail et aliénation', '<h2>Marx</h2><p>Le travail comme essence de l''homme.</p>', 1, true),
        (chap_id, 'Vita activa', '<h2>Hannah Arendt</h2><p>Travail, œuvre, action.</p>', 2, false)
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Chapitre 3
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES (mat_philo_bac_id, 'La vérité', 'Épistémologie et méthodologie', 3)
    ON CONFLICT DO NOTHING
    RETURNING id INTO chap_id;
    
    IF chap_id IS NOT NULL THEN
      INSERT INTO lecons (chapitre_id, title, content_text, "order", is_free_preview)
      VALUES 
        (chap_id, 'Vérité et opinion', '<h2>Platon</h2><p>Doxa vs épistémè.</p>', 1, false),
        (chap_id, 'Vérité scientifique', '<h2>Popper et la réfutabilité</h2><p>Critère de démarcation.</p>', 2, false)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- ============================================
  -- PHYSIQUE BAC
  -- ============================================
  IF mat_phys_bac_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES 
      (mat_phys_bac_id, 'Mécanique du point', 'Cinématique et dynamique', 1),
      (mat_phys_bac_id, 'Électricité', 'Circuits et lois', 2),
      (mat_phys_bac_id, 'Ondes et optique', 'Lumière et interférences', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- CHIMIE BAC (même matière que Physique BAC)
  -- ============================================
  IF mat_chim_bac_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES 
      (mat_chim_bac_id, 'Chimie organique', 'Hydrocarbures et fonctions', 4),
      (mat_chim_bac_id, 'Acides et bases', 'pH et réactions', 5),
      (mat_chim_bac_id, 'Cinétique chimique', 'Vitesse de réaction', 6)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- SCIENCES ÉCONOMIQUES BAC
  -- ============================================
  IF mat_eco_bac_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES 
      (mat_eco_bac_id, 'Microéconomie', 'Offre, demande, marché', 1),
      (mat_eco_bac_id, 'Macroéconomie', 'PIB, inflation, chômage', 2),
      (mat_eco_bac_id, 'Commerce international', 'Échanges et mondialisation', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- ANGLAIS BAC
  -- ============================================
  IF mat_ang_bac_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES 
      (mat_ang_bac_id, 'Advanced Grammar', 'Complex structures', 1),
      (mat_ang_bac_id, 'Literary Analysis', 'Poetry and prose', 2),
      (mat_ang_bac_id, 'Essay Writing', 'Argumentation techniques', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- FRANÇAIS BAC
  -- ============================================
  IF mat_fr_bac_id IS NOT NULL THEN
    INSERT INTO chapitres (matiere_id, title, description, "order")
    VALUES 
      (mat_fr_bac_id, 'Le roman', 'Balzac, Flaubert, Proust', 1),
      (mat_fr_bac_id, 'Le théâtre', 'Molière, Racine, Beckett', 2),
      (mat_fr_bac_id, 'La poésie', 'Baudelaire, Rimbaud, Apollinaire', 3)
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

SELECT 'Seed complet exécuté avec succès !' AS message;
