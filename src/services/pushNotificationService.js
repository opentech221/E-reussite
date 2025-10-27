// =============================================
// SERVICE DE NOTIFICATIONS PUSH WEB
// Gestion des notifications Web Push API
// =============================================

import { supabase } from '@/lib/supabaseClient';

class PushNotificationService {
  constructor() {
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || null;
    this.registration = null;
  }

  // Vérifier si les notifications sont supportées
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Demander la permission
  async requestPermission() {
    if (!this.isSupported()) {
      console.warn('🔕 [Push] Notifications non supportées');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 [Push] Permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('❌ [Push] Erreur permission:', error);
      return false;
    }
  }

  // S'abonner aux notifications push
  async subscribe(userId) {
    if (!this.isSupported()) {
      console.warn('🔕 [Push] Notifications non supportées');
      return null;
    }

    try {
      // Récupérer le service worker
      this.registration = await navigator.serviceWorker.ready;
      console.log('✅ [Push] Service Worker prêt');

      // Vérifier si déjà abonné
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('✅ [Push] Déjà abonné');
        return subscription;
      }

      // Créer un nouvel abonnement
      subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('✅ [Push] Nouvel abonnement créé');

      // Sauvegarder l'abonnement dans Supabase
      await this.saveSubscription(userId, subscription);

      return subscription;
    } catch (error) {
      console.error('❌ [Push] Erreur abonnement:', error);
      return null;
    }
  }

  // Se désabonner
  async unsubscribe(userId) {
    try {
      const subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ [Push] Désabonnement réussi');
        
        // Supprimer de Supabase
        await this.removeSubscription(userId, subscription);
      }
    } catch (error) {
      console.error('❌ [Push] Erreur désabonnement:', error);
    }
  }

  // Sauvegarder l'abonnement dans Supabase
  async saveSubscription(userId, subscription) {
    try {
      const subscriptionJson = subscription.toJSON();

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscriptionJson.keys.p256dh,
            auth: subscriptionJson.keys.auth
          }
        });

      if (error) throw error;
      console.log('✅ [Push] Abonnement sauvegardé');
    } catch (error) {
      console.error('❌ [Push] Erreur sauvegarde:', error);
    }
  }

  // Supprimer l'abonnement de Supabase
  async removeSubscription(userId, subscription) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .match({ 
          user_id: userId,
          endpoint: subscription.endpoint 
        });

      if (error) throw error;
      console.log('✅ [Push] Abonnement supprimé de Supabase');
    } catch (error) {
      console.error('❌ [Push] Erreur suppression:', error);
    }
  }

  // Envoyer une notification locale (test)
  async showLocalNotification(title, body, data = {}) {
    if (!this.isSupported()) return;

    try {
      await this.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: data.tag || 'notification',
        data,
        actions: data.actions || []
      });
    } catch (error) {
      console.error('❌ [Push] Erreur notification locale:', error);
    }
  }

  // Récupérer les notifications non lues
  async getUnreadNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('competition_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ [Push] Erreur récupération notifications:', error);
      return [];
    }
  }

  // Marquer comme lu
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('competition_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      console.log('✅ [Push] Notification marquée comme lue');
    } catch (error) {
      console.error('❌ [Push] Erreur marquage lu:', error);
    }
  }

  // Marquer toutes comme lues
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('competition_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      console.log('✅ [Push] Toutes les notifications marquées comme lues');
    } catch (error) {
      console.error('❌ [Push] Erreur marquage toutes lues:', error);
    }
  }

  // Convertir VAPID key
  urlBase64ToUint8Array(base64String) {
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

  // S'abonner aux notifications en temps réel
  subscribeToNotifications(userId, callback) {
    const channel = supabase
      .channel('competition-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'competition_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📡 [Push] Nouvelle notification:', payload.new);
          callback(payload.new);
          
          // Afficher notification locale
          this.showLocalNotification(
            payload.new.title,
            payload.new.message,
            { 
              tag: payload.new.type,
              data: payload.new.data 
            }
          );
        }
      )
      .subscribe();

    console.log('🔄 [Push] Abonnement Realtime notifications');
    return channel;
  }
}

export const pushNotificationService = new PushNotificationService();
