# 🚀 PLAN DE DÉVELOPPEMENT E-RÉUSSITE - Q4 2025

**Période** : 18 Oct - 31 Déc 2025  
**Objectif global** : +30% conversion Premium (de 8% → 10.4%)  
**Généré le** : 18/10/2025 23h30

---

## 🎯 STRATÉGIE GLOBALE

### **Vision 3 mois** :
1. **Oct** : Validation Coach IA v3.0 → Communication si succès
2. **Nov** : Engagement features (notifications, streak, favoris)
3. **Déc** : Monétisation Premium (Stripe, features gates, trial)

### **Métriques de succès** :
- **Engagement** : +25% temps session (de 12min → 15min)
- **Rétention** : +40% retour 7 jours (de 25% → 35%)
- **Conversion** : +30% Premium (de 8% → 10.4%)
- **Revenu** : +500k-750k FCFA MRR

---

## 📊 PRIORISATION FEATURES (Méthode RICE)

| Feature | Reach | Impact | Confidence | Effort | Score RICE | Priorité |
|---------|-------|--------|------------|--------|------------|----------|
| **Notifications Push Web** | 1000 | 3 | 90% | 2 | 1350 | 🔥 P0 |
| **Streak Counter** | 1000 | 3 | 95% | 1 | 2850 | 🔥 P0 |
| **Historique Conversations** | 800 | 2 | 100% | 2 | 800 | ⚡ P1 |
| **Favoris Coach IA** | 600 | 2 | 90% | 1 | 1080 | ⚡ P1 |
| **Dashboard Graphiques** | 900 | 2 | 85% | 3 | 510 | ⚡ P1 |
| **Stripe Paiements** | 300 | 4 | 80% | 4 | 240 | 💎 P2 |
| **Quiz IA Générateur** | 700 | 2 | 70% | 5 | 196 | 🎯 P3 |
| **Spaced Repetition** | 500 | 3 | 60% | 6 | 150 | 🎯 P3 |

**Légende** :
- **Reach** : Nombre utilisateurs impactés/mois
- **Impact** : 1=Low, 2=Medium, 3=High, 4=Massive
- **Confidence** : % certitude succès
- **Effort** : Semaines développement (1-6)
- **Score RICE** : (Reach × Impact × Confidence) / Effort

---

## 🔥 PHASE 1 - ENGAGEMENT (19 Oct - 15 Nov)

### **🎯 Objectif** : +25% temps session, +40% rétention 7j

---

### **[Feature 1.1] Streak Counter** 🏆
**Priorité** : 🔥 P0 (Score RICE: 2850)  
**Durée** : 3 jours (19-21 Oct)  
**Impact estimé** : +15% retour quotidien

#### **Fonctionnalités** :
- Badge "X jours consécutifs" sur dashboard
- Flamme 🔥 animée (pulsation)
- Notification rappel 22h si jour non validé
- Historique streak (record personnel)
- Récompenses paliers (7j, 30j, 90j, 365j)

#### **Stack technique** :
- **Table Supabase** : `user_streaks`
  ```sql
  CREATE TABLE user_streaks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_activity_date date NOT NULL,
    streak_milestones jsonb DEFAULT '[]',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  ```
- **Trigger** : Mise à jour automatique chaque connexion
- **Edge Function** : Calcul streak quotidien (cron 00h05)

#### **UI/UX** :
```tsx
// components/StreakBadge.tsx
<div className="streak-container">
  <div className="flame-icon animate-pulse">🔥</div>
  <div className="streak-count">{currentStreak}</div>
  <div className="streak-label">jours consécutifs</div>
  <Progress value={(currentStreak / nextMilestone) * 100} />
</div>
```

#### **Validation** :
- [ ] Table créée avec RLS policies
- [ ] Trigger auto-update testé
- [ ] Edge Function cron configurée
- [ ] Badge affiché dashboard
- [ ] Notification 22h testée
- [ ] A/B test 7 jours (50% users)

---

### **[Feature 1.2] Notifications Push Web** 🔔
**Priorité** : 🔥 P0 (Score RICE: 1350)  
**Durée** : 5 jours (22-26 Oct)  
**Impact estimé** : +20% retour 7 jours

#### **Fonctionnalités** :
- **Onboarding** : Modal demande permission au 3e jour d'usage
- **Types notifications** :
  1. Rappel quotidien (10h, 18h si inactif)
  2. Streak en danger (22h si jour non validé)
  3. Nouveau contenu (quiz, exam ajouté)
  4. Coach IA suggestion ("Besoin d'aide ?")
  5. Milestone atteint (badge débloqué)

#### **Stack technique** :
- **Service Worker** : `/public/sw.js`
- **Table Supabase** : `push_subscriptions`
  ```sql
  CREATE TABLE push_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    user_agent text,
    created_at timestamptz DEFAULT now(),
    last_sent_at timestamptz,
    is_active boolean DEFAULT true
  );
  ```
- **Edge Function** : `send-push-notification` (avec web-push library)
- **Cron Jobs** :
  - 10h : Rappel quotidien
  - 18h : Rappel inactifs
  - 22h : Streak en danger

#### **UI/UX** :
```tsx
// components/NotificationPermissionModal.tsx
<Dialog>
  <DialogContent>
    <h2>🔔 Restez motivé !</h2>
    <p>Recevez des rappels pour vos révisions et ne perdez pas votre streak 🔥</p>
    <Button onClick={requestPermission}>Activer les notifications</Button>
    <Button variant="ghost">Plus tard</Button>
  </DialogContent>
</Dialog>
```

#### **Segmentation utilisateurs** :
- **Groupe A (50%)** : Notifications activées par défaut
- **Groupe B (50%)** : Modal demande permission (opt-in)
- **Mesure** : Taux acceptation, rétention 7j, désabonnements

#### **Validation** :
- [ ] Service Worker enregistré
- [ ] Table push_subscriptions créée
- [ ] Edge Function send-push testée
- [ ] 3 cron jobs configurés
- [ ] Modal permission testée
- [ ] A/B test 14 jours

---

### **[Feature 1.3] Historique Conversations Coach IA** 💬
**Priorité** : ⚡ P1 (Score RICE: 800)  
**Durée** : 4 jours (27-30 Oct)  
**Impact estimé** : +10% utilisation Coach IA

#### **Fonctionnalités** :
- Liste toutes conversations (sidebar)
- Recherche par mot-clé
- Filtres : date, durée, thème
- Reprise conversation exacte (contexte préservé)
- Suppression conversation (soft delete)

#### **Stack technique** :
- **Tables existantes** : `ai_conversations`, `ai_messages` (déjà en place ✅)
- **Composant** : `ConversationHistory.tsx`
- **API** : 
  ```ts
  // app/api/coach-ia/history/route.ts
  GET /api/coach-ia/history?userId=xxx&search=xxx&limit=20
  DELETE /api/coach-ia/history/:conversationId
  ```

#### **UI/UX** :
```tsx
// components/ConversationHistory.tsx
<div className="history-sidebar">
  <Input placeholder="🔍 Rechercher..." />
  <Select placeholder="Filtrer par thème">
    <option>Méthodologie</option>
    <option>Motivation</option>
    <option>Organisation</option>
  </Select>
  <div className="conversations-list">
    {conversations.map(conv => (
      <ConversationCard
        title={conv.title}
        preview={conv.lastMessage}
        date={conv.updated_at}
        messageCount={conv.message_count}
        onClick={() => loadConversation(conv.id)}
      />
    ))}
  </div>
</div>
```

#### **Optimisations** :
- Pagination infinie (20 conversations/page)
- Cache local (IndexedDB)
- Lazy loading messages

#### **Validation** :
- [ ] API history créée
- [ ] Sidebar historique intégrée
- [ ] Recherche fonctionne
- [ ] Filtres opérationnels
- [ ] Reprise conversation testée
- [ ] Performances <500ms chargement

---

### **[Feature 1.4] Favoris Coach IA** ⭐
**Priorité** : ⚡ P1 (Score RICE: 1080)  
**Durée** : 2 jours (31 Oct - 1 Nov)  
**Impact estimé** : +8% application conseils

#### **Fonctionnalités** :
- Bouton "⭐ Sauvegarder" sur chaque message Coach IA
- Section "Mes favoris" dans dashboard
- Tags personnalisés (organisation, révision, exam...)
- Export PDF favoris (bonus)

#### **Stack technique** :
- **Table Supabase** : `coach_favorites`
  ```sql
  CREATE TABLE coach_favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    message_id uuid REFERENCES ai_messages NOT NULL,
    tags text[] DEFAULT '{}',
    note text,
    created_at timestamptz DEFAULT now()
  );
  ```

#### **UI/UX** :
```tsx
// components/FavoriteButton.tsx
<Button
  variant="ghost"
  onClick={() => toggleFavorite(messageId)}
  className={isFavorite ? 'text-yellow-500' : 'text-gray-400'}
>
  {isFavorite ? '⭐ Sauvegardé' : '☆ Sauvegarder'}
</Button>

// pages/dashboard/favorites.tsx
<div className="favorites-grid">
  {favorites.map(fav => (
    <FavoriteCard
      content={fav.message.content}
      tags={fav.tags}
      date={fav.created_at}
      onRemove={() => removeFavorite(fav.id)}
    />
  ))}
</div>
```

#### **Validation** :
- [ ] Table favorites créée
- [ ] Bouton favoris sur messages
- [ ] Page dashboard favoris
- [ ] Tags ajout/suppression
- [ ] Export PDF (bonus)

---

### **[Feature 1.5] Dashboard Graphiques Progression** 📊
**Priorité** : ⚡ P1 (Score RICE: 510)  
**Durée** : 6 jours (2-7 Nov)  
**Impact estimé** : +12% engagement

#### **Fonctionnalités** :
- **Graphique 1** : Évolution scores quiz (ligne temporelle)
- **Graphique 2** : Répartition chapitres validés (donut)
- **Graphique 3** : Temps étude quotidien (bar chart)
- **Graphique 4** : Streak historique (area chart)
- **KPIs résumé** : 4 cards (quiz complétés, temps total, streak, avg score)

#### **Stack technique** :
- **Library** : Recharts (React + TypeScript)
- **API** : 
  ```ts
  GET /api/analytics/user-stats?userId=xxx&period=7d|30d|90d
  ```
- **Calculs** :
  - Scores quiz : moyenne mobile 7 jours
  - Temps étude : SUM minutes par jour (quiz + exams + Coach IA)
  - Chapitres : COUNT DISTINCT chapitres avec quiz validé

#### **UI/UX** :
```tsx
// pages/dashboard/analytics.tsx
<div className="analytics-dashboard">
  <div className="kpi-cards">
    <StatCard title="Quiz complétés" value={stats.quizCount} icon="📝" />
    <StatCard title="Temps d'étude" value={`${stats.totalMinutes}min`} icon="⏱️" />
    <StatCard title="Streak actuel" value={`${stats.streak}j`} icon="🔥" />
    <StatCard title="Score moyen" value={`${stats.avgScore}%`} icon="📈" />
  </div>
  
  <LineChart data={stats.quizScoresOverTime} />
  <DonutChart data={stats.chapterDistribution} />
  <BarChart data={stats.dailyStudyTime} />
  <AreaChart data={stats.streakHistory} />
</div>
```

#### **Validation** :
- [ ] API analytics créée
- [ ] 4 KPI cards affichées
- [ ] 4 graphiques fonctionnels
- [ ] Filtres période (7j/30j/90j)
- [ ] Responsive mobile
- [ ] Performances <1s chargement

---

## 💎 PHASE 2 - MONÉTISATION (8 Nov - 15 Déc)

### **🎯 Objectif** : +30% conversion Premium (8% → 10.4%)

---

### **[Feature 2.1] Stripe Integration Paiements** 💳
**Priorité** : 💎 P2 (Score RICE: 240)  
**Durée** : 8 jours (8-15 Nov)  
**Impact estimé** : Unlock conversion Premium

#### **Fonctionnalités** :
- **Page pricing** : 3 plans (Gratuit, Premium, Pro)
- **Checkout Stripe** : Paiement sécurisé
- **Webhooks** : Sync statut abonnement
- **Gestion abonnement** : Upgrade/downgrade/annulation
- **Factures** : Génération automatique PDF

#### **Plans tarifaires** :

| Plan | Prix | Features |
|------|------|----------|
| **Gratuit** | 0 FCFA | 5 quiz/mois, Coach IA limité (3 conv/mois), Dashboard basique |
| **Premium** | 5000 FCFA/mois | Quiz illimités, Coach IA illimité, Graphiques avancés, PDF export, Notifications prioritaires |
| **Pro** | 10000 FCFA/mois | Premium + Spaced repetition, Quiz IA générés, Coaching personnalisé, Support 24h |

#### **Stack technique** :
- **Stripe API** : Checkout Sessions, Subscriptions, Webhooks
- **Tables Supabase** :
  ```sql
  CREATE TABLE subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    stripe_customer_id text NOT NULL,
    stripe_subscription_id text,
    plan text NOT NULL, -- 'free' | 'premium' | 'pro'
    status text NOT NULL, -- 'active' | 'canceled' | 'past_due'
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  
  CREATE TABLE invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id uuid REFERENCES subscriptions NOT NULL,
    stripe_invoice_id text NOT NULL,
    amount_paid integer NOT NULL,
    currency text DEFAULT 'xof',
    invoice_pdf text,
    paid_at timestamptz,
    created_at timestamptz DEFAULT now()
  );
  ```

#### **Flow utilisateur** :
1. User clique "Passer Premium"
2. Redirection `/pricing` → Sélection plan
3. Click "S'abonner" → Stripe Checkout
4. Paiement → Webhook `checkout.session.completed`
5. Update `subscriptions` table → User redirected dashboard
6. Features Premium débloquées instantanément

#### **Edge Functions** :
```ts
// supabase/functions/stripe-webhook/index.ts
export default async (req: Request) => {
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature'),
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      await createSubscription(event.data.object);
      break;
    case 'invoice.paid':
      await createInvoice(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await cancelSubscription(event.data.object);
      break;
  }
  
  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
```

#### **Validation** :
- [ ] Compte Stripe créé (test + live)
- [ ] Webhooks configurés
- [ ] Tables subscriptions + invoices créées
- [ ] Page pricing créée
- [ ] Checkout flow testé (mode test)
- [ ] Webhooks testés (Stripe CLI)
- [ ] Features gates implémentées
- [ ] Test paiement réel (1000 FCFA)

---

### **[Feature 2.2] Features Gates Premium** 🚪
**Priorité** : 💎 P2 (Score RICE: 240)  
**Durée** : 3 jours (16-18 Nov)  
**Impact estimé** : +15% conversion (via frustration contrôlée)

#### **Restrictions Gratuit** :
- ❌ Max 5 quiz/mois → Modal "Passez Premium pour continuer"
- ❌ Coach IA limité 3 conversations/mois
- ❌ Pas accès graphiques avancés (blur + overlay)
- ❌ Pas export PDF
- ❌ Notifications limitées (1/jour max)

#### **UI/UX Paywall** :
```tsx
// components/PaywallModal.tsx
<Dialog open={showPaywall}>
  <DialogContent className="max-w-md">
    <div className="text-center">
      <Lock className="w-16 h-16 mx-auto text-yellow-500" />
      <h2 className="text-2xl font-bold mt-4">
        Débloquez tout votre potentiel 🚀
      </h2>
      <p className="text-gray-600 mt-2">
        Vous avez atteint la limite gratuite ({usedQuiz}/5 quiz ce mois)
      </p>
      
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mt-4">
        <h3 className="font-semibold">Premium vous offre :</h3>
        <ul className="text-left mt-2 space-y-1">
          <li>✅ Quiz illimités</li>
          <li>✅ Coach IA sans limite</li>
          <li>✅ Graphiques avancés</li>
          <li>✅ Export PDF</li>
        </ul>
      </div>
      
      <Button onClick={() => router.push('/pricing')} className="w-full mt-4">
        Passer Premium - 5000 FCFA/mois
      </Button>
      <Button variant="ghost" onClick={close}>Plus tard</Button>
    </div>
  </DialogContent>
</Dialog>
```

#### **Hooks utilitaires** :
```ts
// hooks/useFeatureAccess.ts
export const useFeatureAccess = () => {
  const { user, subscription } = useAuth();
  
  const canAccessFeature = (feature: Feature): boolean => {
    if (subscription?.plan === 'premium' || subscription?.plan === 'pro') {
      return true;
    }
    
    // Check usage limits for free users
    const limits = {
      quiz: 5,
      coachConversations: 3,
      notifications: 1,
    };
    
    return usage[feature] < limits[feature];
  };
  
  const showPaywall = (feature: Feature) => {
    if (!canAccessFeature(feature)) {
      openPaywallModal(feature);
      return true;
    }
    return false;
  };
  
  return { canAccessFeature, showPaywall };
};
```

#### **Validation** :
- [ ] Hook useFeatureAccess créé
- [ ] Limites quiz implémentées
- [ ] Limites Coach IA implémentées
- [ ] Graphiques blurred pour free
- [ ] Modal paywall testée
- [ ] Tracking conversions paywall

---

### **[Feature 2.3] Trial Period 14 jours** ⏰
**Priorité** : 💎 P2  
**Durée** : 2 jours (19-20 Nov)  
**Impact estimé** : +25% conversions (réduction friction)

#### **Fonctionnalités** :
- Nouveau user → Trial Premium automatique 14 jours
- Badge "TRIAL" sur dashboard
- Emails rappel : J7 (milieu), J12 (2j avant fin), J14 (dernier jour)
- Downgrade automatique à "free" si pas abonnement

#### **Edge Function Cron** :
```ts
// supabase/functions/trial-expiration-check/index.ts
Deno.cron('Check trial expirations', '0 9 * * *', async () => {
  const expiringTrials = await supabase
    .from('subscriptions')
    .select('*')
    .eq('plan', 'trial')
    .lte('current_period_end', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
  
  for (const trial of expiringTrials) {
    await sendEmail({
      to: trial.user_email,
      subject: '⏰ Votre trial Premium expire dans 2 jours',
      template: 'trial-expiring',
      data: { expirationDate: trial.current_period_end }
    });
  }
});
```

#### **Validation** :
- [ ] Plan "trial" ajouté
- [ ] Auto-activation trial nouveaux users
- [ ] Cron expiration configuré
- [ ] 3 emails rappel créés
- [ ] Downgrade automatique testé

---

## 🎯 PHASE 3 - RÉTENTION AVANCÉE (21 Nov - 15 Déc)

### **[Feature 3.1] Quiz IA Générateur** 🤖
**Priorité** : 🎯 P3 (Score RICE: 196)  
**Durée** : 10 jours (21 Nov - 30 Nov)  
**Impact estimé** : +20% engagement quiz

#### **Fonctionnalités** :
- Upload PDF cours → IA génère quiz auto
- Sélection difficulté (facile, moyen, difficile)
- 10-20 questions par chapitre
- Format QCM + Vrai/Faux + Réponse courte

#### **Stack technique** :
- **IA** : Claude 3.5 Sonnet (via API Anthropic)
- **Prompt** :
  ```
  Tu es un expert pédagogique. À partir du cours suivant, génère 15 questions 
  de type QCM (4 choix, 1 bonne réponse). 
  
  Critères :
  - Couvrir tous concepts clés
  - Difficulté progressive
  - Distracteurs plausibles
  - Explications pour chaque réponse
  
  Format JSON :
  {
    "questions": [
      {
        "question": "...",
        "choices": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "..."
      }
    ]
  }
  ```

#### **Validation** :
- [ ] Upload PDF fonctionne
- [ ] IA génère quiz cohérents
- [ ] Qualité questions validée (test 5 cours)
- [ ] Feature gate Premium OK

---

### **[Feature 3.2] Spaced Repetition System** 🧠
**Priorité** : 🎯 P3 (Score RICE: 150)  
**Durée** : 12 jours (1-12 Déc)  
**Impact estimé** : +30% rétention long-terme

#### **Fonctionnalités** :
- Algorithme SM-2 (SuperMemo)
- Flashcards automatiques (basées quiz ratés)
- Notifications révision (intervales : 1j, 3j, 7j, 14j, 30j)
- Dashboard "À réviser aujourd'hui"

#### **Algorithme SM-2** :
```ts
const calculateNextReview = (
  difficulty: number, // 0-5 (0=très difficile, 5=très facile)
  repetition: number,
  interval: number,
  eFactor: number
): { nextInterval: number; newEFactor: number } => {
  let newEFactor = eFactor + (0.1 - (5 - difficulty) * (0.08 + (5 - difficulty) * 0.02));
  newEFactor = Math.max(1.3, newEFactor);
  
  let nextInterval: number;
  if (repetition === 0) {
    nextInterval = 1;
  } else if (repetition === 1) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(interval * newEFactor);
  }
  
  return { nextInterval, newEFactor };
};
```

#### **Validation** :
- [ ] Algorithme SM-2 implémenté
- [ ] Table flashcards créée
- [ ] Notifications révision
- [ ] Dashboard révisions
- [ ] Test 30 jours (validation long-terme)

---

## 📅 TIMELINE COMPLÈTE

### **Octobre 2025**
- ✅ 17 Oct : Coach IA v3.0 développé
- ✅ 18 Oct : SQL analytics debuggé
- **19-21 Oct** : Streak Counter 🔥
- **21-28 Oct** : Monitoring Coach IA v3.0 📊
- **22-26 Oct** : Notifications Push 🔔
- **27-30 Oct** : Historique conversations 💬
- **31 Oct** : Favoris Coach IA ⭐

### **Novembre 2025**
- **1-7 Nov** : Dashboard graphiques 📊
- **8-15 Nov** : Stripe integration 💳
- **16-18 Nov** : Features gates 🚪
- **19-20 Nov** : Trial 14 jours ⏰
- **21-30 Nov** : Quiz IA générateur 🤖

### **Décembre 2025**
- **1-12 Déc** : Spaced Repetition 🧠
- **13-15 Déc** : Tests finaux + polish
- **16-20 Déc** : Déploiement progressif (10% → 50% → 100%)
- **21-31 Déc** : Monitoring + corrections bugs

---

## 📊 MÉTRIQUES DE SUIVI

### **Engagement** :
- Temps session moyen : **12min → 15min** (+25%)
- Pages vues/session : **3.5 → 5.0** (+43%)
- Retour 1 jour : **45% → 60%** (+33%)
- Retour 7 jours : **25% → 35%** (+40%)

### **Conversion** :
- Taux conversion Premium : **8% → 10.4%** (+30%)
- Trial → Paid : **25% → 35%** (+40%)
- Churn rate : **12% → 8%** (-33%)

### **Revenu** :
- MRR : **+500k-750k FCFA**
- ARPU : **4200 → 5500 FCFA** (+31%)
- LTV : **25k → 35k FCFA** (+40%)

---

## 🚨 RISQUES & MITIGATION

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Stripe paiements bugs** | Moyen | Critique | Tests exhaustifs mode test, sandbox |
| **Notifications spam** | Élevé | Moyen | Fréquence limitée, opt-out facile |
| **IA quiz qualité faible** | Moyen | Moyen | Review humain 1er mois, feedback loop |
| **Performance dashboard** | Faible | Moyen | Lazy loading, pagination, cache |
| **Churn post-trial** | Élevé | Élevé | Emails nurturing, offre spéciale -20% |

---

## ✅ PROCHAINES ACTIONS IMMÉDIATES

### **Ce soir (18 Oct 23h30)** :
- [ ] Valider ce plan de développement
- [ ] Choisir features prioritaires (si ajustements nécessaires)
- [ ] Repos bien mérité 😴

### **Demain (19 Oct 9h)** :
- [ ] Créer branche `feature/streak-counter`
- [ ] Setup table `user_streaks` Supabase
- [ ] Développer composant `StreakBadge`
- [ ] Edge Function calcul streak

### **Lundi 21 Oct 9h** :
- [ ] **CRITIQUE** : Baseline Coach IA v3.0 (SQL queries)
- [ ] Continuer streak counter (tests finaux)
- [ ] Déployer streak en production (si tests OK)

---

## 💡 NOTES STRATÉGIQUES

### **Pourquoi cette priorisation ?**
1. **Engagement d'abord** (Phase 1) : Sans engagement, pas de conversion
2. **Monétisation ensuite** (Phase 2) : Users engagés = prêts payer
3. **Rétention avancée** (Phase 3) : Features "nice-to-have", pas critiques

### **Quick Wins identifiés** :
- **Streak Counter** : 3 jours dev, impact immédiat (+15% retour)
- **Favoris** : 2 jours dev, améliore perception valeur Coach IA
- **Trial 14j** : 2 jours dev, réduit friction conversion (-40% objections)

### **Long-term bets** :
- **Spaced Repetition** : Complexe (12j dev) mais différenciateur marché
- **Quiz IA** : Innovation, peu de concurrents en Afrique

---

**Plan validé et prêt pour exécution ! 🚀**
