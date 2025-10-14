import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Award,
  ChevronRight,
  AlertCircle,
  Trophy,
  Star,
  Target
} from 'lucide-react';
import useInteractiveQuiz from '../hooks/useInteractiveQuiz';

/**
 * Composant Quiz Interactif dans le Chat Coach IA
 * 
 * Affiche :
 * - Bouton démarrage quiz
 * - Questions une par une avec choix multiples
 * - Correction instantanée avec explications
 * - Score en temps réel
 * - Statistiques finales avec badge
 */
const InteractiveQuiz = ({ userId, config, onComplete, onCancel }) => {
  const { subject, chapter, difficulty = 'medium' } = config || {};
  
  const {
    isActive,
    isLoading,
    error,
    quizCompleted,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    userAnswers,
    currentAnswer,
    showCorrection,
    score,
    progress,
    timeElapsed,
    finalStats,
    startQuiz,
    submitAnswer,
    nextQuestion,
    abandonQuiz
  } = useInteractiveQuiz({ userId, subject, chapter, difficulty });

  // Appeler onComplete quand le quiz est terminé
  useEffect(() => {
    if (quizCompleted && finalStats && onComplete) {
      onComplete({
        correctAnswers: finalStats.correctAnswers,
        totalQuestions: finalStats.totalQuestions,
        scorePercent: finalStats.scorePercentage,
        badgeEarned: finalStats.badgeEarned,
        timeElapsed: finalStats.totalTime
      });
    }
  }, [quizCompleted, finalStats, onComplete]);

  // Conversion secondes → format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Couleur selon difficulté
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    hard: 'bg-red-100 text-red-700 border-red-300'
  };

  const difficultyLabels = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile'
  };

  /**
   * ÉCRAN DE DÉMARRAGE
   */
  if (!isActive && !quizCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Quiz Interactif
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subject} {chapter ? `• ${chapter}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">10</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Difficulté</p>
            <p className={`text-sm font-semibold px-2 py-1 rounded inline-block ${difficultyColors[difficulty]}`}>
              {difficultyLabels[difficulty]}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Comment ça marche ?
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                <li>✓ Je te pose 10 questions une par une</li>
                <li>✓ Tu choisis une réponse</li>
                <li>✓ Correction instantanée avec explications</li>
                <li>✓ Badge débloqué si score ≥ 80% 🏆</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <button
          onClick={startQuiz}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Chargement...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Démarrer le Quiz</span>
            </>
          )}
        </button>
      </motion.div>
    );
  }

  /**
   * ÉCRAN DE QUESTION
   */
  if (isActive && currentQuestion && !quizCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {/* Header avec progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} / {totalQuestions}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
                <span>{score} / {totalQuestions}</span>
              </div>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = currentAnswer?.user_answer === option;
              const isCorrect = option === currentQuestion.correct_answer;
              const showResult = showCorrection;

              let buttonClass = 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600';
              
              if (showResult) {
                if (isCorrect) {
                  buttonClass = 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-500';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-500';
                }
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => !showCorrection && submitAnswer(option)}
                  disabled={showCorrection}
                  whileHover={!showCorrection ? { scale: 1.02 } : {}}
                  whileTap={!showCorrection ? { scale: 0.98 } : {}}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${buttonClass} disabled:cursor-not-allowed`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    showResult && isCorrect 
                      ? 'bg-green-500 text-white' 
                      : showResult && isSelected && !isCorrect
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {optionLetter}
                  </div>
                  <span className="flex-1 text-gray-900 dark:text-white">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Correction */}
        <AnimatePresence>
          {showCorrection && currentAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-4 rounded-lg border-2 ${
                currentAnswer.is_correct
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                {currentAnswer.is_correct ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold mb-2 ${
                    currentAnswer.is_correct ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {currentAnswer.is_correct ? '✓ Bravo ! Bonne réponse' : '✗ Incorrect'}
                  </p>
                  {currentQuestion.explanation && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Explication :</strong> {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              abandonQuiz();
              onCancel && onCancel();
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            Abandonner
          </button>
          {showCorrection && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={nextQuestion}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <span>
                {currentQuestionIndex < totalQuestions - 1 ? 'Question suivante' : 'Voir les résultats'}
              </span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  /**
   * ÉCRAN DE RÉSULTATS
   */
  if (quizCompleted && finalStats) {
    const isPerfect = finalStats.percentage === 100;
    const isExcellent = finalStats.percentage >= 80;
    const isGood = finalStats.percentage >= 60;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-gray-700"
      >
        {/* Titre avec emoji */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-block text-6xl mb-3"
          >
            {isPerfect ? '🎉' : isExcellent ? '🏆' : isGood ? '👍' : '💪'}
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isPerfect ? 'Parfait !' : isExcellent ? 'Excellent !' : isGood ? 'Bien joué !' : 'Continue !'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Quiz terminé en {formatTime(finalStats.timeElapsed)}
          </p>
        </div>

        {/* Score principal */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            {finalStats.percentage}%
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {finalStats.correctAnswers} / {finalStats.totalQuestions} bonnes réponses
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Points gagnés</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              +{finalStats.totalPoints}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Temps moyen</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {finalStats.averageTimePerQuestion}s
            </p>
          </div>
        </div>

        {/* Badge débloqué */}
        {finalStats.badgeUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white opacity-90">
                  Badge débloqué !
                </p>
                <p className="text-lg font-bold text-white">
                  {finalStats.badgeUnlocked.icon} {finalStats.badgeUnlocked.name}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Message personnalisé */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {isPerfect && "🌟 Score parfait ! Tu maîtrises ce sujet à la perfection !"}
            {isExcellent && !isPerfect && "🏆 Excellent travail ! Continue sur cette lancée !"}
            {isGood && !isExcellent && "👍 Bon travail ! Quelques révisions et tu seras au top !"}
            {!isGood && "💪 Continue à t'entraîner ! Révise les concepts clés et recommence !"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              abandonQuiz();
              setTimeout(startQuiz, 500);
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Star className="w-5 h-5" />
            <span>Recommencer</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default InteractiveQuiz;
