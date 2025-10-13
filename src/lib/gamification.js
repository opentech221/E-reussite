// Advanced gamification system for E-Réussite
import { dbHelpers } from './supabaseHelpers';

export class GamificationEngine {
  constructor(userId) {
    this.userId = userId;
    this.levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
    this.streakBonuses = {
      7: 100,   // 1 week
      14: 250,  // 2 weeks
      30: 500,  // 1 month
      60: 1000, // 2 months
      100: 2000 // 100 days
    };
  }

  async calculateUserLevel(points) {
    let level = 1;
    for (let i = 0; i < this.levelThresholds.length; i++) {
      if (points >= this.levelThresholds[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    return level;
  }

  async awardPoints(action, metadata = {}) {
    try {
      const pointsAwarded = this.getPointsForAction(action, metadata);
      
      if (pointsAwarded === 0) return null;

      // Get current user profile
      const profile = await dbHelpers.getUserProfile(this.userId);
      const newPoints = (profile.points || 0) + pointsAwarded;
      const newLevel = await this.calculateUserLevel(newPoints);

      // Update user profile
      await dbHelpers.updateUserProfile(this.userId, {
        points: newPoints,
        level: newLevel
      });

      // Check for new badges
      const newBadges = await this.checkForNewBadges(action, metadata, profile);

      // Check for level up
      const leveledUp = newLevel > (profile.level || 1);

      return {
        pointsAwarded,
        totalPoints: newPoints,
        newLevel,
        leveledUp,
        newBadges,
        action
      };

    } catch (error) {
      console.error('Error awarding points:', error);
      return null;
    }
  }

  getPointsForAction(action, metadata = {}) {
    const pointsMap = {
      // Learning actions
      'lesson_completed': 20,
      'quiz_completed': (metadata.score || 0) >= 80 ? 50 : 30,
      'quiz_perfect': 100, // 100% score
      'course_completed': 200,
      'video_watched': 15,
      'note_taken': 10,
      
      // Study habits
      'daily_login': 5,
      'study_session_30min': 25,
      'study_session_60min': 50,
      'study_session_120min': 100,
      
      // Social and engagement
      'profile_completed': 50,
      'first_quiz': 30,
      'feedback_given': 20,
      'challenge_participated': 40,
      
      // Achievements
      'streak_maintained': this.getStreakBonus(metadata.streakDays || 0),
      'improvement_shown': metadata.improvement * 5, // 5 points per % improvement
      'subject_mastery': 300, // 85%+ average in subject
      
      // Special events
      'monthly_challenge': 500,
      'exam_simulation': 150,
      'peer_help': 25
    };

    return pointsMap[action] || 0;
  }

  getStreakBonus(streakDays) {
    return this.streakBonuses[streakDays] || 0;
  }

  async checkForNewBadges(action, metadata, currentProfile) {
    const newBadges = [];
    
    try {
      // Get all available badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true);

      // Get user's current badges
      const userBadges = await dbHelpers.getUserBadges(this.userId);
      const userBadgeIds = userBadges.map(ub => ub.badge_id);

      for (const badge of allBadges) {
        // Skip if user already has this badge
        if (userBadgeIds.includes(badge.id)) continue;

        // Check if criteria is met
        if (await this.checkBadgeCriteria(badge, action, metadata, currentProfile)) {
          const awardedBadge = await dbHelpers.awardBadge(this.userId, badge.id);
          newBadges.push(awardedBadge);

          // Award bonus points for badge
          if (badge.points_reward > 0) {
            await dbHelpers.updateUserProfile(this.userId, {
              points: (currentProfile.points || 0) + badge.points_reward
            });
          }
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  async checkBadgeCriteria(badge, action, metadata, profile) {
    const criteria = badge.criteria;
    
    if (!criteria) return false;

    switch (badge.name) {
      case 'Premier Pas':
        return criteria.lessons_completed === 1 && action === 'lesson_completed';
        
      case 'Persévérant':
        return criteria.streak_days <= (profile.streak_days || 0);
        
      case 'Mathémagicien':
        return action === 'quiz_completed' && 
               metadata.subject === 'mathematiques' && 
               metadata.score >= criteria.quiz_score;
               
      case 'Explorateur':
        const subjectsStudied = await this.getSubjectsStudiedCount();
        return subjectsStudied >= criteria.subjects_explored;
        
      case 'Maître du Temps':
        return action === 'study_session_120min' || 
               (metadata.duration && metadata.duration >= criteria.session_duration);
               
      case 'Champion BFEM':
        return await this.checkExamMastery('bfem', criteria.average_score);
        
      case 'As du BAC':
        return await this.checkExamMastery('bac', criteria.average_score);
        
      case 'Noctambule':
        return action === 'study_session_30min' && 
               new Date().getHours() >= 22;
               
      case 'Lève-tôt':
        return action === 'study_session_30min' && 
               new Date().getHours() <= 7;
               
      default:
        return false;
    }
  }

  async getSubjectsStudiedCount() {
    try {
      const progress = await dbHelpers.getUserProgress(this.userId);
      const uniqueSubjects = new Set();
      
      progress.forEach(p => {
        if (p.progress_percentage > 0) {
          uniqueSubjects.add(p.courses?.subjects?.id);
        }
      });
      
      return uniqueSubjects.size;
    } catch (error) {
      return 0;
    }
  }

  async checkExamMastery(examLevel, requiredAverage) {
    try {
      // Get quiz attempts for the exam level
      const { data: attempts } = await supabase
        .from('user_quiz_attempts')
        .select(`
          score,
          quizzes (
            courses (
              subjects (class_level)
            )
          )
        `)
        .eq('user_id', this.userId)
        .eq('is_completed', true);

      const relevantAttempts = attempts.filter(attempt => {
        const classLevel = attempt.quizzes?.courses?.subjects?.class_level;
        return (examLevel === 'bfem' && classLevel === '3eme') ||
               (examLevel === 'bac' && classLevel.startsWith('terminale'));
      });

      if (relevantAttempts.length === 0) return false;

      const average = relevantAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / relevantAttempts.length;
      return average >= requiredAverage;
    } catch (error) {
      return false;
    }
  }

  async updateStreak(action) {
    try {
      const profile = await dbHelpers.getUserProfile(this.userId);
      const today = new Date().toDateString();
      const lastActivity = profile.last_activity ? new Date(profile.last_activity).toDateString() : null;
      
      let newStreakDays = profile.streak_days || 0;

      if (lastActivity === today) {
        // Already counted today, no change
        return newStreakDays;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      if (lastActivity === yesterdayString) {
        // Continuing streak
        newStreakDays += 1;
      } else if (lastActivity !== today) {
        // Streak broken or first day
        newStreakDays = 1;
      }

      // Update profile
      await dbHelpers.updateUserProfile(this.userId, {
        streak_days: newStreakDays,
        last_activity: new Date().toISOString()
      });

      // Award streak bonus if applicable
      if (this.streakBonuses[newStreakDays]) {
        await this.awardPoints('streak_maintained', { streakDays: newStreakDays });
      }

      return newStreakDays;
    } catch (error) {
      console.error('Error updating streak:', error);
      return 0;
    }
  }

  async getGamificationStatus() {
    try {
      const profile = await dbHelpers.getUserProfile(this.userId);
      const badges = await dbHelpers.getUserBadges(this.userId);
      const currentLevel = profile.level || 1;
      const currentPoints = profile.points || 0;
      
      const nextLevelThreshold = this.levelThresholds[currentLevel] || this.levelThresholds[this.levelThresholds.length - 1];
      const progressToNextLevel = currentLevel < this.levelThresholds.length 
        ? ((currentPoints - this.levelThresholds[currentLevel - 1]) / (nextLevelThreshold - this.levelThresholds[currentLevel - 1])) * 100
        : 100;

      return {
        level: currentLevel,
        points: currentPoints,
        streakDays: profile.streak_days || 0,
        badges: badges.length,
        progressToNextLevel: Math.min(progressToNextLevel, 100),
        nextLevelPoints: nextLevelThreshold,
        pointsToNextLevel: Math.max(0, nextLevelThreshold - currentPoints),
        recentBadges: badges.slice(0, 3),
        levelTitle: this.getLevelTitle(currentLevel)
      };
    } catch (error) {
      console.error('Error getting gamification status:', error);
      return null;
    }
  }

  getLevelTitle(level) {
    const titles = [
      '', // 0 - not used
      'Apprenti(e)', // 1
      'Étudiant(e)', // 2
      'Passionné(e)', // 3
      'Déterminé(e)', // 4
      'Persévérant(e)', // 5
      'Érudit(e)', // 6
      'Brillant(e)', // 7
      'Expert(e)', // 8
      'Maître', // 9
      'Génie', // 10
      'Légende', // 11
      'Champion Ultime' // 12
    ];
    
    return titles[level] || 'Maître Suprême';
  }

  async createMonthlyChallenge() {
    const challenges = [
      {
        title: '30 Jours de Mathématiques',
        description: 'Complétez un quiz de mathématiques chaque jour pendant 30 jours',
        type: 'daily_completion',
        subject: 'mathematiques',
        duration: 30,
        reward_points: 1000,
        reward_badge: 'Champion des Maths'
      },
      {
        title: 'Marathon de Révision',
        description: 'Étudiez au moins 2 heures pendant 15 jours ce mois',
        type: 'study_time',
        target_hours: 30,
        duration: 30,
        reward_points: 750,
        reward_badge: 'Marathonien'
      },
      {
        title: 'Perfection Académique',
        description: 'Obtenez 90% ou plus à 10 quiz différents',
        type: 'high_scores',
        target_count: 10,
        min_score: 90,
        duration: 30,
        reward_points: 1500,
        reward_badge: 'Perfectionniste'
      }
    ];

    // Return a random challenge for the month
    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  async trackChallengeProgress(challengeId, action, metadata) {
    // This would track progress towards monthly challenges
    // Implementation would depend on challenge type
    try {
      // Get current challenge progress from database
      // Update progress based on action
      // Check if challenge is completed
      // Award rewards if completed
      
      return {
        progress: 0,
        completed: false,
        reward: null
      };
    } catch (error) {
      console.error('Error tracking challenge progress:', error);
      return null;
    }
  }
}

export class LeaderboardManager {
  constructor() {
    this.leaderboardTypes = ['daily', 'weekly', 'monthly', 'all_time'];
  }

  async updateLeaderboards(userId, subjectId, points) {
    try {
      for (const periodType of this.leaderboardTypes) {
        const { period_start, period_end } = this.getPeriodDates(periodType);
        
        await supabase
          .from('leaderboards')
          .upsert({
            user_id: userId,
            subject_id: subjectId,
            points: points,
            period_type: periodType,
            period_start,
            period_end
          });
      }

      // Recalculate ranks
      await this.recalculateRanks();
      
    } catch (error) {
      console.error('Error updating leaderboards:', error);
    }
  }

  getPeriodDates(periodType) {
    const now = new Date();
    let period_start, period_end;

    switch (periodType) {
      case 'daily':
        period_start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        period_end = new Date(period_start);
        period_end.setDate(period_end.getDate() + 1);
        break;
        
      case 'weekly':
        const dayOfWeek = now.getDay();
        period_start = new Date(now);
        period_start.setDate(now.getDate() - dayOfWeek);
        period_start.setHours(0, 0, 0, 0);
        period_end = new Date(period_start);
        period_end.setDate(period_end.getDate() + 7);
        break;
        
      case 'monthly':
        period_start = new Date(now.getFullYear(), now.getMonth(), 1);
        period_end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
        
      case 'all_time':
        period_start = new Date('2024-01-01');
        period_end = new Date('2030-12-31');
        break;
    }

    return {
      period_start: period_start.toISOString().split('T')[0],
      period_end: period_end.toISOString().split('T')[0]
    };
  }

  async recalculateRanks() {
    try {
      for (const periodType of this.leaderboardTypes) {
        const { data: leaderboard } = await supabase
          .from('leaderboards')
          .select('*')
          .eq('period_type', periodType)
          .order('points', { ascending: false });

        for (let i = 0; i < leaderboard.length; i++) {
          await supabase
            .from('leaderboards')
            .update({ rank: i + 1 })
            .eq('id', leaderboard[i].id);
        }
      }
    } catch (error) {
      console.error('Error recalculating ranks:', error);
    }
  }

  async getTopPerformers(subjectId = null, periodType = 'weekly', limit = 10) {
    try {
      return await dbHelpers.getLeaderboard(subjectId, periodType, limit);
    } catch (error) {
      console.error('Error getting top performers:', error);
      return [];
    }
  }
}