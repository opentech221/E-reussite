-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VÉRIFICATION: Chapitres disponibles pour conseils IA avec liens
-- Description: Vérifier que les relations chapitre_id/matiere_id sont correctes
-- Date: 8 octobre 2025
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- CONTEXTE
-- ============================================================================
-- Les suggestions de l'IA peuvent maintenant inclure des liens cliquables vers
-- des chapitres spécifiques. Pour que cela fonctionne, il faut vérifier que :
-- 1. Les quiz ont bien un chapitre_id
-- 2. Les examens ont bien un matiere_id
-- 3. Les chapitres ont un titre et un ordre correct

-- ============================================================================
-- VÉRIFICATION 1: Quiz avec chapitre_id
-- ============================================================================

-- Compter les quiz SANS chapitre_id (problématique)
SELECT COUNT(*) as quiz_sans_chapitre
FROM quiz
WHERE chapitre_id IS NULL;

-- Lister les quiz sans chapitre (à corriger manuellement)
SELECT id, title, difficulty
FROM quiz
WHERE chapitre_id IS NULL
ORDER BY id DESC;

-- ============================================================================
-- VÉRIFICATION 2: Examens avec matiere_id
-- ============================================================================

-- Compter les examens SANS matiere_id (problématique)
SELECT COUNT(*) as examens_sans_matiere
FROM examens
WHERE matiere_id IS NULL;

-- Lister les examens sans matière (à corriger manuellement)
SELECT id, title, type, difficulty
FROM examens
WHERE matiere_id IS NULL
ORDER BY id DESC;

-- ============================================================================
-- VÉRIFICATION 3: Chapitres avec titre et ordre
-- ============================================================================

-- Lister les chapitres pour chaque matière
SELECT 
  m.id as matiere_id,
  m.name as matiere_name,
  c.id as chapitre_id,
  c.ordre,
  c.title as chapitre_title,
  c.slug,
  (SELECT COUNT(*) FROM quiz WHERE chapitre_id = c.id) as nb_quiz
FROM matieres m
LEFT JOIN chapitres c ON c.matiere_id = m.id
ORDER BY m.name, c.ordre;

-- Vérifier les chapitres sans titre (problématique)
SELECT id, ordre, slug, matiere_id
FROM chapitres
WHERE title IS NULL OR title = ''
ORDER BY matiere_id, ordre;

-- ============================================================================
-- VÉRIFICATION 4: Relations quiz → chapitre → matière
-- ============================================================================

-- Vérifier la chaîne complète : quiz → chapitre → matière
SELECT 
  q.id as quiz_id,
  q.title as quiz_title,
  q.chapitre_id,
  c.title as chapitre_title,
  c.matiere_id,
  m.name as matiere_name
FROM quiz q
LEFT JOIN chapitres c ON q.chapitre_id = c.id
LEFT JOIN matieres m ON c.matiere_id = m.id
WHERE q.chapitre_id IS NOT NULL
ORDER BY m.name, c.ordre, q.title
LIMIT 50;

-- ============================================================================
-- VÉRIFICATION 5: Données de test pour conseils IA
-- ============================================================================

-- Récupérer les chapitres d'une matière spécifique (exemple: Mathématiques)
SELECT 
  id as chapitre_id,
  title as chapitre_title,
  ordre,
  slug
FROM chapitres
WHERE matiere_id = (SELECT id FROM matieres WHERE name = 'Mathématiques' LIMIT 1)
ORDER BY ordre;

-- Récupérer un quiz avec toutes ses relations
SELECT 
  q.id,
  q.title,
  q.difficulty,
  q.chapitre_id,
  c.title as chapitre_title,
  c.matiere_id,
  m.name as matiere_name
FROM quiz q
INNER JOIN chapitres c ON q.chapitre_id = c.id
INNER JOIN matieres m ON c.matiere_id = m.id
LIMIT 1;

-- ============================================================================
-- REQUÊTES DE CORRECTION (SI NÉCESSAIRE)
-- ============================================================================

-- EXEMPLE: Associer un quiz orphelin à un chapitre
-- UPDATE quiz 
-- SET chapitre_id = 15 
-- WHERE id = 42 AND chapitre_id IS NULL;

-- EXEMPLE: Associer un examen orphelin à une matière
-- UPDATE examens 
-- SET matiere_id = 1 
-- WHERE id = 10 AND matiere_id IS NULL;

-- EXEMPLE: Corriger le titre d'un chapitre
-- UPDATE chapitres 
-- SET title = 'Équations du Second Degré' 
-- WHERE id = 15 AND (title IS NULL OR title = '');

-- ============================================================================
-- FONCTION HELPER: Obtenir les chapitres pour une activité
-- ============================================================================

CREATE OR REPLACE FUNCTION get_related_chapters_for_quiz(p_quiz_id INTEGER)
RETURNS TABLE (
    chapitre_id INTEGER,
    chapitre_title TEXT,
    matiere_id INTEGER,
    matiere_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as chapitre_id,
        c.title as chapitre_title,
        m.id as matiere_id,
        m.name as matiere_name
    FROM quiz q
    INNER JOIN chapitres c ON q.chapitre_id = c.id
    INNER JOIN matieres m ON c.matiere_id = m.id
    WHERE q.id = p_quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_related_chapters_for_exam(p_exam_id INTEGER)
RETURNS TABLE (
    chapitre_id INTEGER,
    chapitre_title TEXT,
    ordre INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as chapitre_id,
        c.title as chapitre_title,
        c.ordre
    FROM examens e
    INNER JOIN chapitres c ON c.matiere_id = e.matiere_id
    WHERE e.id = p_exam_id
    ORDER BY c.ordre;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_related_chapters_for_quiz(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_related_chapters_for_exam(INTEGER) TO authenticated;

-- ============================================================================
-- TESTS
-- ============================================================================

-- Test 1: Récupérer les chapitres pour le quiz #1
SELECT * FROM get_related_chapters_for_quiz(1);

-- Test 2: Récupérer les chapitres pour l'examen #1
SELECT * FROM get_related_chapters_for_exam(1);

-- ============================================================================
-- STATISTIQUES FINALES
-- ============================================================================

SELECT 
    'Quiz' as type,
    COUNT(*) as total,
    COUNT(chapitre_id) as avec_relation,
    COUNT(*) - COUNT(chapitre_id) as sans_relation,
    ROUND((COUNT(chapitre_id)::DECIMAL / COUNT(*)) * 100, 2) as pourcentage_ok
FROM quiz

UNION ALL

SELECT 
    'Examens' as type,
    COUNT(*) as total,
    COUNT(matiere_id) as avec_relation,
    COUNT(*) - COUNT(matiere_id) as sans_relation,
    ROUND((COUNT(matiere_id)::DECIMAL / COUNT(*)) * 100, 2) as pourcentage_ok
FROM examens

UNION ALL

SELECT 
    'Chapitres' as type,
    COUNT(*) as total,
    COUNT(title) as avec_titre,
    COUNT(*) - COUNT(title) as sans_titre,
    ROUND((COUNT(title)::DECIMAL / COUNT(*)) * 100, 2) as pourcentage_ok
FROM chapitres;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================

-- Pour que les liens dans les conseils IA fonctionnent parfaitement :
-- 
-- ✅ Quiz avec chapitre_id : 100%
-- ✅ Examens avec matiere_id : 100%
-- ✅ Chapitres avec titre : 100%
--
-- Si les pourcentages sont < 100%, corriger les données orphelines
-- avec les requêtes UPDATE ci-dessus.

-- ============================================================================
-- NOTES D'IMPLÉMENTATION
-- ============================================================================

-- 1. Frontend (ActivityHistory.jsx) :
--    - Récupère les chapitres via Supabase avant d'appeler l'IA
--    - Passe les chapitres à generateAdviceForActivity()
--
-- 2. Backend (contextualAIService.js) :
--    - Reçoit relatedChapters[]
--    - Génère suggestions avec { text, chapterId, chapterTitle }
--
-- 3. Affichage (ActivityHistory.jsx) :
--    - Détecte si chapterId !== null
--    - Affiche bouton cliquable avec navigation vers /chapitre/{id}
--
-- 4. Base de données :
--    - Doit avoir relations correctes (quiz → chapitre, examen → matière)
--    - Chapitres doivent avoir id, title, ordre valides

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier qu'un résultat de quiz peut obtenir ses chapitres
SELECT 
  qr.id as result_id,
  qr.quiz_id,
  q.title as quiz_title,
  q.chapitre_id,
  c.title as chapitre_title,
  c.id as chapitre_id_for_link
FROM quiz_results qr
INNER JOIN quiz q ON qr.quiz_id = q.id
INNER JOIN chapitres c ON q.chapitre_id = c.id
WHERE qr.user_id = auth.uid()
ORDER BY qr.completed_at DESC
LIMIT 5;

-- Si cette requête retourne des résultats avec chapitre_id_for_link valide,
-- alors les liens dans les conseils IA fonctionneront ! ✅
