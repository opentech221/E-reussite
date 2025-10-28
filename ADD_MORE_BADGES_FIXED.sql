-- =============================================
-- BADGES SUPPLÉMENTAIRES - E-Réussite
-- =============================================
-- ✅ VERSION CORRIGÉE avec criteria JSONB au lieu de condition_type/condition_value

INSERT INTO competition_badges (name, description, icon, category, rarity, criteria, points_reward)
VALUES
-- 🎓 BADGES ÉDUCATIFS (category: participation)
('🎓 Premier Pas', 'Terminer votre première compétition', '🎓', 'participation', 'common', 
    '{"condition_type": "competitions_completed", "condition_value": 1}'::jsonb, 50),
('📚 Assidu', 'Participer à 5 compétitions dans le même mois', '📚', 'participation', 'rare', 
    '{"condition_type": "competitions_this_month", "condition_value": 5}'::jsonb, 200),
('🔥 Série Gagnante', 'Gagner 3 compétitions d''affilée', '🔥', 'performance', 'epic', 
    '{"condition_type": "win_streak", "condition_value": 3}'::jsonb, 500),
('🌟 Expert du Sujet', 'Obtenir 100% dans une matière spécifique', '🌟', 'performance', 'legendary', 
    '{"condition_type": "perfect_score", "condition_value": 1}'::jsonb, 1000),

-- ⚡ BADGES DE PERFORMANCE (category: performance)
('⚡ Éclair', 'Répondre à toutes les questions en moins de 5 minutes', '⚡', 'performance', 'rare', 
    '{"condition_type": "completion_time", "condition_value": 300}'::jsonb, 300),
('🎯 Tireur d''Élite', 'Obtenir 90% ou plus dans 10 compétitions', '🎯', 'performance', 'epic', 
    '{"condition_type": "high_score_count", "condition_value": 10}'::jsonb, 750),
('💯 Perfectionniste', 'Obtenir 100% dans 5 compétitions différentes', '💯', 'performance', 'legendary', 
    '{"condition_type": "perfect_score_count", "condition_value": 5}'::jsonb, 1500),
('🏃 Marathon', 'Participer à 20 compétitions', '🏃', 'participation', 'rare', 
    '{"condition_type": "competitions_completed", "condition_value": 20}'::jsonb, 400),

-- 🏆 BADGES DE CLASSEMENT (category: ranking)
('👑 Roi du Podium', 'Terminer dans le top 3 à 10 reprises', '👑', 'ranking', 'epic', 
    '{"condition_type": "top3_finishes", "condition_value": 10}'::jsonb, 600),
('🥈 Challenger', 'Terminer 2ème à 5 reprises', '🥈', 'ranking', 'rare', 
    '{"condition_type": "second_place", "condition_value": 5}'::jsonb, 250),
('📈 Progression', 'Améliorer son classement de 10 places ou plus', '📈', 'ranking', 'rare', 
    '{"condition_type": "rank_improvement", "condition_value": 10}'::jsonb, 200),
('🌍 Champion Régional', 'Terminer 1er dans le classement régional', '🌍', 'ranking', 'epic', 
    '{"condition_type": "first_place_regional", "condition_value": 1}'::jsonb, 500),

-- 🎮 BADGES SPÉCIAUX (category: special)
('🌙 Noctambule', 'Participer à une compétition entre 22h et 6h', '🌙', 'special', 'uncommon', 
    '{"condition_type": "night_owl", "condition_value": 1}'::jsonb, 100),
('☀️ Lève-tôt', 'Participer à une compétition entre 5h et 8h', '☀️', 'special', 'uncommon', 
    '{"condition_type": "early_bird", "condition_value": 1}'::jsonb, 100),
('🎉 Anniversaire', 'Participer le jour de votre anniversaire', '🎉', 'special', 'rare', 
    '{"condition_type": "birthday", "condition_value": 1}'::jsonb, 500),
('🎊 Fondateur', 'Parmi les 100 premiers utilisateurs', '🎊', 'special', 'legendary', 
    '{"condition_type": "founder", "condition_value": 1}'::jsonb, 2000),

-- 📊 BADGES MATIÈRES SPÉCIFIQUES (category: achievement)
('🔢 Génie des Maths', 'Maîtriser les compétitions de mathématiques', '🔢', 'achievement', 'rare', 
    '{"condition_type": "subject_mastery", "condition_value": 1, "subject": "mathematics"}'::jsonb, 300),
('🔬 Scientifique', 'Maîtriser les compétitions de sciences', '🔬', 'achievement', 'rare', 
    '{"condition_type": "subject_mastery", "condition_value": 1, "subject": "sciences"}'::jsonb, 300),
('📖 Littéraire', 'Maîtriser les compétitions de français', '📖', 'achievement', 'rare', 
    '{"condition_type": "subject_mastery", "condition_value": 1, "subject": "french"}'::jsonb, 300),
('🌐 Polyglotte', 'Maîtriser les compétitions de langues', '🌐', 'achievement', 'rare', 
    '{"condition_type": "subject_mastery", "condition_value": 1, "subject": "languages"}'::jsonb, 300),

-- 🎪 BADGES COMMUNAUTÉ (category: social)
('🤝 Mentor', 'Partager 10 résultats sur les réseaux sociaux', '🤝', 'social', 'uncommon', 
    '{"condition_type": "shares_count", "condition_value": 10}'::jsonb, 150),
('💬 Communicateur', 'Laisser 20 commentaires constructifs', '💬', 'social', 'uncommon', 
    '{"condition_type": "comments_count", "condition_value": 20}'::jsonb, 150),
('⭐ Influenceur', 'Recruter 5 amis via votre lien de parrainage', '⭐', 'social', 'rare', 
    '{"condition_type": "referrals", "condition_value": 5}'::jsonb, 500),
('🎖️ Légende', 'Accumuler 10,000 points totaux', '🎖️', 'achievement', 'legendary', 
    '{"condition_type": "total_points", "condition_value": 10000}'::jsonb, 5000)

ON CONFLICT (name) DO NOTHING;

-- Vérifier les badges ajoutés
SELECT 
    name,
    icon,
    category,
    rarity,
    criteria->>'condition_type' as condition_type,
    (criteria->>'condition_value')::integer as condition_value,
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
