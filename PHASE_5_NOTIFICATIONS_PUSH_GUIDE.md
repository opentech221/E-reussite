# 🔔 PHASE 5 : NOTIFICATIONS PUSH PWA - GUIDE COMPLET

**Date**: 5 octobre 2025  
**Status**: En cours d'implémentation  
**Version**: Production (Web Push API)

---

## 📋 Vue d'Ensemble

Ce guide vous accompagne dans l'implémentation complète d'un système de notifications push professionnel pour E-réussite.

### Fonctionnalités
- ✅ Notifications même quand l'app est fermée
- ✅ Planification automatique (nouveaux défis à 8h)
- ✅ Rappels avant expiration des défis
- ✅ Notifications de badges et niveaux
- ✅ Architecture sécurisée (VAPID)

---

## 🎯 ÉTAPE 1/6 : Génération des VAPID Keys

### Qu'est-ce que VAPID ?
**VAPID** (Voluntary Application Server Identification) est un protocole de sécurité pour les notifications push. Il permet d'identifier votre serveur auprès des navigateurs.

### 1.1 - Installer web-push

```powershell
npm install web-push --save-dev
```

### 1.2 - Générer les clés VAPID

```powershell
npx web-push generate-vapid-keys
```

Vous obtiendrez quelque chose comme :
```
Public Key: BNxlC...xyz123
Private Key: ab12C...xyz789
```

### 1.3 - Créer le fichier .env.local

Créez `.env.local` à la racine avec :

```env
# VAPID Keys pour Web Push
VITE_VAPID_PUBLIC_KEY=votre_public_key_ici
VAPID_PRIVATE_KEY=votre_private_key_ici

# Supabase (déjà existantes)
VITE_SUPABASE_URL=votre_url
VITE_SUPABASE_ANON_KEY=votre_key
```

⚠️ **IMPORTANT** : 
- Ajoutez `.env.local` à `.gitignore`
- Ne committez JAMAIS la clé privée
- La clé publique commence par `VITE_` (accessible côté client)

---

## 🗄️ ÉTAPE 2/6 : Migration Database

### 2.1 - Créer la migration 006

Créez `database/migrations/006_push_notifications.sql` :

```sql
-- ============================================
-- MIGRATION 006: Push Notifications System
-- ============================================
-- Date: 5 octobre 2025
-- Description: Système de notifications push avec Web Push API

-- ============================================
-- Table: push_subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription data (JSON from PushSubscription API)
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  
  -- Device info
  user_agent TEXT,
  device_name TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Preferences
  notifications_enabled BOOLEAN DEFAULT true,
  challenge_reminders BOOLEAN DEFAULT true,
  badge_alerts BOOLEAN DEFAULT true,
  level_up_alerts BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: notification_queue
-- ============================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification data
  type TEXT NOT NULL, -- 'challenge', 'badge', 'level', 'reminder'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  data JSONB,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_type ON notification_queue(type);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can view their own notification history
CREATE POLICY "Users can view own notifications"
  ON notification_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage notifications
CREATE POLICY "Service role can manage notifications"
  ON notification_queue
  FOR ALL
  USING (true);

-- ============================================
-- Fonction: Enqueue notification
-- ============================================
CREATE OR REPLACE FUNCTION enqueue_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_icon TEXT DEFAULT NULL,
  p_badge TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'::JSONB,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notification_queue (
    user_id,
    type,
    title,
    body,
    icon,
    badge,
    data,
    scheduled_for
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_icon,
    p_badge,
    p_data,
    p_scheduled_for
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- ============================================
-- Fonction: Get pending notifications
-- ============================================
CREATE OR REPLACE FUNCTION get_pending_notifications()
RETURNS TABLE (
  notification_id UUID,
  user_id UUID,
  type TEXT,
  title TEXT,
  body TEXT,
  icon TEXT,
  badge TEXT,
  data JSONB,
  subscriptions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nq.id as notification_id,
    nq.user_id,
    nq.type,
    nq.title,
    nq.body,
    nq.icon,
    nq.badge,
    nq.data,
    jsonb_agg(
      jsonb_build_object(
        'endpoint', ps.endpoint,
        'keys', jsonb_build_object(
          'p256dh', ps.p256dh_key,
          'auth', ps.auth_key
        )
      )
    ) as subscriptions
  FROM notification_queue nq
  INNER JOIN push_subscriptions ps ON ps.user_id = nq.user_id
  WHERE nq.status = 'pending'
    AND nq.scheduled_for <= NOW()
    AND ps.is_active = true
    AND ps.notifications_enabled = true
  GROUP BY nq.id, nq.user_id, nq.type, nq.title, nq.body, nq.icon, nq.badge, nq.data
  ORDER BY nq.scheduled_for ASC
  LIMIT 100;
END;
$$;

-- ============================================
-- Fonction: Mark notification as sent
-- ============================================
CREATE OR REPLACE FUNCTION mark_notification_sent(
  p_notification_id UUID,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_success THEN
    UPDATE notification_queue
    SET 
      status = 'sent',
      sent_at = NOW()
    WHERE id = p_notification_id;
  ELSE
    UPDATE notification_queue
    SET 
      status = 'failed',
      error_message = p_error_message,
      retry_count = retry_count + 1
    WHERE id = p_notification_id;
  END IF;
END;
$$;

-- ============================================
-- Vérifications
-- ============================================
SELECT 'Push subscriptions table' as table_name, COUNT(*) as row_count FROM push_subscriptions;
SELECT 'Notification queue table' as table_name, COUNT(*) as row_count FROM notification_queue;
```

### 2.2 - Exécuter la migration

1. Ouvrez Supabase Dashboard → SQL Editor
2. Copiez tout le contenu de `006_push_notifications.sql`
3. Cliquez "Run"
4. Vérifiez : 2 tables créées (0 rows chacune)

---

## 🔧 ÉTAPE 3/6 : Service Worker Avancé

### 3.1 - Mettre à jour public/sw.js

Remplacez le contenu par :

```javascript
// Service Worker pour E-réussite PWA avec Push Notifications
const CACHE_NAME = 'e-reussite-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch (stratégie Network First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Réception d'une notification push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received', event);

  let notificationData = {
    title: 'E-réussite',
    body: 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {}
  };

  // Parser les données du push
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        data: payload.data || {},
        tag: payload.tag || 'default',
        requireInteraction: payload.requireInteraction || false,
        actions: payload.actions || []
      };
    } catch (e) {
      console.error('[Service Worker] Error parsing push data', e);
    }
  }

  // Afficher la notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    })
  );
});

// Click sur une notification
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked', event);

  event.notification.close();

  // Action sur le clic
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          const targetUrl = event.notification.data?.url || '/';
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Close notification
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed', event);
});

console.log('[Service Worker] Loaded with Push support');
```

### 3.2 - Vérifier le Service Worker

Après mise à jour, ouvrez DevTools → Application → Service Workers et vérifiez qu'il est actif.

---

## ⚛️ ÉTAPE 4/6 : NotificationManager Component

Créez `src/components/NotificationManager.jsx` :

*Voir fichier séparé créé automatiquement...*

---

## 📱 ÉTAPE 5/6 : Dashboard Integration

Modifiez `src/pages/Dashboard.jsx` pour ajouter le bouton de notifications...

*Suite dans les prochains fichiers...*

---

## ☁️ ÉTAPE 6/6 : Supabase Edge Functions

Configuration des Edge Functions pour l'envoi automatique...

*Détails à suivre...*

---

## 🎯 Prochaines Actions

1. ✅ Lire ce guide
2. ⏳ Générer VAPID keys
3. ⏳ Exécuter migration 006
4. ⏳ Mettre à jour sw.js
5. ⏳ Créer NotificationManager.jsx
6. ⏳ Intégrer au Dashboard

**Temps estimé restant** : 2-3 heures

---

## 📚 Ressources

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [web-push npm](https://www.npmjs.com/package/web-push)
