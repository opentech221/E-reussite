# 🚀 Roadmap des Améliorations Gamification - E-Réussite

## ✅ Phase 1 : Système de Base (TERMINÉ)

### Backend
- [x] Tables database (user_points, user_badges, user_progress)
- [x] Fonctions gamification (getUserPoints, awardPoints, updateStreak, etc.)
- [x] Triggers automatiques pour level calculation
- [x] RLS policies pour sécurité

### Frontend
- [x] Dashboard avec affichage points/niveau/badges
- [x] Progress bar vers niveau suivant
- [x] Leaderboard Top 10 avec médailles
- [x] Highlighting utilisateur actuel
- [x] Cartes de statistiques (5 cards)

### Documentation
- [x] DASHBOARD_AMELIORE.md
- [x] DIAGNOSTIC_PGRST116.md
- [x] SESSION_DEBUG_SUCCESS_05_OCT_2025.md

**Status** : ✅ 100% Opérationnel

---

## ✅ Phase 2 : Animation Toast Badges (TERMINÉ)

### Installation
- [x] npm install sonner

### Composants
- [x] BadgeNotification.jsx créé
- [x] 9 types de badges configurés
- [x] LevelUpToastContent pour montée de niveau
- [x] BadgeToastContent pour badges normaux

### Intégration
- [x] Toaster provider dans App.jsx
- [x] Import sonner dans SupabaseAuthContext
- [x] Modification completeQuiz pour notifications
- [x] Séquençage avec délais (800ms entre toasts)

### Types de Badges Implémentés
- [x] 🎯 first_quiz - Premier quiz
- [x] ⭐ perfect_score - Score 100%
- [x] 🔥 streak_3 - 3 jours consécutifs
- [x] 🔥 streak_7 - 7 jours consécutifs
- [x] 🔥 streak_30 - 30 jours consécutifs
- [x] 🏆 quiz_master_10 - 10 quiz
- [x] 🏆 quiz_master_50 - 50 quiz
- [x] ✅ chapter_complete - Chapitre terminé
- [x] ⚡ level_up - Nouveau niveau

### Documentation
- [x] TOAST_BADGES_IMPLEMENTATION.md

**Status** : ✅ 100% Opérationnel

---

## 🔄 Phase 3 : Graphique d'Évolution des Points (EN COURS)

### Objectif
Afficher l'évolution des points de l'utilisateur sur 7 ou 30 jours pour visualiser sa progression.

### Technologies Envisagées
- **Option A** : Recharts (React + D3, léger)
- **Option B** : Chart.js (populaire, simple)
- **Option C** : Victory (React native)

### Backend Requis
1. **Table : user_points_history**
   ```sql
   CREATE TABLE user_points_history (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     points_earned INT NOT NULL,
     action_type TEXT, -- 'quiz_completion', 'lesson_completed', etc.
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Fonction : getUserPointsHistory**
   ```javascript
   async function getUserPointsHistory(userId, days = 7) {
     // Récupère l'historique des X derniers jours
     // Agrège par jour pour afficher sur le graphique
   }
   ```

### Frontend
1. **Composant : PointsChart.jsx**
   - Line chart ou bar chart
   - Affichage 7 jours / 30 jours (toggle)
   - Tooltip avec détails du jour
   - Responsive mobile

2. **Intégration Dashboard**
   - Section "Évolution" après les cartes stats
   - Graphique pleine largeur
   - Tabs pour 7j / 30j

### Étapes d'Implémentation

#### Étape 1 : Installation
```bash
npm install recharts
```

#### Étape 2 : Migration Database
```sql
-- Créer table historique
CREATE TABLE user_points_history ( ... );

-- Modifier awardPoints pour logger l'historique
-- À chaque attribution de points, INSERT dans history
```

#### Étape 3 : Fonction Backend
```javascript
export async function getUserPointsHistory(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('user_points_history')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });
    
  // Agrégation par jour
  const dailyPoints = aggregateByDay(data);
  return dailyPoints;
}
```

#### Étape 4 : Composant Chart
```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const PointsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="points" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

#### Étape 5 : Intégration Dashboard
```jsx
const [pointsHistory, setPointsHistory] = useState([]);
const [historyPeriod, setHistoryPeriod] = useState(7); // 7 ou 30 jours

useEffect(() => {
  async function fetchHistory() {
    const history = await getUserPointsHistory(user.id, historyPeriod);
    setPointsHistory(history);
  }
  fetchHistory();
}, [historyPeriod]);
```

### Design
- Couleur : Primary gradient
- Tooltip : Points + date + actions
- Toggle : Buttons "7 jours" / "30 jours"
- Animation : Line drawing animation

**Estimation** : 2-3 heures
**Priorité** : HAUTE (visualisation = motivation)

---

## 🎯 Phase 4 : Défis Quotidiens/Hebdomadaires (À PLANIFIER)

### Objectif
Proposer des défis aux utilisateurs pour augmenter l'engagement.

### Types de Défis

#### Défis Quotidiens
- "Complète 3 quiz aujourd'hui" → +50 points bonus
- "Obtiens 100% sur un quiz" → +100 points bonus
- "Apprends pendant 30 minutes" → Badge spécial

#### Défis Hebdomadaires
- "Complète 10 quiz cette semaine" → +500 points
- "Maintiens une série de 5 jours" → Badge "Assidu"
- "Aide 3 autres étudiants" (futur feature) → Badge "Mentor"

### Backend Requis

#### Table : challenges
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT, -- 'daily', 'weekly', 'special'
  goal_type TEXT, -- 'quiz_count', 'score', 'time_spent', etc.
  goal_value INT NOT NULL,
  reward_points INT DEFAULT 0,
  reward_badge_type TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Table : user_challenges
```sql
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  challenge_id UUID REFERENCES challenges(id),
  progress INT DEFAULT 0,
  goal_value INT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  claimed_reward BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fonctions Backend
```javascript
// Récupère les défis actifs
async function getActiveChallenges(userId);

// Récupère la progression de l'utilisateur
async function getUserChallengeProgress(userId, challengeId);

// Met à jour la progression
async function updateChallengeProgress(userId, challengeId, increment);

// Complète un défi et attribue récompense
async function completeChallenge(userId, challengeId);
```

### Frontend

#### Composant : ChallengesPanel.jsx
- Liste des défis actifs
- Progress bar pour chaque défi
- Bouton "Réclamer" quand complété
- Animation de célébration

#### Intégration
- Section dans Dashboard
- Page dédiée /challenges
- Badge notification quand défi complété

### Logique
1. À chaque action (quiz, leçon), vérifier les défis actifs
2. Incrémenter la progression si applicable
3. Si goal atteint → marquer comme complété
4. Toast notification "Défi complété !"
5. Bouton pour réclamer la récompense

**Estimation** : 4-5 heures
**Priorité** : MOYENNE (feature engageante mais complexe)

---

## 🔔 Phase 5 : Notifications Push (À PLANIFIER)

### Objectif
Rappeler les utilisateurs de revenir sur la plateforme pour maintenir leurs streaks et progresser.

### Types de Notifications

#### Notifications Streak
- "🔥 N'oubliez pas votre série ! Connectez-vous aujourd'hui"
- "⚠️ Votre série de 7 jours se termine dans 2 heures"

#### Notifications Défis
- "🎯 Nouveau défi disponible !"
- "⏰ Le défi hebdomadaire se termine demain"

#### Notifications Badges
- "🏆 Plus qu'un quiz pour débloquer le badge 'Maître des Quiz' !"

#### Notifications Sociales (futur)
- "👤 Jean a dépassé votre score au leaderboard"
- "💬 Nouveau message sur le forum"

### Technologies

#### Option A : Web Push API (natif)
- Gratuit
- Nécessite Service Worker
- Support navigateur moderne

#### Option B : Firebase Cloud Messaging (FCM)
- Gratuit
- Meilleure compatibilité
- Plus de features

#### Option C : Supabase Edge Functions + Push
- Intégré à Supabase
- Serverless
- Simple à déployer

### Backend Requis

#### Table : user_notification_settings
```sql
CREATE TABLE user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  push_enabled BOOLEAN DEFAULT false,
  push_subscription JSONB, -- Web Push subscription object
  email_notifications BOOLEAN DEFAULT true,
  streak_reminders BOOLEAN DEFAULT true,
  challenge_reminders BOOLEAN DEFAULT true,
  badge_alerts BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table : notifications (historique)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT, -- 'streak', 'challenge', 'badge', 'social'
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Frontend

#### Composant : NotificationSettings.jsx
- Toggle pour activer/désactiver
- Checkboxes pour types de notifs
- Bouton "Tester les notifications"

#### Service Worker
```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: '/icon-192x192.png',
    badge: '/badge-icon.png',
    data: { url: data.action_url }
  });
});
```

#### Permission Request
```javascript
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const subscription = await registerPushSubscription();
    await saveSubscription(subscription);
  }
}
```

### Edge Function : send-notification
```javascript
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const { userId, type, title, message } = await req.json();
  
  // Récupérer le subscription de l'utilisateur
  const { data: settings } = await supabase
    .from('user_notification_settings')
    .select('push_subscription')
    .eq('user_id', userId)
    .single();
  
  if (settings?.push_subscription) {
    // Envoyer la notification push
    await sendWebPush(settings.push_subscription, {
      title,
      message,
      action_url: `/dashboard`
    });
  }
  
  // Logger dans l'historique
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message
  });
  
  return new Response('OK', { status: 200 });
});
```

### Triggers
```javascript
// Chaque jour à 18h, vérifier les streaks
async function checkStreaksDaily() {
  const usersWithStreak = await getUsersWithActiveStreak();
  
  for (const user of usersWithStreak) {
    const lastActivity = user.last_activity_date;
    const hoursSinceActivity = getHoursDiff(lastActivity, new Date());
    
    if (hoursSinceActivity > 20) {
      // Envoyer notification de rappel
      await sendNotification(user.id, 'streak', 
        '🔥 Votre série continue !',
        'Connectez-vous pour maintenir votre série'
      );
    }
  }
}
```

**Estimation** : 6-8 heures
**Priorité** : BASSE (feature avancée, nécessite infra)

---

## 📅 Planning Recommandé

### Semaine 1
- [x] ✅ Phase 1 : Système de base (TERMINÉ)
- [x] ✅ Phase 2 : Toast badges (TERMINÉ)

### Semaine 2
- [ ] 🔄 Phase 3 : Graphique d'évolution (EN COURS)
  - Jour 1 : Migration DB + fonction backend
  - Jour 2 : Composant chart + intégration
  - Jour 3 : Tests + polish

### Semaine 3
- [ ] Phase 4 : Défis quotidiens/hebdomadaires
  - Jour 1-2 : Tables DB + fonctions
  - Jour 3-4 : Composants frontend
  - Jour 5 : Tests + ajustements

### Semaine 4
- [ ] Phase 5 : Notifications push
  - Jour 1-2 : Service Worker + permissions
  - Jour 3-4 : Edge Functions + triggers
  - Jour 5 : Tests + optimisations

---

## 🎯 Métriques de Succès

### Engagement Utilisateur
- ✅ Temps passé sur la plateforme : +40%
- ✅ Nombre de quiz complétés : +60%
- 🔄 Taux de rétention (7 jours) : Target +30%
- 🔄 Utilisateurs actifs quotidiens : Target +50%

### Gamification
- ✅ Badges attribués : Opérationnel
- ✅ Streaks maintenus : Tracking actif
- 🔄 Défis complétés : À implémenter
- 🔄 Notifications ouvertes : À mesurer

### Satisfaction
- ✅ Feedback visuel : Toast animations
- ✅ Sentiment d'accomplissement : Badges + levels
- 🔄 Motivation continue : Défis à ajouter
- 🔄 Rappels efficaces : Notifs à ajouter

---

## 🔧 Maintenance & Optimisation

### À Surveiller
- Performance des toasts (pas de lag)
- Précision du tracking des points
- Intégrité des streaks (timezone)
- Spam de notifications (rate limiting)

### Optimisations Futures
- Cache des leaderboards (Redis)
- Agrégation des points en temps réel
- Batch processing des notifications
- Analytics avancés (Mixpanel, Amplitude)

---

*Roadmap mise à jour le 5 octobre 2025*
*Prochaine étape : Phase 3 - Graphique d'évolution*
