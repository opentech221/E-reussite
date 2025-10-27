// =============================================
// SERVICE DE NOTIFICATIONS PUSH
// Gère les notifications Web Push (0€)
// =============================================

import { supabase } from './supabaseClient';

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.registration = null;
  }

  // ====================================
  // 1. DEMANDER LA PERMISSION
  // ====================================
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('❌ [Notifications] Non supportées par ce navigateur');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ [Notifications] Permission refusée');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ [Notifications] Permission accordée');
        return true;
      } else {
        console.log('❌ [Notifications] Permission refusée');
        return false;
      }
    } catch (error) {
      console.error('❌ [Notifications] Erreur lors de la demande:', error);
      return false;
    }
  }

  // ====================================
  // 2. ENREGISTRER LE SERVICE WORKER
  // ====================================
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ [Notifications] Service Worker non supporté');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      console.log('✅ [Notifications] Service Worker prêt');
      return true;
    } catch (error) {
      console.error('❌ [Notifications] Erreur Service Worker:', error);
      return false;
    }
  }

  // ====================================
  // 3. AFFICHER UNE NOTIFICATION
  // ====================================
  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.log('⚠️ [Notifications] Permission non accordée');
      return false;
    }

    try {
      if (this.registration) {
        // Notification via Service Worker (persiste en arrière-plan)
        await this.registration.showNotification(title, {
          badge: '/icon-badge.png',
          icon: '/icon-192x192.png',
          vibrate: [200, 100, 200],
          requireInteraction: false,
          ...options
        });
      } else {
        // Notification simple (seulement si page ouverte)
        new Notification(title, options);
      }
      
      console.log('✅ [Notifications] Affichée:', title);
      return true;
    } catch (error) {
      console.error('❌ [Notifications] Erreur affichage:', error);
      return false;
    }
  }

  // ====================================
  // 4. NOTIFICATIONS SPÉCIFIQUES
  // ====================================

  // Compétition commence bientôt
  async notifyCompetitionStarting(competition) {
    return this.showNotification(
      '🏆 Compétition bientôt disponible !',
      {
        body: `"${competition.title}" commence dans 1 heure. Prépare-toi !`,
        tag: `competition-starting-${competition.id}`,
        data: { 
          type: 'competition_starting', 
          competitionId: competition.id 
        },
        actions: [
          { action: 'view', title: '👀 Voir la compétition' },
          { action: 'dismiss', title: '✖️ Ignorer' }
        ]
      }
    );
  }

  // Nouveau classement disponible
  async notifyNewLeaderboard(competition, rank) {
    const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏆';
    
    return this.showNotification(
      `${emoji} Nouveau classement disponible !`,
      {
        body: `Tu es ${rank}${rank === 1 ? 'er' : 'ème'} dans "${competition.title}" !`,
        tag: `leaderboard-${competition.id}`,
        data: { 
          type: 'new_leaderboard', 
          competitionId: competition.id,
          rank 
        },
        actions: [
          { action: 'view', title: '📊 Voir le classement' },
          { action: 'dismiss', title: '✖️ Fermer' }
        ]
      }
    );
  }

  // Nouveau record personnel
  async notifyPersonalBest(score, previousBest) {
    return this.showNotification(
      '🎉 Nouveau record personnel !',
      {
        body: `Score de ${score} points (ancien: ${previousBest}). Continue comme ça !`,
        tag: 'personal-best',
        data: { 
          type: 'personal_best', 
          score, 
          previousBest 
        },
        actions: [
          { action: 'share', title: '📱 Partager' },
          { action: 'dismiss', title: '✖️ Fermer' }
        ]
      }
    );
  }

  // Nouvelle compétition disponible
  async notifyNewCompetition(competition) {
    return this.showNotification(
      '🆕 Nouvelle compétition disponible !',
      {
        body: `"${competition.title}" - ${competition.reward_points} points à gagner !`,
        tag: `new-competition-${competition.id}`,
        data: { 
          type: 'new_competition', 
          competitionId: competition.id 
        },
        actions: [
          { action: 'join', title: '✅ S\'inscrire' },
          { action: 'view', title: '👀 Voir' }
        ]
      }
    );
  }

  // Badge débloqué
  async notifyBadgeUnlocked(badge) {
    return this.showNotification(
      '🏅 Nouveau badge débloqué !',
      {
        body: `"${badge.title}" - ${badge.description}`,
        tag: `badge-${badge.id}`,
        data: { 
          type: 'badge_unlocked', 
          badgeId: badge.id 
        },
        icon: badge.icon_url || '/icon-192x192.png',
        actions: [
          { action: 'view', title: '🏆 Voir mes badges' },
          { action: 'share', title: '📱 Partager' }
        ]
      }
    );
  }

  // Rappel quotidien
  async notifyDailyReminder() {
    return this.showNotification(
      '📚 C\'est l\'heure de réviser !',
      {
        body: 'Participe à une compétition pour maintenir ta série de jours actifs.',
        tag: 'daily-reminder',
        data: { type: 'daily_reminder' },
        actions: [
          { action: 'view', title: '🏆 Voir les compétitions' },
          { action: 'dismiss', title: '✖️ Plus tard' }
        ]
      }
    );
  }

  // ====================================
  // 5. SAUVEGARDER LA PRÉFÉRENCE
  // ====================================
  async savePreference(userId, enabled) {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          notifications_enabled: enabled,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log('✅ [Notifications] Préférence sauvegardée:', enabled);
      return true;
    } catch (error) {
      console.error('❌ [Notifications] Erreur sauvegarde préférence:', error);
      return false;
    }
  }

  // ====================================
  // 6. PLANIFIER DES NOTIFICATIONS
  // ====================================
  async scheduleCompetitionReminders(competitions) {
    const now = new Date();
    
    for (const competition of competitions) {
      const startTime = new Date(competition.start_date);
      const timeUntilStart = startTime - now;
      const oneHour = 60 * 60 * 1000;

      // Notification 1h avant le début
      if (timeUntilStart > 0 && timeUntilStart <= oneHour * 24) {
        const reminderTime = timeUntilStart - oneHour;
        
        if (reminderTime > 0) {
          setTimeout(() => {
            this.notifyCompetitionStarting(competition);
          }, reminderTime);
          
          console.log(`⏰ [Notifications] Rappel planifié pour "${competition.title}" dans ${Math.round(reminderTime / 60000)} min`);
        }
      }
    }
  }

  // ====================================
  // 7. GÉRER LES CLICS SUR NOTIFICATIONS
  // ====================================
  setupNotificationClickHandler() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'notification-click') {
        const { action, data } = event.data;
        
        console.log('🔔 [Notifications] Clic:', action, data);
        
        // Rediriger selon l'action
        if (action === 'view' && data.competitionId) {
          window.location.href = `/competitions/${data.competitionId}`;
        } else if (action === 'join' && data.competitionId) {
          window.location.href = `/competitions/${data.competitionId}`;
        } else if (action === 'share') {
          // Ouvrir le dialogue de partage
          this.shareResult(data);
        }
      }
    });
  }

  // ====================================
  // 8. PARTAGE DE RÉSULTATS
  // ====================================
  async shareResult(data) {
    const shareData = {
      title: '🏆 Mon résultat E-Réussite',
      text: `J'ai terminé ${data.rank}${data.rank === 1 ? 'er' : 'ème'} avec ${data.score} points !`,
      url: window.location.origin + '/competitions'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('✅ [Notifications] Résultat partagé');
      } catch (error) {
        console.log('ℹ️ [Notifications] Partage annulé ou échoué');
      }
    } else {
      // Fallback: copier dans le presse-papiers
      const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      await navigator.clipboard.writeText(text);
      console.log('✅ [Notifications] Texte copié dans le presse-papiers');
    }
  }

  // ====================================
  // 9. INITIALISATION COMPLÈTE
  // ====================================
  async initialize(userId) {
    console.log('🔔 [Notifications] Initialisation...');

    // 1. Enregistrer le Service Worker
    await this.registerServiceWorker();

    // 2. Demander la permission
    const permitted = await this.requestPermission();

    // 3. Sauvegarder la préférence
    if (permitted && userId) {
      await this.savePreference(userId, true);
    }

    // 4. Configurer les gestionnaires d'événements
    this.setupNotificationClickHandler();

    console.log('✅ [Notifications] Service initialisé');
    return permitted;
  }
}

// Export singleton
export const notificationService = new NotificationService();
export default notificationService;
