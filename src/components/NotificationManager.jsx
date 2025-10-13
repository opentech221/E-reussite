import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * NotificationManager Component
 * Gère les notifications push PWA avec Web Push API
 */
export default function NotificationManager({ userId }) {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState(null);

  // 🔧 DÉSACTIVÉ EN DÉVELOPPEMENT (AbortError: push service error)
  // Les notifications push nécessitent HTTPS en production
  // En développement local, le service push peut refuser les abonnements
  const isDevelopment = import.meta.env.DEV;
  
  // Vérifier le support des notifications ET la présence de la clé VAPID
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  const isSupported = !isDevelopment && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window && publicKey;

  useEffect(() => {
    if (isSupported) {
      checkSubscriptionStatus();
    }
  }, [userId]);

  /**
   * Vérifier si l'utilisateur est déjà abonné
   */
  const checkSubscriptionStatus = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      setRegistration(reg);

      const subscription = await reg.pushManager.getSubscription();
      setIsSubscribed(!!subscription);

      if (subscription) {
        console.log('[NotificationManager] User is subscribed', subscription.endpoint);
      }
    } catch (error) {
      console.error('[NotificationManager] Error checking subscription:', error);
    }
  };

  /**
   * Demander la permission et s'abonner aux notifications
   */
  const subscribe = async () => {
    if (!isSupported) {
      toast.error('Les notifications ne sont pas supportées par votre navigateur');
      return;
    }

    setLoading(true);

    try {
      console.log('[NotificationManager] Starting subscription process...');
      
      // 1. Demander la permission
      console.log('[NotificationManager] Requesting permission...');
      const perm = await Notification.requestPermission();
      console.log('[NotificationManager] Permission result:', perm);
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Permission refusée. Activez les notifications dans les paramètres du navigateur.');
        setLoading(false);
        return;
      }

      // 2. Obtenir le Service Worker
      console.log('[NotificationManager] Waiting for service worker...');
      const reg = await navigator.serviceWorker.ready;
      console.log('[NotificationManager] Service Worker ready:', reg);
      setRegistration(reg);

      // 3. S'abonner au Push Manager
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      console.log('[NotificationManager] VAPID public key:', publicKey ? 'FOUND' : 'NOT FOUND');
      
      if (!publicKey) {
        console.warn('[NotificationManager] VAPID key not configured - notifications disabled');
        toast.error('Configuration des notifications non disponible pour le moment.');
        setLoading(false);
        return;
      }

      console.log('[NotificationManager] Subscribing to push manager...');
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      console.log('[NotificationManager] Subscription created:', subscription.endpoint);

      // 4. Sauvegarder l'abonnement dans Supabase
      const subscriptionData = subscription.toJSON();
      console.log('[NotificationManager] Saving to Supabase...', {
        userId,
        endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
        hasKeys: !!subscriptionData.keys
      });
      
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscriptionData.endpoint,
          p256dh_key: subscriptionData.keys.p256dh,
          auth_key: subscriptionData.keys.auth,
          user_agent: navigator.userAgent,
          device_name: getDeviceName(),
          is_active: true,
          notifications_enabled: true,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'endpoint'
        })
        .select();

      if (error) {
        console.error('[NotificationManager] Supabase error:', error);
        throw error;
      }

      console.log('[NotificationManager] Saved to Supabase:', data);

      setIsSubscribed(true);
      toast.success('🔔 Notifications activées ! Vous recevrez les alertes importantes.');

      // Envoyer une notification de test
      await sendTestNotification();

    } catch (error) {
      console.error('[NotificationManager] Subscription error:', error);
      toast.error(`Erreur: ${error.message || 'Impossible d\'activer les notifications'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Se désabonner des notifications
   */
  const unsubscribe = async () => {
    setLoading(true);

    try {
      const subscription = await registration?.pushManager.getSubscription();
      
      if (subscription) {
        // 1. Désabonner du Push Manager
        await subscription.unsubscribe();
        console.log('[NotificationManager] Unsubscribed from push');

        // 2. Désactiver dans Supabase
        const subscriptionData = subscription.toJSON();
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false, notifications_enabled: false })
          .eq('endpoint', subscriptionData.endpoint);

        setIsSubscribed(false);
        toast.success('Notifications désactivées');
      }
    } catch (error) {
      console.error('[NotificationManager] Unsubscribe error:', error);
      toast.error('Erreur lors de la désactivation');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Envoyer une notification de test
   */
  const sendTestNotification = async () => {
    if (!registration) return;

    try {
      await registration.showNotification('🎉 E-réussite', {
        body: 'Les notifications sont maintenant activées ! Vous serez alerté des nouveaux défis et badges.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'welcome',
        requireInteraction: false,
        vibrate: [200, 100, 200]
      });
    } catch (error) {
      console.error('[NotificationManager] Test notification error:', error);
    }
  };

  /**
   * Convertir la clé VAPID en Uint8Array
   */
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Obtenir le nom de l'appareil
   */
  function getDeviceName() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  }

  // Si les notifications ne sont pas supportées
  if (!isSupported) {
    return null; // Ne rien afficher
  }

  // Si la permission est refusée
  if (permission === 'denied') {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1">Notifications bloquées</h4>
            <p className="text-sm text-red-700">
              Vous avez refusé les notifications. Pour les activer, modifiez les paramètres de votre navigateur.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-blue-100">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-blue-600" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">
            {isSubscribed ? 'Notifications activées' : 'Activer les notifications'}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {isSubscribed 
              ? 'Vous recevez les alertes pour les nouveaux défis, badges et rappels.'
              : 'Recevez des notifications pour les nouveaux défis quotidiens, badges débloqués et rappels avant expiration.'
            }
          </p>

          {isSubscribed ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={sendTestNotification}
                disabled={loading}
              >
                Tester
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={unsubscribe}
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Désactiver
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={subscribe}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Check className="w-4 h-4 mr-1" />
              {loading ? 'Activation...' : 'Activer les notifications'}
            </Button>
          )}
        </div>
      </div>

      {isSubscribed && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 Les notifications fonctionnent même quand l'application est fermée
          </p>
        </div>
      )}
    </Card>
  );
}
