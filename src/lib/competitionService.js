/**
 * COMPETITION SERVICE
 * Service pour gérer les compétitions avec Supabase Realtime
 * MVP Phase 1 - Compétitions asynchrones avec leaderboards
 */

import { supabase } from './supabaseClient';

class CompetitionService {
  /**
   * Récupérer toutes les compétitions avec filtres
   */
  async getCompetitions(filters = {}) {
    try {
      let query = supabase
        .from('competitions')
        .select('*')
        .order('starts_at', { ascending: true });

      // Filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }
      if (filters.grade_level) {
        query = query.eq('grade_level', filters.grade_level);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ [CompetitionService] Erreur getCompetitions:', error);
      return { data: null, error };
    }
  }

  /**
   * Récupérer une compétition par ID
   */
  async getCompetitionById(competitionId) {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ [CompetitionService] Erreur getCompetitionById:', error);
      return { data: null, error };
    }
  }

  /**
   * S'inscrire à une compétition
   */
  async joinCompetition(competitionId, userId) {
    try {
      const { data, error } = await supabase
        .rpc('join_competition', {
          p_competition_id: competitionId,
          p_user_id: userId
        });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Échec de l\'inscription');
      }

      console.log('✅ [CompetitionService] Inscription réussie:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ [CompetitionService] Erreur joinCompetition:', error);
      return { data: null, error };
    }
  }

  /**
   * Récupérer les questions d'une compétition
   */
  async getCompetitionQuestions(competitionId) {
    try {
      const { data, error } = await supabase
        .from('competition_questions')
        .select(`
          *,
          question:questions(*)
        `)
        .eq('competition_id', competitionId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ [CompetitionService] Erreur getCompetitionQuestions:', error);
      return { data: null, error };
    }
  }

  /**
   * Récupérer les données de participation d'un utilisateur
   */
  async getParticipantData(competitionId, userId) {
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ [CompetitionService] Erreur getParticipantData:', error);
      return { data: null, error };
    }
  }

  /**
   * Soumettre une réponse
   */
  async submitAnswer(participantId, questionId, selectedAnswer, timeTaken) {
    try {
      const { data, error } = await supabase
        .rpc('submit_competition_answer', {
          p_participant_id: participantId,
          p_question_id: questionId,
          p_selected_answer: selectedAnswer,
          p_time_taken_seconds: timeTaken
        });

      if (error) throw error;

      if (!data.success) {
        throw new Error('Échec de la soumission');
      }

      console.log('✅ [CompetitionService] Réponse soumise:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ [CompetitionService] Erreur submitAnswer:', error);
      return { data: null, error };
    }
  }

  /**
   * Terminer la compétition
   */
  async completeCompetition(participantId) {
    try {
      const { data, error } = await supabase
        .rpc('complete_competition_participant', {
          p_participant_id: participantId
        });

      if (error) throw error;

      if (!data.success) {
        throw new Error('Échec de la finalisation');
      }

      console.log('✅ [CompetitionService] Compétition terminée:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ [CompetitionService] Erreur completeCompetition:', error);
      return { data: null, error };
    }
  }

  /**
   * Récupérer le leaderboard
   */
  async getLeaderboard(competitionId, scope = 'global', limit = 100) {
    try {
      const { data, error } = await supabase
        .rpc('get_competition_leaderboard', {
          p_competition_id: competitionId,
          p_scope: scope,
          p_limit: limit
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ [CompetitionService] Erreur getLeaderboard:', error);
      return { data: null, error };
    }
  }

  /**
   * S'abonner aux changements d'une compétition (Realtime)
   */
  subscribeToCompetition(competitionId, callback) {
    console.log('🔄 [CompetitionService] Abonnement Realtime:', competitionId);

    const subscription = supabase
      .channel(`competition:${competitionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competitions',
          filter: `id=eq.${competitionId}`
        },
        (payload) => {
          console.log('📡 [CompetitionService] Mise à jour compétition:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * S'abonner aux participants d'une compétition (Realtime)
   */
  subscribeToParticipants(competitionId, callback) {
    console.log('🔄 [CompetitionService] Abonnement participants:', competitionId);

    const subscription = supabase
      .channel(`participants:${competitionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_participants',
          filter: `competition_id=eq.${competitionId}`
        },
        (payload) => {
          console.log('📡 [CompetitionService] Mise à jour participant:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * S'abonner au leaderboard d'une compétition (Realtime)
   */
  subscribeToLeaderboard(competitionId, callback) {
    console.log('🔄 [CompetitionService] Abonnement leaderboard:', competitionId);

    const subscription = supabase
      .channel(`leaderboard:${competitionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_leaderboards',
          filter: `competition_id=eq.${competitionId}`
        },
        (payload) => {
          console.log('📡 [CompetitionService] Mise à jour leaderboard:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Se désabonner d'un channel Realtime
   */
  async unsubscribe(subscription) {
    if (subscription) {
      await supabase.removeChannel(subscription);
      console.log('❌ [CompetitionService] Désabonnement Realtime');
    }
  }

  /**
   * Récupérer les statistiques globales des compétitions
   */
  async getCompetitionStats(userId) {
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) throw error;

      // Calculer les stats
      const totalCompetitions = data.length;
      const totalScore = data.reduce((sum, p) => sum + p.score, 0);
      const avgRank = data.length > 0 
        ? data.reduce((sum, p) => sum + (p.rank || 0), 0) / data.length 
        : 0;
      const topRanks = data.filter(p => p.rank <= 3).length;

      return {
        data: {
          totalCompetitions,
          totalScore,
          avgRank: Math.round(avgRank),
          topRanks
        },
        error: null
      };
    } catch (error) {
      console.error('❌ [CompetitionService] Erreur getCompetitionStats:', error);
      return { data: null, error };
    }
  }
}

// Export instance singleton
export const competitionService = new CompetitionService();
