# 🔔 Configuration des Notifications Push

## Date : 12 octobre 2025

---

## 📋 Vue d'ensemble

Les notifications push permettent aux utilisateurs de recevoir des alertes même quand l'application est fermée :
- ✅ Nouveaux défis quotidiens
- ✅ Badges débloqués
- ✅ Rappels avant expiration de séries
- ✅ Nouveaux messages du coach IA

**Status actuel :** ⚠️ VAPID key non configurée - Notifications désactivées automatiquement

---

## 🔧 Étapes de Configuration

### 1. Générer les clés VAPID

Les clés VAPID (Voluntary Application Server Identification) sont nécessaires pour identifier votre application auprès des services push.

**Option A : Avec web-push (Node.js)**

```bash
# Installer web-push globalement
npm install -g web-push

# Générer les clés
web-push generate-vapid-keys
```

**Option B : En ligne**

Utilisez un générateur en ligne comme :
- https://vapidkeys.com/
- https://d3v.one/vapid-key-generator/

Vous obtiendrez :
```
Public Key: BKxQ...xyz (clé publique)
Private Key: abc...123 (clé privée - À GARDER SECRÈTE)
```

---

### 2. Configurer les Variables d'Environnement

#### **Frontend (.env)**

Ajoutez dans `c:\Users\toshiba\Downloads\E-reussite\.env` :

```env
# Push Notifications - VAPID Keys
VITE_VAPID_PUBLIC_KEY=VOTRE_CLE_PUBLIQUE_ICI
```

#### **Backend (Supabase Edge Function)**

Si vous utilisez Supabase Edge Functions pour envoyer les notifications :

Ajoutez dans Supabase Dashboard → Edge Functions → Secrets :

```env
VAPID_PUBLIC_KEY=VOTRE_CLE_PUBLIQUE_ICI
VAPID_PRIVATE_KEY=VOTRE_CLE_PRIVEE_ICI
VAPID_SUBJECT=mailto:admin@e-reussite.com
```

---

### 3. Créer la Table de Stockage

Si ce n'est pas déjà fait, créez la table pour stocker les abonnements push :

```sql
-- Table pour les abonnements push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;

-- RLS Policy
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();
```

---

### 4. Créer le Service Worker

Le service worker `public/sw.js` est déjà configuré. Vérifiez qu'il contient :

```javascript
// sw.js
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});
```

---

### 5. Créer l'Edge Function d'Envoi

Créez `supabase/functions/send-notification/index.ts` :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
const vapidSubject = Deno.env.get('VAPID_SUBJECT')!

serve(async (req) => {
  try {
    const { userId, title, body, icon, tag, url } = await req.json()

    // Récupérer les abonnements actifs de l'utilisateur
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('notifications_enabled', true)

    if (error) throw error

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192x192.png',
      tag: tag || 'notification',
      data: { url: url || '/' }
    })

    // Envoyer à tous les appareils
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
            'Authorization': `vapid t=${generateJWT()}, k=${vapidPublicKey}`
          },
          body: payload
        })

        if (!response.ok) {
          // Désactiver si l'abonnement est invalide
          if (response.status === 410 || response.status === 404) {
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', sub.id)
          }
        }

        return response
      })
    )

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Fonction pour générer le JWT VAPID
function generateJWT() {
  // Implémentation du JWT pour VAPID
  // Voir: https://github.com/web-push-libs/web-push
}
```

---

## ✅ Vérification de la Configuration

### 1. Vérifier la variable d'environnement

```bash
# Dans le terminal
cd c:\Users\toshiba\Downloads\E-reussite
Get-Content .env | Select-String "VAPID"
```

Devrait afficher :
```
VITE_VAPID_PUBLIC_KEY=BKxQ...xyz
```

### 2. Redémarrer le serveur de développement

```bash
npm run dev
```

### 3. Tester dans le Dashboard

1. Ouvrir le Dashboard
2. La carte "Activer les notifications" devrait apparaître
3. Cliquer sur "Activer les notifications"
4. Accepter la permission du navigateur
5. Une notification de test devrait s'afficher

---

## 🐛 Dépannage

### Erreur : "Registration failed - push service error"

**Cause :** Clé VAPID manquante ou invalide

**Solution :**
1. Vérifier que `VITE_VAPID_PUBLIC_KEY` existe dans `.env`
2. Redémarrer le serveur Vite
3. Vider le cache du navigateur

### La carte notifications n'apparaît pas

**Cause :** `isSupported` retourne `false`

**Solution :**
1. Vérifier que la clé VAPID est définie
2. Utiliser un navigateur moderne (Chrome, Firefox, Edge)
3. Tester en HTTPS (ou localhost)

### Notifications non reçues

**Cause :** Service Worker non enregistré ou Edge Function non configurée

**Solution :**
1. Vérifier que `sw.js` existe dans `public/`
2. Ouvrir DevTools → Application → Service Workers
3. Vérifier que le SW est "activated"

---

## 📚 Ressources

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [MDN - Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 🔐 Sécurité

⚠️ **IMPORTANT :**
- La clé **publique** VAPID peut être exposée (frontend)
- La clé **privée** VAPID doit RESTER SECRÈTE (backend only)
- Ne jamais committer la clé privée dans Git
- Utiliser `.env.local` et `.gitignore` pour protéger les secrets

---

**Status actuel :** Le composant `NotificationManager` est robuste et n'affichera rien si VAPID n'est pas configuré. Aucune erreur console ne devrait apparaître.

**Prochaine étape :** Générer les clés VAPID et les ajouter dans `.env` quand vous serez prêt à activer les notifications push.
