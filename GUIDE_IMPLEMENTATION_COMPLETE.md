# 🚀 GUIDE COMPLET D'IMPLÉMENTATION - SYSTÈME D'ESSAI GRATUIT & PAIEMENTS

## 📋 Vue d'ensemble

Ce guide détaille l'implémentation complète du système d'essai gratuit de 7 jours et des paiements Mobile Money pour E-Réussite.

---

## ✅ ÉTAPE 1: BASE DE DONNÉES (SUPABASE)

### 1.1 Exécuter la migration SQL

1. **Ouvrir Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/qbvdrkhdjjpuowthwinf/editor

2. **Exécuter le fichier**
   ```
   database/MIGRATION_ESSAI_GRATUIT_PAIEMENTS.sql
   ```

3. **Vérifier la création des tables**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name IN ('user_subscriptions', 'payment_transactions');
   ```

4. **Tester les fonctions**
   ```sql
   -- Test 1: Démarrer un essai gratuit
   SELECT start_free_trial('USER_ID_HERE'::UUID);
   
   -- Test 2: Obtenir le statut
   SELECT get_subscription_status('USER_ID_HERE'::UUID);
   ```

### 1.2 Tables créées

| Table | Description | Colonnes principales |
|-------|-------------|---------------------|
| `user_subscriptions` | Abonnements utilisateurs | status, trial_start_date, trial_end_date, payment_status |
| `payment_transactions` | Historique des transactions | amount, payment_method, status, provider_transaction_id |

### 1.3 Fonctions SQL disponibles

- `start_free_trial(user_id)` - Démarre l'essai gratuit
- `get_subscription_status(user_id)` - Récupère le statut d'abonnement
- `check_user_access(user_id)` - Vérifie si l'utilisateur a accès
- `complete_payment(...)` - Enregistre un paiement complété
- `get_users_to_notify(days)` - Liste les utilisateurs à notifier
- `mark_notification_sent(user_id, days)` - Marque une notification comme envoyée

---

## ✅ ÉTAPE 2: HOOKS REACT

### 2.1 Hook useSubscription

Fichier créé: `src/hooks/useSubscription.jsx`

**Fonctionnalités:**
- ✅ Récupération automatique du statut d'abonnement
- ✅ Démarrage de l'essai gratuit
- ✅ Vérification d'accès
- ✅ Enregistrement des paiements
- ✅ Historique des transactions

**Utilisation:**
```javascript
import useSubscription from '@/hooks/useSubscription';

function MyComponent() {
  const {
    subscription,
    loading,
    isActive,
    daysRemaining,
    startFreeTrial,
    completePayment,
    refreshStatus
  } = useSubscription();
  
  // Utiliser les données...
}
```

---

## ✅ ÉTAPE 3: COMPOSANTS FRONTEND

### 3.1 Badge de compte à rebours

Fichier créé: `src/components/TrialCountdownBadge.jsx`

**Fonctionnalités:**
- ✅ Affichage des jours restants
- ✅ Changement de couleur selon l'urgence
- ✅ Barre de progression
- ✅ CTA vers la page de paiement

**Intégration dans le Dashboard:**
```javascript
import TrialCountdownBadge from '@/components/TrialCountdownBadge';

function Dashboard() {
  return (
    <div>
      <TrialCountdownBadge />
      {/* Reste du dashboard */}
    </div>
  );
}
```

### 3.2 Page de paiement

Fichier créé: `src/pages/PaymentPage.jsx`

**Fonctionnalités:**
- ✅ Sélection du provider (Orange Money, Wave, Free Money, MTN)
- ✅ Formulaire de paiement avec numéro de téléphone
- ✅ Récapitulatif de l'offre
- ✅ Gestion des erreurs
- ✅ Mode démo pour les tests

**Route à ajouter dans App.jsx:**
```javascript
import PaymentPage from '@/pages/PaymentPage';

// Dans votre routing
<Route path="/payment" element={<PaymentPage />} />
```

---

## ✅ ÉTAPE 4: SERVICE DE PAIEMENT

### 4.1 Configuration

Fichier créé: `src/services/PaymentService.js`

**Mode Démo (actuel):**
- ✅ Simule les paiements instantanément
- ✅ Parfait pour le développement
- ✅ enabled: false dans PAYMENT_CONFIG

**Mode Production (à configurer):**

1. **Créer le fichier `.env.local`:**
```env
# Orange Money
REACT_APP_ORANGE_MONEY_API_URL=https://api.orange.com/orange-money-webpay/dev/v1
REACT_APP_ORANGE_MONEY_MERCHANT_KEY=votre_cle_marchande

# Wave
REACT_APP_WAVE_API_URL=https://api.wave.com/v1
REACT_APP_WAVE_API_KEY=votre_cle_api

# Free Money
REACT_APP_FREE_MONEY_API_URL=https://api.freemoney.sn/v1
REACT_APP_FREE_MONEY_API_KEY=votre_cle_api

# MTN Money
REACT_APP_MTN_MONEY_API_URL=https://sandbox.momodeveloper.mtn.com
REACT_APP_MTN_MONEY_API_KEY=votre_cle_api
```

2. **Activer les providers dans PaymentService.js:**
```javascript
const PAYMENT_CONFIG = {
  orange_money: {
    // ...
    enabled: true // Passer à true après configuration
  }
}
```

3. **Implémenter les webhooks** (voir section 6)

---

## ✅ ÉTAPE 5: NOTIFICATIONS PAR EMAIL

### 5.1 Option A: Supabase Edge Functions (Recommandé)

Fichier créé: `supabase/functions/trial-notifications/index.ts`

**Déploiement:**

1. **Installer Supabase CLI**
```bash
npm install -g supabase
```

2. **Initialiser le projet**
```bash
supabase login
supabase link --project-ref qbvdrkhdjjpuowthwinf
```

3. **Déployer la fonction**
```bash
supabase functions deploy trial-notifications
```

4. **Configurer le CRON job**
   - Aller dans Dashboard > Edge Functions > trial-notifications
   - Ajouter un trigger : `0 9 * * *` (tous les jours à 9h)

5. **Configurer les variables d'environnement**
```bash
supabase secrets set SENDGRID_API_KEY=votre_cle_sendgrid
```

### 5.2 Option B: Backend Node.js avec CRON

**Alternative si vous préférez Node.js:**

1. **Installer les dépendances**
```bash
npm install node-cron nodemailer @supabase/supabase-js
```

2. **Créer le service** (voir commentaires dans index.ts)

3. **Démarrer le service**
```bash
node notificationService.js
```

---

## ✅ ÉTAPE 6: WEBHOOKS POUR PAIEMENTS

### 6.1 Créer les endpoints webhook

**Fichier à créer:** `backend/webhooks/payment-callback.js`

```javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Webhook Orange Money
app.post('/webhooks/orange-money', async (req, res) => {
  try {
    const { order_id, status, transaction_id } = req.body;
    
    if (status === 'SUCCESS') {
      // Mettre à jour la transaction
      await supabase
        .from('payment_transactions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('provider_transaction_id', order_id);
      
      // Activer l'abonnement
      // TODO: Récupérer user_id depuis la transaction et appeler complete_payment
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur webhook Orange Money:', error);
    res.status(500).json({ error: error.message });
  }
});

// Répéter pour Wave, Free Money, MTN Money...

app.listen(3001, () => {
  console.log('Serveur de webhooks sur le port 3001');
});
```

### 6.2 Exposer les webhooks publiquement

**Options:**
1. **ngrok** (développement): `ngrok http 3001`
2. **Heroku/Vercel/Railway** (production)
3. **Serveur VPS avec nginx**

### 6.3 Configurer les URLs dans les dashboards des providers

- Orange Money: https://developer.orange.com/
- Wave: https://developer.wave.com/
- Etc.

---

## ✅ ÉTAPE 7: ROUTING & NAVIGATION

### 7.1 Ajouter les routes dans App.jsx

```javascript
import PaymentPage from '@/pages/PaymentPage';
import PaymentStatusPage from '@/pages/PaymentStatusPage'; // À créer si besoin

// Dans le routing
<Route path="/payment" element={<PaymentPage />} />
<Route path="/payment/status/:transactionId" element={<PaymentStatusPage />} />
```

### 7.2 Protéger les routes privées

```javascript
import useSubscription from '@/hooks/useSubscription';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isActive, loading } = useSubscription();
  
  if (loading) return <div>Chargement...</div>;
  if (!isActive) return <Navigate to="/payment" />;
  
  return children;
}

// Utilisation
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## ✅ ÉTAPE 8: TESTS & VALIDATION

### 8.1 Checklist de tests

**Backend:**
- [ ] Migration SQL exécutée sans erreur
- [ ] Fonctions SQL testées avec des UUIDs réels
- [ ] RLS (Row Level Security) activé et fonctionnel
- [ ] Policies testées pour chaque table

**Frontend:**
- [ ] Hook useSubscription fonctionne
- [ ] Badge de compte à rebours s'affiche correctement
- [ ] Page de paiement accessible et fonctionnelle
- [ ] Mode démo fonctionne (paiement simulé)

**Intégration:**
- [ ] Essai gratuit démarre correctement
- [ ] Compte à rebours se met à jour
- [ ] Paiement en mode démo active l'abonnement
- [ ] Redirection vers dashboard après paiement

**Notifications:**
- [ ] Edge Function déployée
- [ ] CRON configuré
- [ ] Emails de test envoyés
- [ ] Notifications marquées comme envoyées

### 8.2 Tests manuels

**Scénario 1: Nouvel utilisateur**
1. S'inscrire sur la plateforme
2. Démarrer l'essai gratuit
3. Vérifier que le badge affiche "7 jours"
4. Accéder aux cours
5. Payer 1000 FCFA (mode démo)
6. Vérifier l'activation de l'abonnement

**Scénario 2: Fin d'essai**
1. Modifier manuellement trial_end_date à demain dans la DB
2. Vérifier que le badge affiche "1 jour restant"
3. Vérifier la notification J-1 (si CRON configuré)
4. Modifier à aujourd'hui
5. Vérifier la restriction d'accès

### 8.3 Requêtes SQL utiles pour les tests

```sql
-- Voir tous les abonnements
SELECT * FROM user_subscriptions ORDER BY created_at DESC;

-- Voir toutes les transactions
SELECT * FROM payment_transactions ORDER BY created_at DESC;

-- Forcer l'expiration d'un essai (pour tester)
UPDATE user_subscriptions 
SET trial_end_date = NOW() - INTERVAL '1 hour'
WHERE user_id = 'USER_ID_HERE';

-- Réinitialiser un essai
UPDATE user_subscriptions 
SET 
  status = 'trial',
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '7 days',
  notification_j3_sent = false,
  notification_j1_sent = false,
  notification_j0_sent = false
WHERE user_id = 'USER_ID_HERE';

-- Simuler un paiement complété
SELECT complete_payment(
  'USER_ID_HERE'::UUID,
  'TEST_TXN_123',
  'orange_money',
  '+221771234567'
);
```

---

## ✅ ÉTAPE 9: MONITORING & MAINTENANCE

### 9.1 Dashboard de monitoring

**Créer une page admin pour surveiller:**
- Nombre d'essais actifs
- Taux de conversion essai → payant
- Nombre de transactions par provider
- Échecs de paiement
- Notifications envoyées

**Exemple de requête:**
```sql
-- Statistiques des abonnements
SELECT 
  status,
  COUNT(*) as count,
  ROUND(AVG(CASE 
    WHEN trial_end_date IS NOT NULL 
    THEN EXTRACT(DAY FROM (trial_end_date - NOW())) 
    ELSE NULL 
  END), 2) as avg_days_remaining
FROM user_subscriptions
GROUP BY status;

-- Taux de conversion
SELECT 
  COUNT(CASE WHEN status = 'trial' THEN 1 END) as trials_actifs,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as abonnes,
  ROUND(
    COUNT(CASE WHEN status = 'active' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as taux_conversion_pct
FROM user_subscriptions;
```

### 9.2 Logs & Alertes

**Configurer des alertes pour:**
- Échecs de paiement répétés
- Erreurs dans les Edge Functions
- Baisse soudaine du taux de conversion
- Problèmes avec les providers de paiement

---

## ✅ ÉTAPE 10: OPTIMISATIONS FUTURES

### 10.1 Améliorations possibles

**Court terme:**
- [ ] Page de statut de paiement en temps réel
- [ ] SMS en plus des emails pour les notifications
- [ ] Dashboard admin pour gérer les abonnements
- [ ] Système de codes promo

**Moyen terme:**
- [ ] Paiements par carte bancaire (Stripe)
- [ ] Abonnements famille/groupe
- [ ] Programme de parrainage
- [ ] Statistiques de conversion avancées

**Long terme:**
- [ ] Intégration avec plus de providers de paiement
- [ ] API publique pour les partenaires
- [ ] Multi-devises (FCFA, Euros, Dollars)
- [ ] Intelligence artificielle pour optimiser les notifications

---

## 📞 SUPPORT & RESSOURCES

### Documentation des APIs

- **Orange Money:** https://developer.orange.com/apis/orange-money-webpay/
- **Wave:** https://developer.wave.com/
- **MTN Mobile Money:** https://momodeveloper.mtn.com/
- **Supabase:** https://supabase.com/docs
- **SendGrid:** https://docs.sendgrid.com/

### Contact

Pour toute question technique:
- Email: dev@e-reussite.sn
- Discord: [Lien du serveur dev]
- Documentation: https://docs.e-reussite.sn

---

## ✅ CHECKLIST FINALE DE DÉPLOIEMENT

- [ ] Migration SQL exécutée en production
- [ ] Tables et fonctions créées et testées
- [ ] Hook useSubscription intégré dans l'app
- [ ] Badge de compte à rebours affiché dans le dashboard
- [ ] Page de paiement accessible et fonctionnelle
- [ ] Service PaymentService configuré (mode démo ou prod)
- [ ] Edge Function de notifications déployée
- [ ] CRON configuré pour les notifications quotidiennes
- [ ] Webhooks créés et exposés publiquement
- [ ] URLs de callback configurées chez les providers
- [ ] Variables d'environnement configurées (.env.local)
- [ ] Routes de paiement ajoutées dans App.jsx
- [ ] Protection des routes privées implémentée
- [ ] Tests manuels effectués (essai gratuit, paiement, notifications)
- [ ] Monitoring configuré (logs, alertes)
- [ ] Documentation mise à jour

---

## 🎉 FÉLICITATIONS !

Vous avez maintenant un système complet d'essai gratuit et de paiements Mobile Money pour E-Réussite !

**Prochaines étapes recommandées:**
1. Tester en mode démo avec de vrais utilisateurs
2. Configurer les clés API des providers de paiement
3. Passer en mode production progressivement
4. Monitorer les conversions et optimiser

Bonne chance ! 🚀
