-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MIGRATION: Création de la table push_subscriptions
-- Date: 12 octobre 2025
-- Objectif: Stocker les abonnements push pour les notifications PWA
-- Instructions: Exécutez ce script dans Supabase SQL Editor
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Étape 1: Créer la table push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Étape 2: Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active 
ON push_subscriptions(is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
ON push_subscriptions(endpoint);

-- Étape 3: Ajouter des commentaires descriptifs
COMMENT ON TABLE push_subscriptions IS 'Abonnements push pour les notifications PWA';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'URL unique de l''abonnement push (fournie par le navigateur)';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'Clé publique de chiffrement pour les notifications';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Clé d''authentification pour les notifications';
COMMENT ON COLUMN push_subscriptions.device_name IS 'Type d''appareil (Desktop, Mobile, Tablet)';
COMMENT ON COLUMN push_subscriptions.is_active IS 'Indique si l''abonnement est toujours valide';
COMMENT ON COLUMN push_subscriptions.notifications_enabled IS 'Indique si les notifications sont activées par l''utilisateur';

-- Étape 4: Activer Row Level Security (RLS)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Étape 5: Créer les politiques RLS
-- Les utilisateurs peuvent voir leurs propres abonnements
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres abonnements
CREATE POLICY "Users can create their own subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres abonnements
CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres abonnements
CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Étape 6: Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Étape 7: Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER trigger_update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Étape 8: Vérification - Afficher la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'push_subscriptions'
ORDER BY ordinal_position;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RÉSULTAT ATTENDU:
-- ✅ Table "push_subscriptions" created successfully
-- ✅ 3 indexes created (user_id, active, endpoint)
-- ✅ RLS enabled with 4 policies
-- ✅ Trigger created for updated_at
-- ✅ Table structure displayed
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Après exécution:
-- 1. Rafraîchissez le cache du schéma dans Supabase Studio
-- 2. Vérifiez que la table apparaît dans Table Editor
-- 3. Redémarrez votre serveur de développement (npm run dev)
-- 4. Testez l'activation des notifications dans le Dashboard
