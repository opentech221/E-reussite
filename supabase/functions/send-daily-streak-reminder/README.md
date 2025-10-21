# 🔔 Edge Function: Daily Streak Reminder

**Objectif** : Envoyer une notification push quotidienne à 21h aux utilisateurs qui risquent de perdre leur streak.

---

## 📋 Fonctionnalités

### Cible
- Utilisateurs avec **streak actif** (`current_streak > 0`)
- **Aucune activité aujourd'hui** (`last_activity_date < today`)
- **Notifications push activées** (`push_subscriptions.is_active = true`)

### Message
```
⚠️ Ton streak de X jours expire bientôt !
Salut [Prénom], il te reste 3h pour maintenir ta série. Continue maintenant ! 💪
```

### Timing
- **Heure** : 21h (heure locale de Paris)
- **Fréquence** : Quotidienne
- **Deep link** : `/dashboard` (ouvre directement le tableau de bord)

---

## 🚀 Déploiement

### Prérequis

1. **Supabase CLI installé**
   ```bash
   npm install -g supabase
   ```

2. **Authentification Supabase**
   ```bash
   supabase login
   supabase link --project-ref qbvdrkhdjjpuowthwinf
   ```

3. **VAPID Keys générées** (si pas encore fait)
   ```bash
   npm install -g web-push
   npx web-push generate-vapid-keys
   ```
   
   Output:
   ```
   Public Key: BN...ABC123
   Private Key: XY...DEF456
   ```

---

### Étape 1 : Configurer les Secrets

```bash
# Ajouter les VAPID keys comme secrets Supabase
supabase secrets set VAPID_PUBLIC_KEY="BN...ABC123"
supabase secrets set VAPID_PRIVATE_KEY="XY...DEF456"

# Vérifier que les secrets sont bien configurés
supabase secrets list
```

**Output attendu** :
```
NAME                VALUE
VAPID_PUBLIC_KEY    BN...ABC123
VAPID_PRIVATE_KEY   XY...DEF456
```

---

### Étape 2 : Déployer l'Edge Function

```bash
# Déployer la fonction depuis le dossier racine du projet
supabase functions deploy send-daily-streak-reminder

# Vérifier le déploiement
supabase functions list
```

**Output attendu** :
```
NAME                          STATUS    VERSION
send-daily-streak-reminder    ACTIVE    1
```

---

### Étape 3 : Configurer le Cron Job

1. **Ouvrir Supabase Dashboard** → **SQL Editor**

2. **Copier-coller le contenu de** `supabase/migrations/setup_daily_streak_reminder_cron.sql`

3. **Exécuter le script**

4. **Vérifier que le cron job est créé** :
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'daily-streak-reminder';
   ```

**Output attendu** :
```
jobid | jobname                 | schedule    | active | database
------|-------------------------|-------------|--------|----------
1     | daily-streak-reminder   | 0 21 * * *  | t      | postgres
```

---

## 🧪 Tests

### Test Manuel (Exécution Immédiate)

Dans **Supabase SQL Editor**, exécute :

```sql
SELECT net.http_post(
  url := 'https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/send-daily-streak-reminder',
  headers := jsonb_build_object(
    'Authorization', 
    'Bearer ' || current_setting('app.settings.service_role_key'),
    'Content-Type',
    'application/json'
  ),
  body := '{}'::jsonb
);
```

### Vérifier les Logs

1. **Supabase Dashboard** → **Edge Functions** → `send-daily-streak-reminder` → **Logs**

2. Chercher les lignes contenant `[Cron]` :
   ```
   [Cron] Starting daily streak reminder job...
   [Cron] Found 5 users at risk
   [Cron] Found 3 active subscriptions
   [Cron] Job complete: 3 sent, 0 failed
   ```

### Vérifier Quels Utilisateurs Seraient Notifiés

```sql
SELECT 
  up.user_id,
  p.full_name,
  up.current_streak,
  up.last_activity_date,
  COUNT(ps.id) AS active_subscriptions
FROM user_points up
LEFT JOIN profiles p ON p.id = up.user_id
LEFT JOIN push_subscriptions ps ON ps.user_id = up.user_id AND ps.is_active = true
WHERE up.current_streak > 0
  AND up.last_activity_date < CURRENT_DATE
GROUP BY up.user_id, p.full_name, up.current_streak, up.last_activity_date;
```

---

## 📊 Monitoring

### Historique des Exécutions

```sql
SELECT 
  runid,
  status,
  return_message,
  start_time,
  end_time,
  (end_time - start_time) AS duration
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-streak-reminder')
ORDER BY start_time DESC
LIMIT 10;
```

### Dernière Exécution

```sql
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-streak-reminder')
ORDER BY start_time DESC
LIMIT 1;
```

---

## 🔧 Gestion

### Désactiver Temporairement

```sql
UPDATE cron.job 
SET active = false 
WHERE jobname = 'daily-streak-reminder';
```

### Réactiver

```sql
UPDATE cron.job 
SET active = true 
WHERE jobname = 'daily-streak-reminder';
```

### Supprimer Définitivement

```sql
SELECT cron.unschedule('daily-streak-reminder');
```

### Changer l'Horaire

```sql
-- Supprimer l'ancien job
SELECT cron.unschedule('daily-streak-reminder');

-- Créer avec nouvelle horaire (exemple: 20h UTC)
SELECT cron.schedule(
  'daily-streak-reminder',
  '0 20 * * *',  -- 20h UTC = 21h Paris (hiver)
  $$ SELECT net.http_post(...) $$
);
```

---

## ⏰ Fuseau Horaire

Les cron jobs Supabase utilisent **UTC** par défaut.

| Heure Paris | Heure UTC (hiver) | Heure UTC (été) | Cron Expression |
|-------------|-------------------|-----------------|-----------------|
| 21h         | 20h               | 19h             | `0 19 * * *` ✅ |
| 22h         | 21h               | 20h             | `0 20 * * *`    |
| 20h         | 19h               | 18h             | `0 18 * * *`    |

**Recommandation** : `0 19 * * *` (19h UTC) pour avoir 21h heure de Paris en été.

---

## 🐛 Dépannage

### Le Cron Job Ne S'Exécute Pas

1. **Vérifier que pg_cron est activé** :
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. **Vérifier que l'Edge Function est déployée** :
   ```bash
   supabase functions list
   ```

3. **Vérifier les VAPID keys** :
   ```bash
   supabase secrets list
   ```

4. **Tester manuellement** (voir section Tests)

5. **Vérifier les logs** :
   - Supabase Dashboard → Edge Functions → Logs
   - Chercher `[Cron]` ou erreurs

### Aucune Notification Envoyée

1. **Vérifier qu'il y a des utilisateurs à notifier** :
   ```sql
   SELECT COUNT(*) 
   FROM user_points 
   WHERE current_streak > 0 
     AND last_activity_date < CURRENT_DATE;
   ```

2. **Vérifier qu'il y a des subscriptions actives** :
   ```sql
   SELECT COUNT(*) 
   FROM push_subscriptions 
   WHERE is_active = true;
   ```

3. **Vérifier les logs Edge Function** pour voir le détail

---

## 📝 Notes Techniques

### Web Push Protocol

L'implémentation actuelle **logue les notifications** mais ne les envoie pas réellement.

Pour l'envoi réel, il faut :
1. Implémenter le **Web Push Protocol (RFC 8030)**
2. Utiliser une lib comme `web-push` (Node.js) ou équivalent Deno
3. Gérer la signature VAPID et l'encryption

**TODO** : Compléter l'implémentation de `sendWebPush()` dans `index.ts`

### Exemple avec web-push (Node.js)

```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:contact@example.com',
  vapidPublicKey,
  vapidPrivateKey
);

await webpush.sendNotification(
  subscription.subscription_data,
  JSON.stringify(payload)
);
```

---

## 🎯 Métriques à Suivre

1. **Taux d'envoi** : Notifications envoyées / Utilisateurs éligibles
2. **Taux d'ouverture** : Clics notification / Notifications envoyées
3. **Taux de conversion** : Activité après notification / Notifications envoyées
4. **Erreurs** : Subscriptions invalides, erreurs d'envoi

**Tracking** : Ajouter une table `notification_logs` pour stocker :
- `user_id`
- `notification_type` ('streak_reminder')
- `sent_at`
- `opened_at` (via tracking dans Service Worker)
- `status` ('sent', 'failed', 'opened')

---

**Dernière mise à jour** : 22 Octobre 2025  
**Version** : 1.0.0  
**Auteur** : E-Réussite Team
