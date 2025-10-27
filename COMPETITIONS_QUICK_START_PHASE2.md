# 🚀 Quick Start - Phase 2 : Notifications & Partage Social

## ⚡ Installation Rapide (5 minutes)

### 1️⃣ Exécuter les scripts SQL dans Supabase Dashboard

```sql
-- 1. Créer les tables (notifications, badges, subscriptions)
-- Copier-coller ADD_COMPETITIONS_NOTIFICATIONS.sql

-- 2. Créer les fonctions (notifications, badges, records)
-- Copier-coller ADD_COMPETITIONS_NOTIFICATIONS_FUNCTIONS.sql

-- 3. Mettre à jour complete_competition_participant
-- Copier-coller ADD_COMPETITIONS_FUNCTIONS.sql (remplace l'ancien)
```

### 2️⃣ Générer les VAPID Keys (notifications push)

```bash
npx web-push generate-vapid-keys
```

**Résultat** :
```
Public Key: BK3x...
Private Key: abc123...
```

**Ajouter dans `.env.local`** :
```env
VITE_VAPID_PUBLIC_KEY=BK3x...
VITE_VAPID_PRIVATE_KEY=abc123...
```

### 3️⃣ Créer le Service Worker

**Créer `public/sw.js`** :
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.data
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
```

**Enregistrer dans `main.jsx`** :
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('SW registered'))
    .catch(err => console.error('SW error:', err));
}
```

### 4️⃣ Tester les Notifications

```javascript
import { 
  requestNotificationPermission, 
  subscribeToPushNotifications,
  sendTestNotification 
} from '@/services/pushNotificationService';

// Dans un composant
const handleTestNotifications = async () => {
  // 1. Demander la permission
  const permission = await requestNotificationPermission();
  
  if (permission === 'granted') {
    // 2. S'abonner
    await subscribeToPushNotifications(user.id, supabaseClient);
    
    // 3. Envoyer une notification test
    await sendTestNotification(user.id, supabaseClient);
  }
};
```

### 5️⃣ Tester le Partage Social

```javascript
import { shareResults } from '@/services/socialShareService';

// Après avoir terminé une compétition
const handleShare = async (platform) => {
  await shareResults({
    competitionTitle: competition.title,
    score: participant.score,
    rank: participant.rank,
    totalParticipants: leaderboard.length,
    badges: earnedBadges,
    platform: platform // 'whatsapp', 'twitter', 'facebook', 'copy'
  });
};
```

---

## 🎯 Utilisation dans l'Interface

### Activer les Notifications (dans le Dashboard)

```jsx
import { Bell } from 'lucide-react';
import { subscribeToPushNotifications } from '@/services/pushNotificationService';

<button 
  onClick={async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      await subscribeToPushNotifications(user.id, supabaseClient);
    }
  }}
  className="btn-primary"
>
  <Bell className="w-4 h-4 mr-2" />
  Activer les notifications
</button>
```

### Afficher le Panel de Notifications

```jsx
import NotificationPanel from '@/components/NotificationPanel';
import { useState } from 'react';

const [showNotifications, setShowNotifications] = useState(false);

<button onClick={() => setShowNotifications(true)}>
  <Bell className="w-6 h-6" />
  {unreadCount > 0 && (
    <span className="badge">{unreadCount}</span>
  )}
</button>

<NotificationPanel 
  isOpen={showNotifications}
  onClose={() => setShowNotifications(false)}
/>
```

### Afficher la Modal de Partage

```jsx
import SocialShareModal from '@/components/SocialShareModal';

<SocialShareModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  competitionTitle={competition.title}
  score={participant.score}
  rank={participant.rank}
  totalParticipants={leaderboard.length}
  badges={earnedBadges}
/>
```

---

## 🎖️ Badges Disponibles

### Performance
- 🥇 **Top 1** : 1ère place (légendeaire)
- 🥈 **Top 3** : Podium (épique)
- 🥉 **Top 10** : Top 10 (rare)
- ⭐ **Score Parfait** : 100% correct (épique)
- ⚡ **Éclair** : Toutes réponses <10s (rare)

### Participation
- 🎯 **Premier Pas** : 1ère compétition (commun)
- 🔥 **Série de 3** : 3 compétitions consécutives (rare)
- 💎 **Série de 10** : 10 compétitions consécutives (épique)
- 🏆 **Champion** : 5 victoires #1 (légendaire)

### Spécialisation
- 📐 **Expert Maths** : 80%+ en Mathématiques (rare)
- 📚 **Maître Français** : 80%+ en Français (rare)
- ⚗️ **Génie Sciences** : 80%+ en Sciences (rare)
- 🌍 **Pro Histoire** : 80%+ en Histoire-Géo (rare)

---

## 🔍 Debug & Troubleshooting

### Les notifications ne s'affichent pas

```javascript
// 1. Vérifier la permission
console.log('Permission:', Notification.permission);

// 2. Vérifier le service worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW:', reg);
});

// 3. Vérifier l'abonnement
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub);
  });
});

// 4. Tester une notification manuelle
new Notification('Test', { body: 'Ceci est un test' });
```

### Les badges ne sont pas attribués

```sql
-- Vérifier les badges disponibles
SELECT * FROM competition_badges;

-- Vérifier les badges de l'utilisateur
SELECT * FROM user_badges WHERE user_id = '...';

-- Tester manuellement
SELECT check_and_award_badges('USER_ID', 'COMPETITION_ID');
```

### Le partage ne fonctionne pas

```javascript
// Vérifier le support Web Share API
if (navigator.share) {
  console.log('Web Share API supportée');
} else {
  console.log('Web Share API non supportée, fallback vers copie');
}
```

---

## 📊 Tester en Local

### 1. Créer des données de test

```sql
-- Insérer des badges de test
INSERT INTO competition_badges (badge_type, name, description, icon, rarity, criteria)
VALUES 
  ('performance', 'Top 1', 'Première place', '🥇', 'legendary', '{"rank": 1}'),
  ('performance', 'Score Parfait', '100% de bonnes réponses', '⭐', 'epic', '{"accuracy": 100}');

-- Simuler une notification
SELECT create_competition_notification(
  'USER_ID',
  'competition_completed',
  'Compétition terminée !',
  'Rang #1 - Score: 214 points',
  '{"competition_id": "COMP_ID", "rank": 1}'::jsonb
);
```

### 2. Tester le flow complet

1. ✅ Terminer une compétition avec un bon score
2. ✅ Vérifier que les badges sont attribués
3. ✅ Vérifier qu'une notification est créée
4. ✅ Tester le partage sur WhatsApp/Twitter
5. ✅ Vérifier le lien partagé avec `?ref=USER_ID`

---

## 📱 Plateformes Supportées

### Notifications Push
- ✅ Chrome Desktop/Android
- ✅ Edge Desktop
- ✅ Firefox Desktop
- ✅ Safari Desktop (macOS 13+)
- ❌ Safari iOS (pas de support Web Push)

### Partage Social
- ✅ Mobile : Web Share API native
- ✅ Desktop : Fallback vers liens directs
- ✅ Tous navigateurs : Copie du lien

---

## ✅ Checklist de Validation

### Phase 2 complète si :
- [ ] Scripts SQL exécutés sans erreur
- [ ] VAPID keys configurées
- [ ] Service worker enregistré
- [ ] Notification test reçue
- [ ] Badge "Premier Pas" attribué à la 1ère compétition
- [ ] Badge "Top 1" attribué si rang = 1
- [ ] Partage WhatsApp fonctionne
- [ ] Copie du lien fonctionne
- [ ] NotificationPanel affiche les notifications
- [ ] SocialShareModal s'ouvre après une compétition

---

## 🎉 Prochaines Étapes (Phase 3)

1. **Classements Hebdomadaires** : Top 10 de la semaine
2. **Système de Parrainage** : +100 points par ami invité
3. **Notifications Email** : Récap hebdomadaire
4. **Images de Partage** : Générer des cards visuelles
5. **Mode Équipe** : Compétitions en groupe

---

## 📞 Support

Questions ? Bugs ? 
👉 Ouvrir une issue sur GitHub
👉 Contact : support@e-reussite.com

---

**Dernière mise à jour** : 27 octobre 2025  
**Version** : 2.0.0  
**Status** : ✅ Production Ready
