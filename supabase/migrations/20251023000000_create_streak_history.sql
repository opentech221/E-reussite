-- ============================================
-- MIGRATION: CREATE STREAK_HISTORY TABLE
-- ============================================
-- Date: 23 Octobre 2025
-- Purpose: Historique quotidien des streaks pour graphiques AreaChart
-- Impact: Permet de tracer l'évolution du streak sur 7j/30j/90j

-- ============================================
-- CRÉER LA TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  streak_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte unique: 1 seule entrée par user par jour
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- ============================================
-- INDEXES POUR PERFORMANCE
-- ============================================

-- Index pour queries par user_id + date range
CREATE INDEX IF NOT EXISTS idx_streak_history_user_date 
  ON public.streak_history(user_id, date DESC);

-- Index pour queries par date seule
CREATE INDEX IF NOT EXISTS idx_streak_history_date 
  ON public.streak_history(date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS
ALTER TABLE public.streak_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users peuvent lire leur propre historique
CREATE POLICY "Users can view own streak history"
  ON public.streak_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users peuvent insérer leur propre historique
CREATE POLICY "Users can insert own streak history"
  ON public.streak_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role peut tout faire (pour cron jobs)
CREATE POLICY "Service role has full access to streak history"
  ON public.streak_history
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- FONCTION: ENREGISTRER STREAK QUOTIDIEN
-- ============================================

CREATE OR REPLACE FUNCTION public.record_daily_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand user_points.last_activity_date change, enregistrer le streak du jour
  IF (NEW.last_activity_date IS DISTINCT FROM OLD.last_activity_date) THEN
    INSERT INTO public.streak_history (user_id, date, streak_value)
    VALUES (NEW.user_id, NEW.last_activity_date, NEW.current_streak)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
      streak_value = EXCLUDED.streak_value,
      created_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: AUTO-RECORD STREAK CHANGES
-- ============================================

DROP TRIGGER IF EXISTS trigger_record_daily_streak ON public.user_points;

CREATE TRIGGER trigger_record_daily_streak
  AFTER UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.record_daily_streak();

-- ============================================
-- PEUPLER AVEC DONNÉES EXISTANTES
-- ============================================

-- Insérer l'historique actuel pour tous les users
-- (approximation: créer une entrée pour chaque jour du streak actuel)
INSERT INTO public.streak_history (user_id, date, streak_value)
SELECT 
  up.user_id,
  up.last_activity_date - (s.n || ' days')::INTERVAL AS date,
  up.current_streak - s.n AS streak_value
FROM public.user_points up
CROSS JOIN LATERAL generate_series(0, LEAST(up.current_streak - 1, 89)) AS s(n)
WHERE up.current_streak > 0
ON CONFLICT (user_id, date) DO NOTHING;

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON TABLE public.streak_history IS 'Historique quotidien des streaks pour graphiques';
COMMENT ON COLUMN public.streak_history.user_id IS 'Utilisateur concerné';
COMMENT ON COLUMN public.streak_history.date IS 'Date du streak';
COMMENT ON COLUMN public.streak_history.streak_value IS 'Valeur du streak ce jour-là';
COMMENT ON FUNCTION public.record_daily_streak() IS 'Enregistre automatiquement le streak quotidien';

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Compter les entrées créées
SELECT 
  COUNT(*) AS total_entries,
  COUNT(DISTINCT user_id) AS unique_users,
  MIN(date) AS earliest_date,
  MAX(date) AS latest_date
FROM public.streak_history;

-- Voir exemple pour un user
-- SELECT * FROM public.streak_history WHERE user_id = 'YOUR_USER_ID' ORDER BY date DESC LIMIT 10;
