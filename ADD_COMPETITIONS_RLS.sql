-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- Sécuriser l'accès aux données de compétitions
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_leaderboards ENABLE ROW LEVEL SECURITY;

-- ====================================
-- COMPETITIONS
-- ====================================

-- Tout le monde peut voir les compétitions actives/upcoming
CREATE POLICY "Competitions visibles par tous"
ON competitions FOR SELECT
TO authenticated
USING (status IN ('upcoming', 'active', 'completed'));

-- Seuls les admins peuvent créer des compétitions
CREATE POLICY "Seuls les admins créent des compétitions"
ON competitions FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Seuls les admins peuvent modifier les compétitions
CREATE POLICY "Seuls les admins modifient les compétitions"
ON competitions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ====================================
-- COMPETITION_PARTICIPANTS
-- ====================================

-- Les utilisateurs peuvent voir tous les participants (pour leaderboard)
CREATE POLICY "Participants visibles par tous"
ON competition_participants FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs peuvent s'inscrire eux-mêmes
CREATE POLICY "Inscription libre aux compétitions"
ON competition_participants FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent modifier leurs propres participations
CREATE POLICY "Modification de sa propre participation"
ON competition_participants FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ====================================
-- COMPETITION_QUESTIONS
-- ====================================

-- Les participants peuvent voir les questions de leurs compétitions
CREATE POLICY "Questions visibles par les participants"
ON competition_questions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM competition_participants
        WHERE competition_id = competition_questions.competition_id
          AND user_id = auth.uid()
    )
);

-- Seuls les admins peuvent gérer les questions
CREATE POLICY "Seuls les admins gèrent les questions"
ON competition_questions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ====================================
-- COMPETITION_ANSWERS
-- ====================================

-- Les utilisateurs ne voient que leurs propres réponses
CREATE POLICY "Réponses visibles uniquement par l'auteur"
ON competition_answers FOR SELECT
TO authenticated
USING (
    participant_id IN (
        SELECT id FROM competition_participants
        WHERE user_id = auth.uid()
    )
);

-- Les utilisateurs peuvent soumettre leurs propres réponses
CREATE POLICY "Soumission de ses propres réponses"
ON competition_answers FOR INSERT
TO authenticated
WITH CHECK (
    participant_id IN (
        SELECT id FROM competition_participants
        WHERE user_id = auth.uid()
    )
);

-- Les utilisateurs peuvent modifier leurs propres réponses (avant soumission finale)
CREATE POLICY "Modification de ses propres réponses"
ON competition_answers FOR UPDATE
TO authenticated
USING (
    participant_id IN (
        SELECT id FROM competition_participants
        WHERE user_id = auth.uid()
          AND status = 'in_progress'
    )
);

-- ====================================
-- COMPETITION_LEADERBOARDS
-- ====================================

-- Tout le monde peut voir les leaderboards
CREATE POLICY "Leaderboards publics"
ON competition_leaderboards FOR SELECT
TO authenticated
USING (true);

-- Seul le système peut mettre à jour les leaderboards (via functions)
-- Pas de policy INSERT/UPDATE directe → uniquement via PostgreSQL functions

-- ====================================
-- GRANTS POUR LES FONCTIONS
-- ====================================

-- Permettre l'exécution des fonctions aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION join_competition TO authenticated;
GRANT EXECUTE ON FUNCTION submit_competition_answer TO authenticated;
GRANT EXECUTE ON FUNCTION complete_competition_participant TO authenticated;
GRANT EXECUTE ON FUNCTION update_competition_ranks TO authenticated;
GRANT EXECUTE ON FUNCTION update_francophone_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_competition_leaderboard TO authenticated;

-- ====================================
-- REALTIME SUBSCRIPTIONS
-- ====================================

-- Activer les publications Realtime pour les tables pertinentes
ALTER PUBLICATION supabase_realtime ADD TABLE competitions;
ALTER PUBLICATION supabase_realtime ADD TABLE competition_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE competition_leaderboards;

-- Note: competition_questions et competition_answers ne sont pas en realtime
-- pour des raisons de sécurité (éviter la triche)

-- Commentaires
COMMENT ON POLICY "Competitions visibles par tous" ON competitions IS 'Toutes les compétitions ouvertes sont publiques';
COMMENT ON POLICY "Participants visibles par tous" ON competition_participants IS 'Leaderboard public pour engagement communautaire';
COMMENT ON POLICY "Questions visibles par les participants" ON competition_questions IS 'Accès aux questions uniquement si inscrit';
COMMENT ON POLICY "Réponses visibles uniquement par l'auteur" ON competition_answers IS 'Confidentialité des réponses pendant la compétition';
