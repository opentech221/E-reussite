import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Tooltip personnalisé pour afficher les détails d'un quiz
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-slate-900 dark:text-white mb-2">
          {data.dateFormatted}
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-1">
          Score: {data.score}%
        </p>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p>✅ {data.correctAnswers}/{data.totalQuestions} bonnes réponses</p>
          <p>⏱️ {data.timeFormatted}</p>
          {data.badge && (
            <p className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
              <Trophy className="w-3 h-3" />
              {data.badge}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};

/**
 * Composant QuizScoreChart - Graphique d'évolution des scores de quiz
 * @param {Array} sessions - Liste des sessions de quiz interactifs
 * @param {boolean} loading - État de chargement
 */
export const QuizScoreChart = ({ sessions = [], loading = false }) => {
  const [chartType, setChartType] = useState('area'); // 'line' ou 'area'
  
  // Loading state
  if (loading) {
    return (
      <Card className="border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Évolution de tes Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">
              Chargement des données...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!sessions || sessions.length === 0) {
    return (
      <Card className="border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Évolution de tes Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Calendar className="w-12 h-12 mb-2 opacity-50" />
            <p className="font-medium">Pas encore de données</p>
            <p className="text-sm">Complète des quiz pour voir ta progression</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Préparer les données pour le graphique
  const chartData = sessions
    .filter(s => s.status === 'completed' && s.score_percentage != null)
    .slice(0, 10) // Limiter à 10 derniers quiz
    .reverse() // Du plus ancien au plus récent
    .map((session, index) => {
      const date = new Date(session.completed_at || session.created_at);
      const timeInSeconds = session.time_elapsed || 0;
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;
      
      return {
        index: index + 1,
        score: Math.round(session.score_percentage),
        correctAnswers: session.correct_answers || 0,
        totalQuestions: session.total_questions || 5,
        badge: session.badge_unlocked || null,
        dateFormatted: format(date, 'dd MMM yyyy', { locale: fr }),
        timeFormatted: `${minutes}min ${seconds}s`,
        sessionId: session.id
      };
    });
  
  // Calculer les statistiques
  const scores = chartData.map(d => d.score);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const worstScore = Math.min(...scores);
  const trend = scores.length > 1 
    ? (scores[scores.length - 1] - scores[0]) 
    : 0;
  
  return (
    <Card className="border-blue-200 dark:border-blue-700">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Évolution de tes Scores
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Ligne
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              Zone
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Moyenne</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{averageScore}%</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Meilleur</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{bestScore}%</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Plus faible</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{worstScore}%</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Tendance</p>
            <p className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </p>
          </div>
        </div>
        
        {/* Graphique */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="index" 
                  stroke="#64748b"
                  label={{ value: 'Quiz #', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#64748b"
                  domain={[0, 100]}
                  label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
                {/* Ligne de moyenne */}
                <Line 
                  type="monotone" 
                  dataKey={() => averageScore} 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="index" 
                  stroke="#64748b"
                  label={{ value: 'Quiz #', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#64748b"
                  domain={[0, 100]}
                  label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Légende */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Ton score</span>
          </div>
          {chartType === 'line' && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-slate-400 border-dashed"></div>
              <span>Moyenne ({averageScore}%)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizScoreChart;
