import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  FileText, Download, Video, Award, TrendingUp, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (examId) {
      fetchExam();
    }
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0 && exam && !showResults) {
      handleSubmitExam(true); // Auto-submit quand le temps est écoulé
      return;
    }
    
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, exam, showResults]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'examen avec sa matière
      const { data: examData, error: examError } = await supabase
        .from('examens')
        .select(`
          *,
          matiere:matieres(id, name, level)
        `)
        .eq('id', examId)
        .single();

      if (examError) throw examError;
      
      if (!examData) {
        toast({ 
          title: 'Examen non trouvé', 
          variant: 'destructive' 
        });
        navigate('/exam');
        return;
      }

      setExam(examData);
      setTimeLeft(examData.duration_minutes * 60);
      setStartTime(new Date());

      // Récupérer les questions de l'examen (si disponibles)
      // Pour l'instant, on génère des questions de démonstration
      // À remplacer par une vraie requête quand la table exam_questions existe
      const demoQuestions = generateDemoQuestions(examData);
      setQuestions(demoQuestions);
      
    } catch (error) {
      console.error('Erreur lors du chargement de l\'examen:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger l\'examen'
      });
      navigate('/exam');
    } finally {
      setLoading(false);
    }
  };

  // Génère des questions de démonstration (à remplacer par de vraies questions)
  const generateDemoQuestions = (examData) => {
    const baseQuestions = [
      {
        id: 1,
        question: `Question 1 - ${examData.matiere?.name}`,
        text: "Ceci est une question de démonstration. Dans un vrai examen, cette question serait liée au contenu du cours.",
        type: 'multiple_choice',
        options: [
          { id: 'a', text: 'Réponse A' },
          { id: 'b', text: 'Réponse B' },
          { id: 'c', text: 'Réponse C' },
          { id: 'd', text: 'Réponse D' }
        ],
        correct_answer: 'b',
        points: 5
      },
      {
        id: 2,
        question: `Question 2 - ${examData.matiere?.name}`,
        text: "Deuxième question de démonstration avec options différentes.",
        type: 'multiple_choice',
        options: [
          { id: 'a', text: 'Option 1' },
          { id: 'b', text: 'Option 2' },
          { id: 'c', text: 'Option 3' },
          { id: 'd', text: 'Option 4' }
        ],
        correct_answer: 'c',
        points: 5
      },
      {
        id: 3,
        question: `Question 3 - ${examData.matiere?.name}`,
        text: "Troisième question pour tester vos connaissances.",
        type: 'multiple_choice',
        options: [
          { id: 'a', text: 'Première possibilité' },
          { id: 'b', text: 'Deuxième possibilité' },
          { id: 'c', text: 'Troisième possibilité' },
          { id: 'd', text: 'Quatrième possibilité' }
        ],
        correct_answer: 'a',
        points: 5
      }
    ];

    // Générer plus de questions selon la durée
    const numQuestions = Math.max(5, Math.floor(examData.duration_minutes / 10));
    const questions = [];
    
    for (let i = 0; i < numQuestions; i++) {
      const baseQuestion = baseQuestions[i % baseQuestions.length];
      questions.push({
        ...baseQuestion,
        id: i + 1,
        question: `Question ${i + 1} - ${examData.matiere?.name}`
      });
    }

    return questions;
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmitExam = async (autoSubmit = false) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const endTime = new Date();
      const timeTaken = Math.floor((endTime - startTime) / 1000); // en secondes

      // Calculer le score
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      questions.forEach(q => {
        totalPoints += q.points;
        if (answers[q.id] === q.correct_answer) {
          correctAnswers++;
          earnedPoints += q.points;
        }
      });

      const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);

      // ✅ Construire les réponses détaillées pour Coach IA
      const detailedAnswers = questions.map(q => ({
        question_id: q.id,
        question_text: q.question || q.text,
        user_answer: answers[q.id] || null,
        correct_answer: q.correct_answer,
        is_correct: answers[q.id] === q.correct_answer,
        topic: q.topic || q.subject || exam?.title || 'Général',
        difficulty: q.difficulty || 'moyen',
        points: q.points
      }));

      // Sauvegarder le résultat dans la base de données
      const { data: resultData, error: resultError } = await supabase
        .from('exam_results')
        .insert({
          user_id: user.id,
          exam_id: examId,
          score: scorePercentage,
          time_taken: timeTaken,
          answers: detailedAnswers, // ✅ Format détaillé au lieu de simple objet
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (resultError) throw resultError;

      // Attribuer des points de gamification
      const pointsToAdd = Math.floor(scorePercentage * 2); // 2 points par % de réussite
      
      const { error: pointsError } = await supabase.rpc('add_user_points', {
        p_user_id: user.id,
        p_points: pointsToAdd,
        p_description: `Examen complété: ${exam.title}`,
        p_category: 'exam'
      });

      if (pointsError) console.error('Erreur points:', pointsError);

      setExamResult({
        score: scorePercentage,
        correctAnswers,
        totalQuestions: questions.length,
        timeTaken,
        pointsEarned: pointsToAdd
      });

      setShowResults(true);

      if (!autoSubmit) {
        toast({
          title: '✅ Examen terminé !',
          description: `Score: ${scorePercentage}% - ${pointsToAdd} points gagnés`
        });
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos résultats'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}min ${secs}s`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement de l'examen...</div>
      </div>
    );
  }

  // Écran de résultats
  if (showResults && examResult) {
    const passed = examResult.score >= 50;
    
    return (
      <>
        <Helmet>
          <title>Résultats - {exam.title} - E-Réussite</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              {passed ? (
                <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4" />
              ) : (
                <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
              )}
              <h1 className="text-4xl font-bold text-white mb-2">
                {passed ? 'Félicitations !' : 'Continuez vos efforts !'}
              </h1>
              <p className="text-xl text-blue-200">
                {exam.title}
              </p>
            </motion.div>

            {/* Carte de résultats principale */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 mb-6 shadow-xl dark:shadow-[0_0_40px_rgba(255,255,255,0.5)]">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-white mb-2">
                    {examResult.score}%
                  </div>
                  <p className="text-blue-200 text-lg">Score Final</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {examResult.correctAnswers}/{examResult.totalQuestions}
                    </div>
                    <p className="text-blue-200">Réponses Correctes</p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {formatDuration(examResult.timeTaken)}
                    </div>
                    <p className="text-blue-200">Temps Écoulé</p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                      +{examResult.pointsEarned}
                    </div>
                    <p className="text-blue-200">Points Gagnés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ressources complémentaires */}
            {exam.pdf_url || exam.correction_video_url ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 mb-6 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                <CardHeader>
                  <CardTitle className="text-white">Ressources Complémentaires</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exam.pdf_url && (
                    <a 
                      href={exam.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      <Download className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Télécharger le PDF</p>
                        <p className="text-sm text-gray-300">Sujet complet de l'examen</p>
                      </div>
                    </a>
                  )}
                  {exam.correction_video_url && (
                    <a 
                      href={exam.correction_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      <Video className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Vidéo de Correction</p>
                        <p className="text-sm text-gray-300">Explication détaillée</p>
                      </div>
                    </a>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/exam')}
                variant="outline"
                className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Retour aux examens
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Refaire l'examen
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Tableau de bord
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Écran principal de l'examen
  return (
    <>
      <Helmet>
        <title>{exam.title} - E-Réussite</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {/* En-tête avec timer */}
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{exam.title}</h1>
              <p className="text-blue-200 text-sm">{exam.matiere?.name}</p>
            </div>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-lg ${
              timeLeft < 300 ? 'bg-red-600/80 animate-pulse' : 'bg-blue-600/80'
            }`}>
              <Clock className="w-6 h-6" />
              <span className="font-mono text-2xl font-bold">{formatTime(timeLeft)}</span>
            </div>
          </header>

          {/* Barre de progression */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 mb-6 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm text-blue-200 mb-2">
                <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
                <span>{answeredCount} / {questions.length} réponses</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Question actuelle */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/30 mb-6 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">
                      {currentQuestion?.question}
                    </CardTitle>
                    <Badge className="bg-blue-600">{currentQuestion?.points} pts</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-200 text-lg mb-6">
                    {currentQuestion?.text}
                  </p>

                  {/* Options de réponse */}
                  <div className="space-y-3">
                    {currentQuestion?.options.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.id;
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/30 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-500 bg-blue-500' : 'border-white/50'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <span className="text-white font-medium">{option.id.toUpperCase()}.</span>
                            <span className="text-gray-200">{option.text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center gap-4">
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Précédent
            </Button>

            {currentQuestionIndex === questions.length - 1 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={answeredCount < questions.length}
                  >
                    Terminer l'examen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Terminer l'examen ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous avez répondu à {answeredCount} sur {questions.length} questions.
                      {answeredCount < questions.length && (
                        <span className="text-yellow-600 block mt-2">
                          ⚠️ Il reste {questions.length - answeredCount} question(s) sans réponse.
                        </span>
                      )}
                      <br />
                      Une fois terminé, vous ne pourrez plus modifier vos réponses.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSubmitExam(false)}>
                      Confirmer et terminer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Suivant
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Exam;
