-- ============================================
-- SCRIPT DE NETTOYAGE AVANT SEED
-- ============================================
-- À exécuter AVANT 001_initial_content.sql
-- Supprime toutes les données de test existantes
-- ============================================

-- Désactiver temporairement les contraintes de clés étrangères
SET session_replication_role = 'replica';

-- Supprimer les données dans l'ordre inverse des dépendances
-- (pour éviter les erreurs de contraintes)

-- 1. Supprimer les résultats et participations
DELETE FROM quiz_results;
DELETE FROM exam_results;
DELETE FROM challenge_participants;

-- 2. Supprimer les commandes et paiements
DELETE FROM order_items;
DELETE FROM payments;
DELETE FROM orders;

-- 3. Supprimer les produits
DELETE FROM products;

-- 4. Supprimer les notifications et conversations IA
DELETE FROM user_notifications;
DELETE FROM ai_conversations;

-- 5. Supprimer les badges utilisateurs
DELETE FROM user_badges;

-- 6. Supprimer les badges (templates)
DELETE FROM badges;

-- 7. Supprimer les challenges
DELETE FROM monthly_challenges;

-- 8. Supprimer la progression et erreurs
DELETE FROM user_progression;
DELETE FROM user_errors;

-- 9. Supprimer les logs d'activité
DELETE FROM activity_logs;

-- 10. Supprimer le contenu pédagogique
DELETE FROM quiz_questions;
DELETE FROM quiz;
DELETE FROM exam_simulations;
DELETE FROM fiches_revision;
DELETE FROM annales;
DELETE FROM exercices;
DELETE FROM lecons;
DELETE FROM chapitres;
DELETE FROM matieres;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Optionnel : Réinitialiser les séquences (AUTO_INCREMENT)
-- Décommentez si vous voulez que les IDs recommencent à 1

-- ALTER SEQUENCE matieres_id_seq RESTART WITH 1;
-- ALTER SEQUENCE chapitres_id_seq RESTART WITH 1;
-- ALTER SEQUENCE lecons_id_seq RESTART WITH 1;
-- ALTER SEQUENCE quiz_id_seq RESTART WITH 1;
-- ALTER SEQUENCE quiz_questions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE badges_id_seq RESTART WITH 1;
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;
-- ALTER SEQUENCE orders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE monthly_challenges_id_seq RESTART WITH 1;

-- Message de confirmation
SELECT 'Base de données nettoyée avec succès. Vous pouvez maintenant exécuter 001_initial_content.sql' AS message;
