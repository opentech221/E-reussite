import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Flame, Trophy, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * NotificationPermissionModal
 * Modal qui s'affiche après la 2ème connexion pour demander l'autorisation des notifications
 * 
 * Stratégie:
 * - Apparaît après 2ème login (pas au 1er = éviter overwhelm)
 * - Max 3 refus (après → ne plus demander)
 * - Toggle dans settings pour réactiver
 * - Avantages clairs: maintenir streak, ne pas rater conseils IA
 */
export default function NotificationPermissionModal({ userId, onClose }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkShouldShow();
  }, [userId]);

  /**
   * Vérifier si on doit afficher le modal
   * Conditions:
   * - User existe
   * - Notifications pas encore accordées
   * - Pas déjà abonné
   * - Login count >= 2
   * - Dismiss count < 3
   */
  const checkShouldShow = async () => {
    if (!userId) return;

    try {
      // 1. Vérifier permission navigateur
      if (Notification.permission === 'granted') {
        console.log('[NotificationModal] Permission already granted');
        return;
      }

      // 2. Vérifier nombre de connexions et refus
      const { data: profile } = await supabase
        .from('profiles')
        .select('login_count, notification_dismiss_count')
        .eq('id', userId)
        .single();

      if (!profile) return;

      const loginCount = profile.login_count || 0;
      const dismissCount = profile.notification_dismiss_count || 0;

      console.log('[NotificationModal] Login count:', loginCount, 'Dismiss count:', dismissCount);

      // Afficher si:
      // - Au moins 2 connexions (pas la 1ère)
      // - Moins de 3 refus
      if (loginCount >= 2 && dismissCount < 3) {
        setShow(true);
      }
    } catch (error) {
      console.error('[NotificationModal] Error checking:', error);
    }
  };

  /**
   * Demander la permission et s'abonner
   */
  const handleEnable = async () => {
    setLoading(true);

    try {
      // 1. Demander permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Permission refusée. Vous pouvez l\'activer plus tard dans les paramètres.');
        await incrementDismissCount();
        setShow(false);
        onClose?.();
        return;
      }

      // 2. S'abonner au push (via NotificationManager logic)
      const reg = await navigator.serviceWorker.ready;
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        console.warn('[NotificationModal] VAPID key not configured');
        toast.error('Configuration des notifications non disponible.');
        setLoading(false);
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // 3. Sauvegarder dans Supabase
      await supabase
        .from('push_subscriptions')
        .insert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh_key: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth_key: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
          subscription_data: subscription.toJSON()
        });

      toast.success('🔔 Notifications activées ! Vous recevrez des rappels pour maintenir votre série.');
      setShow(false);
      onClose?.();
    } catch (error) {
      console.error('[NotificationModal] Error enabling:', error);
      toast.error('Erreur lors de l\'activation. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refuser et ne plus montrer (temporairement)
   */
  const handleDismiss = async () => {
    await incrementDismissCount();
    setShow(false);
    onClose?.();
  };

  /**
   * Incrémenter le compteur de refus
   */
  const incrementDismissCount = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_dismiss_count')
        .eq('id', userId)
        .single();

      const currentCount = profile?.notification_dismiss_count || 0;

      await supabase
        .from('profiles')
        .update({ notification_dismiss_count: currentCount + 1 })
        .eq('id', userId);

      console.log('[NotificationModal] Dismiss count incremented to', currentCount + 1);
    } catch (error) {
      console.error('[NotificationModal] Error incrementing dismiss count:', error);
    }
  };

  /**
   * Convertir VAPID key en Uint8Array
   */
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative"
        >
          <Card className="w-full max-w-lg p-6 shadow-2xl border-2 border-primary/20">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Bell className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">
              Ne ratez plus rien ! 🔔
            </h2>

            {/* Subtitle */}
            <p className="text-center text-slate-600 dark:text-slate-300 mb-6">
              Activez les notifications pour maintenir votre série et ne pas manquer les conseils de l'IA.
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <Flame className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-100 text-sm">
                    Maintenez votre série 🔥
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Rappel quotidien si vous n'avez pas encore étudié (envoyé à 21h)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                    Conseils de l'IA 🤖
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Recevez des recommandations personnalisées basées sur vos performances
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Trophy className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100 text-sm">
                    Célébrez vos succès 🎉
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Soyez notifié quand vous débloquez un badge ou atteignez un nouveau niveau
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
              <Clock className="w-3 h-3 inline mr-1" />
              Vous pouvez désactiver les notifications à tout moment dans les paramètres
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
                disabled={loading}
              >
                Plus tard
              </Button>
              <Button
                onClick={handleEnable}
                className="flex-1 bg-gradient-to-r from-primary to-blue-600"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Activation...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Activer
                  </div>
                )}
              </Button>
            </div>

            {/* Dismiss count hint */}
            <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-3">
              Ce message ne s'affichera plus après 3 refus
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
