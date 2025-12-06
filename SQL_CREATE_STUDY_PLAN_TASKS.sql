-- =====================================================
-- TABLE: study_plan_tasks
-- Description: Tâches du plan d'étude personnalisé
-- =====================================================

CREATE TABLE IF NOT EXISTS public.study_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contenu de la tâche
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'quiz', 'course', 'revision', 'exam'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Planification
  due_date TIMESTAMPTZ,
  estimated_duration INTEGER, -- en minutes
  
  -- Progression
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
  progress INTEGER DEFAULT 0, -- 0-100
  completed_at TIMESTAMPTZ,
  
  -- Métadonnées
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_user_id ON public.study_plan_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_status ON public.study_plan_tasks(status);
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_due_date ON public.study_plan_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_priority ON public.study_plan_tasks(priority);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_study_plan_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_study_plan_tasks_updated_at
  BEFORE UPDATE ON public.study_plan_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_study_plan_tasks_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.study_plan_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres tâches
CREATE POLICY "Users can view their own tasks"
  ON public.study_plan_tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer leurs propres tâches
CREATE POLICY "Users can create their own tasks"
  ON public.study_plan_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent modifier leurs propres tâches
CREATE POLICY "Users can update their own tasks"
  ON public.study_plan_tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres tâches
CREATE POLICY "Users can delete their own tasks"
  ON public.study_plan_tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins can view all tasks"
  ON public.study_plan_tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Les admins peuvent tout modifier
CREATE POLICY "Admins can manage all tasks"
  ON public.study_plan_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON TABLE public.study_plan_tasks IS 'Tâches du plan d''étude personnalisé pour chaque utilisateur';
COMMENT ON COLUMN public.study_plan_tasks.category IS 'Type de tâche: quiz, course, revision, exam';
COMMENT ON COLUMN public.study_plan_tasks.priority IS 'Priorité: low, medium, high, urgent';
COMMENT ON COLUMN public.study_plan_tasks.status IS 'Statut: pending, in_progress, completed, skipped';
COMMENT ON COLUMN public.study_plan_tasks.progress IS 'Progression en pourcentage (0-100)';
COMMENT ON COLUMN public.study_plan_tasks.estimated_duration IS 'Durée estimée en minutes';
