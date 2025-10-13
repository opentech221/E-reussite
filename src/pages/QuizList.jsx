import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Clock, BookOpen, Target, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import ShareButton from '../components/ShareButton';
import dbHelpers from '../lib/supabaseDB';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const { data, error } = await dbHelpers.quiz.getQuizzes();
      
      if (error) {
        console.error('Erreur chargement quiz:', error);
        setError('Impossible de charger les quiz');
        return;
      }

      // Charger les questions pour chaque quiz
      const quizzesWithQuestions = await Promise.all(
        data.map(async (quiz) => {
          const { data: questions } = await dbHelpers.quiz.getQuizQuestions(quiz.id);
          const questionCount = questions?.length || 0;
          
          // Calculer le temps selon la difficulté (comme dans Quiz.jsx)
          const difficulty = (quiz.difficulty || 'Moyen').toLowerCase();
          const timePerQuestion = {
            'facile': 0.75,   // 45s = 0.75 min
            'easy': 0.75,
            'moyen': 1,       // 60s = 1 min
            'medium': 1,
            'difficile': 1.5, // 90s = 1.5 min
            'hard': 1.5
          };
          
          const minutesPerQuestion = timePerQuestion[difficulty] || 1;
          const time_limit = minutesPerQuestion * questionCount; // Garder les décimales
          
          return {
            ...quiz,
            questionCount,
            time_limit
          };
        })
      );

      setQuizzes(quizzesWithQuestions);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    switch (diff) {
      case 'facile':
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moyen':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'difficile':
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:text-slate-100';
    }
  };

  const getSubjectIcon = (subject) => {
    // Icons basés sur la matière
    return <Brain className="w-6 h-6" />;
  };

  const formatTime = (minutes) => {
    if (!minutes) return '15 min';
    
    // Si c'est un nombre entier, afficher simplement
    if (Number.isInteger(minutes)) {
      return `${minutes} min`;
    }
    
    // Sinon, convertir en minutes:secondes
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    
    if (secs === 0) return `${mins} min`;
    if (secs === 45) return `${mins} min 45s`;
    if (secs === 30) return `${mins} min 30s`;
    
    return `${mins}-${mins + 1} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600 dark:text-slate-300">Chargement des quiz...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto dark:bg-slate-800 dark:border-white/20 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={loadQuizzes}>Réessayer</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* En-tête */}
        <div className="text-center mb-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Quiz Disponibles
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Testez vos connaissances et progressez à votre rythme. Choisissez un quiz pour commencer !
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{quizzes.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Quiz disponibles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {quizzes.reduce((acc, q) => acc + q.questionCount, 0)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Questions au total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {quizzes.reduce((acc, q) => acc + (q.time_limit || 15), 0)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Minutes de contenu</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des quiz */}
        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-4">Aucun quiz disponible pour le moment.</p>
              <Link to="/my-courses">
                <Button>Voir les cours</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-xl dark:bg-slate-800 dark:border-white/20 border-2 dark:shadow-[0_0_25px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {getSubjectIcon(quiz.subject)}
                    </div>
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty || 'Moyen'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    {quiz.description || 'Testez vos connaissances sur ce sujet'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Métadonnées */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 mb-6">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{quiz.questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(quiz.time_limit)}</span>
                    </div>
                  </div>

                  {/* Bouton d'action */}
                  <div className="flex gap-2">
                    <Link to={`/quiz/${quiz.id}`} className="flex-1">
                      <Button className="w-full group">
                        Commencer le quiz
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    
                    <ShareButton
                      url={`${window.location.origin}/quiz/${quiz.id}`}
                      title={quiz.title}
                      description={`Quiz de ${quiz.subject} - ${quiz.questionCount} questions`}
                      type="quiz"
                      resourceId={quiz.id}
                      options={{
                        tags: [quiz.subject, quiz.difficulty, 'quiz']
                      }}
                      variant="outline"
                      showIcon={true}
                      buttonText=""
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Conseil */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-white/30 border-2 shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Conseil</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Prenez votre temps pour lire chaque question. Vous pouvez voir vos résultats
                  et progresser dans le classement après chaque quiz complété !
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizList;
