import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Target,
  Brain,
  RotateCcw,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { trackPageView, trackFeatureUsage } from '@/lib/analytics';

const QuizReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizResults, setQuizResults] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizDetails, setQuizDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    if (user) {
      fetchQuizReviewData();
      trackPageView('quiz_review', user.id);
    }
  }, [user]);

  const fetchQuizReviewData = async () => {
    setLoading(true);
    try {
      // 1. Récupérer l'historique des quiz
      const { data: resultsData, error: resultsError } = await supabase
        .from('quiz_results')
        .select(`
          id,
          quiz_id,
          score,
          correct_answers,
          total_questions,
          time_taken,
          completed_at,
          answers,
          quiz:quiz_id (
            id,
            title,
            description,
            difficulte,
            lecons:lecon_id (
              id,
              title,
              chapitres:chapitre_id (
                id,
                title,
                matieres:matiere_id (
                  id,
                  name,
                  color
                )
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (resultsError) throw resultsError;
      setQuizResults(resultsData || []);

      // 2. Récupérer les statistiques globales
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_quiz_stats', { p_user_id: user.id });

      if (!statsError && statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // 3. Analyser les sujets faibles (scores < 70%)
      const weakSubjects = {};
      resultsData?.forEach(result => {
        if (result.score < 70) {
          const matiere = result.quiz?.lecons?.chapitres?.matieres;
          if (matiere) {
            if (!weakSubjects[matiere.id]) {
              weakSubjects[matiere.id] = {
                id: matiere.id,
                name: matiere.name,
                color: matiere.color,
                count: 0,
                avgScore: 0,
                scores: []
              };
            }
            weakSubjects[matiere.id].count++;
            weakSubjects[matiere.id].scores.push(result.score);
          }
        }
      });

      // Calculer moyenne et trier par urgence
      const weakTopicsList = Object.values(weakSubjects).map(topic => ({
        ...topic,
        avgScore: Math.round(topic.scores.reduce((a, b) => a + b, 0) / topic.scores.length)
      })).sort((a, b) => a.avgScore - b.avgScore);

      setWeakTopics(weakTopicsList);

    } catch (error) {
      console.error('Error fetching quiz review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizDetails = async (quizId, resultId) => {
    try {
      // Récupérer les détails du quiz avec questions et réponses de l'utilisateur
      const { data: result, error: resultError } = await supabase
        .from('quiz_results')
        .select(`
          id,
          quiz_id,
          score,
          correct_answers,
          total_questions,
          answers,
          quiz:quiz_id (
            id,
            title,
            quiz_questions (
              id,
              question,
              options,
              correct_option,
              explanation
            )
          )
        `)
        .eq('id', resultId)
        .eq('user_id', user.id)
        .single();

      if (resultError) throw resultError;
      setQuizDetails(result);
      setSelectedQuiz(quizId);

      trackFeatureUsage('quiz_review_details_view', user.id, { quiz_id: quizId });
    } catch (error) {
      console.error('Error fetching quiz details:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const retryQuiz = (quizId) => {
    trackFeatureUsage('quiz_retry', user.id, { quiz_id: quizId });
    navigate(`/quiz/${quizId}`);
  };

  const reviewWeakTopic = (matiereId) => {
    trackFeatureUsage('review_weak_topic', user.id, { matiere_id: matiereId });
    navigate(`/lessons?matiere=${matiereId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de vos révisions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📝 Révision des Quiz
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analysez vos performances et identifiez vos points à améliorer
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Complétés</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quizzes_completed || 0}</div>
              <p className="text-xs text-muted-foreground">Total tentatives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(stats.average_score)}`}>
                {Math.round(stats.average_score || 0)}%
              </div>
              <p className="text-xs text-muted-foreground">Performance globale</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meilleur Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(stats.best_score || 0)}%
              </div>
              <p className="text-xs text-muted-foreground">Record personnel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats.total_time_spent || 0) / 60)}m
              </div>
              <p className="text-xs text-muted-foreground">Temps d'étude</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="history">
            <BookOpen className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="weak-topics">
            <AlertCircle className="h-4 w-4 mr-2" />
            Points Faibles
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Brain className="h-4 w-4 mr-2" />
            Recommandations
          </TabsTrigger>
        </TabsList>

        {/* Tab: Historique */}
        <TabsContent value="history" className="space-y-4">
          {quizResults.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Vous n'avez pas encore complété de quiz
                </p>
                <Button className="mt-4" onClick={() => navigate('/lessons')}>
                  Commencer un quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            quizResults.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {result.quiz?.title || 'Quiz sans titre'}
                        </h3>
                        <Badge 
                          variant={getScoreBadgeVariant(result.score)}
                          className="text-xs"
                        >
                          {Math.round(result.score)}%
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {result.quiz?.lecons?.chapitres?.matieres && (
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${result.quiz.lecons.chapitres.matieres.color}20`,
                              color: result.quiz.lecons.chapitres.matieres.color 
                            }}
                          >
                            {result.quiz.lecons.chapitres.matieres.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {result.correct_answers || 0}/{result.total_questions || 0} correctes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(result.time_taken)}
                        </span>
                        <span>
                          {new Date(result.completed_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchQuizDetails(result.quiz_id, result.id)}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Analyser
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => retryQuiz(result.quiz_id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Refaire
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab: Points Faibles */}
        <TabsContent value="weak-topics" className="space-y-4">
          {weakTopics.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun point faible détecté ! Continue comme ça ! 🎉
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                        Sujets nécessitant une révision
                      </h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        Ces matières ont des scores inférieurs à 70%. Concentrez-vous sur ces sujets pour améliorer vos performances.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {weakTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: topic.color }}
                          />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {topic.name}
                          </h3>
                          <Badge variant="destructive">
                            {topic.count} quiz échoués
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className={`flex items-center gap-1 font-medium ${getScoreColor(topic.avgScore)}`}>
                            <TrendingDown className="h-4 w-4" />
                            Score moyen: {topic.avgScore}%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => reviewWeakTopic(topic.id)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Réviser
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* Tab: Recommandations */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recommandations Personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && (
                <>
                  {stats.average_score < 70 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        🚨 Score moyen faible
                      </h4>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Votre score moyen est de {Math.round(stats.average_score)}%. Nous vous recommandons de :
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4 list-disc">
                        <li>Revoir les bases des matières où vous avez le plus de difficultés</li>
                        <li>Prendre plus de temps pour lire les questions</li>
                        <li>Faire des exercices supplémentaires</li>
                      </ul>
                    </div>
                  )}

                  {stats.average_score >= 70 && stats.average_score < 85 && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                        ⚡ Bon niveau, continuez !
                      </h4>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        Vous êtes sur la bonne voie avec {Math.round(stats.average_score)}% de moyenne. Pour atteindre l'excellence :
                      </p>
                      <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4 list-disc">
                        <li>Concentrez-vous sur les détails</li>
                        <li>Approfondissez vos connaissances dans vos matières faibles</li>
                        <li>Variez les types de quiz pour renforcer votre compréhension</li>
                      </ul>
                    </div>
                  )}

                  {stats.average_score >= 85 && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        🎉 Excellent travail !
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Avec {Math.round(stats.average_score)}% de moyenne, vous maîtrisez bien le contenu ! Pour maintenir ce niveau :
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4 list-disc">
                        <li>Maintenez un rythme régulier de révision</li>
                        <li>Challengez-vous avec des quiz plus difficiles</li>
                        <li>Aidez d'autres étudiants à progresser</li>
                      </ul>
                    </div>
                  )}

                  {weakTopics.length > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        🎯 Plan de révision ciblé
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Nous avons identifié {weakTopics.length} matière(s) où vous pouvez vous améliorer :
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        {weakTopics.slice(0, 3).map(topic => (
                          <li key={topic.id} className="flex items-center justify-between">
                            <span>• {topic.name} (moyenne: {topic.avgScore}%)</span>
                            <Button 
                              size="sm" 
                              variant="link" 
                              onClick={() => reviewWeakTopic(topic.id)}
                              className="text-blue-600 dark:text-blue-400"
                            >
                              Réviser →
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quiz Details Modal */}
      {quizDetails && (
        <Card className="mt-8 border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analyse Détaillée</CardTitle>
              <Button variant="ghost" onClick={() => setQuizDetails(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">{quizDetails.quiz?.title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Score: {Math.round(quizDetails.score)}% ({quizDetails.correct_answers}/{quizDetails.total_questions} correctes)
            </div>

            {quizDetails.quiz?.quiz_questions?.map((question, idx) => {
              const userAnswer = quizDetails.answers?.[idx];
              const isCorrect = userAnswer === question.correct_option;

              return (
                <div 
                  key={question.id} 
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Question {idx + 1}: {question.question}
                      </p>
                    </div>
                  </div>

                  <div className="ml-7 space-y-2">
                    {question.options?.map((option, optIdx) => (
                      <div 
                        key={optIdx}
                        className={`p-2 rounded text-sm ${
                          optIdx === question.correct_option
                            ? 'bg-green-100 dark:bg-green-900/40 font-semibold'
                            : optIdx === userAnswer && !isCorrect
                            ? 'bg-red-100 dark:bg-red-900/40'
                            : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        {option}
                        {optIdx === question.correct_option && ' ✓ (Bonne réponse)'}
                        {optIdx === userAnswer && !isCorrect && ' ✗ (Votre réponse)'}
                      </div>
                    ))}
                  </div>

                  {question.explanation && !isCorrect && (
                    <div className="ml-7 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">💡 Explication:</p>
                      <p className="text-blue-800 dark:text-blue-200">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            <Button 
              className="w-full mt-4" 
              onClick={() => retryQuiz(quizDetails.quiz_id)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refaire ce quiz
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizReview;
