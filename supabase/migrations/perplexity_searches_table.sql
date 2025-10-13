-- ============================================================================
-- TABLE HISTORIQUE RECHERCHES PERPLEXITY
-- Date: 10 octobre 2025
-- ============================================================================

-- Créer la table perplexity_searches
CREATE TABLE IF NOT EXISTS perplexity_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  answer TEXT,
  citations_count INTEGER DEFAULT 0,
  full_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_perplexity_searches_user_id ON perplexity_searches(user_id);
CREATE INDEX idx_perplexity_searches_created_at ON perplexity_searches(created_at DESC);

-- RLS Policies
ALTER TABLE perplexity_searches ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres recherches
CREATE POLICY "Users can view own searches"
  ON perplexity_searches
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent insérer leurs propres recherches
CREATE POLICY "Users can insert own searches"
  ON perplexity_searches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres recherches
CREATE POLICY "Users can delete own searches"
  ON perplexity_searches
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_perplexity_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER set_perplexity_searches_updated_at
  BEFORE UPDATE ON perplexity_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_perplexity_searches_updated_at();

-- Commentaires
COMMENT ON TABLE perplexity_searches IS 'Historique des recherches Perplexity Pro par utilisateur';
COMMENT ON COLUMN perplexity_searches.query IS 'Question posée par l''utilisateur';
COMMENT ON COLUMN perplexity_searches.answer IS 'Extrait de la réponse (200 chars)';
COMMENT ON COLUMN perplexity_searches.citations_count IS 'Nombre de sources citées';
COMMENT ON COLUMN perplexity_searches.full_result IS 'Résultat complet en JSON (answer, citations, model, timestamp)';
