-- ============================================
-- NETTOYAGE ET REEXECUTION DU CONTENU COMPLET
-- ============================================
-- Date: 6 octobre 2025
-- Description: Nettoie et réinsère tout le contenu pédagogique

-- ============================================
-- ÉTAPE 1 : NETTOYAGE (suppression du contenu existant)
-- ============================================
DELETE FROM lecons;
DELETE FROM chapitres;

SELECT 'Contenu existant supprimé, prêt pour la ré-insertion' AS message;

-- ============================================
-- ÉTAPE 2 : Maintenant exécutez le fichier seed complet
-- ============================================
-- Copiez et collez TOUT le contenu de :
-- database/seed/002_complete_content.sql
--
-- OU exécutez ce fichier directement si vous êtes en local
