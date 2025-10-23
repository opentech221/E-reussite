import { supabase } from './customSupabaseClient';

// Helper functions for database operations
export const dbHelpers = {
  // User Profile Management
  async createUserProfile(user, additionalData = {}) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        ...additionalData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Course and Progress Management
  async getCoursesByLevel(classLevel) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        subjects (
          name,
          slug,
          icon_name,
          coefficient
        )
      `)
      .eq('subjects.class_level', classLevel)
      .eq('is_published', true)
      .order('chapter_number');
    
    if (error) throw error;
    return data;
  },

  async getUserProgress(userId, courseId = null) {
    try {
      let query = supabase
        .from('user_progression')
        .select(`
          *,
          courses (
            title,
            subjects (name, icon_name)
          )
        `)
        .eq('user_id', userId);

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query.order('last_accessed', { ascending: false });
      
      if (error) {
        console.warn('User progress not available:', error.message);
        return [];
      }
      return data;
    } catch (error) {
      console.warn('Progress feature not available:', error.message);
      return [];
    }
  },

  async updateProgress(userId, courseId, progressData) {
    try {
      const { data, error } = await supabase
        .from('user_progression')
        .upsert({
          user_id: userId,
          course_id: courseId,
          ...progressData,
          last_accessed: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.warn('Update progress not available:', error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('Progress update feature not available:', error.message);
      return null;
    }
  },

  // Quiz and Assessment
  async getQuizzesBySubject(subjectId, difficulty = null) {
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('courses.subject_id', subjectId);

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }

    const { data, error } = await query.order('difficulty_level');
    
    if (error) throw error;
    return data;
  },

  async getQuizQuestions(quizId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  },

  async saveQuizAttempt(userId, quizId, attemptData) {
    const { data, error } = await supabase
      .from('user_quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        ...attemptData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Learning Analytics and AI
  async getLearningAnalytics(userId) {
    const { data, error } = await supabase
      .from('learning_analytics')
      .select(`
        *,
        subjects (name, icon_name)
      `)
      .eq('user_id', userId)
      .order('last_analysis', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateLearningAnalytics(userId, subjectId, analyticsData) {
    const { data, error } = await supabase
      .from('learning_analytics')
      .upsert({
        user_id: userId,
        subject_id: subjectId,
        ...analyticsData,
        last_analysis: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Leaderboard
  async getLeaderboard(subjectId = null, periodType = 'weekly') {
    let query = supabase
      .from('leaderboards')
      .select(`
        *,
        profiles (full_name),
        subjects (name, icon_name)
      `)
      .eq('period_type', periodType)
      .order('rank');

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query.limit(100);
    
    if (error) throw error;
    return data;
  },

  // Exam Papers (Annales)
  async getExamPapers(examType = null, year = null, subjectId = null) {
    let query = supabase
      .from('exam_papers')
      .select(`
        *,
        subjects (name, icon_name)
      `)
      .order('year', { ascending: false });

    if (examType) query = query.eq('exam_type', examType);
    if (year) query = query.eq('year', year);
    if (subjectId) query = query.eq('subject_id', subjectId);

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async incrementDownloadCount(examPaperId) {
    const { data, error } = await supabase
      .rpc('increment_download_count', { exam_paper_id: examPaperId });
    
    if (error) throw error;
    return data;
  },

  // AI Conversations
  async saveConversation(userId, question, context = {}) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        question,
        context
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateConversationAnswer(conversationId, answer) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .update({ answer })
      .eq('id', conversationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Study Sessions
  async createStudySession(userId, subjectId, sessionData) {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        ...sessionData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserStudyStats(userId, period = 'week') {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select(`
          *,
          subjects (name, icon_name)
        `)
        .eq('user_id', userId)
        .gte('session_date', new Date(Date.now() - (period === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString())
        .order('session_date', { ascending: false });
      
      if (error) {
        console.warn('Study sessions not available:', error.message);
        return [];
      }
      return data;
    } catch (error) {
      console.warn('Study stats feature not available:', error.message);
      return [];
    }
  },

  // Notifications
  async getUserNotifications(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('Notifications table not available:', error.message);
        return []; // Retourner un tableau vide si la table n'existe pas
      }
      return data;
    } catch (error) {
      console.warn('Notifications feature not available:', error.message);
      return [];
    }
  },

  async markNotificationAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();
      
      if (error) {
        console.warn('Notifications table not available:', error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('Mark notification read not available:', error.message);
      return null;
    }
  },

  // Subjects
  async getSubjectsByLevel(classLevel) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('class_level', classLevel)
      .eq('is_active', true)
      .order('coefficient', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // ============================================================================
  // Gamification System - Points, Levels, Badges
  // ============================================================================

  /**
   * Get user points and level information
   */
  async getUserPoints(userId) {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.warn('User points not found:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Award points to a user (automatically updates level via trigger)
   */
  async awardPoints(userId, points, source = 'quiz_completion', actionDetails = {}) {
    try {
      // Get current points
      const { data: currentData } = await supabase
        .from('user_points')
        .select('total_points, quizzes_completed, lessons_completed, level')
        .eq('user_id', userId)
        .single();

      const previousPoints = currentData?.total_points || 0;
      const previousLevel = currentData?.level || 1;

      if (!currentData) {
        // Initialize user_points if not exists
        const { error: initError } = await supabase
          .from('user_points')
          .insert({
            user_id: userId,
            total_points: points,
            level: 1,
            points_to_next_level: 100 - points,
            quizzes_completed: source === 'quiz_completion' ? 1 : 0,
            lessons_completed: source === 'lesson_completion' ? 1 : 0,
            last_activity_date: new Date().toISOString().split('T')[0]
          });

        if (initError) throw initError;
        
        // Log in history
        await supabase.from('user_points_history').insert({
          user_id: userId,
          points_earned: points,
          action_type: source,
          action_details: actionDetails
        });
        
        return { 
          success: true, 
          new_points: points,
          previous_points: 0,
          previous_level: 1
        };
      }

      // Update points
      const newTotalPoints = currentData.total_points + points;
      const updates = {
        total_points: newTotalPoints,
        last_activity_date: new Date().toISOString().split('T')[0]
      };

      // Update quiz/lesson completion counts
      if (source === 'quiz_completion') {
        updates.quizzes_completed = (currentData.quizzes_completed || 0) + 1;
      } else if (source === 'lesson_completion') {
        updates.lessons_completed = (currentData.lessons_completed || 0) + 1;
      }

      const { error: updateError } = await supabase
        .from('user_points')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Log in history
      await supabase.from('user_points_history').insert({
        user_id: userId,
        points_earned: points,
        action_type: source,
        action_details: actionDetails
      });

      return { 
        success: true, 
        new_points: newTotalPoints,
        previous_points: previousPoints,
        previous_level: previousLevel
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update user's daily streak
   */
  async updateStreak(userId) {
    try {
      const { data: currentData } = await supabase
        .from('user_points')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', userId)
        .single();

      if (!currentData) return { success: false };

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = currentData.last_activity_date;

      let newStreak = 1;
      if (lastActivity) {
        const daysDiff = Math.floor((new Date(today) - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          newStreak = (currentData.current_streak || 0) + 1;
        } else if (daysDiff === 0) {
          // Same day - keep current streak
          newStreak = currentData.current_streak || 1;
        }
        // daysDiff > 1 resets to 1
      }

      const longestStreak = Math.max(currentData.longest_streak || 0, newStreak);

      await supabase
        .from('user_points')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today
        })
        .eq('user_id', userId);

      return { success: true, streak: newStreak };
    } catch (error) {
      console.error('Error updating streak:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get chapter progress for a subject
   */
  async getChapterProgress(userId, subjectId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('subject_id', subjectId);
    
    if (error) {
      console.warn('Chapter progress error:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Update chapter completion status
   */
  async updateChapterProgress(userId, subjectId, chapterId, isCompleted, progressPercent = 0) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        subject_id: subjectId,
        chapter_id: chapterId,
        is_completed: isCompleted,
        progress_percent: progressPercent,
        last_accessed: new Date().toISOString()
      }, {
        onConflict: 'user_id,subject_id,chapter_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get all badges earned by a user
   * Returns badges with JOIN to get badge details from badges table
   */
  async getUserBadges(userId) {
    const { data: rawData, error } = await supabase
      .from('user_badges')
      .select(`
        id,
        earned_at,
        badge_id,
        badges!inner (
          badge_id,
          name,
          icon_name,
          description
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    
    if (error) {
      console.warn('User badges error:', error.message);
      return [];
    }

    // Transformer pour compatibilité avec le code existant
    const transformed = rawData?.map(b => ({
      id: b.id,
      badge_id: b.badge_id,
      badge_name: b.badges.name, // Pour compatibilité
      badge_icon: b.badges.icon_name,
      badge_description: b.badges.description,
      earned_at: b.earned_at
    })) || [];

    return transformed;
  },

  /**
   * Award a badge to a user
   * NOTE: badgeData should contain badge_id (FK to badges table)
   */
  async awardBadge(userId, badgeData) {
    try {
      // Si badgeData contient un badge_id, l'utiliser directement
      // Sinon, chercher le badge par son nom dans la table badges
      let badgeId = badgeData.badge_id;
      
      if (!badgeId && badgeData.name) {
        // Rechercher le badge_id dans la table badges par nom
        const { data: badgeInfo, error: searchError } = await supabase
          .from('badges')
          .select('badge_id')
          .eq('name', badgeData.name)
          .single();
        
        if (searchError || !badgeInfo) {
          console.warn('Badge not found in badges table:', badgeData.name);
          return { success: false, error: 'Badge not found', code: 'BADGE_NOT_FOUND' };
        }
        
        badgeId = badgeInfo.badge_id;
      }

      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId // Nouvelle structure: FK vers badges.badge_id
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate badge gracefully
        if (error.code === '23505') {
          return { success: false, error: 'Badge already earned', code: error.code };
        }
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error awarding badge:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get leaderboard (top users by points)
   */
  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('user_points')
      .select(`
        user_id,
        total_points,
        level,
        quizzes_completed,
        profiles (full_name)
      `)
      .order('total_points', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.warn('Leaderboard error:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Get user points history for graphs
   * @param {string} userId - User ID
   * @param {number} days - Number of days to fetch (7, 30, etc.)
   * @returns {Array} Array of daily points aggregated
   */
  async getUserPointsHistory(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('user_points_history')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Aggregate by day
      const dailyPoints = {};
      const today = new Date();
      
      // Initialize all days with 0 points
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (days - 1 - i));
        const dateKey = date.toISOString().split('T')[0];
        dailyPoints[dateKey] = {
          date: dateKey,
          points: 0,
          actions: 0,
          details: []
        };
      }
      
      // Fill with actual data
      (data || []).forEach(entry => {
        const dateKey = entry.created_at.split('T')[0];
        if (dailyPoints[dateKey]) {
          dailyPoints[dateKey].points += entry.points_earned;
          dailyPoints[dateKey].actions += 1;
          dailyPoints[dateKey].details.push({
            type: entry.action_type,
            points: entry.points_earned,
            time: entry.created_at
          });
        }
      });
      
      // Convert to array and format for Recharts
      return Object.values(dailyPoints).map(day => ({
        date: day.date,
        dateFormatted: new Date(day.date).toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'short' 
        }),
        points: day.points,
        actions: day.actions,
        details: day.details
      }));
    } catch (error) {
      console.error('Error fetching points history:', error);
      return [];
    }
  },

  // ============================================
  // CHALLENGES SYSTEM
  // ============================================

  /**
   * Assigner des défis quotidiens à un utilisateur
   */
  async assignDailyChallenges(userId) {
    try {
      const { data, error } = await supabase.rpc('assign_daily_challenges', {
        p_user_id: userId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error assigning daily challenges:', error);
      return [];
    }
  },

  /**
   * Assigner des défis hebdomadaires à un utilisateur
   */
  async assignWeeklyChallenges(userId) {
    try {
      const { data, error } = await supabase.rpc('assign_weekly_challenges', {
        p_user_id: userId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error assigning weekly challenges:', error);
      return [];
    }
  },

  /**
   * Récupérer les défis actifs d'un utilisateur
   */
  async getUserActiveChallenges(userId) {
    try {
      const { data, error } = await supabase.rpc('get_user_active_challenges', {
        p_user_id: userId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user challenges:', error);
      return [];
    }
  },

  /**
   * Mettre à jour la progression d'un défi
   * Appelé automatiquement après certaines actions (quiz, leçon, etc.)
   */
  async updateChallengeProgress(userId, actionType, progressValue = 1, actionDetails = {}) {
    try {
      const { data, error } = await supabase.rpc('update_challenge_progress', {
        p_user_id: userId,
        p_action_type: actionType,
        p_progress_value: progressValue,
        p_action_details: actionDetails
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      return [];
    }
  },

  /**
   * Réclamer les récompenses d'un défi complété
   */
  async claimChallengeRewards(userId, userChallengeId) {
    try {
      const { data, error } = await supabase.rpc('claim_challenge_rewards', {
        p_user_id: userId,
        p_user_challenge_id: userChallengeId
      });

      if (error) throw error;

      if (data && data.success) {
        // Attribuer les points
        if (data.reward_points > 0) {
          await this.awardPoints(
            userId, 
            data.reward_points, 
            'challenge_completed',
            { challenge_title: data.challenge_title }
          );
        }

        // Attribuer le badge si présent
        if (data.reward_badge) {
          await this.awardBadge(userId, data.reward_badge);
        }
      }

      return data;
    } catch (error) {
      console.error('Error claiming challenge rewards:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Vérifier si l'utilisateur a des défis pour aujourd'hui
   * Si non, en assigner automatiquement
   */
  async ensureUserHasChallenges(userId) {
    try {
      // Récupérer les défis actifs
      const challenges = await this.getUserActiveChallenges(userId);

      // Compter les défis par type
      const dailyChallenges = challenges.filter(c => c.type === 'daily');
      const weeklyChallenges = challenges.filter(c => c.type === 'weekly');

      // Assigner des défis quotidiens si nécessaire
      if (dailyChallenges.length === 0) {
        await this.assignDailyChallenges(userId);
      }

      // Assigner des défis hebdomadaires si nécessaire
      if (weeklyChallenges.length === 0) {
        await this.assignWeeklyChallenges(userId);
      }

      // Retourner les défis mis à jour
      return await this.getUserActiveChallenges(userId);
    } catch (error) {
      console.error('Error ensuring user has challenges:', error);
      return [];
    }
  },

  // ============================================================================
  // SHARED LINKS HELPERS - Gestion des liens Dub.co
  // ============================================================================

  /**
   * Sauvegarder un lien créé via Dub.co
   * @param {string} userId - ID de l'utilisateur
   * @param {object} linkData - Données du lien
   * @returns {Promise<object>} - Lien sauvegardé
   */
  async saveSharedLink(userId, linkData) {
    try {
      console.log('💾 [SharedLinks] Sauvegarde lien:', linkData.shortLink);

      // Valider que resource_id est un UUID valide ou null
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validResourceId = linkData.resourceId && uuidRegex.test(linkData.resourceId) 
        ? linkData.resourceId 
        : null;

      // Note: resource_id sera null si l'ID n'est pas un UUID (normal pour les anciens quiz/examens)

      const { data, error } = await supabase
        .from('shared_links')
        .insert([{
          user_id: userId,
          short_link: linkData.shortLink,
          original_url: linkData.url,
          link_id: linkData.id, // ID Dub.co (ex: 'abc123')
          domain: linkData.domain || 'dub.sh',
          key: linkData.key,
          link_type: linkData.type, // 'course', 'referral', 'certificate', etc.
          resource_id: validResourceId, // UUID validé ou null
          title: linkData.title,
          description: linkData.description,
          tags: linkData.tags || []
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ [SharedLinks] Lien sauvegardé:', data.id);
      return { data, error: null };
    } catch (error) {
      console.error('❌ [SharedLinks] Erreur sauvegarde:', error);
      return { data: null, error };
    }
  },

  /**
   * Récupérer les liens d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} linkType - Type de lien (optionnel)
   * @returns {Promise<Array>} - Liste des liens
   */
  async getUserLinks(userId, linkType = null) {
    try {
      console.log('📋 [SharedLinks] Récupération liens:', userId, linkType);

      let query = supabase
        .from('shared_links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (linkType) {
        query = query.eq('link_type', linkType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      console.log('✅ [SharedLinks] Liens récupérés:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('❌ [SharedLinks] Erreur récupération:', error);
      return { data: null, error };
    }
  },

  /**
   * Mettre à jour les analytics d'un lien (tracking maison)
   * @param {string} linkId - UUID interne du lien (shared_links.id)
   * @param {object} analytics - Données analytics
   * @returns {Promise<object>} - Lien mis à jour
   */
  async updateLinkAnalytics(linkId, analytics) {
    try {
      console.log('📊 [SharedLinks] Mise à jour analytics:', linkId);

      const { data, error } = await supabase
        .from('shared_links')
        .update({
          clicks: analytics.clicks || 0,
          unique_clicks: analytics.uniqueClicks || 0,
          last_clicked_at: analytics.lastClickedAt || new Date().toISOString(),
          analytics: analytics,
          last_analytics_update: new Date().toISOString()
        })
        .eq('id', linkId)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ [SharedLinks] Analytics mis à jour:', data.clicks, 'clics');
      return { data, error: null };
    } catch (error) {
      console.error('❌ [SharedLinks] Erreur mise à jour analytics:', error);
      return { data: null, error };
    }
  },

  /**
   * Supprimer un lien
   * @param {string} userId - ID de l'utilisateur
   * @param {string} linkId - ID du lien dans shared_links
   * @returns {Promise<object>} - Résultat
   */
  async deleteLink(userId, linkId) {
    try {
      console.log('🗑️ [SharedLinks] Suppression lien:', linkId);

      const { error } = await supabase
        .from('shared_links')
        .delete()
        .eq('user_id', userId)
        .eq('id', linkId);

      if (error) throw error;
      console.log('✅ [SharedLinks] Lien supprimé');
      return { error: null };
    } catch (error) {
      console.error('❌ [SharedLinks] Erreur suppression:', error);
      return { error };
    }
  },

  /**
   * Récupérer les statistiques globales des liens d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<object>} - Statistiques
   */
  async getUserLinksStats(userId) {
    try {
      const { data, error } = await supabase
        .from('shared_links')
        .select('clicks, unique_clicks, link_type')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        totalLinks: data.length,
        totalClicks: data.reduce((sum, link) => sum + (link.clicks || 0), 0),
        totalUniqueClicks: data.reduce((sum, link) => sum + (link.unique_clicks || 0), 0),
        byType: {}
      };

      // Grouper par type
      data.forEach(link => {
        if (!stats.byType[link.link_type]) {
          stats.byType[link.link_type] = {
            count: 0,
            clicks: 0,
            uniqueClicks: 0
          };
        }
        stats.byType[link.link_type].count++;
        stats.byType[link.link_type].clicks += link.clicks || 0;
        stats.byType[link.link_type].uniqueClicks += link.unique_clicks || 0;
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('❌ [SharedLinks] Erreur stats:', error);
      return { data: null, error };
    }
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToUserProgress(userId, callback) {
    try {
      return supabase
        .channel('user_progress')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_progression',
          filter: `user_id=eq.${userId}`
        }, callback)
        .subscribe();
    } catch (error) {
      console.warn('Progress subscription not available:', error.message);
      return { unsubscribe: () => {} };
    }
  },

  subscribeToUserBadges(userId, callback) {
    return supabase
      .channel('user_badges')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_badges',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  subscribeToNotifications(userId, callback) {
    try {
      return supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${userId}`
        }, callback)
        .subscribe();
    } catch (error) {
      console.warn('Notification subscription not available:', error.message);
      return { unsubscribe: () => {} }; // Retourner un objet mock
    }
  }
};