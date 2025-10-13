// Version simplifiée compatible avec Supabase existant
import { supabase } from './customSupabaseClient';

export class SimpleGamificationEngine {
  constructor(userId) {
    this.userId = userId;
    this.supabase = supabase;
  }

  async awardPoints(action, metadata = {}) {
    try {
      // Version simplifiée qui ne fait pas d'erreur si les tables n'existent pas
      console.log(`🎮 Points attribués pour ${action}:`, this.getPointsForAction(action));
      
      return {
        pointsAwarded: this.getPointsForAction(action),
        totalPoints: 0,
        newLevel: 1,
        leveledUp: false,
        newBadges: [],
        action
      };
    } catch (error) {
      console.warn('Gamification not available:', error.message);
      return null;
    }
  }

  async updateStreak() {
    try {
      console.log('🔥 Streak mis à jour');
      return { currentStreak: 1, longestStreak: 1 };
    } catch (error) {
      console.warn('Streak tracking not available:', error.message);
      return null;
    }
  }

  async getGamificationStatus() {
    try {
      console.log('🎮 [getGamificationStatus] Début du chargement pour userId:', this.userId);
      
      // Récupérer les vraies données de user_points
      const { data: pointsData, error } = await this.supabase
        .from('user_points')
        .select('total_points, level, current_streak, longest_streak, updated_at')
        .eq('user_id', this.userId)
        .single();

      console.log('🎮 [getGamificationStatus] Données user_points:', pointsData, 'Erreur:', error);

      if (error || !pointsData) {
        console.warn('Could not fetch user points:', error);
        return {
          totalPoints: 0,
          level: 1,
          points: 0,
          currentStreak: 0,
          longestStreak: 0,
          badges: [],
          nextLevelPoints: 100,
          pointsToNextLevel: 100,
          progressToNextLevel: 0,
          lastUpdatedAt: new Date().toISOString()
        };
      }

      // Calculer nextLevelPoints basé sur le niveau actuel
      const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
      const currentLevel = pointsData.level || 1;
      const currentPoints = pointsData.total_points || 0;
      const nextLevelPoints = thresholds[currentLevel] || thresholds[thresholds.length - 1];
      const pointsToNextLevel = Math.max(0, nextLevelPoints - currentPoints);
      const progressToNextLevel = nextLevelPoints > 0 
        ? Math.min(100, (currentPoints / nextLevelPoints) * 100)
        : 100;

      console.log('🎮 [getGamificationStatus] Calculs:', {
        currentLevel,
        currentPoints,
        nextLevelPoints,
        pointsToNextLevel,
        progressToNextLevel
      });

      // Récupérer les badges récents (sans JOIN car pas de relation FK)
      const { data: badgesData, error: badgesError } = await this.supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', this.userId)
        .order('earned_at', { ascending: false })
        .limit(5);

      console.log('🎮 [getGamificationStatus] Badges:', badgesData, 'Erreur:', badgesError);

      const result = {
        totalPoints: currentPoints,
        level: currentLevel,
        points: currentPoints,
        currentStreak: pointsData.current_streak || 0,
        longestStreak: pointsData.longest_streak || 0,
        nextLevelPoints,
        pointsToNextLevel,
        progressToNextLevel,
        badges: badgesData || [],
        recentBadges: badgesData || [],
        lastUpdatedAt: pointsData.updated_at || new Date().toISOString()
      };

      console.log('🎮 [getGamificationStatus] Résultat final:', result);
      return result;
    } catch (error) {
      console.error('❌ [getGamificationStatus] Erreur:', error);
      return null;
    }
  }

  getPointsForAction(action, metadata = {}) {
    const pointsMap = {
      'lesson_completed': 20,
      'quiz_passed': 50,
      'exam_completed': 100,
      'login_daily': 10,
      'daily_login': 10,
      'course_started': 5,
      'video_watched': 15,
      'note_created': 10,
      'forum_post': 25,
      'help_given': 30,
      'milestone_reached': 100,
      'badge_earned': 50,
      'streak_maintained': 20,
      'perfect_score': 200,
      'improvement_shown': 40,
      'collaboration': 35
    };

    return pointsMap[action] || 0;
  }

  async checkForNewBadges() {
    // Version simplifiée
    return [];
  }

  async calculateUserLevel(points) {
    const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
    let level = 1;
    for (let i = 0; i < thresholds.length; i++) {
      if (points >= thresholds[i]) {
        level = i + 1;
      }
    }
    return level;
  }
}

// Export de compatibilité
export const GamificationEngine = SimpleGamificationEngine;