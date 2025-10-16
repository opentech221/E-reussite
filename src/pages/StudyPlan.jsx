import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Download,
  Sparkles,
  Award,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import AICoachService from '@/lib/aiCoachService';

const StudyPlan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const service = new AICoachService(user.id);
      
      // Charger l'analyse et le plan d'étude
      const analysisResult = await service.analyzePerformance();
      const planResult = await service.generateStudyPlan(null, 2);
      
      setAnalysis(analysisResult);
      setStudyPlan(planResult);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAction = (type) => {
    if (type === 'course') {
      navigate('/courses');
    } else if (type === 'exam') {
      navigate('/exams');
    } else if (type === 'subject') {
      navigate('/subjects');
    }
  };

  const getSuccessColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessGradient = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-blue-500 to-indigo-600';
    if (percentage >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return { label: 'Élevée', color: 'text-green-600', bg: 'bg-green-100' };
    if (confidence >= 0.5) return { label: 'Moyenne', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Faible', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-12 h-12 text-primary" />
              </motion.div>
              <p className="text-slate-600 font-medium">Analyse de vos performances...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!analysis || !studyPlan) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Impossible de charger vos données</p>
              <Button onClick={loadData}>Réessayer</Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="container max-w-7xl mx-auto px-4 py-8 pt-24">
          {/* En-tête */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                📚 Plan d'Étude Personnalisé
              </h1>
              <p className="text-slate-600 text-lg">
                Optimisez votre apprentissage avec des prédictions et un plan adapté à vos besoins
              </p>
            </motion.div>
          </div>

          {/* Onglets */}
          <Tabs defaultValue="predictions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 overflow-x-auto scrollbar-hide gap-1">
              <TabsTrigger value="predictions" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Prédictions</span>
              </TabsTrigger>
              <TabsTrigger value="plan" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Plan d'Étude</span>
              </TabsTrigger>
            </TabsList>

            {/* Onglet Prédictions */}
            <TabsContent value="predictions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prédiction de succès aux examens */}
                <Card className="border-2 border-primary/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      🎯 Succès aux Examens
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div 
                        className={`text-6xl font-bold mb-2 bg-gradient-to-r ${getSuccessGradient(analysis.predictions.examSuccess.percentage)} bg-clip-text text-transparent`}
                      >
                        {analysis.predictions.examSuccess.percentage}%
                      </div>
                      <p className="text-sm text-slate-600">
                        Probabilité de succès
                      </p>
                    </div>

                    {/* Niveau de confiance */}
                    <div className={`p-3 rounded-lg border ${getConfidenceLabel(analysis.predictions.examSuccess.confidence).bg} mb-4`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Confiance :</span>
                        <span className={`text-sm font-bold ${getConfidenceLabel(analysis.predictions.examSuccess.confidence).color}`}>
                          {getConfidenceLabel(analysis.predictions.examSuccess.confidence).label}
                        </span>
                      </div>
                    </div>

                    {/* Performance par difficulté */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">
                        Performance par niveau :
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                          <div className="text-2xl mb-1">🟢</div>
                          <div className="text-xs text-slate-600 mb-1">Facile</div>
                          <div className="text-lg font-bold text-green-700">
                            {analysis.exams.byDifficulty.facile}%
                          </div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                          <div className="text-2xl mb-1">🟡</div>
                          <div className="text-xs text-slate-600 mb-1">Moyen</div>
                          <div className="text-lg font-bold text-yellow-700">
                            {analysis.exams.byDifficulty.moyen}%
                          </div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                          <div className="text-2xl mb-1">🔴</div>
                          <div className="text-xs text-slate-600 mb-1">Difficile</div>
                          <div className="text-lg font-bold text-red-700">
                            {analysis.exams.byDifficulty.difficile}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prochain niveau */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      🏆 Prochain Niveau
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Niveau actuel */}
                      <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-blue-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">Niveau actuel</p>
                        <div className="text-3xl font-bold text-primary mb-1">
                          {analysis.predictions.nextLevel.currentLevel}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                          <span>→</span>
                          <span className="font-semibold text-primary">
                            {analysis.predictions.nextLevel.nextLevel}
                          </span>
                        </div>
                      </div>

                      {/* Progression */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">Progression</span>
                          <span className="text-sm font-bold text-primary">
                            {Math.round((analysis.overall.totalPoints % 100))}%
                          </span>
                        </div>
                        <Progress value={(analysis.overall.totalPoints % 100)} className="h-3" />
                      </div>

                      {/* Points restants */}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 text-center">
                          ⭐ <strong>{analysis.predictions.nextLevel.pointsNeeded} points</strong> restants
                        </p>
                      </div>

                      {/* Estimation de temps */}
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-800 text-center">
                          ⏱️ Environ <strong>{analysis.predictions.nextLevel.daysEstimated} jours</strong> au rythme actuel
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Temps pour maîtrise */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    ⏳ Temps pour Maîtrise Complète
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-blue-50 rounded-lg">
                      <div className="inline-flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold text-primary">
                          {analysis.predictions.timeToMastery.hoursNeeded}
                        </span>
                        <span className="text-xl text-slate-600">heures</span>
                      </div>
                      <p className="text-sm text-slate-600">de révision restantes</p>
                    </div>
                    <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 flex flex-col justify-center">
                      <p className="text-sm text-purple-800 text-center">
                        📚 <strong>{analysis.predictions.timeToMastery.remainingChapters} chapitres</strong> à compléter
                      </p>
                    </div>
                    <div className="p-6 bg-green-50 rounded-lg border border-green-200 flex flex-col justify-center">
                      <p className="text-sm text-green-800 text-center">
                        🎯 Objectif : <strong>{analysis.predictions.timeToMastery.daysNeeded} jours</strong> (1h/jour)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Zones à risque */}
              {analysis.predictions.riskAreas.length > 0 && (
                <Card className="border-2 border-red-200 bg-red-50/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-5 h-5" />
                      🚨 Zones d'Attention Prioritaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.predictions.riskAreas.map((risk, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-white rounded-lg border-l-4 border-l-red-500 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-red-900">{risk.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              risk.severity === 'high' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {risk.severity === 'high' ? '🔴 Urgent' : '🟡 Attention'}
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
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Onglet Plan d'étude */}
            <TabsContent value="plan" className="space-y-6">
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-blue-50 shadow-lg">
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
                    <div className="flex flex-wrap gap-4 justify-between">
                      <p className="text-sm text-slate-600">
                        ⏱️ <strong>{studyPlan.hoursPerDay}h/jour</strong> recommandées
                      </p>
                      <p className="text-sm text-slate-600">
                        📅 Plan généré le {new Date(studyPlan.generatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Planning hebdomadaire */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-lg text-slate-800 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      📅 Planning de la Semaine
                    </h3>
                    {studyPlan.schedule.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                            {index + 1}
                          </div>
                          <h4 className="font-semibold text-slate-800">{day.day}</h4>
                        </div>
                        <div className="space-y-2 ml-13">
                          {day.sessions.map((session, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">
                                  {session.time}
                                </span>
                                <span className="text-sm text-slate-600">
                                  {session.subject}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">
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
                      <h3 className="font-semibold text-lg text-slate-800 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        🎯 Priorités d'Apprentissage
                      </h3>
                      <div className="space-y-2">
                        {studyPlan.priorities.map((priority, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-white rounded-lg border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow"
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
                                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-orange-500" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conseils */}
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      💡 Conseils Personnalisés
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {studyPlan.tips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                        >
                          <p className="text-sm text-slate-700">{tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    ⚡ Actions Recommandées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => handleStartAction('course')}
                      className="h-auto py-4 flex-col gap-2 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg transition-shadow"
                    >
                      <BookOpen className="w-6 h-6" />
                      <span>Commencer un cours</span>
                    </Button>
                    <Button
                      onClick={() => handleStartAction('exam')}
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 hover:shadow-lg transition-shadow"
                    >
                      <Target className="w-6 h-6" />
                      <span>Passer un examen</span>
                    </Button>
                    <Button
                      onClick={() => navigate('/progress')}
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 hover:shadow-lg transition-shadow"
                    >
                      <TrendingUp className="w-6 h-6" />
                      <span>Voir ma progression</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default StudyPlan;
