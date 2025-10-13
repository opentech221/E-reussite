-- ============================================================================
-- MIGRATION: Create shared_links table for Dub.co link tracking
-- Date: 11 octobre 2025
-- Description: Stocke tous les liens courts créés via Dub.co pour tracking et historique
-- ============================================================================

-- Table pour stocker les liens courts créés
CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations du lien Dub.co
  short_link TEXT NOT NULL, -- Ex: https://dub.sh/abc123
  original_url TEXT NOT NULL,
  link_id TEXT, -- ID retourné par Dub.co (ex: 'abc123')
  domain TEXT DEFAULT 'dub.sh',
  key TEXT, -- Slug personnalisé (ex: 'invite-john')
  
  -- Métadonnées du contenu partagé
  link_type TEXT NOT NULL CHECK (link_type IN ('course', 'referral', 'certificate', 'quiz', 'exam', 'perplexity')),
  resource_id UUID, -- ID de la ressource partagée (course_id, quiz_id, etc.)
  title TEXT,
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Analytics snapshot (mis à jour périodiquement via getLinkAnalytics)
  clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  analytics JSONB, -- Snapshot complet des analytics Dub.co
  last_analytics_update TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ -- Date d'expiration optionnelle
);

-- ============================================================================
-- INDEX pour améliorer les performances
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shared_links_user_id ON shared_links(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_type ON shared_links(link_type);
CREATE INDEX IF NOT EXISTS idx_shared_links_resource ON shared_links(resource_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_created ON shared_links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_links_link_id ON shared_links(link_id); -- Pour retrouver par Dub ID

-- Index pour analytics (trouver les liens les plus populaires)
CREATE INDEX IF NOT EXISTS idx_shared_links_clicks ON shared_links(clicks DESC);

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own shared links" ON shared_links;
DROP POLICY IF EXISTS "Users can create own shared links" ON shared_links;
DROP POLICY IF EXISTS "Users can update own shared links" ON shared_links;
DROP POLICY IF EXISTS "Users can delete own shared links" ON shared_links;
DROP POLICY IF EXISTS "Admins can view all shared links" ON shared_links;

-- Policy: Les utilisateurs voient leurs propres liens
CREATE POLICY "Users can view own shared links"
  ON shared_links FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs créent leurs propres liens
CREATE POLICY "Users can create own shared links"
  ON shared_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs mettent à jour leurs liens (ex: analytics refresh)
CREATE POLICY "Users can update own shared links"
  ON shared_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs suppriment leurs liens
CREATE POLICY "Users can delete own shared links"
  ON shared_links FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Les admins voient tous les liens (pour dashboard analytics)
CREATE POLICY "Admins can view all shared links"
  ON shared_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_shared_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shared_links_updated_at ON shared_links;

CREATE TRIGGER update_shared_links_updated_at
  BEFORE UPDATE ON shared_links
  FOR EACH ROW
  EXECUTE FUNCTION update_shared_links_updated_at();

-- ============================================================================
-- FUNCTION: Incrementer le compteur de clicks
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_link_clicks(p_link_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE shared_links
  SET 
    clicks = clicks + 1,
    last_clicked_at = now()
  WHERE link_id = p_link_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS pour documentation
-- ============================================================================

COMMENT ON TABLE shared_links IS 'Stocke tous les liens courts créés via Dub.co pour tracking et historique';
COMMENT ON COLUMN shared_links.link_type IS 'Type de ressource: course, referral, certificate, quiz, exam, perplexity';
COMMENT ON COLUMN shared_links.link_id IS 'ID unique du lien dans Dub.co (ex: abc123 de https://dub.sh/abc123)';
COMMENT ON COLUMN shared_links.analytics IS 'Snapshot des analytics Dub.co (mis à jour via getLinkAnalytics())';
COMMENT ON COLUMN shared_links.clicks IS 'Nombre total de clics (mis à jour via refresh analytics)';
COMMENT ON COLUMN shared_links.unique_clicks IS 'Nombre de clics uniques (mis à jour via refresh analytics)';
COMMENT ON COLUMN shared_links.resource_id IS 'UUID de la ressource partagée (course_id, quiz_id, exam_id, etc.)';

-- ============================================================================
-- SAMPLE DATA (optionnel, pour tests)
-- ============================================================================

-- Vous pouvez décommenter ci-dessous pour insérer des données de test
/*
INSERT INTO shared_links (user_id, short_link, original_url, link_id, link_type, title, description, tags)
SELECT 
  id,
  'https://dub.sh/test123',
  'https://e-reussite.com/courses/math',
  'test123',
  'course',
  'Cours de Mathématiques',
  'Cours complet de mathématiques niveau Terminale',
  '["math", "terminale"]'::jsonb
FROM profiles
LIMIT 1;
*/
