-- =============================================
-- BADGES SUPPLÉMENTAIRES - E-Réussite
-- =============================================

-- Ce script ajoute de nouveaux badges thématiques pour l'éducation
-- ✅ Inclut TOUTES les colonnes: name, description, icon, category, rarity, condition_type, condition_value, points_reward

INSERT INTO competition_badges (name, description, icon, category, rarity, condition_type, condition_value, points_reward)
VALUES
-- 🎓 BADGES ÉDUCATIFS (category: participation)
('🎓 Premier Pas', 'Terminer votre première compétition', '🎓', 'participation', 'common', 'competitions_completed', 1, 50),
('📚 Assidu', 'Participer à 5 compétitions dans le même mois', '📚', 'participation', 'rare', 'competitions_this_month', 5, 200),
('🔥 Série Gagnante', 'Gagner 3 compétitions d''affilée', '🔥', 'performance', 'epic', 'win_streak', 3, 500),
('🌟 Expert du Sujet', 'Obtenir 100% dans une matière spécifique', '🌟', 'performance', 'legendary', 'perfect_score', 1, 1000),

-- ⚡ BADGES DE PERFORMANCE (category: performance)
('⚡ Éclair', 'Répondre à toutes les questions en moins de 5 minutes', '⚡', 'performance', 'rare', 'completion_time', 300, 300),
('🎯 Tireur d''Élite', 'Obtenir 90% ou plus dans 10 compétitions', '🎯', 'performance', 'epic', 'high_score_count', 10, 750),
('💯 Perfectionniste', 'Obtenir 100% dans 5 compétitions différentes', '💯', 'performance', 'legendary', 'perfect_score_count', 5, 1500),
('🏃 Marathon', 'Participer à 20 compétitions', '🏃', 'participation', 'rare', 'competitions_completed', 20, 400),

-- 🏆 BADGES DE CLASSEMENT (category: ranking)
('👑 Roi du Podium', 'Terminer dans le top 3 à 10 reprises', '👑', 'ranking', 'epic', 'top3_finishes', 10, 600),
('🥈 Challenger', 'Terminer 2ème à 5 reprises', '🥈', 'ranking', 'rare', 'second_place', 5, 250),
('📈 Progression', 'Améliorer son classement de 10 places ou plus', '📈', 'ranking', 'rare', 'rank_improvement', 10, 200),
('🌍 Champion Régional', 'Terminer 1er dans le classement régional', '🌍', 'ranking', 'epic', 'first_place_regional', 1, 500),

-- 🎮 BADGES SPÉCIAUX (category: special)
('🌙 Noctambule', 'Participer à une compétition entre 22h et 6h', '🌙', 'special', 'uncommon', 'night_owl', 1, 100),
('☀️ Lève-tôt', 'Participer à une compétition entre 5h et 8h', '☀️', 'special', 'uncommon', 'early_bird', 1, 100),
('🎉 Anniversaire', 'Participer le jour de votre anniversaire', '🎉', 'special', 'rare', 'birthday', 1, 500),
('🎊 Fondateur', 'Parmi les 100 premiers utilisateurs', '🎊', 'special', 'legendary', 'founder', 1, 2000),

-- 📊 BADGES MATIÈRES SPÉCIFIQUES (category: achievement)
('🔢 Génie des Maths', 'Maîtriser les compétitions de mathématiques', '🔢', 'achievement', 'rare', 'subject_mastery', 1, 300),
('🔬 Scientifique', 'Maîtriser les compétitions de sciences', '🔬', 'achievement', 'rare', 'subject_mastery', 1, 300),
('📖 Littéraire', 'Maîtriser les compétitions de français', '📖', 'achievement', 'rare', 'subject_mastery', 1, 300),
('🌐 Polyglotte', 'Maîtriser les compétitions de langues', '🌐', 'achievement', 'rare', 'subject_mastery', 1, 300),

-- 🎪 BADGES COMMUNAUTÉ (category: social)
('🤝 Mentor', 'Partager 10 résultats sur les réseaux sociaux', '🤝', 'social', 'uncommon', 'shares_count', 10, 150),
('💬 Communicateur', 'Laisser 20 commentaires constructifs', '💬', 'social', 'uncommon', 'comments_count', 20, 150),
('⭐ Influenceur', 'Recruter 5 amis via votre lien de parrainage', '⭐', 'social', 'rare', 'referrals', 5, 500),
('🎖️ Légende', 'Accumuler 10,000 points totaux', '🎖️', 'achievement', 'legendary', 'total_points', 10000, 5000)

ON CONFLICT (name) DO NOTHING;

-- Vérifier les badges ajoutés
SELECT 
    name,
    icon,
    category,
    rarity,
    condition_type,
    condition_value,
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
