/**
 * HOOK useCompetitions
 * Hook React pour gérer l'état et les interactions avec les compétitions
 * Inclut Supabase Realtime pour mises à jour live
 */

import { useState, useEffect, useCallback } from 'react';
import { competitionService } from '@/lib/competitionService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useCompetitions = (competitionId = null) => {
  const { user } = useAuth();
  
  // État
  const [competitions, setCompetitions] = useState([]);
  const [currentCompetition, setCurrentCompetition] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Charger toutes les compétitions
   */
  const loadCompetitions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await competitionService.getCompetitions(filters);
    
    if (err) {
      setError(err.message);
      console.error('❌ [useCompetitions] Erreur chargement:', err);
    } else {
      setCompetitions(data || []);
      console.log('✅ [useCompetitions] Compétitions chargées:', data?.length);
    }
    
    setLoading(false);
  }, []);

  /**
   * Charger une compétition spécifique
   */
  const loadCompetition = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const { data, error: err } = await competitionService.getCompetitionById(id);
    
    if (err) {
      setError(err.message);
      console.error('❌ [useCompetitions] Erreur chargement compétition:', err);
    } else {
      setCurrentCompetition(data);
      console.log('✅ [useCompetitions] Compétition chargée:', data?.title);
    }
    
    setLoading(false);
  }, []);

  /**
   * S'inscrire à une compétition
   */
  const joinCompetition = useCallback(async (id) => {
    if (!user) {
      setError('Vous devez être connecté pour participer');
      return { success: false };
    }

    setLoading(true);
    setError(null);
    
    const { data, error: err } = await competitionService.joinCompetition(id, user.id);
    
    if (err) {
      setError(err.message);
      console.error('❌ [useCompetitions] Erreur inscription:', err);
      setLoading(false);
      return { success: false };
    }
    
    // Recharger les données du participant
    await loadParticipantData(id);
    
    setLoading(false);
    return { success: true, data };
  }, [user]);

  /**
   * Charger les données du participant
   */
  const loadParticipantData = useCallback(async (id) => {
    if (!user) return;

    const { data, error: err } = await competitionService.getParticipantData(id, user.id);
    
    if (err) {
      console.error('❌ [useCompetitions] Erreur chargement participant:', err);
    } else {
      setParticipant(data);
      console.log('✅ [useCompetitions] Participant chargé:', data?.status);
    }
  }, [user]);

  /**
   * Charger les questions d'une compétition
   */
  const loadQuestions = useCallback(async (id) => {
    setLoading(true);
    
    const { data, error: err } = await competitionService.getCompetitionQuestions(id);
    
    if (err) {
      setError(err.message);
      console.error('❌ [useCompetitions] Erreur chargement questions:', err);
    } else {
      setQuestions(data || []);
      console.log('✅ [useCompetitions] Questions chargées:', data?.length);
    }
    
    setLoading(false);
  }, []);

  /**
   * Soumettre une réponse
   */
  const submitAnswer = useCallback(async (questionId, selectedAnswer, timeTaken) => {
    if (!participant) {
      setError('Données participant manquantes');
      return { success: false };
    }

    const { data, error: err } = await competitionService.submitAnswer(
      participant.id,
      questionId,
      selectedAnswer,
      timeTaken
    );
    
    if (err) {
      setError(err.message);
      console.error('❌ [useCompetitions] Erreur soumission réponse:', err);
      return { success: false };
    }
    
    // Mettre à jour les stats du participant
    setParticipant(prev => ({
      ...prev,
      score: data.total_score,
      correct_answers: data.correct_answers,
      wrong_answers: data.wrong_answers
    }));
    
    return { success: true, data };
  }, [participant]);

  /**
   * Terminer la compétition
   */
  const completeCompetition = useCallback(async () => {
    if (!participant) {
      setError('Données participant manquantes');
      return { success: false };
    }

    setLoading(true);
    
    const { data, error: err } = await competitionService.completeCompetition(participant.id);
    
    if (err) {
      setError(err.message);
      console.error('❌ [useCompetitions] Erreur finalisation:', err);
      setLoading(false);
      return { success: false };
    }
    
    // Mettre à jour le participant avec le rang final
    setParticipant(prev => ({
      ...prev,
      status: 'completed',
      rank: data.rank
    }));
    
    setLoading(false);
    return { success: true, data };
  }, [participant]);

  /**
   * Charger le leaderboard
   */
  const loadLeaderboard = useCallback(async (id, scope = 'global', limit = 100) => {
    const { data, error: err } = await competitionService.getLeaderboard(id, scope, limit);
    
    if (err) {
      setError(err.message);
      console.error('❌ [useCompetitions] Erreur leaderboard:', err);
    } else {
      setLeaderboard(data || []);
      console.log('✅ [useCompetitions] Leaderboard chargé:', data?.length);
    }
  }, []);

  /**
   * Charger les statistiques utilisateur
   */
  const loadStats = useCallback(async () => {
    if (!user) return;

    const { data, error: err } = await competitionService.getCompetitionStats(user.id);
    
    if (err) {
      console.error('❌ [useCompetitions] Erreur stats:', err);
    } else {
      setStats(data);
      console.log('✅ [useCompetitions] Stats chargées:', data);
    }
  }, [user]);

  /**
   * Abonnement Realtime pour une compétition
   */
  useEffect(() => {
    if (!competitionId) return;

    let competitionSub, participantsSub, leaderboardSub;

    const setupRealtimeSubscriptions = async () => {
      console.log('🔄 [useCompetitions] Configuration Realtime pour:', competitionId);

      // Abonnement aux changements de la compétition
      competitionSub = competitionService.subscribeToCompetition(
        competitionId,
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCurrentCompetition(payload.new);
          }
        }
      );

      // Abonnement aux participants (pour compter les inscrits en live)
      participantsSub = competitionService.subscribeToParticipants(
        competitionId,
        (payload) => {
          // Recharger le participant si c'est le nôtre
          if (payload.new?.user_id === user?.id) {
            setParticipant(payload.new);
          }
          
          // Mettre à jour le nombre de participants
          if (payload.eventType === 'INSERT') {
            setCurrentCompetition(prev => prev ? {
              ...prev,
              current_participants: (prev.current_participants || 0) + 1
            } : null);
          }
        }
      );

      // Abonnement au leaderboard
      leaderboardSub = competitionService.subscribeToLeaderboard(
        competitionId,
        () => {
          // Recharger le leaderboard à chaque changement
          loadLeaderboard(competitionId);
        }
      );
    };

    setupRealtimeSubscriptions();

    // Cleanup
    return () => {
      console.log('❌ [useCompetitions] Nettoyage Realtime');
      competitionService.unsubscribe(competitionSub);
      competitionService.unsubscribe(participantsSub);
      competitionService.unsubscribe(leaderboardSub);
    };
  }, [competitionId, user, loadLeaderboard]);

  /**
   * Charger les données initiales
   */
  useEffect(() => {
    if (competitionId) {
      loadCompetition(competitionId);
      loadParticipantData(competitionId);
      loadLeaderboard(competitionId);
    }
  }, [competitionId, loadCompetition, loadParticipantData, loadLeaderboard]);

  return {
    // État
    competitions,
    currentCompetition,
    participant,
    questions,
    leaderboard,
    stats,
    loading,
    error,

    // Actions
    loadCompetitions,
    loadCompetition,
    joinCompetition,
    loadQuestions,
    submitAnswer,
    completeCompetition,
    loadLeaderboard,
    loadStats,

    // Helpers
    isRegistered: !!participant,
    isCompleted: participant?.status === 'completed',
    isInProgress: participant?.status === 'in_progress',
    canJoin: currentCompetition?.status === 'upcoming' || currentCompetition?.status === 'active'
  };
};
