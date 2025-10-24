-- ============================================
-- MIGRATION PHASE 1.5 : ENRICHISSEMENT MÉTIERS
-- Date : 24 octobre 2025
-- Objectif : Ajouter champs détaillés + 10 nouveaux métiers
-- ============================================

-- PARTIE 1 : AJOUT DES NOUVEAUX CHAMPS
-- =====================================

ALTER TABLE careers ADD COLUMN IF NOT EXISTS testimonial TEXT;
ALTER TABLE careers ADD COLUMN IF NOT EXISTS career_path TEXT[]; -- Évolution : Junior → Senior → Expert
ALTER TABLE careers ADD COLUMN IF NOT EXISTS concrete_jobs TEXT[]; -- Débouchés concrets (entreprises/secteurs)
ALTER TABLE careers ADD COLUMN IF NOT EXISTS soft_skills_required TEXT[]; -- Soft skills nécessaires
ALTER TABLE careers ADD COLUMN IF NOT EXISTS work_conditions VARCHAR(500); -- Conditions réelles (horaires, stress, pénibilité)
ALTER TABLE careers ADD COLUMN IF NOT EXISTS academic_difficulty VARCHAR(20) DEFAULT 'medium'; -- 'easy'|'medium'|'hard'|'very_hard'
ALTER TABLE careers ADD COLUMN IF NOT EXISTS training_cost_fcfa INTEGER; -- Coût formation total estimé
ALTER TABLE careers ADD COLUMN IF NOT EXISTS roi_months INTEGER; -- Mois pour rentabiliser l'investissement
ALTER TABLE careers ADD COLUMN IF NOT EXISTS success_rate_percentage INTEGER; -- Taux de réussite dans la formation
ALTER TABLE careers ADD COLUMN IF NOT EXISTS employment_rate_percentage INTEGER; -- Taux d'insertion professionnelle
ALTER TABLE careers ADD COLUMN IF NOT EXISTS growth_trend VARCHAR(20) DEFAULT 'stable'; -- 'growing'|'stable'|'declining'|'emerging'
ALTER TABLE careers ADD COLUMN IF NOT EXISTS geographic_availability TEXT[]; -- Régions où le métier est accessible

COMMENT ON COLUMN careers.testimonial IS 'Témoignage court d''un professionnel (1-2 phrases)';
COMMENT ON COLUMN careers.career_path IS 'Évolution de carrière typique (étapes)';
COMMENT ON COLUMN careers.concrete_jobs IS 'Débouchés concrets (entreprises, secteurs spécifiques)';
COMMENT ON COLUMN careers.soft_skills_required IS 'Compétences comportementales requises';
COMMENT ON COLUMN careers.work_conditions IS 'Description réaliste des conditions de travail';
COMMENT ON COLUMN careers.academic_difficulty IS 'Difficulté académique du parcours de formation';
COMMENT ON COLUMN careers.training_cost_fcfa IS 'Coût total estimé de la formation (FCFA)';
COMMENT ON COLUMN careers.roi_months IS 'Nombre de mois pour rentabiliser l''investissement formation';
COMMENT ON COLUMN careers.success_rate_percentage IS 'Taux de réussite historique dans la formation (%)';
COMMENT ON COLUMN careers.employment_rate_percentage IS 'Taux d''insertion professionnelle après formation (%)';
COMMENT ON COLUMN careers.growth_trend IS 'Tendance du marché de l''emploi pour ce métier';
COMMENT ON COLUMN careers.geographic_availability IS 'Régions du Sénégal où formations/emplois sont disponibles';

-- PARTIE 2 : ENRICHISSEMENT DES 20 MÉTIERS EXISTANTS
-- ====================================================

-- SCIENCES & TECHNOLOGIES
-- -----------------------

UPDATE careers SET 
  testimonial = 'Après 5 ans dans la tech, je crée des solutions qui impactent des milliers d''utilisateurs. La demande explose !',
  career_path = ARRAY['Développeur Junior (0-2 ans)', 'Développeur Confirmé (3-5 ans)', 'Lead Developer / Architecte (5-10 ans)', 'CTO / Consultant Expert (10+ ans)'],
  concrete_jobs = ARRAY['Développeur chez Sonatel/Orange', 'Freelance pour startups locales', 'Consultant international', 'Créer sa boîte tech (SaaS, apps)'],
  soft_skills_required = ARRAY['Autonomie', 'Résolution de problèmes', 'Apprentissage continu', 'Travail en équipe', 'Communication technique'],
  work_conditions = 'Horaires flexibles, souvent bureau climatisé. Stress modéré (deadlines projets). Possibilité télétravail. Sollicitations fréquentes.',
  academic_difficulty = 'hard',
  training_cost_fcfa = 8000000,
  roi_months = 18,
  success_rate_percentage = 65,
  employment_rate_percentage = 90,
  growth_trend = 'growing',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor']
WHERE slug = 'ingenieur-informatique';

UPDATE careers SET 
  testimonial = 'Sauver des vies chaque jour est ma plus grande fierté. Le métier est exigeant mais tellement gratifiant.',
  career_path = ARRAY['Médecin Interne (post-doctorat)', 'Médecin Généraliste (cabinet/hôpital)', 'Spécialiste (cardiologue, chirurgien...)', 'Chef de service / Professeur'],
  concrete_jobs = ARRAY['Hôpitaux publics (Fann, Principal)', 'Cliniques privées (Suma, Matlaboul Fawzaini)', 'Cabinet privé', 'ONG humanitaires (MSF, Croix-Rouge)'],
  soft_skills_required = ARRAY['Empathie', 'Résistance au stress', 'Décision rapide', 'Communication patients', 'Éthique professionnelle'],
  work_conditions = 'Horaires lourds (gardes 24h). Stress élevé (urgences vitales). Exposition maladies. Gratification immense.',
  academic_difficulty = 'very_hard',
  training_cost_fcfa = 15000000,
  roi_months = 36,
  success_rate_percentage = 55,
  employment_rate_percentage = 95,
  growth_trend = 'stable',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor']
WHERE slug = 'medecin-generaliste';

UPDATE careers SET 
  testimonial = 'Transformer les données en décisions stratégiques, c''est magique ! Salaire élevé dès le début de carrière.',
  career_path = ARRAY['Data Analyst Junior', 'Data Scientist', 'Senior Data Scientist / ML Engineer', 'Head of Data / Chief Data Officer'],
  concrete_jobs = ARRAY['Banques (CBAO, Ecobank)', 'Telecoms (Orange, Free)', 'Startups tech (Wave, Jokkolabs)', 'Consultance internationale'],
  soft_skills_required = ARRAY['Curiosité intellectuelle', 'Rigueur analytique', 'Communication insights', 'Créativité', 'Esprit critique'],
  work_conditions = 'Bureau confortable, horaires réguliers. Stress modéré (deadlines). Beaucoup de temps devant écran. Intellectuellement stimulant.',
  academic_difficulty = 'very_hard',
  training_cost_fcfa = 10000000,
  roi_months = 12,
  success_rate_percentage = 60,
  employment_rate_percentage = 88,
  growth_trend = 'growing',
  geographic_availability = ARRAY['Dakar', 'Thiès']
WHERE slug = 'data-scientist';

UPDATE careers SET 
  testimonial = 'Conseiller les gens sur leur santé et gérer mon officine, c''est allier science et entrepreneuriat.',
  career_path = ARRAY['Pharmacien Assistant', 'Pharmacien Titulaire (propriétaire officine)', 'Pharmacien Industriel', 'Inspecteur Pharmacie / Chercheur'],
  concrete_jobs = ARRAY['Officine privée (pharmacie de quartier)', 'Hôpitaux publics', 'Industrie pharmaceutique (PFIZER, SANOFI)', 'Ministère Santé (contrôle)'],
  soft_skills_required = ARRAY['Conseil patient', 'Rigueur médicamenteuse', 'Gestion commerciale', 'Empathie', 'Discrétion professionnelle'],
  work_conditions = 'Horaires étendus (fermeture tardive). Station debout prolongée. Clientèle parfois difficile. Bonne rémunération.',
  academic_difficulty = 'hard',
  training_cost_fcfa = 12000000,
  roi_months = 24,
  success_rate_percentage = 70,
  employment_rate_percentage = 85,
  growth_trend = 'stable',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Louga']
WHERE slug = 'pharmacien';

-- COMMERCE & GESTION
-- ------------------

UPDATE careers SET 
  testimonial = 'Être le pilier financier des entreprises, c''est stratégique. Forte demande et excellents honoraires !',
  career_path = ARRAY['Assistant Comptable', 'Comptable Confirmé', 'Expert-Comptable', 'Commissaire aux Comptes / Directeur Financier'],
  concrete_jobs = ARRAY['Cabinets comptables (PwC, Deloitte, KPMG)', 'Directions financières (grandes entreprises)', 'Expert indépendant', 'Enseignement supérieur'],
  soft_skills_required = ARRAY['Rigueur extrême', 'Confidentialité', 'Sens éthique', 'Analyse critique', 'Résistance pression (clôtures)'],
  work_conditions = 'Pic de stress fin de mois/trimestre/année. Bureau climatisé. Horaires variables (clôtures = heures sup). Stabilité emploi.',
  academic_difficulty = 'hard',
  training_cost_fcfa = 6000000,
  roi_months = 20,
  success_rate_percentage = 68,
  employment_rate_percentage = 92,
  growth_trend = 'stable',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis']
WHERE slug = 'expert-comptable';

UPDATE careers SET 
  testimonial = 'Créer des campagnes qui font parler, c''est mon quotidien ! Créativité + stratégie = job de rêve.',
  career_path = ARRAY['Chargé Marketing Junior', 'Responsable Marketing', 'Directeur Marketing', 'CMO / Consultant Stratégique'],
  concrete_jobs = ARRAY['Agences de communication (Dago, Dunes & Baobabs)', 'Grands groupes (CFAO, Nestlé)', 'Startups', 'Freelance marketing digital'],
  soft_skills_required = ARRAY['Créativité', 'Persuasion', 'Adaptabilité tendances', 'Gestion projets', 'Leadership équipe'],
  work_conditions = 'Environnement dynamique et créatif. Stress modéré (campagnes). Nombreux déplacements. Horaires parfois étendus (événements).',
  academic_difficulty = 'medium',
  training_cost_fcfa = 5000000,
  roi_months = 18,
  success_rate_percentage = 75,
  employment_rate_percentage = 80,
  growth_trend = 'growing',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saly']
WHERE slug = 'responsable-marketing';

UPDATE careers SET 
  testimonial = 'Être mon propre patron, créer de l''emploi, innover : liberté totale mais responsabilité énorme !',
  career_path = ARRAY['Porteur de projet (idéation)', 'Entrepreneur démarrage (0-2 ans)', 'Chef d''entreprise établie', 'Serial Entrepreneur / Investisseur'],
  concrete_jobs = ARRAY['Startup tech (apps, e-commerce)', 'Commerce import-export', 'Services (consulting, formation)', 'Agrobusiness, artisanat moderne'],
  soft_skills_required = ARRAY['Prise de risque calculée', 'Résilience aux échecs', 'Vision stratégique', 'Networking intense', 'Persévérance acharnée'],
  work_conditions = '70h/semaine au début. Stress financier permanent. Aucune sécurité. Liberté et satisfaction immenses si réussite.',
  academic_difficulty = 'easy',
  training_cost_fcfa = 2000000,
  roi_months = 36,
  success_rate_percentage = 40,
  employment_rate_percentage = 100,
  growth_trend = 'emerging',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Touba', 'Kaolack', 'Ziguinchor', 'Saint-Louis']
WHERE slug = 'entrepreneur';

UPDATE careers SET 
  testimonial = 'Accompagner les talents dans leur évolution professionnelle, c''est valorisant. Rôle humain stratégique.',
  career_path = ARRAY['Assistant RH', 'Gestionnaire RH', 'Responsable RH', 'DRH / Consultant RH'],
  concrete_jobs = ARRAY['Grandes entreprises (Sonatel, CFAO, SAR)', 'Cabinets RH (recrutement)', 'ONG internationales', 'Freelance RH pour PME'],
  soft_skills_required = ARRAY['Écoute active', 'Médiation conflits', 'Confidentialité absolue', 'Diplomatie', 'Organisation rigoureuse'],
  work_conditions = 'Bureau calme. Stress modéré (recrutements urgents, conflits). Nombreuses interactions. Parfois décisions difficiles (licenciements).',
  academic_difficulty = 'medium',
  training_cost_fcfa = 4000000,
  roi_months = 22,
  success_rate_percentage = 78,
  employment_rate_percentage = 82,
  growth_trend = 'stable',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis']
WHERE slug = 'gestionnaire-rh';

-- ARTS & COMMUNICATION
-- --------------------

UPDATE careers SET 
  testimonial = 'Chaque projet est une toile blanche. Voir mes créations sur panneaux publicitaires, c''est magique !',
  career_path = ARRAY['Graphiste Junior', 'Designer Confirmé', 'Directeur Artistique', 'Freelance Établi / Fondateur Studio'],
  concrete_jobs = ARRAY['Agences comm (Dago, Digital Africa)', 'Freelance (Fiverr, Upwork, clients locaux)', 'Startups tech (UI/UX)', 'Imprimeries haut de gamme'],
  soft_skills_required = ARRAY['Créativité visuelle', 'Respect deadlines', 'Écoute clients', 'Adaptabilité styles', 'Curiosité tendances'],
  work_conditions = 'Horaires flexibles (freelance). Deadlines serrées = stress. Beaucoup d''écran. Satisfaction créative élevée. Revenu variable au début.',
  academic_difficulty = 'medium',
  training_cost_fcfa = 2500000,
  roi_months = 12,
  success_rate_percentage = 80,
  employment_rate_percentage = 75,
  growth_trend = 'growing',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saly']
WHERE slug = 'designer-graphique';

UPDATE careers SET 
  testimonial = 'Animer les réseaux sociaux, créer du buzz, interagir avec des milliers de personnes : jamais routinier !',
  career_path = ARRAY['Community Manager Junior', 'CM Senior / Social Media Manager', 'Responsable Digital', 'Consultant Social Media / Formateur'],
  concrete_jobs = ARRAY['Entreprises (toutes tailles)', 'Agences digitales', 'Freelance multi-clients', 'Influenceurs/Personal branding'],
  soft_skills_required = ARRAY['Réactivité 24/7', 'Gestion critique/haters', 'Créativité contenu', 'Analyse data', 'Adaptabilité plateformes'],
  work_conditions = 'Connexion permanente (même week-end). Stress gestion crises. Créatif et varié. Salaire modeste au début, évolutif.',
  academic_difficulty = 'easy',
  training_cost_fcfa = 1500000,
  roi_months = 8,
  success_rate_percentage = 85,
  employment_rate_percentage = 88,
  growth_trend = 'growing',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor']
WHERE slug = 'community-manager';

UPDATE careers SET 
  testimonial = 'Enquêter, dévoiler des vérités, informer le public : un métier de passion malgré les difficultés.',
  career_path = ARRAY['Stagiaire / Pigiste', 'Journaliste (presse/radio/TV)', 'Rédacteur en Chef', 'Directeur Publication / Éditorialiste'],
  concrete_jobs = ARRAY['Médias nationaux (RTS, Walf, Dakaractu)', 'Radios privées (RFM, Sud FM)', 'Presse internationale (RFI, France24)', 'Médias en ligne indépendants'],
  soft_skills_required = ARRAY['Curiosité insatiable', 'Courage (sujets sensibles)', 'Écriture fluide', 'Vérification sources', 'Éthique déontologique'],
  work_conditions = 'Horaires imprévisibles (actualité 24/7). Déplacements terrain fréquents. Pression éditoriale. Salaires parfois modestes. Passion nécessaire.',
  academic_difficulty = 'medium',
  training_cost_fcfa = 3500000,
  roi_months = 30,
  success_rate_percentage = 70,
  employment_rate_percentage = 65,
  growth_trend = 'declining',
  geographic_availability = ARRAY['Dakar', 'Saint-Louis', 'Thiès', 'Ziguinchor']
WHERE slug = 'journaliste';

UPDATE careers SET 
  testimonial = 'Capturer l''émotion d''un mariage ou la beauté d''un paysage : l''art qui nourrit son homme !',
  career_path = ARRAY['Assistant Photographe', 'Photographe Indépendant', 'Photographe Établi (studio)', 'Directeur Photo / Formateur'],
  concrete_jobs = ARRAY['Freelance mariages/événements', 'Studios photo commerciaux', 'Photographe presse/mode', 'Vente d''art (galeries)'],
  soft_skills_required = ARRAY['Sens artistique', 'Relationnel clients', 'Patience (prises multiples)', 'Adaptabilité lumière', 'Gestion agenda'],
  work_conditions = 'Horaires irréguliers (événements soir/week-end). Déplacements fréquents. Investissement matériel lourd. Revenu saisonnier (pic mariages).',
  academic_difficulty = 'easy',
  training_cost_fcfa = 1800000,
  roi_months = 15,
  success_rate_percentage = 82,
  employment_rate_percentage = 70,
  growth_trend = 'stable',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saly', 'Saint-Louis', 'Ziguinchor']
WHERE slug = 'photographe-professionnel';

-- DROIT & SOCIAL
-- --------------

UPDATE careers SET 
  testimonial = 'Défendre la justice, plaider devant les juges : chaque victoire est une bataille gagnée pour mon client.',
  career_path = ARRAY['Avocat Stagiaire (2 ans)', 'Avocat Inscrit au Barreau', 'Avocat Associé (cabinet)', 'Bâtonnier / Avocat d''Affaires International'],
  concrete_jobs = ARRAY['Cabinets d''avocats (Dakar, Thiès)', 'Avocat indépendant', 'Conseil juridique entreprises', 'ONG droits humains'],
  soft_skills_required = ARRAY['Éloquence', 'Argumentation solide', 'Gestion stress (procès)', 'Confidentialité clients', 'Culture juridique vaste'],
  work_conditions = 'Préparation dossiers intense (longues heures). Stress élevé (audiences). Déplacements tribunaux. Rémunération excellente si établi.',
  academic_difficulty = 'very_hard',
  training_cost_fcfa = 9000000,
  roi_months = 30,
  success_rate_percentage = 62,
  employment_rate_percentage = 78,
  growth_trend = 'stable',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack']
WHERE slug = 'avocat';

UPDATE careers SET 
  testimonial = 'Aider les familles en détresse à retrouver espoir : l''humain avant tout, chaque jour.',
  career_path = ARRAY['Assistant Social Débutant', 'Travailleur Social Confirmé', 'Responsable Service Social', 'Coordinateur ONG / Formateur'],
  concrete_jobs = ARRAY['Mairies (action sociale)', 'ONG (Plan International, Enda)', 'Hôpitaux (service social)', 'Ministère Santé/Solidarité'],
  soft_skills_required = ARRAY['Empathie profonde', 'Non-jugement', 'Écoute active', 'Résilience émotionnelle', 'Travail réseau (partenaires)'],
  work_conditions = 'Confrontation à la misère quotidienne. Charge émotionnelle lourde. Salaires modestes. Gratification humaine immense.',
  academic_difficulty = 'medium',
  training_cost_fcfa = 2000000,
  roi_months = 40,
  success_rate_percentage = 82,
  employment_rate_percentage = 80,
  growth_trend = 'stable',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Louga', 'Tambacounda']
WHERE slug = 'assistant-social';

UPDATE careers SET 
  testimonial = 'Accompagner les gens dans leurs souffrances psychologiques et les voir aller mieux : magnifique.',
  career_path = ARRAY['Psychologue Clinicien Débutant', 'Psychologue Confirmé', 'Psychothérapeute Spécialisé', 'Superviseur / Chercheur / Formateur'],
  concrete_jobs = ARRAY['Hôpitaux psychiatriques (Fann)', 'Cabinets privés', 'Écoles (psychologues scolaires)', 'ONG (trauma, réfugiés)'],
  soft_skills_required = ARRAY['Écoute sans jugement', 'Neutralité bienveillante', 'Gestion émotions propres', 'Patience', 'Confidentialité stricte'],
  work_conditions = 'Charge émotionnelle élevée (récits traumatiques). Horaires flexibles (cabinet privé). Formation continue obligatoire. Salaires variables.',
  academic_difficulty = 'hard',
  training_cost_fcfa = 5000000,
  roi_months = 28,
  success_rate_percentage = 72,
  employment_rate_percentage = 75,
  growth_trend = 'growing',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis']
WHERE slug = 'psychologue';

-- MÉTIERS TECHNIQUES
-- ------------------

UPDATE careers SET 
  testimonial = 'Dépanner une panne électrique et voir le sourire du client : satisfaction immédiate et bons revenus !',
  career_path = ARRAY['Apprenti Électricien', 'Électricien Qualifié', 'Chef d''Équipe Électricité', 'Entrepreneur Électricité (propre entreprise)'],
  concrete_jobs = ARRAY['Entreprises BTP (EIFFAGE, NECOTRANS)', 'Électricien indépendant (dépannages)', 'Senelec (réseau national)', 'Projets solaires (énergies renouvelables)'],
  soft_skills_required = ARRAY['Rigueur sécurité', 'Résolution problèmes pratiques', 'Relation client', 'Ponctualité', 'Travail en hauteur (pas peur vide)'],
  work_conditions = 'Travail physique (debout, escaliers, échelles). Risques électriques si imprudence. Horaires réguliers. Demande constante = emploi stable.',
  academic_difficulty = 'easy',
  training_cost_fcfa = 800000,
  roi_months = 6,
  success_rate_percentage = 90,
  employment_rate_percentage = 95,
  growth_trend = 'growing',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Louga', 'Tambacounda', 'Kolda']
WHERE slug = 'electricien-batiment';

UPDATE careers SET 
  testimonial = 'Réparer les voitures, c''est mon quotidien. Avec l''électrique qui arrive, le métier évolue vite !',
  career_path = ARRAY['Apprenti Mécanicien', 'Mécanicien Qualifié', 'Chef d''Atelier', 'Propriétaire Garage / Formateur'],
  concrete_jobs = ARRAY['Garages indépendants', 'Concessionnaires (Toyota, Renault)', 'Entreprises de transport', 'Mécanicien mobile (dépannages)'],
  soft_skills_required = ARRAY['Diagnostic précis', 'Patience (pannes complexes)', 'Force physique', 'Honnêteté (confiance clients)', 'Adaptabilité (nouveaux véhicules)'],
  work_conditions = 'Travail salissant (huile, graisse). Debout toute la journée. Chaleur (ateliers). Exposition produits chimiques. Demande forte = emploi stable.',
  academic_difficulty = 'easy',
  training_cost_fcfa = 1000000,
  roi_months = 8,
  success_rate_percentage = 88,
  employment_rate_percentage = 92,
  growth_trend = 'stable',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Louga', 'Tambacounda']
WHERE slug = 'mecanicien-automobile';

UPDATE careers SET 
  testimonial = 'Dépanner les PC, installer les réseaux : le numérique a besoin de nous partout, métier d''avenir !',
  career_path = ARRAY['Technicien Junior', 'Technicien Confirmé', 'Responsable Support Technique', 'Consultant IT / Entrepreneur (maintenance)'],
  concrete_jobs = ARRAY['Services informatiques entreprises', 'Boutiques vente/réparation PC', 'Freelance dépannage à domicile', 'Administrations publiques'],
  soft_skills_required = ARRAY['Diagnostic logique', 'Pédagogie (expliquer utilisateurs)', 'Patience (utilisateurs non-tech)', 'Veille techno', 'Polyvalence (hard/soft)'],
  work_conditions = 'Bureau climatisé ou déplacements clients. Horaires réguliers. Sollicitations urgentes (pannes). Posture assise prolongée. Salaire correct et stable.',
  academic_difficulty = 'medium',
  training_cost_fcfa = 2000000,
  roi_months = 10,
  success_rate_percentage = 82,
  employment_rate_percentage = 88,
  growth_trend = 'growing',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor']
WHERE slug = 'technicien-maintenance-informatique';

-- AGRICULTURE & ENVIRONNEMENT
-- ---------------------------

UPDATE careers SET 
  testimonial = 'Moderniser l''agriculture sénégalaise, améliorer les rendements : contribuer à la sécurité alimentaire, c''est noble.',
  career_path = ARRAY['Agronome Junior (conseil)', 'Ingénieur Agronome Confirmé', 'Chef de Projet Agricole', 'Directeur Exploitation / Chercheur'],
  concrete_jobs = ARRAY['Projets agricoles (PNDA, PRACAS)', 'ONG développement rural', 'Sociétés agro-industrielles (CSS, SOCAS)', 'Consultant indépendant'],
  soft_skills_required = ARRAY['Pédagogie (former paysans)', 'Adaptabilité terrain', 'Vision long terme', 'Gestion projets', 'Passion agriculture'],
  work_conditions = 'Beaucoup de terrain (zones rurales, chaleur, poussière). Déplacements fréquents. Salaires variables selon secteur (public/privé). Gratifiant.',
  academic_difficulty = 'hard',
  training_cost_fcfa = 5500000,
  roi_months = 26,
  success_rate_percentage = 75,
  employment_rate_percentage = 78,
  growth_trend = 'growing',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Kolda', 'Tambacounda']
WHERE slug = 'agronome';

UPDATE careers SET 
  testimonial = 'Soigner les animaux, veiller sur les élevages : médecine vétérinaire est essentielle en milieu rural.',
  career_path = ARRAY['Vétérinaire Assistant', 'Vétérinaire Praticien', 'Vétérinaire Spécialisé', 'Directeur Services Vétérinaires / Chercheur'],
  concrete_jobs = ARRAY['Cliniques vétérinaires (animaux de compagnie)', 'Élevages industriels (volailles, bétail)', 'Services publics (contrôle sanitaire)', 'Recherche (ISRA)'],
  soft_skills_required = ARRAY['Amour des animaux', 'Résistance physique (manipulation)', 'Pédagogie (éleveurs)', 'Disponibilité (urgences)', 'Courage (zoonoses)'],
  work_conditions = 'Déplacements ruraux fréquents. Gardes possibles (urgences). Exposition maladies animales. Salaires corrects. Passion animaux indispensable.',
  academic_difficulty = 'very_hard',
  training_cost_fcfa = 14000000,
  roi_months = 32,
  success_rate_percentage = 58,
  employment_rate_percentage = 82,
  growth_trend = 'stable',
  geographic_availability = ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Louga', 'Kolda', 'Tambacounda']
WHERE slug = 'veterinaire';

-- PARTIE 3 : AJOUT DE 10 NOUVEAUX MÉTIERS STRATÉGIQUES
-- =====================================================

INSERT INTO careers (
  title, slug, category, subcategory, description, short_description,
  suitable_for_bfem, suitable_for_bac,
  required_studies, required_skills,
  work_environment, average_salary_min, average_salary_max, job_market,
  interest_scientific, interest_literary, interest_technical, interest_artistic, interest_social, interest_commercial,
  important_subjects, financial_requirement, requires_network, preferred_location, religious_friendly,
  testimonial, career_path, concrete_jobs, soft_skills_required, work_conditions,
  academic_difficulty, training_cost_fcfa, roi_months, success_rate_percentage, employment_rate_percentage,
  growth_trend, geographic_availability, icon
) VALUES

-- 1) PROFESSEUR (ENSEIGNANT SECONDAIRE)
(
  'Professeur Collège/Lycée',
  'professeur-secondaire',
  'education',
  'Enseignement',
  'Enseigner une discipline (Maths, SVT, Français, Histoire...) à des collégiens ou lycéens. Former la jeunesse, transmettre savoirs et valeurs. Rôle central dans l''éducation nationale.',
  'Enseignant du secondaire, formateur de la jeunesse.',
  false, true,
  ARRAY['Licence + FASTEF (2 ans)', 'Master + CAEM'],
  ARRAY['Pédagogie', 'Patience', 'Autorité bienveillante', 'Maîtrise discipline', 'Communication'],
  'Bureau', 400000, 1200000, 'Excellent',
  60, 70, 30, 20, 85, 15,
  ARRAY['Français', 'Mathématiques', 'SVT', 'Histoire-Géographie'],
  'low', false, 'semi-urban', 'neutral',
  'Former les citoyens de demain, c''est semer des graines qui germeront des années plus tard. Mission noble !',
  ARRAY['Élève-professeur (FASTEF)', 'Professeur Titulaire', 'Professeur Principal', 'Inspecteur Pédagogique / Censeur'],
  ARRAY['Collèges/Lycées publics', 'Établissements privés', 'Cours particuliers (complément)', 'Formation professionnelle'],
  ARRAY['Pédagogie adaptée', 'Gestion classe (discipline)', 'Passion transmission', 'Patience infinie', 'Actualisation savoirs'],
  'Horaires réguliers (8h-17h). Vacances scolaires généreuses. Corrections copies (soirées). Salaire modeste mais stable. Respect social.',
  'medium', 3000000, 24, 80, 95,
  'stable', ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Louga', 'Tambacounda', 'Kolda', 'Matam'],
  'GraduationCap'
),

-- 2) INFIRMIER
(
  'Infirmier d''État',
  'infirmier-etat',
  'sciences',
  'Santé',
  'Prodiguer des soins aux patients sous supervision médicale, administrer traitements, surveiller état de santé, accompagner dans les gestes quotidiens. Maillon essentiel du système de santé.',
  'Professionnel de santé en première ligne auprès des patients.',
  false, true,
  ARRAY['Diplôme d''État Infirmier (3 ans)', 'Licence en Sciences Infirmières'],
  ARRAY['Soins techniques', 'Empathie', 'Résistance physique', 'Rigueur hygiène', 'Gestion urgences'],
  'Mixte', 300000, 900000, 'Excellent',
  70, 15, 40, 5, 90, 10,
  ARRAY['SVT', 'Chimie', 'Français'],
  'low', false, 'urban', 'neutral',
  'Chaque jour, je sauve des vies et apporte du réconfort. Métier dur mais tellement humain et gratifiant.',
  ARRAY['Infirmier Débutant', 'Infirmier Confirmé', 'Infirmier Spécialisé (réanimation, bloc...)', 'Cadre Infirmier / Formateur'],
  ARRAY['Hôpitaux publics', 'Cliniques privées', 'Centres de santé ruraux', 'ONG médicales (MSF)'],
  ARRAY['Empathie patients', 'Résistance stress', 'Travail d''équipe', 'Discrétion médicale', 'Polyvalence soins'],
  'Horaires lourds (3x8, gardes de nuit/week-end). Debout toute la journée. Exposition maladies. Charge émotionnelle. Salaires modestes mais stables.',
  'medium', 2500000, 20, 85, 98,
  'growing', ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Louga', 'Tambacounda', 'Kolda'],
  'HeartPulse'
),

-- 3) BANQUIER (CONSEILLER CLIENTÈLE)
(
  'Conseiller Bancaire',
  'conseiller-bancaire',
  'commerce',
  'Banque & Finance',
  'Accueillir et conseiller les clients sur produits bancaires (comptes, crédits, épargne, assurances). Gérer un portefeuille clients et développer l''activité commerciale de la banque.',
  'Expert en conseil et produits financiers bancaires.',
  false, true,
  ARRAY['Licence Finance/Banque', 'Master Banque/Finance'],
  ARRAY['Connaissance produits bancaires', 'Commercial', 'Relationnel clients', 'Rigueur', 'Chiffres'],
  'Bureau', 500000, 2000000, 'Bon',
  40, 30, 20, 10, 60, 90,
  ARRAY['Mathématiques', 'Économie', 'Français'],
  'medium', true, 'urban', 'neutral',
  'Accompagner les clients dans leurs projets financiers, c''est gratifiant. Salaire attractif et évolution rapide si performant.',
  ARRAY['Chargé Clientèle Junior', 'Conseiller Clientèle', 'Conseiller Patrimonial', 'Directeur d''Agence / Responsable Segment'],
  ARRAY['Banques (CBAO, Ecobank, BOA, BHS)', 'Institutions microfinance', 'Banques islamiques (BIS)', 'Banques en ligne (Yup, Wave)'],
  ARRAY['Aisance relationnelle', 'Persuasion', 'Gestion objectifs commerciaux', 'Discrétion financière', 'Présentation soignée'],
  'Horaires réguliers (8h-17h). Pression objectifs commerciaux (mensuel). Environnement climatisé. Salaires corrects + primes. Stabilité emploi.',
  'medium', 4500000, 18, 75, 85,
  'stable', ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba'],
  'Landmark'
),

-- 4) CHEF CUISINIER
(
  'Chef Cuisinier',
  'chef-cuisinier',
  'tourisme',
  'Hôtellerie-Restauration',
  'Concevoir des plats, diriger une brigade en cuisine, gérer approvisionnements et stocks. Créativité culinaire et gestion d''équipe. Travail dans restaurants, hôtels ou en chef à domicile.',
  'Expert en art culinaire et gestion de cuisine.',
  true, true,
  ARRAY['CAP/BEP Cuisine', 'Formation hôtelière', 'Expérience terrain'],
  ARRAY['Créativité culinaire', 'Maîtrise techniques cuisson', 'Gestion équipe', 'Hygiène stricte', 'Rapidité exécution'],
  'Atelier', 300000, 1500000, 'Bon',
  15, 20, 60, 70, 50, 40,
  ARRAY['Sciences', 'Arts plastiques'],
  'low', true, 'urban', 'neutral',
  'Créer des plats qui régalent, voir les sourires des clients : ma passion est devenue mon métier !',
  ARRAY['Commis de Cuisine', 'Chef de Partie', 'Sous-Chef', 'Chef Cuisinier / Chef Exécutif'],
  ARRAY['Restaurants gastronomiques (Dakar)', 'Hôtels (Radisson, King Fahd Palace)', 'Traiteur événements', 'Chef à domicile (particuliers)'],
  ARRAY['Créativité recettes', 'Leadership cuisine', 'Gestion stress (coups de feu)', 'Sens gustatif', 'Organisation rigoureuse'],
  'Horaires décalés (soir, week-end, jours fériés). Chaleur intense (fourneaux). Debout toute la journée. Stress services. Salaires variables selon standing.',
  'easy', 1200000, 12, 85, 80,
  'growing', ARRAY['Dakar', 'Thiès', 'Saly', 'Saint-Louis', 'Ziguinchor'],
  'ChefHat'
),

-- 5) COUTURIER / STYLISTE
(
  'Couturier / Styliste',
  'couturier-styliste',
  'artisanat',
  'Mode & Textile',
  'Créer, coudre et ajuster des vêtements sur mesure ou en série. Maîtriser les techniques de coupe, couture et finitions. Peut aussi créer ses propres collections (stylisme).',
  'Artisan créateur de vêtements et mode.',
  true, true,
  ARRAY['CAP Couture', 'Formation mode/stylisme', 'Apprentissage traditionnel'],
  ARRAY['Couture machine/main', 'Sens esthétique', 'Prise mesures', 'Créativité', 'Relation client'],
  'Atelier', 200000, 1200000, 'Bon',
  5, 20, 80, 90, 60, 50,
  ARRAY['Arts plastiques', 'Mathématiques (mesures)'],
  'low', true, 'semi-urban', 'neutral',
  'Transformer un tissu en tenue magnifique, c''est magique ! Métier ancestral qui nourrit bien avec talent et réseau.',
  ARRAY['Apprenti Couturier', 'Couturier Qualifié', 'Maître Couturier / Styliste', 'Créateur de Marque (propre atelier)'],
  ARRAY['Ateliers de couture (Sandaga, Colobane)', 'Stylistes événements (mariages)', 'Marques mode locale (Tongoro, Diarra Ndiaye)', 'Export (diaspora)'],
  ARRAY['Précision gestes', 'Patience (finitions)', 'Créativité mode', 'Gestion commandes', 'Négociation prix'],
  'Horaires flexibles (indépendant). Pics activité (fêtes, mariages). Posture assise prolongée. Pression délais. Revenus saisonniers.',
  'easy', 500000, 6, 90, 88,
  'stable', ARRAY['Dakar', 'Thiès', 'Kaolack', 'Ziguinchor', 'Touba', 'Saint-Louis'],
  'Scissors'
),

-- 6) MAÇON
(
  'Maçon',
  'macon',
  'technique',
  'BTP',
  'Construire, réparer et rénover des bâtiments (murs, fondations, dalles). Métier physique et technique, pilier du secteur du bâtiment. Forte demande avec le boom immobilier.',
  'Artisan constructeur de bâtiments.',
  true, true,
  ARRAY['CAP Maçonnerie', 'Apprentissage chantier', 'Formation professionnelle'],
  ARRAY['Technique construction', 'Force physique', 'Lecture plans', 'Rigueur sécurité', 'Travail équipe'],
  'Terrain', 250000, 1000000, 'Excellent',
  30, 5, 95, 10, 40, 20,
  ARRAY['Mathématiques', 'Physique'],
  'low', false, 'rural', 'neutral',
  'Construire des maisons, voir les familles emménager : satisfaction de créer du concret et du durable.',
  ARRAY['Aide-Maçon', 'Maçon Qualifié', 'Chef d''Équipe', 'Entrepreneur BTP (propre entreprise)'],
  ARRAY['Entreprises BTP (Eiffage, CSE)', 'Artisan indépendant', 'Chantiers privés (auto-construction)', 'Travaux publics'],
  ARRAY['Endurance physique', 'Résistance chaleur', 'Précision gestes', 'Lecture plans simples', 'Ponctualité chantiers'],
  'Travail très physique (port de charges). Exposition soleil/intempéries. Horaires chantier (6h-15h). Risques accidents. Demande forte = emploi stable.',
  'easy', 600000, 5, 92, 98,
  'growing', ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Louga', 'Tambacounda', 'Kolda'],
  'Hammer'
),

-- 7) CHAUFFEUR PROFESSIONNEL
(
  'Chauffeur Professionnel',
  'chauffeur-professionnel',
  'transport',
  'Transport & Logistique',
  'Conduire des véhicules légers ou lourds pour transporter personnes ou marchandises. Assurer sécurité passagers/cargaison et respecter le code de la route. Métier accessible et très demandé.',
  'Conducteur professionnel transport personnes/marchandises.',
  true, true,
  ARRAY['Permis B/C/D', 'Formation conduite professionnelle', 'Expérience pratique'],
  ARRAY['Conduite sécuritaire', 'Orientation géographique', 'Patience circulation', 'Courtoisie', 'Maintenance basique véhicule'],
  'Terrain', 200000, 800000, 'Excellent',
  10, 10, 60, 5, 50, 30,
  ARRAY['Aucune matière spécifique'],
  'low', false, 'urban', 'neutral',
  'Conduire toute la journée, rencontrer plein de gens : métier simple mais indispensable. Toujours du travail !',
  ARRAY['Chauffeur Débutant', 'Chauffeur Expérimenté', 'Chauffeur VIP/Transport lourd', 'Propriétaire véhicule (taxi, transport)'],
  ARRAY['Taxis (urbains, inter-urbains)', 'Entreprises (chauffeur société)', 'VTC (Yango, Heetch)', 'Transport marchandises'],
  ARRAY['Vigilance route', 'Ponctualité', 'Amabilité passagers', 'Résistance fatigue', 'Connaissance itinéraires'],
  'Longues heures assis. Stress circulation (embouteillages). Risques accidents. Horaires variables (jour/nuit). Revenus corrects si actif.',
  'easy', 400000, 4, 95, 98,
  'stable', ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Louga', 'Tambacounda'],
  'Car'
),

-- 8) FORMATEUR PROFESSIONNEL
(
  'Formateur Professionnel',
  'formateur-professionnel',
  'education',
  'Formation Continue',
  'Transmettre des compétences techniques ou comportementales à des adultes en formation continue (entreprises, centres de formation). Concevoir modules pédagogiques et animer sessions.',
  'Expert en transmission de compétences professionnelles.',
  false, true,
  ARRAY['Licence + Expertise métier', 'Certification formateur (FPC)'],
  ARRAY['Pédagogie adultes', 'Maîtrise discipline', 'Animation groupe', 'Conception supports', 'Évaluation compétences'],
  'Bureau', 400000, 1500000, 'Bon',
  40, 60, 50, 30, 80, 60,
  ARRAY['Français', 'Matières spécialité'],
  'low', true, 'urban', 'neutral',
  'Former des professionnels, les voir progresser et réussir : valorisant et varié. Chaque session est unique !',
  ARRAY['Formateur Junior', 'Formateur Confirmé', 'Formateur Senior / Expert', 'Responsable Pédagogique / Consultant Formation'],
  ARRAY['Centres de formation (3FPT, CFPT)', 'Cabinets conseil RH/formation', 'Entreprises (formation interne)', 'Freelance multi-clients'],
  ARRAY['Pédagogie interactive', 'Adaptabilité publics', 'Créativité supports', 'Gestion temps (sessions)', 'Écoute apprenants'],
  'Horaires variables (sessions). Déplacements fréquents (entreprises clientes). Préparation séances (soirées). Salaires corrects, stables si établi.',
  'medium', 2500000, 16, 80, 82,
  'growing', ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack'],
  'BookOpen'
),

-- 9) AGENT IMMOBILIER
(
  'Agent Immobilier',
  'agent-immobilier',
  'commerce',
  'Immobilier',
  'Mettre en relation vendeurs et acheteurs (ou propriétaires et locataires) de biens immobiliers. Estimer valeurs, organiser visites, négocier et conclure transactions. Commissions attractives.',
  'Intermédiaire transactions immobilières.',
  true, true,
  ARRAY['Bac (minimum)', 'Formation immobilier (optionnel)', 'Carte professionnelle'],
  ARRAY['Commercial', 'Négociation', 'Connaissance marché', 'Relationnel', 'Prospection'],
  'Terrain', 300000, 3000000, 'Bon',
  10, 30, 20, 20, 60, 95,
  ARRAY['Économie', 'Français', 'Mathématiques'],
  'low', true, 'urban', 'neutral',
  'Chaque vente est une victoire ! Revenus variables mais potentiel énorme si bon réseau et persévérance.',
  ARRAY['Agent Immobilier Junior', 'Agent Confirmé', 'Négociateur Senior', 'Propriétaire Agence / Promoteur Immobilier'],
  ARRAY['Agences immobilières (Sénégal Immobilier, Century21)', 'Agent indépendant', 'Promoteurs immobiliers', 'Gestion locative'],
  ARRAY['Prospection intensive', 'Persuasion', 'Réseau large', 'Présentation soignée', 'Ténacité (rejets fréquents)'],
  'Horaires flexibles (visites soir/week-end). Déplacements constants. Revenus 100% commission au début. Pression résultats. Potentiel gains élevé.',
  'easy', 800000, 10, 75, 75,
  'growing', ARRAY['Dakar', 'Thiès', 'Saly', 'Mbour'],
  'Home'
),

-- 10) COIFFEUR / BARBIER
(
  'Coiffeur / Barbier',
  'coiffeur-barbier',
  'artisanat',
  'Services à la personne',
  'Couper, coiffer, entretenir cheveux et barbes. Conseiller clients sur styles et soins capillaires. Métier créatif et relationnel, accessible avec faible investissement initial.',
  'Artisan de la coiffure et de l''esthétique capillaire.',
  true, true,
  ARRAY['CAP Coiffure', 'Apprentissage salon', 'Formation courte'],
  ARRAY['Techniques coupe/coiffure', 'Sens esthétique', 'Relationnel client', 'Hygiène', 'Créativité styles'],
  'Atelier', 150000, 800000, 'Excellent',
  5, 10, 70, 85, 80, 60,
  ARRAY['Aucune matière spécifique'],
  'low', true, 'semi-urban', 'neutral',
  'Transformer l''apparence des clients, discuter, créer des styles : métier convivial et créatif qui paye bien !',
  ARRAY['Apprenti Coiffeur', 'Coiffeur Qualifié', 'Maître Coiffeur', 'Propriétaire Salon (franchise)'],
  ARRAY['Salons de coiffure (quartiers)', 'Barbershops modernes', 'Coiffeur à domicile', 'Événements (mariages, défilés)'],
  ARRAY['Dextérité manuelle', 'Écoute client', 'Créativité coiffures', 'Sens commercial', 'Patience (coupes longues)'],
  'Debout toute la journée. Horaires étendus (soirées, week-end). Gestes répétitifs. Exposition produits chimiques. Revenus corrects et fidélisation clientèle.',
  'easy', 400000, 5, 92, 90,
  'stable', ARRAY['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Louga'],
  'Scissors'
);

-- ============================================
-- FIN DE LA MIGRATION PHASE 1.5
-- ============================================

-- VÉRIFICATION POST-MIGRATION
SELECT COUNT(*) as total_careers FROM careers;
SELECT category, COUNT(*) as count FROM careers GROUP BY category ORDER BY count DESC;
SELECT slug, testimonial IS NOT NULL as has_testimonial, array_length(career_path, 1) as career_steps FROM careers;
