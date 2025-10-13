import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Brain, TrendingUp, Target, AlertTriangle, Sparkles, Trophy,
  CheckCircle, Calendar, Clock, Zap, BookOpen, Star, Award,
  ChevronRight, RefreshCw, MessageSquare, Download
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import AICoachService from '@/lib/aiCoachService';

const AICoach = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [aiCoach, setAiCoach] = useState(null);

  useEffect(() => {
    if (user) {
      initializeCoach();
    }
  }, [user]);

  const initializeCoach = async () => {
    setLoading(true);
    try {
      const coach = new AICoachService(user.id);
      setAiCoach(coach);

      // Analyser les performances
      const performanceAnalysis = await coach.analyzePerformance();
      setAnalysis(performanceAnalysis);

      // Générer message motivant
      const message = coach.generateMotivationalMessage(performanceAnalysis);
      setMotivationalMessage(message);

      // Générer plan d'étude
      const plan = await coach.generateStudyPlan(null, 2);
      setStudyPlan(plan);

      console.log('🤖 [AI Coach] Initialisation complète:', {
        analysis: performanceAnalysis,
        plan
      });

    } catch (error) {
      console.error('❌ [AI Coach] Erreur initialisation:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger l\'analyse IA'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await initializeCoach();
    toast({
      title: '✅ Analyse mise à jour',
      description: 'Vos données ont été analysées à nouveau'
    });
  };

  const handleStartAction = (action) => {
    switch (action) {
      case 'exam':
        navigate('/exam');
        break;
      case 'course':
        navigate('/my-courses');
        break;
      case 'subject':
        navigate('/my-courses');
        break;
      default:
        navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">🤖 Votre coach IA analyse vos données...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
            <p className="text-slate-600 mb-4">Impossible de charger l'analyse IA</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSuccessColor = (level) => {
    if (level === 'high') return 'text-green-600';
    if (level === 'medium') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <Helmet>
        <title>Coach IA - E-Réussite</title>
        <meta name="description" content="Votre coach IA personnel analyse vos performances et vous guide vers la réussite" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Brain className="w-8 h-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">Votre Coach IA</h1>
                      <p className="text-blue-100">Analyse personnalisée de vos performances</p>
                    </div>
                  </div>

                  {/* Message motivant */}
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 border border-white/20">
                    <p className="text-lg font-medium">{motivationalMessage}</p>
                  </div>

                  {/* Note globale */}
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Votre Note Globale</p>
                      <div className={`text-4xl font-bold ${getGradeColor(analysis.overall.grade)} inline-block px-4 py-2 rounded-lg`}>
                        {analysis.overall.grade}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Niveau</p>
                      <p className="text-3xl font-bold">{analysis.overall.level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Streak</p>
                      <p className="text-3xl font-bold flex items-center gap-2">
                        🔥 {analysis.studyHabits.currentStreak}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="secondary" 
                  onClick={handleRefresh}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </Button>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="strengths">Forces & Faiblesses</TabsTrigger>
              <TabsTrigger value="predictions">Prédictions</TabsTrigger>
              <TabsTrigger value="plan">Plan d'étude</TabsTrigger>
            </TabsList>

            {/* Onglet Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              {/* Statistiques générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <BookOpen className="w-8 h-8 text-blue-500" />
                        <span className="text-3xl font-bold text-blue-600">
                          {analysis.overall.completionRate}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600">Taux de complétion</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {analysis.overall.completedChapters}/{analysis.overall.totalChapters} chapitres
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Target className="w-8 h-8 text-green-500" />
                        <span className="text-3xl font-bold text-green-600">
                          {analysis.exams.avgScore}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600">Score moyen examens</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {analysis.exams.totalExams} examen{analysis.exams.totalExams > 1 ? 's' : ''} passé{analysis.exams.totalExams > 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Trophy className="w-8 h-8 text-purple-500" />
                        <span className="text-3xl font-bold text-purple-600">
                          {analysis.overall.totalPoints}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600">Points totaux</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Niveau {analysis.overall.level}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Zap className="w-8 h-8 text-orange-500" />
                        <span className="text-3xl font-bold text-orange-600">
                          {analysis.studyHabits.currentStreak}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600">Jours consécutifs</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {analysis.studyHabits.consistency === 'excellent' ? '🔥 Excellent' : 
                         analysis.studyHabits.consistency === 'good' ? '✅ Bien' : '⚠️ À améliorer'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Performance par matière */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance par Matière
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.bySubject.map((subject, index) => (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              subject.status === 'mastered' ? 'bg-green-100 text-green-600' :
                              subject.status === 'good' ? 'bg-blue-100 text-blue-600' :
                              subject.status === 'learning' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {subject.status === 'mastered' ? '🌟' : 
                               subject.status === 'good' ? '✅' :
                               subject.status === 'learning' ? '📚' : '🔷'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{subject.name}</p>
                              <p className="text-xs text-slate-500">
                                {subject.completed}/{subject.total} chapitres • {subject.timeSpent} min
                              </p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-slate-700">
                            {subject.completionRate}%
                          </span>
                        </div>
                        <Progress value={subject.completionRate} className="h-2" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Forces & Faiblesses */}
            <TabsContent value="strengths" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Forces */}
                <Card className="border-2 border-green-200 bg-green-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Star className="w-5 h-5" />
                      💪 Vos Forces
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.strengths.length > 0 ? (
                      <div className="space-y-4">
                        {analysis.strengths.map((strength, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-white rounded-lg border-l-4 border-l-green-500 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">{strength.icon}</span>
                              <div className="flex-1">
                                <h4 className="font-semibold text-green-900 mb-1">
                                  {strength.title}
                                </h4>
                                <p className="text-sm text-slate-600">
                                  {strength.description}
                                </p>
                              </div>
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>Continuez à étudier pour développer vos forces ! 💪</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Faiblesses */}
                <Card className="border-2 border-orange-200 bg-orange-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <AlertTriangle className="w-5 h-5" />
                      🎯 Points à Améliorer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.weaknesses.length > 0 ? (
                      <div className="space-y-4">
                        {analysis.weaknesses.map((weakness, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-white rounded-lg border-l-4 border-l-orange-500 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">{weakness.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-orange-900">
                                    {weakness.title}
                                  </h4>
                                  {weakness.priority === 'high' && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                      Prioritaire
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-3">
                                  {weakness.description}
                                </p>
                                <div className="bg-orange-50 rounded p-3">
                                  <p className="text-xs font-semibold text-orange-800 mb-2">
                                    💡 Recommandations :
                                  </p>
                                  <ul className="space-y-1">
                                    {weakness.recommendations.map((rec, i) => (
                                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                        <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-500" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p className="mb-2">🌟 Excellent travail !</p>
                        <p className="text-sm">Aucune faiblesse majeure détectée</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Prédictions */}
            <TabsContent value="predictions" className="space-y-6">
              {/* Prédiction de réussite */}
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    🎯 Prédiction de Réussite aux Examens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-lg mb-4">
                      <span className={`text-5xl font-bold ${getSuccessColor(analysis.predictions.examSuccess.level)}`}>
                        {analysis.predictions.examSuccess.percentage}%
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-slate-800 mb-2">
                      {analysis.predictions.examSuccess.message}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <span className="text-xs text-slate-600">Confiance de l'analyse :</span>
                      <span className={`text-sm font-semibold ${
                        analysis.predictions.examSuccess.confidence === 'high' ? 'text-green-600' :
                        analysis.predictions.examSuccess.confidence === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {analysis.predictions.examSuccess.confidence === 'high' ? 'Élevée' :
                         analysis.predictions.examSuccess.confidence === 'medium' ? 'Moyenne' :
                         'Faible'}
                      </span>
                    </div>
                  </div>

                  {/* Performance par difficulté */}
                  {analysis.exams.totalExams > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="p-4 bg-green-50 rounded-lg text-center border border-green-200">
                        <p className="text-xs font-medium text-green-700 mb-1">🟢 Facile</p>
                        <p className="text-2xl font-bold text-green-600">
                          {analysis.exams.byDifficulty.facile}%
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg text-center border border-yellow-200">
                        <p className="text-xs font-medium text-yellow-700 mb-1">🟡 Moyen</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {analysis.exams.byDifficulty.moyen}%
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg text-center border border-red-200">
                        <p className="text-xs font-medium text-red-700 mb-1">🔴 Difficile</p>
                        <p className="text-2xl font-bold text-red-600">
                          {analysis.exams.byDifficulty.difficile}%
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prochain niveau */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Prochain Niveau
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Niveau actuel</span>
                        <span className="text-2xl font-bold text-primary">
                          {analysis.predictions.nextLevel.currentLevel}
                        </span>
                      </div>
                      <Progress 
                        value={(analysis.overall.totalPoints % 100)} 
                        className="h-3" 
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Points restants</span>
                        <span className="font-bold text-slate-800">
                          {analysis.predictions.nextLevel.pointsNeeded}
                        </span>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 text-center">
                          ⏱️ Environ <strong>{analysis.predictions.nextLevel.daysEstimated} jours</strong> au rythme actuel
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Temps pour maîtrise */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Temps pour Maîtrise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-baseline gap-2 mb-2">
                          <span className="text-5xl font-bold text-primary">
                            {analysis.predictions.timeToMastery.hoursNeeded}
                          </span>
                          <span className="text-xl text-slate-600">heures</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          de révision restantes
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-800 text-center">
                          📚 <strong>{analysis.predictions.timeToMastery.remainingChapters} chapitres</strong> à compléter
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 text-center">
                          🎯 Objectif : <strong>{analysis.predictions.timeToMastery.daysNeeded} jours</strong> (1h/jour)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Zones à risque */}
              {analysis.predictions.riskAreas.length > 0 && (
                <Card className="border-2 border-red-200 bg-red-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-5 h-5" />
                      🚨 Zones d'Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.predictions.riskAreas.map((risk, index) => (
                        <div 
                          key={index}
                          className="p-4 bg-white rounded-lg border-l-4 border-l-red-500 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-red-900">{risk.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              risk.severity === 'high' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {risk.severity === 'high' ? 'Urgent' : 'Attention'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{risk.message}</p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStartAction(risk.type === 'no_practice' ? 'exam' : 
                                                           risk.type === 'unstarted_subjects' ? 'subject' : 
                                                           'course')}
                            className="gap-2"
                          >
                            <ChevronRight className="w-4 h-4" />
                            {risk.action}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Onglet Plan d'étude */}
            <TabsContent value="plan" className="space-y-6">
              {studyPlan && (
                <>
                  <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-blue-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          📋 {studyPlan.title}
                        </CardTitle>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Télécharger PDF
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                        <p className="text-sm text-slate-600 mb-2">
                          ⏱️ <strong>{studyPlan.hoursPerDay}h/jour</strong> recommandées
                        </p>
                        <p className="text-sm text-slate-600">
                          📅 Plan généré le {new Date(studyPlan.generatedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      {/* Planning hebdomadaire */}
                      <div className="space-y-3 mb-6">
                        <h3 className="font-semibold text-lg text-slate-800 mb-3">
                          📅 Planning de la Semaine
                        </h3>
                        {studyPlan.schedule.map((day, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-white rounded-lg shadow-sm border border-slate-200"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                                {index + 1}
                              </div>
                              <h4 className="font-semibold text-slate-800">{day.day}</h4>
                            </div>
                            <div className="space-y-2 ml-13">
                              {day.sessions.map((session, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">
                                      {session.time}
                                    </span>
                                    <span className="text-sm text-slate-600">
                                      {session.subject}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {session.activity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Priorités */}
                      {studyPlan.priorities.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-lg text-slate-800 mb-3">
                            🎯 Priorités d'Apprentissage
                          </h3>
                          <div className="space-y-2">
                            {studyPlan.priorities.map((priority, index) => (
                              <div 
                                key={index}
                                className="p-3 bg-white rounded-lg border-l-4 border-l-orange-500 shadow-sm"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-slate-800">{priority.area}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    priority.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {priority.priority === 'high' ? '🔴 Prioritaire' : '🟡 Important'}
                                  </span>
                                </div>
                                <ul className="space-y-1">
                                  {priority.recommendations.map((rec, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                      <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-500" />
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conseils */}
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800 mb-3">
                          💡 Conseils Personnalisés
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {studyPlan.tips.map((tip, index) => (
                            <div 
                              key={index}
                              className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                            >
                              <p className="text-sm text-slate-700">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions rapides */}
                  <Card>
                    <CardHeader>
                      <CardTitle>⚡ Actions Recommandées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                          onClick={() => handleStartAction('course')}
                          className="h-auto py-4 flex-col gap-2"
                        >
                          <BookOpen className="w-6 h-6" />
                          <span>Commencer un cours</span>
                        </Button>
                        <Button 
                          onClick={() => handleStartAction('exam')}
                          variant="outline"
                          className="h-auto py-4 flex-col gap-2"
                        >
                          <Target className="w-6 h-6" />
                          <span>Passer un examen</span>
                        </Button>
                        <Button 
                          onClick={() => navigate('/progress')}
                          variant="outline"
                          className="h-auto py-4 flex-col gap-2"
                        >
                          <TrendingUp className="w-6 h-6" />
                          <span>Voir ma progression</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AICoach;
