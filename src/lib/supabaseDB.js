import { supabase } from './customSupabaseClient';

/**
 * Supabase Database Helpers - Aligned with actual schema
 * Created: 2 octobre 2025
 * Schema-compliant helpers for E-Réussite platform
 */

// ============================================
// PROFILE MANAGEMENT
// ============================================

export const profileHelpers = {
  /**
   * Get user profile from profiles table
   */
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  },

  /**
   * Create user profile (called on signup)
   */
  async createProfile(user, additionalData = {}) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          role: 'student',
          subscription: 'free',
          ...additionalData
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { data: null, error };
    }
  }
};

// ============================================
// COURSES & CONTENT
// ============================================

export const courseHelpers = {
  /**
   * Get all matieres (subjects) by level
   */
  async getMatieresByLevel(level) {
    try {
      const { data, error } = await supabase
        .from('matieres')
        .select(`
          *,
          chapitres (
            id,
            title,
            description,
            order,
            lecons (
              id,
              title,
              is_free_preview,
              order
            )
          )
        `)
        .eq('level', level)
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching matieres:', error);
      return { data: [], error };
    }
  },

  /**
   * Get single matiere with full details
   */
  async getMatiereById(matiereId) {
    try {
      const { data, error } = await supabase
        .from('matieres')
        .select(`
          *,
          chapitres (
            *,
            lecons (*),
            quiz (
              *,
              quiz_questions (*)
            ),
            fiches_revision (*)
          ),
          annales (*)
        `)
        .eq('id', matiereId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching matiere:', error);
      return { data: null, error };
    }
  },

  /**
   * Get lecon details
   */
  async getLecon(leconId) {
    try {
      const { data, error } = await supabase
        .from('lecons')
        .select(`
          *,
          chapitre:chapitres (
            *,
            matiere:matieres (*)
          ),
          exercices (*)
        `)
        .eq('id', leconId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching lecon:', error);
      return { data: null, error };
    }
  },

  /**
   * Get chapitres by matiere
   */
  async getChapitresByMatiere(matiereId) {
    try {
      const { data, error } = await supabase
        .from('chapitres')
        .select(`
          *,
          lecons (id)
        `)
        .eq('matiere_id', matiereId)
        .order('order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching chapitres:', error);
      return { data: [], error };
    }
  },

  /**
   * Get lecons by chapitre
   */
  async getLeconsByChapitre(chapitreId) {
    try {
      const { data, error } = await supabase
        .from('lecons')
        .select('*')
        .eq('chapitre_id', chapitreId)
        .order('order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching lecons:', error);
      return { data: [], error };
    }
  },

  /**
   * Get annales for a matiere
   */
  async getAnnales(matiereId) {
    try {
      const { data, error } = await supabase
        .from('annales')
        .select('*')
        .eq('matiere_id', matiereId)
        .order('year', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching annales:', error);
      return { data: [], error };
    }
  },

  /**
   * Get fiches de revision for a chapitre
   */
  async getFichesRevision(chapitreId) {
    try {
      const { data, error } = await supabase
        .from('fiches_revision')
        .select('*')
        .eq('chapitre_id', chapitreId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching fiches:', error);
      return { data: [], error };
    }
  },

  /**
   * Get examens for a matiere
   */
  async getExamens(matiereId) {
    try {
      const { data, error } = await supabase
        .from('examens')
        .select('*')
        .eq('matiere_id', matiereId)
        .order('year', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching examens:', error);
      return { data: [], error };
    }
  }
};

// ============================================
// USER PROGRESSION
// ============================================

export const progressHelpers = {
  /**
   * Get user progression
   */
  async getUserProgress(userId, leconId = null) {
    try {
      let query = supabase
        .from('user_progression')
        .select(`
          *,
          lecon:lecons (
            *,
            chapitre:chapitres (
              *,
              matiere:matieres (*)
            )
          )
        `)
        .eq('user_id', userId);

      // Only filter by leconId if it's provided and is a valid number
      if (leconId && typeof leconId === 'number') {
        query = query.eq('lecon_id', leconId);
      } else if (leconId && typeof leconId === 'string' && !isNaN(parseInt(leconId))) {
        query = query.eq('lecon_id', parseInt(leconId));
      }
      // If leconId is an object or invalid, skip the filter

      const { data, error } = await query.order('completed_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching progress:', error);
      return { data: [], error };
    }
  },

  /**
   * Mark lecon as completed
   */
  async completeLecon(userId, leconId) {
    try {
      // 1. Marquer la leçon comme complétée
      const { data: progressData, error: progressError } = await supabase
        .from('user_progression')
        .insert({
          user_id: userId,
          lecon_id: leconId,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (progressError) throw progressError;

      // 2. Appeler la fonction pour attribuer les points
      const { data: pointsData, error: pointsError } = await supabase
        .rpc('award_lesson_completion_points', {
          p_user_id: userId,
          p_lecon_id: leconId
        });

      if (pointsError) {
        console.warn('Warning: Could not award points', pointsError);
        // Ne pas bloquer si l'attribution des points échoue
      }

      return { 
        data: {
          progress: progressData,
          points: pointsData?.[0] || null
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error completing lecon:', error);
      return { data: null, error };
    }
  },

  /**
   * Get completion stats by matiere
   */
  async getProgressByMatiere(userId) {
    try {
      const { data, error } = await supabase
        .from('user_progression')
        .select(`
          id,
          lecons (
            chapitre_id,
            chapitres (
              matiere_id,
              matieres (id, name)
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      // Aggregate by matiere
      const stats = {};
      data?.forEach(prog => {
        const matiere = prog.lecons?.chapitres?.matieres;
        if (matiere) {
          if (!stats[matiere.id]) {
            stats[matiere.id] = { name: matiere.name, count: 0 };
          }
          stats[matiere.id].count++;
        }
      });

      return { data: Object.values(stats), error: null };
    } catch (error) {
      console.error('Error fetching matiere progress:', error);
      return { data: [], error };
    }
  }
};

// ============================================
// QUIZ & ASSESSMENTS
// ============================================

export const quizHelpers = {
  /**
   * Get all quizzes
   */
  async getQuizzes() {
    try {
      const { data, error } = await supabase
        .from('quiz')
        .select(`
          *,
          chapitre:chapitres (
            *,
            matiere:matieres (*)
          )
        `)
        .order('id', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return { data: [], error };
    }
  },

  /**
   * Get quiz with questions
   */
  async getQuiz(quizId) {
    try {
      const { data, error } = await supabase
        .from('quiz')
        .select(`
          *,
          chapitre:chapitres (
            *,
            matiere:matieres (*)
          ),
          quiz_questions (*)
        `)
        .eq('id', quizId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return { data: null, error };
    }
  },

  /**
   * Get quizzes by chapitre
   */
  async getQuizzesByChapitre(chapitreId) {
    try {
      const { data, error } = await supabase
        .from('quiz')
        .select('*, quiz_questions(id)')
        .eq('chapitre_id', chapitreId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return { data: [], error };
    }
  },

  /**
   * Save quiz result with detailed answers
   */
  async saveQuizResult(userId, quizId, score, correctAnswers = 0, totalQuestions = 0, timeSpent = 0, answersArray = null) {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          score: Math.round(score * 100) / 100, // 2 decimals
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          time_taken: timeSpent,
          answers: answersArray, // Detailed answers array
          points_earned: 0, // Will be calculated by trigger
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving quiz result:', error);
      return { data: null, error };
    }
  },

  /**
   * Get user quiz results
   */
  async getUserQuizResults(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select(`
          *,
          quiz (
            *,
            quiz_questions (id),
            chapitre:chapitres (
              matiere:matieres (name)
            )
          )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      return { data: [], error };
    }
  },

  /**
   * Get quiz questions
   */
  async getQuizQuestions(quizId) {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('id', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      return { data: [], error };
    }
  }
};

// ============================================
// EXAM SIMULATIONS
// ============================================

export const examHelpers = {
  /**
   * Get exam simulation
   */
  async getExam(examId) {
    try {
      const { data, error } = await supabase
        .from('exam_simulations')
        .select('*')
        .eq('id', examId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching exam:', error);
      return { data: null, error };
    }
  },

  /**
   * Get all exams
   */
  async getExams() {
    try {
      const { data, error } = await supabase
        .from('exam_simulations')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching exams:', error);
      return { data: [], error };
    }
  },

  /**
   * Get exams by parcours
   */
  async getExamsByParcours(parcours) {
    try {
      const { data, error } = await supabase
        .from('exam_simulations')
        .select('*')
        .eq('parcours', parcours);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching exams:', error);
      return { data: [], error };
    }
  },

  /**
   * Save exam result with detailed answers
   */
  async saveExamResult(userId, examId, score, timeSpent = 0, answersArray = null) {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .insert({
          user_id: userId,
          exam_id: examId,
          score: score,
          time_taken: timeSpent,
          answers: answersArray, // Detailed answers array
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving exam result:', error);
      return { data: null, error };
    }
  },

  /**
   * Get user exam results
   */
  async getUserExamResults(userId) {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          *,
          exam:exam_simulations (*)
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching exam results:', error);
      return { data: [], error };
    }
  }
};

// ============================================
// GAMIFICATION
// ============================================

export const gamificationHelpers = {
  /**
   * Get user badges
   */
  async getUserBadges(userId) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching badges:', error);
      return { data: [], error };
    }
  },

  /**
   * Award badge to user
   */
  async awardBadge(userId, badgeData) {
    try {
      // Check if already earned
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_name', badgeData.name)
        .single();

      if (existing) {
        return { data: existing, error: null, alreadyEarned: true };
      }

      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_name: badgeData.name,
          badge_type: badgeData.type,
          badge_description: badgeData.description,
          badge_icon: badgeData.icon,
          condition_value: badgeData.condition_value,
          earned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null, alreadyEarned: false };
    } catch (error) {
      console.error('Error awarding badge:', error);
      return { data: null, error };
    }
  },

  /**
   * Get all available badges (deprecated - badges are now stored directly in user_badges)
   * This function is kept for backward compatibility but should not be used
   */
  async getAllBadges() {
    console.warn('getAllBadges is deprecated - badges are now defined in code, not in database');
    return { data: [], error: { message: 'This function is deprecated. Badges are now defined in application code.' } };
  },

  /**
   * Get monthly challenges (active)
   */
  async getActiveChallenge() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('monthly_challenges')
        .select('*')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching challenge:', error);
      return { data: [], error };
    }
  },

  /**
   * Get all active challenges (alias for compatibility)
   */
  async getActiveChallenges() {
    return this.getActiveChallenge();
  },

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(challengeId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('challenge_id', challengeId)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return { data: [], error };
    }
  },

  /**
   * Get global leaderboard (by points)
   */
  async getLeaderboard(category = 'points', timeFilter = 'all', limit = 100) {
    try {
      // Build query based on category
      let query = supabase
        .from('profiles')
        .select('id, display_name, avatar_url, location, school, points, current_streak');

      // Order by points
      query = query.order('points', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match expected format
      const leaderboardData = (data || []).map((profile, index) => ({
        id: profile.id,
        display_name: profile.display_name || 'Utilisateur',
        location: profile.location || 'Non spécifié',
        school: profile.school || 'Non spécifié',
        total_points: profile.points || 0,
        current_streak: profile.current_streak || 0,
        quizzes_completed: 0,
        lessons_completed: 0,
        badges_count: 0,
        rank: index + 1,
        trend: 0,
        avatar_url: profile.avatar_url
      }));

      return leaderboardData;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
};

// ============================================
// E-COMMERCE
// ============================================

export const shopHelpers = {
  /**
   * Get all products
   */
  async getProducts(type = null) {
    try {
      let query = supabase
        .from('products')
        .select('*');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], error };
    }
  },

  /**
   * Create order
   */
  async createOrder(userId, items, totalAmount) {
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'pending',
          total_amount: totalAmount,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { data: order, error: null };
    } catch (error) {
      console.error('Error creating order:', error);
      return { data: null, error };
    }
  },

  /**
   * Get user orders
   */
  async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { data: [], error };
    }
  }
};

// ============================================
// NOTIFICATIONS
// ============================================

export const notificationHelpers = {
  /**
   * Get user notifications
   */
  async getUserNotifications(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: [], error };
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, error };
    }
  },

  /**
   * Create notification
   */
  async createNotification(userId, title, message, type = 'system') {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { data: null, error };
    }
  }
};

// ============================================
// AI & ANALYTICS
// ============================================

export const aiHelpers = {
  /**
   * Save AI conversation
   */
  async saveConversation(userId, question, answer) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          question,
          answer,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving conversation:', error);
      return { data: null, error };
    }
  },

  /**
   * Get user errors for analytics
   */
  async getUserErrors(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('user_errors')
        .select(`
          *,
          lecon:lecons (
            chapitre:chapitres (
              matiere:matieres (name)
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user errors:', error);
      return { data: [], error };
    }
  },

  /**
   * Log user error
   */
  async logError(userId, errorData) {
    try {
      const { data, error } = await supabase
        .from('user_errors')
        .insert({
          user_id: userId,
          ...errorData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error logging error:', error);
      return { data: null, error };
    }
  }
};

// ============================================
// ACTIVITY LOGS
// ============================================

export const activityHelpers = {
  /**
   * Log user activity
   */
  async logActivity(userId, action, details = {}) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action,
          details,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { data: null, error };
    }
  },

  /**
   * Get user activity
   */
  async getUserActivity(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching activity:', error);
      return { data: [], error };
    }
  }
};

// Export all helpers as default
export default {
  profile: profileHelpers,
  course: courseHelpers,
  progress: progressHelpers,
  quiz: quizHelpers,
  exam: examHelpers,
  gamification: gamificationHelpers,
  shop: shopHelpers,
  notification: notificationHelpers,
  ai: aiHelpers,
  activity: activityHelpers,
  // Add direct access to getLeaderboard
  getLeaderboard: gamificationHelpers.getLeaderboard.bind(gamificationHelpers)
};
