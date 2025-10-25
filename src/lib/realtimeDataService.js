import { supabase } from './customSupabaseClient';

/**
 * 🔥 Service de Collecte de Données en Temps Réel pour Coach IA
 * Accès complet à toutes les fonctionnalités et données de la plateforme
 */
class RealtimeDataService {
  /**
   * Récupère TOUTES les données utilisateur en temps réel
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Données complètes de l'utilisateur
   */
  async getUserCompleteData(userId) {
    if (!userId) {
      console.warn('⚠️ [RealtimeData] userId manquant');
      return this.getEmptyData();
    }

    console.log('🔄 [RealtimeData] Récupération données complètes pour:', userId);

    try {
      // Exécuter toutes les requêtes en parallèle pour optimiser
      const [
        profileData,
        pointsData,
        badgesData,
        progressData,
        orientationData,
        studyPlanData,
        analyticsData,
        socialData,
        sharedLinksData,
        subscriptionData,
        activityHistoryData
      ] = await Promise.all([
        this.getProfileData(userId),
        this.getPointsData(userId),
        this.getBadgesData(userId),
        this.getProgressData(userId),
        this.getOrientationData(userId),
        this.getStudyPlanData(userId),
        this.getAnalyticsData(userId),
        this.getSocialData(userId),
        this.getSharedLinksData(userId),
        this.getSubscriptionData(userId),
        this.getActivityHistory(userId)
      ]);

      const completeData = {
        // 1. Profil utilisateur
        profile: profileData,
        
        // 2. Système de points et gamification
        gamification: {
          points: pointsData.total_points,
          level: pointsData.level,
          currentStreak: pointsData.current_streak,
          longestStreak: pointsData.longest_streak,
          lastActivityDate: pointsData.last_activity_date,
          badges: badgesData,
          totalBadges: badgesData.length,
          rank: profileData.rank
        },

        // 3. Progression académique
        progress: {
          completedChapters: progressData.chapters,
          totalChapters: progressData.total,
          completionRate: progressData.completionRate,
          totalTimeSpent: progressData.totalTimeSpent,
          averageProgress: progressData.averageProgress,
          bySubject: progressData.bySubject
        },

        // 4. Orientation professionnelle
        orientation: {
          hasCompletedTest: orientationData.hasCompleted,
          testDate: orientationData.testDate,
          topCareers: orientationData.careers,
          topCareer: orientationData.careers[0] || null,
          compatibilityScore: orientationData.careers[0]?.compatibility_score || 0
        },

        // 5. Plan d'étude
        studyPlan: {
          hasActivePlan: studyPlanData.hasActive,
          totalTasks: studyPlanData.totalTasks,
          completedTasks: studyPlanData.completedTasks,
          upcomingTasks: studyPlanData.upcomingTasks,
          overdueTasks: studyPlanData.overdueTasks,
          todayTasks: studyPlanData.todayTasks
        },

        // 6. Analytiques avancées
        analytics: {
          weakSubjects: analyticsData.weakSubjects,
          strongSubjects: analyticsData.strongSubjects,
          studyTimeBySubject: analyticsData.timeBySubject,
          progressTrend: analyticsData.trend,
          lastWeekActivity: analyticsData.lastWeekActivity
        },

        // 7. Réseau social
        social: {
          friendsCount: socialData.friendsCount,
          followersCount: socialData.followersCount,
          followingCount: socialData.followingCount,
          postsCount: socialData.postsCount,
          likesReceived: socialData.likesReceived
        },

        // 8. Liens partagés
        sharedLinks: {
          totalLinks: sharedLinksData.total,
          activeLinks: sharedLinksData.active,
          clicks: sharedLinksData.totalClicks,
          conversions: sharedLinksData.conversions
        },

        // 9. Abonnement
        subscription: {
          status: subscriptionData.status,
          planName: subscriptionData.planName,
          startDate: subscriptionData.startDate,
          endDate: subscriptionData.endDate,
          daysRemaining: subscriptionData.daysRemaining,
          isActive: subscriptionData.isActive,
          isTrial: subscriptionData.isTrial
        },

        // 10. Historique d'activités (dernières 10)
        recentActivity: activityHistoryData.slice(0, 10),

        // Métadonnées
        lastUpdate: new Date().toISOString(),
        dataVersion: '2.0'
      };

      console.log('✅ [RealtimeData] Données complètes récupérées:', {
        badges: completeData.gamification.totalBadges,
        chapters: completeData.progress.completedChapters,
        orientation: completeData.orientation.hasCompletedTest,
        studyPlan: completeData.studyPlan.totalTasks,
        subscription: completeData.subscription.status
      });

      return completeData;
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur récupération données:', error);
      return this.getEmptyData();
    }
  }

  /**
   * Récupère les données du profil utilisateur
   */
  async getProfileData(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data || {};
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur profil:', error);
      return {};
    }
  }

  /**
   * Récupère les points et niveau
   */
  async getPointsData(userId) {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data || { total_points: 0, level: 1, current_streak: 0, longest_streak: 0 };
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur points:', error);
      return { total_points: 0, level: 1, current_streak: 0, longest_streak: 0 };
    }
  }

  /**
   * Récupère les badges débloqués
   */
  async getBadgesData(userId) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur badges:', error);
      return [];
    }
  }

  /**
   * Récupère la progression des chapitres
   */
  async getProgressData(userId) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          chapitres (
            id,
            title,
            matiere_id,
            matieres (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const chapters = data || [];
      const completedChapters = chapters.filter(c => c.completed).length;
      const totalChapters = chapters.length;
      const totalTimeSpent = chapters.reduce((sum, c) => sum + (c.time_spent || 0), 0);
      const averageProgress = chapters.length > 0 
        ? chapters.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / chapters.length 
        : 0;

      // Progression par matière
      const bySubject = {};
      chapters.forEach(c => {
        const subjectName = c.chapitres?.matieres?.name || 'Autre';
        if (!bySubject[subjectName]) {
          bySubject[subjectName] = {
            total: 0,
            completed: 0,
            timeSpent: 0,
            averageProgress: 0
          };
        }
        bySubject[subjectName].total++;
        if (c.completed) bySubject[subjectName].completed++;
        bySubject[subjectName].timeSpent += c.time_spent || 0;
        bySubject[subjectName].averageProgress += c.progress_percentage || 0;
      });

      // Calculer les moyennes par matière
      Object.keys(bySubject).forEach(subject => {
        const data = bySubject[subject];
        data.averageProgress = data.total > 0 ? data.averageProgress / data.total : 0;
      });

      return {
        chapters: completedChapters,
        total: totalChapters,
        completionRate: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
        totalTimeSpent: Math.round(totalTimeSpent / 60), // en minutes
        averageProgress: Math.round(averageProgress),
        bySubject
      };
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur progression:', error);
      return {
        chapters: 0,
        total: 0,
        completionRate: 0,
        totalTimeSpent: 0,
        averageProgress: 0,
        bySubject: {}
      };
    }
  }

  /**
   * Récupère les résultats du test d'orientation
   */
  async getOrientationData(userId) {
    try {
      const { data, error } = await supabase
        .from('user_orientation_results')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      if (!data) {
        return {
          hasCompleted: false,
          testDate: null,
          careers: []
        };
      }

      return {
        hasCompleted: true,
        testDate: data.completed_at,
        careers: data.preferred_careers || []
      };
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur orientation:', error);
      return {
        hasCompleted: false,
        testDate: null,
        careers: []
      };
    }
  }

  /**
   * Récupère le plan d'étude
   */
  async getStudyPlanData(userId) {
    try {
      const { data, error } = await supabase
        .from('study_plan_tasks')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const tasks = data || [];
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      return {
        hasActive: tasks.length > 0,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        upcomingTasks: tasks.filter(t => !t.completed && new Date(t.due_date) > now).length,
        overdueTasks: tasks.filter(t => !t.completed && new Date(t.due_date) < now).length,
        todayTasks: tasks.filter(t => !t.completed && t.due_date?.split('T')[0] === today).length
      };
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur plan d\'étude:', error);
      return {
        hasActive: false,
        totalTasks: 0,
        completedTasks: 0,
        upcomingTasks: 0,
        overdueTasks: 0,
        todayTasks: 0
      };
    }
  }

  /**
   * Récupère les analytiques avancées
   */
  async getAnalyticsData(userId) {
    try {
      // Récupérer les données de progression avec détails
      const { data: progressData, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          chapitres (
            matieres (
              name
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const chapters = progressData || [];

      // Calculer les matières fortes et faibles
      const subjectStats = {};
      chapters.forEach(c => {
        const subject = c.chapitres?.matieres?.name || 'Autre';
        if (!subjectStats[subject]) {
          subjectStats[subject] = {
            totalProgress: 0,
            count: 0,
            timeSpent: 0
          };
        }
        subjectStats[subject].totalProgress += c.progress_percentage || 0;
        subjectStats[subject].count++;
        subjectStats[subject].timeSpent += c.time_spent || 0;
      });

      const subjects = Object.entries(subjectStats).map(([name, stats]) => ({
        name,
        averageProgress: stats.count > 0 ? stats.totalProgress / stats.count : 0,
        timeSpent: Math.round(stats.timeSpent / 60) // en minutes
      }));

      const strongSubjects = subjects
        .filter(s => s.averageProgress >= 70)
        .sort((a, b) => b.averageProgress - a.averageProgress);

      const weakSubjects = subjects
        .filter(s => s.averageProgress < 50)
        .sort((a, b) => a.averageProgress - b.averageProgress);

      // Activité des 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivity = chapters.filter(c => 
        new Date(c.updated_at) >= sevenDaysAgo
      ).length;

      return {
        weakSubjects: weakSubjects.map(s => s.name),
        strongSubjects: strongSubjects.map(s => s.name),
        timeBySubject: subjects.reduce((acc, s) => {
          acc[s.name] = s.timeSpent;
          return acc;
        }, {}),
        trend: recentActivity > 5 ? 'croissance' : recentActivity > 2 ? 'stable' : 'déclin',
        lastWeekActivity: recentActivity
      };
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur analytiques:', error);
      return {
        weakSubjects: [],
        strongSubjects: [],
        timeBySubject: {},
        trend: 'inconnu',
        lastWeekActivity: 0
      };
    }
  }

  /**
   * Récupère les données sociales
   */
  async getSocialData(userId) {
    try {
      // Note: Ces tables peuvent ne pas exister encore
      // Retourner des valeurs par défaut pour l'instant
      return {
        friendsCount: 0,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        likesReceived: 0
      };
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur social:', error);
      return {
        friendsCount: 0,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        likesReceived: 0
      };
    }
  }

  /**
   * Récupère les liens partagés
   */
  async getSharedLinksData(userId) {
    try {
      const { data, error } = await supabase
        .from('shared_links')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const links = data || [];
      const activeLinks = links.filter(l => l.is_active).length;
      const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
      const conversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0);

      return {
        total: links.length,
        active: activeLinks,
        totalClicks,
        conversions
      };
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur liens partagés:', error);
      return {
        total: 0,
        active: 0,
        totalClicks: 0,
        conversions: 0
      };
    }
  }

  /**
   * Récupère les informations d'abonnement
   */
  async getSubscriptionData(userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return {
          status: 'none',
          planName: 'Aucun',
          startDate: null,
          endDate: null,
          daysRemaining: 0,
          isActive: false,
          isTrial: false
        };
      }

      const now = new Date();
      const endDate = new Date(data.end_date);
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      return {
        status: data.status,
        planName: data.plan_name || 'Premium',
        startDate: data.start_date,
        endDate: data.end_date,
        daysRemaining: Math.max(0, daysRemaining),
        isActive: data.status === 'active',
        isTrial: data.status === 'trial'
      };
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur abonnement:', error);
      return {
        status: 'none',
        planName: 'Aucun',
        startDate: null,
        endDate: null,
        daysRemaining: 0,
        isActive: false,
        isTrial: false
      };
    }
  }

  /**
   * Récupère l'historique d'activités
   */
  async getActivityHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('activity_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ [RealtimeData] Erreur historique:', error);
      return [];
    }
  }

  /**
   * Retourne une structure de données vide
   */
  getEmptyData() {
    return {
      profile: {},
      gamification: {
        points: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        totalBadges: 0,
        rank: null
      },
      progress: {
        completedChapters: 0,
        totalChapters: 0,
        completionRate: 0,
        totalTimeSpent: 0,
        averageProgress: 0,
        bySubject: {}
      },
      orientation: {
        hasCompletedTest: false,
        testDate: null,
        topCareers: [],
        topCareer: null,
        compatibilityScore: 0
      },
      studyPlan: {
        hasActivePlan: false,
        totalTasks: 0,
        completedTasks: 0,
        upcomingTasks: 0,
        overdueTasks: 0,
        todayTasks: 0
      },
      analytics: {
        weakSubjects: [],
        strongSubjects: [],
        studyTimeBySubject: {},
        progressTrend: 'inconnu',
        lastWeekActivity: 0
      },
      social: {
        friendsCount: 0,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        likesReceived: 0
      },
      sharedLinks: {
        totalLinks: 0,
        activeLinks: 0,
        clicks: 0,
        conversions: 0
      },
      subscription: {
        status: 'none',
        planName: 'Aucun',
        startDate: null,
        endDate: null,
        daysRemaining: 0,
        isActive: false,
        isTrial: false
      },
      recentActivity: [],
      lastUpdate: new Date().toISOString(),
      dataVersion: '2.0'
    };
  }

  /**
   * Génère un résumé textuel des données pour le prompt IA
   */
  generateContextSummary(data) {
    const summary = [];

    // Profil
    summary.push(`**PROFIL UTILISATEUR**`);
    summary.push(`- Nom : ${data.profile.full_name || 'Non défini'}`);
    summary.push(`- Classe : ${data.profile.classe || 'Non définie'}`);
    summary.push(`- Niveau scolaire : ${data.profile.level || 'Non défini'}`);
    summary.push(``);

    // Gamification
    summary.push(`**GAMIFICATION**`);
    summary.push(`- Niveau : ${data.gamification.level}`);
    summary.push(`- Points totaux : ${data.gamification.points}`);
    summary.push(`- Série actuelle : ${data.gamification.currentStreak} jours 🔥`);
    summary.push(`- Série maximale : ${data.gamification.longestStreak} jours`);
    summary.push(`- Badges débloqués : ${data.gamification.totalBadges}`);
    if (data.gamification.badges.length > 0) {
      const recentBadges = data.gamification.badges.slice(0, 3).map(b => b.badge_name).join(', ');
      summary.push(`- Derniers badges : ${recentBadges}`);
    }
    summary.push(``);

    // Progression
    summary.push(`**PROGRESSION ACADÉMIQUE**`);
    summary.push(`- Chapitres complétés : ${data.progress.completedChapters}/${data.progress.totalChapters} (${data.progress.completionRate}%)`);
    summary.push(`- Temps d'étude total : ${data.progress.totalTimeSpent} minutes`);
    summary.push(`- Progression moyenne : ${data.progress.averageProgress}%`);
    if (Object.keys(data.progress.bySubject).length > 0) {
      summary.push(`- Par matière :`);
      Object.entries(data.progress.bySubject).forEach(([subject, stats]) => {
        summary.push(`  • ${subject} : ${stats.completed}/${stats.total} chapitres (${Math.round(stats.averageProgress)}%)`);
      });
    }
    summary.push(``);

    // Orientation
    if (data.orientation.hasCompletedTest) {
      summary.push(`**ORIENTATION PROFESSIONNELLE**`);
      summary.push(`- Test complété : Oui (${new Date(data.orientation.testDate).toLocaleDateString('fr-FR')})`);
      if (data.orientation.topCareer) {
        summary.push(`- Métier principal : ${data.orientation.topCareer.title} (${data.orientation.topCareer.compatibility_score}% de compatibilité)`);
      }
      if (data.orientation.topCareers.length > 1) {
        const otherCareers = data.orientation.topCareers.slice(1, 3).map(c => c.title).join(', ');
        summary.push(`- Autres métiers : ${otherCareers}`);
      }
      summary.push(``);
    }

    // Plan d'étude
    if (data.studyPlan.hasActivePlan) {
      summary.push(`**PLAN D'ÉTUDE**`);
      summary.push(`- Tâches totales : ${data.studyPlan.totalTasks}`);
      summary.push(`- Tâches complétées : ${data.studyPlan.completedTasks}`);
      summary.push(`- Tâches pour aujourd'hui : ${data.studyPlan.todayTasks}`);
      summary.push(`- Tâches à venir : ${data.studyPlan.upcomingTasks}`);
      if (data.studyPlan.overdueTasks > 0) {
        summary.push(`- ⚠️ Tâches en retard : ${data.studyPlan.overdueTasks}`);
      }
      summary.push(``);
    }

    // Analytiques
    if (data.analytics.strongSubjects.length > 0 || data.analytics.weakSubjects.length > 0) {
      summary.push(`**ANALYTIQUES**`);
      if (data.analytics.strongSubjects.length > 0) {
        summary.push(`- ✅ Matières fortes : ${data.analytics.strongSubjects.join(', ')}`);
      }
      if (data.analytics.weakSubjects.length > 0) {
        summary.push(`- ⚠️ Matières à renforcer : ${data.analytics.weakSubjects.join(', ')}`);
      }
      summary.push(`- Tendance : ${data.analytics.trend}`);
      summary.push(`- Activité (7 derniers jours) : ${data.analytics.lastWeekActivity} chapitres`);
      summary.push(``);
    }

    // Abonnement
    summary.push(`**ABONNEMENT**`);
    summary.push(`- Statut : ${data.subscription.status === 'active' ? 'Actif' : data.subscription.status === 'trial' ? 'Essai gratuit' : 'Aucun'}`);
    if (data.subscription.isActive || data.subscription.isTrial) {
      summary.push(`- Plan : ${data.subscription.planName}`);
      summary.push(`- Jours restants : ${data.subscription.daysRemaining}`);
    }
    summary.push(``);

    // Liens partagés
    if (data.sharedLinks.totalLinks > 0) {
      summary.push(`**LIENS PARTAGÉS**`);
      summary.push(`- Total : ${data.sharedLinks.totalLinks}`);
      summary.push(`- Clics : ${data.sharedLinks.clicks}`);
      summary.push(`- Conversions : ${data.sharedLinks.conversions}`);
      summary.push(``);
    }

    return summary.join('\n');
  }
}

// Export singleton
export const realtimeDataService = new RealtimeDataService();
export default realtimeDataService;
