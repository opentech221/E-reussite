import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Brain, Target, Calendar,
  Award, AlertCircle, CheckCircle, Activity, Zap,
  BookOpen, Clock, Flame, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('progression');
  
  // États pour les données
  const [progressionData, setProgressionData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [subjectStatsFromDB, setSubjectStatsFromDB] = useState([]); // ✅ Stats pré-calculées
  const [timeAnalysis, setTimeAnalysis] = useState([]);
  const [weeklyHeatmap, setWeeklyHeatmap] = useState([]); // ✅ Heatmap temporelle
  const [weakPoints, setWeakPoints] = useState([]);
  const [strengths, setStrengths] = useState([]);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Récupérer les données de progression temporelle (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // ✅ Progression des quiz avec vue SQL enrichie (quiz_with_subject)
      const { data: quizData } = await supabase
        .from('quiz_with_subject')
        .select('id, score, completed_at, time_taken, subject_name, subject_color, chapter_title')
        .eq('user_id', user.id)
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: true });

      console.log('📊 [Analytics] Quiz data from view:', quizData?.length || 0, 'quiz');

      // ✅ Récupérer statistiques pré-calculées par matière (user_subject_stats)
      const { data: dbSubjectStats } = await supabase
        .from('user_subject_stats')
        .select('matiere_id, subject_name, subject_color, chapters_completed, total_time_seconds, last_activity')
        .eq('user_id', user.id);
      
      console.log('📊 [Analytics] Stats DB par matière:', dbSubjectStats?.length || 0, 'matières');
      setSubjectStatsFromDB(dbSubjectStats || []);

      // ✅ Progression des chapitres complétés avec timestamps (user_progress)
      const { data: lessonData } = await supabase
        .from('user_progress')
        .select(`
          id,
          chapitre_id,
          completed,
          time_spent,
          created_at,
          updated_at,
          chapitres:chapitre_id (
            title,
            matieres:matiere_id (
              name,
              color
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      console.log('📚 [Analytics] Lesson data with timestamps:', lessonData?.length || 0, 'chapitres');

      // Générer les données de progression temporelle
      const progressionByDay = generateProgressionTimeline(quizData, lessonData);
      setProgressionData(progressionByDay);

      // Heatmap de performance par matière et période
      const heatmap = generateHeatmapData(quizData);
      console.log('🔥 [Analytics] Heatmap data:', heatmap?.length || 0, 'cells');
      setHeatmapData(heatmap);

      // Performance par matière
      const subjectStats = calculateSubjectPerformance(quizData);
      console.log('📈 [Analytics] Subject performance:', subjectStats?.length || 0, 'matières');
      setSubjectPerformance(subjectStats);

      // Analyse temporelle (meilleurs moments)
      const timeStats = analyzeStudyTime(quizData, lessonData);
      setTimeAnalysis(timeStats);

      // ✅ Heatmap temporelle (jours x heures avec timestamps)
      const weeklyHeatmapData = generateWeeklyHeatmap(quizData, lessonData);
      console.log('📅 [Analytics] Weekly heatmap:', weeklyHeatmapData?.length || 0, 'cells');
      setWeeklyHeatmap(weeklyHeatmapData);

      // Identifier les points faibles et forces
      const { weak, strong } = identifyWeakStrong(quizData);
      console.log('⚠️ [Analytics] Points faibles:', weak?.length || 0);
      console.log('✅ [Analytics] Points forts:', strong?.length || 0);
      setWeakPoints(weak);
      setStrengths(strong);

      // Prédiction IA pour préparation examen
      const prediction = generateAIPrediction(quizData, lessonData, subjectStats);
      setPredictionData(prediction);

      // Analyse des tendances
      const trends = analyzeTrends(progressionByDay, subjectStats);
      setTrendsData(trends);

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      setLoading(false);
    }
  };

  // ✅ Générer la timeline de progression (30 jours avec timestamps réels)
  const generateProgressionTimeline = (quizData, lessonData) => {
    const timeline = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Quiz avec completed_at
      const dayQuizzes = quizData?.filter(q => 
        q.completed_at.startsWith(dateStr)
      ) || [];
      
      // ✅ Chapitres avec created_at (timestamp précis)
      const dayLessons = lessonData?.filter(l => 
        l.created_at?.startsWith(dateStr)
      ) || [];
      
      const avgScore = dayQuizzes.length > 0
        ? dayQuizzes.reduce((sum, q) => sum + q.score, 0) / dayQuizzes.length
        : 0;
      
      timeline.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        score: Math.round(avgScore),
        quizzes: dayQuizzes.length,
        lessons: dayLessons.length,
        total: dayQuizzes.length + dayLessons.length
      });
    }
    
    return timeline;
  };

  // Générer les données de heatmap
  // ✅ Générer heatmap de performance par matière et semaine (utilise quiz_with_subject)
  const generateHeatmapData = (quizData) => {
    if (!quizData || quizData.length === 0) return [];

    // Créer une map: matière -> [semaine1, semaine2, ...]
    const heatmap = {};
    const weekLabels = [];
    
    // Générer les 4 dernières semaines
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekLabel = `S${Math.floor(date.getDate() / 7) + 1}`;
      weekLabels.push(weekLabel);
    }

    // Initialiser la structure
    const subjects = [...new Set(quizData.map(q => q.subject_name))];
    subjects.forEach(subject => {
      heatmap[subject] = weekLabels.map(week => ({
        week,
        subject,
        avgScore: 0,
        count: 0,
        scores: []
      }));
    });

    // Remplir avec les données réelles
    quizData.forEach(quiz => {
      const subject = quiz.subject_name || 'Autre';
      const quizDate = new Date(quiz.completed_at);
      const daysAgo = Math.floor((new Date() - quizDate) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.min(3, Math.floor(daysAgo / 7));
      
      if (heatmap[subject] && heatmap[subject][weekIndex]) {
        heatmap[subject][weekIndex].scores.push(quiz.score);
        heatmap[subject][weekIndex].count++;
      }
    });

    // Calculer les moyennes
    const result = [];
    Object.keys(heatmap).forEach(subject => {
      heatmap[subject].forEach(cell => {
        if (cell.scores.length > 0) {
          cell.avgScore = Math.round(
            cell.scores.reduce((sum, s) => sum + s, 0) / cell.scores.length
          );
          result.push({
            subject: cell.subject,
            week: cell.week,
            score: cell.avgScore,
            count: cell.count
          });
        }
      });
    });

    return result;
  };

  // ✅ Calculer performance par matière (utilise quiz_with_subject)
  const calculateSubjectPerformance = (quizData) => {
    if (!quizData || quizData.length === 0) return [];

    // Agréger les données par matière
    const subjectMap = {};
    
    quizData.forEach(quiz => {
      const subject = quiz.subject_name || 'Autre';
      
      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          subject,
          color: quiz.subject_color || '#6B7280',
          scores: [],
          totalQuizzes: 0,
          totalTime: 0,
          chapters: new Set()
        };
      }
      
      subjectMap[subject].scores.push(quiz.score);
      subjectMap[subject].totalQuizzes++;
      subjectMap[subject].totalTime += quiz.time_taken || 0;
      if (quiz.chapter_title) {
        subjectMap[subject].chapters.add(quiz.chapter_title);
      }
    });

    // Convertir en tableau avec statistiques calculées
    return Object.values(subjectMap).map(item => {
      const avgScore = Math.round(
        item.scores.reduce((sum, s) => sum + s, 0) / item.scores.length
      );
      
      const trend = calculateTrend(item.scores);
      
      return {
        subject: item.subject,
        color: item.color,
        avgScore,
        totalQuizzes: item.totalQuizzes,
        totalTime: Math.round(item.totalTime / 60), // En minutes
        chaptersCount: item.chapters.size,
        trend, // +/- amélioration
        scores: item.scores // Pour graphiques détaillés
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
  };

  // ✅ Analyser les meilleurs moments d'étude (utilise timestamps)
  const analyzeStudyTime = (quizData, lessonData) => {
    const hours = Array(24).fill(0).map((_, i) => ({
      hour: `${i}h`,
      count: 0,
      avgScore: 0,
      scores: [],
      totalTime: 0 // En minutes
    }));
    
    // Analyser les quiz (avec completed_at)
    quizData?.forEach(quiz => {
      const hour = new Date(quiz.completed_at).getHours();
      hours[hour].count++;
      hours[hour].scores.push(quiz.score);
      hours[hour].totalTime += quiz.time_taken || 0;
    });
    
    // ✅ Analyser les chapitres (avec created_at timestamp)
    lessonData?.forEach(lesson => {
      const hour = new Date(lesson.created_at).getHours();
      hours[hour].count++;
      hours[hour].totalTime += lesson.time_spent || 0;
    });
    
    // Calculer moyenne par heure
    hours.forEach(h => {
      if (h.scores.length > 0) {
        h.avgScore = Math.round(
          h.scores.reduce((sum, s) => sum + s, 0) / h.scores.length
        );
      }
      // Convertir en minutes
      h.totalTime = Math.round(h.totalTime / 60);
    });
    
    // Retourner seulement les heures avec activité
    return hours.filter(h => h.count > 0);
  };

  // ✅ Générer heatmap temporelle (jours x heures) avec timestamps
  const generateWeeklyHeatmap = (quizData, lessonData) => {
    const heatmap = [];
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Initialiser la grille
    days.forEach(day => {
      hours.forEach(hour => {
        heatmap.push({
          day,
          hour,
          count: 0,
          avgScore: 0,
          scores: [],
          totalTime: 0
        });
      });
    });

    // Remplir avec les données de quiz
    quizData?.forEach(quiz => {
      const date = new Date(quiz.completed_at);
      const day = days[date.getDay()];
      const hour = date.getHours();
      
      const cell = heatmap.find(h => h.day === day && h.hour === hour);
      if (cell) {
        cell.count++;
        cell.scores.push(quiz.score);
        cell.totalTime += quiz.time_taken || 0;
      }
    });

    // Remplir avec les données de chapitres (created_at)
    lessonData?.forEach(lesson => {
      const date = new Date(lesson.created_at);
      const day = days[date.getDay()];
      const hour = date.getHours();
      
      const cell = heatmap.find(h => h.day === day && h.hour === hour);
      if (cell) {
        cell.count++;
        cell.totalTime += lesson.time_spent || 0;
      }
    });

    // Calculer les moyennes
    heatmap.forEach(cell => {
      if (cell.scores.length > 0) {
        cell.avgScore = Math.round(
          cell.scores.reduce((sum, s) => sum + s, 0) / cell.scores.length
        );
      }
      cell.totalTime = Math.round(cell.totalTime / 60); // En minutes
    });

    return heatmap.filter(h => h.count > 0); // Seulement les cellules avec activité
  };

  // ✅ Identifier points faibles et forces (utilise quiz_with_subject)
  const identifyWeakStrong = (quizData) => {
    if (!quizData || quizData.length === 0) {
      return { weak: [], strong: [] };
    }

    // Agréger par matière
    const subjectMap = {};
    
    quizData.forEach(quiz => {
      const subject = quiz.subject_name || 'Autre';
      
      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          subject,
          color: quiz.subject_color || '#6B7280',
          scores: [],
          chapters: new Set()
        };
      }
      
      subjectMap[subject].scores.push(quiz.score);
      if (quiz.chapter_title) {
        subjectMap[subject].chapters.add(quiz.chapter_title);
      }
    });

    // Calculer les moyennes et identifier faibles/forts
    const subjects = Object.values(subjectMap).map(item => ({
      subject: item.subject,
      color: item.color,
      avgScore: Math.round(
        item.scores.reduce((sum, s) => sum + s, 0) / item.scores.length
      ),
      quizCount: item.scores.length,
      chaptersCount: item.chapters.size
    }));

    // Points faibles: score < 50% ou peu de quiz
    const weak = subjects
      .filter(s => s.avgScore < 50 || s.quizCount < 3)
      .map(s => ({
        ...s,
        reason: s.avgScore < 50 
          ? `Moyenne faible (${s.avgScore}%)`
          : 'Peu de pratique'
      }))
      .slice(0, 5);

    // Points forts: score >= 75%
    const strong = subjects
      .filter(s => s.avgScore >= 75 && s.quizCount >= 3)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    return { weak, strong };
  };

  // Calculer la tendance (positif = amélioration)
  const calculateTrend = (scores) => {
    if (scores.length < 2) return 0;
    
    const half = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, half);
    const secondHalf = scores.slice(half);
    
    const avgFirst = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;
    
    return Math.round(avgSecond - avgFirst);
  };

  // Générer prédiction IA
  const generateAIPrediction = (quizData, lessonData, subjectStats) => {
    const totalQuizzes = quizData?.length || 0;
    const totalLessons = lessonData?.length || 0;
    const avgScore = quizData?.length > 0
      ? quizData.reduce((sum, q) => sum + q.score, 0) / quizData.length
      : 0;
    
    // Calculer le score de préparation (0-100)
    let readinessScore = 0;
    
    // Facteur 1: Performance moyenne (40%)
    readinessScore += (avgScore / 100) * 40;
    
    // Facteur 2: Régularité (30%)
    const daysWithActivity = new Set(
      [...(quizData || []), ...(lessonData || [])].map(item => {
        // Quiz use completed_at, lessons use created_at (Phase 3 change)
        const timestamp = item.completed_at || item.created_at;
        return timestamp ? timestamp.split('T')[0] : null;
      }).filter(Boolean)
    ).size;
    readinessScore += (daysWithActivity / 30) * 30;
    
    // Facteur 3: Volume d'activité (30%)
    const totalActivity = totalQuizzes + totalLessons;
    readinessScore += Math.min(totalActivity / 100, 1) * 30;
    
    readinessScore = Math.round(readinessScore);
    
    // Déterminer le niveau de préparation
    let level, color, message, recommendations;
    
    if (readinessScore >= 80) {
      level = 'Excellent';
      color = 'green';
      message = 'Vous êtes très bien préparé(e) pour les examens !';
      recommendations = [
        'Continuez votre rythme actuel',
        'Concentrez-vous sur les révisions',
        'Pratiquez avec des examens blancs'
      ];
    } else if (readinessScore >= 60) {
      level = 'Bon';
      color = 'blue';
      message = 'Vous êtes sur la bonne voie, continuez !';
      recommendations = [
        'Augmentez légèrement votre charge de travail',
        'Renforcez vos points faibles',
        'Maintenez votre régularité'
      ];
    } else if (readinessScore >= 40) {
      level = 'Moyen';
      color = 'yellow';
      message = 'Il faut intensifier votre préparation.';
      recommendations = [
        'Augmentez significativement votre temps d\'étude',
        'Travaillez sur toutes les matières',
        'Faites plus de quiz et exercices'
      ];
    } else {
      level = 'Insuffisant';
      color = 'red';
      message = 'Attention ! Votre préparation nécessite une action urgente.';
      recommendations = [
        'Établissez un planning d\'étude rigoureux',
        'Consacrez plusieurs heures par jour à l\'étude',
        'Demandez de l\'aide si nécessaire'
      ];
    }
    
    return {
      score: readinessScore,
      level,
      color,
      message,
      recommendations,
      stats: {
        avgScore: Math.round(avgScore),
        totalQuizzes,
        totalLessons,
        activeDays: daysWithActivity,
        weakSubjects: subjectStats.slice(0, 3).map(s => s.subject)
      }
    };
  };

  // Analyser les tendances
  const analyzeTrends = (progressionData, subjectStats) => {
    const trends = [];
    
    // Tendance globale de score
    const recentScores = progressionData.slice(-7).map(d => d.score).filter(s => s > 0);
    const olderScores = progressionData.slice(0, 7).map(d => d.score).filter(s => s > 0);
    
    if (recentScores.length > 0 && olderScores.length > 0) {
      const recentAvg = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length;
      const scoreTrend = recentAvg - olderAvg;
      
      trends.push({
        type: 'score',
        title: 'Évolution des scores',
        value: Math.round(scoreTrend),
        status: scoreTrend > 0 ? 'improving' : scoreTrend < 0 ? 'declining' : 'stable',
        icon: scoreTrend > 0 ? TrendingUp : TrendingDown,
        color: scoreTrend > 0 ? 'green' : scoreTrend < 0 ? 'red' : 'gray'
      });
    }
    
    // Tendance d'activité
    const recentActivity = progressionData.slice(-7).reduce((sum, d) => sum + d.total, 0);
    const olderActivity = progressionData.slice(0, 7).reduce((sum, d) => sum + d.total, 0);
    const activityTrend = recentActivity - olderActivity;
    
    trends.push({
      type: 'activity',
      title: 'Niveau d\'activité',
      value: activityTrend,
      status: activityTrend > 0 ? 'improving' : activityTrend < 0 ? 'declining' : 'stable',
      icon: Activity,
      color: activityTrend > 0 ? 'green' : activityTrend < 0 ? 'red' : 'gray'
    });
    
    // Tendances par matière
    subjectStats.forEach(subject => {
      if (subject.trend !== 0) {
        trends.push({
          type: 'subject',
          title: subject.subject,
          value: subject.trend,
          status: subject.trend > 0 ? 'improving' : 'declining',
          icon: BookOpen,
          color: subject.trend > 0 ? 'green' : 'red'
        });
      }
    });
    
    return trends;
  };

  // Couleur pour la heatmap
  const getHeatmapColor = (score) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // yellow
    if (score > 0) return '#ef4444'; // red
    return '#e5e7eb'; // gray
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    trackEvent('analytics_tab_change', { tab });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          Analytics Avancés
        </h1>
        <p className="text-muted-foreground">
          Analyse approfondie de vos performances et prédictions IA
        </p>
      </motion.div>

      {/* Prédiction IA - Card principale */}
      {predictionData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className={`border-2 border-${predictionData.color}-500 bg-gradient-to-br from-${predictionData.color}-50 to-white dark:from-${predictionData.color}-900/20 dark:to-slate-800`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className={`w-6 h-6 text-${predictionData.color}-600`} />
                Prédiction IA - Préparation Examen
              </CardTitle>
              <CardDescription>
                Analyse basée sur vos 30 derniers jours d'activité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Score de préparation */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-6xl font-bold text-${predictionData.color}-600 mb-2`}>
                      {predictionData.score}%
                    </div>
                    <Badge variant="outline" className={`text-lg px-4 py-1 border-${predictionData.color}-500`}>
                      {predictionData.level}
                    </Badge>
                  </div>
                  <Progress value={predictionData.score} className="h-3" />
                  <p className="text-center text-muted-foreground">
                    {predictionData.message}
                  </p>
                </div>

                {/* Recommandations */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Recommandations IA
                  </h3>
                  <ul className="space-y-2">
                    {predictionData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className={`w-5 h-5 text-${predictionData.color}-600 mt-0.5`} />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Stats rapides */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {predictionData.stats.avgScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Score moyen</div>
                    </div>
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {predictionData.stats.activeDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Jours actifs</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs pour les différentes vues */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progression" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progression
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Heatmap
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Tendances
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Progression temporelle */}
        <TabsContent value="progression" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progression sur 30 jours</CardTitle>
              <CardDescription>
                Évolution de vos scores et activités quotidiennes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressionData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorScore)"
                    name="Score moyen (%)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorActivity)"
                    name="Activités"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Analyse temporelle */}
          <Card>
            <CardHeader>
              <CardTitle>Meilleurs moments d'étude</CardTitle>
              <CardDescription>
                Analysez vos performances selon l'heure de la journée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={timeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Activités" />
                  <Bar yAxisId="right" dataKey="avgScore" fill="#22c55e" name="Score moyen (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Heatmap */}
        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Heatmap de Performance</CardTitle>
              <CardDescription>
                Performance par matière sur les 4 dernières semaines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Français', 'Anglais'].map(subject => (
                  <div key={subject} className="space-y-2">
                    <div className="font-medium text-sm">{subject}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {heatmapData
                        .filter(d => d.subject === subject)
                        .map((cell, index) => (
                          <div
                            key={index}
                            className="h-16 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105"
                            style={{ backgroundColor: getHeatmapColor(cell.score) }}
                          >
                            <div className="text-white font-bold text-lg">
                              {cell.score > 0 ? `${cell.score}%` : '-'}
                            </div>
                            <div className="text-white text-xs opacity-80">
                              {cell.week}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Légende */}
              <div className="flex items-center justify-center gap-4 mt-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                  <span>&lt; 40%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span>40-60%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span>60-80%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                  <span>&gt; 80%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Performance par matière */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Points faibles */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Points à améliorer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weakPoints.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.subject}</span>
                      <Badge variant="outline" className="text-red-600">
                        {item.average}%
                      </Badge>
                    </div>
                    <Progress value={item.average} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {item.count} quiz complétés
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Points forts */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Trophy className="w-5 h-5" />
                  Points forts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {strengths.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.subject}</span>
                      <Badge variant="outline" className="text-green-600">
                        {item.average}%
                      </Badge>
                    </div>
                    <Progress value={item.average} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {item.count} quiz complétés
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Radar chart performance */}
          <Card>
            <CardHeader>
              <CardTitle>Vue d'ensemble par matière</CardTitle>
              <CardDescription>
                Comparaison de vos performances moyennes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={subjectPerformance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Performance" 
                    dataKey="average" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Tendances */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendsData.map((trend, index) => {
              const Icon = trend.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-2 border-${trend.color}-200`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className={`w-8 h-8 text-${trend.color}-600`} />
                        <Badge 
                          variant={trend.status === 'improving' ? 'default' : 'outline'}
                          className={`${
                            trend.status === 'improving' 
                              ? 'bg-green-500' 
                              : trend.status === 'declining' 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          {trend.status === 'improving' ? 'En progression' : 
                           trend.status === 'declining' ? 'En baisse' : 'Stable'}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{trend.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold text-${trend.color}-600`}>
                          {trend.value > 0 ? '+' : ''}{trend.value}
                          {trend.type === 'score' ? '%' : ''}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {trend.type === 'activity' ? 'activités' : 'points'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Graphique de progression par matière */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution par matière</CardTitle>
              <CardDescription>
                Comparaison des performances moyennes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="subject" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" name="Score moyen (%)" radius={[0, 8, 8, 0]}>
                    {subjectPerformance.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.average >= 80 ? '#22c55e' :
                          entry.average >= 60 ? '#3b82f6' :
                          entry.average >= 40 ? '#f59e0b' : '#ef4444'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
