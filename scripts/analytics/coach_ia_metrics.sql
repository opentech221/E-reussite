-- ============================================
-- COACH IA v3.0 ANALYTICS - Collecte Métriques
-- Période: 21-28 octobre 2025
-- Version: 1.0
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
WHERE created_at >= '2025-10-21' 
  AND created_at < '2025-10-28'
  AND conversation_id IS NOT NULL;

-- Distribution durées (bonus)
SELECT 
  CASE 
    WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 < 2 THEN '< 2min'
    WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 < 5 THEN '2-5min'
    WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 < 10 THEN '5-10min'
    ELSE '> 10min'
  END as duration_range,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM ai_conversations
WHERE created_at >= '2025-10-21' 
  AND created_at < '2025-10-28'
  AND conversation_id IS NOT NULL
GROUP BY duration_range
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
  WHERE created_at >= '2025-10-21' 
    AND created_at < '2025-10-28'
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
      WHEN e.created_at > cu.coach_date 
       AND e.created_at < cu.coach_date + INTERVAL '72 hours'
      THEN e.id 
    END) as exams_72h
  FROM coach_users cu
  LEFT JOIN quiz_results q ON q.user_id = cu.user_id
  LEFT JOIN exam_results e ON e.user_id = cu.user_id
  GROUP BY cu.user_id
)
SELECT 
  'advice_application_rate_pct' as metric,
  ROUND(COUNT(CASE WHEN quizzes_24h > 0 OR exams_72h > 0 THEN 1 END) 
        * 100.0 / COUNT(*), 2) as value,
  COUNT(*) as sample_size,
  COUNT(CASE WHEN quizzes_24h > 0 THEN 1 END) as users_did_quiz,
  COUNT(CASE WHEN exams_72h > 0 THEN 1 END) as users_did_exam
FROM post_coach_actions;

-- =====================
-- METRIC 3: NPS (Proxy sentiment)
-- =====================
WITH sentiment AS (
  SELECT 
    conversation_id,
    MAX(CASE 
      WHEN content ~* '(merci|génial|super|excellent|top|parfait|wow|impressionnant)' 
      THEN 1 ELSE 0 
    END) as has_positive,
    MAX(CASE 
      WHEN content ~* '(nul|pas compris|compliqué|aide pas|inutile|décevant)' 
      THEN 1 ELSE 0 
    END) as has_negative
  FROM ai_conversations
  WHERE created_at >= '2025-10-21' 
    AND created_at < '2025-10-28'
    AND role = 'user'
  GROUP BY conversation_id
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
  ROUND((COUNT(CASE WHEN category = 'promoter' THEN 1 END) * 100.0 / COUNT(*)) -
        (COUNT(CASE WHEN category = 'detractor' THEN 1 END) * 100.0 / COUNT(*)), 2) as value,
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
  WHERE created_at >= '2025-10-21' 
    AND created_at < '2025-10-28'
  GROUP BY user_id
),
return_visits AS (
  SELECT 
    fv.user_id,
    fv.first_visit,
    COUNT(DISTINCT ac.conversation_id) as return_count
  FROM first_visits fv
  LEFT JOIN ai_conversations ac 
    ON ac.user_id = fv.user_id
    AND ac.created_at > fv.first_visit
    AND ac.created_at <= fv.first_visit + INTERVAL '7 days'
  GROUP BY fv.user_id, fv.first_visit
)
SELECT 
  'return_rate_pct' as metric,
  ROUND(COUNT(CASE WHEN return_count > 0 THEN 1 END) 
        * 100.0 / COUNT(*), 2) as value,
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
    conversation_id,
    COUNT(*) as message_count
  FROM ai_conversations
  WHERE created_at >= '2025-10-21' 
    AND created_at < '2025-10-28'
    AND conversation_id IS NOT NULL
  GROUP BY conversation_id
) as conv_messages;

-- Top sujets (mots-clés fréquents)
SELECT 
  'top_keywords' as metric,
  keyword,
  COUNT(*) as frequency,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
  SELECT 
    conversation_id,
    CASE 
      WHEN content ~* 'bfem' THEN 'BFEM'
      WHEN content ~* 'bac' THEN 'BAC'
      WHEN content ~* '(maths|mathématiques)' THEN 'Maths'
      WHEN content ~* '(stress|anxieux|peur)' THEN 'Stress'
      WHEN content ~* '(révision|réviser)' THEN 'Révision'
      WHEN content ~* '(quiz)' THEN 'Quiz'
      WHEN content ~* '(examen|exam)' THEN 'Examen'
      WHEN content ~* '(routine)' THEN 'Routine'
      WHEN content ~* '(nul|faible)' THEN 'Difficulté'
      ELSE 'Autre'
    END as keyword
  FROM ai_conversations
  WHERE created_at >= '2025-10-21' 
    AND created_at < '2025-10-28'
    AND role = 'user'
) as keywords
GROUP BY keyword
ORDER BY frequency DESC
LIMIT 10;

-- =====================
-- RÉSUMÉ GLOBAL (Vue consolidée)
-- =====================
SELECT 
  '========================================' as separator,
  'COACH IA v3.0 - RAPPORT ANALYTICS' as title,
  NOW() as generated_at,
  '========================================' as separator2;

-- Insertion dans table tracking (si existe)
-- INSERT INTO coach_ia_metrics (metric_date, metric_name, metric_value, sample_size)
-- SELECT 
--   CURRENT_DATE,
--   metric,
--   value,
--   sample_size
-- FROM (
--   -- Reprendre les 4 métriques principales ici
-- ) as daily_metrics;
