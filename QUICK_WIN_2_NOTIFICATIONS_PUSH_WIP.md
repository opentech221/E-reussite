# 🔔 Quick Win #2: Notifications Push - Work in Progress

**Date**: 21 Octobre 2025 15h00  
**Branch**: `feature/notifications-push-activation`  
**Status**: ⏳ **EN DÉVELOPPEMENT** (50% complete)

---

## 📊 Objectif

**Améliorer la rétention utilisateur** via notifications push intelligentes:
- Rappels quotidiens pour maintenir streak 🔥
- Conseils IA personnalisés 🤖
- Célébrations achievements 🎉

**Impact estimé**: +20% rétention, +15% streak moyen

---

## ✅ Ce Qui Est Déjà Fait (Infrastructure Existante)

### 1. Service Worker Configuré ✅
**Fichier**: `public/sw.js`

**Handlers implémentés**:
- ✅ `push` event: Réception et affichage notifications
- ✅ `notificationclick`: Redirection vers Dashboard
- ✅ `notificationclose`: Tracking fermeture (optionnel)

**Caching strategy**: Network-first (HTML), Stale-while-revalidate (JS/CSS), Cache-first (images)

### 2. Table `push_subscriptions` ✅
**Colonnes**:
- `user_id` (FK profiles)
- `endpoint` (push service URL)
- `p256dh_key`, `auth_key` (encryption keys)
- `subscription_data` (JSONB full subscription)
- `created_at`, `last_used_at`

**RLS**: User can only access own subscriptions

### 3. Composant `NotificationManager` ✅
**Fichier**: `src/components/NotificationManager.jsx`

**Features**:
- Vérification support navigateur
- Demande permission
- Subscription Push Manager
- Sauvegarde dans Supabase
- Gestion désabonnement

**Note**: Désactivé en développement (nécessite HTTPS en prod)

---

## 🚀 Ce Qui Vient d'Être Développé (Aujourd'hui)

### 1. NotificationPermissionModal ✨ NEW

**Fichier**: `src/components/NotificationPermissionModal.jsx` (320+ lignes)

**Stratégie d'activation**:
```
1ère connexion → Rien (laisser explorer)
2ème connexion → Afficher modal si permission pas encore accordée
3ème refus → Ne plus afficher (max 3 dismissals)
Settings → Toggle pour réactiver manuellement
```

**Features**:
- ✅ Modal animé (Framer Motion: fade-in, scale)
- ✅ Design soigné (Card shadcn/ui, gradient primary)
- ✅ 3 bénéfices clairs avec icônes:
  - 🔥 Maintenir streak (rappel 21h)
  - 🤖 Conseils IA personnalisés
  - 🎉 Célébrations achievements
- ✅ Close button + backdrop dismiss
- ✅ Privacy note ("désactiver à tout moment")
- ✅ Hint "ne s'affichera plus après 3 refus"

**Props**:
```jsx
<NotificationPermissionModal 
  userId={user.id}
  onClose={() => {}}
/>
```

**Logic**:
1. Check `Notification.permission` (granted → skip)
2. Fetch `login_count` and `notification_dismiss_count` from profiles
3. Show if `login_count >= 2` AND `dismiss_count < 3`
4. On enable: Request permission → Subscribe push → Save to DB
5. On dismiss: Increment `notification_dismiss_count`

**Animations**:
- Backdrop: fade-in (opacity 0 → 1)
- Card: scale-up + fade-in (scale 0.9 → 1, y +20 → 0)
- Exit: reverse animation

---

### 2. SQL Migration ✨ NEW

**Fichier**: `supabase/migrations/add_notification_tracking_columns.sql`

**Changes**:
```sql
ALTER TABLE profiles 
ADD COLUMN login_count INTEGER DEFAULT 0;

ALTER TABLE profiles 
ADD COLUMN notification_dismiss_count INTEGER DEFAULT 0;
```

**Indexes**:
- `idx_profiles_login_count`
- `idx_profiles_notification_dismiss`

**Trigger automatique**:
```sql
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION increment_login_count();
```

**Comportement**:
- Chaque login → `login_count++` automatiquement
- Pas besoin de logique frontend pour compter
- `notification_dismiss_count` géré par modal (manuel)

---

### 3. Intégration Dashboard ✨ NEW

**Fichier**: `src/pages/Dashboard.jsx`

**Changes**:
```jsx
// Import
import NotificationPermissionModal from '@/components/NotificationPermissionModal';

// JSX (avant <Navbar />)
<NotificationPermissionModal userId={user?.id} />
```

**Timing**: Modal s'affiche après chargement Dashboard (useEffect dans modal vérifie conditions)

---

## 📋 Ce Qui Reste à Faire

### ⏳ 1. Exécuter Migration SQL (5 min)

**Actions**:
1. Ouvrir Supabase Dashboard
2. Aller dans SQL Editor
3. Copier contenu de `add_notification_tracking_columns.sql`
4. Exécuter
5. Vérifier: `SELECT login_count, notification_dismiss_count FROM profiles LIMIT 5;`

**Validation**:
- ✅ Colonnes créées
- ✅ Indexes créés
- ✅ Trigger actif (tester en se reconnectant)

---

### ⏳ 2. Tester Modal Appearance (10 min)

**Scénarios**:

**Test 1: 1ère connexion (modal ne doit PAS apparaître)**:
1. Créer nouveau compte test
2. Login → Dashboard
3. ✅ Vérifier: Modal absent

**Test 2: 2ème connexion (modal DOIT apparaître)**:
1. Logout du compte test
2. Login again → Dashboard
3. ✅ Vérifier: Modal présent avec 3 bénéfices
4. Cliquer "Plus tard" (dismiss)

**Test 3: 3ème refus (dernière fois)**:
1. Logout/Login 2x supplémentaires
2. Dismisser à chaque fois
3. ✅ Après 3ème dismiss: Modal ne doit plus apparaître

**Test 4: Permission accordée**:
1. Nouveau compte ou réinitialiser
2. Login 2x → Modal apparaît
3. Cliquer "Activer" → Autoriser notifications
4. ✅ Vérifier: 1 ligne dans `push_subscriptions`
5. ✅ Vérifier: Modal ne réapparaît plus jamais

**Test 5: Browser permission déjà granted**:
1. Navigateur avec notifs déjà activées
2. Login → Dashboard
3. ✅ Vérifier: Modal skip (permission.granted = true)

---

### ⏳ 3. Edge Function - Daily Reminder (2h)

**Objectif**: Cron job qui envoie rappel quotidien à 21h

**Fichier à créer**: `supabase/functions/send-daily-streak-reminder/index.ts`

**Logic**:
```typescript
// 1. Requête: utilisateurs avec streak actif ET pas d'activité aujourd'hui
SELECT u.id, u.email, up.current_streak, ps.subscription_data
FROM profiles u
JOIN user_points up ON u.id = up.user_id
JOIN push_subscriptions ps ON u.id = ps.user_id
WHERE up.current_streak > 0
  AND up.last_activity_date < CURRENT_DATE
  AND ps.is_active = true;

// 2. Pour chaque user: envoyer push
await sendWebPush(subscription, {
  title: '⚠️ Ton streak expire bientôt !',
  body: `Ta série de ${current_streak} jours se termine dans 3h. Continue maintenant !`,
  icon: '/icon-192x192.png',
  badge: '/icon-192x192.png',
  data: {
    url: '/dashboard',
    type: 'streak_reminder'
  }
});
```

**Cron**: Configurer dans Supabase Dashboard → Edge Functions → Schedule
- Schedule: `0 21 * * *` (chaque jour à 21h)

---

### ⏳ 4. Settings Toggle (1h)

**Fichier**: `src/pages/Settings.jsx` (ou créer si inexistant)

**UI**:
```jsx
<Card>
  <CardHeader>
    <CardTitle>🔔 Notifications Push</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">Rappels quotidiens</p>
        <p className="text-sm text-slate-600">
          Reçois un rappel à 21h si tu n'as pas étudié aujourd'hui
        </p>
      </div>
      <Switch 
        checked={isSubscribed} 
        onCheckedChange={handleToggle}
      />
    </div>
    
    {isSubscribed && (
      <p className="text-xs text-green-600 mt-2">
        ✅ Notifications activées
      </p>
    )}
  </CardContent>
</Card>
```

**Logic**:
- `isSubscribed`: Check si `push_subscriptions` contient subscription active
- `handleToggle(true)`: Subscribe (même logique que modal)
- `handleToggle(false)`: Unsubscribe (delete from `push_subscriptions`)

---

### ⏳ 5. Tests Complets (30 min)

**Checklist**:
- [ ] Modal apparaît après 2ème login
- [ ] Modal dismiss incrémente counter
- [ ] Après 3 refus, modal ne réapparaît plus
- [ ] Permission grant → subscription sauvegardée
- [ ] Daily reminder envoyé à 21h (test manuel ou wait)
- [ ] Deep link fonctionne (clic notification → Dashboard)
- [ ] Settings toggle active/désactive correctement
- [ ] Cross-browser: Chrome ✅, Firefox ✅, Safari ✅ (iOS APNS)
- [ ] 0 erreurs console
- [ ] Performance: <50ms render modal

---

## 📊 Progression Actuelle

**Commit**: `01495267` - feat(notifications): add permission modal with smart activation strategy

**Fichiers**:
- ✅ `src/components/NotificationPermissionModal.jsx` (320+ lignes)
- ✅ `src/pages/Dashboard.jsx` (intégration)
- ✅ `supabase/migrations/add_notification_tracking_columns.sql`

**Todo List**: 3/6 tâches complétées (50%)

✅ **DONE**:
1. Audit système (60% exists)
2. StreakBadge deployed (production)
3. Notifications Modal (branch feature)

⏳ **IN PROGRESS**:
4. SQL migration (needs execution)

❌ **TODO**:
5. Edge Function daily reminder
6. Settings toggle
7. Tests & validation

---

## 🎯 Prochaines Actions

### Immediate (Maintenant)

**1. Exécuter migration SQL** (5 min):
```bash
# Copier contenu de add_notification_tracking_columns.sql
# Exécuter dans Supabase SQL Editor
# Vérifier colonnes créées
```

**2. Tester modal** (10 min):
- Créer compte test
- Login 2x → Modal doit apparaître
- Tester dismiss + permission grant

### Court Terme (Ce soir)

**3. Edge Function** (2h):
- Créer `send-daily-streak-reminder`
- Implémenter logique envoi
- Configurer cron 21h

**4. Settings toggle** (1h):
- Page Settings avec Switch
- Subscribe/Unsubscribe logic
- UI status (enabled/disabled)

### Validation (Demain)

**5. Tests complets** (30 min):
- Tous scénarios checklist
- Cross-browser
- Performance check

**6. Merge & Deploy** (15 min):
- Merge feature → main
- Push production
- Monitor errors 24h

---

## 💡 Décisions Techniques

### Pourquoi 2ème login (pas 1er) ?
**Rationale**: Nouvel utilisateur découvre plateforme. Demander permission immédiatement = overwhelming. Attendre 2ème login = user a déjà expérimenté valeur → plus enclin à accepter.

**Source**: Best practices onboarding (Duolingo, Habitica)

### Pourquoi max 3 refus ?
**Rationale**: Éviter "notification fatigue". Si user refuse 3x = signal clair "je ne veux pas". Continuer à demander = annoyance → churn.

**Alternative**: Afficher hint "Activez dans Settings" après 3ème refus (non intrusif)

### Pourquoi 21h pour rappel ?
**Rationale**: 
- Fin journée = dernière chance maintenir streak
- 3h avant minuit = temps suffisant pour étudier
- Pas trop tard = éviter déranger sommeil

**Data**: Analyse usage montre pic activité 18h-22h (à valider avec analytics)

### Pourquoi VAPID keys ?
**Rationale**: Web Push API nécessite authentification serveur → VAPID (Voluntary Application Server Identification). 

**Sécurité**: Empêche spam, garantit origine notifications

**Config**: Keys générées via `web-push generate-vapid-keys` (Node.js package)

---

## 🔧 Stack Technique

**Frontend**:
- React 18 (NotificationPermissionModal component)
- Framer Motion (animations modal)
- Lucide Icons (Bell, Flame, Trophy, etc.)
- shadcn/ui (Card, Button)
- sonner (toast notifications)

**Backend**:
- Supabase PostgreSQL (profiles, push_subscriptions)
- Supabase Edge Functions (daily reminder cron)
- Web Push API (browser native)
- Service Worker (sw.js)

**Push Protocol**:
- VAPID (authentication)
- Web Push Protocol (RFC 8030)
- Encryption (p256dh + auth keys)

---

## 📈 Impact Estimé

**Métriques à surveiller** (après déploiement):

**Rétention**:
- Baseline: 22% taux retour quotidien
- Objectif: +20% → 26.4% retour quotidien
- Method: Comparer users avec notifs vs sans notifs (A/B cohort)

**Streak**:
- Baseline: 2.3 jours moyenne streak
- Objectif: +15% → 2.6 jours moyenne
- Method: Analyser `current_streak` distribution avant/après

**Engagement**:
- Baseline: 3.2 sessions/semaine
- Objectif: +10% → 3.5 sessions/semaine
- Method: Comparer users notif-enabled vs disabled

**Permission Rate**:
- Objectif: 30-40% users accept permission (industry standard)
- Dismiss rate: <70% (modal doit convaincre)

---

## 🐛 Bugs Potentiels à Surveiller

### Permission Denied
**Symptôme**: User clique "Activer" → Browser deny permission  
**Cause**: Paramètres browser bloquent notifications  
**Fix**: Toast explicatif + lien vers tutorial débloquer

### VAPID Keys Missing
**Symptôme**: Console error "VAPID key not configured"  
**Cause**: `.env` manque `VITE_VAPID_PUBLIC_KEY`  
**Fix**: Ajouter keys dans Vercel/env vars

### Service Worker Not Ready
**Symptôme**: `navigator.serviceWorker.ready` timeout  
**Cause**: SW pas enregistré ou erreur chargement  
**Fix**: Vérifier `sw.js` accessible, pas d'erreurs console

### Duplicate Subscriptions
**Symptôme**: Multiple lignes `push_subscriptions` même user  
**Cause**: Subscribe multiple fois sans vérifier existence  
**Fix**: Ajouter `UNIQUE(user_id, endpoint)` constraint

### iOS Safari Limitations
**Symptôme**: Notifications marchent pas sur iPhone  
**Cause**: iOS nécessite APNS (Apple Push Notification Service)  
**Fix**: Implémenter APNS si mobile critique (ou skip iOS pour V1)

---

## 🎓 Leçons Apprises (Future Reference)

1. **Modal timing = critique**: Trop tôt = refus, trop tard = oubli
2. **Benefits clairs > features techniques**: Users comprennent "maintenir streak" mieux que "push notifications"
3. **Max dismissals = respect user**: Insister = contra-productif
4. **HTTPS requis production**: Développement local = blocages push service
5. **Cron timing = UX**: 21h = sweet spot (fin journée, pas trop tard)

---

**Dernière mise à jour**: 21 Octobre 2025 15h30  
**Status**: ⏳ 50% complete - Migration SQL + Tests needed  
**Next**: Exécuter migration → Tester modal → Edge Function
