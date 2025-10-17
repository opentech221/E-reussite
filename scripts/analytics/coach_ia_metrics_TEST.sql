-- ============================================
-- COACH IA v3.0 ANALYTICS - Collecte Métriques TEST
-- Période: 11-18 octobre 2025 (DONNÉES RÉELLES)
-- Version: 1.0-TEST
-- ============================================
-- ⚠️ ATTENTION : Fichier de TEST avec dates passées
-- Fichier production : coach_ia_metrics.sql (21-28 Oct)
-- ============================================

-- =====================
-- METRIC 1: Temps moyen conversation
-- =====================
SELECT 
  'avg_conversation_duration_minutes' as metric,
  ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60), 2) as value,
  COUNT(*) as sample_size,
  MIN(created_at) as period_start,
  MAX(created_at) as period_end
FROM ai_conversations
WHERE created_at >= '2025-10-11' 
  AND created_at < '2025-10-18';

-- Distribution durées (bonus)
WITH durations AS (
  SELECT 
    CASE 
      WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 < 2 THEN '< 2min'
      WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 < 5 THEN '2-5min'
      WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 < 10 THEN '5-10min'
      ELSE '> 10min'
    END as duration_range
  FROM ai_conversations
  WHERE created_at >= '2025-10-11' 
    AND created_at < '2025-10-18'
)
SELECT 
  duration_range,
  cnt as count,
  COALESCE(ROUND(cnt * 100.0 / NULLIF(SUM(cnt) OVER (), 0), 2), 0) as percentage
FROM (
  SELECT 
    duration_range,
    COUNT(*) as cnt
  FROM durations
  GROUP BY duration_range
) t
ORDER BY 
  CASE duration_range
    WHEN '< 2min' THEN 1
    WHEN '2-5min' THEN 2
    WHEN '5-10min' THEN 3
    ELSE 4
  END;

-- =====================
-- METRIC 2: Taux application conseils
-- =====================
WITH coach_users AS (
  SELECT DISTINCT 
    user_id, 
    created_at as coach_date
  FROM ai_conversations
  WHERE created_at >= '2025-10-11' 
    AND created_at < '2025-10-18'
),
post_coach_actions AS (
  SELECT 
    cu.user_id,
    -- Quiz dans les 24h après Coach IA
    COUNT(DISTINCT CASE 
      WHEN q.created_at > cu.coach_date 
       AND q.created_at < cu.coach_date + INTERVAL '24 hours'
      THEN q.id 
    END) as quizzes_24h,
    -- Examens blancs dans les 72h
    COUNT(DISTINCT CASE 
      WHEN e.completed_at > cu.coach_date 
       AND e.completed_at < cu.coach_date + INTERVAL '72 hours'
      THEN e.id 
    END) as exams_72h
  FROM coach_users cu
  LEFT JOIN quiz_results q ON q.user_id = cu.user_id
  LEFT JOIN exam_results e ON e.user_id = cu.user_id
  GROUP BY cu.user_id
)
SELECT 
  'advice_application_rate_pct' as metric,
  COALESCE(ROUND(COUNT(CASE WHEN quizzes_24h > 0 OR exams_72h > 0 THEN 1 END) 
        * 100.0 / NULLIF(COUNT(*), 0), 2), 0) as value,
  COUNT(*) as sample_size,
  COUNT(CASE WHEN quizzes_24h > 0 THEN 1 END) as users_did_quiz,
  COUNT(CASE WHEN exams_72h > 0 THEN 1 END) as users_did_exam
FROM post_coach_actions;

-- =====================
-- METRIC 3: NPS (Proxy sentiment)
-- =====================
WITH sentiment AS (
  SELECT 
    m.conversation_id,
    MAX(CASE 
      WHEN m.content ~* '(merci|génial|super|excellent|top|parfait|wow|impressionnant)' 
      THEN 1 ELSE 0 
    END) as has_positive,
    MAX(CASE 
      WHEN m.content ~* '(nul|pas compris|compliqué|aide pas|inutile|décevant)' 
      THEN 1 ELSE 0 
    END) as has_negative
  FROM ai_messages m
  JOIN ai_conversations c ON c.id = m.conversation_id
  WHERE c.created_at >= '2025-10-11' 
    AND c.created_at < '2025-10-18'
    AND m.role = 'user'
  GROUP BY m.conversation_id
),
nps_categories AS (
  SELECT 
    CASE 
      WHEN has_positive = 1 AND has_negative = 0 THEN 'promoter'
      WHEN has_positive = 0 AND has_negative = 1 THEN 'detractor'
      ELSE 'passive'
    END as category
  FROM sentiment
)
SELECT 
  'nps_score' as metric,
  COALESCE(ROUND((COUNT(CASE WHEN category = 'promoter' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) -
        (COUNT(CASE WHEN category = 'detractor' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2), 0) as value,
  COUNT(*) as sample_size,
  COUNT(CASE WHEN category = 'promoter' THEN 1 END) as promoters,
  COUNT(CASE WHEN category = 'passive' THEN 1 END) as passives,
  COUNT(CASE WHEN category = 'detractor' THEN 1 END) as detractors
FROM nps_categories;

-- Conversion approximative NPS → Score /10
-- NPS > 50 ≈ 9-10/10
-- NPS 20-50 ≈ 8-9/10
-- NPS 0-20 ≈ 7-8/10
-- NPS < 0 ≈ < 7/10

-- =====================
-- METRIC 4: Taux retour 7 jours
-- =====================
WITH first_visits AS (
  SELECT 
    user_id, 
    MIN(created_at) as first_visit
  FROM ai_conversations
  WHERE created_at >= '2025-10-11' 
    AND created_at < '2025-10-18'
  GROUP BY user_id
),
return_visits AS (
  SELECT 
    fv.user_id,
    fv.first_visit,
    COUNT(DISTINCT ac.id) as return_count
  FROM first_visits fv
  LEFT JOIN ai_conversations ac 
    ON ac.user_id = fv.user_id
    AND ac.created_at > fv.first_visit
    AND ac.created_at <= fv.first_visit + INTERVAL '7 days'
  GROUP BY fv.user_id, fv.first_visit
)
SELECT 
  'return_rate_pct' as metric,
  COALESCE(ROUND(COUNT(CASE WHEN return_count > 0 THEN 1 END) 
        * 100.0 / NULLIF(COUNT(*), 0), 2), 0) as value,
  COUNT(*) as sample_size,
  COUNT(CASE WHEN return_count > 0 THEN 1 END) as returning_users,
  COUNT(CASE WHEN return_count = 0 THEN 1 END) as one_time_users,
  ROUND(AVG(return_count), 2) as avg_return_conversations
FROM return_visits;

-- =====================
-- MÉTRIQUES BONUS: Engagement détaillé
-- =====================

-- Messages par conversation
SELECT 
  'messages_per_conversation' as metric,
  ROUND(AVG(message_count), 2) as avg_value,
  MIN(message_count) as min_value,
  MAX(message_count) as max_value,
  COUNT(*) as sample_size
FROM (
  SELECT 
    m.conversation_id,
    COUNT(*) as message_count
  FROM ai_messages m
  JOIN ai_conversations c ON c.id = m.conversation_id
  WHERE c.created_at >= '2025-10-11' 
    AND c.created_at < '2025-10-18'
  GROUP BY m.conversation_id
) as conv_messages;

-- Top sujets (mots-clés fréquents)
SELECT 
  'top_keywords' as metric,
  keyword,
  COUNT(*) as frequency,
  COALESCE(ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 2), 0) as percentage
FROM (
  SELECT 
    m.conversation_id,
    CASE 
      WHEN m.content ~* 'bfem' THEN 'BFEM'
      WHEN m.content ~* 'bac' THEN 'BAC'
      WHEN m.content ~* '(maths|mathématiques)' THEN 'Maths'
      WHEN m.content ~* '(stress|anxieux|peur)' THEN 'Stress'
      WHEN m.content ~* '(révision|réviser)' THEN 'Révision'
      WHEN m.content ~* '(quiz)' THEN 'Quiz'
      WHEN m.content ~* '(examen|exam)' THEN 'Examen'
      WHEN m.content ~* '(routine)' THEN 'Routine'
      WHEN m.content ~* '(nul|faible)' THEN 'Difficulté'
      ELSE 'Autre'
    END as keyword
  FROM ai_messages m
  JOIN ai_conversations c ON c.id = m.conversation_id
  WHERE c.created_at >= '2025-10-11' 
    AND c.created_at < '2025-10-18'
    AND m.role = 'user'
) as keywords
GROUP BY keyword
ORDER BY frequency DESC
LIMIT 10;

-- =====================
-- RÉSUMÉ GLOBAL (Vue consolidée)
-- =====================
SELECT 
  '========================================' as separator,
  'COACH IA v3.0 - RAPPORT ANALYTICS TEST' as title,
  NOW() as generated_at,
  'Période: 11-18 octobre 2025' as period,
  '========================================' as separator2;

-- =====================
-- INSTRUCTIONS D'UTILISATION
-- =====================
-- 1. Ce fichier est pour TESTER le système avec des données réelles (11-18 Oct)
-- 2. Exécuter chaque requête séparément dans Supabase SQL Editor
-- 3. Vérifier que les résultats ont sample_size > 0 et values réalistes
-- 4. Une fois validé, utiliser coach_ia_metrics.sql (21-28 Oct) en PRODUCTION
-- 
-- VALIDATION CHECKLIST:
-- [ ] Metric 1: value > 0, sample_size > 0
-- [ ] Metric 2: value entre 0-100%, sample_size > 0
-- [ ] Metric 3: value NPS entre -100 et +100, sample_size > 0
-- [ ] Metric 4: value entre 0-100%, sample_size > 0
-- [ ] Metric 5: avg_value > 0, sample_size > 0
-- [ ] Metric 6: Au moins 1 keyword retourné
--
-- Si tous les tests passent ✅ → Système validé pour lundi 21 Oct !
