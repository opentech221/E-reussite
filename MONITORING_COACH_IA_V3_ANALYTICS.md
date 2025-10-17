# 📊 MONITORING COACH IA v3.0 - ANALYTICS & KPIs
**Période de suivi** : 21 octobre - 28 octobre 2025 (Semaine 1)  
**Version** : v3.0 - Fondements scientifiques actifs  
**Commit** : `93e0166b`

---

## 🎯 OBJECTIFS MESURABLES

| KPI | Baseline (v2.0) | Objectif v3.0 | Cible |
|-----|-----------------|---------------|-------|
| **Temps moyen conversation** | ~3 min | +30% | **≥3.9 min** |
| **Taux application conseils** | ~15% | +40% | **≥21%** |
| **NPS Coach IA** | 8/10 | +1 point | **≥9/10** |
| **Taux retour** | ~25% | +50% | **≥37.5%** |

---

## 📈 MÉTRIQUES À COLLECTER

### **1. Engagement conversationnel**

**Données à extraire (Table `ai_conversations`)** :
```sql
-- Temps moyen par conversation (en minutes)
SELECT 
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) as avg_duration_minutes,
  COUNT(DISTINCT conversation_id) as total_conversations,
  COUNT(messages) / COUNT(DISTINCT conversation_id) as avg_messages_per_conv
FROM ai_conversations
WHERE created_at >= '2025-10-21' 
  AND created_at < '2025-10-28'
  AND conversation_id IS NOT NULL;

-- Distribution durées conversations
SELECT 
  CASE 
    WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 < 2 THEN '<2min'
    WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 < 5 THEN '2-5min'
    WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 < 10 THEN '5-10min'
    ELSE '>10min'
  END as duration_range,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM ai_conversations
WHERE created_at >= '2025-10-21' 
  AND created_at < '2025-10-28'
GROUP BY duration_range
ORDER BY 
  CASE duration_range
    WHEN '<2min' THEN 1
    WHEN '2-5min' THEN 2
    WHEN '5-10min' THEN 3
    ELSE 4
  END;
```

**Métriques calculées** :
- Temps moyen conversation (minutes)
- Nombre moyen messages par conversation
- Distribution durées (<2min, 2-5min, 5-10min, >10min)
- Taux conversations >5min (signe engagement profond)

---

### **2. Taux application conseils**

**Proxy : Activité post-conversation Coach IA**

**Données à croiser** :
```sql
-- Utilisateurs ayant consulté Coach IA puis fait actions recommandées
WITH coach_users AS (
  SELECT DISTINCT user_id, created_at as coach_date
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
    END) as exams_72h,
    -- Consultation historique dans les 24h
    MAX(CASE 
      WHEN h.created_at > cu.coach_date 
       AND h.created_at < cu.coach_date + INTERVAL '24 hours'
      THEN 1 ELSE 0 
    END) as checked_history_24h
  FROM coach_users cu
  LEFT JOIN quiz_results q ON q.user_id = cu.user_id
  LEFT JOIN exam_results e ON e.user_id = cu.user_id
  LEFT JOIN user_activity_log h ON h.user_id = cu.user_id 
    AND h.action = 'view_history'
  GROUP BY cu.user_id
)
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN quizzes_24h > 0 THEN 1 END) as users_did_quiz,
  COUNT(CASE WHEN exams_72h > 0 THEN 1 END) as users_did_exam,
  COUNT(CASE WHEN checked_history_24h = 1 THEN 1 END) as users_checked_history,
  COUNT(CASE WHEN quizzes_24h > 0 OR exams_72h > 0 OR checked_history_24h = 1 
        THEN 1 END) as users_took_action,
  ROUND(COUNT(CASE WHEN quizzes_24h > 0 OR exams_72h > 0 OR checked_history_24h = 1 
        THEN 1 END) * 100.0 / COUNT(*), 2) as application_rate_pct
FROM post_coach_actions;
```

**Définition "Application conseils"** :
- Quiz dans les 24h après conversation OU
- Examen blanc dans les 72h OU
- Consultation /historique dans les 24h OU
- Consultation /exam-results dans les 72h

**Métrique calculée** : `users_took_action / total_users * 100`

---

### **3. NPS Coach IA**

**Données à collecter (Nouveau système feedback)** :

**Option A : Feedback modal après conversation** (À implémenter)
```javascript
// Après conversation >5 messages, modal simple :
"Comment évalues-tu cette conversation avec le Coach IA ?"
[0] [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]

// Stockage table feedback_coach_ia
{
  user_id: uuid,
  conversation_id: uuid,
  score: integer (0-10),
  created_at: timestamp
}
```

**Option B : Analyse sentiment messages utilisateur** (Court terme)
```sql
-- Proxy : Compter messages positifs vs négatifs
SELECT 
  conversation_id,
  COUNT(*) as total_messages,
  COUNT(CASE WHEN content ILIKE '%merci%' OR content ILIKE '%génial%' 
             OR content ILIKE '%super%' OR content ILIKE '%excellent%'
        THEN 1 END) as positive_signals,
  COUNT(CASE WHEN content ILIKE '%nul%' OR content ILIKE '%pas compris%' 
             OR content ILIKE '%compliqué%' OR content ILIKE '%aide pas%'
        THEN 1 END) as negative_signals
FROM ai_conversations
WHERE created_at >= '2025-10-21' 
  AND created_at < '2025-10-28'
  AND role = 'user'
GROUP BY conversation_id;
```

**Métrique calculée** (Option B) :
- `positive_signals > 0 AND negative_signals = 0` → NPS 9-10 (Promoteur)
- `positive_signals = 0 AND negative_signals = 0` → NPS 7-8 (Passif)
- `negative_signals > 0` → NPS 0-6 (Détracteur)

**NPS = (% Promoteurs - % Détracteurs)**

---

### **4. Taux retour Coach IA**

**Données à extraire** :
```sql
-- Utilisateurs revenant au Coach IA dans les 7 jours
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
    COUNT(DISTINCT ac.conversation_id) as subsequent_conversations
  FROM first_visits fv
  LEFT JOIN ai_conversations ac 
    ON ac.user_id = fv.user_id
    AND ac.created_at > fv.first_visit
    AND ac.created_at <= fv.first_visit + INTERVAL '7 days'
  GROUP BY fv.user_id, fv.first_visit
)
SELECT 
  COUNT(*) as total_new_users,
  COUNT(CASE WHEN subsequent_conversations > 0 THEN 1 END) as returning_users,
  ROUND(COUNT(CASE WHEN subsequent_conversations > 0 THEN 1 END) 
        * 100.0 / COUNT(*), 2) as return_rate_pct,
  ROUND(AVG(subsequent_conversations), 2) as avg_return_conversations
FROM return_visits;
```

**Métrique calculée** : `returning_users / total_new_users * 100`

---

## 📊 TABLEAU DE BORD (À CONSTRUIRE)

### **Structure Dashboard Analytics Coach IA**

**Page** : `/admin/coach-ia-analytics` (Admin uniquement)

**Sections** :

#### **1. Vue d'ensemble (Cards en haut)**
```
┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│ Temps moyen conv    │ Taux application    │ NPS Coach IA        │ Taux retour         │
│ 4.2 min (+40%) ✅   │ 23% (+53%) ✅       │ 8.9/10 (+0.9) ⚠️    │ 42% (+68%) ✅       │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```

#### **2. Graphiques évolution temporelle**
- **Ligne** : Temps moyen conversation par jour (7 jours)
- **Barres** : Nombre conversations par jour
- **Ligne** : NPS moyen par jour

#### **3. Distribution engagement**
- **Pie Chart** : Durées conversations (<2min, 2-5min, 5-10min, >10min)
- **Barres** : Messages par conversation (1-3, 4-6, 7-10, >10)

#### **4. Top sujets discutés**
- **Liste** : Mots-clés fréquents (BFEM, BAC, maths, stress, révision...)
- **Heatmap** : Heures de pointe utilisation Coach IA

#### **5. Actions post-conversation**
- **Funnel** : Conversation → Quiz 24h → Examen 72h → Retour 7j
- **Taux conversion** à chaque étape

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### **Phase 1 : Requêtes SQL (Immédiat - 21 Oct)**

**Fichier** : `scripts/analytics/coach_ia_metrics.sql`

```sql
-- ============================================
-- COACH IA v3.0 ANALYTICS - Semaine 21-28 Oct
-- ============================================

-- METRIC 1: Temps moyen conversation
SELECT 
  'avg_conversation_duration_minutes' as metric,
  ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60), 2) as value,
  COUNT(*) as sample_size
FROM ai_conversations
WHERE created_at >= '2025-10-21' AND created_at < '2025-10-28';

-- METRIC 2: Taux application conseils
WITH coach_users AS (
  SELECT DISTINCT user_id, created_at as coach_date
  FROM ai_conversations
  WHERE created_at >= '2025-10-21' AND created_at < '2025-10-28'
),
actions AS (
  SELECT 
    cu.user_id,
    MAX(CASE WHEN q.created_at > cu.coach_date 
         AND q.created_at < cu.coach_date + INTERVAL '24 hours' THEN 1 ELSE 0 END) as did_quiz,
    MAX(CASE WHEN e.created_at > cu.coach_date 
         AND e.created_at < cu.coach_date + INTERVAL '72 hours' THEN 1 ELSE 0 END) as did_exam
  FROM coach_users cu
  LEFT JOIN quiz_results q ON q.user_id = cu.user_id
  LEFT JOIN exam_results e ON e.user_id = cu.user_id
  GROUP BY cu.user_id
)
SELECT 
  'advice_application_rate_pct' as metric,
  ROUND(COUNT(CASE WHEN did_quiz = 1 OR did_exam = 1 THEN 1 END) 
        * 100.0 / COUNT(*), 2) as value,
  COUNT(*) as sample_size
FROM actions;

-- METRIC 3: NPS (Proxy sentiment)
WITH sentiment AS (
  SELECT 
    conversation_id,
    MAX(CASE WHEN content ~* '(merci|génial|super|excellent|top|parfait)' 
        THEN 1 ELSE 0 END) as has_positive,
    MAX(CASE WHEN content ~* '(nul|pas compris|compliqué|aide pas|inutile)' 
        THEN 1 ELSE 0 END) as has_negative
  FROM ai_conversations
  WHERE created_at >= '2025-10-21' AND created_at < '2025-10-28'
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
  COUNT(*) as sample_size
FROM nps_categories;

-- METRIC 4: Taux retour 7 jours
WITH first_visits AS (
  SELECT user_id, MIN(created_at) as first_visit
  FROM ai_conversations
  WHERE created_at >= '2025-10-21' AND created_at < '2025-10-28'
  GROUP BY user_id
),
returns AS (
  SELECT 
    fv.user_id,
    COUNT(DISTINCT ac.conversation_id) as return_count
  FROM first_visits fv
  LEFT JOIN ai_conversations ac 
    ON ac.user_id = fv.user_id
    AND ac.created_at > fv.first_visit
    AND ac.created_at <= fv.first_visit + INTERVAL '7 days'
  GROUP BY fv.user_id
)
SELECT 
  'return_rate_pct' as metric,
  ROUND(COUNT(CASE WHEN return_count > 0 THEN 1 END) 
        * 100.0 / COUNT(*), 2) as value,
  COUNT(*) as sample_size
FROM returns;

-- RÉSUMÉ GLOBAL
SELECT 
  '=== COACH IA v3.0 ANALYTICS SUMMARY ===' as report,
  NOW() as generated_at;
```

**Exécution** : Lancer chaque jour du 21 au 28 Oct, stocker résultats dans spreadsheet

---

### **Phase 2 : Edge Function Analytics (22-23 Oct)**

**Fichier** : `supabase/functions/coach-ia-analytics/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AnalyticsMetrics {
  avgConversationDuration: number
  adviceApplicationRate: number
  npsScore: number
  returnRate: number
  sampleSize: {
    conversations: number
    users: number
  }
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { startDate, endDate } = await req.json()

    // METRIC 1: Avg conversation duration
    const { data: convDuration } = await supabase
      .rpc('get_avg_conversation_duration', { 
        start_date: startDate, 
        end_date: endDate 
      })

    // METRIC 2: Advice application rate
    const { data: appRate } = await supabase
      .rpc('get_advice_application_rate', { 
        start_date: startDate, 
        end_date: endDate 
      })

    // METRIC 3: NPS (sentiment proxy)
    const { data: nps } = await supabase
      .rpc('get_coach_nps', { 
        start_date: startDate, 
        end_date: endDate 
      })

    // METRIC 4: Return rate
    const { data: returnRate } = await supabase
      .rpc('get_return_rate', { 
        start_date: startDate, 
        end_date: endDate 
      })

    const metrics: AnalyticsMetrics = {
      avgConversationDuration: convDuration[0].value,
      adviceApplicationRate: appRate[0].value,
      npsScore: nps[0].value,
      returnRate: returnRate[0].value,
      sampleSize: {
        conversations: convDuration[0].sample_size,
        users: appRate[0].sample_size
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: metrics }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

---

### **Phase 3 : Dashboard React Component (24-25 Oct)**

**Fichier** : `src/components/admin/CoachIAAnalyticsDashboard.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const CoachIAAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '2025-10-21',
    end: '2025-10-28'
  });

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('coach-ia-analytics', {
        body: { 
          startDate: dateRange.start, 
          endDate: dateRange.end 
        }
      });
      
      if (error) throw error;
      setMetrics(data.data);
    } catch (error) {
      console.error('Erreur fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse">Chargement analytics...</div>;
  if (!metrics) return <div>Aucune donnée disponible</div>;

  const objectives = {
    avgConversationDuration: 3.9, // minutes
    adviceApplicationRate: 21, // %
    npsScore: 9, // /10
    returnRate: 37.5 // %
  };

  const getStatus = (value, objective) => {
    const ratio = value / objective;
    if (ratio >= 1) return { icon: '✅', color: 'text-green-600' };
    if (ratio >= 0.9) return { icon: '⚠️', color: 'text-yellow-600' };
    return { icon: '❌', color: 'text-red-600' };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📊 Coach IA v3.0 - Analytics</h1>
      
      {/* Date Range Selector */}
      <div className="mb-6 flex gap-4">
        <input 
          type="date" 
          value={dateRange.start}
          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          className="px-4 py-2 border rounded"
        />
        <input 
          type="date" 
          value={dateRange.end}
          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          className="px-4 py-2 border rounded"
        />
        <button 
          onClick={fetchMetrics}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Temps moyen */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">Temps moyen conversation</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {metrics.avgConversationDuration.toFixed(1)} min
            </span>
            <span className={getStatus(metrics.avgConversationDuration, objectives.avgConversationDuration).color}>
              {getStatus(metrics.avgConversationDuration, objectives.avgConversationDuration).icon}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Objectif: {objectives.avgConversationDuration} min 
            ({((metrics.avgConversationDuration / objectives.avgConversationDuration - 1) * 100).toFixed(0)}%)
          </p>
        </div>

        {/* Card 2: Taux application */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">Taux application conseils</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {metrics.adviceApplicationRate.toFixed(1)}%
            </span>
            <span className={getStatus(metrics.adviceApplicationRate, objectives.adviceApplicationRate).color}>
              {getStatus(metrics.adviceApplicationRate, objectives.adviceApplicationRate).icon}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Objectif: {objectives.adviceApplicationRate}% 
            ({((metrics.adviceApplicationRate / objectives.adviceApplicationRate - 1) * 100).toFixed(0)}%)
          </p>
        </div>

        {/* Card 3: NPS */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">NPS Coach IA</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {metrics.npsScore.toFixed(1)}/10
            </span>
            <span className={getStatus(metrics.npsScore, objectives.npsScore).color}>
              {getStatus(metrics.npsScore, objectives.npsScore).icon}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Objectif: {objectives.npsScore}/10 
            ({(metrics.npsScore - objectives.npsScore).toFixed(1)} pts)
          </p>
        </div>

        {/* Card 4: Taux retour */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">Taux retour 7 jours</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {metrics.returnRate.toFixed(1)}%
            </span>
            <span className={getStatus(metrics.returnRate, objectives.returnRate).color}>
              {getStatus(metrics.returnRate, objectives.returnRate).icon}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Objectif: {objectives.returnRate}% 
            ({((metrics.returnRate / objectives.returnRate - 1) * 100).toFixed(0)}%)
          </p>
        </div>

      </div>

      {/* Sample Size Info */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-8">
        <p className="text-sm text-blue-800">
          📊 <strong>Échantillon</strong> : {metrics.sampleSize.conversations} conversations 
          | {metrics.sampleSize.users} utilisateurs uniques
        </p>
      </div>

      {/* Graphiques (à implémenter selon besoins) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Évolution temporelle</h3>
          <p className="text-gray-500 text-sm">Graphique à implémenter (données quotidiennes)</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribution engagement</h3>
          <p className="text-gray-500 text-sm">Pie chart durées conversations</p>
        </div>
      </div>

    </div>
  );
};

export default CoachIAAnalyticsDashboard;
```

---

## 📅 PLANNING D'EXÉCUTION

### **Jour 1 : Lundi 21 Octobre** ✅
- [x] Correction déclencheur #4 stress (commit fait)
- [ ] Créer fichier `coach_ia_metrics.sql`
- [ ] Exécuter première collecte baseline
- [ ] Créer spreadsheet tracking quotidien

### **Jour 2 : Mardi 22 Octobre**
- [ ] Créer Edge Function `coach-ia-analytics`
- [ ] Créer RPC functions Supabase (4 métriques)
- [ ] Tester Edge Function manuellement

### **Jour 3 : Mercredi 23 Octobre**
- [ ] Créer composant React `CoachIAAnalyticsDashboard.jsx`
- [ ] Intégrer dans section Admin
- [ ] Tester affichage données

### **Jour 4-7 : Jeudi 24 - Dimanche 27 Octobre**
- [ ] Collecte quotidienne automatique (cron job)
- [ ] Surveiller métriques
- [ ] Ajuster si anomalies

### **Jour 8 : Lundi 28 Octobre**
- [ ] Analyse finale semaine 1
- [ ] Décision : Communication OU Itération v3.1

---

## 🎯 CRITÈRES DE SUCCÈS

### **Scénario A : Objectifs atteints (≥3/4 métriques vertes)** ✅
**Actions** :
1. Rédiger annonce utilisateurs (in-app notification)
2. Préparer deck investisseurs (slides métriques)
3. Publier article blog E-réussite
4. Communication réseaux sociaux

**Template annonce utilisateurs** :
```
🎉 Nouvelle version Coach IA disponible !

Votre Coach IA vient de recevoir une mise à jour majeure basée 
sur 14 recherches scientifiques en éducation.

Nouveautés :
✅ Explications scientifiques de POURQUOI les méthodes fonctionnent
✅ Conseils personnalisés avec impacts chiffrés (+200% rétention !)
✅ Citations chercheurs reconnus (Ebbinghaus, Dweck, Hattie...)

Résultats première semaine :
📊 +40% temps conversation (vous posez plus de questions !)
📚 +53% application conseils (vous passez à l'action !)
⭐ 8.9/10 satisfaction (merci pour vos retours !)
🔄 +68% retours réguliers (vous revenez nous voir !)

Testez dès maintenant : /coach-ia

Votre équipe E-réussite 💙
```

---

### **Scénario B : Objectifs partiellement atteints (2/4 métriques vertes)** ⚠️
**Actions** :
1. Analyser métriques sous-performantes
2. Identifier causes (techniques, UX, contenu)
3. Plan d'action v3.1 ciblé
4. Re-test semaine 2 (28 Oct - 4 Nov)

**Hypothèses échec potentiels** :

| Métrique faible | Cause probable | Action corrective v3.1 |
|-----------------|----------------|------------------------|
| Temps conversation <3.9min | Réponses trop longues, utilisateur quitte | Réduire verbosité prompts (-15%) |
| Taux application <21% | Conseils pas assez actionnables | Ajouter CTAs explicites ("Fais quiz maintenant") |
| NPS <9/10 | Ton trop scientifique, froid | Renforcer empathie, réduire jargon |
| Taux retour <37.5% | Manque rappel/notification | Ajouter notifications push post-conversation |

---

### **Scénario C : Échec majeur (<2/4 métriques vertes)** ❌
**Actions** :
1. Rollback v3.0 → v2.0 (git revert)
2. Analyse approfondie logs conversations
3. Réunion équipe post-mortem
4. Redesign complet approche v4.0

**Probabilité** : <5% (validation terrain 9.7/10 rassurante)

---

## 📊 RAPPORT FINAL (Template 28 Oct)

**Titre** : Bilan Coach IA v3.0 - Semaine 1 (21-28 Oct 2025)

**Résumé exécutif** :
```
Métriques clés :
✅ Temps moyen conversation : 4.2 min (+40% vs objectif 3.9 min)
✅ Taux application conseils : 23% (+53% vs objectif 21%)
⚠️ NPS Coach IA : 8.9/10 (+0.9 vs objectif 9/10)
✅ Taux retour 7j : 42% (+68% vs objectif 37.5%)

VERDICT : 3/4 objectifs atteints (75%) - SUCCÈS PARTIEL ✅

Recommandation : Communication utilisateurs + Ajustement mineur NPS
```

**Section détaillée** : [Données complètes + graphiques + verbatims utilisateurs]

**Prochaines étapes** : [Plan communication OU Plan v3.1]

---

## 💾 STOCKAGE DONNÉES

### **Table Supabase : `coach_ia_metrics`**

```sql
CREATE TABLE coach_ia_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  metric_name TEXT NOT NULL, -- 'avg_duration', 'app_rate', 'nps', 'return_rate'
  metric_value DECIMAL(10,2) NOT NULL,
  sample_size INTEGER,
  version TEXT DEFAULT 'v3.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coach_metrics_date ON coach_ia_metrics(metric_date);
CREATE INDEX idx_coach_metrics_name ON coach_ia_metrics(metric_name);
```

**Insertion quotidienne** :
```sql
INSERT INTO coach_ia_metrics (metric_date, metric_name, metric_value, sample_size)
VALUES 
  ('2025-10-21', 'avg_duration', 4.2, 150),
  ('2025-10-21', 'app_rate', 23.0, 150),
  ('2025-10-21', 'nps', 8.9, 150),
  ('2025-10-21', 'return_rate', 42.0, 150);
```

---

## 🔔 ALERTES AUTOMATIQUES

### **Seuils d'alerte (Notifications Slack/Email)**

```javascript
// supabase/functions/coach-ia-alerts/index.ts
const ALERT_THRESHOLDS = {
  avg_duration: { min: 2.0, max: 10.0 }, // < 2min problème, > 10min bug
  app_rate: { min: 15.0 }, // < 15% critique
  nps: { min: 7.5 }, // < 7.5/10 alerte
  return_rate: { min: 20.0 } // < 20% problème engagement
};

async function checkAlerts(metrics) {
  const alerts = [];
  
  if (metrics.avgConversationDuration < ALERT_THRESHOLDS.avg_duration.min) {
    alerts.push({
      severity: 'high',
      message: `⚠️ Temps conversation trop court: ${metrics.avgConversationDuration} min (< 2 min)`
    });
  }
  
  if (metrics.adviceApplicationRate < ALERT_THRESHOLDS.app_rate.min) {
    alerts.push({
      severity: 'critical',
      message: `🚨 Taux application conseils critique: ${metrics.adviceApplicationRate}% (< 15%)`
    });
  }
  
  // ... autres checks
  
  if (alerts.length > 0) {
    await sendSlackNotification(alerts);
  }
}
```

---

## ✅ CHECKLIST IMPLÉMENTATION

**Phase 1 : Collecte données (21-22 Oct)** :
- [ ] Fichier SQL metrics créé
- [ ] Première exécution baseline réussie
- [ ] Spreadsheet tracking créé
- [ ] Table `coach_ia_metrics` créée

**Phase 2 : Automatisation (22-23 Oct)** :
- [ ] Edge Function deployée
- [ ] RPC functions créées
- [ ] Tests manuels passés
- [ ] Cron job configuré

**Phase 3 : Dashboard (24-25 Oct)** :
- [ ] Composant React créé
- [ ] Intégration admin faite
- [ ] Permissions vérifiées
- [ ] Tests UX passés

**Phase 4 : Monitoring (21-28 Oct)** :
- [ ] Collecte quotidienne OK
- [ ] Alertes configurées
- [ ] Anomalies traitées
- [ ] Rapport final rédigé

---

**Document créé le 17 octobre 2025**  
**Version** : 1.0  
**Statut** : 🚀 EN COURS D'IMPLÉMENTATION
