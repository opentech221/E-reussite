-- =============================================
-- BADGES SUPPLÉMENTAIRES - E-Réussite
-- =============================================

-- Ce script ajoute de nouveaux badges thématiques pour l'éducation

INSERT INTO competition_badges (name, description, icon, rarity, points_reward, category, condition_type, condition_value)
VALUES
-- 🎓 BADGES ÉDUCATIFS
('🎓 Premier Pas', 'Terminer votre première compétition', '🎓', 'common', 50, 'participation', 'first_completion', 1),
('📚 Assidu', 'Participer à 5 compétitions dans le même mois', '📚', 'rare', 200, 'participation', 'monthly_streak', 5),
('🔥 Série Gagnante', 'Gagner 3 compétitions d''affilée', '🔥', 'epic', 500, 'winning', 'win_streak', 3),
('🌟 Expert du Sujet', 'Obtenir 100% dans une matière spécifique', '🌟', 'legendary', 1000, 'performance', 'subject_mastery', 100),

-- ⚡ BADGES DE PERFORMANCE
('⚡ Éclair', 'Répondre à toutes les questions en moins de 5 minutes', '⚡', 'rare', 300, 'speed', 'time_limit', 300),
('🎯 Tireur d''Élite', 'Obtenir 90% ou plus dans 10 compétitions', '🎯', 'epic', 750, 'accuracy', 'high_accuracy_count', 10),
('💯 Perfectionniste', 'Obtenir 100% dans 5 compétitions différentes', '💯', 'legendary', 1500, 'performance', 'perfect_score_count', 5),
('🏃 Marathon', 'Participer à 20 compétitions', '🏃', 'rare', 400, 'participation', 'total_competitions', 20),

-- 🏆 BADGES DE CLASSEMENT
('👑 Roi du Podium', 'Terminer dans le top 3 à 10 reprises', '👑', 'epic', 600, 'ranking', 'top3_count', 10),
('🥈 Challenger', 'Terminer 2ème à 5 reprises', '🥈', 'rare', 250, 'ranking', 'second_place', 5),
('📈 Progression', 'Améliorer son classement de 10 places ou plus', '📈', 'rare', 200, 'improvement', 'rank_improvement', 10),
('🌍 Champion Régional', 'Terminer 1er dans le classement régional', '🌍', 'epic', 500, 'ranking', 'regional_champion', 1),

-- 🎮 BADGES SPÉCIAUX
('🌙 Noctambule', 'Participer à une compétition entre 22h et 6h', '🌙', 'uncommon', 100, 'special', 'night_owl', 1),
('☀️ Lève-tôt', 'Participer à une compétition entre 5h et 8h', '☀️', 'uncommon', 100, 'special', 'early_bird', 1),
('🎉 Anniversaire', 'Participer le jour de votre anniversaire', '🎉', 'rare', 500, 'special', 'birthday', 1),
('🎊 Fondateur', 'Parmi les 100 premiers utilisateurs', '🎊', 'legendary', 2000, 'special', 'founding_member', 100),

-- 📊 BADGES MATIÈRES SPÉCIFIQUES
('🔢 Génie des Maths', 'Maîtriser les compétitions de mathématiques', '🔢', 'rare', 300, 'subject', 'math_specialist', 1),
('🔬 Scientifique', 'Maîtriser les compétitions de sciences', '🔬', 'rare', 300, 'subject', 'science_specialist', 1),
('📖 Littéraire', 'Maîtriser les compétitions de français', '📖', 'rare', 300, 'subject', 'literature_specialist', 1),
('🌐 Polyglotte', 'Maîtriser les compétitions de langues', '🌐', 'rare', 300, 'subject', 'language_specialist', 1),

-- 🎪 BADGES COMMUNAUTÉ
('🤝 Mentor', 'Partager 10 résultats sur les réseaux sociaux', '🤝', 'uncommon', 150, 'social', 'social_shares', 10),
('💬 Communicateur', 'Laisser 20 commentaires constructifs', '💬', 'uncommon', 150, 'social', 'comments', 20),
('⭐ Influenceur', 'Recruter 5 amis via votre lien de parrainage', '⭐', 'rare', 500, 'social', 'referrals', 5),
('🎖️ Légende', 'Accumuler 10,000 points totaux', '🎖️', 'legendary', 5000, 'achievement', 'total_points', 10000)

ON CONFLICT (name) DO NOTHING;

-- Vérifier les badges ajoutés
SELECT 
    name,
    icon,
    rarity,
    points_reward,
    category
FROM competition_badges
ORDER BY 
    CASE rarity
        WHEN 'common' THEN 1
        WHEN 'uncommon' THEN 2
        WHEN 'rare' THEN 3
        WHEN 'epic' THEN 4
        WHEN 'legendary' THEN 5
    END,
    points_reward ASC;

-- ✅ Vous devriez maintenant voir 40+ badges au total !
