-- =====================================================
-- MIGRATION: Ajout des champs socio-économiques et religieux
-- Date: 23 octobre 2025
-- Description: Ajoute 4 nouveaux champs à la table careers pour supporter
--              le matching contextuel (financier, réseau, localisation, religieux)
-- =====================================================

-- ÉTAPE 1: Ajouter les nouvelles colonnes
-- =====================================================
ALTER TABLE careers 
ADD COLUMN IF NOT EXISTS financial_requirement VARCHAR(10) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS requires_network BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(20) DEFAULT 'urban',
ADD COLUMN IF NOT EXISTS religious_friendly VARCHAR(20) DEFAULT 'neutral';

-- ÉTAPE 2: Mettre à jour les 20 métiers existants avec des valeurs cohérentes
-- =====================================================

-- CATÉGORIE: SCIENCES & TECHNOLOGIES
UPDATE careers SET 
  financial_requirement = 'high', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'ingenieur-informatique';

UPDATE careers SET 
  financial_requirement = 'high', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'medecin-generaliste';

UPDATE careers SET 
  financial_requirement = 'high', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'data-scientist';

UPDATE careers SET 
  financial_requirement = 'high', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'pharmacien';

-- CATÉGORIE: COMMERCE & GESTION
UPDATE careers SET 
  financial_requirement = 'medium', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'expert-comptable';

UPDATE careers SET 
  financial_requirement = 'medium', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'responsable-marketing';

UPDATE careers SET 
  financial_requirement = 'medium', 
  requires_network = true, 
  preferred_location = 'semi-urban', 
  religious_friendly = 'neutral'
WHERE slug = 'entrepreneur';

UPDATE careers SET 
  financial_requirement = 'medium', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'gestionnaire-rh';

-- CATÉGORIE: ARTS & COMMUNICATION
UPDATE careers SET 
  financial_requirement = 'low', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'designer-graphique';

UPDATE careers SET 
  financial_requirement = 'low', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'community-manager';

UPDATE careers SET 
  financial_requirement = 'medium', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'journaliste';

UPDATE careers SET 
  financial_requirement = 'low', 
  requires_network = true, 
  preferred_location = 'semi-urban', 
  religious_friendly = 'neutral'
WHERE slug = 'photographe-professionnel';

-- CATÉGORIE: DROIT & SOCIAL
UPDATE careers SET 
  financial_requirement = 'high', 
  requires_network = true, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'avocat';

UPDATE careers SET 
  financial_requirement = 'low', 
  requires_network = false, 
  preferred_location = 'semi-urban', 
  religious_friendly = 'friendly'
WHERE slug = 'assistant-social';

UPDATE careers SET 
  financial_requirement = 'medium', 
  requires_network = false, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'psychologue';

-- CATÉGORIE: MÉTIERS TECHNIQUES
UPDATE careers SET 
  financial_requirement = 'low', 
  requires_network = false, 
  preferred_location = 'rural', 
  religious_friendly = 'neutral'
WHERE slug = 'electricien-batiment';

UPDATE careers SET 
  financial_requirement = 'low', 
  requires_network = false, 
  preferred_location = 'semi-urban', 
  religious_friendly = 'neutral'
WHERE slug = 'mecanicien-automobile';

UPDATE careers SET 
  financial_requirement = 'medium', 
  requires_network = false, 
  preferred_location = 'urban', 
  religious_friendly = 'neutral'
WHERE slug = 'technicien-maintenance-informatique';

-- CATÉGORIE: AGRICULTURE & ENVIRONNEMENT
UPDATE careers SET 
  financial_requirement = 'medium', 
  requires_network = false, 
  preferred_location = 'rural', 
  religious_friendly = 'neutral'
WHERE slug = 'agronome';

UPDATE careers SET 
  financial_requirement = 'high', 
  requires_network = false, 
  preferred_location = 'rural', 
  religious_friendly = 'neutral'
WHERE slug = 'veterinaire';

-- ÉTAPE 3: Vérifier les résultats
-- =====================================================
-- Exécuter cette requête pour vérifier que tous les métiers ont été mis à jour
SELECT 
  slug,
  title,
  financial_requirement,
  requires_network,
  preferred_location,
  religious_friendly
FROM careers
ORDER BY category, slug;

-- =====================================================
-- INSTRUCTIONS D'EXÉCUTION:
-- =====================================================
-- 1. Faire une sauvegarde de la table careers avant d'exécuter:
--    - Dans Supabase Dashboard > SQL Editor > Copier la structure et données
--    - Ou exporter via: pg_dump si vous avez accès direct
--
-- 2. Exécuter ce script dans Supabase SQL Editor:
--    - Copier tout le contenu du fichier
--    - Coller dans SQL Editor
--    - Cliquer sur "Run" ou Ctrl+Enter
--
-- 3. Vérifier les résultats avec la requête SELECT à la fin
--
-- 4. Si tout est OK, tester le matching avec le nouveau questionnaire
--
-- ROLLBACK (si nécessaire):
-- =====================================================
-- ALTER TABLE careers 
-- DROP COLUMN IF EXISTS financial_requirement,
-- DROP COLUMN IF EXISTS requires_network,
-- DROP COLUMN IF EXISTS preferred_location,
-- DROP COLUMN IF EXISTS religious_friendly;
-- =====================================================
