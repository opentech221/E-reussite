/**
 * 🎯 COMPOSANT TEST D'ORIENTATION
 * Questionnaire interactif de 15 questions
 * Date: 23 octobre 2025
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

const OrientationTest = ({ questions, onComplete, loading }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = answers[currentQuestion.id];

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isAnswerValid = () => {
    if (!currentAnswer) return false;

    if (currentQuestion.type === 'multiple_choice' && Array.isArray(currentAnswer)) {
      return currentAnswer.length > 0 && currentAnswer.length <= (currentQuestion.maxSelections || 999);
    }

    if (currentQuestion.type === 'rating') {
      return typeof currentAnswer === 'number' && currentAnswer >= 1 && currentAnswer <= 5;
    }

    if (currentQuestion.type === 'single_choice') {
      return typeof currentAnswer === 'string' && currentAnswer.length > 0;
    }

    if (currentQuestion.type === 'text') {
      return typeof currentAnswer === 'string' && currentAnswer.trim().length > 0;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </span>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
              {/* Question Header */}
              <div className="mb-8">
                {currentQuestion.icon && (
                  <div className="text-5xl mb-4">{currentQuestion.icon}</div>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.subtitle && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentQuestion.subtitle}
                  </p>
                )}
              </div>

              {/* Answer Input */}
              <div className="mb-8">
                {/* MULTIPLE CHOICE */}
                {currentQuestion.type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                            const newAnswer = isSelected
                              ? current.filter(v => v !== option.value)
                              : [...current, option.value].slice(0, currentQuestion.maxSelections || 999);
                            handleAnswer(currentQuestion.id, newAnswer);
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span className="text-2xl">{option.icon}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* SINGLE CHOICE */}
                {currentQuestion.type === 'single_choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = currentAnswer === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleAnswer(currentQuestion.id, option.value)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-purple-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                          </div>
                          <span className="text-2xl">{option.icon}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* RATING (1-5 scale) */}
                {currentQuestion.type === 'rating' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleAnswer(currentQuestion.id, rating)}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            currentAnswer === rating
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Star
                              className={`w-8 h-8 ${
                                currentAnswer >= rating
                                  ? 'text-pink-500 fill-pink-500'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {rating}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" />
                        Pas du tout
                      </span>
                      <span className="flex items-center gap-1">
                        Énormément
                        <ThumbsUp className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                )}

                {/* TEXT INPUT */}
                {currentQuestion.type === 'text' && (
                  <textarea
                    value={currentAnswer || ''}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    rows={4}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none resize-none"
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden md:inline">Précédent</span>
                </button>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {currentQuestion.maxSelections && (
                    <span>Sélectionne jusqu'à {currentQuestion.maxSelections} réponses</span>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  disabled={!isAnswerValid() || loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyse...</span>
                    </>
                  ) : isLastQuestion ? (
                    <>
                      <span>Voir mes résultats</span>
                      <Check className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <span className="hidden md:inline">Suivant</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Section Indicator */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-full">
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
              Section: {currentQuestion.section.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrientationTest;
