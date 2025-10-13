# 📋 Phase 5 - Instructions d'Exécution

## ✅ Étapes Complétées

### 1. Installation des Dépendances ✅
```bash
npm install web-push --save-dev
```
- **Status** : ✅ Installé
- **Package** : web-push@3.6.7
- **Packages ajoutés** : 13

### 2. Génération des Clés VAPID ✅
```bash
npx web-push generate-vapid-keys --json
```
- **Status** : ✅ Générées
- **Public Key** : `BE8YB_VIQ2Xwx2ZH29Gfq7_hPgWHXqSwHuuzvcWvEQS2cYNZy7BW8JJRX-UBe1TdPr8fJrPXElQdz176pHxmA04`
- **Private Key** : `f6U_yvocgYRNHckfJmJPbwAVwQoHCG4ZMVKPfmm11Qs`

### 3. Configuration Environnement ✅
```env
# .env.local (créé)
VITE_VAPID_PUBLIC_KEY=BE8YB_VIQ2Xwx2ZH29Gfq7_hPgWHXqSwHuuzvcWvEQS2cYNZy7BW8JJRX-UBe1TdPr8fJrPXElQdz176pHxmA04
VAPID_PRIVATE_KEY=f6U_yvocgYRNHckfJmJPbwAVwQoHCG4ZMVKPfmm11Qs
```
- **Status** : ✅ Créé
- **Gitignore** : ✅ Mis à jour (`.env.local` ajouté)

### 4. Service Worker ✅
- **Fichier** : `public/sw.js`
- **Status** : ✅ Mis à jour
- **Ajouts** :
  - Gestionnaire `push` event (réception notifications)
  - Gestionnaire `notificationclick` (clic sur notification)
  - Gestionnaire `notificationclose` (fermeture notification)

### 5. Composant React ✅
- **Fichier** : `src/components/NotificationManager.jsx`
- **Status** : ✅ Créé (250 lignes)
- **Fonctionnalités** :
  - Demande de permission utilisateur
  - Abonnement aux notifications push
  - Sauvegarde dans Supabase
  - Désabonnement
  - Notification de test

### 6. Intégration Dashboard ✅
- **Fichier** : `src/pages/Dashboard.jsx`
- **Status** : ✅ Intégré
- **Position** : Entre PointsChart et Challenges
- **Props** : `userId` passé automatiquement

---

## 🚀 Prochaine Étape : Exécuter la Migration SQL

### Migration 006 - Push Notifications

**Fichier** : `database/migrations/006_push_notifications.sql`

#### Instructions d'Exécution

1. **Ouvrir Supabase SQL Editor**
   - Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
   - Sélectionner votre projet **E-réussite**
   - Cliquer sur **SQL Editor** dans le menu gauche

2. **Copier le Contenu de la Migration**
   - Ouvrir le fichier `database/migrations/006_push_notifications.sql`
   - **Copier TOUT le contenu** (260 lignes)

3. **Coller dans SQL Editor**
   - Créer une nouvelle requête (bouton **+ New query**)
   - Coller le contenu copié
   - Vérifier que tout est bien collé (début et fin du fichier)

4. **Exécuter la Migration**
   - Cliquer sur **Run** (ou Ctrl+Enter)
   - ⏱️ Attendre l'exécution (5-10 secondes)

5. **Vérifier le Succès**
   - ✅ Message : "Success. No rows returned"
   - ✅ Pas d'erreurs rouges

#### Que Fait Cette Migration ?

**Tables Créées** :

1. **`push_subscriptions`** (12 colonnes)
   - Stocke les abonnements push des utilisateurs
   - Clés de chiffrement (p256dh_key, auth_key)
   - Préférences de notifications
   - Métadonnées (device, user_agent)

2. **`notification_queue`** (11 colonnes)
   - File d'attente des notifications
   - Types : challenge, badge, level, reminder
   - Planification (scheduled_for)
   - Statuts : pending, sent, failed, cancelled

**Fonctions Créées** :

1. **`enqueue_notification()`**
   - Ajoute une notification à la file d'attente
   - Paramètres : user_id, type, title, body, data, scheduled_for

2. **`get_pending_notifications()`**
   - Récupère les notifications en attente d'envoi
   - JOIN avec push_subscriptions pour obtenir les endpoints
   - Filtre par scheduled_for <= NOW()

3. **`mark_notification_sent()`**
   - Marque une notification comme envoyée
   - Met à jour sent_at et status
   - Gère les erreurs avec retry_count

**Indexes Créés** : 8 indexes pour performance
**Politiques RLS** : 7 politiques pour sécurité

---

## 🧪 Tests Après Migration

### 1. Vérifier les Tables

```sql
-- Vérifier que les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('push_subscriptions', 'notification_queue');

-- Résultat attendu : 2 lignes (push_subscriptions, notification_queue)
```

### 2. Vérifier les Fonctions

```sql
-- Lister les fonctions créées
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%notification%';

-- Résultat attendu : 3 fonctions
-- - enqueue_notification
-- - get_pending_notifications
-- - mark_notification_sent
```

### 3. Tester l'Enqueue

```sql
-- Enregistrer une notification de test
SELECT enqueue_notification(
  auth.uid(),
  'test',
  'Test Notification',
  'Ceci est un test',
  '/icon-192x192.png',
  '/icon-192x192.png',
  '{"url": "/dashboard"}'::JSONB,
  NOW()
);

-- Résultat attendu : UUID de la notification
-- Exemple : a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

### 4. Vérifier la File d'Attente

```sql
-- Voir les notifications en attente
SELECT id, type, title, status, scheduled_for
FROM notification_queue
WHERE status = 'pending'
ORDER BY scheduled_for ASC
LIMIT 5;

-- Résultat attendu : Notification de test avec status 'pending'
```

---

## 🎯 Tests Fonctionnels (Après Migration)

### Test 1 : Demander Permission

1. **Redémarrer le serveur**
   ```bash
   npm run dev
   ```

2. **Ouvrir http://localhost:5173/dashboard**

3. **Chercher le composant NotificationManager**
   - Doit apparaître entre le graphique de points et les défis
   - Titre : "Activer les notifications"
   - Description visible

4. **Cliquer sur "Activer les notifications"**
   - ✅ Popup de permission du navigateur
   - ✅ Accepter la permission
   - ✅ Toast de succès : "🔔 Notifications activées !"
   - ✅ Notification de test apparaît
   - ✅ Composant affiche maintenant "Notifications activées"

### Test 2 : Vérifier l'Abonnement dans la BDD

```sql
-- Vérifier que l'abonnement est enregistré
SELECT 
  id,
  user_id,
  endpoint,
  is_active,
  notifications_enabled,
  device_name,
  created_at
FROM push_subscriptions
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;

-- Résultat attendu : 1 ligne avec is_active = true
```

### Test 3 : Envoyer une Notification Manuelle

```sql
-- Envoyer une notification de test à vous-même
SELECT enqueue_notification(
  auth.uid(),
  'badge',
  '🏆 Nouveau Badge !',
  'Vous avez débloqué le badge "Explorateur"',
  '/icon-192x192.png',
  '/icon-192x192.png',
  '{"badge_id": "explorer", "url": "/dashboard"}'::JSONB,
  NOW()
);
```

**Note** : Pour l'instant, cette notification sera en file d'attente. Pour l'envoyer réellement, il faudra :
- Soit : Créer une Supabase Edge Function (Phase 5 avancée)
- Soit : Utiliser un script Node.js avec `web-push.sendNotification()`

### Test 4 : Notification au Clic

1. **Compléter un quiz** pour débloquer un badge
2. **Vérifier** :
   - ✅ Toast de badge apparaît dans l'application
   - ✅ (Optionnel) Notification push si implémenté avec Edge Function

### Test 5 : Désabonnement

1. **Cliquer sur "Désactiver"** dans le composant NotificationManager
2. **Vérifier** :
   - ✅ Toast : "Notifications désactivées"
   - ✅ Composant affiche à nouveau "Activer les notifications"

```sql
-- Vérifier que l'abonnement est désactivé
SELECT is_active, notifications_enabled
FROM push_subscriptions
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;

-- Résultat attendu : is_active = false
```

---

## 🐛 Dépannage

### Erreur : "VAPID public key not found"

**Cause** : Variable d'environnement non chargée

**Solution** :
```bash
# 1. Vérifier que .env.local existe à la racine
cat .env.local

# 2. Redémarrer le serveur Vite
npm run dev
```

### Erreur : "Push notification permission denied"

**Cause** : L'utilisateur a refusé les notifications

**Solution** :
1. Ouvrir les paramètres du navigateur
2. Chercher les paramètres de notifications
3. Autoriser les notifications pour localhost:5173
4. Recharger la page

### Erreur SQL : "relation does not exist"

**Cause** : Migration 006 pas exécutée

**Solution** :
1. Vérifier dans Supabase Table Editor si les tables existent
2. Si non, exécuter la migration 006

### Notification de Test n'Apparaît Pas

**Causes Possibles** :
- Service Worker pas enregistré
- Notifications bloquées par le navigateur
- Onglet en arrière-plan (certains navigateurs)

**Solution** :
```javascript
// Vérifier dans la console du navigateur
navigator.serviceWorker.ready.then(reg => {
  console.log('Service Worker ready:', reg.active.state);
});

Notification.requestPermission().then(perm => {
  console.log('Permission:', perm);
});
```

---

## 📊 État Actuel du Projet

### Phase 1 : Base Gamification ✅
- Tables : user_points, user_badges, user_progress
- Fonctions : award/retrieve points, badges, progression
- Dashboard : Stats, leaderboard

### Phase 2 : Toast Badges ✅
- Sonner intégré
- BadgeNotification.jsx
- Animations séquentielles

### Phase 3 : Graphique Points ✅
- Migration 004 : user_points_history
- PointsChart.jsx (Recharts)
- Graphiques Line/Area avec stats

### Phase 4 : Défis ✅
- Migration 005 : challenges, user_challenges, challenge_progress_log
- 19 défis seed
- Challenges.jsx
- Auto-update au quiz

### Phase 5 : Notifications Push 🚧
- ✅ web-push installé
- ✅ VAPID keys générées
- ✅ .env.local configuré
- ✅ Service Worker mis à jour
- ✅ NotificationManager.jsx créé
- ✅ Dashboard intégré
- ⏳ **PROCHAINE ÉTAPE** : Exécuter migration 006
- ⏳ Tests fonctionnels
- ⏳ (Optionnel) Supabase Edge Function pour envoi automatique

---

## 🎯 Prochaines Actions

### Immédiat
1. **Exécuter migration 006** dans Supabase SQL Editor
2. **Tester l'abonnement** aux notifications
3. **Vérifier la sauvegarde** dans la BDD

### Court Terme
- Créer une Edge Function pour envoyer les notifications automatiquement
- Intégrer l'envoi de notifications lors de :
  - Nouveau défi quotidien (8h du matin)
  - Badge débloqué
  - Niveau up
  - Défi expirant dans 2h

### Moyen Terme
- Préférences utilisateur (notifications par type)
- Historique des notifications
- Analytics (taux d'ouverture, clics)

---

## 📚 Références

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/rfc8292)
- [web-push Library](https://github.com/web-push-libs/web-push)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Date** : 5 octobre 2025  
**Phase** : 5 - Notifications Push  
**Status** : Migration SQL prête à exécuter 🚀
