import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/customSupabaseClient';

/**
 * Hook pour gérer un quiz interactif dans le chat Coach IA
 * 
 * Fonctionnalités :
 * - Chargement questions adaptées au niveau/matière
 * - Gestion progression (question par question)
 * - Validation réponses avec correction instantanée
 * - Calcul score en temps réel
 * - Timer pour chaque question
 * - Sauvegarde session dans BDD
 * - Déblocage badges automatique si score ≥ 80%
 * - Attribution points selon performance
 */
export const useInteractiveQuiz = ({ userId, subject, chapter, difficulty = 'medium' }) => {
  // États principaux
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Timer
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const timerRef = useRef(null);
  
  // État de correction
  const [showCorrection, setShowCorrection] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  
  // Statistiques finales
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  /**
   * Démarrer le timer
   */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setQuestionStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  }, []);

  /**
   * Arrêter le timer
   */
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Charger les questions depuis la BDD
   */
  const loadQuestions = useCallback(async () => {
    if (!subject) {
      console.error('Subject is undefined');
      setError('Matière non définie');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Pour l'instant, utilisons les questions hardcodées
      // TODO: Remplacer par vraie requête BDD quand table questions existe
      const hardcodedQuestions = [
        {
          id: 1,
          question: "Quelle est la capitale du Sénégal ?",
          options: ["Dakar", "Thiès", "Saint-Louis", "Kaolack"],
          correct_answer: 0,
          explanation: "Dakar est la capitale économique et politique du Sénégal depuis 1960.",
          subject: subject,
          difficulty: difficulty
        },
        {
          id: 2,
          question: "Combien font 5 × 8 ?",
          options: ["35", "40", "45", "50"],
          correct_answer: 1,
          explanation: "5 × 8 = 40. C'est une multiplication de base à connaître par cœur.",
          subject: subject,
          difficulty: difficulty
        },
        {
          id: 3,
          question: "Quelle est la formule de l'aire d'un rectangle ?",
          options: ["Longueur + Largeur", "Longueur × Largeur", "2 × (Longueur + Largeur)", "Longueur²"],
          correct_answer: 1,
          explanation: "L'aire d'un rectangle = Longueur × Largeur. C'est une formule fondamentale en géométrie.",
          subject: subject,
          difficulty: difficulty
        },
        {
          id: 4,
          question: "Comment dit-on 'Bonjour' en anglais ?",
          options: ["Goodbye", "Hello", "Thanks", "Sorry"],
          correct_answer: 1,
          explanation: "'Hello' signifie 'Bonjour' en anglais. C'est la salutation la plus courante.",
          subject: subject,
          difficulty: difficulty
        },
        {
          id: 5,
          question: "Quel est le résultat de 15 - 7 ?",
          options: ["6", "7", "8", "9"],
          correct_answer: 2,
          explanation: "15 - 7 = 8. Pour vérifier : 8 + 7 = 15.",
          subject: subject,
          difficulty: difficulty
        }
      ];

      setQuestions(hardcodedQuestions);
      return hardcodedQuestions;

      // Code pour BDD réelle (décommenter quand table 'questions' existe)
      /*
      const { data, error: fetchError } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', subject)
        .eq('difficulty', difficulty)
        .limit(10);

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        throw new Error(`Aucune question trouvée pour ${subject} (${difficulty})`);
      }

      // Mélanger aléatoirement les questions côté client
      const shuffled = data.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      return shuffled;
      */
    } catch (err) {
      console.error('Erreur chargement questions:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [subject, difficulty]);

  /**
   * Créer une session de quiz dans la BDD
   */
  const createQuizSession = useCallback(async (loadedQuestions) => {
    try {
      // Créer session via fonction SQL
      const { data, error: insertError } = await supabase.rpc('start_interactive_quiz', {
        p_user_id: userId,
        p_subject_id: null, // TODO: Mapper 'Mathématiques' -> ID de matieres
        p_chapter_id: null,
        p_conversation_id: null,
        p_total_questions: loadedQuestions.length,
        p_difficulty_level: difficulty
      });

      if (insertError) throw insertError;

      const sessionId = data.session_id;
      setSessionId(sessionId);
      console.log('✅ Session créée:', sessionId);
      return sessionId;
    } catch (err) {
      console.error('Erreur création session:', err);
      setError(err.message);
      // Fallback: ID temporaire si erreur
      const tempSessionId = `temp_${Date.now()}`;
      setSessionId(tempSessionId);
      return tempSessionId;
    }
  }, [userId, subject, chapter, difficulty]);

  /**
   * Démarrer le quiz
   */
  const startQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsActive(false);

    try {
      // 1. Charger les questions
      const loadedQuestions = await loadQuestions();
      if (!loadedQuestions) return false;

      // 2. Créer la session
      const newSessionId = await createQuizSession(loadedQuestions);
      if (!newSessionId) return false;

      // 3. Initialiser l'état
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setScore(0);
      setTimeElapsed(0);
      setQuizCompleted(false);
      setFinalStats(null);
      setIsActive(true);

      // 4. Démarrer le timer
      startTimer();

      return true;
    } catch (err) {
      console.error('Erreur démarrage quiz:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadQuestions, createQuizSession, startTimer]);

  /**
   * Soumettre une réponse
   */
  const submitAnswer = useCallback(async (selectedOption) => {
    if (!isActive || currentQuestionIndex >= questions.length) return;

    const currentQuestion = questions[currentQuestionIndex];
    
    // Trouver l'index de l'option sélectionnée
    const selectedIndex = currentQuestion.options.indexOf(selectedOption);
    const isCorrect = selectedIndex === currentQuestion.correct_answer;
    
    // Temps passé sur la question
    const timeSpent = questionStartTime 
      ? Math.floor((Date.now() - questionStartTime) / 1000) 
      : 0;

    // Enregistrer la réponse EN BASE DE DONNÉES
    try {
      // Convertir l'index correct en lettre (A, B, C, D)
      const correctOptionLetter = ['A', 'B', 'C', 'D'][currentQuestion.correct_answer];
      
      const { error: insertError } = await supabase
        .from('interactive_quiz_questions')
        .insert({
          session_id: sessionId,
          question_number: currentQuestionIndex + 1,
          question_text: currentQuestion.question,
          question_type: 'qcm',
          option_a: currentQuestion.options[0] || null,
          option_b: currentQuestion.options[1] || null,
          option_c: currentQuestion.options[2] || null,
          option_d: currentQuestion.options[3] || null,
          correct_option: correctOptionLetter,
          user_answer: selectedOption,
          is_correct: isCorrect,
          answered_at: new Date().toISOString(),
          time_to_answer_seconds: timeSpent,
          explanation: currentQuestion.explanation || null
        });

      if (insertError) {
        console.error('❌ Erreur sauvegarde réponse:', insertError);
      } else {
        console.log(`✅ Réponse ${currentQuestionIndex + 1} sauvegardée:`, isCorrect ? 'Correct ✓' : 'Incorrect ✗');
      }
    } catch (err) {
      console.error('❌ Erreur insertion réponse:', err);
    }

    // Aussi garder dans l'état local pour l'affichage
    const answer = {
      question_id: currentQuestion.id,
      user_answer: selectedOption,
      user_answer_index: selectedIndex,
      correct_answer: currentQuestion.correct_answer,
      is_correct: isCorrect,
      time_spent: timeSpent,
      explanation: currentQuestion.explanation
    };

    setUserAnswers(prev => [...prev, answer]);
    setCurrentAnswer(answer);
    setShowCorrection(true);

    // Mettre à jour le score
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    return answer;
  }, [isActive, currentQuestionIndex, questions, questionStartTime, sessionId]);

  /**
   * Passer à la question suivante
   */
  const nextQuestion = useCallback(() => {
    setShowCorrection(false);
    setCurrentAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      // Quiz terminé
      completeQuiz();
    }
  }, [currentQuestionIndex, questions.length]);

  /**
   * Calculer les statistiques finales
   */
  const calculateFinalStats = useCallback(() => {
    const totalQuestions = questions.length;
    // CORRECTION : Compter les réponses correctes depuis userAnswers au lieu de score
    // pour éviter le problème d'état asynchrone
    const correctAnswers = userAnswers.filter(a => a.is_correct).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const averageTimePerQuestion = Math.round(timeElapsed / totalQuestions);

    // Points gagnés (formule : base 10 pts + bonus performance)
    const basePoints = correctAnswers * 10;
    const bonusPoints = percentage >= 80 ? 50 : percentage >= 60 ? 20 : 0;
    const totalPoints = basePoints + bonusPoints;

    // Badge débloqué ?
    const badgeUnlocked = percentage >= 80 ? {
      name: `Expert ${subject}`,
      icon: '🏆',
      description: `Quiz ${subject} réussi avec ${percentage}% !`
    } : null;

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      percentage,
      totalPoints,
      badgeUnlocked,
      timeElapsed,
      averageTimePerQuestion,
      difficulty,
      subject,
      chapter
    };
  }, [questions.length, userAnswers, timeElapsed, difficulty, subject, chapter]);

  /**
   * Terminer le quiz et sauvegarder
   */
  const completeQuiz = useCallback(async () => {
    stopTimer();
    setIsActive(false);
    setQuizCompleted(true);

    try {
      console.log('📊 Finalisation du quiz...');
      
      // CORRECTION : Attendre 300ms pour laisser le temps aux dernières réponses
      // d'être enregistrées en base de données avant de compter
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Terminer la session via fonction SQL (qui compte les vraies réponses en BDD)
      const { data, error: completeError } = await supabase.rpc('complete_interactive_quiz', {
        p_session_id: sessionId
      });

      if (completeError) {
        console.error('Erreur finalisation quiz:', completeError);
        // En cas d'erreur, calculer les stats localement en fallback
        const stats = calculateFinalStats();
        setFinalStats(stats);
        return stats;
      }

      console.log('✅ Session terminée:', data);

      // CORRECTION : Utiliser les données retournées par la fonction SQL
      // (qui compte les vraies réponses depuis la BDD)
      const stats = {
        totalQuestions: data.total_questions,
        correctAnswers: data.correct_answers,
        wrongAnswers: data.total_questions - data.correct_answers,
        percentage: Math.round(data.score_percentage),
        totalPoints: data.points_earned,
        badgeUnlocked: data.badge_unlocked ? {
          name: data.badge_unlocked,
          icon: data.badge_unlocked.includes('🏆') ? '🏆' : 
                data.badge_unlocked.includes('🥇') ? '🥇' :
                data.badge_unlocked.includes('🥈') ? '🥈' :
                data.badge_unlocked.includes('🥉') ? '🥉' : '✅',
          description: `Quiz ${subject} réussi avec ${Math.round(data.score_percentage)}% !`
        } : null,
        timeElapsed,
        averageTimePerQuestion: Math.round(timeElapsed / data.total_questions),
        difficulty,
        subject,
        chapter
      };

      console.log('📊 Quiz terminé - Stats:', stats);
      setFinalStats(stats);

      return stats;
    } catch (err) {
      console.error('Erreur finalisation quiz:', err);
      setError(err.message);
      // En cas d'erreur, calculer les stats localement en fallback
      const stats = calculateFinalStats();
      setFinalStats(stats);
      return stats;
    }
  }, [
    stopTimer,
    calculateFinalStats,
    sessionId,
    timeElapsed,
    difficulty,
    subject,
    userAnswers
  ]);

  /**
   * Abandonner le quiz
   */
  const abandonQuiz = useCallback(async () => {
    stopTimer();
    setIsActive(false);

    if (sessionId) {
      try {
        await supabase
          .from('interactive_quiz_sessions')
          .update({
            status: 'abandoned',
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      } catch (err) {
        console.error('Erreur abandon quiz:', err);
      }
    }

    // Réinitialiser l'état
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setTimeElapsed(0);
    setSessionId(null);
    setQuizCompleted(false);
    setFinalStats(null);
  }, [sessionId, stopTimer]);

  /**
   * Nettoyage à la fermeture
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Question courante
  const currentQuestion = questions[currentQuestionIndex] || null;

  // Progression
  const progress = questions.length > 0
    ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100)
    : 0;

  return {
    // État
    isActive,
    isLoading,
    error,
    quizCompleted,
    
    // Questions
    questions,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: questions.length,
    
    // Réponses & Score
    userAnswers,
    currentAnswer,
    showCorrection,
    score,
    progress,
    
    // Timer
    timeElapsed,
    
    // Statistiques finales
    finalStats,
    
    // Actions
    startQuiz,
    submitAnswer,
    nextQuestion,
    abandonQuiz
  };
};

export default useInteractiveQuiz;
