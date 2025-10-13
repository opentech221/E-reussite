import { supabase } from './customSupabaseClient';

// Helpers simplifiés: ciblent uniquement la table 'profiles'
export const robustDbHelpers = {
  // User Profile Management
  async createUserProfile(user, additionalData = {}) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          ...additionalData
        })
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.warn('Error creating user profile:', error.message);
      return { data: null, error };
    }
  },

  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.warn('Error getting user profile:', error.message);
      return { 
        data: { 
          id: userId, 
          full_name: 'Utilisateur', 
          points: 0, 
          level: 1,
          streak_days: 0 
        }, 
        error: null 
      };
    }
  },

  // Notifications
  async getUserNotifications(userId, limit = 5) {
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
      console.warn('Error getting notifications:', error.message);
      return { data: [], error: null };
    }
  },

  // Progression utilisateur
  async getUserProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_progression')
        .select('*, courses(title, subjects(name, icon_name))')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.warn('Error getting user progress:', error.message);
      return { data: [], error: null };
    }
  },

  // Sessions d'étude
  async getUserStudyStats(userId, period = 'week') {
    try {
      let dateFilter = new Date();
      switch (period) {
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          break;
        case 'day':
          dateFilter.setDate(dateFilter.getDate() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*, subjects(name, icon_name)')
        .eq('user_id', userId)
        .gte('session_date', dateFilter.toISOString())
        .order('session_date', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.warn('Error getting study stats:', error.message);
      return { data: [], error: null };
    }
  },

  // Matières
  async getSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.warn('Error getting subjects:', error.message);
      return { data: [], error: null };
    }
  },

  // Cours
  async getCourses(subjectId = null) {
    try {
      let query = supabase
        .from('courses')
        .select('*, subjects(name, icon_name)')
        .eq('is_published', true);

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query.order('chapter_number');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.warn('Error getting courses:', error.message);
      return { data: [], error: null };
    }
  },

  // Quiz
  async getQuizzes(courseId = null) {
    try {
      let query = supabase
        .from('quizzes')
        .select('*, courses(title, subjects(name))');

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.warn('Error getting quizzes:', error.message);
      return { data: [], error: null };
    }
  },

  // Badges
  async getUserBadges(userId) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.warn('Error getting user badges:', error.message);
      return { data: [], error: null };
    }
  },

  // Créer une session d'étude
  async createStudySession(userId, subjectId, duration, activities = {}) {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: userId,
          subject_id: subjectId,
          duration,
          activities,
          focus_score: 0.8,
          session_date: new Date().toISOString().split('T')[0]
        })
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.warn('Error creating study session:', error.message);
      return { data: null, error };
    }
  },

  // Créer une notification
  async createNotification(userId, title, message, type = 'system') {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type
        })
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.warn('Error creating notification:', error.message);
      return { data: null, error };
    }
  },

  // Mettre à jour le profil utilisateur
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.warn('Error updating user profile:', error.message);
      return { data: null, error };
    }
  },

  // Sauvegarder une tentative de quiz
  async saveQuizAttempt(userId, quizId, attemptData) {
    try {
      const { data, error } = await supabase
        .from('user_quiz_attempts')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          ...attemptData,
          started_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.warn('Error saving quiz attempt:', error.message);
      return { data: null, error };
    }
  }
};

export default robustDbHelpers;