# 🔍 Diagnostic Notifications Push

## Problème Reporté

- ✅ Bouton "Activer les notifications" visible
- ✅ Clic sur le bouton fonctionne
- ✅ Message toast "Notifications activées" apparaît
- ❌ **Pas de popup de permission du navigateur**
- ❌ **Aucune ligne dans la base de données**
- ❌ Bouton "Tester" ne fait rien

## 🔍 Étapes de Diagnostic

### 1. Vérifier la Console du Navigateur

**Action** : Ouvrez la console du navigateur (F12 → Console)

**Recherchez ces messages** :
```
[NotificationManager] Starting subscription process...
[NotificationManager] Requesting permission...
[NotificationManager] Permission result: granted/denied/default
```

**Ce qui devrait apparaître si tout va bien** :
```
[NotificationManager] Starting subscription process...
[NotificationManager] Requesting permission...
[NotificationManager] Permission result: granted
[NotificationManager] Waiting for service worker...
[NotificationManager] Service Worker ready: ServiceWorkerRegistration
[NotificationManager] VAPID public key: FOUND
[NotificationManager] Subscribing to push manager...
[NotificationManager] Subscription created: https://...
[NotificationManager] Saving to Supabase...
[NotificationManager] Saved to Supabase: [...]
```

**Si vous voyez une erreur**, copiez-la et dites-moi.

---

### 2. Vérifier le Service Worker

**Dans la console du navigateur, exécutez** :
```javascript
// Vérifier si le Service Worker est enregistré
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
  regs.forEach(reg => console.log('SW:', reg.active?.scriptURL));
});

// Vérifier l'état
navigator.serviceWorker.ready.then(reg => {
  console.log('Service Worker ready:', reg.active.state);
});
```

**Résultat attendu** :
```
Service Workers: 1
SW: http://localhost:3000/sw.js
Service Worker ready: activated
```

**Si résultat = 0 ou erreur** → Le Service Worker n'est pas enregistré !

---

### 3. Vérifier les Variables d'Environnement

**Dans la console du navigateur, exécutez** :
```javascript
console.log('VAPID Public Key:', import.meta.env.VITE_VAPID_PUBLIC_KEY);
console.log('All env vars:', import.meta.env);
```

**Résultat attendu** :
```
VAPID Public Key: BE8YB_VIQ2Xwx2ZH29Gfq7_hPgWHXqSwHuuzvcWvEQS2cYNZy7BW8JJRX-UBe1TdPr8fJrPXElQdz176pHxmA04
```

**Si undefined** → Le fichier `.env.local` n'est pas chargé !

---

### 4. Vérifier les Permissions du Navigateur

**Dans la console, exécutez** :
```javascript
console.log('Notification permission:', Notification.permission);
console.log('Notification supported:', 'Notification' in window);
console.log('ServiceWorker supported:', 'serviceWorker' in navigator);
console.log('PushManager supported:', 'PushManager' in window);
```

**Résultat attendu** :
```
Notification permission: default (ou granted)
Notification supported: true
ServiceWorker supported: true
PushManager supported: true
```

---

### 5. Test Manuel de Permission

**Dans la console, exécutez** :
```javascript
Notification.requestPermission().then(perm => {
  console.log('Permission:', perm);
  if (perm === 'granted') {
    new Notification('Test', { body: 'Les notifications fonctionnent!' });
  }
});
```

**Ce qui devrait se passer** :
1. Popup de permission du navigateur apparaît
2. Vous cliquez "Autoriser"
3. Une notification "Test" apparaît

**Si la popup n'apparaît pas** → Les notifications sont bloquées !

---

## 🛠️ Solutions par Problème

### Problème 1 : Service Worker non enregistré

**Cause** : Le Service Worker n'est pas chargé dans `main.jsx`

**Vérification** :
```bash
# Vérifier que sw.js existe
ls public/sw.js
```

**Solution** : Vérifier `src/main.jsx` contient :
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW error:', err));
  });
}
```

---

### Problème 2 : Variable VAPID non chargée

**Cause** : `.env.local` pas chargé ou serveur pas redémarré

**Solution** :
1. **Vérifier que le fichier existe** :
   ```bash
   cat .env.local
   ```
   
2. **Vérifier le contenu** :
   ```env
   VITE_VAPID_PUBLIC_KEY=BE8YB_VIQ2Xwx2ZH29Gfq7_hPgWHXqSwHuuzvcWvEQS2cYNZy7BW8JJRX-UBe1TdPr8fJrPXElQdz176pHxmA04
   ```

3. **Redémarrer le serveur** :
   ```bash
   # Arrêter (Ctrl+C)
   npm run dev
   ```

4. **Vérifier dans le navigateur** (F5 pour recharger) :
   ```javascript
   console.log(import.meta.env.VITE_VAPID_PUBLIC_KEY);
   ```

---

### Problème 3 : Notifications bloquées par le navigateur

**Symptômes** :
- Pas de popup de permission
- `Notification.permission` = "denied"

**Solution** :

**Chrome** :
1. Cliquer sur l'icône 🔒 à gauche de l'URL
2. Paramètres du site → Notifications → Autoriser
3. Recharger la page (F5)

**Edge** :
1. Cliquer sur l'icône 🔒 à gauche de l'URL
2. Autorisations pour ce site → Notifications → Autoriser
3. Recharger la page (F5)

**Firefox** :
1. Cliquer sur l'icône 🔒 à gauche de l'URL
2. Paramètres → Notifications → Autoriser
3. Recharger la page (F5)

---

### Problème 4 : HTTPS requis (localhost OK)

**Note** : Les notifications push nécessitent HTTPS (sauf localhost)

**Vérification** :
```javascript
console.log('Protocol:', window.location.protocol); // doit être http: (localhost) ou https:
```

Si vous accédez via l'adresse IP (ex: `http://192.168.x.x:3000`), les notifications ne fonctionneront pas !

**Solution** : Utilisez toujours `http://localhost:3000` pour le développement.

---

## 📋 Checklist Complète

Cochez au fur et à mesure :

**Infrastructure** :
- [ ] Fichier `public/sw.js` existe
- [ ] Service Worker enregistré dans `main.jsx`
- [ ] Service Worker activé (vérifier dans F12 → Application → Service Workers)

**Configuration** :
- [ ] Fichier `.env.local` existe à la racine
- [ ] `.env.local` contient `VITE_VAPID_PUBLIC_KEY`
- [ ] Serveur redémarré après création de `.env.local`
- [ ] Variable accessible dans console : `import.meta.env.VITE_VAPID_PUBLIC_KEY`

**Permissions** :
- [ ] Accès via `http://localhost:3000` (pas d'IP)
- [ ] Notifications non bloquées dans paramètres du navigateur
- [ ] Test manuel de permission fonctionne

**Base de données** :
- [ ] Migration 006 exécutée dans Supabase
- [ ] Tables `push_subscriptions` et `notification_queue` existent
- [ ] RLS activé et politiques créées

---

## 🚀 Commandes de Test Rapide

**Dans la console du navigateur (F12)** :

```javascript
// Test complet
(async () => {
  console.log('=== DIAGNOSTIC NOTIFICATIONS ===');
  console.log('1. Support:', {
    notification: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window
  });
  
  console.log('2. Permission:', Notification.permission);
  
  console.log('3. Service Worker:');
  const regs = await navigator.serviceWorker.getRegistrations();
  console.log('   Registered:', regs.length > 0);
  if (regs.length > 0) {
    console.log('   URL:', regs[0].active?.scriptURL);
    console.log('   State:', regs[0].active?.state);
  }
  
  console.log('4. VAPID Key:', import.meta.env.VITE_VAPID_PUBLIC_KEY ? 'FOUND' : 'NOT FOUND');
  
  console.log('5. Protocol:', window.location.protocol);
  console.log('6. Host:', window.location.host);
})();
```

**Copiez le résultat et envoyez-le moi !**

---

## 🎯 Prochaines Actions

1. **Exécutez le diagnostic complet** dans la console
2. **Copiez tous les logs** qui apparaissent
3. **Dites-moi ce que vous voyez** :
   - Résultat du diagnostic
   - Messages d'erreur en rouge
   - Valeurs des variables

Avec ces informations, je pourrai vous dire exactement quel est le problème et comment le résoudre ! 🔧
