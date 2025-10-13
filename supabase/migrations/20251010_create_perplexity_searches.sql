-- ============================================================================
-- TABLE: perplexity_searches
-- Description: Historique des recherches Perplexity par utilisateur
-- Date: 10 octobre 2025
-- ============================================================================

-- Créer la table
CREATE TABLE IF NOT EXISTS perplexity_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  answer TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  model VARCHAR(50) DEFAULT 'sonar-pro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_perplexity_searches_user_id ON perplexity_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_perplexity_searches_created_at ON perplexity_searches(created_at DESC);

-- RLS (Row Level Security) Policies
ALTER TABLE perplexity_searches ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir uniquement leurs propres recherches
CREATE POLICY "Users can view their own searches"
  ON perplexity_searches
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer leurs propres recherches
CREATE POLICY "Users can insert their own searches"
  ON perplexity_searches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres recherches
CREATE POLICY "Users can delete their own searches"
  ON perplexity_searches
  FOR DELETE
  USING (auth.uid() = user_id);

-- Commentaires
COMMENT ON TABLE perplexity_searches IS 'Historique des recherches Perplexity avec citations';
COMMENT ON COLUMN perplexity_searches.query IS 'Question posée par l''utilisateur';
COMMENT ON COLUMN perplexity_searches.answer IS 'Réponse générée par Perplexity';
COMMENT ON COLUMN perplexity_searches.citations IS 'Tableau JSON des sources citées';
COMMENT ON COLUMN perplexity_searches.context IS 'Contexte de la recherche (matière, niveau, etc.)';
COMMENT ON COLUMN perplexity_searches.model IS 'Modèle Perplexity utilisé (sonar-pro)';
