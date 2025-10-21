# 🚨 GUIDE EXÉCUTION BASELINE - COACH IA v3.0

**Date** : 21 octobre 2025  
**Durée** : 15 minutes  
**Objectif** : Collecter métriques Day 1 (baseline)

---

## 📋 ÉTAPES D'EXÉCUTION

### **Étape 1 : Ouvrir Supabase SQL Editor** (2 min)

1. Aller sur : https://supabase.com/dashboard
2. Sélectionner projet **E-réussite**
3. Menu latéral → **SQL Editor**
4. Cliquer **"New query"**

---

### **Étape 2 : Exécuter Metric 1 (Temps moyen)** (3 min)

**Copier-coller cette requête** :

```sql
-- METRIC 1: Temps moyen conversation
SELECT 
  'avg_conversation_duration_minutes' as metric,
  ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60), 2) as value,
  COUNT(*) as sample_size,
  MIN(created_at) as period_start,
  MAX(created_at) as period_end
FROM ai_conversations
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  AND created_at < CURRENT_DATE;
```

**Cliquer "Run"** → Noter résultat ci-dessous :

```
✏️ RÉSULTAT METRIC 1 :
value: __________ min
sample_size: __________
```

---

### **Étape 3 : Exécuter Metric 2 (Application conseils)** (3 min)

**Copier-coller cette requête** :

```sql
-- METRIC 2: Taux application conseils
WITH coach_users AS (
  SELECT DISTINCT user_id, created_at
  FROM ai_conversations
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND created_at < CURRENT_DATE
),
post_coach_actions AS (
  SELECT 
    cu.user_id,
    EXISTS(
      SELECT 1 FROM quiz_results q
      WHERE q.user_id = cu.user_id
        AND q.created_at >= cu.created_at
        AND q.created_at <= cu.created_at + INTERVAL '24 hours'
    ) as did_quiz,
    EXISTS(
      SELECT 1 FROM exam_results e
      WHERE e.user_id = cu.user_id
        AND e.completed_at >= cu.created_at
        AND e.completed_at <= cu.created_at + INTERVAL '72 hours'
    ) as did_exam
  FROM coach_users cu
)
SELECT 
  'application_conseils_percentage' as metric,
  COALESCE(ROUND(COUNT(CASE WHEN did_quiz OR did_exam THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2), 0) as value,
  COUNT(*) as sample_size,
  COUNT(CASE WHEN did_quiz THEN 1 END) as users_did_quiz,
  COUNT(CASE WHEN did_exam THEN 1 END) as users_did_exam
FROM post_coach_actions;
```

**Cliquer "Run"** → Noter résultat ci-dessous :

```
✏️ RÉSULTAT METRIC 2 :
value: ___________%
sample_size: __________
users_did_quiz: __________
users_did_exam: __________
```

---

### **Étape 4 : Exécuter Metric 3 (NPS)** (3 min)

**Copier-coller cette requête** :

```sql
-- METRIC 3: NPS sentiment
WITH sentiment AS (
  SELECT 
    m.conversation_id,
    COALESCE(
      AVG(
        CASE 
          WHEN m.content ILIKE '%merci%' OR m.content ILIKE '%super%' 
            OR m.content ILIKE '%excellent%' OR m.content ILIKE '%génial%' THEN 1
          WHEN m.content ILIKE '%pas bien%' OR m.content ILIKE '%mauvais%' 
            OR m.content ILIKE '%nul%' THEN -1
          ELSE 0
        END
      ), 0
    ) as sentiment_score
  FROM ai_messages m
  JOIN ai_conversations c ON c.id = m.conversation_id
  WHERE c.created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND c.created_at < CURRENT_DATE
    AND m.role = 'user'
  GROUP BY m.conversation_id
)
SELECT 
  'nps_sentiment_score' as metric,
  COALESCE(
    ROUND(
      (COUNT(CASE WHEN sentiment_score > 0.3 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) -
      (COUNT(CASE WHEN sentiment_score < -0.3 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)),
      2
    ), 0
  ) as value,
  COUNT(*) as sample_size,
  COUNT(CASE WHEN sentiment_score > 0.3 THEN 1 END) as promoters,
  COUNT(CASE WHEN sentiment_score BETWEEN -0.3 AND 0.3 THEN 1 END) as passives,
  COUNT(CASE WHEN sentiment_score < -0.3 THEN 1 END) as detractors
FROM sentiment;
```

**Cliquer "Run"** → Noter résultat ci-dessous :

```
✏️ RÉSULTAT METRIC 3 :
value (NPS): __________
sample_size: __________
promoters: __________
passives: __________
detractors: __________

Conversion /10 (voir table) : __________ /10
```

**Table conversion NPS → /10** :
- NPS > 70 → 10/10
- NPS 50-70 → 9/10
- NPS 20-50 → 8/10
- NPS 0-20 → 7/10
- NPS -20-0 → 6/10
- NPS < -20 → <6/10

---

### **Étape 5 : Exécuter Metric 4 (Retour 7j)** (3 min)

**Copier-coller cette requête** :

```sql
-- METRIC 4: Taux retour 7 jours
WITH first_conversations AS (
  SELECT 
    user_id,
    MIN(created_at) as first_conv_date
  FROM ai_conversations
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND created_at < CURRENT_DATE
  GROUP BY user_id
),
returning_users AS (
  SELECT 
    fc.user_id,
    EXISTS(
      SELECT 1
      FROM ai_conversations ac
      WHERE ac.user_id = fc.user_id
        AND ac.created_at > fc.first_conv_date
        AND ac.created_at <= fc.first_conv_date + INTERVAL '7 days'
        AND DATE(ac.created_at) != DATE(fc.first_conv_date)
    ) as returned_within_7days
  FROM first_conversations fc
)
SELECT 
  'return_rate_7days_percentage' as metric,
  COALESCE(ROUND(COUNT(CASE WHEN returned_within_7days THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2), 0) as value,
  COUNT(*) as sample_size,
  COUNT(CASE WHEN returned_within_7days THEN 1 END) as returning_users,
  COUNT(CASE WHEN NOT returned_within_7days THEN 1 END) as one_time_users
FROM returning_users;
```

**Cliquer "Run"** → Noter résultat ci-dessous :

```
✏️ RÉSULTAT METRIC 4 :
value: ___________%
sample_size: __________
returning_users: __________
one_time_users: __________
```

---

### **Étape 6 : Sauvegarder résultats** (1 min)

**Créer fichier temporaire** : `BASELINE_21_OCT_2025.txt`

```
========================================
BASELINE COACH IA v3.0 - 21 OCTOBRE 2025
========================================

Date collecte: 21/10/2025 à __h__
Période: 21-28 Oct (Day 1)

METRIC 1 - Temps moyen conversation
- Valeur: ______ min
- Sample: ______ conversations
- Status: [VERT ✅ / JAUNE ⚠️ / ROUGE ❌]
- Objectif: ≥ 3.9 min

METRIC 2 - Application conseils
- Valeur: ______%
- Sample: ______ users
- Quiz 24h: ______ users
- Exam 72h: ______ users
- Status: [VERT ✅ / JAUNE ⚠️ / ROUGE ❌]
- Objectif: ≥ 21%

METRIC 3 - NPS Satisfaction
- Valeur NPS: ______
- Conversion /10: ______
- Sample: ______ conversations
- Promoters: ______
- Passives: ______
- Detractors: ______
- Status: [VERT ✅ / JAUNE ⚠️ / ROUGE ❌]
- Objectif: ≥ 9.0/10

METRIC 4 - Retour 7 jours
- Valeur: ______%
- Sample: ______ users
- Returning: ______ users
- One-time: ______ users
- Status: [VERT ✅ / JAUNE ⚠️ / ROUGE ❌]
- Objectif: ≥ 37.5%

========================================
SCORE GLOBAL: __/4 métriques vertes ✅
========================================

OBSERVATIONS DAY 1:
[Notes qualitatives, anomalies détectées, contexte particulier...]

NEXT ACTION:
- Demain 22 Oct 9h: Collecte Day 2
- Continuer 7 jours (21-28 Oct)
- Final report: 28 Oct après-midi
```

---

## ✅ CHECKLIST FINALE

- [ ] Metric 1 exécutée → Résultat noté
- [ ] Metric 2 exécutée → Résultat noté
- [ ] Metric 3 exécutée → Résultat noté + conversion /10
- [ ] Metric 4 exécutée → Résultat noté
- [ ] Fichier `BASELINE_21_OCT_2025.txt` créé
- [ ] Score global calculé (__/4)
- [ ] Observations qualitatives ajoutées

---

## 🎯 PROCHAINES ÉTAPES

**Aujourd'hui après baseline** :
1. Commencer optimisation Streak UI
2. Documenter résultats baseline

**Demain 22 Oct 9h** :
1. Collecte Day 2 (mêmes 4 requêtes)
2. Comparer avec baseline (Δ%)
3. Continuer développement streak

**Cette semaine (21-28 Oct)** :
- Collecte quotidienne 9h00 (7 jours)
- Développement parallèle (streak, notifications)
- Observations anomalies

**28 Oct après-midi** :
- Final report (moyennes, tendances, décision GO/NO-GO)

---

**TEMPS TOTAL BASELINE: ~15 minutes** ⏱️

**C'est parti ! Exécute les 4 requêtes et reviens avec les résultats ! 🚀**
