import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Target, BookOpen, Brain, Clock, 
  Star, Award, Calendar, AlertCircle, CheckCircle, Zap,
  BarChart3, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const StatCard = ({ title, value, change, icon: Icon, trend = 'neutral', subtitle }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Icon className="w-8 h-8 text-blue-500" />
            {change && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{change}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ChartFallback = ({ height = 300 }) => (
  <div className="w-full" style={{ height }}>
    <div className="w-full h-full animate-pulse bg-slate-100 rounded" />
  </div>
);

const SubjectRadarChart = ({ data, recharts }) => {
  if (!recharts) return <ChartFallback height={400} />;
  const { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } = recharts;
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" className="text-sm" />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          className="text-xs text-slate-500"
        />
        <Radar
          name="Performance"
          dataKey="score"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="Moyenne"
          dataKey="average"
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={1}
          strokeDasharray="5 5"
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};

const WeeklyActivityChart = ({ data, recharts }) => {
  if (!recharts) return <ChartFallback />;
  const { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } = recharts;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="lessons" fill="#3B82F6" name="Leçons" />
        <Bar dataKey="quizzes" fill="#10B981" name="Quiz" />
        <Bar dataKey="exercises" fill="#F59E0B" name="Exercices" />
      </BarChart>
    </ResponsiveContainer>
  );
};

const PerformanceTrendChart = ({ data, recharts }) => {
  if (!recharts) return <ChartFallback />;
  const { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } = recharts;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#3B82F6" 
          strokeWidth={3}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="average" 
          stroke="#E5E7EB" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const LearningHeatmap = ({ data }) => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensity = (day, hour) => {
    const activity = data.find(d => d.day === day && d.hour === hour);
    return activity ? activity.intensity : 0;
  };

  const getIntensityColor = (intensity) => {
    if (intensity === 0) return 'bg-slate-100';
    if (intensity < 0.3) return 'bg-blue-200';
    if (intensity < 0.6) return 'bg-blue-400';
    if (intensity < 0.8) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-25 gap-1">
        <div></div>
        {hours.map(hour => (
          <div key={hour} className="text-xs text-center text-slate-500">
            {hour % 6 === 0 ? hour : ''}
          </div>
        ))}
        {days.map(day => (
          <React.Fragment key={day}>
            <div className="text-xs text-slate-500 flex items-center">{day}</div>
            {hours.map(hour => (
              <div
                key={`${day}-${hour}`}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(getIntensity(day, hour))}`}
                title={`${day} ${hour}h: ${(getIntensity(day, hour) * 100).toFixed(0)}% d'activité`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
        <span>Moins</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-800 rounded-sm"></div>
        </div>
        <span>Plus</span>
      </div>
    </div>
  );
};

const StrengthsWeaknesses = ({ strengths, weaknesses }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Points Forts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {strengths.map((strength, index) => (
              <div key={index} className="flex items-center gap-3">
                <Star className="w-4 h-4 text-yellow-500" />
                <div className="flex-1">
                  <div className="font-medium">{strength.subject}</div>
                  <div className="text-sm text-slate-600">{strength.description}</div>
                  <Progress value={strength.score} className="mt-1 h-2" />
                </div>
                <Badge variant="outline" className="text-green-700 border-green-200">
                  {strength.score}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <AlertCircle className="w-5 h-5" />
            À Améliorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-center gap-3">
                <Target className="w-4 h-4 text-orange-500" />
                <div className="flex-1">
                  <div className="font-medium">{weakness.subject}</div>
                  <div className="text-sm text-slate-600">{weakness.description}</div>
                  <Progress value={weakness.score} className="mt-1 h-2" />
                </div>
                <Badge variant="outline" className="text-orange-700 border-orange-200">
                  {weakness.score}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PerformanceAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recharts, setRecharts] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Charger Recharts de manière paresseuse
    let mounted = true;
    import('recharts').then((mod) => {
      if (mounted) setRecharts(mod);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulation de données d'analyse
      const mockAnalytics = {
        overview: {
          totalPoints: 2850,
          averageScore: 78.5,
          streak: 25,
          lessonsCompleted: 156,
          quizzesCompleted: 87,
          studyTime: 145,
          rank: 12,
          improvement: '+15%'
        },
        subjectPerformance: [
          { subject: 'Mathématiques', score: 85, average: 75 },
          { subject: 'Physique', score: 78, average: 72 },
          { subject: 'Chimie', score: 82, average: 70 },
          { subject: 'Français', score: 75, average: 78 },
          { subject: 'Anglais', score: 88, average: 80 },
          { subject: 'Histoire', score: 72, average: 76 }
        ],
        weeklyActivity: [
          { day: 'Lun', lessons: 8, quizzes: 5, exercises: 12 },
          { day: 'Mar', lessons: 6, quizzes: 8, exercises: 10 },
          { day: 'Mer', lessons: 10, quizzes: 6, exercises: 15 },
          { day: 'Jeu', lessons: 7, quizzes: 9, exercises: 8 },
          { day: 'Ven', lessons: 9, quizzes: 7, exercises: 11 },
          { day: 'Sam', lessons: 12, quizzes: 4, exercises: 18 },
          { day: 'Dim', lessons: 5, quizzes: 3, exercises: 6 }
        ],
        performanceTrend: [
          { date: '01/03', score: 65, average: 70 },
          { date: '08/03', score: 70, average: 71 },
          { date: '15/03', score: 75, average: 72 },
          { date: '22/03', score: 78, average: 73 },
          { date: '29/03', score: 82, average: 74 },
          { date: '05/04', score: 79, average: 75 },
          { date: '12/04', score: 85, average: 75 }
        ],
        heatmapData: [
          { day: 'Lun', hour: 8, intensity: 0.8 },
          { day: 'Lun', hour: 14, intensity: 0.6 },
          { day: 'Lun', hour: 19, intensity: 0.9 },
          { day: 'Mar', hour: 9, intensity: 0.7 },
          { day: 'Mar', hour: 16, intensity: 0.5 },
          { day: 'Mar', hour: 20, intensity: 0.8 },
          // ... plus de données
        ],
        strengths: [
          { subject: 'Mathématiques - Algèbre', score: 92, description: 'Excellente maîtrise des équations' },
          { subject: 'Anglais - Grammaire', score: 88, description: 'Très bon niveau grammatical' },
          { subject: 'Physique - Mécanique', score: 85, description: 'Bonne compréhension des concepts' }
        ],
        weaknesses: [
          { subject: 'Français - Expression écrite', score: 65, description: 'Améliorer la structure des textes' },
          { subject: 'Histoire - Dates', score: 58, description: 'Réviser les chronologies importantes' },
          { subject: 'Chimie - Réactions', score: 62, description: 'Approfondir les mécanismes' }
        ]
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600">Pas encore de données</h3>
        <p className="text-slate-500">Continuez à apprendre pour voir vos analyses !</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Points Totaux"
          value={analytics.overview.totalPoints.toLocaleString()}
          change={analytics.overview.improvement}
          trend="up"
          icon={Star}
        />
        <StatCard
          title="Score Moyen"
          value={`${analytics.overview.averageScore}%`}
          change="+2.5%"
          trend="up"
          icon={Target}
        />
        <StatCard
          title="Série Actuelle"
          value={`${analytics.overview.streak} jours`}
          change="+5 jours"
          trend="up"
          icon={Zap}
        />
        <StatCard
          title="Temps d'Étude"
          value={`${analytics.overview.studyTime}h`}
          subtitle="ce mois"
          icon={Clock}
        />
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                Performance par Matière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectRadarChart data={analytics.subjectPerformance} recharts={recharts} />
            </CardContent>
          </Card>

          <StrengthsWeaknesses 
            strengths={analytics.strengths}
            weaknesses={analytics.weaknesses}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Activité Hebdomadaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyActivityChart data={analytics.weeklyActivity} recharts={recharts} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Carte de Chaleur d'Apprentissage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LearningHeatmap data={analytics.heatmapData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Évolution des Performances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceTrendChart data={analytics.performanceTrend} recharts={recharts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Recommandations IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 mb-2">🎯 Focus Recommandé</h4>
                    <p className="text-blue-800">
                      Concentrez-vous sur l'expression écrite en français. Nous avons détecté que c'est votre principal point d'amélioration.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-900 mb-2">🌟 Point Fort à Exploiter</h4>
                    <p className="text-green-800">
                      Vos excellents résultats en mathématiques montrent un potentiel élevé. Considérez des défis plus avancés.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-semibold text-orange-900 mb-2">⏰ Optimisation du Temps</h4>
                    <p className="text-orange-800">
                      Vos sessions d'étude sont plus efficaces le matin. Programmez vos révisions difficiles entre 8h et 10h.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceAnalytics;