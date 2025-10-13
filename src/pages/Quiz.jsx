import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Award, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, completeQuiz } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes par défaut
  const [timerActive, setTimerActive] = useState(true);
  const [startTime] = useState(Date.now());

  // Fetch quiz data from Supabase
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const { default: dbHelpers } = await import('@/lib/supabaseDB');
        
        // Get quiz with questions
        const { data: quizData, error: quizError } = await dbHelpers.quiz.getQuiz(parseInt(quizId));
        
        if (quizError || !quizData) {
          toast({ 
            title: 'Erreur', 
            description: 'Quiz introuvable', 
            variant: 'destructive' 
          });
          navigate('/my-courses');
          return;
        }

        setQuiz(quizData);
        
        // Parse questions from quiz_questions table
        let parsedQuestions = []; // ✅ CORRIGÉ: Déclarer avant le if pour accès dans bloc timer
        if (quizData.quiz_questions && quizData.quiz_questions.length > 0) {
          parsedQuestions = quizData.quiz_questions.map(q => {
            // Options are already parsed by Supabase (PostgreSQL array type)
            // No need to JSON.parse() if already an array
            let optionsArray;
            if (Array.isArray(q.options)) {
              optionsArray = q.options;
            } else if (typeof q.options === 'string') {
              try {
                optionsArray = JSON.parse(q.options);
              } catch (e) {
                console.error('Error parsing options:', q.options, e);
                // If it's a CSV string, split it
                optionsArray = q.options.split(',').map(s => s.trim());
              }
            } else if (typeof q.options === 'object' && q.options !== null) {
              // PostgreSQL array already parsed as object
              optionsArray = Object.values(q.options);
            } else {
              optionsArray = [];
            }

            return {
              id: q.id,
              text: q.question,
              options: optionsArray,
              correctOption: q.correct_option, // 'A', 'B', 'C', or 'D'
              explanation: q.explanation || 'Bonne réponse !'
            };
          });
          setQuestions(parsedQuestions);
        } else {
          toast({ 
            title: 'Erreur', 
            description: 'Ce quiz ne contient pas de questions', 
            variant: 'destructive' 
          });
          navigate('/my-courses');
          return;
        }

        // ✅ CORRIGÉ: Timer adapté au nombre de questions ET à la difficulté
        if (quizData.duration_minutes) {
          // Utiliser la durée de la BDD (priorité)
          setTimeRemaining(quizData.duration_minutes * 60);
        } else if (parsedQuestions.length > 0) {
          // Sinon, calculer automatiquement selon difficulté
          const difficulty = (quizData.difficulty || 'Moyen').toLowerCase();
          const questionCount = parsedQuestions.length;
          
          // Temps par question selon difficulté (en secondes)
          const timePerQuestion = {
            'facile': 45,     // 45s par question facile
            'easy': 45,       // Support anglais (legacy)
            'moyen': 60,      // 60s par question moyenne
            'medium': 60,     // Support anglais (legacy)
            'difficile': 90,  // 90s par question difficile
            'hard': 90        // Support anglais (legacy)
          };
          
          const baseTime = timePerQuestion[difficulty] || 60;
          const totalTime = baseTime * questionCount;
          
          setTimeRemaining(totalTime);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast({ 
          title: 'Erreur', 
          description: 'Impossible de charger le quiz', 
          variant: 'destructive' 
        });
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, navigate, toast]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || isFinished) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          setTimerActive(false);
          handleSubmit(true); // Auto-submit when time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, isFinished]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert option letter to index (A=0, B=1, C=2, D=3)
  const letterToIndex = (letter) => {
    return letter.charCodeAt(0) - 'A'.charCodeAt(0);
  };

  // Convert index to option letter (0=A, 1=B, 2=C, 3=D)
  const indexToLetter = (index) => {
    return String.fromCharCode('A'.charCodeAt(0) + index);
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionIndex });
  };

  const handleSubmit = async (autoSubmit = false) => {
    setTimerActive(false);
    
    // Calculate score
    let correctCount = 0;
    const userAnswersArray = [];
    
    questions.forEach((q, index) => {
      const userAnswerIndex = selectedAnswers[q.id];
      const userAnswerLetter = userAnswerIndex !== undefined ? indexToLetter(userAnswerIndex) : null;
      const isCorrect = userAnswerLetter === q.correctOption;
      
      if (isCorrect) {
        correctCount++;
      }
      
      // ✅ ENRICHI: Ajouter détails complets pour Coach IA
      userAnswersArray.push({
        question_id: q.id,
        question_text: q.text,
        user_answer: userAnswerLetter,
        correct_answer: q.correctOption,
        is_correct: isCorrect,
        topic: q.topic || q.subject || quiz?.title || 'Général',
        difficulty: q.difficulty || 'moyen'
      });
    });

    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
    setIsFinished(true);

    // Save result to database via gamification
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds

      // completeQuiz sauvegarde le résultat ET attribue les points
      // ✅ CORRIGÉ: Une seule sauvegarde, score = nombre de bonnes réponses
      if (completeQuiz) {
        await completeQuiz(parseInt(quizId), correctCount, userAnswersArray, timeSpent);
      }
      // Pas de else - completeQuiz existe toujours via useAuth()

      // Track errors for recommendations (optional - skip if function doesn't exist)
      const incorrectAnswers = userAnswersArray.filter(a => !a.is_correct);
      if (incorrectAnswers.length > 0 && dbHelpers.progress?.trackError) {
        try {
          for (const answer of incorrectAnswers) {
            await dbHelpers.progress.trackError(
              user.id,
              answer.question_id,
              answer.user_answer
            );
          }
        } catch (err) {
          console.warn('Could not track errors:', err);
        }
      }

      toast({ 
        title: autoSubmit ? 'Temps écoulé !' : 'Quiz terminé !', 
        description: `Votre score : ${finalScore.toFixed(0)}%`,
        variant: finalScore >= 75 ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
      toast({ 
        title: 'Erreur', 
        description: 'Score calculé mais non sauvegardé', 
        variant: 'destructive' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-slate-600 dark:text-slate-300">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <Card className="max-w-md dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <p className="text-lg font-semibold dark:text-white">Quiz introuvable</p>
            <Button onClick={() => navigate('/my-courses')} className="mt-4">
              Retour aux cours
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (isFinished) {
    // ✅ CORRIGÉ: Recalculer le score ici pour éviter NaN (score state pas encore à jour)
    const correctCount = questions.filter(q => {
      const userAnswerIndex = selectedAnswers[q.id];
      const userAnswerLetter = userAnswerIndex !== undefined ? indexToLetter(userAnswerIndex) : null;
      return userAnswerLetter === q.correctOption;
    }).length;
    const calculatedScore = (correctCount / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-2xl text-center dark:bg-slate-800 dark:border-white/30 border-2 shadow-xl dark:shadow-[0_0_40px_rgba(255,255,255,0.5)]">
            <CardHeader>
              <CardTitle className="text-3xl dark:text-white">Résultats du Quiz</CardTitle>
              <p className="text-slate-500 dark:text-slate-400 mt-2">{quiz.title}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Award className={`w-24 h-24 mx-auto ${calculatedScore >= 75 ? 'text-yellow-500' : calculatedScore >= 50 ? 'text-orange-500' : 'text-slate-400'}`} />
                <p className="text-5xl font-bold mt-4">{calculatedScore.toFixed(0)}%</p>
                <p className="text-slate-500">
                  {calculatedScore >= 90 ? 'Excellent !' : calculatedScore >= 75 ? 'Très bien !' : calculatedScore >= 50 ? 'Pas mal' : 'Il faut réviser'}
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  {questions.filter(q => {
                    const userAnswerIndex = selectedAnswers[q.id];
                    const userAnswerLetter = userAnswerIndex !== undefined ? indexToLetter(userAnswerIndex) : null;
                    return userAnswerLetter === q.correctOption;
                  }).length} / {questions.length} bonnes réponses
                </p>
              </div>
              <div className="space-y-4 text-left max-h-96 overflow-y-auto">
                {questions.map((q, idx) => {
                  const userAnswerIndex = selectedAnswers[q.id];
                  const userAnswerLetter = userAnswerIndex !== undefined ? indexToLetter(userAnswerIndex) : null;
                  const isCorrect = userAnswerLetter === q.correctOption;
                  const correctIndex = letterToIndex(q.correctOption);
                  
                  return (
                    <div key={q.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                            Question {idx + 1}: {q.text}
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            <span className="font-medium">Votre réponse:</span>{' '}
                            {userAnswerLetter ? `${userAnswerLetter}) ${q.options[userAnswerIndex]}` : 'Non répondue'}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-700 font-bold mt-1">
                              <span className="font-medium">Bonne réponse:</span>{' '}
                              {q.correctOption}) {q.options[correctIndex]}
                            </p>
                          )}
                          {q.explanation && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 p-2 bg-white/50 rounded-md border border-slate-200">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-8">
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">
                  Voir Dashboard
                </Button>
                <Button onClick={() => navigate('/my-courses')} className="flex-1">
                  Retour aux cours
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{quiz.title} - E-Réussite</title>
      </Helmet>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl dark:text-white">{quiz.title}</CardTitle>
                {quiz.difficulty && (
                  <Badge className={
                    quiz.difficulty.toLowerCase() === 'facile' || quiz.difficulty.toLowerCase() === 'easy'
                      ? 'bg-green-100 text-green-800'
                      : quiz.difficulty.toLowerCase() === 'difficile' || quiz.difficulty.toLowerCase() === 'hard'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {quiz.difficulty}
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center text-slate-500 text-sm mt-2">
                <span className="font-medium">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </span>
                <div className={`flex items-center gap-2 font-mono ${timeRemaining < 60 ? 'text-red-600 font-bold' : ''}`}>
                  <Clock size={16} className={timeRemaining < 60 ? 'animate-pulse' : ''} />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <motion.div 
                key={currentQuestion.id} 
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg font-semibold mb-6 text-slate-800 dark:text-slate-100">
                  {currentQuestion.text}
                </p>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const optionLetter = indexToLetter(index);
                    const isSelected = selectedAnswers[currentQuestion.id] === index;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${
                          isSelected 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold text-primary mr-3">{optionLetter})</span>
                        {option}
                      </button>
                    );
                  })}
                </div>
                
                {/* Answer indicator */}
                <div className="mt-4 text-sm text-slate-500">
                  {selectedAnswers[currentQuestion.id] !== undefined ? (
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Réponse sélectionnée
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-orange-600">
                      <Clock className="w-4 h-4" />
                      Sélectionnez une réponse
                    </p>
                  )}
                </div>
              </motion.div>
              <div className="flex justify-between mt-8 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))} 
                  disabled={currentQuestionIndex === 0}
                  className="flex-1"
                >
                  ← Précédent
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button 
                    onClick={() => setCurrentQuestionIndex(p => p + 1)}
                    className="flex-1"
                  >
                    Suivant →
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleSubmit(false)} 
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    disabled={Object.keys(selectedAnswers).length < questions.length}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Terminer le quiz
                  </Button>
                )}
              </div>
              
              {/* Answered questions counter */}
              <div className="mt-4 text-center text-sm text-slate-500">
                {Object.keys(selectedAnswers).length} / {questions.length} questions répondues
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Quiz;