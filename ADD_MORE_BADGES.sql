-- =============================================
-- BADGES SUPPLÉMENTAIRES - E-Réussite
-- =============================================

-- Ce script ajoute de nouveaux badges thématiques pour l'éducation
-- ✅ Remplit criteria (JSONB NOT NULL) + condition_type/condition_value pour compatibilité

-- ========================================
-- AJOUT DE 24 NOUVEAUX BADGES THÉMATIQUES
-- ========================================

INSERT INTO competition_badges (name, description, icon, category, rarity, criteria, condition_type, condition_value, points_reward)
VALUES
-- 🎓 BADGES ÉDUCATIFS (category: participation)
('🎓 Premier Pas', 'Terminer votre première compétition', '🎓', 'participation', 'common', '{"type":"competitions_completed","value":1}'::jsonb, 'competitions_completed', 1, 50),
('📚 Assidu', 'Participer à 5 compétitions dans le même mois', '📚', 'participation', 'rare', '{"type":"competitions_this_month","value":5}'::jsonb, 'competitions_this_month', 5, 200),
('🔥 Série Gagnante', 'Gagner 3 compétitions d''affilée', '🔥', 'performance', 'epic', '{"type":"win_streak","value":3}'::jsonb, 'win_streak', 3, 500),
('🌟 Expert du Sujet', 'Obtenir 100% dans une matière spécifique', '🌟', 'performance', 'legendary', '{"type":"perfect_score","value":1}'::jsonb, 'perfect_score', 1, 1000),

-- ⚡ BADGES DE PERFORMANCE (category: performance)
('⚡ Éclair', 'Répondre à toutes les questions en moins de 5 minutes', '⚡', 'performance', 'rare', '{"type":"completion_time","value":300}'::jsonb, 'completion_time', 300, 300),
('🎯 Tireur d''Élite', 'Obtenir 90% ou plus dans 10 compétitions', '🎯', 'performance', 'epic', '{"type":"high_score_count","value":10}'::jsonb, 'high_score_count', 10, 750),
('💯 Perfectionniste', 'Obtenir 100% dans 5 compétitions différentes', '💯', 'performance', 'legendary', '{"type":"perfect_score_count","value":5}'::jsonb, 'perfect_score_count', 5, 1500),
('🏃 Marathon', 'Participer à 20 compétitions', '🏃', 'participation', 'rare', '{"type":"competitions_completed","value":20}'::jsonb, 'competitions_completed', 20, 400),

-- 🏆 BADGES DE CLASSEMENT (category: ranking)
('👑 Roi du Podium', 'Terminer dans le top 3 à 10 reprises', '👑', 'ranking', 'epic', '{"type":"top3_finishes","value":10}'::jsonb, 'top3_finishes', 10, 600),
('🥈 Challenger', 'Terminer 2ème à 5 reprises', '🥈', 'ranking', 'rare', '{"type":"second_place","value":5}'::jsonb, 'second_place', 5, 250),
('📈 Progression', 'Améliorer son classement de 10 places ou plus', '📈', 'ranking', 'rare', '{"type":"rank_improvement","value":10}'::jsonb, 'rank_improvement', 10, 200),
('🌍 Champion Régional', 'Terminer 1er dans le classement régional', '🌍', 'ranking', 'epic', '{"type":"first_place_regional","value":1}'::jsonb, 'first_place_regional', 1, 500),

-- 🎮 BADGES SPÉCIAUX (category: special)
('🌙 Noctambule', 'Participer à une compétition entre 22h et 6h', '🌙', 'special', 'uncommon', '{"type":"night_owl","value":1}'::jsonb, 'night_owl', 1, 100),
('☀️ Lève-tôt', 'Participer à une compétition entre 5h et 8h', '☀️', 'special', 'uncommon', '{"type":"early_bird","value":1}'::jsonb, 'early_bird', 1, 100),
('🎉 Anniversaire', 'Participer le jour de votre anniversaire', '🎉', 'special', 'rare', '{"type":"birthday","value":1}'::jsonb, 'birthday', 1, 500),
('🎊 Fondateur', 'Parmi les 100 premiers utilisateurs', '🎊', 'special', 'legendary', '{"type":"founder","value":1}'::jsonb, 'founder', 1, 2000),

-- 📊 BADGES MATIÈRES SPÉCIFIQUES (category: achievement)
('🔢 Génie des Maths', 'Maîtriser les compétitions de mathématiques', '🔢', 'achievement', 'rare', '{"type":"subject_mastery","value":1}'::jsonb, 'subject_mastery', 1, 300),
('🔬 Scientifique', 'Maîtriser les compétitions de sciences', '🔬', 'achievement', 'rare', '{"type":"subject_mastery","value":1}'::jsonb, 'subject_mastery', 1, 300),
('📖 Littéraire', 'Maîtriser les compétitions de français', '📖', 'achievement', 'rare', '{"type":"subject_mastery","value":1}'::jsonb, 'subject_mastery', 1, 300),
('🌐 Polyglotte', 'Maîtriser les compétitions de langues', '🌐', 'achievement', 'rare', '{"type":"subject_mastery","value":1}'::jsonb, 'subject_mastery', 1, 300),

-- 🎪 BADGES COMMUNAUTÉ (category: social)
('🤝 Mentor', 'Partager 10 résultats sur les réseaux sociaux', '🤝', 'social', 'uncommon', '{"type":"shares_count","value":10}'::jsonb, 'shares_count', 10, 150),
('💬 Communicateur', 'Laisser 20 commentaires constructifs', '💬', 'social', 'uncommon', '{"type":"comments_count","value":20}'::jsonb, 'comments_count', 20, 150),
('⭐ Influenceur', 'Recruter 5 amis via votre lien de parrainage', '⭐', 'social', 'rare', '{"type":"referrals","value":5}'::jsonb, 'referrals', 5, 500),
('🎖️ Légende', 'Accumuler 10,000 points totaux', '🎖️', 'achievement', 'legendary', '{"type":"total_points","value":10000}'::jsonb, 'total_points', 10000, 5000)

ON CONFLICT (name) DO NOTHING;

-- Vérifier les badges ajoutés
SELECT 
    name,
    icon,
    category,
    rarity,
    criteria,
    points_reward,
    created_at
FROM competition_badges
ORDER BY 
    category,
    CASE rarity
        WHEN 'common' THEN 1
        WHEN 'uncommon' THEN 2
        WHEN 'rare' THEN 3
        WHEN 'epic' THEN 4
        WHEN 'legendary' THEN 5
    END,
    points_reward ASC;

-- ✅ Vous devriez maintenant voir 40+ badges au total !
