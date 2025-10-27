-- =============================================
-- FIX: Ajouter la colonne competition_id à user_badges
-- =============================================

-- Cette colonne est requise par check_and_award_badges()
-- Elle permet de savoir dans quelle compétition le badge a été gagné

-- Vérifier si la colonne existe déjà
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_badges'
  AND column_name = 'competition_id';

-- Si le résultat est vide (pas de ligne retournée), exécuter:

ALTER TABLE user_badges 
ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_badges_competition_id ON user_badges(competition_id);

-- Vérification finale
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_badges'
ORDER BY ordinal_position;

-- ✅ Vous devriez maintenant voir competition_id dans la liste !
