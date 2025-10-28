-- =============================================
-- BADGES SUPPLÉMENTAIRES - E-Réussite
-- =============================================

-- Ce script ajoute de nouveaux badges thématiques pour l'éducation
-- ⚠️ Utilise UNIQUEMENT les colonnes existantes: name, description, icon, rarity, points_reward

INSERT INTO competition_badges (name, description, icon, rarity, points_reward)
VALUES
-- 🎓 BADGES ÉDUCATIFS
('🎓 Premier Pas', 'Terminer votre première compétition', '🎓', 'common', 50),
('📚 Assidu', 'Participer à 5 compétitions dans le même mois', '📚', 'rare', 200),
('🔥 Série Gagnante', 'Gagner 3 compétitions d''affilée', '🔥', 'epic', 500),
('🌟 Expert du Sujet', 'Obtenir 100% dans une matière spécifique', '🌟', 'legendary', 1000),

-- ⚡ BADGES DE PERFORMANCE
('⚡ Éclair', 'Répondre à toutes les questions en moins de 5 minutes', '⚡', 'rare', 300),
('🎯 Tireur d''Élite', 'Obtenir 90% ou plus dans 10 compétitions', '🎯', 'epic', 750),
('💯 Perfectionniste', 'Obtenir 100% dans 5 compétitions différentes', '💯', 'legendary', 1500),
('🏃 Marathon', 'Participer à 20 compétitions', '🏃', 'rare', 400),

-- 🏆 BADGES DE CLASSEMENT
('👑 Roi du Podium', 'Terminer dans le top 3 à 10 reprises', '👑', 'epic', 600),
('🥈 Challenger', 'Terminer 2ème à 5 reprises', '🥈', 'rare', 250),
('📈 Progression', 'Améliorer son classement de 10 places ou plus', '📈', 'rare', 200),
('🌍 Champion Régional', 'Terminer 1er dans le classement régional', '🌍', 'epic', 500),

-- 🎮 BADGES SPÉCIAUX
('🌙 Noctambule', 'Participer à une compétition entre 22h et 6h', '🌙', 'uncommon', 100),
('☀️ Lève-tôt', 'Participer à une compétition entre 5h et 8h', '☀️', 'uncommon', 100),
('🎉 Anniversaire', 'Participer le jour de votre anniversaire', '🎉', 'rare', 500),
('🎊 Fondateur', 'Parmi les 100 premiers utilisateurs', '🎊', 'legendary', 2000),

-- 📊 BADGES MATIÈRES SPÉCIFIQUES
('🔢 Génie des Maths', 'Maîtriser les compétitions de mathématiques', '🔢', 'rare', 300),
('🔬 Scientifique', 'Maîtriser les compétitions de sciences', '🔬', 'rare', 300),
('📖 Littéraire', 'Maîtriser les compétitions de français', '📖', 'rare', 300),
('🌐 Polyglotte', 'Maîtriser les compétitions de langues', '🌐', 'rare', 300),

-- 🎪 BADGES COMMUNAUTÉ
('🤝 Mentor', 'Partager 10 résultats sur les réseaux sociaux', '🤝', 'uncommon', 150),
('💬 Communicateur', 'Laisser 20 commentaires constructifs', '💬', 'uncommon', 150),
('⭐ Influenceur', 'Recruter 5 amis via votre lien de parrainage', '⭐', 'rare', 500),
('🎖️ Légende', 'Accumuler 10,000 points totaux', '🎖️', 'legendary', 5000)

ON CONFLICT (name) DO NOTHING;

-- Vérifier les badges ajoutés
SELECT 
    name,
    icon,
    rarity,
    points_reward,
    created_at
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
