-- ============================================================================
-- MIGRATION: Système de Tracking Analytics Maison
-- Date: 11 octobre 2025 20:42
-- Description: Tracking des clics sur liens courts avec analytics détaillées
-- ============================================================================

-- Table pour tracker chaque clic sur un lien
CREATE TABLE IF NOT EXISTS link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES shared_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Informations visiteur
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  browser TEXT,     -- 'Chrome', 'Firefox', 'Safari', 'Edge', etc.
  os TEXT,          -- 'Windows', 'Mac', 'Linux', 'iOS', 'Android'
  
  -- Informations source
  referrer TEXT,    -- URL d'où vient le visiteur
  country TEXT,     -- Pays via IP geolocation
  country_code TEXT, -- Code pays (ex: 'SN', 'FR')
  city TEXT,        -- Ville
  region TEXT,      -- Région/État
  
  -- Deduplication
  visitor_fingerprint TEXT NOT NULL, -- Hash (IP + User-Agent) pour identifier visiteurs uniques
  is_unique BOOLEAN DEFAULT true -- Premier clic de ce visiteur dans les 24h
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_fingerprint ON link_clicks(visitor_fingerprint);
CREATE INDEX IF NOT EXISTS idx_link_clicks_country ON link_clicks(country);
CREATE INDEX IF NOT EXISTS idx_link_clicks_device ON link_clicks(device_type);

-- RLS Policies
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view clicks on their own links" ON link_clicks;
DROP POLICY IF EXISTS "Public insert for tracking" ON link_clicks;

-- Policy: Les utilisateurs peuvent voir les clics de leurs propres liens
CREATE POLICY "Users can view clicks on their own links"
  ON link_clicks
  FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM shared_links WHERE user_id = auth.uid()
    )
  );

-- Policy: Insertion publique pour tracking (via Edge Function avec service_role)
CREATE POLICY "Public insert for tracking"
  ON link_clicks
  FOR INSERT
  WITH CHECK (true);

-- Fonction pour nettoyer les anciens clics (optionnel - garde 90 jours)
CREATE OR REPLACE FUNCTION cleanup_old_link_clicks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM link_clicks
  WHERE clicked_at < NOW() - INTERVAL '90 days';
END;
$$;

COMMENT ON TABLE link_clicks IS 'Tracking détaillé de chaque clic sur les liens courts';
COMMENT ON COLUMN link_clicks.visitor_fingerprint IS 'Hash SHA-256 de (IP + User-Agent) pour identifier visiteurs uniques';
COMMENT ON COLUMN link_clicks.is_unique IS 'TRUE si premier clic de ce visiteur dans les dernières 24h';
