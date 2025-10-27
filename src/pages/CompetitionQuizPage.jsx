/**
 * PAGE COMPETITION QUIZ
 * Interface de quiz avec timer et progression realtime
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompetitions } from '@/hooks/useCompetitions';
import SocialShareModal from '@/components/SocialShareModal';
import { 
  Clock, 
  Target, 
  Trophy,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader,
  Share2
} from 'lucide-react';

const CompetitionQuizPage = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  
  const {
    currentCompetition,
    participant,
    questions,
    loading,
    error,
    joinCompetition,
    loadQuestions,
    submitAnswer,
    completeCompetition,
    isRegistered
  } = useCompetitions(competitionId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Charger les questions au démarrage
  useEffect(() => {
    if (competitionId) {
      loadQuestions(competitionId);
    }
  }, [competitionId, loadQuestions]);

  // Transformer les questions pour le format attendu
  const transformedQuestions = questions?.map(q => ({
    ...q,
    question: {
      ...q.question,
      answers: [
        q.question.option_a,
        q.question.option_b,
        q.question.option_c,
        q.question.option_d
      ].filter(Boolean), // Filtrer les options vides
      correct_answer: ['A', 'B', 'C', 'D'].indexOf(q.question.correct_option)
    }
  })) || [];

  // Inscription automatique si pas encore inscrit
  useEffect(() => {
    const autoJoin = async () => {
      if (currentCompetition && !isRegistered && currentCompetition.status !== 'completed') {
        const result = await joinCompetition(competitionId);
        if (result.success) {
          console.log('✅ Inscription automatique réussie');
        }
      }
    };
    autoJoin();
  }, [currentCompetition, isRegistered, competitionId, joinCompetition]);

  // Timer global de la compétition
  useEffect(() => {
    if (!currentCompetition || !participant) return;

    const updateTimer = () => {
      if (currentCompetition.duration_minutes) {
        const startTime = participant.started_at ? new Date(participant.started_at) : new Date();
        const endTime = new Date(startTime.getTime() + currentCompetition.duration_minutes * 60000);
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        
        setTimeRemaining(remaining);

        if (remaining === 0 && !quizCompleted) {
          handleComplete();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentCompetition, participant, quizCompleted]);

  // Formater le temps
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Gérer la soumission d'une réponse
  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || isSubmitting) return;

    setIsSubmitting(true);

    const currentQuestion = transformedQuestions[currentQuestionIndex];
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    const result = await submitAnswer(
      currentQuestion.id,
      selectedAnswer,
      timeTaken
    );

    if (result.success) {
      setLastResult(result.data);
      setShowResult(true);

      // Passer à la question suivante après 2 secondes
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setQuestionStartTime(Date.now());
          setShowResult(false);
          setLastResult(null);
        } else {
          // Dernière question terminée
          handleComplete();
        }
        setIsSubmitting(false);
      }, 2000);
    } else {
      setIsSubmitting(false);
    }
  };

  // Terminer la compétition
  const handleComplete = useCallback(async () => {
    if (quizCompleted) return;
    
    setQuizCompleted(true);
    const result = await completeCompetition();
    
    if (result.success) {
      setFinalResults(result.data);
    }
  }, [completeCompetition, quizCompleted]);

  // Loading
  if (loading && !currentCompetition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2 text-center">
            Erreur
          </h2>
          <p className="text-red-700 dark:text-red-300 text-center">{error}</p>
        </div>
      </div>
    );
  }

  // Résultats finaux
  if (quizCompleted && finalResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-2xl w-full">
          <div className="text-center">
            {/* Icône de succès */}
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Compétition Terminée ! 🎉
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {currentCompetition?.title}
            </p>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90 mb-1">Votre classement</p>
                <p className="text-4xl font-bold">#{finalResults.rank}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90 mb-1">Score final</p>
                <p className="text-4xl font-bold">{finalResults.score}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90 mb-1">Points gagnés</p>
                <p className="text-4xl font-bold">+{finalResults.reward_points}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90 mb-1">XP gagné</p>
                <p className="text-4xl font-bold">+{finalResults.reward_xp}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Partager mes résultats
              </button>
              <button
                onClick={() => navigate(`/competitions`)}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Voir le classement
              </button>
            </div>

            <button
              onClick={() => navigate('/competitions')}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Autres compétitions
            </button>
          </div>
        </div>
      </div>

      {/* Modal de partage social */}
      {showShareModal && finalResults && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          competitionTitle={currentCompetition?.title || 'Compétition'}
          score={finalResults.score}
          rank={finalResults.rank}
          totalParticipants={currentCompetition?.current_participants || 0}
          badges={finalResults.badges}
        />
      )}
    </div>
  );
  }

  const currentQuestion = transformedQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header avec stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Target className="w-5 h-5" />
                <span className="font-semibold">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Score: {participant?.score || 0}</span>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${
              timeRemaining < 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            {currentQuestion.question.question_text}
          </h2>

          {/* Réponses */}
          <div className="space-y-3">
            {currentQuestion.question.answers?.map((answer, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = showResult && index === currentQuestion.question.correct_answer;
              const isWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult || isSubmitting}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    showResult
                      ? isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : isWrong
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      : isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  } ${showResult || isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {answer}
                    </span>
                    {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {showResult && isWrong && <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showResult && lastResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              lastResult.is_correct 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`font-semibold ${
                lastResult.is_correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {lastResult.is_correct ? '✅ Bonne réponse !' : '❌ Mauvaise réponse'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                +{lastResult.points_earned} points
              </p>
            </div>
          )}

          {/* Bouton suivant */}
          {!showResult && (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || isSubmitting}
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Valider
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionQuizPage;
